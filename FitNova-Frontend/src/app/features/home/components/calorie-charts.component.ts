import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { HomeService, CalorieChartData, WorkoutHistoryResponse } from '../home.service';

Chart.register(...registerables);

@Component({
  selector: 'app-calorie-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="charts-container">
      <div class="chart-header">
        <h2>Calorie Tracking</h2>
        <div class="period-selector">
          <button 
            *ngFor="let period of periods" 
            [class.active]="selectedPeriod() === period"
            (click)="selectPeriod(period)"
            class="period-btn">
            {{period}}d
          </button>
        </div>
      </div>
      
      <div class="chart-card glass-panel">
        <h3>Daily Calories</h3>
        <canvas #caloriesChart></canvas>
      </div>
    </div>
  `,
  styles: [`
    .charts-container {
      margin: 2rem 0;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .chart-header h2 {
      font-size: 1.8rem;
      font-weight: 600;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .period-selector {
      display: flex;
      gap: 0.5rem;
      background: var(--color-surface-hover);
      padding: 0.3rem;
      border-radius: 12px;
      backdrop-filter: blur(10px);
      border: 1px solid var(--color-border);
    }

    .period-btn {
      padding: 0.5rem 1rem;
      border: none;
      background: transparent;
      color: var(--color-text-secondary);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .period-btn:hover {
      background: var(--color-surface);
      color: var(--color-text-primary);
    }

    .period-btn.active {
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      color: white;
    }

    .chart-card {
      padding: 1.5rem;
      border-radius: 16px;
      min-height: 400px;
      display: flex;
      flex-direction: column;
    }

    .chart-card h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--color-text-primary);
    }

    canvas {
      flex: 1;
      max-height: 350px;
    }

    @media (max-width: 768px) {
      .chart-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }
      
      .chart-card {
        min-height: 350px;
      }
    }
  `]
})
export class CalorieChartsComponent implements OnInit {
  private homeService = inject(HomeService);
  
  selectedPeriod = signal(30);
  periods = [7, 14, 30];
  
  private caloriesChart?: Chart;

  ngOnInit() {
    this.loadData();
  }

  selectPeriod(days: number) {
    this.selectedPeriod.set(days);
    this.loadData();
  }

  private loadData() {
    // Load calorie chart data
    this.homeService.getCalorieChartData(this.selectedPeriod()).subscribe({
      next: (data) => {
        this.createCaloriesChart(data);
      },
      error: (err) => console.error('Error loading calorie data:', err)
    });
  }

  private createCaloriesChart(data: CalorieChartData) {
    const canvas = document.querySelector('canvas[id="caloriesChart"]') as HTMLCanvasElement;
    if (!canvas) {
      setTimeout(() => this.createCaloriesChart(data), 100);
      return;
    }

    if (this.caloriesChart) {
      this.caloriesChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: data.dates,
        datasets: [
          {
            label: 'Calories Consumed',
            data: data.consumed,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Calories Burned',
            data: data.burned,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim(),
              padding: 15,
              font: { size: 12 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim(),
              callback: (value) => Math.round(Number(value)) + ' kcal'
            },
            grid: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim()
            }
          },
          x: {
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim()
            },
            grid: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim()
            }
          }
        }
      }
    };

    this.caloriesChart = new Chart(canvas, config);
  }
}
