import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LandingContent } from '../../../core/services/landing.service';

@Injectable({
  providedIn: 'root'
})
export class AdminLandingService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getLandingContent(): Observable<LandingContent> {
    return this.http.get<LandingContent>(`${this.apiUrl}/admin/landing-content`);
  }

  updateLandingContent(data: Partial<LandingContent>): Observable<{ message: string; content: LandingContent }> {
    return this.http.put<{ message: string; content: LandingContent }>(
      `${this.apiUrl}/admin/landing-content`,
      data
    );
  }
}
