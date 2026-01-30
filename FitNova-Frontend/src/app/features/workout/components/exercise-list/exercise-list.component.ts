import { Component, Input, Output, EventEmitter, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Dumbbell, Clock, Repeat, Play, Check, X, Plus, Info } from 'lucide-angular';
import { WorkoutService, WorkoutCategory } from '../../workout.service';
import { Exercise } from '../../../../core/models/workout.model';

@Component({
    selector: 'app-exercise-list',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './exercise-list.component.html',
    styleUrls: ['./exercise-list.component.css']
})
export class ExerciseListComponent implements OnInit, OnDestroy {
    readonly Dumbbell = Dumbbell;
    readonly Clock = Clock;
    readonly Repeat = Repeat;
    readonly Play = Play;
    readonly Check = Check;
    readonly X = X;
    readonly Plus = Plus;
    readonly Info = Info;

    @Input() selectedCategory: string = '';
    @Output() categorySelected = new EventEmitter<string>();
    @Output() startSession = new EventEmitter<void>();
    @Output() addToRoutineEvent = new EventEmitter<Exercise>();

    categories = signal<WorkoutCategory[]>([]);
    allExercises = signal<Exercise[]>([]);
    exercises = signal<Exercise[]>([]);
    
    // UI State
    selectedDifficulty: string = '';
    selectedExercise = signal<Exercise | null>(null);
    modalImage = signal<string>('');
    private modalInterval: any;

    // Animation State
    activeImageIndex: {[key: string]: number} = {};
    animationIntervals: {[key: string]: any} = {};

    constructor(private workoutService: WorkoutService) {
        this.categories.set(this.workoutService.getWorkoutCategories());
    }

    ngOnInit() {
        // Load all exercises initially
        this.workoutService.getExercises().subscribe((response: any) => {
            const exercises = response.data || response || [];
            this.allExercises.set(exercises);
            this.exercises.set(exercises); // Show all exercises by default
            
            if (this.selectedCategory) {
                this.filterExercises();
            }
        });
    }

    ngOnDestroy() {
        Object.keys(this.animationIntervals).forEach(key => clearInterval(this.animationIntervals[key]));
        if (this.modalInterval) clearInterval(this.modalInterval);
        document.body.style.overflow = '';
    }

    getExerciseId(ex: Exercise): string | undefined {
        return ex._id || ex.id;
    }

    startAnimation(exerciseId: string | undefined) {
        if (!exerciseId) return;
        
        // Stop any existing
        this.stopAnimation(exerciseId);

        // Preload images if needed? Browser usually caches after first load.
        // Initialize to 0
        this.activeImageIndex[exerciseId] = 0;

        // Start interval - FASTER for smoother toggle (2 frames matches "breathing" if slow, but action if fast)
        this.animationIntervals[exerciseId] = setInterval(() => {
            const current = this.activeImageIndex[exerciseId] || 0;
            // Assuming 2 frames usually
            const ex = this.exercises().find(e => (e._id || e.id) === exerciseId);
            const count = ex?.images?.length || 2;
            this.activeImageIndex[exerciseId] = (current + 1) % count;
        }, 500); 
    }

    stopAnimation(exerciseId: string | undefined) {
        if (!exerciseId) return;
        if (this.animationIntervals[exerciseId]) {
            clearInterval(this.animationIntervals[exerciseId]);
            delete this.animationIntervals[exerciseId];
        }
        this.activeImageIndex[exerciseId] = 0; // Reset to start
    }

    getActiveImage(ex: Exercise): string {
        // Prioritize GIF if available (User request: "gif should be played")
        if (ex.gifUrl && ex.gifUrl.length > 5) { // Simple check for non-empty
             return ex.gifUrl;
        }

        const id = this.getExerciseId(ex);
        if (ex.images && ex.images.length > 1 && id) {
            const index = this.activeImageIndex[id] || 0;
            return ex.images[index];
        }
        return ex.images?.[0] || '';
    }

    selectCategory(categoryName: string) {
        this.selectedCategory = categoryName === this.selectedCategory ? '' : categoryName;
        this.categorySelected.emit(this.selectedCategory);
        this.filterExercises();
    }

