import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Event } from '../models/event.model';

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

  addParticipant(eventId: number, member: any): Observable<boolean> {
    return this.http.post<{success: boolean}>(`${this.apiUrl}/${eventId}/participants`, { memberId: member.id }).pipe(
      map(res => res.success),
      catchError(err => throwError(() => new Error(err.error?.message || "Erreur lors de l'inscription")))
    );
  }

  removeParticipant(eventId: number, memberId: number): Observable<boolean> {
    return this.http.delete<{success: boolean}>(`${this.apiUrl}/${eventId}/participants/${memberId}`).pipe(
      map(res => res.success),
      catchError(err => throwError(() => new Error('Erreur lors de la désinscription')))
    );
  }
}
