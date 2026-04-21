import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

/**
 * Service de gestion du mode hors ligne et d'enregistrement du Service Worker.
 * À injecter dans le composant racine pour initialiser le SW au démarrage.
 */
@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private platformId = inject(PLATFORM_ID);

  private _isOnline$ = new BehaviorSubject<boolean>(true);
  readonly isOnline$ = this._isOnline$.asObservable();

  private _swRegistered$ = new BehaviorSubject<boolean>(false);
  readonly swRegistered$ = this._swRegistered$.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initNetworkMonitoring();
      this.registerServiceWorker();
    }
  }

  // ─── Surveillance réseau ──────────────────────────────────────────────────

  private initNetworkMonitoring(): void {
    // État initial
    this._isOnline$.next(navigator.onLine);

    // Écoute les événements online / offline du navigateur
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).subscribe((online) => {
      console.log(`[PWA] Network status changed: ${online ? 'ONLINE' : 'OFFLINE'}`);
      this._isOnline$.next(online);

      if (online) {
        this.syncPendingActions();
      }
    });
  }

  // ─── Enregistrement Service Worker ───────────────────────────────────────

  async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA] Service Worker not supported in this browser');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[PWA] Service Worker registered:', registration.scope);
      this._swRegistered$.next(true);

      // Écoute les mises à jour du SW
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New Service Worker available - reload to update');
              // On pourrait émettre un signal ici pour afficher une bannière "Mise à jour disponible"
            }
          });
        }
      });

    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  }

  // ─── Synchronisation des actions hors ligne ───────────────────────────────

  /**
   * Appelé automatiquement quand le réseau revient.
   * Envoie un message au SW pour déclencher la synchro des pending actions.
   */
  private async syncPendingActions(): Promise<void> {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return;

    console.log('[PWA] Back online - triggering pending actions sync...');
    navigator.serviceWorker.controller.postMessage({ type: 'SYNC_PENDING' });
  }

  get isOnline(): boolean {
    return this._isOnline$.value;
  }
}
