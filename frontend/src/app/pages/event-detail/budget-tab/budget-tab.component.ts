import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../../services/budget.service';
import { BudgetLine, BudgetAttachment } from '../../../models/budget.model';

@Component({
  selector: 'app-budget-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full">
      <!-- Top Actions -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-text">Tableau de Bord Financier</h2>
        <div class="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
          <button (click)="viewMode = 'forecast'" [class.bg-white]="viewMode === 'forecast'" [class.shadow]="viewMode === 'forecast'" class="px-5 py-2 rounded-md font-medium transition">Prévisionnel</button>
          <button (click)="viewMode = 'actual'" [class.bg-white]="viewMode === 'actual'" [class.shadow]="viewMode === 'actual'" class="px-5 py-2 rounded-md font-medium transition">Réel</button>
        </div>
      </div>

      <!-- Main Columns (Expenses LEFT, Revenues RIGHT) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start flex-1 mb-8">
        
        <!-- ==================== LEFT: EXPENSES ==================== -->
        <div class="bg-red-50/30 rounded-xl p-6 border border-red-100 shadow-sm">
          <div class="flex justify-between items-center mb-6 border-b border-red-200 pb-4">
            <h3 class="text-lg font-bold text-red-700 flex items-center">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Dépenses
            </h3>
            <span class="text-xl font-bold text-red-600">- {{ getExpensesTotal() | number:'1.2-2' }} €</span>
          </div>

          <div class="space-y-4">
            <div *ngFor="let line of getExpenses()" class="bg-white p-4 rounded-lg shadow-sm border border-red-50 hover:border-red-200 transition group relative">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Catégorie</label>
                    <input class="block w-full text-sm mt-1 bg-transparent border-b border-dashed border-gray-300 focus:border-red-400 focus:outline-none py-1" [(ngModel)]="line.category" (blur)="save(line)" placeholder="Ex: Lieu, Traiteur...">
                  </div>
                  <div>
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Libellé</label>
                    <input class="block w-full text-sm mt-1 bg-transparent border-b border-dashed border-gray-300 focus:border-red-400 focus:outline-none py-1 truncate" [(ngModel)]="line.label" (blur)="save(line)" placeholder="Description précise...">
                  </div>
                </div>
                <div class="w-28 text-right">
                  <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Montant</label>
                  <div class="relative mt-1">
                    <input *ngIf="viewMode === 'forecast'" type="number" class="block w-full text-right font-bold text-red-600 bg-transparent border-b border-dashed border-red-200 focus:border-red-500 focus:outline-none py-1 pr-4" [(ngModel)]="line.forecast_amount" (blur)="save(line)">
                    <input *ngIf="viewMode === 'actual'" type="number" class="block w-full text-right font-bold text-red-600 bg-transparent border-b border-dashed border-red-200 focus:border-red-500 focus:outline-none py-1 pr-4" [(ngModel)]="line.actual_amount" (blur)="save(line)">
                    <span class="absolute right-0 top-1 text-sm font-bold text-red-400">€</span>
                  </div>
                </div>
              </div>

              <!-- Options & Actions -->
              <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <div class="flex items-center space-x-4">
                  <label class="flex items-center space-x-2 text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    <input type="checkbox" [(ngModel)]="line.is_fsdie_eligible" (change)="save(line)" class="rounded text-red-500 focus:ring-red-500 w-3.5 h-3.5">
                    <span>Éligible FSDIE</span>
                  </label>
                  
                  <div class="flex items-center space-x-1">
                    <!-- Fake Upload Button -->
                    <button (click)="triggerUpload(line)" class="text-xs text-blue-600 hover:underline flex items-center" title="Joindre un justificatif">
                      <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                      Joindre une facture
                    </button>
                  </div>
                </div>
                
                <button (click)="deleteLine(line)" class="text-gray-300 hover:text-red-600 transition p-1 hover:bg-red-50 rounded" title="Supprimer la ligne">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>

              <!-- Attachments List (Mocked View) -->
              <div *ngIf="line.attachments && line.attachments.length > 0" class="mt-2 flex flex-wrap gap-2">
                <span *ngFor="let att of line.attachments" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 cursor-pointer hover:bg-blue-100" (click)="viewAttachment(att)">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  {{ att.file_name }}
                </span>
              </div>
            </div>

            <!-- Add Button -->
            <button (click)="addLine('EXPENSE')" class="w-full py-3 border-2 border-dashed border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 rounded-lg font-medium transition flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              Ajouter une dépense
            </button>
          </div>
        </div>

        <!-- ==================== RIGHT: REVENUES ==================== -->
        <div class="bg-primary/5 rounded-xl p-6 border border-primary/20 shadow-sm">
          <div class="flex justify-between items-center mb-6 border-b border-primary/30 pb-4">
            <h3 class="text-lg font-bold text-primary flex items-center">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Revenus
            </h3>
            <span class="text-xl font-bold text-primary">+ {{ getRevenuesTotal() | number:'1.2-2' }} €</span>
          </div>

          <div class="space-y-4">
            <div *ngFor="let line of getRevenues()" class="bg-white p-4 rounded-lg shadow-sm border border-primary/10 hover:border-primary/40 transition group relative">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Catégorie</label>
                    <input class="block w-full text-sm mt-1 bg-transparent border-b border-dashed border-gray-300 focus:border-primary focus:outline-none py-1" [(ngModel)]="line.category" (blur)="save(line)" placeholder="Ex: Billetterie, Sponsoring...">
                  </div>
                  <div>
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Libellé</label>
                    <input class="block w-full text-sm mt-1 bg-transparent border-b border-dashed border-gray-300 focus:border-primary focus:outline-none py-1 truncate" [(ngModel)]="line.label" (blur)="save(line)" placeholder="Détail du flux...">
                  </div>
                </div>
                <div class="w-28 text-right">
                  <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Montant</label>
                  <div class="relative mt-1">
                    <input *ngIf="viewMode === 'forecast'" type="number" class="block w-full text-right font-bold text-primary bg-transparent border-b border-dashed border-primary/40 focus:border-primary focus:outline-none py-1 pr-4" [(ngModel)]="line.forecast_amount" (blur)="save(line)">
                    <input *ngIf="viewMode === 'actual'" type="number" class="block w-full text-right font-bold text-primary bg-transparent border-b border-dashed border-primary/40 focus:border-primary focus:outline-none py-1 pr-4" [(ngModel)]="line.actual_amount" (blur)="save(line)">
                    <span class="absolute right-0 top-1 text-sm font-bold text-primary">€</span>
                  </div>
                </div>
              </div>

              <!-- Options & Actions -->
              <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <div class="flex items-center space-x-1">
                    <button (click)="triggerUpload(line)" class="text-xs text-blue-600 hover:underline flex items-center" title="Joindre un justificatif">
                      <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                      Joindre reçu
                    </button>
                </div>
                
                <button (click)="deleteLine(line)" class="text-gray-300 hover:text-red-600 transition p-1 hover:bg-red-50 rounded" title="Supprimer la ligne">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>

               <!-- Attachments List -->
               <div *ngIf="line.attachments && line.attachments.length > 0" class="mt-2 flex flex-wrap gap-2">
                <span *ngFor="let att of line.attachments" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 cursor-pointer hover:bg-blue-100" (click)="viewAttachment(att)">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  {{ att.file_name }}
                </span>
              </div>
            </div>

            <!-- Add Button -->
            <button (click)="addLine('REVENUE')" class="w-full py-3 border-2 border-dashed border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 rounded-lg font-medium transition flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              Ajouter un revenu
            </button>
          </div>
        </div>

      </div>

      <!-- Footer Bilan -->
      <div class="mt-auto bg-gray-50 border-t border-gray-200 p-6 rounded-b-lg flex justify-between items-center shadow-inner">
        <div>
          <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Bilan Global de l'Événement</h4>
          <p class="text-xs text-gray-400">Total des revenus moins total des dépenses.</p>
        </div>
        <div class="text-3xl font-black" [class.text-red-600]="getTotal() < 0" [class.text-green-600]="getTotal() >= 0" [class.text-gray-900]="getTotal() === 0">
          {{ getTotal() > 0 ? '+' : '' }}{{ getTotal() | number:'1.2-2' }} €
        </div>
      </div>
    </div>
  `
})
export class BudgetTabComponent implements OnInit {
  @Input() eventId!: number;
  private budgetService = inject(BudgetService);

  lines: BudgetLine[] = [];
  viewMode: 'forecast' | 'actual' = 'forecast';

  ngOnInit() {
    if (this.eventId) {
      this.budgetService.getBudgetLines(this.eventId).subscribe(data => {
        this.lines = data;
      });
    }
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
      category: '',
      label: '',
      forecast_amount: 0,
      is_fsdie_eligible: false,
      created_by: 1
    }).subscribe(newLine => {
      this.lines.push(newLine);
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
}
