import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

const DB_NAME = 'projetagile-db';
const DB_VERSION = 1;

export interface IdbStore {
  events: 'events';
  budgetLines: 'budget_lines';
  members: 'members';
  pendingActions: 'pending_actions';
}

export type StoreName = keyof IdbStore;

export interface PendingAction {
  id?: number;
  store: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  payload: unknown;
  timestamp: number;
}

/**
 * Service IndexedDB — fournit une couche de persistance locale pour le mode hors ligne.
 * Stocke les événements, lignes budgétaires, membres et les actions en attente de synchro.
 */
@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {
  private platformId = inject(PLATFORM_ID);
  private db: IDBDatabase | null = null;
  private dbReady$ = new BehaviorSubject<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initDb();
    }
  }

  // ─── Initialisation ────────────────────────────────────────────────────────

  private initDb(): void {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('[IDB] Upgrading database schema...');

      // Store : événements
      if (!db.objectStoreNames.contains('events')) {
        const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
        eventsStore.createIndex('date', 'date', { unique: false });
        eventsStore.createIndex('status', 'status', { unique: false });
      }

      // Store : lignes budgétaires
      if (!db.objectStoreNames.contains('budget_lines')) {
        const budgetStore = db.createObjectStore('budget_lines', { keyPath: 'id' });
        budgetStore.createIndex('event_id', 'event_id', { unique: false });
        budgetStore.createIndex('status', 'status', { unique: false });
      }

      // Store : membres
      if (!db.objectStoreNames.contains('members')) {
        db.createObjectStore('members', { keyPath: 'id' });
      }

      // Store : actions en attente (mutations faites hors ligne)
      if (!db.objectStoreNames.contains('pending_actions')) {
        const pendingStore = db.createObjectStore('pending_actions', {
          keyPath: 'id',
          autoIncrement: true
        });
        pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      console.log('[IDB] Database opened successfully');
      this.dbReady$.next(true);
    };

    request.onerror = (event) => {
      console.error('[IDB] Failed to open database:', (event.target as IDBOpenDBRequest).error);
    };
  }

  // ─── Attendre que la DB soit prête ────────────────────────────────────────

  private waitForDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }
      const sub = this.dbReady$.subscribe((ready) => {
        if (ready && this.db) {
          sub.unsubscribe();
          resolve(this.db);
        }
      });
      setTimeout(() => {
        sub.unsubscribe();
        reject(new Error('[IDB] Database initialization timeout'));
      }, 5000);
    });
  }

  // ─── CRUD générique ────────────────────────────────────────────────────────

  /** Lire tous les enregistrements d'un store */
  getAll<T>(storeName: string): Observable<T[]> {
    if (!isPlatformBrowser(this.platformId)) return of([]);
    return from(
      this.waitForDb().then((db) => {
        return new Promise<T[]>((resolve, reject) => {
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result as T[]);
          req.onerror = () => reject(req.error);
        });
      })
    ).pipe(catchError(() => of([])));
  }

  /** Lire un enregistrement par sa clé */
  getById<T>(storeName: string, id: number): Observable<T | undefined> {
    if (!isPlatformBrowser(this.platformId)) return of(undefined);
    return from(
      this.waitForDb().then((db) => {
        return new Promise<T | undefined>((resolve, reject) => {
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const req = store.get(id);
          req.onsuccess = () => resolve(req.result as T);
          req.onerror = () => reject(req.error);
        });
      })
    ).pipe(catchError(() => of(undefined)));
  }

  /** Lire par index (ex: getByIndex('budget_lines', 'event_id', 5)) */
  getByIndex<T>(storeName: string, indexName: string, value: IDBValidKey): Observable<T[]> {
    if (!isPlatformBrowser(this.platformId)) return of([]);
    return from(
      this.waitForDb().then((db) => {
        return new Promise<T[]>((resolve, reject) => {
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const index = store.index(indexName);
          const req = index.getAll(value);
          req.onsuccess = () => resolve(req.result as T[]);
          req.onerror = () => reject(req.error);
        });
      })
    ).pipe(catchError(() => of([])));
  }

  /** Insérer ou mettre à jour un enregistrement */
  put<T>(storeName: string, data: T): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) return of(data);
    return from(
      this.waitForDb().then((db) => {
        return new Promise<T>((resolve, reject) => {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const req = store.put(data);
          req.onsuccess = () => resolve(data);
          req.onerror = () => reject(req.error);
        });
      })
    );
  }

  /** Insérer ou mettre à jour plusieurs enregistrements en une transaction */
  putMany<T>(storeName: string, items: T[]): Observable<T[]> {
    if (!isPlatformBrowser(this.platformId)) return of(items);
    return from(
      this.waitForDb().then((db) => {
        return new Promise<T[]>((resolve, reject) => {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          items.forEach((item) => store.put(item));
          tx.oncomplete = () => resolve(items);
          tx.onerror = () => reject(tx.error);
        });
      })
    );
  }

  /** Supprimer un enregistrement par sa clé */
  delete(storeName: string, id: number): Observable<void> {
    if (!isPlatformBrowser(this.platformId)) return of(undefined);
    return from(
      this.waitForDb().then((db) => {
        return new Promise<void>((resolve, reject) => {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const req = store.delete(id);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      })
    );
  }

  /** Vider entièrement un store */
  clear(storeName: string): Observable<void> {
    if (!isPlatformBrowser(this.platformId)) return of(undefined);
    return from(
      this.waitForDb().then((db) => {
        return new Promise<void>((resolve, reject) => {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const req = store.clear();
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      })
    );
  }

  // ─── Pending Actions (synchro offline) ────────────────────────────────────

  /** Ajouter une action en file d'attente (création/modification faite hors ligne) */
  addPendingAction(action: Omit<PendingAction, 'id'>): Observable<void> {
    return this.put('pending_actions', { ...action, timestamp: Date.now() }).pipe(
      switchMap(() => of(undefined))
    );
  }

  /** Récupérer toutes les actions en attente triées par timestamp */
  getPendingActions(): Observable<PendingAction[]> {
    return this.getAll<PendingAction>('pending_actions');
  }

  /** Supprimer une action après sa synchronisation réussie */
  removePendingAction(id: number): Observable<void> {
    return this.delete('pending_actions', id);
  }

  /** Retourne true si la DB est initialisée côté client */
  get isAvailable(): boolean {
    return isPlatformBrowser(this.platformId) && !!this.db;
  }
}
