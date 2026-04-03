import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BudgetLine } from '../models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/budget-lines';

  getBudgetLines(eventId: number): Observable<BudgetLine[]> {
    return this.http.get<{success: boolean, data: BudgetLine[]}>(`${this.apiUrl}?eventId=${eventId}`).pipe(
      map(res => res.data),
      catchError(err => {
        console.error('Failed to fetch budget lines', err);
        return throwError(() => err);
      })
    );
  }

  updateBudgetLine(id: number, data: Partial<BudgetLine>): Observable<BudgetLine> {
    return this.http.put<{success: boolean, data: BudgetLine}>(`${this.apiUrl}/${id}`, data).pipe(
      map(res => res.data),
      catchError(err => throwError(() => err))
    );
  }

  createBudgetLine(line: Omit<BudgetLine, 'id' | 'created_at' | 'updated_at'>): Observable<BudgetLine> {
    return this.http.post<{success: boolean, data: BudgetLine}>(this.apiUrl, line).pipe(
      map(res => res.data),
      catchError(err => throwError(() => err))
    );
  }

  deleteBudgetLine(id: number): Observable<boolean> {
    return this.http.delete<{success: boolean}>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.success),
      catchError(err => throwError(() => err))
    );
  }

  exportBudgetExcel(eventId: number, lines: BudgetLine[], fsdieOnly: boolean): Observable<Blob> {
    return this.http.post('http://localhost:3000/api/export/budget',
      { lines, fsdieOnly },
      { responseType: 'blob' }
    );
  }
}
