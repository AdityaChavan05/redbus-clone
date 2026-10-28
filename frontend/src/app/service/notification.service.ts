import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { url } from '../config';

export interface NotificationItem {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'booking_confirmation' | 'cancellation' | 'schedule_change' | 'journey_reminder' | 'promotional';
  channel: 'in_app' | 'email' | 'push';
  status: 'delivered' | 'failed' | 'retrying';
  retryCount: number;
  isRead: boolean;
  language: string;
  metadata?: any;
  createdAt: string | Date;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  in_app: boolean;
  promotional: boolean;
  preferredLanguage?: string;
}

const DEFAULT_NOTIFS: NotificationItem[] = [
  {
    _id: 'notif_init_1',
    recipient: '660000000000000000000001',
    title: 'Booking Confirmed! 🎫',
    message: 'Your bus journey from Hyderabad to Mumbai is confirmed. Ticket Ref: RB84920192. Have a safe journey!',
    type: 'booking_confirmation',
    channel: 'in_app',
    status: 'delivered',
    retryCount: 0,
    isRead: false,
    language: 'en',
    metadata: { bookingRef: 'RB84920192', from: 'Hyderabad', to: 'Mumbai' },
    createdAt: new Date(Date.now() - 3600000 * 2)
  },
  {
    _id: 'notif_init_2',
    recipient: '660000000000000000000001',
    title: 'Upcoming Journey Reminder 🚌',
    message: 'Reminder: Your bus to Mumbai departs tonight at 18:00. Boarding point: Main Terminal (Opposite Metro Pillar 12).',
    type: 'journey_reminder',
    channel: 'push',
    status: 'delivered',
    retryCount: 0,
    isRead: false,
    language: 'en',
    metadata: { to: 'Mumbai', time: '18:00' },
    createdAt: new Date(Date.now() - 3600000 * 5)
  },
  {
    _id: 'notif_init_3',
    recipient: '660000000000000000000001',
    title: 'Schedule Update Alert ⏰',
    message: 'Departure time for VRL Travels has been updated to 18:30 due to toll congestion. Please arrive on time.',
    type: 'schedule_change',
    channel: 'email',
    status: 'delivered',
    retryCount: 0,
    isRead: true,
    language: 'en',
    metadata: { newTime: '18:30' },
    createdAt: new Date(Date.now() - 3600000 * 15)
  },
  {
    _id: 'notif_init_4',
    recipient: '660000000000000000000001',
    title: 'Exclusive Weekend Offer! 🎉',
    message: 'Use coupon code "SUPERBUS" to get flat 15% off on luxury Volvo sleepers this weekend!',
    type: 'promotional',
    channel: 'push',
    status: 'failed',
    retryCount: 1,
    isRead: false,
    language: 'en',
    metadata: { code: 'SUPERBUS' },
    createdAt: new Date(Date.now() - 3600000 * 24)
  }
];

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = url + 'api/notifications/';

  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  notifications$: Observable<NotificationItem[]> = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$: Observable<number> = this.unreadCountSubject.asObservable();

  private preferencesSubject = new BehaviorSubject<NotificationPreferences>({
    email: true,
    push: true,
    in_app: true,
    promotional: true
  });
  preferences$: Observable<NotificationPreferences> = this.preferencesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initLocal();
    this.loadNotifications('660000000000000000000001');
  }

  private initLocal(): void {
    const cached = localStorage.getItem('user_notifications');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        this.updateState(parsed);
      } catch (e) {
        this.updateState(DEFAULT_NOTIFS);
      }
    } else {
      this.updateState(DEFAULT_NOTIFS);
    }

    const cachedPrefs = localStorage.getItem('notification_preferences');
    if (cachedPrefs) {
      try {
        this.preferencesSubject.next(JSON.parse(cachedPrefs));
      } catch (e) {}
    }
  }

  private updateState(items: NotificationItem[]): void {
    this.notificationsSubject.next(items);
    const unread = items.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unread);
    localStorage.setItem('user_notifications', JSON.stringify(items));
  }

  loadNotifications(userId: string = '660000000000000000000001'): void {
    this.http.get<any>(`${this.apiUrl}${userId}`).subscribe({
      next: (res) => {
        if (res && res.notifications && Array.isArray(res.notifications)) {
          this.updateState(res.notifications);
        }
      },
      error: () => {
        // Retain local state
      }
    });
  }

  sendNotification(payload: Partial<NotificationItem>): Observable<any> {
    return new Observable(observer => {
      this.http.post<any>(`${this.apiUrl}send`, payload).subscribe({
        next: (created) => {
          const list = [created, ...this.notificationsSubject.value];
          this.updateState(list);
          observer.next(created);
          observer.complete();
        },
        error: () => {
          // Local fallback creation
          const fallbackItem: NotificationItem = {
            _id: 'notif_' + Date.now(),
            recipient: payload.recipient || '660000000000000000000001',
            title: payload.title || 'TedBus Alert',
            message: payload.message || 'You have a new update.',
            type: payload.type || 'booking_confirmation',
            channel: payload.channel || 'in_app',
            status: payload.status || 'delivered',
            retryCount: 0,
            isRead: false,
            language: payload.language || 'en',
            metadata: payload.metadata || {},
            createdAt: new Date()
          };
          const list = [fallbackItem, ...this.notificationsSubject.value];
          this.updateState(list);
          observer.next(fallbackItem);
          observer.complete();
        }
      });
    });
  }

  markAsRead(id: string): void {
    const list = this.notificationsSubject.value.map(n =>
      n._id === id ? { ...n, isRead: true } : n
    );
    this.updateState(list);

    this.http.put(`${this.apiUrl}${id}/read`, {}).subscribe({
      error: () => {}
    });
  }

  markAllAsRead(userId: string = '660000000000000000000001'): void {
    const list = this.notificationsSubject.value.map(n => ({ ...n, isRead: true }));
    this.updateState(list);

    this.http.put(`${this.apiUrl}read-all/${userId}`, {}).subscribe({
      error: () => {}
    });
  }

  retryNotification(id: string): void {
    const list = this.notificationsSubject.value.map(n =>
      n._id === id ? { ...n, status: 'delivered' as const, retryCount: n.retryCount + 1 } : n
    );
    this.updateState(list);

    this.http.post(`${this.apiUrl}${id}/retry`, {}).subscribe({
      error: () => {}
    });
  }

  updatePreferences(prefs: NotificationPreferences, userId: string = '660000000000000000000001'): void {
    this.preferencesSubject.next(prefs);
    localStorage.setItem('notification_preferences', JSON.stringify(prefs));

    this.http.put(`${this.apiUrl}preferences/${userId}`, prefs).subscribe({
      error: () => {}
    });
  }

  // Quick event simulation helper for demonstration & tests
  simulateEvent(
    type: 'booking_confirmation' | 'cancellation' | 'schedule_change' | 'journey_reminder' | 'promotional',
    lang: string = 'en'
  ): void {
    const channelMap: { [key: string]: 'in_app' | 'email' | 'push' } = {
      booking_confirmation: 'in_app',
      cancellation: 'email',
      schedule_change: 'email',
      journey_reminder: 'push',
      promotional: 'push'
    };

    const titles: { [lang: string]: { [k: string]: string } } = {
      en: {
        booking_confirmation: 'Booking Confirmed! 🎫',
        cancellation: 'Booking Cancelled ⚠️',
        schedule_change: 'Schedule Update Alert ⏰',
        journey_reminder: 'Upcoming Journey Reminder 🚌',
        promotional: 'Exclusive Weekend Offer! 🎉'
      },
      hi: {
        booking_confirmation: 'बुकिंग की पुष्टि हो गई! 🎫',
        cancellation: 'बुकिंग रद्द कर दी गई ⚠️',
        schedule_change: 'समय सारिणी अपडेट अलर्ट ⏰',
        journey_reminder: 'आगामी यात्रा अनुस्मारक 🚌',
        promotional: 'विशेष सप्ताहांत ऑफ़र! 🎉'
      },
      kn: {
        booking_confirmation: 'ಬುಕಿಂಗ್ ಖಚಿತಪಟ್ಟಿದೆ! 🎫',
        cancellation: 'ಬುಕಿಂಗ್ ರದ್ದುಗೊಂಡಿದೆ ⚠️',
        schedule_change: 'ವೇಳಾಪಟ್ಟಿ ನವೀಕರಣ ಎಚ್ಚರಿಕೆ ⏰',
        journey_reminder: 'ಮುಂಬರುವ ಪ್ರಯಾಣದ ಜ್ಞಾಪನೆ 🚌',
        promotional: 'ವಿಶೇಷ ವಾರಾಂತ್ಯದ ಕೊಡುಗೆ! 🎉'
      }
    };

    const messages: { [lang: string]: { [k: string]: string } } = {
      en: {
        booking_confirmation: 'Your bus journey from Bengaluru to Goa is confirmed. Ref: RB' + Math.floor(100000 + Math.random() * 900000) + '. Have a great trip!',
        cancellation: 'Your booking has been cancelled. Refund will be processed to your source account within 3 business days.',
        schedule_change: 'Departure time updated to 21:30 due to highway construction near toll. Please plan accordingly.',
        journey_reminder: 'Reminder: Your bus departs in 3 hours from Majestic Platform 4.',
        promotional: 'Flat 20% discount on AC Sleeper tickets with code SUPERBUS valid this weekend!'
      },
      hi: {
        booking_confirmation: 'बेंगलुरु से गोवा के लिए आपकी बस यात्रा की पुष्टि हो गई है। संदर्भ: RB' + Math.floor(100000 + Math.random() * 900000) + '। यात्रा सुखद हो!',
        cancellation: 'आपकी बुकिंग रद्द कर दी गई है। रिफंड 3 दिनों के भीतर प्राप्त होगा।',
        schedule_change: 'हाइवे ट्रैफिक के कारण प्रस्थान समय 21:30 कर दिया गया है।',
        journey_reminder: 'याद दिलाएं: आपकी बस 3 घंटे में मजेस्टिक प्लेटफॉर्म 4 से रवाना होगी।',
        promotional: 'इस सप्ताहांत स्लीपर टिकटों पर कोड SUPERBUS के साथ 20% की छूट!'
      },
      kn: {
        booking_confirmation: 'ಬೆಂಗಳೂರಿನಿಂದ ಗೋವಾಕ್ಕೆ ನಿಮ್ಮ ಬಸ್ ಪ್ರಯಾಣ ಖಚಿತಪಟ್ಟಿದೆ. ಟಿಕೆಟ್ ರೆಫ್: RB' + Math.floor(100000 + Math.random() * 900000) + '.',
        cancellation: 'ನಿಮ್ಮ ಬುಕಿಂಗ್ ರದ್ದಾಗಿದೆ. 3 ದಿನಗಳಲ್ಲಿ ಮರುಪಾವತಿ ಮಾಡಲಾಗುತ್ತದೆ.',
        schedule_change: 'ಹೊರಡುವ ಸಮಯವನ್ನು 21:30 ಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.',
        journey_reminder: 'ಜ್ಞಾಪನೆ: ನಿಮ್ಮ ಬಸ್ ಮೆಜೆಸ್ಟಿಕ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ 4 ರಿಂದ 3 ಗಂಟೆಗಳಲ್ಲಿ ಹೊರಡಲಿದೆ.',
        promotional: 'ಈ ವಾರಾಂತ್ಯದಲ್ಲಿ SUPERBUS ಕೋಡ್ ಬಳಸಿ ಸ್ಲೀಪರ್ ಟಿಕೆಟ್‌ಗಳಲ್ಲಿ 20% ರಿಯಾಯಿತಿ ಪಡೆಯಿರಿ!'
      }
    };

    const effectiveLang = ['en', 'hi', 'kn'].includes(lang) ? lang : 'en';

    this.sendNotification({
      type,
      channel: channelMap[type] || 'in_app',
      language: effectiveLang,
      title: titles[effectiveLang][type] || titles['en'][type],
      message: messages[effectiveLang][type] || messages['en'][type],
      status: (type === 'promotional' && Math.random() < 0.4) ? 'failed' : 'delivered'
    }).subscribe();
  }
}
