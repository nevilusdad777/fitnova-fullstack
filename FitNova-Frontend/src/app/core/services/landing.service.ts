import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LandingHero {
  badgeText: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
}

export interface LandingStat {
  value: string;
  label: string;
}

export interface LandingFeature {
  _id?: string;
  title: string;
  description: string;
  image: string;
  iconName: string;
  iconBg: string;
  points: string[];
}

export interface LandingTestimonial {
  _id?: string;
  text: string;
  name: string;
  role: string;
  initials: string;
  rating: number;
}

export interface LandingContent {
  _id?: string;
  hero: LandingHero;
  stats: LandingStat[];
  features: LandingFeature[];
  testimonials: LandingTestimonial[];
}

@Injectable({
  providedIn: 'root'
})
export class LandingService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getLandingContent(): Observable<LandingContent> {
    return this.http.get<LandingContent>(`${this.apiUrl}/landing-content`).pipe(
      catchError(err => {
        console.error('Failed to load landing content:', err);
        return of(this.getDefaultContent());
      })
    );
  }

  private getDefaultContent(): LandingContent {
    return {
      hero: {
        badgeText: 'Your Fitness Revolution Starts Here',
        title: 'Unleash Your Strength',
        description: 'Transform your body and mind with FitNova - the ultimate fitness companion that tracks workouts, optimizes nutrition, and drives real results.',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
        ctaText: 'Start Your Journey'
      },
      stats: [
        { value: '100% Free', label: 'No Premium Paywalls' },
        { value: 'No Ads', label: 'Pure Fitness Experience' },
        { value: 'Smart System', label: 'Personalized Insights' },
        { value: 'Secure', label: 'Your Data is Private' }
      ],
      features: [],
      testimonials: []
    };
  }
}
