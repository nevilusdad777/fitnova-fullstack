import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  sidebarCollapsed = false;
  adminName: string = '';
  adminEmail: string = '';

  constructor(
    private adminAuthService: AdminAuthService,
    private router: Router
  ) {
    console.log('AdminLayout - Constructor');
    const currentAdmin = this.adminAuthService.currentAdminValue;
    if (currentAdmin) {
      this.adminName = currentAdmin.name;
      this.adminEmail = currentAdmin.email;
      console.log('AdminLayout - Current admin:', currentAdmin);
    } else {
      console.log('AdminLayout - No current admin found');
    }
  }

  ngOnInit(): void {
    console.log('AdminLayout - ngOnInit');
    console.log('AdminLayout - isAuthenticated:', this.adminAuthService.isAuthenticated());
    
    // Double check authentication
    if (!this.adminAuthService.isAuthenticated()) {
      console.log('AdminLayout - Not authenticated, redirecting to login');
      this.router.navigate(['/admin/auth/login']);
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    console.log('AdminLayout - Logging out');
    this.adminAuthService.logout();
    this.router.navigate(['/admin/auth/login']);
  }
}
