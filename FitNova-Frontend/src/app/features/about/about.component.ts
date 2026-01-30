import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
    LucideAngularModule, 
    Heart, 
    Mail, 
    Rocket,
    Target,
    Users,
    Activity,
    TrendingUp,
    Apple,
    Calendar,
    CheckCircle,
    X
} from 'lucide-angular';
import { ContactFormComponent } from './components/contact-form/contact-form.component';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule, ContactFormComponent],
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})
export class AboutComponent {

    // Icons
    readonly Heart = Heart;
    readonly Mail = Mail;
    readonly Rocket = Rocket;
    readonly Target = Target;
    readonly Users = Users;
    readonly Activity = Activity;
    readonly TrendingUp = TrendingUp;
    readonly Apple = Apple;
    readonly Calendar = Calendar;
    readonly CheckCircle = CheckCircle;
    readonly X = X;

    isScrolled = false;

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.isScrolled = window.scrollY > 50;
    }

    currentView = signal<'default' | 'contact'>('default');

    showContact() { 
        this.currentView.set('contact'); 
    }
    
    closeContact() { 
        this.currentView.set('default'); 
    }
}
