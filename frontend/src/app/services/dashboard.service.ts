import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface TShirtSizes {
  [size: string]: number;
}

export interface NextEventKpis {
  registrationsCount: number;
  capacity: number | null;
  fillRate: number | null;         // pourcentage (0-100) ou null si capacité illimitée
  missingDepositsCount: number;
  tShirtSizes: TShirtSizes;
  fsdieTotal: number;
}

export interface NextEventStats {
  hasEvent: boolean;
  event?: {
    id: number;
    name: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
    capacity: number | null;
  };
  kpis?: NextEventKpis;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/dashboard';

  /**
   * Récupère les statistiques du prochain événement à venir.
   */
  getNextEventStats(): Observable<NextEventStats> {
    return this.http
      .get<{ success: boolean; data: NextEventStats }>(`${this.baseUrl}/next-event-stats`)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }
}
