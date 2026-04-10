import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Event, EventParticipant } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/events';

  getEvents(): Observable<Event[]> {
    return this.http.get<{success: boolean, data: Event[]}>(this.apiUrl).pipe(
      map(res => res.data),
      catchError(err => throwError(() => err))
    );
  }

  getEvent(id: number): Observable<Event> {
    return this.http.get<{success: boolean, data: Event}>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data),
      catchError(err => throwError(() => err))
    );
  }

  createEvent(event: Omit<Event, 'id' | 'created_at'>): Observable<Event> {
    return this.http.post<{success: boolean, data: Event}>(this.apiUrl, event).pipe(
      map(res => res.data),
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
}
