import { computed, Injectable, signal } from '@angular/core';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
  link?: string;
  actionLabel?: string;
}

const INITIAL_MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'success',
    title: 'Report generated successfully',
    message: 'Monthly sales and performance report for September is ready to download.',
    createdAt: Date.now() - 1000 * 60 * 5, // 5 min ago
    read: false,
    link: '/reports',
    actionLabel: 'View Report',
  },
  {
    id: 'notif-2',
    type: 'warning',
    title: 'High CPU utilization detected',
    message: 'Production database instance CPU reached 88% over the last 15 minutes.',
    createdAt: Date.now() - 1000 * 60 * 42, // 42 min ago
    read: false,
    link: '/metrics',
    actionLabel: 'Check Metrics',
  },
  {
    id: 'notif-3',
    type: 'info',
    title: 'New team member invited',
    message: 'sarah.connor@example.com was invited to the DevOps group.',
    createdAt: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    read: true,
  },
  {
    id: 'notif-4',
    type: 'error',
    title: 'Webhook delivery failed',
    message: 'Stripe payment event webhook failed after 3 automatic retries.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    read: true,
    actionLabel: 'Retry Webhook',
  },
];

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _notifications = signal<AppNotification[]>(INITIAL_MOCK_NOTIFICATIONS);
  readonly notifications = this._notifications.asReadonly();

  readonly unreadCount = computed(() => {
    return this._notifications().filter(n => !n.read).length;
  });

  readonly unreadCountDisplay = computed(() => {
    const c = this.unreadCount();
    if (c === 0) return '';
    return c > 99 ? '99+' : String(c);
  });

  markAsRead(id: string): void {
    this._notifications.update(list =>
      list.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }

  markAllAsRead(): void {
    this._notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  remove(id: string): void {
    this._notifications.update(list => list.filter(n => n.id !== id));
  }

  add(item: Omit<AppNotification, 'id' | 'createdAt' | 'read'> & Partial<Pick<AppNotification, 'id' | 'createdAt' | 'read'>>): string {
    const id = item.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newNotif: AppNotification = {
      ...item,
      id,
      createdAt: item.createdAt ?? Date.now(),
      read: item.read ?? false,
    };
    this._notifications.update(list => [newNotif, ...list]);
    return id;
  }

  clear(): void {
    this._notifications.set([]);
  }
}
