import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
    LucideAngularModule, 
    Activity, 
    Apple, 
    TrendingUp, 
    Target, 
    Calendar, 
    Flame, 
    BarChart3, 
    Heart, 
    Users, 
    Trophy, 
    Shield, 
    Zap, 
    Check, 
    UserPlus, 
    Play, 
    Rocket,
    CheckCircle,
    Send,
    Star,
    Quote,
    Twitter,
    Facebook,
    Instagram,
    Youtube,
    PlayCircle
} from 'lucide-angular';
import { LandingService, LandingContent, LandingFeature, LandingTestimonial } from '../../core/services/landing.service';

// Map icon name strings → lucide icon objects
const ICON_MAP: Record<string, any> = {
    Activity,
    Apple,
    TrendingUp,
    Target,
    Calendar,
    Flame,
    BarChart3,
    Heart,
    Users,
    Trophy,
    Shield,
    Zap,
    Check,
    UserPlus,
    Play,
    Rocket,
    CheckCircle
};

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
    isScrolled = false;
    isLoading = true;

    // Landing content from backend
    landingContent: LandingContent | null = null;

    // Derived arrays for template binding
    features: (LandingFeature & { icon: any })[] = [];
    testimonials: LandingTestimonial[] = [];

    // Icons for static template elements
    readonly Activity = Activity;
    readonly Apple = Apple;
    readonly TrendingUp = TrendingUp;
    readonly Target = Target;
    readonly Calendar = Calendar;
    readonly Flame = Flame;
    readonly BarChart3 = BarChart3;
    readonly Heart = Heart;
    readonly Users = Users;
    readonly Trophy = Trophy;
    readonly Shield = Shield;
    readonly Zap = Zap;
    readonly Check = Check;
    readonly UserPlus = UserPlus;
    readonly Play = Play;
    readonly Rocket = Rocket;
    readonly CheckCircle = CheckCircle;
    readonly Send = Send;
    readonly Star = Star;
    readonly Quote = Quote;
    readonly Twitter = Twitter;
    readonly Facebook = Facebook;
    readonly Instagram = Instagram;
    readonly Youtube = Youtube;
    readonly PlayCircle = PlayCircle;

    // How It Works Steps (static)
    steps = [
        {
            icon: UserPlus,
            title: 'Create Account',
            description: 'Sign up free in seconds. No credit card required, no commitments. Just create your account and start your journey.'
        },
        {
            icon: Target,
            title: 'Set Your Goals',
            description: "Tell us about your fitness goals and preferences. We'll help you create a personalized plan for success."
        },
        {
            icon: TrendingUp,
            title: 'Track & Achieve',
            description: 'Log workouts, meals, and progress. Watch your transformation with analytics and celebrate every milestone.'
        }
    ];

    constructor(private landingService: LandingService, private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.loadLandingContent();
    }

    loadLandingContent(): void {
        this.isLoading = true;
        this.landingService.getLandingContent().subscribe({
            next: (data) => {
                this.landingContent = data;
                // Attach lucide icon objects to features
                this.features = (data.features || []).map(f => ({
                    ...f,
                    icon: ICON_MAP[f.iconName] || Activity
                }));
                this.testimonials = data.testimonials || [];
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.isScrolled = window.scrollY > 50;
    }

    scrollToSection(sectionId: string): void {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    getStarArray(rating: number): number[] {
        return Array.from({ length: rating || 5 }, (_, i) => i + 1);
    }
}
