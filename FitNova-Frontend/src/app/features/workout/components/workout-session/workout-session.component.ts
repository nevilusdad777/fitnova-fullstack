import { Component, Output, EventEmitter, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Play, Pause, SkipForward, X, Check, Timer } from 'lucide-angular';
import { WorkoutService } from '../../workout.service';
import { Exercise } from '../../../../core/models/workout.model';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';

interface SessionExercise extends Exercise {
    sets: number;
    reps: number;
    restTime: number;
    caloriesPerSet: number;
}

interface ExerciseProgress {
    exercise: SessionExercise;
    currentSet: number;
    completed: boolean;
}

@Component({
    selector: 'app-workout-session',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, CardComponent, ProgressBarComponent],
    templateUrl: './workout-session.component.html',
    styleUrls: ['./workout-session.component.css']
})
export class WorkoutSessionComponent implements OnDestroy {
    readonly Play = Play;
    readonly Pause = Pause;
    readonly SkipForward = SkipForward;
    readonly X = X;
    readonly Check = Check;
    readonly Timer = Timer;

    @Output() sessionEnded = new EventEmitter<number>();

    exercises = signal<ExerciseProgress[]>([]);
    currentExerciseIndex = signal(0);
    isResting = signal(false);
    restTimeRemaining = signal(0);
    sessionStartTime = signal(Date.now());
    totalCaloriesBurned = signal(0);
    sessionDurationMinutes = computed(() => Math.floor((Date.now() - this.sessionStartTime()) / 60000));

    private restInterval: any;

    currentExercise = computed(() => {
        const exercises = this.exercises();
        const index = this.currentExerciseIndex();
        return exercises[index] || null;
    });

    overallProgress = computed(() => {
        const exercises = this.exercises();
        if (exercises.length === 0) return 0;
        const completedSets = exercises.reduce((sum, ex) => sum + ex.currentSet, 0);
        const totalSets = exercises.reduce((sum, ex) => sum + (ex.exercise.sets || 3), 0);
        return (completedSets / totalSets) * 100;
    });

    sessionDuration = computed(() => {
        const elapsed = Date.now() - this.sessionStartTime();
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    });

    constructor(private workoutService: WorkoutService) {
        this.initializeSession();
    }

    initializeSession() {
        const activeWorkout = this.workoutService.getActiveWorkout();
        this.exercises.set(
            activeWorkout.map(ex => ({
                exercise: {
                    ...ex,
                    sets: ex.sets || 3,
                    reps: ex.reps || 12,
                    restTime: ex.restTime || 60,
                    caloriesPerSet: ex.caloriesPerSet || 50
                } as SessionExercise,
                currentSet: 0,
                completed: false
            }))
        );
    }

    completeSet() {
        const current = this.currentExercise();
        if (!current) return;

        const exercises = this.exercises();
        const index = this.currentExerciseIndex();

        exercises[index].currentSet++;

        const ex = current.exercise;
        this.totalCaloriesBurned.update(val => val + (ex.caloriesPerSet || 50));

        if (exercises[index].currentSet >= (ex.sets || 3)) {
            // Exercise completed - 120 second rest before next exercise
            exercises[index].completed = true;
            this.exercises.set([...exercises]);
            
            const nextIndex = index + 1;
            if (nextIndex < exercises.length) {
                // Start 120 second rest before next exercise
                this.startRest(120);
                // Move to next exercise after countdown
                setTimeout(() => {
                    if (this.currentExerciseIndex() === index) {
                        this.currentExerciseIndex.set(nextIndex);
                    }
                }, 0);
            } else {
                // No more exercises - finish workout
                this.finishWorkout();
            }
        } else {
            // Set completed, but more sets remaining - 60 second rest
            this.exercises.set([...exercises]);
            this.startRest(ex.restTime || 60);
        }
    }

    startRest(seconds: number) {
        this.isResting.set(true);
        this.restTimeRemaining.set(seconds);

        this.restInterval = setInterval(() => {
            if (this.restTimeRemaining() <= 1) {
                this.endRest();
            } else {
                this.restTimeRemaining.update(val => val - 1);
            }
        }, 1000);
    }

    endRest() {
        if (this.restInterval) {
            clearInterval(this.restInterval);
            this.restInterval = null;
        }
        this.isResting.set(false);
    }

    skipRest() {
        this.endRest();
    }

    moveToNextExercise() {
        this.endRest();
        const nextIndex = this.currentExerciseIndex() + 1;
        if (nextIndex < this.exercises().length) {
            this.currentExerciseIndex.set(nextIndex);
        } else {
            this.finishWorkout();
        }
    }

    skipExercise() {
        const exercises = this.exercises();
        const index = this.currentExerciseIndex();
        exercises[index].completed = true;
        this.exercises.set([...exercises]);
        this.moveToNextExercise();
    }

    finishWorkout() {
        this.endRest();
        
        // Helper function to parse reps from string to number
        const parseReps = (reps: any): number => {
            if (typeof reps === 'number') return reps;
            if (typeof reps === 'string') {
                // Handle ranges like "8-10" - take the first number
                const match = reps.match(/(\d+)/);
                return match ? parseInt(match[1]) : 12;
            }
            return 12; // default
        };
        
        // Save workout history
        const activeRoutine = this.workoutService.getActiveRoutine();
        const durationMinutes = Math.max(1, this.sessionDurationMinutes()); // Ensure at least 1 minute
        
        const sessionData = {
            routineId: activeRoutine?._id,
            routineName: activeRoutine?.name || 'Quick Workout',
            exercises: this.exercises().map(ep => ({
                exerciseId: ep.exercise._id,
                name: ep.exercise.name,
                bodyPart: ep.exercise.bodyPart,
                targetSets: ep.exercise.sets || 3,
                completedSets: ep.currentSet,
                targetReps: parseReps(ep.exercise.reps),
                completedReps: ep.currentSet * parseReps(ep.exercise.reps),
                restTime: ep.exercise.restTime || 60,
                caloriesBurned: ep.currentSet * (ep.exercise.caloriesPerSet || 50)
            })),
            totalCaloriesBurned: this.totalCaloriesBurned(),
            duration: durationMinutes,
            date: new Date()
        };

        console.log('Saving workout session:', sessionData);
        this.workoutService.saveWorkoutSession(sessionData).subscribe({
            next: () => {
                console.log('Workout history saved successfully');
            },
            error: (error) => {
                console.error('Error saving workout history:', error);
                console.error('Error details:', error.error);
            }
        });

        this.sessionEnded.emit(this.totalCaloriesBurned());
    }

    cancelWorkout() {
        if (confirm('Are you sure you want to cancel this workout?')) {
            this.endRest();
            this.sessionEnded.emit(0);
        }
    }

    ngOnDestroy() {
        this.endRest();
    }
}
