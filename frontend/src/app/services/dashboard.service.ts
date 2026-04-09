import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface EventSummary {
  id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  capacity: number | null;
}

export interface TShirtSizes {
  [size: string]: number;
}

export interface NextEventKpis {
  registrationsCount: number;
  capacity: number | null;
  fillRate: number | null;
  missingDepositsCount: number;
  tShirtSizes: TShirtSizes;
  fsdieTotal: number;
  /** Nombre de lignes FSDIE sans justificatif joint. Null si l'event n'est pas terminé. */
  fsdieUnjustifiedCount: number | null;
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
   * Récupère la liste de tous les événements pour le sélecteur.
   */
  getAllEvents(): Observable<EventSummary[]> {
    return this.http
      .get<{ success: boolean; data: EventSummary[] }>(`${this.baseUrl}/events`)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  /**
   * Récupère les statistiques d'un événement par son ID.
   */
  getEventStats(eventId: number): Observable<NextEventStats> {
    return this.http
      .get<{ success: boolean; data: NextEventStats }>(`${this.baseUrl}/stats/${eventId}`)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  /**
   * Récupère les statistiques du prochain événement à venir.
   * @deprecated Préférer getEventStats(eventId).
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
