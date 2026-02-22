export type NotificationType = 'warning' | 'info' | 'success' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string; // Optional link to navigate to
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}
