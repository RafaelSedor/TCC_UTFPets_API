import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserNotificationService } from '../../../core/services/user-notification.service';
import { Notification, NotificationStatus } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Notificações</h1>
            <p class="text-sm text-gray-600 mt-1">
              Você tem {{ notificationService.unreadCount() }} notificação(ões) não lida(s)
            </p>
          </div>
          @if (notificationService.unreadCount() > 0) {
            <button
              (click)="markAllAsRead()"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Marcar todas como lidas
            </button>
          }
        </div>

        <!-- Filter Tabs -->
        <div class="flex space-x-2 mt-6 border-b border-gray-200">
          <button
            (click)="setFilter(null)"
            [class.border-primary-600]="currentFilter() === null"
            [class.text-primary-600]="currentFilter() === null"
            [class.border-transparent]="currentFilter() !== null"
            [class.text-gray-600]="currentFilter() !== null"
            class="px-4 py-2 border-b-2 font-medium transition-colors hover:text-primary-600"
          >
            Todas
          </button>
          <button
            (click)="setFilter('sent')"
            [class.border-primary-600]="currentFilter() === 'sent'"
            [class.text-primary-600]="currentFilter() === 'sent'"
            [class.border-transparent]="currentFilter() !== 'sent'"
            [class.text-gray-600]="currentFilter() !== 'sent'"
            class="px-4 py-2 border-b-2 font-medium transition-colors hover:text-primary-600"
          >
            Não lidas
          </button>
          <button
            (click)="setFilter('read')"
            [class.border-primary-600]="currentFilter() === 'read'"
            [class.text-primary-600]="currentFilter() === 'read'"
            [class.border-transparent]="currentFilter() !== 'read'"
            [class.text-gray-600]="currentFilter() !== 'read'"
            class="px-4 py-2 border-b-2 font-medium transition-colors hover:text-primary-600"
          >
            Lidas
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      @if (loading()) {
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p class="mt-4 text-gray-600">Carregando notificações...</p>
        </div>
      } @else if (notificationService.notifications().length === 0) {
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Nenhuma notificação</h3>
          <p class="text-gray-600">Você não tem notificações {{ currentFilter() ? (currentFilter() === 'sent' ? 'não lidas' : 'lidas') : '' }} no momento.</p>
        </div>
      } @else {
        <div class="space-y-2">
          @for (notification of notificationService.notifications(); track notification.id) {
            <div
              (click)="handleNotificationClick(notification)"
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
              [class.bg-blue-50]="!notificationService.isRead(notification)"
              [class.border-primary-200]="!notificationService.isRead(notification)"
            >
              <div class="flex items-start space-x-4">
                <!-- Status Indicator -->
                <div class="flex-shrink-0 mt-1">
                  @if (!notificationService.isRead(notification)) {
                    <div class="w-3 h-3 bg-primary-600 rounded-full"></div>
                  } @else {
                    <div class="w-3 h-3 bg-gray-300 rounded-full"></div>
                  }
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-base font-semibold text-gray-900 mb-1">
                        {{ notification.title }}
                      </h3>
                      <p class="text-sm text-gray-700 mb-2">
                        {{ notification.body }}
                      </p>
                      <div class="flex items-center space-x-4 text-xs text-gray-500">
                        <span class="flex items-center">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {{ notificationService.getRelativeTime(notification.created_at) }}
                        </span>
                        <span class="flex items-center capitalize">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {{ getChannelName(notification.channel) }}
                        </span>
                      </div>
                    </div>

                    <!-- Actions -->
                    @if (!notificationService.isRead(notification)) {
                      <button
                        (click)="markAsRead(notification.id, $event)"
                        class="ml-4 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                      >
                        Marcar como lida
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="mt-6 flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="text-sm text-gray-700">
              Página <span class="font-medium">{{ currentPage() }}</span> de
              <span class="font-medium">{{ totalPages() }}</span>
            </div>
            <div class="flex space-x-2">
              <button
                (click)="previousPage()"
                [disabled]="currentPage() === 1"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <button
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: []
})
export class NotificationListComponent implements OnInit {
  notificationService = inject(UserNotificationService);
  private router = inject(Router);

  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  currentFilter = signal<NotificationStatus | null>(null);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    const status = this.currentFilter() || undefined;

    this.notificationService.getNotifications(this.currentPage(), 20, status).subscribe({
      next: (response) => {
        this.totalPages.set(response.meta.last_page);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar notificações:', error);
        this.loading.set(false);
      }
    });
  }

  setFilter(status: 'sent' | 'read' | null): void {
    this.currentFilter.set(status as NotificationStatus | null);
    this.currentPage.set(1);
    this.loadNotifications();
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.loadNotifications();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadNotifications();
    }
  }

  handleNotificationClick(notification: Notification): void {
    // Marca como lida se não estiver lida
    if (!this.notificationService.isRead(notification)) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }

    // Navega para a rota relevante se existir
    if (notification.data?.['route']) {
      this.router.navigate([notification.data['route']]);
    }
  }

  markAsRead(notificationId: string, event: Event): void {
    event.stopPropagation(); // Previne o click no card
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        console.log('Notificação marcada como lida');
      },
      error: (error) => {
        console.error('Erro ao marcar notificação como lida:', error);
      }
    });
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

  getChannelName(channel: string): string {
    const channelNames: Record<string, string> = {
      'in_app': 'App',
      'email': 'E-mail',
      'push': 'Push'
    };
    return channelNames[channel] || channel;
  }
}
