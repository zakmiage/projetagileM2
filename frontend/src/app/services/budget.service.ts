import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { BudgetLine } from '../models/budget.model';
import { IndexedDbService } from './indexed-db.service';
import { PwaService } from './pwa.service';

const STORE = 'budget_lines';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private http = inject(HttpClient);
  private idb  = inject(IndexedDbService);
  private pwa  = inject(PwaService);

  private apiUrl = 'http://localhost:3000/api/budget-lines';

  /**
   * Cache en mémoire : évite un GET inutile quand l'utilisateur
   * revient sur l'onglet Budget sans avoir changé d'event.
   * Invalidé à chaque mutation (update / create / delete / status).
   */
  private cache = new Map<number, BudgetLine[]>();

  // ─── Lecture ─────────────────────────────────────────────────────────────

  getBudgetLines(eventId: number): Observable<BudgetLine[]> {
    // 1. Cache mémoire (navigation entre onglets, 0ms)
    if (this.cache.has(eventId)) {
      return of(this.cache.get(eventId)!);
    }

    // 2. Offline → IndexedDB
    if (!this.pwa.isOnline) {
      return this.idb.getByIndex<BudgetLine>(STORE, 'event_id', eventId);
    }

    // 3. Réseau → API
    return this.http.get<{success: boolean, data: BudgetLine[]}>(`${this.apiUrl}?eventId=${eventId}`).pipe(
      map(res => res.data),
      tap(lines => {
        this.cache.set(eventId, lines);                   // stocker en mémoire
        this.idb.putMany(STORE, lines).subscribe();       // stocker en IndexedDB
      }),
      catchError(err => {
        console.warn('[BudgetService] Network error, fallback IndexedDB', err);
        return this.idb.getByIndex<BudgetLine>(STORE, 'event_id', eventId);
      })
    );
  }

  // ─── Mutations (invalident le cache, retournent la réponse complète) ─────

  /**
   * Retourne { success, data, lines } — le composant applique directement
   * res.lines sans refaire un GET séparé.
   */
  updateBudgetLine(id: number, data: Partial<BudgetLine>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data).pipe(
      tap(res => {
        if (res?.lines) this.updateCache(res.lines);      // cache à jour
        if (res?.data)  this.idb.put(STORE, res.data).subscribe();
      }),
      catchError(err => throwError(() => err))
    );
  }

  createBudgetLine(line: Omit<BudgetLine, 'id' | 'created_at' | 'updated_at'>): Observable<any> {
    return this.http.post<any>(this.apiUrl, line).pipe(
      tap(res => {
        if (res?.lines) this.updateCache(res.lines);
        if (res?.data)  this.idb.put(STORE, res.data).subscribe();
      }),
      catchError(err => throwError(() => err))
    );
  }

  deleteBudgetLine(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(res => {
        if (res?.lines) this.updateCache(res.lines);
        this.idb.delete(STORE, id).subscribe();
      }),
      catchError(err => throwError(() => err))
    );
  }

  updateValidationStatus(id: number, status: 'SOUMIS' | 'APPROUVE' | 'REFUSE'): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      tap(res => { if (res?.lines) this.updateCache(res.lines); }),
      catchError(err => throwError(() => err))
    );
  }

  // ─── Export ──────────────────────────────────────────────────────────────

  exportBudgetExcel(eventId: number, lines: BudgetLine[], fsdieOnly: boolean): Observable<Blob> {
    return this.http.post('http://localhost:3000/api/export/budget',
      { lines, fsdieOnly }, { responseType: 'blob' });
  }

  // ─── Cache helpers ───────────────────────────────────────────────────────

  /** Met à jour le cache mémoire avec les lignes fraîches retournées par le backend. */
  private updateCache(lines: BudgetLine[]): void {
    if (!lines?.length) return;
    const eventId = lines[0]?.event_id;
    if (eventId) this.cache.set(eventId, lines);
  }

  /** Force un re-fetch au prochain appel (utile si besoin de vidage externe). */
  invalidateCache(eventId: number): void {
    this.cache.delete(eventId);
  }
}
