import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeService, WorkoutHistoryResponse } from '../home.service';
import { LucideAngularModule, Calendar, Flame, Clock, Dumbbell } from 'lucide-angular';

@Component({
  selector: 'app-workout-history',
  standalone: true,
  imports: [CommonModule, LucideAngularModule], 
  template: `
    <div class="workout-history-container">
      <div class="section-header">
        <h2>Recent Workouts</h2>
        <span class="workout-count">{{ workouts().length }} sessions</span>
      </div>

      <div class="workouts-list" *ngIf="workouts().length > 0; else noWorkouts">
        <div class="workout-card glass-panel" *ngFor="let workout of workouts()">
          <div class="workout-header">
            <div class="workout-title">
              <lucide-icon [img]="Dumbbell" [size]="20" class="workout-icon"></lucide-icon>
              <h3>{{ workout.name || 'Workout Session' }}</h3>
            </div>
            <span class="workout-date">
              <lucide-icon [img]="Calendar" [size]="16"></lucide-icon>
              {{ formatDate(workout.date) }}
            </span>
          </div>

          <div class="workout-details">
            <div class="detail-item">
              <lucide-icon [img]="Flame" [size]="16"></lucide-icon>
              <span>{{ workout.totalCaloriesBurned || 0 }} kcal</span>
            </div>
            <div class="detail-item">
              <lucide-icon [img]="Clock" [size]="16"></lucide-icon>
              <span>{{ workout.duration || 0 }} min</span>
            </div>
          </div>

          <div class="exercises-list" *ngIf="workout.exercises && workout.exercises.length > 0">
            <div class="exercise-item" *ngFor="let exercise of workout.exercises">
              <span class="exercise-name">{{ exercise.name }}</span>
              <span class="exercise-stats">{{ exercise.sets }} × {{ exercise.reps }}</span>
            </div>
          </div>
        </div>
      </div>

      <ng-template #noWorkouts>
        <div class="no-workouts glass-panel">
          <lucide-icon [img]="Dumbbell" [size]="48" class="no-data-icon"></lucide-icon>
          <p>No workout history yet</p>
          <span>Start logging workouts to see your progress here!</span>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .workout-history-container {
      margin: 2rem 0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      font-size: 1.8rem;
      font-weight: 600;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .workout-count {
      background: rgba(255, 255, 255, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
    }

    .workouts-list {
      display: grid;
      gap: 1rem;
      max-height: 600px;
      overflow-y: auto;
      padding-right: 0.5rem;
    }

    .workouts-list::-webkit-scrollbar {
      width: 6px;
    }

    .workouts-list::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
    }

    .workouts-list::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
    }

    .workout-card {
      padding: 1.5rem;
      border-radius: 12px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .workout-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .workout-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .workout-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .workout-icon {
      color: var(--color-primary);
    }

    .workout-title h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
    }

    .workout-date {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .workout-details {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .detail-item lucide-icon {
      color: var(--color-secondary);
    }

    .exercises-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .exercise-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      font-size: 0.9rem;
    }

    .exercise-name {
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
    }

    .exercise-stats {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.85rem;
    }

    .no-workouts {
      padding: 3rem;
      text-align: center;
      border-radius: 16px;
    }

    .no-data-icon {
      color: rgba(255, 255, 255, 0.3);
      margin-bottom: 1rem;
    }

    .no-workouts p {
      font-size: 1.1rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 0.5rem;
    }

    .no-workouts span {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.5);
    }

    @media (max-width: 768px) {
      .workout-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .workouts-list {
        max-height: 400px;
      }
    }
  `]
})
export class WorkoutHistoryComponent implements OnInit {
  private homeService = inject(HomeService);
  
  readonly Calendar = Calendar;
  readonly Flame = Flame;
  readonly Clock = Clock;
  readonly Dumbbell = Dumbbell;
  
  workouts = signal<any[]>([]);

  ngOnInit() {
    this.loadWorkoutHistory();
  }

  private loadWorkoutHistory() {
    this.homeService.getWorkoutHistory(30).subscribe({
      next: (response) => {
        // Show only the most recent 10 workouts
        this.workouts.set(response.workouts.slice(0, 10));
      },
      error: (err) => {
        console.error('Error loading workout history:', err);
        this.workouts.set([]);
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
}
