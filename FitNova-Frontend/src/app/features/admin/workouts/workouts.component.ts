import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, Workout } from '../services/admin.service';
import { LucideAngularModule, Plus, Edit, Trash2, X, Dumbbell } from 'lucide-angular';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="workouts-container fade-in">
      <div class="flex-between mb-lg">
        <div>
          <h2>Workouts</h2>
          <p>Manage workout library</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <lucide-icon name="plus" [size]="18"></lucide-icon> Add Workout
        </button>
      </div>

      <div class="grid grid-3" *ngIf="workouts$ | async as workouts">
        <div class="card glass-panel hover-lift flex-column" *ngFor="let workout of workouts">
          <div class="flex-between mb-md">
            <div class="icon-bg bg-workout">
              <lucide-icon name="dumbbell" [size]="20" class="text-white"></lucide-icon>
            </div>
            <div class="badge" [ngClass]="getDifficultyClass(workout.difficulty)">{{ workout.difficulty }}</div>
          </div>
          
          <h4 class="mb-xs">{{ workout.name }}</h4>
          <div class="flex-between text-secondary text-sm mb-lg">
            <span>{{ workout.duration }} mins</span>
            <span>{{ workout.calories }} kcal</span>
          </div>

          <div class="flex gap-sm mt-auto">
            <button class="btn btn-secondary w-full" (click)="editWorkout(workout)">Edit</button>
            <button class="btn btn-secondary btn-icon text-danger" (click)="deleteWorkout(workout._id)">
               <lucide-icon name="trash-2" [size]="18"></lucide-icon>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-backdrop" *ngIf="showModal">
      <div class="modal card glass-panel scale-in">
        <div class="modal-header flex-between mb-lg">
          <h3 class="m-0">{{ isEditing ? 'Edit Workout' : 'Add Workout' }}</h3>
          <button class="btn-icon" (click)="closeModal()"><lucide-icon name="x" [size]="24"></lucide-icon></button>
        </div>
        
        <form [formGroup]="workoutForm" (ngSubmit)="onSubmit()">
          <div class="form-group mb-md">
            <label class="form-label">Name</label>
            <input type="text" formControlName="name" class="form-input w-full" placeholder="e.g. HIIT Blast">
          </div>
          
          <div class="form-group mb-md">
            <label class="form-label">Difficulty</label>
            <select formControlName="difficulty" class="form-input w-full">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          
          <div class="grid grid-2 mb-lg">
            <div class="form-group">
              <label class="form-label">Duration (mins)</label>
              <input type="number" formControlName="duration" class="form-input w-full">
            </div>
            <div class="form-group">
              <label class="form-label">Calories</label>
              <input type="number" formControlName="calories" class="form-input w-full">
            </div>
          </div>

          <div class="flex justify-end gap-md">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="workoutForm.invalid">Save</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .icon-bg {
      width: 40px; height: 40px; border-radius: var(--radius-lg);
      display: flex; align-items: center; justify-content: center;
    }
    .text-white { color: white; }
    .mb-xs { margin-bottom: var(--space-xs); }
    .mt-auto { margin-top: auto; }
    
    .badge { padding: 4px 8px; border-radius: var(--radius-md); font-size: var(--font-size-xs); }
    .badge-beginner { background: var(--color-success-bg); color: var(--color-success); }
    .badge-intermediate { background: var(--color-warning-bg); color: var(--color-warning); }
    .badge-advanced { background: var(--color-danger-bg); color: var(--color-danger); }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
      z-index: 100; display: flex; align-items: center; justify-content: center;
    }
    .modal { width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    
    .form-group { display: flex; flex-direction: column; gap: var(--space-xs); }
    .form-label { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-text-secondary); }
    .form-input {
      background: var(--color-background); border: 1px solid var(--color-border);
      color: var(--color-text-primary); padding: 0.75rem; border-radius: var(--radius-md);
    }
    .form-input:focus { outline: 2px solid var(--color-primary); border-color: transparent; }
  `]
})
export class WorkoutsComponent implements OnInit {
  workouts$: Observable<Workout[]> | undefined;
  showModal = false;
  isEditing = false;
  workoutForm: FormGroup;

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.workoutForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      difficulty: ['Beginner', Validators.required],
      duration: [30, [Validators.required, Validators.min(1)]],
      calories: [100, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.loadWorkouts();
  }

  loadWorkouts() {
    this.workouts$ = this.adminService.getWorkouts();
  }

  getDifficultyClass(diff: string) {
    return {
      'badge-beginner': diff === 'Beginner',
      'badge-intermediate': diff === 'Intermediate',
      'badge-advanced': diff === 'Advanced'
    };
  }

  openModal() {
    this.isEditing = false;
    this.workoutForm.reset({ difficulty: 'Beginner', duration: 30, calories: 100 });
    this.showModal = true;
  }

  editWorkout(workout: Workout) {
    this.isEditing = true;
    this.workoutForm.patchValue({
      id: workout._id,
      name: workout.name,
      difficulty: workout.difficulty,
      duration: workout.duration,
      calories: workout.calories
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onSubmit() {
    if (this.workoutForm.valid) {
      const workout = this.workoutForm.value;
      this.adminService.saveWorkout(workout).subscribe(() => {
        this.loadWorkouts();
        this.closeModal();
      });
    }
  }

  deleteWorkout(id: string) {
    if(confirm('Delete this workout?')) {
      this.adminService.deleteWorkout(id).subscribe(() => this.loadWorkouts());
    }
  }
}
