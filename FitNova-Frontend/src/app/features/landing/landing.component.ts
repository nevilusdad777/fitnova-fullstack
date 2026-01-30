import { Component, HostListener } from '@angular/core';
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

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.css']
})
export class LandingComponent {
    isScrolled = false;

    // Icons
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

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.isScrolled = window.scrollY > 50;
    }

    // Smooth scroll to section
    scrollToSection(sectionId: string): void {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 80; // Account for fixed navbar
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,  
                behavior: 'smooth'
            });
        }
    }

    // Features with modern images
    features = [
        {
            icon: Activity,
            title: 'Workout Tracking',
            description: 'Track every rep, set, and exercise with precision. Monitor your performance across different muscle groups and visualize your strength gains over time.',
            image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
            iconBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            points: [
                'Log exercises with sets and reps',
                'Track body part workouts',
                'View detailed workout history',
                'Monitor calories burned'
            ]
        },
        {
            icon: Apple,
            title: 'Nutrition Planning',
            description: 'Plan your meals with our extensive food database. Track calories, macros, and nutrients to fuel your body optimally for your fitness goals.',
            image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
            iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            points: [
                'Extensive food database',
                'Track calories and macros',
                'Weekly meal planning',
                'Daily nutrition monitoring'
            ]
        },
        {
            icon: BarChart3,
            title: 'Progress Analytics',
            description: 'Visualize your fitness journey with interactive charts. Track weight changes, workout consistency, and identify patterns to optimize your training.',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
            iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            points: [
                'Interactive progress charts',
                'Weight tracking over time',
                'Consistency metrics',
                'Performance analysis'
            ]
        },
        {
            icon: Heart,
            title: 'Health Monitoring',
            description: 'Monitor your overall health metrics including water intake, sleep quality, and body measurements to ensure holistic wellness.',
            image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80',
            iconBg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            points: [
                'Track water intake daily',
                'Monitor body measurements',
                'Sleep quality tracking',
                'Overall wellness score'
            ]
        },
        {
            icon: Users,
            title: 'Community Support',
            description: 'Connect with thousands of fitness enthusiasts. Share achievements, get motivated, and grow together on your fitness journey.',
            image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
            iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            points: [
                'Join fitness community',
                'Share achievements',
                'Get motivation daily',
                'Connect with others'
            ]
        },
        {
            icon: Trophy,
            title: 'Achievement System',
            description: 'Stay motivated with our achievement and streak system. Celebrate milestones and maintain consistency with gamified tracking.',
            image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
            iconBg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            points: [
                'Earn achievements',
                'Build workout streaks',
                'Track milestones',
                'Unlock badges'
            ]
        }
    ];

    // How It Works Steps
    steps = [
        {
            icon: UserPlus,
            title: 'Create Account',
            description: 'Sign up free in seconds. No credit card required, no commitments. Just create your account and start your journey.'
        },
        {
            icon: Target,
            title: 'Set Your Goals',
            description: 'Tell us about your fitness goals and preferences. We\'ll help you create a personalized plan for success.'
        },
        {
            icon: TrendingUp,
            title: 'Track & Achieve',
            description: 'Log workouts, meals, and progress. Watch your transformation with analytics and celebrate every milestone.'
        }
    ];

    // Testimonials
    testimonials = [
        {
            text: 'FitNova completely transformed how I approach fitness. The analytics helped me understand my progress and stay motivated!',
            name: 'Sarah Johnson',
            role: 'Fitness Enthusiast',
            initials: 'SJ'
        },
        {
            text: 'The workout tracking is incredibly detailed and the nutrition planning feature is a game-changer. I\'ve lost 15 pounds in 3 months!',
            name: 'Michael Chen',
            role: 'Weight Loss Journey',
            initials: 'MC'
        },
        {
            text: 'As a personal trainer, I recommend FitNova to all my clients. It\'s the most comprehensive fitness app I\'ve ever used.',
            name: 'Emma Davis',
            role: 'Personal Trainer',
            initials: 'ED'
        }
    ];
}