    selectDifficulty(difficulty: string) {
        this.selectedDifficulty = difficulty === this.selectedDifficulty ? '' : difficulty;
        this.filterExercises();
    }

    private filterExercises() {
        let filtered = this.allExercises();

        // Filter by category (bodyPart)
        if (this.selectedCategory) {
            filtered = filtered.filter(ex => 
                ex.bodyPart?.toLowerCase() === this.selectedCategory.toLowerCase()
            );
        }

        // Filter by difficulty
        if (this.selectedDifficulty) {
            filtered = filtered.filter(ex => 
                ex.difficulty?.toLowerCase() === this.selectedDifficulty.toLowerCase()
            );
        }
        
        this.exercises.set(filtered);
    }

    openExerciseDetails(ex: Exercise) {
        this.selectedExercise.set(ex);
        document.body.style.overflow = 'hidden'; // Lock background scroll
        
        // Specific animation logic for Modal using Signals for guaranteed updates
        if (ex.gifUrl && ex.gifUrl.length > 5) {
            this.modalImage.set(ex.gifUrl);
        } else if (ex.images && ex.images.length > 0) {
            let idx = 0;
            this.modalImage.set(ex.images[0]);
            
            if (ex.images.length > 1) {
                // Clear any existing modal interval
                if (this.modalInterval) clearInterval(this.modalInterval);
                
                this.modalInterval = setInterval(() => {
                    idx = (idx + 1) % ex.images!.length;
                    this.modalImage.set(ex.images![idx]);
                }, 600); // 600ms swap for slideshow effect
            }
        }
    }

    closeExerciseDetails() {
        if (this.modalInterval) {
            clearInterval(this.modalInterval);
            this.modalInterval = null;
        }
        this.selectedExercise.set(null);
        this.modalImage.set('');
        document.body.style.overflow = ''; // Restore background scroll
    }

    addToRoutine(ex: Exercise, event?: Event) {
        event?.stopPropagation(); // Prevent opening modal if clicked on card button
        this.addToRoutineEvent.emit(ex);
        // Optional: Show toast feedback here
    }

    getDifficultyVariant(difficulty: string | undefined): 'success' | 'warning' | 'danger' {
        if (!difficulty) return 'success';
        switch (difficulty.toLowerCase()) {
            case 'beginner':
                return 'success';
            case 'intermediate':
                return 'warning';
            case 'advanced':
                return 'danger';
            default:
                return 'success';
        }
    }

    getEstimatedCalories(ex: Exercise | null): string {
        if (!ex) return '0 kcal';
        // Base estimation logic
        // Strength/Hypertrophy: ~3-5 kcal/min
        // Cardio/Plyo: ~8-12 kcal/min
        // Stretching: ~2 kcal/min
        
        const type = ex.category?.toLowerCase() || '';
        const level = ex.difficulty?.toLowerCase() || 'beginner';
        
        let multiplier = 4; // base for strength
        
        if (type.includes('cardio') || type.includes('plyo')) {
            multiplier = 9;
        } else if (type.includes('stretch') || type.includes('yoga')) {
            multiplier = 2.5;
        } else if (type.includes('power') || type.includes('strongman')) {
            multiplier = 6;
        }

        if (level === 'advanced') multiplier *= 1.2;
        if (level === 'intermediate') multiplier *= 1.1;

        // Estimate for a typical 3 set x 12 rep session taking ~5-8 mins
        // or just return burn rate. User asked "how much calories will be burned"
        // Let's give a rate per session (approx 5 mins of activity)
        const sessionBurn = Math.round(multiplier * 5); // 5 mins active time
        
        return `~${sessionBurn}-${sessionBurn + 15} kcal / session`;
    }

    getBenefits(ex: Exercise | null): string {
        if (!ex) return '';
        const muscle = ex.bodyPart || 'body';
        const prime = ex.primaryMuscles ? ex.primaryMuscles.join(', ') : muscle;
        const sec = ex.secondaryMuscles && ex.secondaryMuscles.length > 0 ? ` It also engages your ${ex.secondaryMuscles.join(', ')}.` : '';
        
        return `This ${ex.difficulty || ''} level exercise primarily targets your ${prime}, helping to build strength and definition.${sec} Incorporating this into your routine enhances ${muscle} stability.`;
    }
}