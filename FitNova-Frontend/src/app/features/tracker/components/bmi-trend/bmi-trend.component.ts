import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TrackerService } from '../../tracker.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
    selector: 'app-bmi-trend',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, CardComponent, BadgeComponent, BaseChartDirective],
    templateUrl: './bmi-trend.component.html',
    styleUrls: ['./bmi-trend.component.css']
})
export class BmiTrendComponent implements OnInit {
    readonly TrendingUp = TrendingUp;

    currentBMI = signal(0);
    bmiCategory = signal('');
    bmiColor = signal('');

    bmiChartData = signal<ChartConfiguration['data']>({
        labels: [],
        datasets: []
    });

    bmiChartOptions = signal<ChartConfiguration['options']>({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'BMI Trend',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                min: 15,
                max: 35,
                ticks: {
                    stepSize: 5
                }
            }
        }
    });

    constructor(private trackerService: TrackerService) { }

    ngOnInit() {
        this.loadBMIData();
    }

    loadBMIData() {
        this.trackerService.getBMITrend().subscribe(bmiData => {
            this.currentBMI.set(bmiData.current);
            this.bmiCategory.set(bmiData.category);
            this.bmiColor.set(bmiData.color);

            this.bmiChartData.set({
                labels: bmiData.history.map((item: { date: string; value: number }) => item.date),
                datasets: [{
                    label: 'BMI',
                    data: bmiData.history.map((item: { date: string; value: number }) => item.value),
                    borderColor: bmiData.color,
                    backgroundColor: `${bmiData.color}20`,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: bmiData.color,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            });
        });
    }

    getBMIVariant(): 'success' | 'warning' | 'danger' | 'info' {
        switch (this.bmiCategory().toLowerCase()) {
            case 'underweight':
                return 'info';
            case 'normal':
                return 'success';
            case 'overweight':
                return 'warning';
            case 'obese':
                return 'danger';
            default:
                return 'info';
        }
    }

    getBMIDescription(): string {
        switch (this.bmiCategory().toLowerCase()) {
            case 'underweight':
                return 'Consider increasing calorie intake and strength training.';
            case 'normal':
                return 'Great job! Maintain your current lifestyle.';
            case 'overweight':
                return 'Focus on balanced diet and regular exercise.';
            case 'obese':
                return 'Consult a healthcare provider for a personalized plan.';
            default:
                return '';
        }
    }
}