import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserNotificationService } from '../services/user-notification.service';
import { Notification, NotificationStatus } from '../models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <!-- Bell Icon Button -->
      <button
        (click)="togglePanel()"
        class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Notificações"
      >
        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        <!-- Unread Badge -->
        @if (notificationService.unreadCount() > 0) {
          <span class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px]">
            {{ notificationService.unreadCount() > 99 ? '99+' : notificationService.unreadCount() }}
          </span>
        }
      </button>

      <!-- Dropdown Panel -->
      @if (isPanelOpen()) {
        <div class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          <!-- Header -->
          <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-lg">
            <h3 class="text-lg font-semibold text-gray-900">Notificações</h3>
            @if (notificationService.unreadCount() > 0) {
              <button
                (click)="markAllAsRead()"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Marcar todas como lidas
              </button>
            }
          </div>

          <!-- Notifications List -->
          <div class="overflow-y-auto flex-1">
            @if (notificationService.notifications().length === 0) {
              <div class="px-4 py-12 text-center">
                <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p class="text-gray-500 text-sm">Nenhuma notificação</p>
              </div>
            } @else {
              @for (notification of notificationService.notifications(); track notification.id) {
                <div
                  (click)="handleNotificationClick(notification)"
                  class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
                  [class.bg-blue-50]="!notificationService.isRead(notification)"
                >
                  <div class="flex items-start space-x-3">
                    <!-- Icon/Indicator -->
                    <div class="flex-shrink-0 mt-1">
                      @if (!notificationService.isRead(notification)) {
                        <div class="w-2 h-2 bg-primary-600 rounded-full"></div>
                      } @else {
                        <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
                      }
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 mb-1">
                        {{ notification.title }}
                      </p>
                      <p class="text-sm text-gray-600 mb-2 line-clamp-2">
                        {{ notification.body }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ notificationService.getRelativeTime(notification.created_at) }}
                      </p>
                    </div>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Footer -->
          <div class="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              (click)="viewAllNotifications()"
              class="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Ver todas as notificações
            </button>
          </div>
        </div>
      }

      <!-- Backdrop -->
      @if (isPanelOpen()) {
        <div
          (click)="closePanel()"
          class="fixed inset-0 z-40"
          aria-hidden="true"
        ></div>
      }
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class NotificationBellComponent implements OnInit {
  notificationService = inject(UserNotificationService);
  private router = inject(Router);

  isPanelOpen = signal(false);

  ngOnInit(): void {
    // Inicializa o serviço carregando notificações
    this.notificationService.initialize();
  }

  togglePanel(): void {
    this.isPanelOpen.update(value => !value);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
  }

  handleNotificationClick(notification: Notification): void {
    // Marca como lida se não estiver lida
    if (!this.notificationService.isRead(notification)) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }

    // Aqui você pode adicionar lógica para navegar para a página relevante
    // baseado no tipo de notificação ou dados dela
    if (notification.data?.['route']) {
      this.router.navigate([notification.data['route']]);
      this.closePanel();
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        console.log('Todas as notificações marcadas como lidas');
      },
      error: (error) => {
        console.error('Erro ao marcar notificações como lidas:', error);
      }
    });
  }

  viewAllNotifications(): void {
    this.router.navigate(['/app/notifications']);
    this.closePanel();
  }
}
