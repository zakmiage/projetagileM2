import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { BudgetLine } from '../models/budget.model';
import { IndexedDbService } from './indexed-db.service';
import { PwaService } from './pwa.service';

const STORE = 'budget_lines';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private http = inject(HttpClient);
  private idb = inject(IndexedDbService);
  private pwa = inject(PwaService);

  private apiUrl = 'http://localhost:3000/api/budget-lines';

  getBudgetLines(eventId: number): Observable<BudgetLine[]> {
    if (!this.pwa.isOnline) {
      console.log('[BudgetService] Offline — serving from IndexedDB');
      return this.idb.getByIndex<BudgetLine>(STORE, 'event_id', eventId);
    }
    return this.http.get<{success: boolean, data: BudgetLine[]}>(`${this.apiUrl}?eventId=${eventId}`).pipe(
      map(res => res.data),
      // Cache les lignes budgétaires par événement
      tap(lines => this.idb.putMany(STORE, lines).subscribe()),
      catchError(err => {
        console.warn('[BudgetService] Network error, falling back to IndexedDB', err);
        return this.idb.getByIndex<BudgetLine>(STORE, 'event_id', eventId);
      })
    );
  }

  updateBudgetLine(id: number, data: Partial<BudgetLine>): Observable<BudgetLine> {
    return this.http.put<{success: boolean, data: BudgetLine}>(`${this.apiUrl}/${id}`, data).pipe(
      map(res => res.data),
      tap(updated => this.idb.put(STORE, updated).subscribe()),
      catchError(err => throwError(() => err))
    );
  }

  createBudgetLine(line: Omit<BudgetLine, 'id' | 'created_at' | 'updated_at'>): Observable<BudgetLine> {
    return this.http.post<{success: boolean, data: BudgetLine}>(this.apiUrl, line).pipe(
      map(res => res.data),
      tap(created => this.idb.put(STORE, created).subscribe()),
      catchError(err => throwError(() => err))
    );
  }

  deleteBudgetLine(id: number): Observable<boolean> {
    return this.http.delete<{success: boolean}>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.success),
      tap(() => this.idb.delete(STORE, id).subscribe()),
      catchError(err => throwError(() => err))
    );
  }

  exportBudgetExcel(eventId: number, lines: BudgetLine[], fsdieOnly: boolean): Observable<Blob> {
    return this.http.post('http://localhost:3000/api/export/budget',
      { lines, fsdieOnly },
      { responseType: 'blob' }
    );
  }

  updateValidationStatus(id: number, status: 'SOUMIS' | 'APPROUVE' | 'REFUSE'): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
