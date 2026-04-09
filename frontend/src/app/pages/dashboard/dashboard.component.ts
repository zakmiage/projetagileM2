import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService, NextEventStats, EventSummary } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  // Liste de tous les événements
  events: EventSummary[] = [];

  // ID de l'événement sélectionné
  selectedEventId: number | null = null;

  // Stats de l'événement sélectionné
  stats: NextEventStats | null = null;

  isLoading = true;
  isStatsLoading = false;
  errorMsg = '';

  ngOnInit(): void {
    // 1. Charger tous les événements
    this.dashboardService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;

        // 2. Trouver le prochain événement futur (date la plus proche dans le futur)
        const now = new Date();
        const futureEvents = events.filter(e => new Date(e.start_date) > now);

        let defaultEvent: EventSummary | null = null;
        if (futureEvents.length > 0) {
          // Prendre le plus proche dans le futur (trié ASC → dernier élément du tableau trié DESC inversé)
          defaultEvent = futureEvents[futureEvents.length - 1];
        } else if (events.length > 0) {
          // Fallback : le plus récent (premier du tableau trié DESC)
          defaultEvent = events[0];
        }

        if (defaultEvent) {
          this.selectedEventId = defaultEvent.id;
          this.loadStats(defaultEvent.id);
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Impossible de charger la liste des événements.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Appelé quand l'utilisateur change l'événement dans le sélecteur */
  onEventChange(eventId: number): void {
    this.selectedEventId = eventId;
    this.loadStats(eventId);
  }

  /** Charge les stats pour un eventId donné */
  private loadStats(eventId: number): void {
    this.isStatsLoading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.dashboardService.getEventStats(eventId).subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        this.isStatsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Impossible de charger les statistiques de cet événement.';
        this.isLoading = false;
        this.isStatsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Convertit l'objet tShirtSizes en tableau trié pour *ngFor */
  get tShirtSizesEntries(): { size: string; count: number }[] {
    if (!this.stats?.kpis?.tShirtSizes) return [];
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Non renseignée'];
    const sizes = this.stats.kpis.tShirtSizes;
    return Object.keys(sizes)
      .sort((a, b) => {
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      })
      .map(size => ({ size, count: sizes[size] }));
  }

  /** Retourne l'objet EventSummary de l'event sélectionné */
  get selectedEvent(): EventSummary | null {
    return this.events.find(e => e.id === this.selectedEventId) ?? null;
  }

  /** Vérifie si l'event sélectionné est dans le futur */
  get isUpcomingEvent(): boolean {
    if (!this.selectedEvent) return false;
    return new Date(this.selectedEvent.start_date) > new Date();
  }
}
