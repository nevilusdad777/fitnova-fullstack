import { Component, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle, Circle, Play, Dumbbell, CalendarDays } from 'lucide-angular';
import { WorkoutService } from '../../workout.service';

interface DaySchedule {
    dayName: string;
    dayOfWeek: number;
    date: string;
    isToday: boolean;
    workoutName?: string;
    exercises?: any[];
    isRestDay: boolean;
}

@Component({
    selector: 'app-weekly-schedule',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './weekly-schedule.component.html',
    styleUrls: ['./weekly-schedule.component.css']
})
export class WeeklyScheduleComponent implements OnInit {
    readonly CheckCircle = CheckCircle;
    readonly Circle = Circle;
    readonly Play = Play;
    readonly Dumbbell = Dumbbell;
    readonly CalendarDays = CalendarDays;

    @Output() workoutStarted = new EventEmitter<any>();

    weekSchedule = signal<DaySchedule[]>([]);
    isLoading = signal(false);
    activePlan = signal<any>(null);

    dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    constructor(private workoutService: WorkoutService) {}

    ngOnInit() {
        this.loadSchedule();
    }

    loadSchedule() {
        this.isLoading.set(true);
        
        this.workoutService.getActiveWorkoutPlan().subscribe({
            next: (plan) => {
                if (plan) {
                    this.activePlan.set(plan);
                    this.buildWeekSchedule(plan);
                } else {
                    this.buildEmptySchedule();
                }
                this.isLoading.set(false);
            },
            error: () => {
                this.buildEmptySchedule();
                this.isLoading.set(false);
            }
        });
    }

    buildWeekSchedule(plan: any) {
        const today = new Date();
        const currentDayOfWeek = today.getDay();
        
        const schedule: DaySchedule[] = [];

        for (let i = 0; i < 7; i++) {
            const dayWorkout = plan.schedule?.find((s: any) => s.dayOfWeek === i);
            
            schedule.push({
                dayName: this.dayNames[i],
                dayOfWeek: i,
                date: this.getDateForDay(i),
                isToday: i === currentDayOfWeek,
                workoutName: dayWorkout?.name,
                exercises: dayWorkout?.exercises || [],
                isRestDay: !dayWorkout
            });
        }

        this.weekSchedule.set(schedule);
    }

    buildEmptySchedule() {
        const today = new Date();
        const currentDayOfWeek = today.getDay();
        
        const schedule: DaySchedule[] = this.dayNames.map((name, i) => ({
            dayName: name,
            dayOfWeek: i,
            date: this.getDateForDay(i),
            isToday: i === currentDayOfWeek,
            isRestDay: true
        }));

        this.weekSchedule.set(schedule);
    }

    getDateForDay(dayOfWeek: number): string {
        const today = new Date();
        const currentDay = today.getDay();
        const diff = dayOfWeek - currentDay;
        const date = new Date(today);
        date.setDate(today.getDate() + diff);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    startWorkout(day: DaySchedule) {
        if (day.exercises && day.exercises.length > 0) {
            // Set the active routine with schedule information
            const routineData: any = {
                name: day.workoutName || `${day.dayName} Workout`,
                exercises: day.exercises
            };
            this.workoutService.setActiveRoutine(routineData);
            
            // Convert schedule exercises to workout exercises
            const exercises = day.exercises.map(ex => ({
                _id: ex.exerciseId || ex._id,
                name: ex.name,
                bodyPart: this.extractBodyPart(ex.name) as any,
                sets: ex.sets || 3,
                reps: ex.reps || 12,
                restTime: ex.restTime || 60,
                caloriesPerSet: ex.caloriesPerSet || 50
            }));
            this.workoutService.setActiveWorkout(exercises);
            this.workoutStarted.emit();
        } else {
            alert('No exercises found for this workout day');
        }
    }

    private extractBodyPart(exerciseName: string): string {
        const name = exerciseName.toLowerCase();
        if (name.includes('chest') || name.includes('bench')) return 'chest';
        if (name.includes('back') || name.includes('row') || name.includes('pull')) return 'back';
        if (name.includes('leg') || name.includes('squat')) return 'legs';
        if (name.includes('shoulder') || name.includes('press')) return 'shoulders';
        if (name.includes('arm') || name.includes('curl') || name.includes('tricep')) return 'arms';
        if (name.includes('abs') || name.includes('core') || name.includes('crunch')) return 'abs';
        return 'cardio';
    }
}
