import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface NotificationPreferences {
  userId?: string;
  // Short property names used by notifications.component.ts
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  whatsapp?: boolean;
  bookingConfirmation?: boolean;
  scheduleChange?: boolean;
  journeyReminder?: boolean;
  cancellation?: boolean;
  promotional?: boolean;

  // Extended property names for compatibility across other components
  emailAlerts?: boolean;
  smsAlerts?: boolean;
  pushAlerts?: boolean;
  whatsappAlerts?: boolean;
  departureReminders?: boolean;
  delayAlerts?: boolean;
  promotionalOffers?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  [key: string]: any;
}

export type NotificationTypeUnion =
  | 'booking'
  | 'booking_confirmation'
  | 'reminder'
  | 'journey_reminder'
  | 'schedule'
  | 'schedule_change'
  | 'delay'
  | 'promo'
  | 'promotional'
  | 'cancellation'
  | 'system'
  | 'safety'
  | string;

export interface NotificationItem {
  id: string;
  _id: string;
  userId?: string;
  title: string;
  message: string;
  type: NotificationTypeUnion;
  channel: 'email' | 'sms' | 'push' | 'whatsapp' | string;
  status: 'sent' | 'delivered' | 'failed' | 'pending' | string;
  isRead: boolean;
  read?: boolean;
  timestamp: Date | string;
  createdAt: string;
  pnr?: string;
  route?: string;
  retryCount?: number;
  metadata?: any;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly PREFS_KEY = 'rb_notification_prefs';
  private readonly NOTIFS_KEY = 'rb_user_notifications';

  private defaultPreferences: NotificationPreferences = {
    userId: 'USR-1001',
    email: true,
    sms: true,
    push: true,
    whatsapp: true,
    bookingConfirmation: true,
    scheduleChange: true,
    journeyReminder: true,
    cancellation: true,
    promotional: false,
    emailAlerts: true,
    smsAlerts: true,
    pushAlerts: true,
    whatsappAlerts: true,
    departureReminders: true,
    delayAlerts: true,
    promotionalOffers: false,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00'
  };

  private defaultNotifications: NotificationItem[] = [
    {
      id: 'NOTIF-101',
      _id: 'NOTIF-101',
      userId: 'USR-1001',
      title: 'Booking Confirmed • PNR RB849201',
      message: 'Your seat L4 on VRL Travels (Volvo 9600 Multi-Axle) is confirmed. Boarding at 09:00 PM.',
      type: 'booking_confirmation',
      channel: 'whatsapp',
      status: 'delivered',
      isRead: false,
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      pnr: 'RB849201',
      route: 'Bengaluru → Mumbai'
    },
    {
      id: 'NOTIF-102',
      _id: 'NOTIF-102',
      userId: 'USR-1001',
      title: 'Journey Reminder • 2 Hours to Go',
      message: 'Coach KA-01-AB-9600 has passed technical inspection and is arriving at Majestic Platform 14.',
      type: 'journey_reminder',
      channel: 'push',
      status: 'delivered',
      isRead: false,
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      pnr: 'RB849201',
      route: 'Bengaluru → Mumbai'
    },
    {
      id: 'NOTIF-103',
      _id: 'NOTIF-103',
      userId: 'USR-1001',
      title: 'Schedule Update • Boarding Point Timing',
      message: 'Pickup at Anand Rao Circle is on schedule for 08:30 PM. Live GPS link is active.',
      type: 'schedule_change',
      channel: 'sms',
      status: 'sent',
      isRead: true,
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      pnr: 'RB849201',
      route: 'Bengaluru → Mumbai'
    },
    {
      id: 'NOTIF-104',
      _id: 'NOTIF-104',
      userId: 'USR-1001',
      title: 'Exclusive Coupon SUPERHIT Unlocked',
      message: 'Use code SUPERHIT on your next booking to save ₹200 on Primo Sleeper coaches.',
      type: 'promotional',
      channel: 'email',
      status: 'delivered',
      isRead: true,
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
    },
    {
      id: 'NOTIF-105',
      _id: 'NOTIF-105',
      userId: 'USR-1001',
      title: 'SMS Gateway Delivery Retry',
      message: 'Secondary SMS alert to alternate contact failed due to network timeout. Click retry to resend.',
      type: 'cancellation',
      channel: 'sms',
      status: 'failed',
      isRead: false,
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      retryCount: 1
    }
  ];

  private preferencesSubject = new BehaviorSubject<NotificationPreferences>(this.loadSavedPreferences());
  preferences$: Observable<NotificationPreferences> = this.preferencesSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<NotificationItem[]>(this.loadSavedNotifications());
  notifications$: Observable<NotificationItem[]> = this.notificationsSubject.asObservable();

  constructor() {}

