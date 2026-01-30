import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AdminService, User } from '../services/admin.service';
import { LucideAngularModule, Trash2, Edit, Search, UserPlus } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="users-container fade-in" *ngIf="users$ | async as users">
      <div class="flex-between mb-lg">
        <div>
          <h2>User Management</h2>
          <p>Manage your platform users</p>
        </div>
        <button class="btn btn-primary">
          <lucide-icon name="user-plus" [size]="18"></lucide-icon> Add User
        </button>
      </div>

      <div class="card glass-panel p-0 overflow-hidden">
        <!-- Toolbar -->
        <div class="p-md border-b flex-between bg-surface-hover">
          <div class="search-box relative">
            <lucide-icon name="search" [size]="18" class="search-icon"></lucide-icon>
            <input type="text" placeholder="Search users..." class="form-input pl-xl">
          </div>
          <div class="flex gap-sm">
            <button class="btn btn-secondary btn-icon"><lucide-icon name="filter" [size]="18"></lucide-icon></button>
          </div>
        </div>

        <!-- Table -->
        <div class="table-responsive">
          <table class="table w-full">
            <thead>
              <tr>
                <th class="text-left">User</th>
                <th class="text-left">Status</th>
                <th class="text-left">Role</th>
                <th class="text-left">Joined</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td>
                  <div class="flex-center gap-md justify-start">
                    <div class="avatar-sm">{{ user.name.charAt(0) }}</div>
                    <div class="flex-column">
                      <span class="font-medium text-primary">{{ user.name }}</span>
                      <span class="text-secondary text-sm">{{ user.email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge" [ngClass]="user.status === 'active' ? 'badge-success' : 'badge-secondary'">
                    {{ user.status }}
                  </span>
                </td>
                <td>{{ user.role | titlecase }}</td>
                <td>{{ user.createdAt | date:'mediumDate' }}</td>
                <td class="text-right">
                  <div class="flex justify-end gap-sm">
                    <button class="btn-icon-sm text-primary hover-bg"><lucide-icon name="edit" [size]="16"></lucide-icon></button>
                    <button class="btn-icon-sm text-danger hover-bg" (click)="deleteUser(user._id)"><lucide-icon name="trash-2" [size]="16"></lucide-icon></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .p-0 { padding: 0; }
    .overflow-hidden { overflow: hidden; }
    .border-b { border-bottom: 1px solid var(--color-border); }
    .p-md { padding: var(--space-md); }
    .bg-surface-hover { background-color: var(--color-surface-hover); }
    .pl-xl { padding-left: var(--space-xl); }
    .justify-start { justify-content: flex-start; }
    .justify-end { justify-content: flex-end; }
    
    .search-box { position: relative; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); }
    
    .form-input {
      background: var(--color-background);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      width: 250px;
    }
    
    .table { border-collapse: collapse; }
    .table th {
      padding: var(--space-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      border-bottom: 1px solid var(--color-border);
      font-size: var(--font-size-sm);
    }
    
    .table td {
      padding: var(--space-md);
      border-bottom: 1px solid var(--color-border);
      vertical-align: middle;
    }
    
    .table tr:last-child td { border-bottom: none; }
    .table tr:hover { background-color: var(--color-surface-hover); }
    
    .avatar-sm {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      background: var(--color-primary-gradient);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: var(--font-size-sm);
    }
    
    .badge {
      display: inline-flex;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
    }
    
    .badge-success { background: var(--color-success-bg); color: var(--color-success); }
    .badge-secondary { background: var(--color-surface-hover); color: var(--color-text-secondary); }
    
    .btn-icon-sm {
      background: transparent;
      border: none;
      border-radius: var(--radius-sm);
      padding: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .hover-bg:hover { background-color: var(--color-surface-hover); }
    .text-danger { color: var(--color-danger); }
  `]
})
export class UsersComponent implements OnInit {
  users$: Observable<User[]> | undefined;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.users$ = this.adminService.getUsers();
  }

  deleteUser(id: string) {
    if(confirm('Are you sure you want to delete this user?')) {
        this.adminService.deleteUser(id).subscribe(() => {
            this.loadUsers(); // Reload list to update view
        });
    }
  }
}
