import { Component, signal, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Scale, Plus } from 'lucide-angular';
import { TrackerService } from '../../../../services/tracker.service';

@Component({
    selector: 'app-weight-tracker',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div class="card glass-panel h-full">
      <div class="card-header">
        <h3 class="card-title flex-center gap-sm">
          <lucide-icon [img]="Scale" [size]="20" style="color: var(--color-primary)"></lucide-icon>
          Weight Tracker
        </h3>
      </div>
      <div class="card-body flex-column gap-md">
        <div class="current-weight text-center">
            <span class="weight-value text-gradient">{{ currentWeight() }}</span>
            <span class="weight-unit">kg</span>
        </div>
        
        <div class="weight-input-group flex gap-sm">
            <input type="number" placeholder="Enter weight" class="form-input" #weightInput (keyup.enter)="logWeight(weightInput.value); weightInput.value=''">
            <button class="btn btn-primary" (click)="logWeight(weightInput.value); weightInput.value=''">
                Log
            </button>
        </div>

        <div class="weight-history">
            <div class="history-item flex-between" *ngFor="let entry of history()">
                <span class="date">{{ entry.date }}</span>
                <span class="value">{{ entry.weight }} kg</span>
            </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .weight-value { font-size: 2.5rem; font-weight: 800; }
    .weight-unit { font-size: 1.25rem; color: var(--color-text-secondary); margin-left: 0.5rem; }
    .form-input { 
        flex: 1; 
        padding: 0.5rem; 
        border-radius: var(--radius-md); 
        border: 1px solid var(--color-border); 
        background: var(--color-surface);
        color: var(--color-text-primary);
    }
    .weight-history { margin-top: 1rem; }
    .history-item { padding: 0.5rem 0; border-bottom: 1px solid var(--color-border); font-size: 0.9rem; }
    .history-item:last-child { border-bottom: none; }
    .date { color: var(--color-text-muted); }
    .h-full { height: 100%; }
  `]
})
export class WeightTrackerComponent implements OnInit {
    private trackerService = inject(TrackerService);
    readonly Scale = Scale;

    @Output() weightUpdated = new EventEmitter<number>();

    currentWeight = signal(0);
    history = signal<any[]>([]);

    ngOnInit() {
        this.fetchData();
    }

    fetchData() {
        this.trackerService.getTodayTracker().subscribe(tracker => {
            this.currentWeight.set(tracker.weight);
        });

        this.trackerService.getHistory(5).subscribe(trackers => {
            this.history.set(trackers.map(t => ({
                date: t.date === new Date().toISOString().split('T')[0] ? 'Today' : t.date,
                weight: t.weight
            })).reverse());
        });
    }

    logWeight(val: string) {
        if (!val) return;
        const weight = parseFloat(val);
        this.trackerService.updateWeight(weight).subscribe((tracker) => {
            this.fetchData();
            this.weightUpdated.emit(weight);
        });
    }
}