  private loadSavedPreferences(): NotificationPreferences {
    try {
      const raw = localStorage.getItem(this.PREFS_KEY);
      if (raw) {
        return { ...this.defaultPreferences, ...JSON.parse(raw) };
      }
    } catch {}
    return { ...this.defaultPreferences };
  }

  private normalizeItem(item: any, index: number): NotificationItem {
    const fallbackId = item._id || item.id || `NOTIF-${100 + index}`;
    const isoTime = item.createdAt || (item.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString());
    const readState = Boolean(item.isRead ?? item.read ?? false);
    return {
      ...item,
      id: fallbackId,
      _id: fallbackId,
      createdAt: isoTime,
      timestamp: isoTime,
      isRead: readState,
      read: readState
    };
  }

  private loadSavedNotifications(): NotificationItem[] {
    try {
      const raw = localStorage.getItem(this.NOTIFS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((it, idx) => this.normalizeItem(it, idx));
        }
      }
    } catch {}
    return this.defaultNotifications.map((it, idx) => this.normalizeItem(it, idx));
  }

  private saveNotifications(list: NotificationItem[]): void {
    const normalized = list.map((it, idx) => this.normalizeItem(it, idx));
    try {
      localStorage.setItem(this.NOTIFS_KEY, JSON.stringify(normalized));
    } catch {}
    this.notificationsSubject.next(normalized);
  }

  getPreferences(userId?: string): Observable<NotificationPreferences> {
    return this.preferences$;
  }

  getUserNotifications(userId?: string): Observable<NotificationItem[]> {
    return this.notifications$;
  }

  updatePreferences(
    arg1: string | Partial<NotificationPreferences>,
    arg2?: Partial<NotificationPreferences>
  ): Observable<NotificationPreferences> {
    const incoming = typeof arg1 === 'string' ? (arg2 || {}) : arg1;
    const prefs: NotificationPreferences = {
      ...this.preferencesSubject.value,
      ...incoming,
      email: incoming.email ?? incoming.emailAlerts ?? this.preferencesSubject.value.email,
      sms: incoming.sms ?? incoming.smsAlerts ?? this.preferencesSubject.value.sms,
      push: incoming.push ?? incoming.pushAlerts ?? this.preferencesSubject.value.push,
      emailAlerts: incoming.emailAlerts ?? incoming.email ?? this.preferencesSubject.value.emailAlerts,
      smsAlerts: incoming.smsAlerts ?? incoming.sms ?? this.preferencesSubject.value.smsAlerts,
      pushAlerts: incoming.pushAlerts ?? incoming.push ?? this.preferencesSubject.value.pushAlerts
    };

    try {
      localStorage.setItem(this.PREFS_KEY, JSON.stringify(prefs));
    } catch {}
    this.preferencesSubject.next(prefs);
    return of(prefs);
  }

  markAsRead(id: string): Observable<NotificationItem[]> {
    const updated = this.notificationsSubject.value.map(item =>
      item.id === id || item._id === id ? { ...item, isRead: true, read: true } : item
    );
    this.saveNotifications(updated);
    return of(updated);
  }

  markAllAsRead(userId?: string): Observable<NotificationItem[]> {
    const updated = this.notificationsSubject.value.map(item => ({
      ...item,
      isRead: true,
      read: true
    }));
    this.saveNotifications(updated);
    return of(updated);
  }

  retryNotification(id: string): Observable<NotificationItem | null> {
    let retriedItem: NotificationItem | null = null;
    const nowIso = new Date().toISOString();
    const updated = this.notificationsSubject.value.map(item => {
      if (item.id === id || item._id === id) {
        retriedItem = {
          ...item,
          status: 'delivered',
          timestamp: nowIso,
          createdAt: nowIso,
          retryCount: (item.retryCount || 0) + 1
        };
        return retriedItem;
      }
      return item;
    });
    this.saveNotifications(updated);
    return of(retriedItem);
  }

  pushNotification(partial: Partial<NotificationItem>): Observable<NotificationItem> {
    const newId = 'NOTIF-' + Math.floor(1000 + Math.random() * 9000);
    const nowIso = new Date().toISOString();
    const newItem: NotificationItem = {
      id: newId,
      _id: newId,
      userId: partial.userId || 'USR-1001',
      title: partial.title || 'System Notification',
      message: partial.message || '',
      type: partial.type || 'booking_confirmation',
      channel: partial.channel || 'push',
      status: partial.status || 'delivered',
      isRead: false,
      read: false,
      timestamp: nowIso,
      createdAt: nowIso,
      pnr: partial.pnr,
      route: partial.route
    };
    const updated = [newItem, ...this.notificationsSubject.value];
    this.saveNotifications(updated);
    return of(newItem);
  }

  deleteNotification(id: string): Observable<NotificationItem[]> {
    const updated = this.notificationsSubject.value.filter(item => item.id !== id && item._id !== id);
    this.saveNotifications(updated);
    return of(updated);
  }

  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(item => !item.isRead).length;
  }
}