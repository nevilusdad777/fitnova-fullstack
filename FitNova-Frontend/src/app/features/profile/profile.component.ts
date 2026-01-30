import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, User, Target, Settings, LogOut } from 'lucide-angular';
import { AuthService } from '../auth/auth.service';
import { PersonalDetailsComponent } from './components/personal-details/personal-details.component';
import { GoalsComponent } from './components/goals/goals.component';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule, 
        RouterModule, 
        LucideAngularModule,
        PersonalDetailsComponent,
        GoalsComponent
    ],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
    currentView = signal<'details' | 'goals'>('details');
    
    // Icons
    readonly User = User;
    readonly Target = Target;
    readonly Settings = Settings;
    readonly LogOut = LogOut;

    constructor(private authService: AuthService) {}

    showDetails() {
        this.currentView.set('details');
    }

    showGoals() {
        this.currentView.set('goals');
    }

    logout() {
        this.authService.logout();
    }
}
