import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface DashboardStats {
  totalMembers: number;
  upcomingEventsCount: number;
  financialBalance: number;
  upcomingEvents: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/dashboard/stats';

  getStats(): Observable<DashboardStats> {
    return this.http.get<{success: boolean, data: DashboardStats}>(this.apiUrl).pipe(
      map(res => res.data),
      catchError(err => throwError(() => err))
    );
  }
}
