import { Component, Input, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { BudgetService } from '../../../services/budget.service';
import { FileService } from '../../../services/file.service';
import { AuthService } from '../../../services/auth.service';
import { BudgetLine, BudgetAttachment } from '../../../models/budget.model';
import { finalize } from 'rxjs/operators';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-budget-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget-tab.component.html'
})
export class BudgetTabComponent {
  private _eventId!: number;

  @Input() 
  set eventId(value: number) {
    this._eventId = value;
    if (value) {
      console.log('Setter triggered with eventId:', value);
      this.loadBudget();
    }
  }
  get eventId(): number {
    return this._eventId;
  }

  private budgetService = inject(BudgetService);
  private fileService = inject(FileService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  lines: BudgetLine[] = [];
  viewMode: 'forecast' | 'actual' = 'forecast';
  selectedFile: File | null = null;
  selectedBudgetLine: BudgetLine | null = null;
  isUploading = false;

  loadBudget() {
    console.log('loadBudget called for event:', this.eventId);
    this.budgetService.getBudgetLines(this.eventId).subscribe({
      next: (data) => {
        console.log('Received data from backend:', data);
        this.lines = data ? [...data] : [];
        this.lines.forEach((line) => this.loadAttachments(line.id));
        this.cdr.detectChanges(); // Force DOM update
      },
      error: (err) => {
        console.error('API Error in getBudgetLines:', err);
      }
    });
  }

  getExpenses() {
    return this.lines.filter(l => l.type === 'EXPENSE');
  }

  getRevenues() {
    return this.lines.filter(l => l.type === 'REVENUE');
  }

  getExpensesTotal(): number {
    return this.getExpenses().reduce((acc, line) => {
      return acc + (this.viewMode === 'forecast' ? Number(line.forecast_amount) : (Number(line.actual_amount) || 0));
    }, 0);
  }

  getRevenuesTotal(): number {
    return this.getRevenues().reduce((acc, line) => {
      return acc + (this.viewMode === 'forecast' ? Number(line.forecast_amount) : (Number(line.actual_amount) || 0));
    }, 0);
  }

  getTotal(): number {
    return this.getRevenuesTotal() - this.getExpensesTotal();
  }

  save(line: BudgetLine) {
    if (this.viewMode === 'forecast') line.forecast_amount = Number(line.forecast_amount);
    if (this.viewMode === 'actual' && line.actual_amount !== undefined) line.actual_amount = Number(line.actual_amount);

    this.budgetService.updateBudgetLine(line.id, line).subscribe({
      error: () => console.error('Failed to save')
    });
  }

  addLine(type: 'REVENUE' | 'EXPENSE') {
    this.budgetService.createBudgetLine({
      event_id: this.eventId,
      type: type,
      category: 'Nouvelle catégorie',
      label: 'Nouveau libellé',
      forecast_amount: 0,
      is_fsdie_eligible: false,
      created_by: 1
    }).subscribe({
      next: (newLine) => {
        this.lines.push(newLine);
      },
      error: (err) => {
        console.error('Erreur lors de la création:', err);
        alert('Impossible de créer la ligne');
      }
    });
  }

  deleteLine(line: BudgetLine) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette ligne de budget ?")) {
      this.budgetService.deleteBudgetLine(line.id).subscribe({
        next: () => {
          this.lines = this.lines.filter(l => l.id !== line.id);
        },
        error: () => alert('Erreur lors de la suppression')
      });
    }
  }

  triggerUpload(line: BudgetLine) {
    this.selectedBudgetLine = line;
    this.selectedFile = null;
    const inputElement = document.getElementById('budget-file-input') as HTMLInputElement | null;
    if (inputElement) {
      inputElement.value = '';
      inputElement.click();
    }
  }

  onFileSelected(event: any) {
    const file = event?.target?.files?.[0] ?? null;
    this.selectedFile = file;
  }

  upload() {
    if (!this.canUpload()) {
      return;
    }

    const selectedFile = this.selectedFile;
    const currentLine = this.selectedBudgetLine;

    if (!selectedFile || !currentLine) {
      return;
    }

    this.isUploading = true;

    this.fileService
      .uploadBudgetAttachment(currentLine.id, selectedFile)
      .pipe(
        timeout(20000),
        finalize(() => {
          this.isUploading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
      next: () => {
        this.selectedFile = null;
        this.selectedBudgetLine = null;

        const inputElement = document.getElementById('budget-file-input') as HTMLInputElement | null;
        if (inputElement) {
          inputElement.value = '';
        }

        this.loadAttachments(currentLine.id);
      },
      error: (error: HttpErrorResponse | any) => {
        this.selectedFile = null;
        if (error?.name === 'TimeoutError') {
          alert('Upload trop long: verifie la connexion ou reduis la taille du fichier.');
          return;
        }

        const backendMessage = error?.error?.message;
        alert(`Erreur upload justificatif (${error.status}): ${backendMessage || 'erreur inconnue'}`);
      }
    });
  }

  viewAttachment(att: BudgetAttachment) {
    // Ouvrir directement le fichier dans un nouvel onglet
    window.open(this.fileService.getFileUrl(att.file_path), '_blank');
  }

  removeAttachment(line: BudgetLine, att: BudgetAttachment, event: MouseEvent) {
    event.stopPropagation();

    if (!confirm(`Supprimer le justificatif "${att.file_name}" ?`)) {
      return;
    }

    this.fileService.deleteBudgetAttachment(line.id, att.id).subscribe({
      next: () => {
        line.attachments = (line.attachments ?? []).filter((item) => item.id !== att.id);
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        const backendMessage = error?.error?.message;
        alert(`Erreur suppression (${error.status}): ${backendMessage || 'erreur inconnue'}`);
      }
    });
  }

  canUploadLine(line: BudgetLine): boolean {
    return !!this.selectedFile && !!this.selectedBudgetLine && this.selectedBudgetLine.id === line.id && !this.isUploading;
  }

  isLineSelected(line: BudgetLine): boolean {
    return !!this.selectedBudgetLine && this.selectedBudgetLine.id === line.id;
  }

  clearSelectedUpload() {
    this.selectedFile = null;
    this.selectedBudgetLine = null;

    const inputElement = document.getElementById('budget-file-input') as HTMLInputElement | null;
    if (inputElement) {
      inputElement.value = '';
    }
  }

  private canUpload(): boolean {
    return !!this.selectedFile && !!this.selectedBudgetLine?.id && !this.isUploading;
  }

  export(fsdieOnly: boolean) {
    this.budgetService.exportBudgetExcel(this.eventId, this.lines, fsdieOnly).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget${fsdieOnly ? '_fsdie' : ''}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Export failed', err);
        alert('Erreur lors de l\'export.');
      }
    });
  }

  /** Génère et télécharge le dossier FSDIE complet (PDF) */
  exportFsdiePdf() {
    const url = `http://localhost:3000/api/export/events/${this.eventId}/fsdie`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `dossier_fsdie_event${this.eventId}.pdf`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private loadAttachments(lineId: number) {
    this.fileService.getBudgetAttachments(lineId).subscribe({
      next: (attachments) => {
        const normalized = attachments.map((attachment) => ({
          ...attachment,
          file_path: this.fileService.getFileUrl(attachment.file_path)
        }));

        const targetLine = this.lines.find((line) => line.id === lineId);
        if (targetLine) {
          targetLine.attachments = normalized;
        }

        this.cdr.detectChanges();
      },
      error: () => {
        const targetLine = this.lines.find((line) => line.id === lineId);
        if (targetLine) {
          targetLine.attachments = [];
        }

        this.cdr.detectChanges();
      }
    });
  }

  /** Retourne true si l'utilisateur a le rôle Trésorier ou Admin. */
  isTresorier(): boolean {
    return this.authService.hasRole('TRESORIER', 'ADMIN');
  }

  /**
   * Met à jour le statut de validation d'une ligne FSDIE.
   * La mise à jour est répercutée localement sans rechargement.
   */
  setStatus(line: BudgetLine, status: 'SOUMIS' | 'APPROUVE' | 'REFUSE'): void {
    this.budgetService.updateValidationStatus(line.id, status).subscribe({
      next: () => {
        line.validation_status = status;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur mise à jour statut:', err);
        alert('Impossible de mettre à jour le statut.');
      }
    });
  }
}
