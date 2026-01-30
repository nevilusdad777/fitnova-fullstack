import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LineChart, TrendingUp, TrendingDown, Minus } from 'lucide-angular';
import { TrackerService } from '../../../../services/tracker.service';

interface ChartData {
  date: string;
  weight: number;
  calories: number;
  displayDate: string;
}

@Component({
    selector: 'app-progress-charts',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div class="card glass-panel h-full">
      <div class="card-header">
        <h3 class="card-title flex-center gap-sm">
          <lucide-icon [img]="LineChart" [size]="20" style="color: var(--color-success)"></lucide-icon>
          Progress Charts (Last 7 Days)
        </h3>
      </div>
      <div class="card-body">
        <div *ngIf="chartData().length > 0; else noData">
          
          <!-- Summary Stats -->
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-label">Starting Weight</div>
              <div class="summary-value">{{ startingWeight() }} kg</div>
              <div class="summary-date">{{ startingDate() }}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Current Weight</div>
              <div class="summary-value primary">{{ currentWeight() }} kg</div>
              <div class="summary-date">{{ currentDate() }}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Weight Change</div>
              <div class="summary-value" [class.success]="weightChange() < 0" [class.danger]="weightChange() > 0">
                <lucide-icon [img]="weightChange() < 0 ? TrendingDown : weightChange() > 0 ? TrendingUp : Minus" [size]="20"></lucide-icon>
                {{ weightChange() > 0 ? '+' : '' }}{{ weightChange() }} kg
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Avg Daily Calories</div>
              <div class="summary-value">{{ avgCalories() }} kcal</div>
            </div>
          </div>

          <!-- Weight Line Chart -->
          <div class="chart-section weight-chart">
            <h4 class="chart-title">📊 Weight Trend</h4>
            <div class="line-chart-wrapper">
              <div class="chart-y-axis">
                <span class="y-label">{{ roundedMaxWeight() }} kg</span>
                <span class="y-label">{{ roundedMidWeight() }} kg</span>
                <span class="y-label">{{ roundedMinWeight() }} kg</span>
              </div>
              
              <div class="line-chart-content">
                <svg class="line-chart" viewBox="0 0 700 240">
                  <!-- Grid lines -->
                  <line x1="0" y1="0" x2="700" y2="0" stroke="var(--color-border)" stroke-width="1"/>
                  <line x1="0" y1="120" x2="700" y2="120" stroke="var(--color-border)" stroke-width="1"/>
                  <line x1="0" y1="240" x2="700" y2="240" stroke="var(--color-border)" stroke-width="1"/>
                  
                  <!-- Area under line -->
                  <path
                    [attr.d]="weightAreaPath()"
                    fill="url(#weightAreaGradient)"
                    opacity="0.3"
                  />
                  
                  <!-- Line path -->
                  <polyline
                    [attr.points]="weightLinePoints()"
                    fill="none"
                    stroke="url(#weightGradient)"
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  
                  <!-- Data points -->
                  <circle
                    *ngFor="let point of weightPoints(); let i = index"
                    [attr.cx]="point.x"
                    [attr.cy]="point.y"
                    r="6"
                    fill="white"
                    stroke="#3b82f6"
                    stroke-width="3"
                  />
                  
                  <defs>
                    <linearGradient id="weightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="weightAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.4" />
                      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.05" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <!-- X-axis labels -->
                <div class="chart-x-axis">
                  <span *ngFor="let data of chartData()" class="x-label">
                    <span class="date">{{ data.displayDate }}</span>
                    <span class="value">{{ data.weight }} kg</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Calorie Bar Chart -->
          <div class="chart-section calorie-chart">
            <h4 class="chart-title">🍽️ Daily Calorie Intake</h4>
            <div class="line-chart-wrapper">
              <div class="chart-y-axis">
                <span class="y-label">{{ roundedMaxCalories() }}</span>
                <span class="y-label">{{ roundedMidCalories() }}</span>
                <span class="y-label">0</span>
              </div>
              
              <div class="bar-chart-content">
                <div class="calorie-bars">
                  <div *ngFor="let data of chartData()" class="cal-bar-item">
                    <div class="cal-value">{{ data.calories }} kcal</div>
                    <div class="cal-bar-container">
                      <div 
                        class="cal-bar" 
                        [style.height.px]="getCalorieBarHeightPx(data.calories)">
                      </div>
                    </div>
                    <div class="cal-label">{{ data.displayDate }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        
        <ng-template #noData>
          <div class="empty-state">
            <lucide-icon [img]="LineChart" [size]="48" class="empty-icon"></lucide-icon>
            <p class="text-muted">No tracking data available</p>
            <p class="text-sm text-muted">Start logging to see your progress charts!</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
    styles: [`
    .h-full { height: 100%; }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .summary-card {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1));
      border: 1px solid rgba(6, 182, 212, 0.2);
      border-radius: var(--radius-lg);
      padding: 1rem;
      text-align: center;
    }
    
    .summary-label {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    
    .summary-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
    }
    
    .summary-value.primary {
      color: #3b82f6;
    }
    
    .summary-value.success {
      color: var(--color-success);
    }
    
    .summary-value.danger {
      color: var(--color-danger);
    }
    
    .summary-date {
      font-size: 0.7rem;
      color: var(--color-text-muted);
      margin-top: 0.25rem;
    }
    
    .chart-section {
      margin-bottom: 3rem;
      background: var(--card-glass-bg, var(--color-surface));
      backdrop-filter: blur(10px);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 2rem;
      box-shadow: var(--shadow-md);
    }

    .weight-chart {
      margin-bottom: 3.5rem;
    }

    .calorie-chart {
      margin-bottom: 2rem;
    }
    
    .chart-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 2rem;
    }
    
    .line-chart-wrapper {
      display: flex;
      gap: 1rem;
    }
    
    .chart-y-axis {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-width: 50px;
      padding-right: 0.5rem;
      font-size: 0.8rem;
      color: var(--color-text-muted);
      font-weight: 500;
    }
    
    .y-label {
      text-align: right;
    }
    
    .line-chart-content {
      flex: 1;
    }
    
    .line-chart {
      width: 100%;
      height: 180px;
      margin-bottom: 0.75rem;
    }
    
    .chart-x-axis {
      display: flex;
      justify-content: space-around;
      padding: 0.75rem 0;
      border-top: 1px solid var(--color-border);
    }
    
    .x-label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      text-align: center;
    }
    
    .x-label .date {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }
    
    .x-label .value {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }
    
    .bar-chart-content {
      flex: 1;
    }
    
    .calorie-bars {
      display: flex;
      align-items: flex-end;
      justify-content: space-evenly;
      height: 320px;
      gap: 0.75rem;
      border-bottom: 2px solid var(--color-border);
      padding: 1rem 0.5rem;
    }
    
    .cal-bar-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 60px;
      max-width: 120px;
    }
    
    .cal-value {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 0.5rem;
      white-space: nowrap;
    }
    
    .cal-bar-container {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      flex: 1;
    }
    
    .cal-bar {
      width: 90%;
      background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%);
      border-radius: var(--radius-md) var(--radius-md) 0 0;
      transition: all 0.3s ease;
      cursor: pointer;
      min-height: 20px;
      box-shadow: 0 -2px 8px rgba(240, 147, 251, 0.3);
    }
    
    .cal-bar:hover {
      opacity: 0.9;
      transform: translateY(-4px);
      box-shadow: 0 -4px 12px rgba(240, 147, 251, 0.5);
    }
    
    .cal-label {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-top: 0.75rem;
      text-align: center;
      font-weight: 500;
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      gap: 0.5rem;
    }
    
    .empty-icon {
      color: var(--color-text-muted);
      opacity: 0.5;
    }
    
    .text-muted {
      color: var(--color-text-secondary);
    }
    
    .text-sm {
      font-size: 0.875rem;
    }
  `]
})
export class ProgressChartsComponent implements OnInit {
    private trackerService = inject(TrackerService);
    
    readonly LineChart = LineChart;
    readonly TrendingUp = TrendingUp;
    readonly TrendingDown = TrendingDown;
    readonly Minus = Minus;

    chartData = signal<ChartData[]>([]);
    
    startingWeight = signal(0);
    currentWeight = signal(0);
    weightChange = computed(() => 
      Math.round((this.currentWeight() - this.startingWeight()) * 10) / 10
    );
    
    startingDate = signal('');
    currentDate = signal('');
    
    avgCalories = computed(() => {
      const data = this.chartData();
      if (data.length === 0) return 0;
      const sum = data.reduce((acc, d) => acc + d.calories, 0);
      return Math.round(sum / data.length);
    });
    
    minWeight = computed(() => {
      const weights = this.chartData().map(d => d.weight);
      return Math.min(...weights);
    });
    
    maxWeight = computed(() => {
      const weights = this.chartData().map(d => d.weight);
      return Math.max(...weights);
    });
    
    midWeight = computed(() => 
      (this.maxWeight() + this.minWeight()) / 2
    );
    
    // Rounded versions for Y-axis display
    roundedMinWeight = computed(() => Math.floor(this.minWeight()));
    roundedMaxWeight = computed(() => Math.ceil(this.maxWeight()));
    roundedMidWeight = computed(() => Math.round(this.midWeight()));
    
    maxCalories = computed(() => {
      const calories = this.chartData().map(d => d.calories);
      return Math.max(...calories);
    });
    
    midCalories = computed(() => this.maxCalories() / 2);
    
    roundedMaxCalories = computed(() => Math.ceil(this.maxCalories() / 100) * 100);
    roundedMidCalories = computed(() => Math.round(this.midCalories() / 50) * 50);

    ngOnInit() {
        this.trackerService.getHistory(7).subscribe(history => {
            if (history && history.length > 0) {
                const data = history.map(h => ({
                    date: h.date,
                    weight: h.weight,
                    calories: Math.round(h.caloriesConsumed || 0),
                    displayDate: this.formatDate(h.date)
                }));
                
                this.chartData.set(data);
                this.startingWeight.set(data[0].weight);
                this.currentWeight.set(data[data.length - 1].weight);
                this.startingDate.set(data[0].displayDate);
                this.currentDate.set(data[data.length - 1].displayDate);
            }
        });
    }

    weightPoints = computed(() => {
      const data = this.chartData();
      if (data.length === 0) return [];
      
      const min = this.minWeight();
      const max = this.maxWeight();
      const range = max - min || 1;
      
      // Add padding to prevent line cropping
      const padding = 15;
      const width = 700;
      const height = 240;
      const step = width / (data.length - 1 || 1);
      const effectiveHeight = height - (padding * 2);
      
      return data.map((d, i) => ({
        x: i * step,
        y: padding + (height - padding - ((d.weight - min) / range * effectiveHeight))
      }));
    });

    weightLinePoints = computed(() => {
      return this.weightPoints().map(p => `${p.x},${p.y}`).join(' ');
    });

    weightAreaPath = computed(() => {
      const points = this.weightPoints();
      if (points.length === 0) return '';
      
      const pathData = points.map((p, i) => 
        i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`
      ).join(' ');
      
      return `${pathData} L 700,240 L 0,240 Z`;
    });

    getCalorieBarHeightPx(calories: number): number {
      // Use minimum base value to show variation even with similar values
      const data = this.chartData();
      const minCal = Math.min(...data.map(d => d.calories));
      const maxCal = this.maxCalories();
      const range = maxCal - minCal;
      
      // Map to 40-280px range for better visual distinction
      if (range === 0) return 150; // All same, show medium height
      
      const normalized = (calories - minCal) / range;
      return 40 + (normalized * 240);
    }
    
    readonly Math = Math;

    formatDate(dateStr: string): string {
      const date = new Date(dateStr);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      return `${month} ${day}`;
    }
}