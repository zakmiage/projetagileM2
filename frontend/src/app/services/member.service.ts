import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Member } from '../models/member.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private http = inject(HttpClient);

  // Mock data fallback
  private mockMembers: Member[] = [
    {
      id: 1, first_name: 'Jean', last_name: 'Dupont', email: 'jean.dupont@etu.univ.fr',
      t_shirt_size: 'L', allergies: 'Arachides',
      is_certificate_ok: true, is_waiver_ok: false, is_image_rights_ok: true,
      created_at: new Date().toISOString(), attachments: []
    },
    {
      id: 2, first_name: 'Marie', last_name: 'Curie', email: 'marie.curie@etu.univ.fr',
      t_shirt_size: 'M', allergies: '',
      is_certificate_ok: true, is_waiver_ok: true, is_image_rights_ok: true,
      created_at: new Date().toISOString(), attachments: []
    }
  ];

  getMembers(): Observable<Member[]> {
    // Note: Dé-commentez le code HTTP lorsque le backend sera fait
    return of(this.mockMembers);
  }

  updateMember(id: number, data: Partial<Member>): Observable<Member> {
    return this.http.put<Member>(`/members/${id}`, data).pipe(
      catchError(err => {
        console.warn(`Backend PUT /members/${id} not ready. Using Mock.`);
        const index = this.mockMembers.findIndex(m => m.id === id);
        if (index > -1) {
          this.mockMembers[index] = { ...this.mockMembers[index], ...data };
          return of(this.mockMembers[index]);
        }
        return throwError(() => err);
      })
    );
  }

  createMember(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>): Observable<Member> {
    const newMember: Member = {
      ...member,
      id: this.mockMembers.length > 0 ? Math.max(...this.mockMembers.map(m => m.id)) + 1 : 1,
      created_at: new Date().toISOString(),
      attachments: []
    };
    this.mockMembers.push(newMember);
    return of(newMember);
  }
}
