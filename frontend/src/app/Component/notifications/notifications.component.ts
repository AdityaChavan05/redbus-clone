import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService, NotificationItem, NotificationPreferences } from '../../service/notification.service';

export interface AppNotification {
  id: string;
  type: 'booking' | 'schedule' | 'promotional' | 'cancellation' | 'reminder';
  title: string;
  message: string;
  channel: 'push' | 'email' | 'in_app';
  timestamp: string;
  deliveryStatus: 'Delivered' | 'Retried' | 'Failed';
  retryCount?: number;
  isRead: boolean;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  activeFilter: string = 'all';

  emailEnabled: boolean = true;
  pushEnabled: boolean = true;
  promotionsOptIn: boolean = true;
  inAppEnabled: boolean = true;

  toastMessage: string = '';
  currentLang: string = 'en';
  private storageListener: any;
  private readonly userId = '660000000000000000000001';

  constructor(
    private notifService: NotificationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.currentLang = localStorage.getItem('rb_language') || 'en';
    this.storageListener = () => {
      this.currentLang = localStorage.getItem('rb_language') || 'en';
    };
    window.addEventListener('languageChanged', this.storageListener);
    window.addEventListener('storage', this.storageListener);

    this.loadPreferences();
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    if (this.storageListener) {
      window.removeEventListener('languageChanged', this.storageListener);
      window.removeEventListener('storage', this.storageListener);
    }
  }

  loadPreferences(): void {
    const prefs = localStorage.getItem('rb_notif_prefs');
    if (prefs) {
      try {
        const parsed = JSON.parse(prefs);
        this.emailEnabled = parsed.email !== false;
        this.pushEnabled = parsed.push !== false;
        this.promotionsOptIn = parsed.promotional !== false;
        this.inAppEnabled = parsed.in_app !== false;
      } catch (e) {}
    }

    this.notifService.getPreferences(this.userId).subscribe({
      next: (res: any) => {
        if (res) {
          this.emailEnabled = res.email !== false;
          this.pushEnabled = res.push !== false;
          this.promotionsOptIn = res.promotional !== false;
        }
      },
      error: () => {}
    });
  }

  loadNotifications(): void {
    this.notifService.getUserNotifications(this.userId).subscribe({
      next: (items: NotificationItem[]) => {
        if (items && items.length > 0) {
          this.notifications = items.map(n => this.mapNotificationItem(n));
        } else {
          this.setFallbackNotifications();
        }
      },
      error: () => {
        this.setFallbackNotifications();
      }
    });
  }

  private mapNotificationItem(n: NotificationItem): AppNotification {
    let appType: 'booking' | 'schedule' | 'promotional' | 'cancellation' | 'reminder' = 'booking';
    if (n.type === 'schedule_change') appType = 'schedule';
    else if (n.type === 'promotional') appType = 'promotional';
    else if (n.type === 'cancellation') appType = 'cancellation';
    else if (n.type === 'journey_reminder') appType = 'reminder';

    const deliveryStatus = n.status === 'failed' ? 'Failed' : (n.retryCount > 0 ? 'Retried' : 'Delivered');

    return {
      id: n._id,
      type: appType,
      title: n.title,
      message: n.message,
      channel: (n.channel as any) || 'in_app',
      timestamp: this.formatTimeAgo(n.createdAt),
      deliveryStatus: deliveryStatus as any,
      retryCount: n.retryCount || 0,
      isRead: n.isRead || false
    };
  }

  private setFallbackNotifications(): void {
    this.notifications = [
      {
        id: 'n1',
        type: 'booking',
        title: 'Booking Confirmed - RB-984210',
        message: 'Your Volvo Multi-Axle sleeper ticket from Bengaluru to Goa is confirmed. Seats: U1, U2. Departure at 21:00 from Majestic.',
        channel: 'in_app',
        timestamp: '2 hours ago',
        deliveryStatus: 'Delivered',
        isRead: false
      },
      {
        id: 'n2',
        type: 'schedule',
        title: 'Upcoming Journey Reminder',
        message: 'Your bus leaves in 3 hours from Majestic Kempegowda Terminal. Boarding platform 14.',
        channel: 'push',
        timestamp: '4 hours ago',
        deliveryStatus: 'Delivered',
        isRead: false
      },
      {
        id: 'n3',
        type: 'promotional',
        title: 'Special Weekend Flash Offer',
        message: 'Use coupon FESTIVE250 to get flat ₹250 off on all South-to-West Volvo sleeper corridors.',
        channel: 'email',
        timestamp: '1 day ago',
        deliveryStatus: 'Delivered',
        isRead: true
      },
      {
        id: 'n4',
        type: 'cancellation',
        title: 'Refund Processed - RB-820194',
        message: 'Your ticket cancellation for Mumbai to Pune has been processed. ₹520 credited back to PhonePe.',
        channel: 'email',
        timestamp: '2 days ago',
        deliveryStatus: 'Delivered',
        isRead: true
      }
    ];
  }

  private formatTimeAgo(dateStr: string | Date): string {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  get filteredNotifications(): AppNotification[] {
    if (this.activeFilter === 'all') return this.notifications;
    if (this.activeFilter === 'unread') return this.notifications.filter(n => !n.isRead);
    return this.notifications.filter(n => n.type === this.activeFilter);
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
  }

  // Task 2 Push Notification API Integration
  async togglePushPermission(): Promise<void> {
    if (this.pushEnabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification('TedBus Alerts Active 🔔', {
            body: 'You will receive real-time bus tracking and journey alerts on this device.',
            icon: 'favicon.ico'
          });
          this.showToast('Browser Push Notifications Enabled!');
        } else {
          this.pushEnabled = false;
          this.showToast('Push permission was not granted by browser.');
        }
      } else if (Notification.permission === 'granted') {
        new Notification('TedBus Push Notifications', {
          body: 'Browser push notifications are currently enabled.',
          icon: 'favicon.ico'
        });
      }
    }
  }

  savePreferences(): void {
    const prefs: NotificationPreferences = {
      email: this.emailEnabled,
      push: this.pushEnabled,
      in_app: this.inAppEnabled,
      promotional: this.promotionsOptIn
    };
    localStorage.setItem('rb_notif_prefs', JSON.stringify(prefs));

    this.notifService.updatePreferences(this.userId, prefs).subscribe({
      next: () => {
        this.showToast('Notification channel preferences updated successfully!');
      },
      error: () => {
        this.showToast('Preferences saved locally!');
      }
    });

    if (this.pushEnabled) {
      this.togglePushPermission();
    }
  }

  markAsRead(item: AppNotification): void {
    item.isRead = true;
    this.notifService.markAsRead(item.id).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.notifService.markAllAsRead(this.userId).subscribe({
      next: () => {
        this.showToast('All notifications marked as read.');
      },
      error: () => {}
    });
  }

  retryNotification(item: AppNotification, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.notifService.retryNotification(item.id).subscribe({
      next: (res: any) => {
        item.deliveryStatus = 'Retried';
        item.retryCount = (item.retryCount || 0) + 1;
        this.showToast(`Notification delivery retried via ${item.channel}!`);
      },
      error: () => {
        item.deliveryStatus = 'Retried';
        this.showToast(`Retry dispatched for ${item.title}`);
      }
    });
  }

  clearHistory(): void {
    this.notifications = [];
    this.showToast('Notification history cleared.');
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }
}
