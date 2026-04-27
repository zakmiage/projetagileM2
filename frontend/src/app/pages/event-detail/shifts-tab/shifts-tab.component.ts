import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftService, Shift, ShiftRegistration } from '../../../services/shift.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-shifts-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shifts-tab.component.html'
})
export class ShiftsTabComponent implements OnInit {
  @Input() eventId!: number;

  private shiftService = inject(ShiftService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  shifts: Shift[] = [];
  isLoading = false;
  isFormOpen = false;
  editingShift: Shift | null = null;

  form: { label: string; start_time: string; end_time: string; capacity: number } = {
    label: '', start_time: '', end_time: '', capacity: 10
  };

  registerMemberId: number | null = null;
  expandedShiftId: number | null = null;
  registrations: Record<number, ShiftRegistration[]> = {};

  ngOnInit() { this.load(); }

  load() {
    this.isLoading = true;
    this.shiftService.getShifts(this.eventId).subscribe({
      next: s => { this.shifts = s; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.toast.error('Impossible de charger les créneaux.'); this.isLoading = false; }
    });
  }

  openCreate() {
    this.editingShift = null;
    this.form = { label: '', start_time: '', end_time: '', capacity: 10 };
    this.isFormOpen = true;
  }

  openEdit(s: Shift) {
    this.editingShift = s;
    this.form = {
      label: s.label,
      start_time: s.start_time.replace(' ', 'T').substring(0, 16),
      end_time: s.end_time.replace(' ', 'T').substring(0, 16),
      capacity: s.capacity
    };
    this.isFormOpen = true;
  }

  save() {
    const payload = {
      label: this.form.label,
      start_time: new Date(this.form.start_time).toISOString(),
      end_time: new Date(this.form.end_time).toISOString(),
      capacity: this.form.capacity
    };
    if (this.editingShift) {
      this.shiftService.updateShift(this.eventId, this.editingShift.id, payload).subscribe({
        next: () => { this.toast.success('Créneau mis à jour.'); this.isFormOpen = false; this.load(); },
        error: () => this.toast.error('Erreur lors de la modification.')
      });
    } else {
      this.shiftService.createShift(this.eventId, payload).subscribe({
        next: () => { this.toast.success('Créneau créé.'); this.isFormOpen = false; this.load(); },
        error: () => this.toast.error('Erreur lors de la création.')
      });
    }
  }

  delete(s: Shift) {
    if (!confirm(`Supprimer le créneau "${s.label}" ?`)) return;
    this.shiftService.deleteShift(this.eventId, s.id).subscribe({
      next: () => { this.toast.success('Créneau supprimé.'); this.load(); },
      error: () => this.toast.error('Erreur lors de la suppression.')
    });
  }

  toggleRegistrations(s: Shift) {
    if (this.expandedShiftId === s.id) { this.expandedShiftId = null; return; }
    this.expandedShiftId = s.id;
    this.shiftService.getRegistrations(this.eventId, s.id).subscribe({
      next: r => { this.registrations[s.id] = r; this.cdr.detectChanges(); },
      error: () => this.toast.error('Impossible de charger les inscrits.')
    });
  }

  register(s: Shift) {
    if (!this.registerMemberId) return;
    this.shiftService.register(this.eventId, s.id, this.registerMemberId).subscribe({
      next: () => { this.toast.success('Inscription réussie.'); this.registerMemberId = null; this.load(); this.toggleRegistrations(s); },
      error: err => this.toast.error(err?.error?.message || 'Erreur lors de l\'inscription.')
    });
  }

  unregister(s: Shift, memberId: number) {
    this.shiftService.unregister(this.eventId, s.id, memberId).subscribe({
      next: () => { this.toast.success('Désinscription effectuée.'); this.load(); this.toggleRegistrations(s); },
      error: () => this.toast.error('Erreur lors de la désinscription.')
    });
  }

  fillRate(s: Shift): number {
    return s.capacity > 0 ? Math.round(((s.registered_count || 0) / s.capacity) * 100) : 0;
  }
}
