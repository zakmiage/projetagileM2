import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  ChartData,
  ChartOptions,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { RegistrationsByDay } from '../../../services/dashboard.service';

// Enregistrement des modules Chart.js nécessaires
Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

@Component({
  selector: 'app-chart-registrations',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './chart-registrations.component.html'
  // Pas de ChangeDetectionStrategy.OnPush ici : on a besoin du CD par défaut
  // pour que @ViewChild soit disponible au moment du ngOnChanges
})
export class ChartRegistrationsComponent implements OnChanges {
  @Input() data: RegistrationsByDay[] = [];
  @Input() capacity: number | null = null;
  @Input() eventId: number | null = null;

  @ViewChild(BaseChartDirective) chartDirective?: BaseChartDirective;

  chartData: ChartData<'bar'> = { labels: [], datasets: [] };
  chartOptions: ChartOptions<'bar'> = this.makeOptions(5);

  ngOnChanges(changes: SimpleChanges): void {
    this.buildChart();

    // Quand l'eventId change, on force la recréation complète du Chart
    // pour que les nouvelles options (en particulier max de l'axe Y) soient
    // correctement appliquées — ng2-charts fait Object.assign qui ne suffit pas
    if (changes['eventId'] && !changes['eventId'].isFirstChange()) {
      setTimeout(() => this.chartDirective?.render(), 0);
    }
  }

  private buildChart(): void {
    if (!this.data || this.data.length === 0) {
      this.chartData = { labels: [], datasets: [] };
      this.chartOptions = this.makeOptions(5);
      return;
    }

    const labels = this.data.map(d => d.date);
    const counts = this.data.map(d => d.count);

    // Axe Y basé uniquement sur les données réelles — PAS sur la capacité
    // Ex: 10 inscrits → yMax = ceil(10 × 1.25) = 13 (et non 500 ou 520)
    const dataMax = Math.max(...counts, 1);
    const yMax = Math.ceil(dataMax * 1.25);

    this.chartOptions = this.makeOptions(yMax);
    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Inscriptions',
          data: counts,
          backgroundColor: 'rgba(99, 102, 241, 0.75)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1.5,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(99, 102, 241, 0.9)'
        }
      ]
    };
  }

  private makeOptions(yMax: number): ChartOptions<'bar'> {
    const step = Math.max(1, Math.ceil(yMax / 6));
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#94a3b8',
          bodyColor: '#f1f5f9',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            title: (items) => {
              const raw = items[0]?.label ?? '';
              const parts = raw.split('-');
              return parts.length === 3
                ? `${parts[2]}/${parts[1]}/${parts[0]}`
                : raw;
            },
            label: (item) =>
              ` ${item.formattedValue} inscription${Number(item.raw) > 1 ? 's' : ''}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#94a3b8',
            font: { size: 11 },
            maxRotation: 45
          }
        },
        y: {
          beginAtZero: true,
          min: 0,
          max: yMax,
          grid: { color: '#f1f5f9' },
          ticks: {
            color: '#94a3b8',
            font: { size: 11 },
            stepSize: step,
            precision: 0
          }
        }
      }
    };
  }
}
