import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService, DashboardStats } from '../services/admin.service';
import { LucideAngularModule, Users, Dumbbell, Utensils, TrendingUp } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, LucideAngularModule],
  template: `
    <div class="dashboard-container fade-in" *ngIf="stats$ | async as stats">
      <h2 class="mb-lg font-heading">Dashboard Overview</h2>

      <!-- Stats Grid -->
      <div class="grid admin-grid mb-2xl">
        <div class="card card-metric glass-panel hover-lift">
          <div class="flex-between mb-sm">
            <h5 class="text-secondary uppercase tracking-wide text-xs m-0">Total Users</h5>
            <div class="icon-bg bg-primary-light">
              <lucide-icon name="users" [size]="20" class="text-white"></lucide-icon>
            </div>
          </div>
          
          <div class="flex-between items-center mt-sm">
             <h3 class="m-0 font-heading text-2xl">{{ stats.totalUsers || 0 }}</h3>
             <span class="badge-soft badge-soft-success">
              <lucide-icon name="trending-up" [size]="14"></lucide-icon> +12%
            </span>
          </div>
        </div>

        <div class="card card-metric glass-panel hover-lift">
          <div class="flex-between mb-sm">
            <h5 class="text-secondary uppercase tracking-wide text-xs m-0">Active Workouts</h5>
            <div class="icon-bg bg-workout">
              <lucide-icon name="dumbbell" [size]="20" class="text-white"></lucide-icon>
            </div>
          </div>
          <div class="flex-between items-center mt-sm">
             <h3 class="m-0 font-heading text-2xl">{{ stats.activeWorkouts || 0 }}</h3>
             <span class="badge-soft badge-soft-success">
              <lucide-icon name="trending-up" [size]="14"></lucide-icon> +5%
            </span>
          </div>
        </div>

        <div class="card card-metric glass-panel hover-lift">
          <div class="flex-between mb-sm">
            <h5 class="text-secondary uppercase tracking-wide text-xs m-0">Diet Plans</h5>
            <div class="icon-bg bg-diet">
              <lucide-icon name="utensils" [size]="20" class="text-white"></lucide-icon>
            </div>
          </div>
          <div class="flex-between items-center mt-sm">
             <h3 class="m-0 font-heading text-2xl">{{ stats.totalDietPlans || 0 }}</h3>
             <span class="badge-soft badge-soft-neutral">Stable</span>
          </div>
        </div>

        <div class="card card-metric glass-panel hover-lift">
          <div class="flex-between mb-sm">
            <h5 class="text-secondary uppercase tracking-wide text-xs m-0">Revenue</h5>
            <div class="icon-bg bg-gradient-electric">
              <span class="text-white font-bold">$</span>
            </div>
          </div>
          <div class="flex-between items-center mt-sm">
             <h3 class="m-0 font-heading text-2xl">{{ stats.revenue | currency }}</h3>
             <span class="badge-soft badge-soft-success">
              <lucide-icon name="trending-up" [size]="14"></lucide-icon> +8%
            </span>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-2">
        <div class="card glass-panel">
          <div class="card-header">
            <h4 class="card-title">User Growth</h4>
          </div>
          <div class="chart-wrapper">
             <canvas baseChart
              [data]="barChartData"
              [options]="barChartOptions"
              [type]="'bar'">
            </canvas>
          </div>
        </div>

        <div class="card glass-panel">
          <div class="card-header">
            <h4 class="card-title">Workout Categories</h4>
          </div>
          <div class="chart-wrapper">
            <canvas baseChart
              [data]="doughnutChartData"
              [options]="doughnutChartOptions"
              [type]="'doughnut'">
            </canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding-bottom: var(--space-2xl);
    }
    
    .icon-bg {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bg-primary-light {
      background: var(--color-primary);
    }

    .m-0 {
      margin: 0;
    }

    .mb-lg {
      margin-bottom: var(--space-lg);
    }

    .mb-2xl {
      margin-bottom: var(--space-2xl);
    }

    .text-sm {
      font-size: var(--font-size-sm);
    }

    .text-white {
      color: white;
    }
    
    .chart-wrapper {
      position: relative;
      height: 300px;
      width: 100%;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats$: Observable<DashboardStats | null> | undefined;

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#94a3b8' } } // text-muted color
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } }
    }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      { data: [65, 59, 80, 81, 56, 55, 40], label: 'Active Users', backgroundColor: '#4A90E2', borderRadius: 5 },
      { data: [28, 48, 40, 19, 86, 27, 90], label: 'New Signups', backgroundColor: '#8DC63F', borderRadius: 5 }
    ]
  };

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8' } }
    }
  };

  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Strength', 'Cardio', 'Yoga', 'HIIT'],
    datasets: [
      { data: [350, 450, 100, 200], backgroundColor: ['#4A90E2', '#EF4444', '#8DC63F', '#F59E0B'], borderWidth: 0 }
    ]
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.stats$ = this.adminService.getStats().pipe(
      catchError(err => {
        console.error('Failed to load stats', err);
        return of(null);
      })
    );
  }
}
