import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminExerciseService, AdminExercise, ExerciseListResponse } from '../../services/admin-exercise.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.css']
})
export class ExerciseListComponent implements OnInit, OnDestroy {
  exercises: AdminExercise[] = [];
  loading = true;
  error = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalExercises = 0;
  limit = 10;

  // Filters
  searchTerm = '';
  selectedBodyPart = '';
  selectedDifficulty = '';

  // Delete confirmation
  showDeleteModal = false;
  exerciseToDelete: AdminExercise | null = null;

  private searchSubject = new Subject<string>();

  constructor(
    private adminExerciseService: AdminExerciseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1;
      this.loadExercises();
    });

    this.loadExercises();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  loadExercises(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.adminExerciseService.getAllExercises(
      this.currentPage,
      this.limit,
      this.searchTerm,
      this.selectedBodyPart,
      this.selectedDifficulty
    )
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (response: ExerciseListResponse) => {
        this.exercises = response.exercises;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalExercises = response.totalExercises;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load exercises';
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadExercises();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadExercises();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedBodyPart = '';
    this.selectedDifficulty = '';
    this.currentPage = 1;
    this.loadExercises();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadExercises();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadExercises();
    }
  }

  openDeleteModal(exercise: AdminExercise): void {
    this.exerciseToDelete = exercise;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.exerciseToDelete = null;
  }

  confirmDelete(): void {
    if (this.exerciseToDelete) {
      this.adminExerciseService.deleteExercise(this.exerciseToDelete._id).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.loadExercises();
        },
        error: (err) => {
          this.error = 'Failed to delete exercise';
          this.closeDeleteModal();
        }
      });
    }
  }
}
