import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { KanbanService, KanbanColumn, KanbanCard } from '../../../services/kanban.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-kanban-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './kanban-tab.component.html',
  styleUrls: ['./kanban-tab.component.css']
})
export class KanbanTabComponent implements OnInit {
  @Input() eventId!: number;

  private kanbanService = inject(KanbanService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  columns: KanbanColumn[] = [];
  isLoading = false;

  // Formulaire colonne
  newColTitle = '';
  editingCol: KanbanColumn | null = null;

  // Formulaire carte
  addingCardInCol: number | null = null;
  newCardTitle = '';
  editingCard: KanbanCard | null = null;
  editCardForm: { title: string; description: string; label: string; due_date: string } = {
    title: '', description: '', label: '', due_date: ''
  };

  get connectedLists(): string[] {
    return this.columns.map(c => 'col-' + c.id);
  }

  ngOnInit() { this.load(); }

  load() {
    this.isLoading = true;
    this.kanbanService.getKanban(this.eventId).subscribe({
      next: cols => { this.columns = cols; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.toast.error('Impossible de charger le Kanban.'); this.isLoading = false; }
    });
  }

  // --- Colonnes ---
  addColumn() {
    if (!this.newColTitle.trim()) return;
    this.kanbanService.createColumn(this.eventId, { title: this.newColTitle }).subscribe({
      next: col => { this.columns.push(col); this.newColTitle = ''; this.toast.success('Colonne ajoutée.'); this.cdr.detectChanges(); },
      error: () => this.toast.error('Erreur lors de l\'ajout de la colonne.')
    });
  }

  deleteColumn(col: KanbanColumn) {
    if (!confirm(`Supprimer la colonne "${col.title}" et toutes ses cartes ?`)) return;
    this.kanbanService.deleteColumn(this.eventId, col.id).subscribe({
      next: () => { this.columns = this.columns.filter(c => c.id !== col.id); this.toast.success('Colonne supprimée.'); this.cdr.detectChanges(); },
      error: () => this.toast.error('Erreur lors de la suppression.')
    });
  }

  // --- Cartes ---
  startAddCard(colId: number) {
    this.addingCardInCol = colId;
    this.newCardTitle = '';
  }

  addCard(col: KanbanColumn) {
    if (!this.newCardTitle.trim()) return;
    this.kanbanService.createCard(this.eventId, col.id, { title: this.newCardTitle }).subscribe({
      next: card => {
        col.cards.push(card);
        this.addingCardInCol = null;
        this.toast.success('Carte ajoutée.');
        this.cdr.detectChanges();
      },
      error: () => this.toast.error('Erreur lors de l\'ajout de la carte.')
    });
  }

  openEditCard(card: KanbanCard) {
    this.editingCard = card;
    this.editCardForm = {
      title: card.title,
      description: card.description || '',
      label: card.label || '',
      due_date: card.due_date || ''
    };
  }

  saveCard() {
    if (!this.editingCard) return;
    this.kanbanService.updateCard(this.eventId, this.editingCard.id, this.editCardForm).subscribe({
      next: updated => {
        const col = this.columns.find(c => c.id === updated.column_id);
        if (col) {
          const idx = col.cards.findIndex(c => c.id === updated.id);
          if (idx >= 0) col.cards[idx] = { ...col.cards[idx], ...updated };
        }
        this.editingCard = null;
        this.toast.success('Carte mise à jour.');
        this.cdr.detectChanges();
      },
      error: () => this.toast.error('Erreur lors de la modification.')
    });
  }

  deleteCard(col: KanbanColumn, card: KanbanCard) {
    if (!confirm(`Supprimer la carte "${card.title}" ?`)) return;
    this.kanbanService.deleteCard(this.eventId, card.id).subscribe({
      next: () => {
        col.cards = col.cards.filter(c => c.id !== card.id);
        this.toast.success('Carte supprimée.');
        this.cdr.detectChanges();
      },
      error: () => this.toast.error('Erreur lors de la suppression.')
    });
  }

  // --- Drag & Drop ---
  onDrop(event: CdkDragDrop<KanbanCard[]>, targetCol: KanbanColumn) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    const card = event.container.data[event.currentIndex];
    this.kanbanService.moveCard(this.eventId, card.id, targetCol.id, event.currentIndex).subscribe({
      error: () => this.toast.error('Erreur lors du déplacement de la carte.')
    });
  }

  labelColor(label: string | undefined): string {
    const colors: Record<string, string> = {
      logistique: '#dbeafe', achats: '#fef9c3', communication: '#dcfce7', default: '#f3f4f6'
    };
    return colors[label || 'default'] || colors['default'];
  }
}
