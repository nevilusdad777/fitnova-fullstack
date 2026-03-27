import { Component, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, CheckCircle, Circle, Play, Dumbbell, CalendarDays, Eye, X, Edit2, Trash2, Save, Plus, Search } from 'lucide-angular';
import { WorkoutService } from '../../workout.service';

interface DaySchedule {
    dayName: string;
    dayOfWeek: number;
    date: string;
    isToday: boolean;
    workoutName?: string;
    exercises?: any[];
    isRestDay: boolean;
    isCompleted?: boolean;
}

@Component({
    selector: 'app-weekly-schedule',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './weekly-schedule.component.html',
    styleUrls: ['./weekly-schedule.component.css']
})
export class WeeklyScheduleComponent implements OnInit {
    readonly CheckCircle = CheckCircle;
    readonly Circle = Circle;
    readonly Play = Play;
    readonly Dumbbell = Dumbbell;
    readonly CalendarDays = CalendarDays;
    readonly Eye = Eye;
    readonly X = X;
    readonly Edit2 = Edit2;
    readonly Trash2 = Trash2;
    readonly Save = Save;
    readonly Plus = Plus;
    readonly Search = Search;

    @Output() workoutStarted = new EventEmitter<any>();

    weekSchedule = signal<DaySchedule[]>([]);
    isLoading = signal(false);
    activePlan = signal<any>(null);
    previewDay = signal<DaySchedule | null>(null);
    editDay = signal<DaySchedule | null>(null);
    editWorkoutName = signal('');
    editExercises = signal<any[]>([]);
    isSaving = signal(false);

    dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Add Exercise functionality
    allExercises = signal<any[]>([]);
    filteredExercises = signal<any[]>([]);
    showExerciseSearch = signal(false);
    searchQuery = signal('');

    constructor(private workoutService: WorkoutService) {}

    ngOnInit() {
        this.loadSchedule();
        this.loadAllExercises();
    }

    loadAllExercises() {
        this.workoutService.getExercises().subscribe({
            next: (res) => {
                const exercises = res.data || res || [];
                this.allExercises.set(exercises);
                this.filteredExercises.set(exercises.slice(0, 20)); // show only top 20 initially
            },
            error: (err) => console.error('Error loading exercises:', err)
        });
    }

    loadSchedule() {
        this.isLoading.set(true);
        
        this.workoutService.getActiveWorkoutPlan().subscribe({
            next: (plan) => {
                if (plan) {
                    this.activePlan.set(plan);
                    // Fetch recent history to mark completed days
                    this.workoutService.getWorkoutHistory({ limit: 14 }).subscribe({
                        next: (history: any) => {
                            const workouts = history.data || history.workouts || [];
                            this.buildWeekSchedule(plan, workouts);
                            this.isLoading.set(false);
                        },
                        error: () => {
                            this.buildWeekSchedule(plan, []);
                            this.isLoading.set(false);
                        }
                    });
                } else {
                    this.buildEmptySchedule();
                    this.isLoading.set(false);
                }
            },
            error: () => {
                this.buildEmptySchedule();
                this.isLoading.set(false);
            }
        });
    }

