import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private darkMode = signal(false);

    constructor() {
        // Check localStorage or system preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const initialDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
        this.darkMode.set(initialDarkMode);
        this.applyTheme(initialDarkMode);
    }

    isDarkMode() {
        return this.darkMode();
    }

    toggleTheme() {
        const newTheme = !this.darkMode();
        this.darkMode.set(newTheme);
        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    }

    private applyTheme(isDark: boolean) {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }
}