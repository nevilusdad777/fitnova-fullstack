import { Component, Output, EventEmitter, Input, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, X, Save, ArrowLeft, Dumbbell, Calendar, Clock, Trophy } from 'lucide-angular';
import { WorkoutService } from '../../workout.service';
import { WorkoutRoutine, RoutineExercise, Exercise, DailyRoutine } from '../../../../core/models/workout.model';

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

@Component({
    selector: 'app-routine-builder',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './routine-builder.component.html',
    styleUrls: ['./routine-builder.component.css']
})
export class RoutineBuilderComponent implements OnInit {
    readonly Plus = Plus;
    readonly X = X;
    readonly Save = Save;
    readonly ArrowLeft = ArrowLeft;
    readonly Dumbbell = Dumbbell;
    readonly Calendar = Calendar;
    readonly Clock = Clock;
    readonly Trophy = Trophy;

    @Input() routine: WorkoutRoutine | null = null;
    @Input() isPreview: boolean = false;
    @Output() saved = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();
    @Output() startDayWorkout = new EventEmitter<{ day: DayOfWeek, exercises: RoutineExercise[] }>();

    routineName = signal('');
    routineDescription = signal('');
    selectedBodyParts = signal<string[]>([]);
    
    // Weekly Schedule State
    weekDays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    activeDay = signal<DayOfWeek>('Monday');
    weeklySchedule = signal<DailyRoutine[]>([]);
    
    allExercises = signal<Exercise[]>([]);
    filteredExercises = signal<Exercise[]>([]);
    currentBodyPart = signal('');
    isLoading = signal(false);

    bodyParts = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs', 'Cardio'];

    // Computed: Get current day's routine
    currentDayRoutine = computed(() => {
        return this.weeklySchedule().find(d => d.day === this.activeDay())!;
    });

    constructor(private workoutService: WorkoutService) {
        // Initialize empty schedule
        this.initializeSchedule();
    }

    ngOnInit() {
        this.loadExercises();
        
        if (this.routine) {
            this.routineName.set(this.routine.name);
            this.routineDescription.set(this.routine.description || '');
            this.selectedBodyParts.set([...this.routine.targetBodyParts]);
            
            // Handle migration from old format if needed
            if (this.routine.schedule && this.routine.schedule.length > 0) {
                this.weeklySchedule.set(JSON.parse(JSON.stringify(this.routine.schedule)));
            } else if ((this.routine as any).exercises && (this.routine as any).exercises.length > 0) {
                // Migrate single-day routine to Monday
                const currentSchedule = this.weeklySchedule();
                const mondayIndex = currentSchedule.findIndex(d => d.day === 'Monday');
                if (mondayIndex !== -1) {
                    currentSchedule[mondayIndex].exercises = [...(this.routine as any).exercises];
                    this.weeklySchedule.set(currentSchedule);
                }
            }
        }
    }

    initializeSchedule() {
        const schedule: DailyRoutine[] = this.weekDays.map(day => ({
            day,
            isRestDay: false,
            exercises: []
        }));
        this.weeklySchedule.set(schedule);
    }

    loadExercises() {
        this.workoutService.getExercises().subscribe({
            next: (response) => {
                const exercises = response.data || response || [];
                // Ensure exercises have IDs
                const validExercises = exercises.filter((e: any) => e._id || e.id);
                this.allExercises.set(validExercises);
                this.filteredExercises.set(validExercises);
            },
            error: (error) => console.error('Error loading exercises:', error)
        });
    }

    setActiveDay(day: DayOfWeek) {
        this.activeDay.set(day);
    }

    toggleRestDay() {
        const currentSchedule = [...this.weeklySchedule()];
        const dayIndex = currentSchedule.findIndex(d => d.day === this.activeDay());
        
        if (dayIndex !== -1) {
            currentSchedule[dayIndex].isRestDay = !currentSchedule[dayIndex].isRestDay;
            // Clear exercises if setting to rest day
            if (currentSchedule[dayIndex].isRestDay) {
                currentSchedule[dayIndex].exercises = [];
            }
            this.weeklySchedule.set(currentSchedule);
        }
    }

    toggleBodyPart(bodyPart: string) {
        const current = this.selectedBodyParts();
        const index = current.indexOf(bodyPart);
        
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(bodyPart);
        }
        
