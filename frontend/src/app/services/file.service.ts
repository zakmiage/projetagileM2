import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BudgetAttachment } from '../models/budget.model';
import { MemberAttachment } from '../models/member.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/files';
  private readonly serverUrl = 'http://localhost:3000';

  getMemberAttachments(memberId: number): Observable<MemberAttachment[]> {
    return this.http
      .get<{ attachments: MemberAttachment[] }>(`${this.apiUrl}/members/${memberId}/attachments`)
      .pipe(
        map((response) => response.attachments ?? []),
        catchError((error) => throwError(() => error))
      );
  }

  uploadMemberAttachment(memberId: number, file: File, documentType: string): Observable<MemberAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    return this.http
      .post<{ attachment: MemberAttachment }>(`${this.apiUrl}/members/${memberId}/attachments`, formData)
      .pipe(
        map((response) => response.attachment),
        catchError((error) => throwError(() => error))
      );
  }

  deleteMemberAttachment(memberId: number, attachmentId: number): Observable<boolean> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/members/${memberId}/attachments/${attachmentId}`)
      .pipe(
        map(() => true),
        catchError((error) => throwError(() => error))
      );
  }

  uploadBudgetAttachment(budgetLineId: number, file: File): Observable<BudgetAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('budget_line_id', String(budgetLineId));

    return this.http
      .post<{ attachment: BudgetAttachment }>(`${this.apiUrl}/budget/upload`, formData)
      .pipe(
        map((response) => response.attachment),
        catchError((error) => throwError(() => error))
      );
  }

  deleteBudgetAttachment(budgetLineId: number, attachmentId: number): Observable<boolean> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/budget/${budgetLineId}/attachments/${attachmentId}`)
      .pipe(
        map(() => true),
        catchError((error) => throwError(() => error))
      );
  }

  getBudgetAttachments(budgetLineId: number): Observable<BudgetAttachment[]> {
    return this.http
      .get<{ attachments: BudgetAttachment[] }>(`${this.apiUrl}/budget/${budgetLineId}/attachments`)
      .pipe(
        map((response) => response.attachments ?? []),
        catchError((error) => throwError(() => error))
      );
  }

  getFileUrl(path: string): string {
    if (!path) {
      return '';
    }

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.serverUrl}/${normalizedPath}`;
  }
}
