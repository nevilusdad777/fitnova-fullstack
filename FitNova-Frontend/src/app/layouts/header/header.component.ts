import { Component, signal, inject, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
    LucideAngularModule,
    User, Sun, Moon, LogOut,
    LayoutDashboard, Dumbbell, Apple, BarChart2
} from 'lucide-angular';
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
    readonly Sun = Sun;
    readonly Moon = Moon;
    readonly LogOut = LogOut;

    platformId = inject(PLATFORM_ID);
    authService = inject(AuthService);

    userName = computed(() => this.authService.currentUser()?.name || 'Guest User');
    profilePicture = computed(() => this.authService.currentUser()?.profilePicture);
    userInitials = computed(() => {
        const name = this.userName();
        return name ? name.charAt(0).toUpperCase() : 'G';
    });

    isDarkMode = signal(false);
    isMobileMenuOpen = signal(false);

    navItems = [
        { label: 'Dashboard',  shortLabel: 'Home',     path: '/home',      icon: LayoutDashboard },
        { label: 'Workouts',   shortLabel: 'Workouts', path: '/workout',   icon: Dumbbell        },
        { label: 'Nutrition',  shortLabel: 'Nutrition',path: '/nutrition', icon: Apple           },
        { label: 'Tracker',    shortLabel: 'Tracker',  path: '/tracker',   icon: BarChart2       }
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
