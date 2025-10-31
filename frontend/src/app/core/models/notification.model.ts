export enum NotificationStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  READ = 'read',
  FAILED = 'failed'
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push'
}

export interface Notification {
  id: string;
  user_id: number;
  title: string;
  body: string;
  data?: Record<string, any>;
  channel: NotificationChannel;
  status: NotificationStatus;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  data: Notification[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    unread_count: number;
  };
}

export interface UnreadCountResponse {
  unread_count: number;
}
