import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminFoodService, AdminFood } from '../../services/admin-food.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-food-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './food-form.component.html',
  styleUrls: ['./food-form.component.css']
})
export class FoodFormComponent implements OnInit {
  foodForm: FormGroup;
  isEditMode = false;
  foodId: string | null = null;
  loading = false;
  submitting = false;
  error = '';

  categories = [
    'protein', 'carbs', 'vegetables', 'fruits', 
    'dairy', 'fats', 'snacks', 'beverages', 'grains'
  ];

  servingUnits = [
    'g', 'ml', 'cup', 'piece', 'tbsp', 'tsp', 
    'oz', 'glass', 'pack', 'scoop', 'serving'
  ];

  apiSources = [
    'USDA', 'Spoonacular', 'OpenFoodFacts', 'manual', 'user', 'Curated (Indian)'
  ];

  constructor(
    private fb: FormBuilder,
    private adminFoodService: AdminFoodService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.foodForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      category: ['protein', Validators.required],
      description: ['', Validators.maxLength(500)],
      isVegetarian: [true],
      calories: [0, [Validators.required, Validators.min(0)]],
      protein: [0, [Validators.required, Validators.min(0)]],
      carbs: [0, [Validators.required, Validators.min(0)]],
      fat: [0, [Validators.required, Validators.min(0)]],
      fiber: [0, [Validators.min(0)]],
      servingSize: [100, [Validators.required, Validators.min(1)]],
      servingUnit: ['g', Validators.required],
      verified: [true],
      apiSource: ['manual']
    });
  }

  ngOnInit(): void {
    this.foodId = this.route.snapshot.paramMap.get('id');
    if (this.foodId) {
      this.isEditMode = true;
      this.loadFood(this.foodId);
    }
  }

  loadFood(id: string): void {
    this.loading = true;
    this.adminFoodService.getFoodById(id)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (food) => {
          this.foodForm.patchValue({
            name: food.name,
            category: food.category,
            description: food.description,
            isVegetarian: food.isVegetarian,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            fiber: food.fiber,
            servingSize: food.servingSize,
            servingUnit: food.servingUnit,
            verified: food.verified,
            apiSource: food.apiSource || 'manual'
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Failed to load food details';
          this.cdr.detectChanges();
        }
      });
  }

  onSubmit(): void {
    if (this.foodForm.invalid) {
      this.markFormGroupTouched(this.foodForm);
      return;
    }

    this.submitting = true;
    this.error = '';

    const foodData = this.foodForm.value;

    const request$ = this.isEditMode
      ? this.adminFoodService.updateFood(this.foodId!, foodData)
      : this.adminFoodService.createFood(foodData);

    request$.pipe(finalize(() => {
        this.submitting = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/foods']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save food';
          this.cdr.detectChanges();
        }
      });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.foodForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
