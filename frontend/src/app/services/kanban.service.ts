import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface KanbanMember { id: number; first_name: string; last_name: string; }
export interface KanbanCard {
  id: number; column_id: number; title: string; description?: string;
  position: number; label?: string; due_date?: string; members?: KanbanMember[];
}
export interface KanbanColumn {
  id: number; event_id: number; title: string; position: number; color: string;
  cards: KanbanCard[];
}

@Injectable({ providedIn: 'root' })
export class KanbanService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api/events';

  getKanban(eventId: number): Observable<KanbanColumn[]> {
    return this.http.get<{ success: boolean; data: KanbanColumn[] }>(`${this.base}/${eventId}/kanban`).pipe(
      map(r => r.data), catchError(err => throwError(() => err))
    );
  }

  createColumn(eventId: number, data: { title: string; color?: string }): Observable<KanbanColumn> {
    return this.http.post<{ success: boolean; data: KanbanColumn }>(`${this.base}/${eventId}/kanban/columns`, data).pipe(
      map(r => r.data), catchError(err => throwError(() => err))
    );
  }

  updateColumn(eventId: number, colId: number, data: { title: string; color: string }): Observable<KanbanColumn> {
    return this.http.put<{ success: boolean; data: KanbanColumn }>(`${this.base}/${eventId}/kanban/columns/${colId}`, data).pipe(
      map(r => r.data), catchError(err => throwError(() => err))
    );
  }

  deleteColumn(eventId: number, colId: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${this.base}/${eventId}/kanban/columns/${colId}`).pipe(
      map(r => r.success), catchError(err => throwError(() => err))
    );
  }

  createCard(eventId: number, colId: number, data: Partial<KanbanCard>): Observable<KanbanCard> {
    return this.http.post<{ success: boolean; data: KanbanCard }>(`${this.base}/${eventId}/kanban/columns/${colId}/cards`, data).pipe(
      map(r => r.data), catchError(err => throwError(() => err))
    );
  }

  updateCard(eventId: number, cardId: number, data: Partial<KanbanCard>): Observable<KanbanCard> {
    return this.http.put<{ success: boolean; data: KanbanCard }>(`${this.base}/${eventId}/kanban/cards/${cardId}`, data).pipe(
      map(r => r.data), catchError(err => throwError(() => err))
    );
  }

  moveCard(eventId: number, cardId: number, columnId: number, position: number): Observable<boolean> {
    return this.http.put<{ success: boolean }>(`${this.base}/${eventId}/kanban/cards/${cardId}/move`, { column_id: columnId, position }).pipe(
      map(r => r.success), catchError(err => throwError(() => err))
    );
  }

  deleteCard(eventId: number, cardId: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${this.base}/${eventId}/kanban/cards/${cardId}`).pipe(
      map(r => r.success), catchError(err => throwError(() => err))
    );
  }

  setCardMembers(eventId: number, cardId: number, memberIds: number[]): Observable<boolean> {
    return this.http.put<{ success: boolean }>(`${this.base}/${eventId}/kanban/cards/${cardId}/members`, { member_ids: memberIds }).pipe(
      map(r => r.success), catchError(err => throwError(() => err))
    );
  }
}
