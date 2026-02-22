import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminAdminsService, Admin, AdminListResponse } from '../../services/admin-admins.service';
import { AdminAuthService } from '../../services/admin-auth.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.css']
})
export class AdminListComponent implements OnInit, OnDestroy {
  admins: Admin[] = [];
  loading = true;
  error = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalAdmins = 0;
  limit = 10;

  // Filters
  searchTerm = '';
  selectedRole = '';

  // Delete confirmation
  showDeleteModal = false;
  adminToDelete: Admin | null = null;
  
  // Auth
  currentAdminId: string | undefined;

  private searchSubject = new Subject<string>();

  constructor(
    private adminService: AdminAdminsService,
    private adminAuthService: AdminAuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const me = this.adminAuthService.currentAdminValue;
    if(me) {
      this.currentAdminId = me._id;
    }

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1;
      this.loadAdmins();
    });

    this.loadAdmins();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  loadAdmins(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.adminService.getAllAdmins(
      this.currentPage,
      this.limit,
      this.searchTerm,
      this.selectedRole
    )
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (response: AdminListResponse) => {
        this.admins = response.admins;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalAdmins = response.totalAdmins;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 403) {
          this.error = 'Access denied. Only SuperAdmins can view and manage admins.';
        } else {
          this.error = 'Failed to load admins';
        }
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadAdmins();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadAdmins();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.currentPage = 1;
    this.loadAdmins();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadAdmins();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAdmins();
    }
  }

  openDeleteModal(admin: Admin): void {
    this.adminToDelete = admin;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.adminToDelete = null;
  }

  confirmDelete(): void {
    if (this.adminToDelete) {
      this.adminService.deleteAdmin(this.adminToDelete._id).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.loadAdmins();
        },
        error: (err) => {
          this.error = 'Failed to delete admin';
          this.closeDeleteModal();
        }
      });
    }
  }
}
