import { Component, Output, EventEmitter, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, Dumbbell, Calendar, Edit, Trash2, Play, Flame, Eye } from 'lucide-angular';
import { WorkoutService } from '../../workout.service';
import { WorkoutRoutine } from '../../../../core/models/workout.model';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
    selector: 'app-routine-list',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './routine-list.component.html',
    styleUrls: ['./routine-list.component.css']
})
export class RoutineListComponent implements OnInit {
    readonly Plus = Plus;
    readonly Dumbbell = Dumbbell;
    readonly Calendar = Calendar;
    readonly Edit = Edit;
    readonly Trash2 = Trash2;
    readonly Play = Play;
    readonly Flame = Flame;
    readonly Eye = Eye;

    @Output() createRoutine = new EventEmitter<void>();
    @Output() editRoutine = new EventEmitter<WorkoutRoutine>();
    @Output() previewRoutine = new EventEmitter<WorkoutRoutine>();

    routines = signal<WorkoutRoutine[]>([]);
    isLoading = signal(false);
    selectedBodyPart = signal<string>('');

    filteredRoutines = computed(() => {
        const routines = this.routines();
        const bodyPart = this.selectedBodyPart();
        
        if (!bodyPart) return routines;
        
        return routines.filter(r => 
            r.targetBodyParts.some(bp => bp.toLowerCase() === bodyPart.toLowerCase())
        );
    });

    bodyParts = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs', 'Cardio'];

    constructor(private workoutService: WorkoutService) {}

    ngOnInit() {
        this.loadRoutines();
    }

    loadRoutines() {
        this.isLoading.set(true);
        this.workoutService.getRoutines().subscribe({
            next: (response) => {
                this.routines.set(response.data || []);
                this.isLoading.set(false);
            },
            error: (error) => {
                console.error('Error loading routines:', error);
                this.isLoading.set(false);
            }
        });
    }

    filterByBodyPart(bodyPart: string) {
        if (bodyPart === 'All') {
            this.selectedBodyPart.set('');
        } else {
            this.selectedBodyPart.set(bodyPart);
        }
    }

    onCreateRoutine() {
        this.createRoutine.emit();
    }

    onEditRoutine(routine: WorkoutRoutine) {
        this.editRoutine.emit(routine);
    }

    onPreviewRoutine(routine: WorkoutRoutine) {
        this.previewRoutine.emit(routine);
    }

    onDeleteRoutine(routine: WorkoutRoutine, event: Event) {
        event.stopPropagation();
        
        if (confirm(`Are you sure you want to delete "${routine.name}"?`)) {
            this.workoutService.deleteRoutine(routine._id!).subscribe({
                next: () => {
                    this.loadRoutines();
                },
                error: (error) => {
                    console.error('Error deleting routine:', error);
                    alert('Failed to delete routine. Please try again.');
                }
            });
        }
    }

    getBodyPartColor(bodyPart: string): string {
        // Use a consistent subtle glass style instead of rainbow colors
        return 'rgba(255, 255, 255, 0.1)';
    }

    getUniqueBodyParts(bodyParts: string[]): string[] {
        return [...new Set(bodyParts)];
    }

    getExerciseCount(routine: WorkoutRoutine): number {
        if (routine.schedule && routine.schedule.length > 0) {
            return routine.schedule.reduce((total, day) => {
                return total + (day.exercises ? day.exercises.length : 0);
            }, 0);
        }
        // Legacy fallback
        return (routine as any).exercises ? (routine as any).exercises.length : 0;
    }
}
