import { Component, Input, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../../services/budget.service';
import { BudgetLine, BudgetAttachment } from '../../../models/budget.model';

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
  private cdr = inject(ChangeDetectorRef);

  lines: BudgetLine[] = [];
  viewMode: 'forecast' | 'actual' = 'forecast';

  loadBudget() {
    console.log('loadBudget called for event:', this.eventId);
    this.budgetService.getBudgetLines(this.eventId).subscribe({
      next: (data) => {
        console.log('Received data from backend:', data);
        this.lines = data ? [...data] : [];
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
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*, application/pdf';

    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        // Create an ObjectURL to simulate the uploaded file being accessible
        const fileUrl = URL.createObjectURL(file);

        const mockAttachment: BudgetAttachment = {
          id: Math.floor(Math.random() * 1000),
          budget_line_id: line.id,
          file_name: file.name,
          file_path: fileUrl, // Real local URL for viewing
          uploaded_at: new Date().toISOString()
        };

        if (!line.attachments) {
          line.attachments = [];
        }
        line.attachments.push(mockAttachment);
        this.save(line);
      }
    };

    input.click();
  }

  viewAttachment(att: BudgetAttachment) {
    // Ouvrir directement le fichier dans un nouvel onglet
    window.open(att.file_path, '_blank');
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
}
