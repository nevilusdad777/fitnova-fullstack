import { Component, signal, inject, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, User, Search, Sun, Moon, Menu, X, LogOut } from 'lucide-angular';
import { AuthService } from '../../features/auth/auth.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent {
    readonly User = User;
    readonly Search = Search;
    readonly Sun = Sun;
    readonly Moon = Moon;
    readonly Menu = Menu;
    readonly X = X;
    readonly LogOut = LogOut;

    platformId = inject(PLATFORM_ID);
    authService = inject(AuthService);
    
    // Computed signals from AuthService
    userName = computed(() => this.authService.currentUser()?.name || 'Guest User');
    profilePicture = computed(() => this.authService.currentUser()?.profilePicture); // Access dynamic property
    userInitials = computed(() => {
        const name = this.userName();
        return name ? name.charAt(0).toUpperCase() : 'G';
    });

    isDarkMode = signal(false);
    isMobileMenuOpen = signal(false);

    navItems = [
        { label: 'Dashboard', path: '/home' },
        { label: 'Workouts', path: '/workout' },
        { label: 'Nutrition', path: '/nutrition' },
        { label: 'Tracker', path: '/tracker' }
    ];

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            const savedTheme = localStorage.getItem('theme');
            this.isDarkMode.set(savedTheme === 'dark');
            this.updateTheme(this.isDarkMode());
        }
    }

    toggleTheme() {
        this.isDarkMode.update(v => !v);
        this.updateTheme(this.isDarkMode());
    }

    private updateTheme(isDark: boolean) {
        if (isPlatformBrowser(this.platformId)) {
            const theme = isDark ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen.update(v => !v);
    }

    closeMobileMenu() {
        this.isMobileMenuOpen.set(false);
    }
}
