import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminFoodService, AdminFood, FoodListResponse } from '../../services/admin-food.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-food-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './food-list.component.html',
  styleUrls: ['./food-list.component.css']
})
export class FoodListComponent implements OnInit, OnDestroy {
  foods: AdminFood[] = [];
  loading = true;
  error = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalFoods = 0;
  limit = 10;

  // Filters
  searchTerm = '';
  selectedCategory = '';
  sortField = 'name';
  sortDirection = 'asc';

  // Delete confirmation
  showDeleteModal = false;
  foodToDelete: AdminFood | null = null;

  private searchSubject = new Subject<string>();

  constructor(
    private adminFoodService: AdminFoodService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1;
      this.loadFoods();
    });

    this.loadFoods();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  loadFoods(): void {
    this.loading = true;
    this.error = '';

    this.adminFoodService.getAllFoods(
      this.currentPage,
      this.limit,
      this.searchTerm,
      this.selectedCategory,
      this.sortField,
      this.sortDirection
    )
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (response: FoodListResponse) => {
        this.foods = response.foods;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalFoods = response.totalFoods;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load foods';
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadFoods();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadFoods();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.sortField = 'name';
    this.sortDirection = 'asc';
    this.currentPage = 1;
    this.loadFoods();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadFoods();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadFoods();
    }
  }

  openDeleteModal(food: AdminFood): void {
    this.foodToDelete = food;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.foodToDelete = null;
  }

  confirmDelete(): void {
    if (this.foodToDelete) {
      this.adminFoodService.deleteFood(this.foodToDelete._id).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.loadFoods();
        },
        error: (err) => {
          this.error = 'Failed to delete food';
          this.closeDeleteModal();
        }
      });
    }
  }
}
