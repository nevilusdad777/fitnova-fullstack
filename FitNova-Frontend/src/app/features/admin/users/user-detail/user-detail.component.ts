import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminUserService, User, AdminUserRoutine, AdminUserWorkout, AdminUserDiet } from '../../services/admin-user.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  userForm: FormGroup;
  userId: string | null = null;
  loading = false;
  submitting = false;
  isEditing = false;
  error = '';
  successMessage = '';
  
  // Stored for dynamic recalculation
  activityLevel = 1.2;

  // Activity Data
  workoutHistory: AdminUserWorkout[] = [];
  dietLogs: AdminUserDiet[] = [];
  
  loadingWorkouts = false;
  loadingDiet = false;

  workoutDays = 7;
  dietDays = 7;

  genders = ['male', 'female', 'other'];
  goals = ['gain', 'loss', 'maintain'];

  constructor(
    private fb: FormBuilder,
    private adminUserService: AdminUserService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      name: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(100)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      age: [{ value: null, disabled: true }, [Validators.required, Validators.min(1), Validators.max(120)]],
      gender: [{ value: 'male', disabled: true }, Validators.required],
      height: [{ value: null, disabled: true }, [Validators.required, Validators.min(50)]],
      weight: [{ value: null, disabled: true }, [Validators.required, Validators.min(20)]],
      goal: [{ value: 'maintain', disabled: true }, Validators.required],
      bmr: [{ value: null, disabled: true }],
      tdee: [{ value: null, disabled: true }]
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    const editableFields = ['name', 'email', 'age', 'gender', 'height', 'weight', 'goal'];
    
    if (this.isEditing) {
      editableFields.forEach(field => this.userForm.get(field)?.enable());
    } else {
      editableFields.forEach(field => this.userForm.get(field)?.disable());
      // Optionally reload the user data to discard unsaved changes when canceling edit mode:
      if (this.userId) {
        this.loadUser(this.userId);
      }
    }
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadUser(this.userId);
      this.loadUserActivity(this.userId);
    } else {
      this.error = 'Invalid user ID setup.';
    }

    // Subscribe to form changes for live BMR/TDEE recalculation
    this.userForm.valueChanges.subscribe(values => {
      this.recalculateMetrics(values);
    });
  }

  recalculateMetrics(values: any): void {
    const { weight, height, age, gender } = values;
    if (weight && height && age && gender) {
      let bmr = 0;
      if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }
      const tdee = bmr * this.activityLevel;
      
      this.userForm.patchValue({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee)
      }, { emitEvent: false });
    }
  }

  loadUserActivity(id: string): void {
    this.loadWorkouts(id);
    this.loadDietLogs(id);
  }


  loadWorkouts(id: string): void {
    this.loadingWorkouts = true;
    this.adminUserService.getUserWorkoutHistory(id, this.workoutDays)
      .pipe(finalize(() => { this.loadingWorkouts = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (workouts) => { this.workoutHistory = workouts; },
        error: (err) => { console.error('Failed to load workouts', err); }
      });
  }

  loadDietLogs(id: string): void {
    this.loadingDiet = true;
    this.adminUserService.getUserDiet(id, this.dietDays)
      .pipe(finalize(() => { this.loadingDiet = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (diets) => { this.dietLogs = diets; },
        error: (err) => { console.error('Failed to load diet logs', err); }
      });
  }

  onWorkoutDaysChange(event: Event): void {
    this.workoutDays = parseInt((event.target as HTMLSelectElement).value, 10);
    if (this.userId) {
      this.loadWorkouts(this.userId);
    }
  }

  onDietDaysChange(event: Event): void {
    this.dietDays = parseInt((event.target as HTMLSelectElement).value, 10);
    if (this.userId) {
      this.loadDietLogs(this.userId);
    }
  }

  deleteWorkout(workoutId: string): void {
    if (!this.userId) return;
    
    if (confirm('Are you sure you want to delete this workout record? This action cannot be undone.')) {
      this.adminUserService.deleteUserWorkout(this.userId, workoutId)
        .subscribe({
          next: () => {
            this.successMessage = 'Workout deleted successfully.';
            this.loadWorkouts(this.userId!);
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (err) => {
            this.error = err.error?.message || 'Failed to delete workout.';
            this.cdr.detectChanges();
          }
        });
    }
  }

  deleteDiet(date: string): void {
    if (!this.userId) return;
    
    if (confirm(`Are you sure you want to delete all diet logs for ${date}? This action cannot be undone.`)) {
      this.adminUserService.deleteUserDiet(this.userId, date)
        .subscribe({
          next: () => {
            this.successMessage = 'Diet logs deleted successfully.';
            this.loadDietLogs(this.userId!);
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (err) => {
            this.error = err.error?.message || 'Failed to delete diet logs.';
            this.cdr.detectChanges();
          }
        });
    }
  }

  loadUser(id: string): void {
    this.loading = true;
    this.adminUserService.getUserById(id)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (user) => {
          this.activityLevel = user.activityLevel || 1.2;
          this.userForm.patchValue({
            name: user.name,
            email: user.email,
            age: user.age,
            gender: user.gender,
            height: user.height,
            weight: user.weight,
            goal: user.goal,
            bmr: user.bmr ? Math.round(user.bmr) : null,
            tdee: user.tdee ? Math.round(user.tdee) : null
          }, { emitEvent: false });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Failed to load user details';
          this.cdr.detectChanges();
        }
      });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.submitting = true;
    this.error = '';
    this.successMessage = '';

    const userData = this.userForm.value;

    this.adminUserService.updateUser(this.userId!, userData)
      .pipe(finalize(() => {
        this.submitting = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'User updated successfully.';
          this.isEditing = false;
          const editableFields = ['name', 'email', 'age', 'gender', 'height', 'weight', 'goal'];
          editableFields.forEach(field => this.userForm.get(field)?.disable());
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to update user';
          this.cdr.detectChanges();
        }
      });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.userForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
