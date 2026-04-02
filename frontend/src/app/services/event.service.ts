import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);

  // Mock data fallback
  private mockEvents: Event[] = [
    {
      id: 1,
      name: 'Gala KUBIK 2024',
      description: 'Gala annuel de fin d\'année',
      start_date: '2024-12-15T19:00:00Z',
      end_date: '2024-12-16T04:00:00Z',
      capacity: 500,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Week-end d\'intégration (WEI)',
      description: 'Événement d\'accueil des nouveaux',
      start_date: '2024-09-20T08:00:00Z',
      end_date: '2024-09-22T18:00:00Z',
      capacity: 150,
      created_at: new Date().toISOString()
    }
  ];

  getEvents(): Observable<Event[]> {
    // Note: Dé-commentez le code HTTP lorsque le backend sera fait
    // return this.http.get<Event[]>('/events').pipe(catchError(...));
    return of(this.mockEvents);
  }

  getEvent(id: number): Observable<Event> {
    const event = this.mockEvents.find(e => e.id === id);
    if (event) {
      return of(event);
    }
    return throwError(() => new Error('Event not found'));
  }

  createEvent(event: Omit<Event, 'id' | 'created_at'>): Observable<Event> {
    const newEvent: Event = {
      ...event,
      id: this.mockEvents.length + 1,
      created_at: new Date().toISOString(),
      registrations: []
    };
    this.mockEvents.push(newEvent);
    return of(newEvent);
  }

  addParticipant(eventId: number, member: any): Observable<boolean> {
    const event = this.mockEvents.find(e => e.id === eventId);
    if (event) {
      if (!event.registrations) event.registrations = [];
      const exists = event.registrations.find(r => r.member_id === member.id);
      if (exists) return throwError(() => new Error('Déjà inscrit'));
      
      event.registrations.push({
        id: Math.floor(Math.random() * 10000),
        event_id: eventId,
        member_id: member.id,
        has_deposit: false,
        registered_at: new Date().toISOString(),
        member: member
      });
      return of(true);
    }
    return throwError(() => new Error('Event not found'));
  }

  removeParticipant(eventId: number, memberId: number): Observable<boolean> {
    const event = this.mockEvents.find(e => e.id === eventId);
    if (event && event.registrations) {
      event.registrations = event.registrations.filter(r => r.member_id !== memberId);
      return of(true);
    }
    return throwError(() => new Error('Event or Registration not found'));
  }
}
