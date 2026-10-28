import { Component, OnInit } from '@angular/core';

export interface RouteReview {
  id: string;
  reviewerName: string;
  pnr: string;
  isTrusted: boolean;
  rating: number;
  comment: string;
  createdAt: number;
  upvotes: number;
  reported: boolean;
}

@Component({
  selector: 'app-route-reviews',
  templateUrl: './route-reviews.component.html',
  styleUrls: ['./route-reviews.component.css']
})
export class RouteReviewsComponent implements OnInit {
  showForm: boolean = false;
  verifiedPnr: string = '';
  newRating: number = 5;
  newReviewText: string = '';
  errorMessage: string = '';

  stats = {
    averageRating: 4.8,
    totalReviews: 2
  };

  reviews: RouteReview[] = [
    {
      id: 'R1',
      reviewerName: 'Aditya Chavan',
      pnr: 'RB94821034',
      isTrusted: true,
      rating: 5,
      comment: 'Journey completed on 14 Oct. Bus arrived on time at Sion Circle. Punctual departure and very comfortable berth.',
      createdAt: Date.now() - 18000000,
      upvotes: 14,
      reported: false
    },
    {
      id: 'R2',
      reviewerName: 'Rohit Sharma',
      pnr: 'RB87123490',
      isTrusted: false,
      rating: 4,
      comment: 'Polite crew and clean blankets provided. Smooth night drive across the expressway.',
      createdAt: Date.now() - 108000000,
      upvotes: 6,
      reported: false
    }
  ];

  ngOnInit(): void {
    this.recalculateStats();
  }

  isEditable(review: RouteReview): boolean {
    return (Date.now() - review.createdAt) < (24 * 60 * 60 * 1000);
  }

  upvote(review: RouteReview): void {
    review.upvotes++;
    if (review.upvotes >= 10) review.isTrusted = true;
  }

  report(review: RouteReview): void {
    review.reported = true;
    this.recalculateStats();
    alert('Review flagged for guidelines violation.');
  }

  submitReview(): void {
    this.errorMessage = '';
    if (!this.verifiedPnr.trim().toUpperCase().startsWith('RB')) {
      this.errorMessage = 'Only verified passengers with a completed PNR (e.g. RB94821034) can post reviews.';
      return;
    }
    if (this.newReviewText.trim().length < 30) {
      this.errorMessage = 'Please provide detailed feedback (minimum 30 characters).';
      return;
    }

    this.reviews.unshift({
      id: 'R' + Date.now(),
      reviewerName: 'Aditya Chavan',
      pnr: this.verifiedPnr.trim().toUpperCase(),
      isTrusted: true,
      rating: this.newRating,
      comment: this.newReviewText.trim(),
      createdAt: Date.now(),
      upvotes: 0,
      reported: false
    });

    this.newReviewText = '';
    this.verifiedPnr = '';
    this.showForm = false;
    this.recalculateStats();
  }

  recalculateStats(): void {
    const valid = this.reviews.filter(r => !r.reported);
    this.stats.totalReviews = valid.length;
    if (valid.length === 0) {
      this.stats.averageRating = 0;
      return;
    }
    const sum = valid.reduce((acc, curr) => acc + curr.rating, 0);
    this.stats.averageRating = parseFloat((sum / valid.length).toFixed(1));
  }
}
