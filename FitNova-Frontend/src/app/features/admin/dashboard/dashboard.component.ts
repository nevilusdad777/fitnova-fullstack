import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStatsService, DashboardStats } from '../services/admin-stats.service';
import { finalize } from 'rxjs/operators';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  error = '';

  // Chart Properties
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      }
    }
  };

  public goalChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#48bb78', '#ed8936', '#4299e1'], // Green, Orange, Blue
      hoverBackgroundColor: ['#38a169', '#dd6b20', '#3182ce'],
    }]
  };

  public genderChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#4299e1', '#ed64a6', '#a0aec0'], // Blue, Pink, Gray
      hoverBackgroundColor: ['#3182ce', '#d53f8c', '#718096'],
    }]
  };

  constructor(
    private adminStatsService: AdminStatsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.loading = true;
    this.error = '';

    this.adminStatsService.getDashboardStats()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
          console.log('Dashboard stats loaded, loading:', this.loading);
        })
      )
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.updateCharts();
          this.cdr.detectChanges();
          console.log('Dashboard stats:', data);
        },
        error: (err) => {
          this.error = 'Failed to load dashboard statistics';
          this.cdr.detectChanges();
          console.error('Dashboard stats error:', err);
        }
      });
  }

  updateCharts(): void {
    if (!this.stats?.userStats) return;

    // Update Goal Chart
    const goalEntries = Object.entries(this.stats.userStats.goalDistribution);
    this.goalChartData = {
      ...this.goalChartData,
      labels: goalEntries.map(([name]) => this.capitalizeFirst(name)),
      datasets: [{
        ...this.goalChartData.datasets[0],
        data: goalEntries.map(([, count]) => count)
      }]
    };

    // Update Gender Chart
    const genderEntries = Object.entries(this.stats.userStats.genderDistribution);
    
    // Define colors based on gender
    const backgroundColors = genderEntries.map(([name]) => {
      const lowerName = name.toLowerCase();
      if (lowerName === 'male') return '#4299e1'; // Blue
      if (lowerName === 'female') return '#ed64a6'; // Pink
      return '#a0aec0'; // Gray for others
    });

    const hoverBackgroundColors = genderEntries.map(([name]) => {
      const lowerName = name.toLowerCase();
      if (lowerName === 'male') return '#3182ce';
      if (lowerName === 'female') return '#d53f8c';
      return '#718096';
    });

    this.genderChartData = {
      ...this.genderChartData,
      labels: genderEntries.map(([name]) => this.capitalizeFirst(name)),
      datasets: [{
        ...this.genderChartData.datasets[0],
        data: genderEntries.map(([, count]) => count),
        backgroundColor: backgroundColors,
        hoverBackgroundColor: hoverBackgroundColors
      }]
    };
  }

  getGoalArray(): { name: string, count: number }[] {
    if (!this.stats?.userStats?.goalDistribution) return [];
    return Object.entries(this.stats.userStats.goalDistribution).map(([name, count]) => ({
      name: this.capitalizeFirst(name),
      count
    }));
  }

  getGenderArray(): { name: string, count: number }[] {
    if (!this.stats?.userStats?.genderDistribution) return [];
    return Object.entries(this.stats.userStats.genderDistribution).map(([name, count]) => ({
      name: this.capitalizeFirst(name),
      count
    }));
  }

  capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getLegendColor(chartData: ChartData<'pie', number[], string | string[]>, index: number): string {
    const backgroundColor = chartData.datasets[0].backgroundColor;
    if (Array.isArray(backgroundColor)) {
      return backgroundColor[index] as string;
    }
    return typeof backgroundColor === 'string' ? backgroundColor : '#cbd5e0';
  }
}
