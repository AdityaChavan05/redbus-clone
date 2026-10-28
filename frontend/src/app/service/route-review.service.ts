import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { url } from '../config';

export interface RouteReviewItem {
  _id: string;
  routeKey: string;
  busName: string;
  userId: string;
  userName: string;
  bookingId: string;
  journeyDate: string;
  rating: number;
  reviewText: string;
  upvotes: string[];
  reportCount: number;
  isHidden: boolean;
  isVerifiedPassenger: boolean;
  isTrustedReviewer?: boolean;
  isEditable?: boolean;
  hoursLeftToEdit?: number;
  createdAt: string | Date;
}

export interface RouteStats {
  averageRating: number;
  totalReviews: number;
  breakdown: { [stars: number]: number };
}

@Injectable({
  providedIn: 'root'
})
export class RouteReviewService {
  private apiUrl = url + 'api/reviews/';

  constructor(private http: HttpClient) {}

  getRouteReviews(routeKey: string): Observable<{ routeKey: string; stats: RouteStats; reviews: RouteReviewItem[] }> {
    return this.http.get<any>(`${this.apiUrl}route/${encodeURIComponent(routeKey)}`);
  }

  createReview(payload: {
    routeKey: string;
    busName?: string;
    userId: string;
    userName: string;
    bookingId: string;
    journeyDate?: string;
    rating: number;
    reviewText: string;
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateReview(id: string, payload: { rating?: number; reviewText?: string; userId?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${id}`, payload);
  }

  upvoteReview(id: string, userId: string = '660000000000000000000001'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}${id}/upvote`, { userId });
  }

  reportReview(id: string, userId: string = 'user_anon', reason: string = 'Content guideline violation'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}${id}/report`, { userId, reason });
  }

  getEligibleTrips(userId: string = '660000000000000000000001'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}eligible-trips/${userId}`);
  }
}
