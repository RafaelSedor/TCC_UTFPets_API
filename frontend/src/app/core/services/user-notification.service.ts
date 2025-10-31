import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, interval } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification, NotificationResponse, UnreadCountResponse, NotificationStatus } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class UserNotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  // Signal para armazenar contagem de não lidas (reativo)
  unreadCount = signal<number>(0);

  // Signal para armazenar notificações recentes
  notifications = signal<Notification[]>([]);

  constructor() {
    // Atualiza contagem de não lidas a cada 30 segundos
    interval(30000).subscribe(() => {
      this.refreshUnreadCount();
    });
  }

  /**
   * Lista notificações com paginação
   */
  getNotifications(page: number = 1, perPage: number = 20, status?: NotificationStatus): Observable<NotificationResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<NotificationResponse>(this.apiUrl, { params }).pipe(
      tap(response => {
        this.notifications.set(response.data);
        this.unreadCount.set(response.meta.unread_count);
      })
    );
  }

  /**
   * Obtém contagem de notificações não lidas
   */
  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${this.apiUrl}/unread-count`).pipe(
      tap(response => {
        this.unreadCount.set(response.unread_count);
      })
    );
  }

  /**
   * Atualiza contagem de não lidas (método interno)
   */
  private refreshUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }

  /**
   * Marca uma notificação como lida
   */
  markAsRead(notificationId: string): Observable<{ message: string; data: Notification }> {
    return this.http.patch<{ message: string; data: Notification }>(
      `${this.apiUrl}/${notificationId}/read`,
      {}
    ).pipe(
      tap(() => {
        // Atualiza a contagem local
        const currentCount = this.unreadCount();
        if (currentCount > 0) {
          this.unreadCount.set(currentCount - 1);
        }

        // Atualiza o status da notificação na lista local
        const notifications = this.notifications();
        const updatedNotifications = notifications.map(n =>
          n.id === notificationId ? { ...n, status: NotificationStatus.READ } : n
        );
        this.notifications.set(updatedNotifications);
      })
    );
  }

  /**
   * Marca todas as notificações como lidas
   */
  markAllAsRead(): Observable<{ message: string; count: number }> {
    return this.http.post<{ message: string; count: number }>(
      `${this.apiUrl}/mark-all-read`,
      {}
    ).pipe(
      tap(() => {
        // Zera a contagem local
        this.unreadCount.set(0);

        // Atualiza todas as notificações na lista local
        const notifications = this.notifications();
        const updatedNotifications = notifications.map(n => ({ ...n, status: NotificationStatus.READ }));
        this.notifications.set(updatedNotifications);
      })
    );
  }

  /**
   * Inicializa o serviço carregando dados iniciais
   */
  initialize(): void {
    this.getUnreadCount().subscribe();
    this.getNotifications(1, 10).subscribe();
  }

  /**
   * Verifica se uma notificação está lida
   */
  isRead(notification: Notification): boolean {
    return notification.status === NotificationStatus.READ;
  }

  /**
   * Formata a data relativa (ex: "há 5 minutos")
   */
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'agora mesmo';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  }
}
