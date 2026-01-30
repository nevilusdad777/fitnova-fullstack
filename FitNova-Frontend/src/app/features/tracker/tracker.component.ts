import { Component, signal, inject, OnInit, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
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
        this.refreshDashboard();
    }

    refreshDashboard() {
        // Fetch water intake and weight
        this.trackerService.getTodayTracker().subscribe(tracker => {
            this.todayWater.set(Math.round(tracker.waterIntake * 10) / 10);
            this.currentWeight.set(Math.round(tracker.weight * 10) / 10);
        });
        
        // Fetch User Goal
        this.profileService.getProfile().subscribe(user => {
            if (user.waterGoal) {
                this.waterGoal.set(Math.round(user.waterGoal / 100) / 10); // Convert ml to L (e.g. 3000 -> 3.0)
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

