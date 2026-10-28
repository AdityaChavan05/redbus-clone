import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { url } from '../config';

export interface CommunityComment {
  userId: string;
  userName: string;
  text: string;
  createdAt?: string | Date;
}

export interface CommunityPost {
  _id?: string;
  authorId: string;
  authorName: string;
  isVerifiedAuthor?: boolean;
  isVerifiedPassenger?: boolean;
  title: string;
  content: string;
  category: 'Journey Story' | 'Travel Tip' | 'Destination' | 'Route Advice' | string;
  route?: string;
  imageUrl?: string;
  likes: string[];
  comments: CommunityComment[];
  reports?: { userId: string; reason: string; createdAt: Date }[];
  status?: 'approved' | 'flagged' | 'hidden' | string;
  shares?: number;
  rating?: number;
  fraudScore?: number;
  fraudFlags?: string[];
  isFlagged?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private apiUrl = url + 'api/community/';

  constructor(private http: HttpClient) {}

  getPosts(category?: string, sort?: string, search?: string): Observable<CommunityPost[]> {
    const params: string[] = [];
    if (category && category !== 'All') params.push(`category=${encodeURIComponent(category)}`);
    if (sort) params.push(`sort=${encodeURIComponent(sort)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);

    const queryStr = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<CommunityPost[]>(`${this.apiUrl}posts${queryStr}`);
  }

  createPost(post: Partial<CommunityPost>): Observable<CommunityPost> {
    return this.http.post<CommunityPost>(`${this.apiUrl}posts`, post);
  }

  toggleLike(postId: string, userId: string = '660000000000000000000001'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}posts/${postId}/like`, { userId });
  }

  addComment(postId: string, userId: string, userName: string, text: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}posts/${postId}/comments`, { userId, userName, text });
  }

  reportPost(postId: string, userId: string = 'user_anon', reason: string = 'Inappropriate content'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}posts/${postId}/report`, { userId, reason });
  }

  getModerationQueue(): Observable<CommunityPost[]> {
    return this.http.get<CommunityPost[]>(`${this.apiUrl}moderation`);
  }

  moderatePost(postId: string, action: 'approve' | 'hide' | 'remove'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}moderate/${postId}`, { action });
  }

  trackShare(postId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}posts/${postId}/share`, {});
  }

  getUserActivity(userId: string = '660000000000000000000001'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}activity/${userId}`);
  }
}