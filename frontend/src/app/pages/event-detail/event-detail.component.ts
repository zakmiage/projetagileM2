import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { BudgetTabComponent } from './budget-tab/budget-tab.component';
import { ParticipantsTabComponent } from './participants-tab/participants-tab.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BudgetTabComponent, ParticipantsTabComponent],
  templateUrl: './event-detail.component.html'
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef);
  
  event?: Event;
  error?: string;
  activeTab: 'budget' | 'participants' = 'budget';
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  isSaving = false;
  editForm: {
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    capacity: number;
  } = {
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    capacity: 1
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(+id);
    }
  }

  openEditModal(): void {
    if (!this.event) return;
    this.editForm = {
      name: this.event.name,
      description: this.event.description || '',
      start_date: this.toDateInputValue(this.event.start_date),
      end_date: this.toDateInputValue(this.event.end_date),
      capacity: this.event.capacity
    };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.error = undefined;
  }

  saveEventChanges(): void {
    if (!this.event || !this.editForm.name || !this.editForm.start_date) return;

    const payload = {
      name: this.editForm.name,
      description: this.editForm.description || undefined,
      start_date: new Date(this.editForm.start_date).toISOString(),
      end_date: new Date((this.editForm.end_date || this.editForm.start_date)).toISOString(),
      capacity: this.editForm.capacity
    };

    this.isSaving = true;
    this.eventService.updateEvent(this.event.id, payload).subscribe({
      next: (updated) => {
        this.event = updated;
        this.isSaving = false;
        this.isEditModalOpen = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Impossible de modifier cet événement.';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  openDeleteModal(): void {
    this.isDeleteModalOpen = true;
  }

  cancelDeleteEvent(): void {
    this.isDeleteModalOpen = false;
  }

  confirmDeleteEvent(): void {
    if (!this.event) return;

    this.eventService.deleteEvent(this.event.id).subscribe({
      next: () => {
        this.router.navigate(['/events']);
      },
      error: () => {
        this.error = 'Impossible de supprimer cet événement.';
        this.isDeleteModalOpen = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadEvent(id: number): void {
    this.eventService.getEvent(id).subscribe({
      next: (ev) => {
        this.event = ev;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Impossible de charger cet événement.';
        this.cdr.detectChanges();
      }
    });
  }

  private toDateInputValue(isoDate: string): string {
    if (!isoDate) return '';
    return new Date(isoDate).toISOString().split('T')[0];
  }
}
