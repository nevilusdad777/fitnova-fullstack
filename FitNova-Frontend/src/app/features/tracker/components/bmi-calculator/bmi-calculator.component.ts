import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Calculator, RefreshCw } from 'lucide-angular';

@Component({
    selector: 'app-bmi-calculator',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
    <div class="bmi-calculator-container fade-in">
        <div class="calculator-card glass-panel">
            <div class="calc-header">
                <h3>Calculate Your BMI</h3>
                <p>Enter your height and weight below</p>
            </div>

            <div class="calc-form">
                <div class="form-group">
                    <label>Weight (kg)</label>
                    <input type="number" [(ngModel)]="weight" placeholder="e.g. 70">
                </div>
                
                <div class="form-group">
                    <label>Height (cm)</label>
                    <input type="number" [(ngModel)]="height" placeholder="e.g. 175">
                </div>

                <div class="result-display" *ngIf="bmiValue() > 0">
                    <div class="bmi-circle" [style.border-color]="categoryColor()">
                        <span class="bmi-val">{{ bmiValue() | number:'1.1-1' }}</span>
                        <span class="bmi-label">BMI</span>
                    </div>
                    <div class="result-text">
                        <span class="category" [style.color]="categoryColor()">{{ bmiCategory() }}</span>
                        <p class="advice">{{ bmiAdvice() }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="info-card glass-panel">
            <h4>BMI Categories</h4>
            <div class="category-list">
                <div class="cat-item"><span class="dot" style="background: #3b82f6"></span> Underweight (< 18.5)</div>
                <div class="cat-item"><span class="dot" style="background: #22c55e"></span> Normal (18.5 - 24.9)</div>
                <div class="cat-item"><span class="dot" style="background: #eab308"></span> Overweight (25 - 29.9)</div>
                <div class="cat-item"><span class="dot" style="background: #ef4444"></span> Obese (> 30)</div>
            </div>
        </div>
    </div>
  `,
    styles: [`
    .bmi-calculator-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        max-width: 600px;
        margin: 0 auto;
    }

    .calculator-card, .info-card {
        padding: 32px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
    }

    .calc-header { margin-bottom: 24px; text-align: center; }
    .calc-header h3 { font-size: 1.5rem; margin-bottom: 8px; }
    .calc-header p { color: var(--color-text-secondary); }

    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--color-text-secondary); }
    .form-group input {
        width: 100%; padding: 12px;
        background: var(--color-background); border: 1px solid var(--color-border);
        border-radius: var(--radius-lg); font-size: 1.1rem; color: var(--color-text-primary);
    }

    .result-display {
        margin-top: 32px;
        display: flex;
        align-items: center;
        gap: 24px;
        padding: 24px;
        background: var(--color-background);
        border-radius: var(--radius-lg);
        animation: fadeIn 0.3s ease-out;
    }

    .bmi-circle {
        width: 80px; height: 80px;
        border-radius: 50%;
        border: 4px solid var(--color-primary);
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
    }
    .bmi-val { font-size: 1.5rem; font-weight: 800; }
    .bmi-label { font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); }

    .category { font-size: 1.25rem; font-weight: 700; display: block; margin-bottom: 4px; }
    .advice { font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; }

    .category-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
    .cat-item { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--color-text-secondary); }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
  `]
})
export class BmiCalculatorComponent {
    weight = signal(70);
    height = signal(175);

    bmiValue = computed(() => {
        const h = this.height() / 100;
        const w = this.weight();
        if (h > 0 && w > 0) return w / (h * h);
        return 0;
    });

    bmiCategory = computed(() => {
        const bmi = this.bmiValue();
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal Weight';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    });

    categoryColor = computed(() => {
        const bmi = this.bmiValue();
        if (bmi < 18.5) return '#3b82f6';
        if (bmi < 25) return '#22c55e';
        if (bmi < 30) return '#eab308';
        return '#ef4444';
    });

    bmiAdvice = computed(() => {
        const cat = this.bmiCategory();
        if (cat === 'Underweight') return 'Consider increasing your calorie intake with nutrient-rich foods.';
        if (cat === 'Normal Weight') return 'Great job! Maintain your balanced diet and activity.';
        if (cat === 'Overweight') return 'Aim for a slight calorie deficit and regular exercise.';
        return 'Consult a healthcare provider for a personalized plan.';
    });
}
