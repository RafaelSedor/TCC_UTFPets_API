import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { PushNotificationService } from './push-notification.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);
  private pushService = inject(PushNotificationService);
  private readonly NOTIFICATIONS_ENABLED = (environment as any).features?.enableNotifications || (environment as any).enableNotifications || false;

  /**
   * Solicita permissão para notificações push (PWA)
   * Agora integrado com Service Worker
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!this.NOTIFICATIONS_ENABLED) {
      console.warn('Notificações push desabilitadas no environment');
      return false;
    }

    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Subscreve para push notifications via Service Worker
        const subscribed = await this.pushService.requestSubscription();

        if (subscribed) {
          this.showSuccess('Notificações ativadas!');

          // Escuta mensagens push
          this.pushService.listenToNotifications().subscribe(message => {
            console.log('Push notification received:', message);
          });

          // Escuta clicks em notificações
          this.pushService.listenToNotificationClicks().subscribe(click => {
            console.log('Notification clicked:', click);
          });

          return true;
        } else {
          this.showWarning('Erro ao ativar notificações push');
          return false;
        }
      } else {
        this.showWarning('Permissão de notificação negada');
        return false;
      }
    } catch (err) {
      console.error('Erro ao solicitar permissão de notificação:', err);
      return false;
    }
  }

  /**
   * Exibe notificação usando MatSnackBar
   */
  showNotification(message: string, action: string = 'Fechar', duration: number = 5000): void {
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Exibe notificação de sucesso (verde)
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Fechar', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    });
  }

  /**
   * Exibe notificação de erro (vermelha)
   */
  showError(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Fechar', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }

  /**
   * Exibe notificação de aviso (amarela)
   */
  showWarning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'Fechar', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-warning']
    });
  }

  /**
   * Exibe notificação de informação (azul)
   */
  showInfo(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Fechar', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-info']
    });
  }
}