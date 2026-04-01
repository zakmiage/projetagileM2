import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BudgetLine } from '../models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private http = inject(HttpClient);

  // Mock data fallback
  private mockBudgetLines: BudgetLine[] = [
    {
      id: 1, event_id: 1, type: 'REVENUE', category: 'Billetterie', label: 'Vente de tickets',
      forecast_amount: 5000, actual_amount: 4800, is_fsdie_eligible: false, created_by: 1,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    },
    {
      id: 2, event_id: 1, type: 'EXPENSE', category: 'Lieu', label: 'Location Salle des Fêtes',
      forecast_amount: 2000, actual_amount: 2000, is_fsdie_eligible: true, created_by: 1,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    }
  ];

  getBudgetLines(eventId: number): Observable<BudgetLine[]> {
    // Note: Dé-commentez le code HTTP lorsque le backend sera fait
    return of(this.mockBudgetLines.filter(b => b.event_id === eventId));
  }

  updateBudgetLine(id: number, data: Partial<BudgetLine>): Observable<BudgetLine> {
    return this.http.put<BudgetLine>(`/budget/${id}`, data).pipe(
      catchError(err => {
        console.warn(`Backend PUT /budget/${id} not ready. Using Mock.`);
        const index = this.mockBudgetLines.findIndex(b => b.id === id);
        if (index > -1) {
          this.mockBudgetLines[index] = { ...this.mockBudgetLines[index], ...data };
          return of(this.mockBudgetLines[index]);
        }
        return throwError(() => err);
      })
    );
  }

  createBudgetLine(line: Omit<BudgetLine, 'id' | 'created_at' | 'updated_at'>): Observable<BudgetLine> {
    const newLine: BudgetLine = {
      ...line,
      id: this.mockBudgetLines.length > 0 ? Math.max(...this.mockBudgetLines.map(b => b.id)) + 1 : 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attachments: []
    };
    this.mockBudgetLines.push(newLine);
    return of(newLine);
  }

  deleteBudgetLine(id: number): Observable<boolean> {
    // Note: Http call should be added when backend is ready
    const index = this.mockBudgetLines.findIndex(b => b.id === id);
    if (index > -1) {
      this.mockBudgetLines.splice(index, 1);
      return of(true);
    }
    return throwError(() => new Error('Line not found'));
  }
}
