import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, DietPlan } from '../services/admin.service';
import { LucideAngularModule, Plus, Edit, Trash2, X, Utensils, Flame } from 'lucide-angular';

@Component({
  selector: 'app-diets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="diets-container fade-in">
      <div class="flex-between mb-lg">
        <div>
          <h2>Diet Plans</h2>
          <p>Manage nutrition plans</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <lucide-icon name="plus" [size]="18"></lucide-icon> Add Plan
        </button>
      </div>

      <div class="grid grid-3" *ngIf="dietPlans$ | async as dietPlans">
        <div class="card glass-panel hover-lift flex-column" *ngFor="let plan of dietPlans">
          <div class="flex-between mb-md">
            <div class="icon-bg bg-diet">
              <lucide-icon name="utensils" [size]="20" class="text-white"></lucide-icon>
            </div>
            <div class="flex-center gap-xs text-secondary font-medium">
               <lucide-icon name="flame" [size]="16" class="text-primary"></lucide-icon>
               {{ plan.calories }} kcal
            </div>
          </div>
          
          <h4 class="mb-md">{{ plan.name }}</h4>
          
          <div class="macros-grid mb-lg">
             <div class="macro-item">
               <span class="label">Prot</span>
               <span class="value">{{ plan.protein }}g</span>
             </div>
             <div class="macro-item">
               <span class="label">Carb</span>
               <span class="value">{{ plan.carbs }}g</span>
             </div>
             <div class="macro-item">
               <span class="label">Fat</span>
               <span class="value">{{ plan.fat }}g</span>
             </div>
          </div>

          <div class="flex gap-sm mt-auto">
            <button class="btn btn-secondary w-full" (click)="editPlan(plan)">Edit</button>
            <button class="btn btn-secondary btn-icon text-danger" (click)="deletePlan(plan._id)">
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
          <h3 class="m-0">{{ isEditing ? 'Edit Plan' : 'Add Plan' }}</h3>
          <button class="btn-icon" (click)="closeModal()"><lucide-icon name="x" [size]="24"></lucide-icon></button>
        </div>
        
        <form [formGroup]="dietForm" (ngSubmit)="onSubmit()">
          <div class="form-group mb-md">
            <label class="form-label">Plan Name</label>
            <input type="text" formControlName="name" class="form-input w-full" placeholder="e.g. Keto Shred">
          </div>
          
          <div class="grid grid-2 mb-md">
            <div class="form-group">
              <label class="form-label">Calories</label>
              <input type="number" formControlName="calories" class="form-input w-full">
            </div>
          </div>
          
          <div class="grid grid-3 mb-lg">
            <div class="form-group">
              <label class="form-label">Protein (g)</label>
              <input type="number" formControlName="protein" class="form-input w-full">
            </div>
            <div class="form-group">
              <label class="form-label">Carbs (g)</label>
              <input type="number" formControlName="carbs" class="form-input w-full">
            </div>
            <div class="form-group">
              <label class="form-label">Fat (g)</label>
              <input type="number" formControlName="fat" class="form-input w-full">
            </div>
          </div>

          <div class="flex justify-end gap-md">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="dietForm.invalid">Save</button>
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
    .text-primary { color: var(--color-primary); }
    .mt-auto { margin-top: auto; }

    .macros-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
      background: var(--color-surface-hover); padding: 8px; border-radius: var(--radius-md);
    }
    .macro-item { display: flex; flex-direction: column; align-items: center; }
    .macro-item .label { font-size: 10px; text-transform: uppercase; color: var(--color-text-secondary); }
    .macro-item .value { font-weight: bold; font-size: 14px; }

    /* Reuse modal styles from Workouts or global */
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
export class DietsComponent implements OnInit {
  dietPlans$: Observable<DietPlan[]> | undefined;
  showModal = false;
  isEditing = false;
  dietForm: FormGroup;

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.dietForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      calories: [2000, [Validators.required, Validators.min(1)]],
      protein: [150, [Validators.required, Validators.min(0)]],
      carbs: [200, [Validators.required, Validators.min(0)]],
      fat: [60, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.dietPlans$ = this.adminService.getDietPlans();
  }

  openModal() {
    this.isEditing = false;
    this.dietForm.reset({ calories: 2000, protein: 150, carbs: 200, fat: 60 });
    this.showModal = true;
  }

  editPlan(plan: DietPlan) {
    this.isEditing = true;
    this.dietForm.patchValue({
      id: plan._id,
      name: plan.name,
      calories: plan.calories,
      protein: plan.protein,
      carbs: plan.carbs,
      fat: plan.fat
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onSubmit() {
    if (this.dietForm.valid) {
      const plan = this.dietForm.value;
      this.adminService.saveDietPlan(plan).subscribe(() => {
        this.loadPlans();
        this.closeModal();
      });
    }
  }

  deletePlan(id: string) {
    if(confirm('Delete this diet plan?')) {
      this.adminService.deleteDietPlan(id).subscribe(() => this.loadPlans());
    }
  }
}
