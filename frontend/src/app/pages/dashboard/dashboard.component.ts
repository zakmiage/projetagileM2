import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, NextEventStats } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  stats: NextEventStats | null = null;
  isLoading = true;
  errorMsg = '';

  ngOnInit(): void {
    this.dashboardService.getNextEventStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Impossible de charger les statistiques du prochain événement.';
        this.isLoading = false;
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
}
