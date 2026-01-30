import { Component, Output, EventEmitter, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, Dumbbell, Calendar, Edit, Trash2, Play, Flame } from 'lucide-angular';
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

    @Output() createRoutine = new EventEmitter<void>();
    @Output() editRoutine = new EventEmitter<WorkoutRoutine>();
    @Output() startRoutine = new EventEmitter<WorkoutRoutine>();

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

    bodyParts = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs', 'Cardio'];

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

    onStartRoutine(routine: WorkoutRoutine) {
        this.startRoutine.emit(routine);
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
        const colors: { [key: string]: string } = {
            'chest': '#667eea',
            'back': '#f5576c',
            'legs': '#00f2fe',
            'shoulders': '#38f9d7',
            'arms': '#fee140',
            'abs': '#330867',
            'cardio': '#FF4B2B'
        };
        return colors[bodyPart.toLowerCase()] || '#667eea';
    }
}
