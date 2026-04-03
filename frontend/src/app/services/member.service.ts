import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Member } from '../models/member.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/members';

  getMembers(): Observable<Member[]> {
    return this.http.get<{success: boolean, data: Member[]}>(this.apiUrl).pipe(
      map(res => res.data),
      catchError(err => throwError(() => err))
    );
  }

  updateMember(id: number, data: Partial<Member>): Observable<Member> {
    return this.http.put<{success: boolean, data: Member}>(`${this.apiUrl}/${id}`, data).pipe(
      map(res => res.data),
      catchError(err => throwError(() => err))
    );
  }

  createMember(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>): Observable<Member> {
    return this.http.post<{success: boolean, data: Member}>(this.apiUrl, member).pipe(
      map(res => res.data),
      catchError(err => throwError(() => err))
    );
  }
}
