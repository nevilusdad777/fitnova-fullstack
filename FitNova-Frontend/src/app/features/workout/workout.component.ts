import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Dumbbell, Calendar, Activity, TrendingUp, Sparkles, CalendarDays, ListChecks, History, Plus } from 'lucide-angular';
import { ExerciseListComponent } from './components/exercise-list/exercise-list.component';
import { WorkoutSessionComponent } from './components/workout-session/workout-session.component';
import { WorkoutPlanGeneratorComponent } from './components/workout-plan-generator/workout-plan-generator.component';
import { WeeklyScheduleComponent } from './components/weekly-schedule/weekly-schedule.component';
import { RoutineListComponent } from './components/routine-list/routine-list.component';
import { RoutineBuilderComponent } from './components/routine-builder/routine-builder.component';
import { WorkoutHistoryComponent } from './components/workout-history/workout-history.component';
import { WorkoutService } from './workout.service';
import { TrackerService } from '../../services/tracker.service';
import { Tracker } from '../../core/models/tracker.model';
import { WorkoutRoutine, Exercise } from '../../core/models/workout.model';

@Component({
    selector: 'app-workout',
    standalone: true,
    imports: [CommonModule, RouterModule, ExerciseListComponent, WorkoutSessionComponent, WorkoutPlanGeneratorComponent, WeeklyScheduleComponent, RoutineListComponent, RoutineBuilderComponent, WorkoutHistoryComponent, LucideAngularModule],
    templateUrl: './workout.component.html',
    styleUrls: ['./workout.component.css']
})
export class WorkoutComponent implements OnInit {
    readonly Calendar = Calendar;
    readonly Dumbbell = Dumbbell;
    readonly Activity = Activity;
    readonly TrendingUp = TrendingUp;
    readonly Sparkles = Sparkles;
    readonly CalendarDays = CalendarDays;
    readonly ListChecks = ListChecks;
    readonly History = History;
    readonly Plus = Plus;

    currentView = signal<'planner' | 'categories' | 'generator' | 'schedule' | 'routines' | 'routine-builder' | 'history'>('schedule');
    isSessionActive = signal(false);
    selectedCategory = signal('');
    editingRoutine = signal<WorkoutRoutine | null>(null);

    todayCaloriesBurned = signal(0);
    weeklyWorkouts = signal(0);
    currentStreak = signal(0);

    constructor(
        private workoutService: WorkoutService,
        private trackerService: TrackerService,
        private router: Router
    ) {
        // Check if we should show history view based on navigation state
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras?.state?.['showHistory']) {
            this.currentView.set('history');
            // Scroll to top when navigating to history from dashboard
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 0);
        }
    }

    ngOnInit() {
        this.loadStats();
    }

    loadStats() {
        this.trackerService.getDashboardStats().subscribe(stats => {
            this.todayCaloriesBurned.set(stats.today.caloriesBurned);
            this.weeklyWorkouts.set(stats.weeklyWorkouts);
            this.currentStreak.set(stats.streak);
        });
    }

    showCategories() {
        this.currentView.set('categories');
    }

    showPlanner() {
        this.currentView.set('planner');
    }

    showGenerator() {
        this.currentView.set('generator');
    }

    showSchedule() {
        this.currentView.set('schedule');
    }

    selectCategory(category: string) {
        this.selectedCategory.set(category);
    }

    startWorkoutSession() {
        this.isSessionActive.set(true);
    }

    endWorkoutSession(calories: number) {
        this.isSessionActive.set(false);
        // Reload stats to reflect the completed workout
        this.loadStats();
        // Optionally switch to history view to show the completed workout
        // this.showHistory();
    }

    onPlanGenerated() {
        // Switch to schedule view after plan is saved
        this.showSchedule();
    }

    showRoutines() {
        this.currentView.set('routines');
    }

    showRoutineBuilder(routine: WorkoutRoutine | null = null) {
        this.editingRoutine.set(routine);
        this.currentView.set('routine-builder');
    }

    showHistory() {
        this.currentView.set('history');
    }

    onRoutineSaved() {
        this.showRoutines();
    }

    onRoutineCancelled() {
        this.showRoutines();
    }

    onEditRoutine(routine: WorkoutRoutine) {
        this.showRoutineBuilder(routine);
    }

    onStartRoutineFromList(routine: WorkoutRoutine) {
        this.workoutService.setActiveRoutine(routine);
        // Convert routine exercises to workout exercises
        const exercises = routine.exercises.map(ex => ({
            _id: ex.exerciseId,
            name: ex.name,
            bodyPart: ex.bodyPart as any,
            sets: ex.sets,
            reps: ex.reps,
            restTime: ex.restTime
        }));
        this.workoutService.setActiveWorkout(exercises);
        this.startWorkoutSession();
    }

    onAddExerciseToRoutine(exercise: Exercise) {
        // Create a new routine draft with this exercise
        const newRoutine: Partial<WorkoutRoutine> = {
            name: 'New Routine',
            description: 'Created from exercise library',
            exercises: [{
                exerciseId: exercise._id!,
                name: exercise.name,
                bodyPart: exercise.bodyPart || '',
                sets: exercise.sets || 3,
                reps: exercise.reps || 12,
                restTime: exercise.restTime || 60
            }]
        };
        this.editingRoutine.set(newRoutine as WorkoutRoutine);
        this.currentView.set('routine-builder');
    }
}
