import { Component, OnInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LineChart, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-angular';
import { TrackerService } from '../../../../services/tracker.service';
import { AuthService } from '../../../auth/auth.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartData } from 'chart.js';

interface ProgressData {
  date: string;
  weight: number;
  calories: number;
  displayDate: string;
}

@Component({
  selector: 'app-progress-charts',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './progress-charts.component.html',
  styleUrls: ['./progress-charts.component.css']
})
export class ProgressChartsComponent implements OnInit {
  private trackerService = inject(TrackerService);
  private authService = inject(AuthService);
  
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  readonly LineChart = LineChart;
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Minus = Minus;
  readonly BarChart3 = BarChart3;

  allChartData = signal<ProgressData[]>([]);
  weightTimeframe = signal<number>(30);
  calorieTimeframe = signal<number>(14);
  
  weightFilteredData = computed(() => {
    const data = this.allChartData();
    return data.slice(-this.weightTimeframe());
  });
  
  calorieFilteredData = computed(() => {
    const data = this.allChartData();
    return data.slice(-this.calorieTimeframe());
  });
  
  startingWeight = computed(() => {
    const data = this.weightFilteredData();
    return data.length > 0 ? data[0].weight : 0;
  });
  
  currentWeight = computed(() => {
    const data = this.weightFilteredData();
    return data.length > 0 ? data[data.length - 1].weight : 0;
  });
  
  weightChange = computed(() => 
    Math.round((this.currentWeight() - this.startingWeight()) * 10) / 10
  );
  
  startingDate = computed(() => {
    const data = this.weightFilteredData();
    return data.length > 0 ? data[0].displayDate : '';
  });
  
  currentDate = computed(() => {
    const data = this.weightFilteredData();
    return data.length > 0 ? data[data.length - 1].displayDate : '';
  });

  targetWeight = computed(() => this.authService.currentUser()?.targetWeight || 0);

  // --- Chart Setup ---

  weightChartData = computed<ChartData<'line'>>(() => {
    const data = this.weightFilteredData();
    return {
      labels: data.map(d => d.displayDate),
      datasets: [
        {
          data: data.map(d => d.weight),
          label: 'Weight (kg)',
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#3b82f6',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.3,
          borderWidth: 3
        }
      ]
    };
  });

  weightChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        titleFont: { size: 13 },
        bodyFont: { size: 14, weight: 'bold' }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { maxTicksLimit: 8, font: { size: 11 }, color: '#64748b' }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        border: { display: false },
        ticks: { font: { size: 11 }, color: '#64748b' }
      }
    }
  };

  caloriesChartData = computed<ChartData<'bar'>>(() => {
    const data = this.calorieFilteredData();
    return {
      labels: data.map(d => d.displayDate),
      datasets: [
        {
          data: data.map(d => d.calories),
          label: 'Calories',
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return '#f093fb';
            let gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, '#f5576c');
            gradient.addColorStop(1, '#f093fb');
            return gradient as any;
          },
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.8
        }
      ]
    };
  });

  caloriesChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        titleFont: { size: 13 },
        bodyFont: { size: 14, weight: 'bold' }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { size: 10 }, color: '#64748b' }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        border: { display: false },
        ticks: { font: { size: 11 }, color: '#64748b' },
        beginAtZero: true
      }
    }
  };

  ngOnInit() {
      this.trackerService.getHistory(90).subscribe(history => {
          if (history && history.length > 0) {
              const data = history.map(h => ({
                  date: h.date,
                  weight: h.weight,
                  calories: Math.round(h.caloriesConsumed || 0),
                  displayDate: this.formatDate(h.date)
              }));
              
              this.allChartData.set(data);
          }
      });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  }
}