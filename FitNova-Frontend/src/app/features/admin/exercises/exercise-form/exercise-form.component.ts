import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminExerciseService, AdminExercise } from '../../services/admin-exercise.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-exercise-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './exercise-form.component.html',
  styleUrls: ['./exercise-form.component.css']
})
export class ExerciseFormComponent implements OnInit {
  exerciseForm: FormGroup;
  isEditMode = false;
  exerciseId: string | null = null;
  loading = false;
  submitting = false;
  error = '';

  bodyParts = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'abs', 'cardio', 'full-body'];
  equipments = ['barbell', 'dumbbell', 'machine', 'bodyweight', 'cable', 'resistance-band', 'none'];
  difficulties = ['beginner', 'intermediate', 'advanced'];

  constructor(
    private fb: FormBuilder,
    private adminExerciseService: AdminExerciseService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.exerciseForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      bodyPart: ['chest', Validators.required],
      equipment: ['none', Validators.required],
      targetMuscle: ['', Validators.maxLength(100)],
      difficulty: ['beginner', Validators.required],
      description: ['', Validators.maxLength(500)],
      instructions: this.fb.array([this.fb.control('', Validators.required)]),
      defaultSets: 3,
      defaultReps: 12,
      caloriesPerMinute: 5
    });
  }

  ngOnInit(): void {
    this.exerciseId = this.route.snapshot.paramMap.get('id');
    if (this.exerciseId) {
      this.isEditMode = true;
      this.loadExercise(this.exerciseId);
    }
  }

  get instructionsArray(): FormArray {
    return this.exerciseForm.get('instructions') as FormArray;
  }

  addInstruction(): void {
    this.instructionsArray.push(this.fb.control('', Validators.required));
  }

  removeInstruction(index: number): void {
    if (this.instructionsArray.length > 1) {
      this.instructionsArray.removeAt(index);
    }
  }

  loadExercise(id: string): void {
    this.loading = true;
    this.adminExerciseService.getExerciseById(id)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (exercise) => {
          // Clear default instruction
          while (this.instructionsArray.length !== 0) {
            this.instructionsArray.removeAt(0);
          }
          
          // Add instructions from api
          if (exercise.instructions && exercise.instructions.length > 0) {
            exercise.instructions.forEach(inst => {
              this.instructionsArray.push(this.fb.control(inst, Validators.required));
            });
          } else {
            this.addInstruction();
          }

          this.exerciseForm.patchValue({
            name: exercise.name,
            bodyPart: exercise.bodyPart,
            equipment: exercise.equipment,
            targetMuscle: exercise.targetMuscle || '',
            difficulty: exercise.difficulty,
            description: exercise.description || '',
            defaultSets: exercise.defaultSets || 3,
            defaultReps: exercise.defaultReps || 12,
            caloriesPerMinute: exercise.caloriesPerMinute || 5
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Failed to load exercise details';
          this.cdr.detectChanges();
        }
      });
  }

  onSubmit(): void {
    if (this.exerciseForm.invalid) {
      this.markFormGroupTouched(this.exerciseForm);
      return;
    }

    this.submitting = true;
    this.error = '';

    const exerciseData = this.exerciseForm.value;

    const request$ = this.isEditMode
      ? this.adminExerciseService.updateExercise(this.exerciseId!, exerciseData)
      : this.adminExerciseService.createExercise(exerciseData);

    request$.pipe(finalize(() => {
        this.submitting = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/exercises']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save exercise';
          this.cdr.detectChanges();
        }
      });
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.exerciseForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
