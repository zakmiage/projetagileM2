import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Member } from '../models/member.model';
import { IndexedDbService } from './indexed-db.service';
import { PwaService } from './pwa.service';

const STORE = 'members';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private http = inject(HttpClient);
  private idb = inject(IndexedDbService);
  private pwa = inject(PwaService);

  private apiUrl = 'http://localhost:3000/api/members';

  getMembers(): Observable<Member[]> {
    if (!this.pwa.isOnline) {
      console.log('[MemberService] Offline — serving from IndexedDB');
      return this.idb.getAll<Member>(STORE);
    }
    return this.http.get<{success: boolean, data: Member[]}>(this.apiUrl).pipe(
      map(res => res.data),
      tap(members => this.idb.putMany(STORE, members).subscribe()),
      catchError(err => {
        console.warn('[MemberService] Network error, falling back to IndexedDB', err);
        return this.idb.getAll<Member>(STORE);
      })
    );
  }

  updateMember(id: number, data: Partial<Member>): Observable<Member> {
    return this.http.put<{success: boolean, data: Member}>(`${this.apiUrl}/${id}`, data).pipe(
      map(res => res.data),
      tap(updated => this.idb.put(STORE, updated).subscribe()),
      catchError(err => throwError(() => err))
    );
  }

  createMember(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>): Observable<Member> {
    return this.http.post<{success: boolean, data: Member}>(this.apiUrl, member).pipe(
      map(res => res.data),
      tap(created => this.idb.put(STORE, created).subscribe()),
      catchError(err => throwError(() => err))
    );
  }
}
