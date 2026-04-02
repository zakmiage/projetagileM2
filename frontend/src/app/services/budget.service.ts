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
    { id: 1, event_id: 1, type: 'EXPENSE', category: 'Logistique', label: 'Domaine Peyreguilhot', forecast_amount: 2536.00, actual_amount: 2536.00, is_fsdie_eligible: true, created_by: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, event_id: 1, type: 'EXPENSE', category: 'Logistique', label: 'Transport', forecast_amount: 1078.00, actual_amount: 1078.00, is_fsdie_eligible: true, created_by: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, event_id: 1, type: 'EXPENSE', category: 'Logistique', label: 'Protec civil', forecast_amount: 815.00, actual_amount: 815.00, is_fsdie_eligible: true, created_by: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 4, event_id: 1, type: 'EXPENSE', category: 'Logistique', label: 'Essences et péages', forecast_amount: 151.88, actual_amount: 151.88, is_fsdie_eligible: true, created_by: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 5, event_id: 1, type: 'EXPENSE', category: 'Nourriture et boissons', label: 'Nourriture', forecast_amount: 760.85, actual_amount: 760.85, is_fsdie_eligible: true, created_by: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 6, event_id: 1, type: 'EXPENSE', category: 'Nourriture et boissons', label: 'Bière (8 fûts)', forecast_amount: 790.00, actual_amount: 790.00, is_fsdie_eligible: false, created_by: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 7, event_id: 1, type: 'EXPENSE', category: 'Animations', label: 'DJ', forecast_amount: 975.00, actual_amount: 975.00, is_fsdie_eligible: true, created_by: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 8, event_id: 1, type: 'EXPENSE', category: 'Animations', label: 'Gonflables', forecast_amount: 150.00, actual_amount: 150.00, is_fsdie_eligible: true, created_by: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 9, event_id: 1, type: 'REVENUE', category: 'Participants', label: 'Participants', forecast_amount: 5900.00, actual_amount: 5900.00, is_fsdie_eligible: false, created_by: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 10, event_id: 1, type: 'REVENUE', category: 'Financements', label: 'FSDIE', forecast_amount: 1500.00, actual_amount: 1500.00, is_fsdie_eligible: false, created_by: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 11, event_id: 1, type: 'REVENUE', category: 'Financements', label: 'UF MIAGE', forecast_amount: 850.00, actual_amount: 850.00, is_fsdie_eligible: false, created_by: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
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

  exportBudgetExcel(eventId: number, lines: BudgetLine[], fsdieOnly: boolean): Observable<Blob> {
    return this.http.post('http://localhost:3000/api/export/budget', 
      { lines, fsdieOnly }, 
      { responseType: 'blob' }
    );
  }
}
