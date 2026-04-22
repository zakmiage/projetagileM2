import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { Event, EventParticipant } from '../models/event.model';
import { IndexedDbService } from './indexed-db.service';
import { PwaService } from './pwa.service';

const STORE = 'events';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);
  private idb = inject(IndexedDbService);
  private pwa = inject(PwaService);

  private apiUrl = 'http://localhost:3000/api/events';

  getEvents(): Observable<Event[]> {
    if (!this.pwa.isOnline) {
      console.log('[EventService] Offline — serving from IndexedDB');
      return this.idb.getAll<Event>(STORE);
    }
    return this.http.get<{success: boolean, data: Event[]}>(this.apiUrl).pipe(
      map(res => res.data),
      // Met à jour le cache IDB à chaque fetch réseau réussi
      tap(events => this.idb.putMany(STORE, events).subscribe()),
      catchError(err => {
        console.warn('[EventService] Network error, falling back to IndexedDB', err);
        return this.idb.getAll<Event>(STORE);
      })
    );
  }

  getEvent(id: number): Observable<Event> {
    if (!this.pwa.isOnline) {
      return this.idb.getById<Event>(STORE, id).pipe(
        map(event => {
          if (!event) throw new Error(`Événement ${id} non trouvé dans le cache`);
          return event;
        })
      );
    }
    return this.http.get<{success: boolean, data: Event}>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data),
      tap(event => this.idb.put(STORE, event).subscribe()),
      catchError(err => {
        console.warn('[EventService] Network error, falling back to IndexedDB', err);
        return this.idb.getById<Event>(STORE, id).pipe(
          map(event => {
            if (!event) throw new Error(`Événement ${id} non trouvé dans le cache`);
            return event;
          })
        );
      })
    );
  }

  createEvent(event: Omit<Event, 'id' | 'created_at'>): Observable<Event> {
    return this.http.post<{success: boolean, data: Event}>(this.apiUrl, event).pipe(
      map(res => res.data),
      tap(created => this.idb.put(STORE, created).subscribe()),
      catchError(err => throwError(() => err))
    );
  }

  updateEvent(id: number, event: Omit<Event, 'id' | 'created_at' | 'participants' | 'budget_lines'>): Observable<Event> {
    return this.http.put<{success: boolean, data: Event}>(`${this.apiUrl}/${id}`, event).pipe(
      map(res => res.data),
      tap(updated => this.idb.put(STORE, updated).subscribe()),
      catchError(err => throwError(() => err))
    );
  }

  deleteEvent(id: number): Observable<boolean> {
    return this.http.delete<{success: boolean}>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.success),
      tap(() => this.idb.delete(STORE, id).subscribe()),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Ajouter un inscrit à un événement.
   * Le participant n'a pas besoin d'être un adhérent.
   */
  addParticipant(
    eventId: number,
    data: { first_name: string; last_name: string; email: string; is_image_rights_ok: boolean }
  ): Observable<EventParticipant> {
    return this.http.post<{success: boolean, data: EventParticipant}>(
      `${this.apiUrl}/${eventId}/participants`, data
    ).pipe(
      map(res => res.data),
      catchError(err => throwError(() => new Error(err.error?.message || "Erreur lors de l'inscription")))
    );
  }

  /**
   * Désinscrire un participant par son ID (event_participants.id).
   */
  removeParticipant(eventId: number, participantId: number): Observable<boolean> {
    return this.http.delete<{success: boolean}>(`${this.apiUrl}/${eventId}/participants/${participantId}`).pipe(
      map(res => res.success),
      catchError(err => throwError(() => new Error('Erreur lors de la désinscription')))
    );
  }

  /**
   * Télécharger le calendrier au format ICS.
   */
  downloadIcsFeed(): void {
    window.location.href = `${this.apiUrl}/feed.ics`;
  }
}
