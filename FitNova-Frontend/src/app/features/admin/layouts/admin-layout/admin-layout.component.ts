import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Users, Dumbbell, Utensils, LogOut, Menu, X } from 'lucide-angular';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="admin-container" [class.sidebar-open]="isSidebarOpen">
      <!-- Sidebar -->
      <aside class="sidebar glass-panel">
        <div class="sidebar-header">
          <h2 class="brand text-gradient">FitNova<span class="text-xs text-muted block">Admin</span></h2>
          <button class="btn-icon mobile-toggle" (click)="toggleSidebar()">
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
            <lucide-icon name="layout-dashboard" [size]="20"></lucide-icon>
            <span>Dashboard</span>
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <lucide-icon name="users" [size]="20"></lucide-icon>
            <span>Users</span>
          </a>
          <a routerLink="/admin/workouts" routerLinkActive="active" class="nav-item">
            <lucide-icon name="dumbbell" [size]="20"></lucide-icon>
            <span>Workouts</span>
          </a>
          <a routerLink="/admin/diets" routerLinkActive="active" class="nav-item">
            <lucide-icon name="utensils" [size]="20"></lucide-icon>
            <span>Diet Plans</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="nav-item logout" (click)="logout()">
            <lucide-icon name="log-out" [size]="20"></lucide-icon>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="top-bar glass-panel flex-between">
          <button class="btn-icon menu-toggle" (click)="toggleSidebar()">
            <lucide-icon name="menu" [size]="24"></lucide-icon>
          </button>
          <div class="user-profile flex-center gap-sm">
            <div class="avatar">A</div>
            <span class="font-medium">Admin</span>
          </div>
        </header>

        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100%;
      background-color: var(--admin-bg);
      overflow: hidden;
    }

    .admin-container {
      display: flex;
      height: 100%;
      position: relative;
    }

    /* Sidebar */
    .sidebar {
      width: 260px;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: var(--space-lg);
      border-right: 1px solid var(--color-border);
      background: var(--admin-sidebar);
      transition: transform var(--transition-base);
      z-index: 50;
    }

    .sidebar-header {
      margin-bottom: var(--space-2xl);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .brand {
      font-size: var(--font-size-2xl);
      line-height: 1;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      border-radius: var(--radius-lg);
      color: var(--color-text-secondary);
      transition: all var(--transition-fast);
      font-weight: var(--font-weight-medium);
    }

    .nav-item:hover {
      background: var(--color-surface-hover);
      color: var(--color-primary);
    }

    .nav-item.active {
      background: var(--color-primary-gradient);
      color: white;
      box-shadow: var(--shadow-colored);
    }

    .nav-item.logout {
      width: 100%;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--color-danger-light);
    }
    
    .nav-item.logout:hover {
      background: var(--color-danger-bg);
      color: var(--color-danger);
    }

    /* Main Content */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      position: relative;
    }

    .top-bar {
      height: var(--header-height);
      padding: 0 var(--space-lg);
      border-bottom: 1px solid var(--color-border);
      z-index: 40;
    }

    .menu-toggle, .mobile-toggle {
      display: none;
      background: transparent;
      border: none;
      color: var(--color-text-primary);
      cursor: pointer;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-full);
      background: var(--color-primary-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }

    .content-wrapper {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-lg);
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .sidebar {
        position: absolute;
        left: 0;
        top: 0;
        transform: translateX(-100%);
        width: 100%;
        max-width: 300px;
      }

      .admin-container.sidebar-open .sidebar {
        transform: translateX(0);
        box-shadow: var(--shadow-2xl);
      }

      .menu-toggle, .mobile-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  `]
})
export class AdminLayoutComponent {
  isSidebarOpen = false;

  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly Dumbbell = Dumbbell;
  readonly Utensils = Utensils;
  readonly LogOut = LogOut;
  readonly Menu = Menu;
  readonly X = X;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    // Implement logout logic
    console.log('Logging out...');
  }
}