    buildWeekSchedule(plan: any, recentWorkouts: any[] = []) {
        const today = new Date();
        today.setHours(0,0,0,0);
        const currentDayOfWeek = today.getDay();
        
        const schedule: DaySchedule[] = [];

        for (let i = 0; i < 7; i++) {
            const dayWorkout = plan.schedule?.find((s: any) => s.dayOfWeek === i);
            const dateStr = this.getDateForDay(i);
            
            // Reconstruct the actual date to compare
            const diff = i - currentDayOfWeek;
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + diff);
            // Ignore time for comparison
            targetDate.setHours(0,0,0,0);

            // Check if we have a workout history matching this date
            const isCompleted = recentWorkouts.some(w => {
                const wDate = new Date(w.date || w.createdAt);
                wDate.setHours(0,0,0,0);
                return wDate.getTime() === targetDate.getTime();
            });
            
            schedule.push({
                dayName: this.dayNames[i],
                dayOfWeek: i,
                date: dateStr,
                isToday: i === currentDayOfWeek,
                workoutName: dayWorkout?.name,
                exercises: dayWorkout?.exercises || [],
                isRestDay: !dayWorkout,
                isCompleted: isCompleted && !(!dayWorkout) // If it's a rest day, it doesn't need completion. But if there are exercises, maybe done.
            } as DaySchedule & { isCompleted: boolean });
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

    openPreview(day: DaySchedule) {
        this.previewDay.set(day);
    }

    closePreview() {
        this.previewDay.set(null);
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
                restTime: ex.restSeconds || ex.restTime || 60,
                caloriesPerSet: ex.caloriesPerSet || 50
            }));
            this.workoutService.setActiveWorkout(exercises);
            this.workoutStarted.emit();
        } else {
            alert('No exercises found for this workout day');
        }
    }

    startWorkoutFromPreview() {
        const day = this.previewDay();
        if (day) {
            this.closePreview();
            this.startWorkout(day);
        }
    }

    openEdit(day: DaySchedule) {
        this.editDay.set(day);
        this.editWorkoutName.set(day.workoutName || '');
        this.editExercises.set(JSON.parse(JSON.stringify(day.exercises || [])));
    }

    closeEdit() {
        this.editDay.set(null);
        this.showExerciseSearch.set(false);
        this.searchQuery.set('');
    }

    removeEditExercise(index: number) {
        const current = [...this.editExercises()];
        current.splice(index, 1);
        this.editExercises.set(current);
    }

    toggleExerciseSearch() {
        this.showExerciseSearch.set(!this.showExerciseSearch());
        if (this.showExerciseSearch()) {
            this.filterExercises();
        }
    }

    onSearchInput(event: any) {
        this.searchQuery.set(event.target.value);
        this.filterExercises();
    }

    filterExercises() {
        const query = this.searchQuery().toLowerCase();
        if (!query) {
            this.filteredExercises.set(this.allExercises().slice(0, 20));
            return;
        }
        
        const filtered = this.allExercises().filter(ex => 
            ex.name.toLowerCase().includes(query) || 
            ex.bodyPart.toLowerCase().includes(query)
        );
        this.filteredExercises.set(filtered.slice(0, 50)); // cap at 50 results
    }

    addExercise(exercise: any) {
        const current = [...this.editExercises()];
        
        // Prevent duplicates
        if (current.some(e => (e.exerciseId?._id || e.exerciseId) === exercise._id || e.name === exercise.name)) {
            alert('Exercise already exists in this workout.');
            return;
        }

        current.push({
            exerciseId: exercise._id || exercise.id,
            name: exercise.name,
            bodyPart: exercise.bodyPart,
            sets: exercise.sets || 3,
            reps: exercise.reps || 12,
            restSeconds: exercise.restTime || 60
        });

        this.editExercises.set(current);
        this.showExerciseSearch.set(false);
        this.searchQuery.set('');
    }

    saveEdit() {
        const day = this.editDay();
        const plan = JSON.parse(JSON.stringify(this.activePlan())); // Create a deep copy to mutate safely
        if (!day || !plan) return;

        this.isSaving.set(true);
        
        const extractId = (ex: any) => {
            if (ex.exerciseId) {
                if (typeof ex.exerciseId === 'object') return ex.exerciseId._id;
                return ex.exerciseId;
            }
            return ex._id || ex.id;
        };

        // Sanitize exercises to ensure exerciseId is just a string (undoing the .populate() from backend)
        // AND explicitly convert 'reps' to a string since Mongoose expects an e.g., "10-12" string format.
        // Finally, filter out any orphaned exercises that no longer exist in the DB
        const sanitizedEditExercises = this.editExercises()
            .map(ex => ({
                ...ex,
                exerciseId: extractId(ex),
                reps: ex.reps != null ? String(ex.reps) : "12"
            }))
            .filter((ex: any) => !!ex.exerciseId);

        const scheduleIndex = plan.schedule.findIndex((s: any) => s.dayOfWeek === day.dayOfWeek);
        if (scheduleIndex !== -1) {
            plan.schedule[scheduleIndex].name = this.editWorkoutName();
            plan.schedule[scheduleIndex].exercises = sanitizedEditExercises;
        } else {
            if (!plan.schedule) plan.schedule = [];
            plan.schedule.push({
                dayOfWeek: day.dayOfWeek,
                name: this.editWorkoutName(),
                exercises: sanitizedEditExercises
            });
        }
        
        // Sanitize the rest of the schedule as well, since getActivePlan() populated all days
        if (plan.schedule) {
            plan.schedule.forEach((daySchedule: any) => {
                if (daySchedule.exercises) {
                    daySchedule.exercises = daySchedule.exercises
                        .map((ex: any) => ({
                            ...ex,
                            exerciseId: extractId(ex),
                            reps: ex.reps != null ? String(ex.reps) : "12"
                        }))
                        .filter((ex: any) => !!ex.exerciseId);
                }
            });
        }

        this.workoutService.updateWorkoutPlan(plan._id, plan).subscribe({
            next: () => {
                this.isSaving.set(false);
                this.closeEdit();
                this.loadSchedule(); 
            },
            error: (err) => {
                console.error(err);
                this.isSaving.set(false);
                alert('Failed to save changes. Please try again.');
            }
        });
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
