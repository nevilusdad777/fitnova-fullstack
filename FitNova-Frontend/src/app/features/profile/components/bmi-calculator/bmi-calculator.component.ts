import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, Calculator, TrendingUp } from 'lucide-angular';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';

interface BMIResult {
  value: number;
  category: string;
  color: string;
  description: string;
  healthyRange: string;
}

@Component({
  selector: 'app-bmi-calculator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    CardComponent,
    BadgeComponent
  ],
  templateUrl: './bmi-calculator.component.html',
  styleUrls: ['./bmi-calculator.component.css']
})
export class BmiCalculatorComponent {
  readonly Calculator = Calculator;
  readonly TrendingUp = TrendingUp;

  bmiForm!: FormGroup;
bmiResult = signal<BMIResult | null>(null);
unitSystem = signal<'Metric' | 'Imperial'>('Metric');
bmiProgress = computed(() => {
const result = this.bmiResult();
if (!result) return 0;
// Map BMI to 0-100 scale (15-35 range)
return Math.min(Math.max(((result.value - 15) / 20) * 100, 0), 100);
});
constructor(private fb: FormBuilder) {
this.initForm();
}
initForm() {
this.bmiForm = this.fb.group({
height: ['', [Validators.required, Validators.min(1)]],
weight: ['', [Validators.required, Validators.min(1)]]
});
this.bmiForm.valueChanges.subscribe(() => {
  if (this.bmiForm.valid) {
    this.calculateBMI();
  }
});
}
toggleUnit() {
this.unitSystem.update(current => current === 'Metric' ? 'Imperial' : 'Metric');
this.bmiForm.reset();
this.bmiResult.set(null);
}
calculateBMI() {
if (!this.bmiForm.valid) return;
let height = this.bmiForm.get('height')?.value;
let weight = this.bmiForm.get('weight')?.value;

let bmi: number;

if (this.unitSystem() === 'Metric') {
  // height in cm, weight in kg
  const heightInMeters = height / 100;
  bmi = weight / (heightInMeters * heightInMeters);
} else {
  // height in inches, weight in lbs
  bmi = (weight / (height * height)) * 703;
}

const result = this.getBMICategory(bmi);
this.bmiResult.set(result);
}
private getBMICategory(bmi: number): BMIResult {
const roundedBMI = parseFloat(bmi.toFixed(1));
if (bmi < 18.5) {
  return {
    value: roundedBMI,
    category: 'Underweight',
    color: '#3b82f6',
    description: 'You may need to gain weight. Consider consulting a healthcare provider.',
    healthyRange: '18.5 - 24.9'
  };
} else if (bmi >= 18.5 && bmi < 25) {
  return {
    value: roundedBMI,
    category: 'Normal Weight',
    color: '#10b981',
    description: 'You are at a healthy weight. Maintain your lifestyle!',
    healthyRange: '18.5 - 24.9'
  };
} else if (bmi >= 25 && bmi < 30) {
  return {
    value: roundedBMI,
    category: 'Overweight',
    color: '#f59e0b',
    description: 'Consider a balanced diet and regular exercise.',
    healthyRange: '18.5 - 24.9'
  };
} else {
  return {
    value: roundedBMI,
    category: 'Obese',
    color: '#ef4444',
    description: 'Consult a healthcare provider for a personalized weight management plan.',
    healthyRange: '18.5 - 24.9'
  };
}
}
getBMIVariant(): 'success' | 'warning' | 'danger' | 'info' {
const category = this.bmiResult()?.category.toLowerCase();
switch (category) {
case 'underweight':
return 'info';
case 'normal weight':
return 'success';
case 'overweight':
return 'warning';
case 'obese':
return 'danger';
default:
return 'info';
}
}
getHeightLabel(): string {
return this.unitSystem() === 'Metric' ? 'Height (cm)' : 'Height (inches)';
}
getWeightLabel(): string {
return this.unitSystem() === 'Metric' ? 'Weight (kg)' : 'Weight (lbs)';
}
}