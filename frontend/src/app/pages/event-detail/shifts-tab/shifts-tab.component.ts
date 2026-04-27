import { Component, Input, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftService, Shift, ShiftRegistration } from '../../../services/shift.service';
import { ToastService } from '../../../services/toast.service';

export interface ShiftBlock extends Shift {
  top: number; height: number; fillRate: number;
  bgColor: string; leftPct: number; widthPct: number; crossMidnight: boolean;
}
export interface DayColumn {
  date: Date; dayLabel: string; dateLabel: string; isToday: boolean; blocks: ShiftBlock[];
}

@Component({
  selector: 'app-shifts-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shifts-tab.component.html',
  styleUrl: './shifts-tab.component.css'
})
export class ShiftsTabComponent implements OnInit, OnDestroy {
  @Input() eventId!: number;
  private shiftService = inject(ShiftService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private nowTimer: any;

  readonly HOUR_HEIGHT = 64;
  readonly HOURS = Array.from({ length: 24 }, (_, i) => i);

  shifts: Shift[] = [];
  dayColumns: DayColumn[] = [];
  isLoading = false;
  viewMode: 'planning' | 'list' = 'planning';
  currentTimePx = 0;

  selectedShift: Shift | null = null;
  selectedRegistrations: ShiftRegistration[] = [];
  isDrawerOpen = false;
  isLoadingRegs = false;
  registerMemberId: number | null = null;

  isFormOpen = false;
  editingShift: Shift | null = null;
  form = { label: '', start_time: '', end_time: '', capacity: 10 };
  isSaving = false;

  stats = { totalShifts: 0, totalRegistered: 0, totalCapacity: 0, fillRate: 0 };

  ngOnInit() {
    this.updateNowLine();
    this.nowTimer = setInterval(() => this.updateNowLine(), 60000);
    this.load();
  }
  ngOnDestroy() { clearInterval(this.nowTimer); }

  load() {
    this.isLoading = true;
    this.shiftService.getShifts(this.eventId).subscribe({
      next: s => {
        this.shifts = s;
        this.computeStats();
        this.computeDayColumns();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.toast.error('Impossible de charger les créneaux.'); this.isLoading = false; }
    });
  }

  private computeStats() {
    this.stats.totalShifts = this.shifts.length;
    this.stats.totalRegistered = this.shifts.reduce((s, sh) => s + (sh.registered_count ?? 0), 0);
    this.stats.totalCapacity = this.shifts.reduce((s, sh) => s + sh.capacity, 0);
    this.stats.fillRate = this.stats.totalCapacity > 0
      ? Math.round((this.stats.totalRegistered / this.stats.totalCapacity) * 100) : 0;
  }

  private computeDayColumns() {
    const daysMap = new Map<string, Date>();
    this.shifts.forEach(s => {
      const d = new Date(s.start_time);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!daysMap.has(key)) daysMap.set(key, new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    });
    const days = Array.from(daysMap.values()).sort((a, b) => a.getTime() - b.getTime());
    if (!days.length) {
      const t = new Date();
      for (let i = 0; i < 3; i++) { const d = new Date(t); d.setDate(d.getDate() + i); days.push(d); }
    }
    const today = new Date();
    this.dayColumns = days.map(day => ({
      date: day,
      dayLabel: day.toLocaleDateString('fr-FR', { weekday: 'short' }),
      dateLabel: day.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      isToday: day.toDateString() === today.toDateString(),
      blocks: this.positionShifts(this.shifts.filter(s => {
        const d = new Date(s.start_time);
        return d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate();
      }))
    }));
  }

  private positionShifts(shifts: Shift[]): ShiftBlock[] {
    const sorted = [...shifts].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    const columns: Shift[][] = [];
    const assignments: { shift: Shift; col: number }[] = [];
    for (const s of sorted) {
      let placed = false;
      for (let ci = 0; ci < columns.length; ci++) {
        const last = columns[ci][columns[ci].length - 1];
        if (new Date(last.end_time).getTime() <= new Date(s.start_time).getTime()) {
          columns[ci].push(s); assignments.push({ shift: s, col: ci }); placed = true; break;
        }
      }
      if (!placed) { columns.push([s]); assignments.push({ shift: s, col: columns.length - 1 }); }
    }
    const total = columns.length || 1;
    return assignments.map(({ shift: s, col }) => {
      const st = new Date(s.start_time), en = new Date(s.end_time);
      const stMin = st.getHours() * 60 + st.getMinutes();
      const sameDay = st.toDateString() === en.toDateString();
      const enMin = sameDay ? en.getHours() * 60 + en.getMinutes() : 24 * 60;
      const dur = Math.max(enMin - stMin, 30);
      const top = (stMin / 60) * this.HOUR_HEIGHT;
      const height = Math.max((dur / 60) * this.HOUR_HEIGHT, 36);
      const reg = s.registered_count ?? 0;
      const fillRate = s.capacity > 0 ? Math.round((reg / s.capacity) * 100) : 0;
      const bgColor = fillRate >= 100 ? 'rgba(239,68,68,0.9)' : fillRate >= 70 ? 'rgba(245,158,11,0.9)' : 'rgba(16,185,129,0.9)';
      const gap = 4; const w = 100 / total - gap / total; const l = col * (100 / total) + (col > 0 ? gap / 2 : 0);
      return { ...s, top, height, fillRate, bgColor, leftPct: l, widthPct: w, crossMidnight: !sameDay };
    });
  }

  private updateNowLine() {
    const n = new Date();
    this.currentTimePx = (n.getHours() + n.getMinutes() / 60) * this.HOUR_HEIGHT;
  }
  isTodayVisible() { return this.dayColumns.some(c => c.isToday); }

  openDrawer(shift: Shift) {
    this.selectedShift = shift; this.isDrawerOpen = true;
    this.selectedRegistrations = []; this.isLoadingRegs = true;
    this.shiftService.getRegistrations(this.eventId, shift.id).subscribe({
      next: r => { this.selectedRegistrations = r; this.isLoadingRegs = false; this.cdr.detectChanges(); },
      error: () => { this.toast.error('Impossible de charger les inscrits.'); this.isLoadingRegs = false; }
    });
  }
  closeDrawer() { this.isDrawerOpen = false; this.selectedShift = null; this.registerMemberId = null; }

  openCreate(baseDate = '') {
    this.editingShift = null;
    const base = baseDate || new Date().toISOString().slice(0, 10);
    this.form = { label: '', start_time: `${base}T20:00`, end_time: `${base}T23:00`, capacity: 10 };
    this.isFormOpen = true;
  }
  openEdit(s: Shift) {
    this.editingShift = s;
    this.form = {
      label: s.label,
      start_time: s.start_time.replace(' ', 'T').slice(0, 16),
      end_time: s.end_time.replace(' ', 'T').slice(0, 16),
      capacity: s.capacity
    };
    this.isFormOpen = true;
  }
  saveForm() {
    const payload = { ...this.form, start_time: new Date(this.form.start_time).toISOString(), end_time: new Date(this.form.end_time).toISOString() };
    this.isSaving = true;
    const obs = this.editingShift
      ? this.shiftService.updateShift(this.eventId, this.editingShift.id, payload)
      : this.shiftService.createShift(this.eventId, payload);
    obs.subscribe({
      next: () => { this.toast.success(this.editingShift ? 'Créneau mis à jour.' : 'Créneau créé.'); this.isFormOpen = false; this.isSaving = false; this.load(); },
      error: () => { this.toast.error('Erreur lors de l\'enregistrement.'); this.isSaving = false; }
    });
  }
  deleteShift(s: Shift) {
    if (!confirm(`Supprimer "${s.label}" ?`)) return;
    this.shiftService.deleteShift(this.eventId, s.id).subscribe({
      next: () => { this.toast.success('Créneau supprimé.'); this.closeDrawer(); this.load(); },
      error: () => this.toast.error('Erreur suppression.')
    });
  }
  register() {
    if (!this.selectedShift || !this.registerMemberId) return;
    this.shiftService.register(this.eventId, this.selectedShift.id, this.registerMemberId).subscribe({
      next: () => { this.toast.success('Inscription réussie.'); this.registerMemberId = null; const s = this.selectedShift!; this.load(); this.openDrawer(s); },
      error: err => this.toast.error(err?.error?.message || 'Erreur d\'inscription.')
    });
  }
  unregister(memberId: number) {
    if (!this.selectedShift) return;
    this.shiftService.unregister(this.eventId, this.selectedShift.id, memberId).subscribe({
      next: () => { this.toast.success('Désinscrit.'); const s = this.selectedShift!; this.load(); this.openDrawer(s); },
      error: () => this.toast.error('Erreur désinscription.')
    });
  }

  formatTime(dt: string): string {
    const d = new Date(dt);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
  formatHour(h: number): string { return `${String(h).padStart(2,'0')}:00`; }
  colDateStr(d: Date): string { return d.toISOString().slice(0, 10); }
  fillLabel(rate: number): string { return rate >= 100 ? 'Complet' : rate >= 70 ? 'Presque plein' : 'Places disponibles'; }
}
