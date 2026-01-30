import { Component, signal, Input, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Droplets, Plus, Minus, GlassWater, Coffee, Milk, Edit2, Check, X, Droplet, Info } from 'lucide-angular';
import { TrackerService } from '../../../../services/tracker.service';
import { ProfileService } from '../../../../services/profile.service';

@Component({
    selector: 'app-water-tracker',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div class="card glass-panel h-full relative-container" [class.summary-mode]="viewMode === 'summary'">
      <!-- Background Bubbles Animation -->
      <div class="bubbles-container" *ngIf="viewMode === 'full'">
         <div class="bubble"></div>
         <div class="bubble"></div>
         <div class="bubble"></div>
         <div class="bubble"></div>
         <div class="bubble"></div>
         <div class="bubble"></div>
      </div>

      <div class="card-header relative-z">
        <h3 class="card-title flex-center gap-sm">
          <lucide-icon [img]="Droplet" [size]="20" style="color: #3b82f6"></lucide-icon>
            Hydration Tracker
        </h3>
      </div>
      
      <div class="card-body relative-z">
        <div class="tracker-layout-vertical">
            <!-- Top Section: Controls & Display -->
            <div class="tracker-controls flex-column gap-lg">
                <!-- Progress Display -->
                <div class="water-display text-center">
                    <div class="water-amount-container">
                        <div class="water-amount text-gradient">{{ currentIntake() }} <span class="unit">ml</span></div>
                        
                        <!-- Goal Display -->
                        <div class="water-goal flex-center gap-xs">
                            Target: {{ waterGoal() }}ml ({{ progress() | number:'1.0-0' }}%)
                        </div>

                        <!-- Explicit Set Goal Section -->
                        <div class="goal-setting-section" *ngIf="viewMode === 'full'">
                            <label class="text-xs text-muted mb-xs block">Set Daily Goal</label>
                            <div class="custom-input-group flex gap-sm">
                                <input type="number" [value]="waterGoal()" #goalInput class="form-input text-center" placeholder="e.g. 3000">
                                <button class="btn btn-secondary btn-sm" (click)="saveGoal(goalInput.value)">
                                    Set Goal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Add Buttons (Hidden in Summary Mode) -->
                <div class="quick-add-grid" *ngIf="viewMode === 'full'">
                    <button class="btn-quick-add" (click)="addWater(250)" title="Glass (250ml)">
                        <lucide-icon [img]="GlassWater" [size]="24"></lucide-icon>
                        <span>250ml</span>
                    </button>
                    <button class="btn-quick-add" (click)="addWater(500)" title="Cup (500ml)">
                        <lucide-icon [img]="Coffee" [size]="24"></lucide-icon> 
                        <span>500ml</span>
                    </button>
                    <button class="btn-quick-add bottle-btn" (click)="addWater(1000)" title="Bottle (1L)">
                        <lucide-icon [img]="Milk" [size]="24"></lucide-icon>
                        <span>1L</span>
                    </button>
                </div>

                <!-- Custom Input & Delete (Hidden in Summary Mode) -->
                <div class="controls-row flex gap-sm" *ngIf="viewMode === 'full'">
                    <div class="custom-input-group flex gap-sm flex-1">
                        <input type="number" placeholder="Amount (ml)" class="form-input" #customInput (keyup.enter)="addCustomWater(customInput.value); customInput.value=''">
                        <button class="btn btn-primary btn-sm" (click)="addCustomWater(customInput.value); customInput.value=''">
                            <lucide-icon [img]="Plus" [size]="18"></lucide-icon>
                        </button>
                        <button class="btn btn-danger btn-sm" (click)="removeCustomWater(customInput.value); customInput.value=''" title="Remove Amount">
                            <lucide-icon [img]="Minus" [size]="18"></lucide-icon>
                        </button>
                    </div>
                </div>

                 <!-- Summary Progress Bar (Shown ONLY in Summary Mode) -->
                 <div class="progress-bar-bg" *ngIf="viewMode === 'summary'">
                    <div class="progress-bar" [style.width.%]="progress()"></div>
                </div>
            </div>

            <!-- Bottom Section: Large Graph (Full Mode Only) -->
            <div class="tracker-graph-section" *ngIf="viewMode === 'full'">
                <div class="water-graph large-graph" *ngIf="currentIntake() > 0; else emptyState">
                    <h4 class="graph-title">Today's Progress</h4>
                    <div class="graph-visualization">
                        <div class="graph-container">
                            <div class="graph-y-labels">
                                <span class="y-label">{{ waterGoal() }}ml</span>
                                <span class="y-label">{{ Math.round(waterGoal() * 0.66) }}ml</span>
                                <span class="y-label">{{ Math.round(waterGoal() * 0.33) }}ml</span>
                                <span class="y-label">0ml</span>
                            </div>
                            <div class="water-levels">
                                <div class="level-bar" 
                                     [style.height.%]="progress()" 
                                     [class.low]="progress() < 33"
                                     [class.medium]="progress() >= 33 && progress() < 66"
                                     [class.high]="progress() >= 66">
                                    <div class="wave"></div>
                                    <div class="wave wave-2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ng-template #emptyState>
                     <div class="water-graph large-graph empty-graph flex-center flex-column">
                        <lucide-icon [img]="Droplet" [size]="64" class="text-muted mb-md" style="opacity: 0.2"></lucide-icon>
                        <p class="text-muted text-lg text-center">Start drinking water to see your progress chart!</p>
                     </div>
                </ng-template>
            </div>
        </div>

        <!-- Lower Section: Hydration Insights (Full Mode Only) -->
        <div class="hydration-insights section-fade-in relative-z" *ngIf="viewMode === 'full'">
            <div class="insight-content flex gap-md align-center">
                 <div class="insight-icon flex-center">
                    <lucide-icon [img]="Info" [size]="24" class="text-primary"></lucide-icon>
                 </div>
                 <div class="insight-text flex-1">
                    <h5 class="insight-title">Did you know?</h5>
                    <p class="insight-body">{{ currentTip }}</p>
                 </div>
            </div>
        </div>

        <!-- Summary Link -->
        <div *ngIf="viewMode === 'summary'" class="summary-link relative-z">
             <span class="text-sm text-muted">Click 'Water Log' in sidebar for details</span>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .relative-container {
        position: relative;
        overflow: hidden;
    }
    
    .relative-z {
        position: relative;
        z-index: 2;
    }

    .tracker-layout-vertical {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .water-amount-container {
        margin-bottom: 1rem;
    }

    .water-amount { 
        font-size: 3.5rem; 
        font-weight: 800; 
        line-height: 1.1;
        background: linear-gradient(135deg, #3b82f6, #2563eb, #1d4ed8);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    }
    
    .summary-mode .water-amount { font-size: 2.25rem; }
    
    .unit { 
        font-size: 1.5rem; 
        color: var(--color-text-secondary); 
        font-weight: 600;
        opacity: 0.7;
    }
    
    .water-goal { 
        color: var(--color-text-secondary); 
        margin-bottom: 1rem; 
        font-size: 1rem;
        font-weight: 500;
    }

    .goal-setting-section {
        background: rgba(0,0,0,0.02);
        padding: 0.75rem;
        border-radius: 12px;
        border: 1px solid var(--color-border);
        margin: 0 auto 1rem auto;
        max-width: 250px;
    }
    
    .text-xs { font-size: 0.75rem; }
    .mb-xs { margin-bottom: 0.25rem; }
    .block { display: block; }
    
    .progress-bar-bg {
        width: 100%;
        height: 12px;
        background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1));
        border-radius: var(--radius-full);
        overflow: hidden;
        margin-top: 0.75rem;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
    }

    .btn-icon-tiny {
        background: none;
        border: none;
        padding: 4px;
        border-radius: 50%;
        cursor: pointer;
        color: var(--color-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }

    .btn-icon-tiny:hover {
        background: rgba(0,0,0,0.05);
        color: var(--color-primary);
    }

    .btn-icon-tiny.text-success:hover { color: var(--color-success); background: var(--color-success-bg); }
    .btn-icon-tiny.text-danger:hover { color: var(--color-danger); background: var(--color-danger-bg); }

    .goal-input {
        width: 80px;
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid var(--color-border);
        font-size: 0.9rem;
        background: var(--color-background);
        color: var(--color-text-primary);
    }
    
    .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #2563eb);
        border-radius: var(--radius-full);
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 0 16px rgba(59, 130, 246, 0.5);
        position: relative;
        overflow: hidden;
    }

    .progress-bar::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }

    /* Water Graph */
    .water-graph {
        padding: 1.5rem;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.05));
        border-radius: 16px;
        border: 1px solid rgba(59, 130, 246, 0.1);
        display: flex;
        flex-direction: column;
    }
    
    .large-graph {
        height: 450px;
    }

    .empty-graph {
        justify-content: center;
        align-items: center;
    }

    .graph-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 1.25rem;
        text-align: center;
    }

    .graph-visualization {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .graph-container {
        display: flex;
        gap: 0.75rem;
        align-items: stretch;
        height: 100%;
    }

    .graph-y-labels {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-width: 60px;
        padding-right: 0.5rem;
    }

    .y-label {
        font-size: 0.8rem;
        color: #3b82f6;
        font-weight: 600;
        text-align: right;
    }

    .water-levels {
        flex: 1;
        background: linear-gradient(180deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.1) 100%);
        border-radius: 12px;
        border: 2px solid rgba(59, 130, 246, 0.2);
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: flex-end;
    }

    .level-bar {
        width: 100%;
        background: linear-gradient(180deg, #3b82f6, #2563eb);
        transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        border-radius: 8px 8px 0 0;
        box-shadow: 0 -4px 24px rgba(59, 130, 246, 0.4);
    }

    .level-bar.low {
        background: linear-gradient(180deg, #f59e0b, #d97706);
        box-shadow: 0 -4px 24px rgba(245, 158, 11, 0.4);
    }

    .level-bar.medium {
        background: linear-gradient(180deg, #3b82f6, #2563eb);
    }

    .level-bar.high {
        background: linear-gradient(180deg, #10b981, #059669);
        box-shadow: 0 -4px 24px rgba(16, 185, 129, 0.4);
    }

    .wave {
        position: absolute;
        top: -10px;
        left: 0;
        width: 200%;
        height: 20px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        animation: wave 3s infinite linear;
    }

    .wave-2 {
        animation-delay: -1.5s;
        opacity: 0.5;
    }

    @keyframes wave {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
    }

    .quick-add-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
    }

    .btn-quick-add {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1.25rem 0.5rem;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.05));
        border: 2px solid rgba(59, 130, 246, 0.2);
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        color: #3b82f6;
        position: relative;
        overflow: hidden;
    }

    .btn-quick-add::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.1);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
    }

    .btn-quick-add:hover::before {
        width: 300px;
        height: 300px;
    }

    .btn-quick-add:hover {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15));
        border-color: #3b82f6;
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
    }

    .btn-quick-add:active {
        transform: translateY(-2px) scale(0.98);
    }

    .bottle-btn {
        border-color: rgba(16, 185, 129, 0.3);
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05));
        color: #10b981;
    }

    .bottle-btn:hover {
        border-color: #10b981;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15));
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
    }
    
    .btn-quick-add span {
        font-size: 0.85rem;
        font-weight: 700;
        position: relative;
        z-index: 1;
    }

    .form-input {
        flex: 1;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        border: 2px solid rgba(59, 130, 246, 0.2);
        background: var(--color-background);
        color: var(--color-text-primary);
        font-weight: 500;
        width: 100%;
        transition: all 0.3s;
    }

    .form-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .flex-1 { flex: 1; }
    .h-full { height: 100%; }
    .text-sm { font-size: 0.875rem; }
    .text-muted { color: var(--color-text-muted); }
    .summary-link { text-align: center; margin-top: 1rem; }

    /* Hydration Insights */
    .hydration-insights {
        padding: 1rem;
        background: rgba(59, 130, 246, 0.05); /* Slightly blue tinted background */
        border-radius: 12px;
        border: 1px solid rgba(59, 130, 246, 0.1);
    }

    .insight-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
    }

    .insight-title {
        font-size: 0.9rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
        color: var(--color-text-primary);
    }

    .insight-body {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        line-height: 1.4;
    }
    
    .section-fade-in {
        animation: fadeIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* Bubbles Animation */
    .bubbles-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        overflow: hidden;
        pointer-events: none;
    }

    .bubble {
        position: absolute;
        bottom: -50px;
        background: radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05));
        border-radius: 50%;
        border: 1px solid rgba(59, 130, 246, 0.1);
        opacity: 0;
        animation: floatBubble 8s infinite ease-in;
    }

    .bubble:nth-child(1) { width: 40px; height: 40px; left: 10%; animation-duration: 8s; animation-delay: 0s; }
    .bubble:nth-child(2) { width: 20px; height: 20px; left: 20%; animation-duration: 6s; animation-delay: 1s; }
    .bubble:nth-child(3) { width: 50px; height: 50px; left: 65%; animation-duration: 10s; animation-delay: 2s; }
    .bubble:nth-child(4) { width: 30px; height: 30px; left: 80%; animation-duration: 7s; animation-delay: 0.5s; }
    .bubble:nth-child(5) { width: 25px; height: 25px; left: 40%; animation-duration: 9s; animation-delay: 3s; }
    .bubble:nth-child(6) { width: 60px; height: 60px; left: 90%; animation-duration: 11s; animation-delay: 1.5s; }

    @keyframes floatBubble {
        0% {
            bottom: -50px;
            opacity: 0;
            transform: translateX(0);
        }
        30% {
            opacity: 0.6;
        }
        50% {
            transform: translateX(20px);
        }
        70% {
            opacity: 0.6;
        }
        100% {
            bottom: 110%;
            opacity: 0;
            transform: translateX(-20px);
        }
    }
  `]
})
export class WaterTrackerComponent implements OnInit {
    @Input() viewMode: 'summary' | 'full' = 'full';
    private trackerService = inject(TrackerService);
    private profileService = inject(ProfileService);

    readonly Droplet = Droplet;
    readonly Plus = Plus;
    readonly Minus = Minus;
    readonly GlassWater = GlassWater;
    readonly Coffee = Coffee;
    readonly Milk = Milk;
    readonly Math = Math;
    readonly Edit = Edit2;
    readonly Check = Check;
    readonly X = X;
    readonly Info = Info;

    currentIntake = signal(0);
    waterGoal = signal(3000);
    isEditingGoal = signal(false);

    hydrationTips = [
        "Drinking water before meals can help you feel fuller.",
        "Water helps energize your muscles and prevent fatigue.",
        "Stay hydrated to keep your skin looking fresh and healthy.",
        "Water is essential for proper kidney function.",
        "Mild dehydration can affect your mood and concentration."
    ];
    currentTip = '';

    ngOnInit() {
        this.trackerService.getTodayTracker().subscribe(tracker => {
            // DB stores in liters, convert to mL for display
            this.currentIntake.set(tracker.waterIntake * 1000 || 0);
        });

        // Fetch user profile to get saved water goal
        this.profileService.getProfile().subscribe(user => {
            if (user.waterGoal) {
                this.waterGoal.set(user.waterGoal);
            }
        });

        this.currentTip = this.hydrationTips[Math.floor(Math.random() * this.hydrationTips.length)];
    }

    progress = computed(() => {
        const goal = this.waterGoal();
        return Math.min((this.currentIntake() / goal) * 100, 100);
    });

    toggleEditGoal() {
        this.isEditingGoal.set(!this.isEditingGoal());
    }

    saveGoal(newGoal: string) {
        const goal = parseInt(newGoal);
        if (!isNaN(goal) && goal >= 500 && goal <= 10000) {
            this.waterGoal.set(goal);
            this.profileService.updateWaterGoal(goal);
            this.isEditingGoal.set(false);
        }
    }

    addWater(amount: number) {
        // Convert mL to liters for storage
        const liters = amount / 1000;
        this.trackerService.updateWaterIntake(liters).subscribe(tracker => {
            this.currentIntake.set(tracker.waterIntake * 1000);
        });
    }

    addCustomWater(val: string) {
        const amount = parseInt(val);
        if (!isNaN(amount) && amount > 0) {
            this.addWater(amount);
        }
    }

    removeCustomWater(val: string) {
        const amount = parseInt(val);
        if (!isNaN(amount) && amount > 0) {
            // Convert mL to negative liters for subtraction
            const liters = -(amount / 1000);
            this.trackerService.updateWaterIntake(liters).subscribe(tracker => {
                this.currentIntake.set(Math.max(0, tracker.waterIntake * 1000));
            });
        }
    }
}
