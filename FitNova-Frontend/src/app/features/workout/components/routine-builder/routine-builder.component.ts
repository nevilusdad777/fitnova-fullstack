import { Component, Output, EventEmitter, Input, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, X, Save, ArrowLeft, Dumbbell } from 'lucide-angular';
import { WorkoutService } from '../../workout.service';
import { WorkoutRoutine, RoutineExercise, Exercise } from '../../../../core/models/workout.model';

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

    @Input() routine: WorkoutRoutine | null = null;
    @Output() saved = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    routineName = signal('');
    routineDescription = signal('');
    selectedBodyParts = signal<string[]>([]);
    selectedExercises = signal<RoutineExercise[]>([]);
    
    allExercises = signal<Exercise[]>([]);
    filteredExercises = signal<Exercise[]>([]);
    currentBodyPart = signal('');
    isLoading = signal(false);

    bodyParts = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs', 'Cardio'];

    constructor(private workoutService: WorkoutService) {}

    ngOnInit() {
        this.loadExercises();
        
        if (this.routine) {
            this.routineName.set(this.routine.name);
            this.routineDescription.set(this.routine.description || '');
            this.selectedBodyParts.set([...this.routine.targetBodyParts]);
            this.selectedExercises.set([...this.routine.exercises]);
        }
    }

    loadExercises() {
        this.workoutService.getExercises().subscribe({
            next: (response) => {
                const exercises = response.data || response || [];
                this.allExercises.set(exercises);
                this.filteredExercises.set(exercises);
            },
            error: (error) => console.error('Error loading exercises:', error)
        });
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
        const current = this.selectedExercises();
        
        // Check if already added
        if (current.some(e => e.exerciseId === exercise._id)) {
            return;
        }
        
        const routineExercise: RoutineExercise = {
            exerciseId: exercise._id!,
            name: exercise.name,
            bodyPart: exercise.bodyPart,
            sets: exercise.sets || 3,
            reps: exercise.reps || 12,
            restTime: exercise.restTime || 60,
            notes: ''
        };
        
        current.push(routineExercise);
        this.selectedExercises.set([...current]);
    }

    removeExercise(index: number) {
        const current = this.selectedExercises();
        current.splice(index, 1);
        this.selectedExercises.set([...current]);
    }

    updateExercise(index: number, field: string, value: any) {
        const current = this.selectedExercises();
        (current[index] as any)[field] = value;
        this.selectedExercises.set([...current]);
    }

    saveRoutine() {
        if (!this.routineName() || this.selectedExercises().length === 0) {
            alert('Please provide a routine name and add at least one exercise.');
            return;
        }

        this.isLoading.set(true);
        
        const routineData: Partial<WorkoutRoutine> = {
            name: this.routineName(),
            description: this.routineDescription(),
            targetBodyParts: this.selectedBodyParts(),
            exercises: this.selectedExercises(),
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
