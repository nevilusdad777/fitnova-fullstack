import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminUserService, User, UserListResponse } from '../../services/admin-user.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalUsers = 0;
  limit = 10;

  // Filters
  searchTerm = '';
  selectedGoal = '';
  selectedGender = '';

  // Delete confirmation
  showDeleteModal = false;
  userToDelete: User | null = null;

  constructor(
    private adminUserService: AdminUserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    this.adminUserService.getAllUsers(
      this.currentPage,
      this.limit,
      this.searchTerm,
      this.selectedGoal,
      this.selectedGender
    )
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (response: UserListResponse) => {
        this.users = response.users;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalUsers = response.totalUsers;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load users';
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedGoal = '';
    this.selectedGender = '';
    this.currentPage = 1;
    this.loadUsers();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  openDeleteModal(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (this.userToDelete) {
      this.adminUserService.deleteUser(this.userToDelete._id).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.loadUsers();
        },
        error: (err) => {
          this.error = 'Failed to delete user';
          this.closeDeleteModal();
        }
      });
    }
  }
}
