import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Shift {
  id: number;
  event_id: number;
  label: string;
  start_time: string;
  end_time: string;
  capacity: number;
  registered_count?: number;
}

export interface ShiftRegistration {
  id: number;
  shift_id: number;
  member_id: number;
  registered_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class ShiftService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api/events';

  getShifts(eventId: number): Observable<Shift[]> {
    return this.http.get<{ success: boolean; data: Shift[] }>(`${this.base}/${eventId}/shifts`).pipe(
      map(r => r.data),
      catchError(err => throwError(() => err))
    );
  }

  createShift(eventId: number, data: Omit<Shift, 'id' | 'event_id' | 'registered_count'>): Observable<Shift> {
    return this.http.post<{ success: boolean; data: Shift }>(`${this.base}/${eventId}/shifts`, data).pipe(
      map(r => r.data),
      catchError(err => throwError(() => err))
    );
  }

  updateShift(eventId: number, shiftId: number, data: Partial<Shift>): Observable<Shift> {
    return this.http.put<{ success: boolean; data: Shift }>(`${this.base}/${eventId}/shifts/${shiftId}`, data).pipe(
      map(r => r.data),
      catchError(err => throwError(() => err))
    );
  }

  deleteShift(eventId: number, shiftId: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${this.base}/${eventId}/shifts/${shiftId}`).pipe(
      map(r => r.success),
      catchError(err => throwError(() => err))
    );
  }

  register(eventId: number, shiftId: number, memberId: number): Observable<ShiftRegistration> {
    return this.http.post<{ success: boolean; data: ShiftRegistration }>(
      `${this.base}/${eventId}/shifts/${shiftId}/register`,
      { member_id: memberId }
    ).pipe(
      map(r => r.data),
      catchError(err => throwError(() => err))
    );
  }

  unregister(eventId: number, shiftId: number, memberId: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${this.base}/${eventId}/shifts/${shiftId}/register`, {
      body: { member_id: memberId }
    }).pipe(
      map(r => r.success),
      catchError(err => throwError(() => err))
    );
  }

  getRegistrations(eventId: number, shiftId: number): Observable<ShiftRegistration[]> {
    return this.http.get<{ success: boolean; data: ShiftRegistration[] }>(
      `${this.base}/${eventId}/shifts/${shiftId}/registrations`
    ).pipe(
      map(r => r.data),
      catchError(err => throwError(() => err))
    );
  }
}
