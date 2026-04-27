import { Component, Input, inject, ChangeDetectorRef } from '@angular/core';
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
    if (value) this.loadBudget();
  }
  get eventId(): number { return this._eventId; }

  private budgetService = inject(BudgetService);
  private fileService   = inject(FileService);
  private authService   = inject(AuthService);
  private cdr           = inject(ChangeDetectorRef);

  lines: BudgetLine[] = [];
  viewMode: 'forecast' | 'actual' = 'forecast';
  selectedFile: File | null = null;
  selectedBudgetLine: BudgetLine | null = null;
  isUploading = false;

  /** trackBy → Angular réutilise les DOM nodes existants, pas de flicker */
  trackById(_: number, line: BudgetLine): number { return line.id; }

  // ─── Chargement initial ──────────────────────────────────────────────────

  loadBudget() {
    this.budgetService.getBudgetLines(this.eventId).subscribe({
      next: (data) => {
        this.lines = this.normalize(data ?? []);
        // Charger les attachments en parallèle (pas de blocage)
        this.lines.forEach(l => this.loadAttachments(l.id));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('API Error in getBudgetLines:', err)
    });
  }

  // ─── Totaux ──────────────────────────────────────────────────────────────

  getExpenses()  { return this.lines.filter(l => l.type === 'EXPENSE'); }
  getRevenues()  { return this.lines.filter(l => l.type === 'REVENUE'); }

  getExpensesTotal(): number {
    return this.getExpenses().reduce((acc, l) =>
      acc + (this.viewMode === 'forecast' ? Number(l.forecast_amount) : (Number(l.actual_amount) || 0)), 0);
  }
  getRevenuesTotal(): number {
    return this.getRevenues().reduce((acc, l) =>
      acc + (this.viewMode === 'forecast' ? Number(l.forecast_amount) : (Number(l.actual_amount) || 0)), 0);
  }
  getTotal(): number { return this.getRevenuesTotal() - this.getExpensesTotal(); }

  // ─── Mutations ───────────────────────────────────────────────────────────

  save(line: BudgetLine) {
    // 1. Mise à jour optimiste locale (feedback immédiat, 0ms)
    if (this.viewMode === 'forecast') {
      line.forecast_amount = Number(line.forecast_amount) || 0;
    } else {
      const v = line.actual_amount;
      line.actual_amount = (v !== null && v !== undefined && v !== ('' as any))
        ? Number(v) : undefined;
    }

    // Snapshot pour rollback en cas d'erreur
    const snapshot = { ...line };

    const payload: Partial<BudgetLine> = {
      category:          line.category,
      label:             line.label,
      forecast_amount:   line.forecast_amount,
      actual_amount:     line.actual_amount ?? null as any,
      is_fsdie_eligible: line.is_fsdie_eligible,
      validation_status: line.validation_status,
    };

    this.budgetService.updateBudgetLine(line.id, payload).subscribe({
      // 2. Le backend retourne les lignes recalculées (incl. R14) → on les applique
      //    directement sans 2ème requête GET
      next: (res: any) => {
        if (res?.lines) this.applyFreshLines(res.lines);
      },
      error: () => {
        // Rollback optimiste si erreur serveur
        Object.assign(line, snapshot);
        this.cdr.detectChanges();
        console.error('Failed to save — rollback applied');
      }
    });
  }

  addLine(type: 'REVENUE' | 'EXPENSE') {
    this.budgetService.createBudgetLine({
      event_id: this.eventId, type,
      category: 'Nouvelle catégorie',
      label: 'Nouveau libellé',
      forecast_amount: 0,
      is_fsdie_eligible: false,
      created_by: 1
    }).subscribe({
      next: (res: any) => {
        // Le backend retourne maintenant lines — pas besoin de GET séparé
        if (res?.lines) this.applyFreshLines(res.lines);
      },
      error: (err) => {
        console.error('Erreur création:', err);
        alert('Impossible de créer la ligne');
      }
    });
  }

  deleteLine(line: BudgetLine) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ligne de budget ?')) return;

    // Suppression optimiste locale
    const backup = [...this.lines];
    this.lines = this.lines.filter(l => l.id !== line.id);
    this.cdr.detectChanges();

    this.budgetService.deleteBudgetLine(line.id).subscribe({
      next: (res: any) => {
        if (res?.lines) this.applyFreshLines(res.lines); // R14 recalculé
      },
      error: () => {
        // Rollback si erreur
        this.lines = backup;
        this.cdr.detectChanges();
        alert('Erreur lors de la suppression');
      }
    });
  }

  setStatus(line: BudgetLine, status: 'SOUMIS' | 'APPROUVE' | 'REFUSE'): void {
    const prev = line.validation_status;
    line.validation_status = status; // Optimiste : badge change immédiatement

    this.budgetService.updateValidationStatus(line.id, status).subscribe({
      next: (res: any) => {
        if (res?.lines) this.applyFreshLines(res.lines); // R14 recalculé
      },
      error: (err) => {
        line.validation_status = prev; // Rollback badge
        this.cdr.detectChanges();
        console.error('Erreur statut:', err);
        alert('Impossible de mettre à jour le statut.');
      }
    });
  }

  // ─── Pièces jointes ──────────────────────────────────────────────────────

  triggerUpload(line: BudgetLine) {
    this.selectedBudgetLine = line;
    this.selectedFile = null;
    const el = document.getElementById('budget-file-input') as HTMLInputElement | null;
    if (el) { el.value = ''; el.click(); }
  }

  onFileSelected(event: any) {
    this.selectedFile = event?.target?.files?.[0] ?? null;
  }

  upload() {
    if (!this.canUpload()) return;
    const file = this.selectedFile!;
    const line = this.selectedBudgetLine!;
    this.isUploading = true;

    this.fileService.uploadBudgetAttachment(line.id, file).pipe(
      timeout(20000),
      finalize(() => { this.isUploading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => {
        this.selectedFile = null;
        this.selectedBudgetLine = null;
        const el = document.getElementById('budget-file-input') as HTMLInputElement | null;
        if (el) el.value = '';
        this.loadAttachments(line.id);
      },
      error: (error: HttpErrorResponse | any) => {
        this.selectedFile = null;
        if (error?.name === 'TimeoutError') {
          alert('Upload trop long : vérifie la connexion ou réduis la taille du fichier.');
          return;
        }
        alert(`Erreur upload (${error.status}): ${error?.error?.message || 'erreur inconnue'}`);
      }
    });
  }

  viewAttachment(att: BudgetAttachment) {
    window.open(this.fileService.getFileUrl(att.file_path), '_blank');
  }

  removeAttachment(line: BudgetLine, att: BudgetAttachment, event: MouseEvent) {
    event.stopPropagation();
    if (!confirm(`Supprimer le justificatif "${att.file_name}" ?`)) return;

    // Suppression optimiste locale
    line.attachments = (line.attachments ?? []).filter(a => a.id !== att.id);
    this.cdr.detectChanges();

    this.fileService.deleteBudgetAttachment(line.id, att.id).subscribe({
      error: (error: HttpErrorResponse) => {
        // Rollback : recharger les attachments de cette ligne
        this.loadAttachments(line.id);
        alert(`Erreur suppression (${error.status}): ${error?.error?.message || 'erreur inconnue'}`);
      }
    });
  }

  canUploadLine(line: BudgetLine): boolean {
    return !!this.selectedFile && !!this.selectedBudgetLine
        && this.selectedBudgetLine.id === line.id && !this.isUploading;
  }
  isLineSelected(line: BudgetLine): boolean {
    return !!this.selectedBudgetLine && this.selectedBudgetLine.id === line.id;
  }
  clearSelectedUpload() {
    this.selectedFile = null;
    this.selectedBudgetLine = null;
    const el = document.getElementById('budget-file-input') as HTMLInputElement | null;
    if (el) el.value = '';
  }
  private canUpload(): boolean {
    return !!this.selectedFile && !!this.selectedBudgetLine?.id && !this.isUploading;
  }

  // ─── Export ──────────────────────────────────────────────────────────────

  export(fsdieOnly: boolean) {
    this.budgetService.exportBudgetExcel(this.eventId, this.lines, fsdieOnly).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget${fsdieOnly ? '_fsdie' : ''}.xlsx`;
        document.body.appendChild(a); a.click();
        window.URL.revokeObjectURL(url); document.body.removeChild(a);
      },
      error: (err) => { console.error('Export failed', err); alert("Erreur lors de l'export."); }
    });
  }

  exportFsdiePdf() {
    const url = `http://localhost:3000/api/export/events/${this.eventId}/fsdie`;
    const a = document.createElement('a');
    a.href = url; a.download = `dossier_fsdie_event${this.eventId}.pdf`; a.target = '_blank';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  isTresorier(): boolean { return this.authService.hasRole('TRESORIER', 'ADMIN'); }

  // ─── Helpers privés ──────────────────────────────────────────────────────

  /**
   * Normalise les montants (mysql2 retourne des strings DECIMAL).
   */
  private normalize(lines: any[]): BudgetLine[] {
    return lines.map(l => ({
      ...l,
      forecast_amount: Number(l.forecast_amount) || 0,
      actual_amount:   l.actual_amount != null ? Number(l.actual_amount) : undefined,
    }));
  }

  /**
   * Applique les lignes fraîches retournées par le backend SANS faire de 2ème GET.
   * Préserve les attachments déjà chargés en mémoire.
   * Utilise un nouveau tableau pour déclencher la détection de changement Angular.
   */
  private applyFreshLines(freshLines: any[]): void {
    const prevAttachments = new Map(this.lines.map(l => [l.id, l.attachments]));
    this.lines = this.normalize(freshLines).map(l => ({
      ...l,
      attachments: prevAttachments.get(l.id) ?? l.attachments
    }));
    this.cdr.detectChanges();
  }

  private loadAttachments(lineId: number) {
    this.fileService.getBudgetAttachments(lineId).subscribe({
      next: (attachments) => {
        const normalized = attachments.map(a => ({
          ...a, file_path: this.fileService.getFileUrl(a.file_path)
        }));
        const target = this.lines.find(l => l.id === lineId);
        if (target) { target.attachments = normalized; this.cdr.detectChanges(); }
      },
      error: () => {
        const target = this.lines.find(l => l.id === lineId);
        if (target) { target.attachments = []; this.cdr.detectChanges(); }
      }
    });
  }
}
