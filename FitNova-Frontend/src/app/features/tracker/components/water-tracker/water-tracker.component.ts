import { Component, signal, Input, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Droplets, Plus, Minus, GlassWater, Coffee, Milk, Edit2, Check, X, Droplet, Info, BarChart2, TrendingUp, Calendar } from 'lucide-angular';
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
                <!-- Remove Error Message -->
                <div class="remove-error" *ngIf="removeError() && viewMode === 'full'">
                    ⚠️ {{ removeError() }}
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
                                <span class="y-label">{{ todayMax() }}ml</span>
                                <span class="y-label">{{ Math.round(todayMax() * 0.66) }}ml</span>
                                <span class="y-label">{{ Math.round(todayMax() * 0.33) }}ml</span>
                                <span class="y-label">0ml</span>
                            </div>
                            <div class="water-levels">
                                <div class="level-bar" 
                                     [style.height.%]="todayProgress()" 
                                     [class.low]="todayProgress() < 33"
                                     [class.medium]="todayProgress() >= 33 && todayProgress() < 66"
                                     [class.high]="todayProgress() >= 66">
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

        <!-- Water Intake History (Full Mode Only) -->
        <div class="history-section section-fade-in relative-z" *ngIf="viewMode === 'full'">
            <!-- Header + Period Toggle -->
            <div class="history-header">
                <div class="history-title-group">
                    <lucide-icon [img]="BarChart2" [size]="20" style="color:#3b82f6"></lucide-icon>
                    <h4 class="history-title">Intake History</h4>
                </div>
                <div class="period-toggle">
                    <button class="period-btn" [class.active]="historyPeriod() === 7" (click)="setHistoryPeriod(7)">7 Days</button>
                    <button class="period-btn" [class.active]="historyPeriod() === 14" (click)="setHistoryPeriod(14)">14 Days</button>
                    <button class="period-btn" [class.active]="historyPeriod() === 30" (click)="setHistoryPeriod(30)">30 Days</button>
                </div>
            </div>

            <!-- Bar Chart -->
            <div class="history-chart" *ngIf="!historyLoading() && waterHistory().length > 0; else historyEmpty">
                <div class="chart-y-axis">
                    <span class="chart-y-label">{{ chartMax() | number:'1.1-1' }}L</span>
                    <span class="chart-y-label">{{ chartMax() * 0.5 | number:'1.1-1' }}L</span>
                    <span class="chart-y-label">0L</span>
                </div>
                <div class="chart-bars">
                    <div class="chart-bar-col" *ngFor="let day of waterHistory()">
                        <div class="bar-tooltip">{{ day.waterIntake | number:'1.1-1' }}L<br><small>{{ formatDate(day.date) }}</small></div>
                        <div class="bar-track">
                            <div class="bar-fill"
                                 [style.height.%]="getBarHeight(day.waterIntake)"
                                 [class.bar-low]="getBarHeight(day.waterIntake) < 33"
                                 [class.bar-med]="getBarHeight(day.waterIntake) >= 33 && getBarHeight(day.waterIntake) < 80"
                                 [class.bar-high]="getBarHeight(day.waterIntake) >= 80">
                            </div>
                        </div>
                        <span class="bar-label">{{ getDayLabel(day.date) }}</span>
                    </div>
                </div>
            </div>

            <ng-template #historyEmpty>
                <div class="history-empty" *ngIf="!historyLoading()">
                    <lucide-icon [img]="BarChart2" [size]="40" style="opacity:0.2;color:#3b82f6"></lucide-icon>
                    <p>No history data available yet.</p>
                </div>
                <div class="history-loading" *ngIf="historyLoading()">
                    <p>Loading history...</p>
                </div>
            </ng-template>

            <!-- Summary Stats Row -->
            <div class="history-stats" *ngIf="waterHistory().length > 0">
                <div class="hstat">
                    <span class="hstat-value">{{ avgIntake() | number:'1.1-1' }}L</span>
                    <span class="hstat-label">Daily Avg</span>
                </div>
                <div class="hstat">
                    <span class="hstat-value">{{ maxIntake() | number:'1.1-1' }}L</span>
                    <span class="hstat-label">Best Day</span>
                </div>
                <div class="hstat">
                    <span class="hstat-value">{{ goalMetDays() }}</span>
                    <span class="hstat-label">Goal Met</span>
                </div>
                <div class="hstat">
                    <span class="hstat-value">{{ historyPeriod() }}d</span>
                    <span class="hstat-label">Period</span>
                </div>
            </div>

            <!-- Text Log List -->
            <div class="history-log" *ngIf="waterHistory().length > 0">
                <h5 class="log-subtitle">Daily Log</h5>
                <div class="log-row" *ngFor="let day of waterHistoryReversed()">
                    <div class="log-date">
                        <lucide-icon [img]="Calendar" [size]="14"></lucide-icon>
                        <span>{{ formatFullDate(day.date) }}</span>
                    </div>
                    <div class="log-bar-mini">
                        <div class="log-bar-fill" [style.width.%]="getBarHeight(day.waterIntake)"
                             [class.bar-low]="getBarHeight(day.waterIntake) < 33"
                             [class.bar-med]="getBarHeight(day.waterIntake) >= 33 && getBarHeight(day.waterIntake) < 80"
                             [class.bar-high]="getBarHeight(day.waterIntake) >= 80">
                        </div>
                    </div>
                    <span class="log-amount">{{ day.waterIntake | number:'1.1-1' }}L</span>
                    <span class="log-badge" [class.badge-good]="day.waterIntake * 1000 >= waterGoal()" [class.badge-warn]="day.waterIntake * 1000 < waterGoal() * 0.5" [class.badge-ok]="day.waterIntake * 1000 >= waterGoal() * 0.5 && day.waterIntake * 1000 < waterGoal()">
                        {{ day.waterIntake * 1000 >= waterGoal() ? '✓ Goal' : day.waterIntake * 1000 >= waterGoal() * 0.5 ? 'Partial' : 'Low' }}
                    </span>
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
        color: #3b82f6; 
        font-weight: 700;
        margin-left: 0.5rem;
        vertical-align: middle;
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
        margin-top: 2rem;
        padding: 1rem;
        background: rgba(59, 130, 246, 0.05);
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

    /* ============  HISTORY SECTION  ============ */
    .history-section {
        margin-top: 2rem;
        background: linear-gradient(135deg, rgba(59,130,246,0.04), rgba(37,99,235,0.04));
        border: 1px solid rgba(59,130,246,0.12);
        border-radius: 20px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .history-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .history-title-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .history-title {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin: 0;
    }

    .period-toggle {
        display: flex;
        gap: 0.375rem;
        background: rgba(59,130,246,0.08);
        border-radius: 10px;
        padding: 3px;
    }

    .period-btn {
        padding: 0.35rem 0.85rem;
        border: none;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        background: transparent;
        color: #3b82f6;
        transition: all 0.2s;
    }

    .period-btn.active {
        background: #3b82f6;
        color: white;
        box-shadow: 0 2px 8px rgba(59,130,246,0.35);
    }

    /* Bar Chart */
    .history-chart {
        display: flex;
        gap: 0.5rem;
        height: 160px;
        align-items: stretch;
    }

    .chart-y-axis {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-width: 32px;
        padding-bottom: 20px;
    }

    .chart-y-label {
        font-size: 0.7rem;
        color: #3b82f6;
        font-weight: 600;
        text-align: right;
    }

    .chart-bars {
        flex: 1;
        display: flex;
        align-items: flex-end;
        gap: 4px;
        padding-bottom: 20px;
        border-left: 2px solid rgba(59,130,246,0.2);
        border-bottom: 2px solid rgba(59,130,246,0.2);
        position: relative;
        height: 100%;
    }

    .chart-bar-col {
        flex: 1;
        height: calc(100% - 24px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        position: relative;
    }

    .chart-bar-col:hover .bar-tooltip {
        opacity: 1;
        transform: translateY(-4px);
    }

    .bar-tooltip {
        position: absolute;
        top: -52px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(30,30,50,0.92);
        color: white;
        font-size: 0.68rem;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 7px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: all 0.2s;
        text-align: center;
        z-index: 10;
    }

    .bar-track {
        width: 100%;
        height: 100%;
        border-radius: 6px 6px 0 0;
        background: rgba(59,130,246,0.06);
        display: flex;
        align-items: flex-end;
        overflow: hidden;
        min-height: 4px;
        flex: 1;
    }

    .bar-fill {
        width: 100%;
        border-radius: 6px 6px 0 0;
        transition: height 0.7s cubic-bezier(0.4,0,0.2,1);
        background: linear-gradient(180deg, #3b82f6, #2563eb);
        min-height: 2px;
    }

    .bar-fill.bar-low { background: linear-gradient(180deg, #f59e0b, #d97706); }
    .bar-fill.bar-med { background: linear-gradient(180deg, #3b82f6, #2563eb); }
    .bar-fill.bar-high { background: linear-gradient(180deg, #10b981, #059669); }

    .bar-label {
        font-size: 0.65rem;
        color: var(--color-text-secondary);
        font-weight: 600;
        white-space: nowrap;
    }

    /* Summary Stats */
    .history-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.75rem;
    }

    .hstat {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.75rem 0.5rem;
        background: rgba(59,130,246,0.07);
        border-radius: 12px;
        border: 1px solid rgba(59,130,246,0.12);
    }

    .hstat-value {
        font-size: 1.25rem;
        font-weight: 800;
        color: #3b82f6;
    }

    .hstat-label {
        font-size: 0.7rem;
        color: var(--color-text-secondary);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-top: 2px;
    }

    /* Text Log */
    .history-log {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .log-subtitle {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin: 0 0 0.25rem 0;
    }

    .log-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.6rem 0.75rem;
        background: var(--color-surface, #fff);
        border-radius: 10px;
        border: 1px solid var(--color-border, rgba(0,0,0,0.06));
        transition: all 0.2s;
    }

    .log-row:hover {
        border-color: rgba(59,130,246,0.3);
        box-shadow: 0 2px 8px rgba(59,130,246,0.08);
    }

    .log-date {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        min-width: 110px;
        font-size: 0.8rem;
        color: var(--color-text-secondary);
        font-weight: 500;
    }

    .log-bar-mini {
        flex: 1;
        height: 8px;
        background: rgba(59,130,246,0.08);
        border-radius: 99px;
        overflow: hidden;
    }

    .log-bar-fill {
        height: 100%;
        border-radius: 99px;
        transition: width 0.5s ease;
        background: #3b82f6;
    }

    .log-bar-fill.bar-low { background: #f59e0b; }
    .log-bar-fill.bar-med { background: #3b82f6; }
    .log-bar-fill.bar-high { background: #10b981; }

    .log-amount {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-text-primary);
        min-width: 38px;
        text-align: right;
    }

    .log-badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 99px;
        min-width: 56px;
        text-align: center;
    }

    .badge-good { background: rgba(16,185,129,0.12); color: #059669; }
    .badge-ok   { background: rgba(59,130,246,0.12); color: #2563eb; }
    .badge-warn { background: rgba(245,158,11,0.12); color: #d97706; }

    .history-empty, .history-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 2rem;
        color: var(--color-text-muted);
        font-size: 0.9rem;
    }

    .remove-error {
        margin-top: 0.4rem;
        padding: 0.5rem 0.85rem;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.35);
        border-radius: 10px;
        color: #dc2626;
        font-size: 0.82rem;
        font-weight: 600;
        animation: fadeIn 0.25s ease-out;
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
    readonly BarChart2 = BarChart2;
    readonly Calendar = Calendar;
    readonly TrendingUp = TrendingUp;

    currentIntake = signal(0);
    waterGoal = signal(3000);
    isEditingGoal = signal(false);
    waterHistory = signal<any[]>([]);
    historyPeriod = signal<7 | 14 | 30>(7);
    historyLoading = signal(false);
    removeError = signal('');

    // Computed stats from history
    avgIntake = computed(() => {
        const h = this.waterHistory();
        if (!h.length) return 0;
        return h.reduce((s, d) => s + d.waterIntake, 0) / h.length;
    });

    maxIntake = computed(() => {
        const h = this.waterHistory();
        if (!h.length) return 0;
        return Math.max(...h.map(d => d.waterIntake));
    });

    goalMetDays = computed(() => {
        return this.waterHistory().filter(d => d.waterIntake * 1000 >= this.waterGoal()).length;
    });

    waterHistoryReversed = computed(() => [...this.waterHistory()].reverse());

    /** The ceiling used for both bar heights and Y-axis labels: whichever is bigger, goal or actual max */
    chartMax = computed(() => Math.max(this.waterGoal() / 1000, this.maxIntake()));


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
        this.loadHistory();
    }

    loadHistory() {
        this.historyLoading.set(true);
        this.trackerService.getHistory(this.historyPeriod()).subscribe({
            next: (data) => {
                const filled = this.fillMissingDays(data, this.historyPeriod());
                this.waterHistory.set(filled);
                this.historyLoading.set(false);
            },
            error: () => this.historyLoading.set(false)
        });
    }

    /** Fills in missing days with waterIntake: 0 so the chart always shows every day */
    private fillMissingDays(data: any[], days: number): any[] {
        // Build a date→entry map from real data
        const map = new Map<string, any>();
        for (const entry of data) {
            // Normalise key to YYYY-MM-DD
            const key = entry.date.split('T')[0];
            map.set(key, entry);
        }

        const result: any[] = [];
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const key = d.toISOString().split('T')[0];
            result.push(map.get(key) ?? { date: key, waterIntake: 0 });
        }
        return result;
    }

    setHistoryPeriod(days: 7 | 14 | 30) {
        this.historyPeriod.set(days);
        this.loadHistory();
    }

    /** Returns bar height % relative to chartMax so bars above goal are still proportionally distinct */
    getBarHeight(waterL: number): number {
        const maxL = this.chartMax();
        if (maxL === 0) return 0;
        return (waterL / maxL) * 100;
    }

    /** Short day label for chart x-axis (Mon, Tue … or day number for 30d) */
    getDayLabel(dateStr: string): string {
        const d = new Date(dateStr);
        if (this.historyPeriod() === 7) {
            return ['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()];
        }
        return String(d.getDate());
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    formatFullDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    progress = computed(() => {
        const goal = this.waterGoal();
        return Math.min((this.currentIntake() / goal) * 100, 100);
    });

    /** Scale ceiling for Today's Progress: whichever is bigger, goal or current intake */
    todayMax = computed(() => Math.max(this.waterGoal(), this.currentIntake()));

    /** Bar fill % for Today's Progress — not capped, so over-goal intake renders taller */
    todayProgress = computed(() => {
        const max = this.todayMax();
        return max === 0 ? 0 : (this.currentIntake() / max) * 100;
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
            this.loadHistory();
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
            if (this.currentIntake() - amount < 0) {
                this.removeError.set(`Cannot remove ${amount}ml — you've only logged ${this.currentIntake()}ml today.`);
                setTimeout(() => this.removeError.set(''), 3000);
                return;
            }
            this.removeError.set('');
            // Convert mL to negative liters for subtraction
            const liters = -(amount / 1000);
            this.trackerService.updateWaterIntake(liters).subscribe(tracker => {
                this.currentIntake.set(Math.max(0, tracker.waterIntake * 1000));
                this.loadHistory();
            });
        }
    }
}
