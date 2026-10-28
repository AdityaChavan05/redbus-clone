import { Component, OnInit } from '@angular/core';

export interface AppNotification {
  id: string;
  type: 'booking' | 'schedule' | 'promotional';
  title: string;
  message: string;
  channel: 'push' | 'email';
  timestamp: string;
  deliveryStatus: 'Delivered' | 'Retried' | 'Failed';
  isRead: boolean;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: AppNotification[] = [
    {
      id: 'n1',
      type: 'booking',
      title: 'Booking Confirmed - RB-984210',
      message: 'Your Volvo Multi-Axle sleeper ticket from Bengaluru to Goa is confirmed for Oct 25.',
      channel: 'push',
      timestamp: '2 hours ago',
      deliveryStatus: 'Delivered',
      isRead: false
    },
    {
      id: 'n2',
      type: 'schedule',
      title: 'Departure Reminder',
      message: 'Your bus leaves in 3 hours from Majestic Kempegowda Terminal. Boarding platform 12.',
      channel: 'push',
      timestamp: '5 hours ago',
      deliveryStatus: 'Delivered',
      isRead: false
    },
    {
      id: 'n3',
      type: 'promotional',
      title: 'Special Diwali Discount',
      message: 'Use coupon FESTIVE250 to get ₹250 off on all South-to-West sleeper routes.',
      channel: 'email',
      timestamp: '1 day ago',
      deliveryStatus: 'Delivered',
      isRead: true
    }
  ];

  emailEnabled: boolean = true;
  pushEnabled: boolean = true;
  promotionsOptIn: boolean = true;

  ngOnInit(): void {
    const prefs = localStorage.getItem('rb_notif_prefs');
    if (prefs) {
      try {
        const parsed = JSON.parse(prefs);
        this.emailEnabled = parsed.email;
        this.pushEnabled = parsed.push;
        this.promotionsOptIn = parsed.promotions;
      } catch (e) {}
    }
  }

  savePreferences(): void {
    const prefs = {
      email: this.emailEnabled,
      push: this.pushEnabled,
      promotions: this.promotionsOptIn
    };
    localStorage.setItem('rb_notif_prefs', JSON.stringify(prefs));
    alert('Notification channel preferences updated successfully!');
  }

  markAsRead(item: AppNotification): void {
    item.isRead = true;
  }

  clearHistory(): void {
    this.notifications = [];
  }
}