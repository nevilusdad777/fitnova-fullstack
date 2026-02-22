import { Component, signal, computed, inject, OnInit, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule, BarChart2, Droplets, Scale, Calculator, Activity, ChevronRight } from 'lucide-angular';
import { WaterTrackerComponent } from './components/water-tracker/water-tracker.component';
import { WeightTrackerComponent } from './components/weight-tracker/weight-tracker.component';
import { ProgressChartsComponent } from './components/progress-charts/progress-charts.component';
import { BmiCalculatorComponent } from './components/bmi-calculator/bmi-calculator.component';
import { TrackerService } from '../../services/tracker.service';
import { ProfileService } from '../../services/profile.service';

export type TrackerView = 'overview' | 'water' | 'weight' | 'bmi';

@Component({
    selector: 'app-tracker',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LucideAngularModule,
        WaterTrackerComponent,
        WeightTrackerComponent,
        ProgressChartsComponent,
        BmiCalculatorComponent
    ],
    templateUrl: './tracker.component.html',
    styleUrls: ['./tracker.component.css']
})
export class TrackerComponent implements OnInit {
    private trackerService = inject(TrackerService);
    private profileService = inject(ProfileService);
    private route = inject(ActivatedRoute);

    @ViewChild(ProgressChartsComponent) progressCharts?: ProgressChartsComponent;
    @ViewChild(WeightTrackerComponent) weightTracker?: WeightTrackerComponent;

    readonly BarChart2 = BarChart2;
    readonly Droplets = Droplets;
    readonly Scale = Scale;
    readonly Calculator = Calculator;
    readonly Activity = Activity;
    readonly ChevronRight = ChevronRight;

    currentView = signal<TrackerView>('overview');
    todayWater = signal(0);
    waterGoal = signal(3.0);
    currentWeight = signal(0);
    weekChange = signal(0);
    userHeight = signal(0);
    
    bmiScore = computed(() => {
        const weight = this.currentWeight();
        const height = this.userHeight();
        if (weight > 0 && height > 0) {
            const heightM = height / 100;
            return Math.round((weight / (heightM * heightM)) * 10) / 10;
        }
        return 0;
    });

    bmiCategory = computed(() => {
        const bmi = this.bmiScore();
        if (bmi === 0) return 'Unknown';
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal Weight';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    });

    bmiColor = computed(() => {
        const bmi = this.bmiScore();
        if (bmi === 0) return '#6b7280'; // gray
        if (bmi < 18.5) return '#3b82f6'; // blue
        if (bmi < 25) return '#22c55e'; // green
        if (bmi < 30) return '#f59e0b'; // amber
        return '#ef4444'; // red
    });

    constructor() {
        // Watch for view changes and refresh data
        effect(() => {
            const view = this.currentView();
            if (view === 'overview') {
                this.refreshDashboard();
            }
        });
    }

    ngOnInit() {
        // Read optional ?view= query param to jump to a specific section
        const viewParam = this.route.snapshot.queryParamMap.get('view') as TrackerView | null;
        if (viewParam && ['overview', 'water', 'weight', 'bmi'].includes(viewParam)) {
            this.currentView.set(viewParam);
        }
        this.refreshDashboard();
    }

    refreshDashboard() {
        // Fetch water intake and weight
        this.trackerService.getTodayTracker().subscribe(tracker => {
            this.todayWater.set(Math.round(tracker.waterIntake * 10) / 10);
            this.currentWeight.set(Math.round(tracker.weight * 10) / 10);
        });
        // Fetch User Profile for height and water goal
        this.profileService.getProfile().subscribe(user => {
            if (user.waterGoal) {
                this.waterGoal.set(Math.round(user.waterGoal / 100) / 10);
            }
            if (user.height) {
                this.userHeight.set(user.height);
            }
        });

        // Calculate week change
        this.trackerService.getHistory(7).subscribe(history => {
            if (history && history.length > 1) {
                const weekAgo = history[0];
                const today = history[history.length - 1];
                const change = Math.round((today.weight - weekAgo.weight) * 10) / 10;
                this.weekChange.set(change);
            }
        });

        // Refresh child components if they exist
        setTimeout(() => {
            this.progressCharts?.ngOnInit();
        }, 100);
    }
}