        this.selectedBodyParts.set([...current]);
    }

    filterExercises(bodyPart: string) {
        this.currentBodyPart.set(bodyPart);
        
        if (!bodyPart) {
            this.filteredExercises.set(this.allExercises());
        } else {
            const filtered = this.allExercises().filter(ex => 
                ex.bodyPart.toLowerCase() === bodyPart.toLowerCase()
            );
            this.filteredExercises.set(filtered);
        }
    }

    addExercise(exercise: Exercise) {
        const currentSchedule = [...this.weeklySchedule()];
        const dayIndex = currentSchedule.findIndex(d => d.day === this.activeDay());
        
        if (currentSchedule[dayIndex].isRestDay) {
            return; // Cannot add to rest day
        }

        const currentExercises = currentSchedule[dayIndex].exercises;
        
        // Check if already added
        if (currentExercises.some(e => e.exerciseId === (exercise._id || exercise.id))) {
            return;
        }
        
        const routineExercise: RoutineExercise = {
            exerciseId: (exercise._id || exercise.id)!,
            name: exercise.name,
            bodyPart: exercise.bodyPart,
            sets: exercise.sets || 3,
            reps: exercise.reps || 12,
            restTime: exercise.restTime || 60,
            notes: ''
        };
        
        currentExercises.push(routineExercise);
        this.weeklySchedule.set(currentSchedule);
    }

    removeExercise(index: number) {
        const currentSchedule = [...this.weeklySchedule()];
        const dayIndex = currentSchedule.findIndex(d => d.day === this.activeDay());
        
        currentSchedule[dayIndex].exercises.splice(index, 1);
        this.weeklySchedule.set(currentSchedule);
    }

    updateExercise(index: number, field: string, value: any) {
        const currentSchedule = [...this.weeklySchedule()];
        const dayIndex = currentSchedule.findIndex(d => d.day === this.activeDay());
        const exercise = currentSchedule[dayIndex].exercises[index];
        
        (exercise as any)[field] = value;
        this.weeklySchedule.set(currentSchedule);
    }

    copyDayTo(targetDay: DayOfWeek) {
        const currentSchedule = [...this.weeklySchedule()];
        const sourceDayIndex = currentSchedule.findIndex(d => d.day === this.activeDay());
        const targetDayIndex = currentSchedule.findIndex(d => d.day === targetDay);
        
        const sourceDay = currentSchedule[sourceDayIndex];
        
        // Deep copy exercises
        currentSchedule[targetDayIndex] = {
            ...currentSchedule[targetDayIndex],
            isRestDay: sourceDay.isRestDay,
            exercises: JSON.parse(JSON.stringify(sourceDay.exercises))
        };
        
        this.weeklySchedule.set(currentSchedule);
        alert(`Copied ${this.activeDay()}'s routine to ${targetDay}`);
    }

    onStartDayWorkout() {
        if (this.currentDayRoutine().isRestDay || this.currentDayRoutine().exercises.length === 0) {
            return;
        }
        this.startDayWorkout.emit({
            day: this.activeDay(),
            exercises: this.currentDayRoutine().exercises
        });
    }

    saveRoutine() {
        if (!this.routineName()) {
            alert('Please provide a routine name.');
            return;
        }

        // Check if at least one day has exercises
        const hasExercises = this.weeklySchedule().some(d => !d.isRestDay && d.exercises.length > 0);
        if (!hasExercises) {
            alert('Please add exercises to at least one day or mark days as Rest Days.');
            return;
        }

        this.isLoading.set(true);
        
        const routineData: Partial<WorkoutRoutine> = {
            name: this.routineName(),
            description: this.routineDescription(),
            targetBodyParts: this.selectedBodyParts(),
            schedule: this.weeklySchedule(),
            isActive: true
        };

        const saveObservable = this.routine 
            ? this.workoutService.updateRoutine(this.routine._id!, routineData)
            : this.workoutService.createRoutine(routineData);

        saveObservable.subscribe({
            next: () => {
                this.isLoading.set(false);
                this.saved.emit();
            },
            error: (error) => {
                console.error('Error saving routine:', error);
                alert('Failed to save routine. Please try again.');
                this.isLoading.set(false);
            }
        });
    }

    cancel() {
        this.cancelled.emit();
    }
}
