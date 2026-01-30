import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Target, Trophy, TrendingUp, Save, Activity, Calendar } from 'lucide-angular';
import { AuthService } from '../../../auth/auth.service';
import { ProfileService } from '../../../../services/profile.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  goalsForm: FormGroup;
  saved = signal(false);

  // Icons
  readonly Target = Target;
  readonly Trophy = Trophy;
  readonly TrendingUp = TrendingUp;
  readonly Save = Save;
  readonly Activity = Activity;
  readonly Calendar = Calendar;

  paces = [
    { id: 'slow', label: 'Relaxed (0.25kg/wk)', adjustment: { lose: -250, gain: 150 }, rate: 0.25 },
    { id: 'moderate', label: 'Moderate (0.5kg/wk)', adjustment: { lose: -500, gain: 300 }, rate: 0.5 },
    { id: 'aggressive', label: 'Aggressive (1kg/wk)', adjustment: { lose: -1000, gain: 500 }, rate: 1.0 }
  ];

  constructor() {
    this.goalsForm = this.fb.group({
      mainGoal: ['lose', Validators.required],
      targetWeight: [null, [Validators.required, Validators.min(20)]],
      weeklyActivity: [3, [Validators.required, Validators.min(0), Validators.max(7)]],
      waterIntake: [2500, [Validators.required, Validators.min(1000)]],
      pace: ['moderate', Validators.required]
    });
  }

  caloricAdjustment = computed(() => {
    const goal = this.goalsForm.get('mainGoal')?.value as 'lose' | 'gain' | 'maintain';
    const paceId = this.goalsForm.get('pace')?.value;
    const pace = this.paces.find(p => p.id === paceId) || this.paces[1];

    if (goal === 'maintain') return 'Maintenance';
    if (!goal) return '---';

    const adj = (pace.adjustment as any)[goal] || 0;
    const sign = adj > 0 ? '+' : '';
    return `${sign}${adj} kcal/day`;
  });

  bmi = computed(() => {
      const user = this.authService.currentUser();
      if (!user?.height || !user?.weight) return { value: 0, category: 'Unknown', color: 'gray' };
      
      const heightInM = user.height / 100;
      const value = user.weight / (heightInM * heightInM);
      let category = 'Normal';
      let color = 'var(--color-success)';

      if (value < 18.5) { category = 'Underweight'; color = 'var(--color-warning)'; }
      else if (value >= 25 && value < 30) { category = 'Overweight'; color = 'var(--color-warning)'; }
      else if (value >= 30) { category = 'Obese'; color = 'var(--color-danger)'; }

      return { value: value.toFixed(1), category, color };
  });

  estimatedDate = computed(() => {
    const goal = this.goalsForm.get('mainGoal')?.value;
    const target = this.goalsForm.get('targetWeight')?.value;
    const paceId = this.goalsForm.get('pace')?.value;
    const current = this.authService.currentUser()?.weight;
    
    const pace = this.paces.find(p => p.id === paceId) || this.paces[1];

    if (!target || !current || goal === 'maintain') return '---';

    if (goal === 'lose' && target >= current) return 'Check Target Weight';
    if (goal === 'gain' && target <= current) return 'Check Target Weight';

    const diff = Math.abs(current - target);
    if (diff < 0.1) return 'Goal Reached!';

    const weeks = diff / pace.rate;
    const date = new Date();
    date.setDate(date.getDate() + Math.ceil(weeks * 7));
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  });

  ngOnInit() {
    this.refreshForm();
    this.goalsForm.valueChanges.subscribe(() => {
        this.saved.set(false);
    });
  }

  refreshForm() {
    const user = this.authService.currentUser();
    if (user) {
      this.goalsForm.patchValue({
        mainGoal: user.goal || 'lose',
        targetWeight: user.targetWeight,
        weeklyActivity: user.weeklyWorkoutDays || 3,
        waterIntake: user.targetWater || 2500,
        pace: user.pace || 'moderate'
      }, { emitEvent: false });
    }
  }

  saveGoals() {
    if (this.goalsForm.valid) {
        const updateData: Partial<User> = {
            goal: this.goalsForm.get('mainGoal')?.value,
            targetWeight: this.goalsForm.get('targetWeight')?.value,
            targetWater: this.goalsForm.get('waterIntake')?.value,
            weeklyWorkoutDays: this.goalsForm.get('weeklyActivity')?.value,
            pace: this.goalsForm.get('pace')?.value
        };
        this.profileService.updateProfile(updateData).subscribe(() => {
            this.saved.set(true);
            setTimeout(() => this.saved.set(false), 3000);
        });
    }
  }
}
