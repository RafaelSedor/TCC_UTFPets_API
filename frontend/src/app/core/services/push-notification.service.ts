import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private swPush = inject(SwPush);
  private http = inject(HttpClient);
  private readonly VAPID_PUBLIC_KEY = environment.vapidPublicKey;

  /**
   * Solicita permissão para notificações push e subscreve o usuário
   */
  async requestSubscription(): Promise<boolean> {
    if (!environment.features?.enableNotifications) {
      console.warn('Push notifications disabled in environment');
      return false;
    }

    if (!this.swPush.isEnabled) {
      console.warn('Service Worker not enabled');
      return false;
    }

    try {
      // Solicita subscription do Service Worker
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      });

      // Envia subscription para o backend
      await this.sendSubscriptionToBackend(subscription).toPromise();

      console.log('Push notification subscription successful');
      return true;
    } catch (error) {
      console.error('Error requesting push subscription:', error);
      return false;
    }
  }

  /**
   * Envia a subscription para o backend salvar
   */
  private sendSubscriptionToBackend(subscription: PushSubscription): Observable<any> {
    console.log('Sending subscription to backend:', JSON.stringify(subscription));

    // Formata a subscription no formato esperado pelo backend
    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.toJSON().keys?.p256dh || '',
        auth: subscription.toJSON().keys?.auth || ''
      }
    };

    return this.http.post(`${environment.apiUrl}/push-subscriptions`, subscriptionData);
  }

  /**
   * Escuta notificações push recebidas
   */
  listenToNotifications(): Observable<any> {
    return this.swPush.messages;
  }

  /**
   * Escuta clicks em notificações
   */
  listenToNotificationClicks(): Observable<any> {
    return this.swPush.notificationClicks;
  }

  /**
   * Cancela subscription de push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      // Primeiro, pega a subscription atual para deletar do backend
      const subscription = await this.swPush.subscription.toPromise();

      if (subscription) {
        // Deleta do backend
        await this.http.delete(`${environment.apiUrl}/push-subscriptions`, {
          body: { endpoint: subscription.endpoint }
        }).toPromise();
      }

      // Depois desinscreve do Service Worker
      await this.swPush.unsubscribe();
      console.log('Push notification unsubscription successful');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  /**
   * Verifica se o usuário já está subscrito
   */
  get isSubscribed(): Observable<boolean> {
    return new Observable(observer => {
      this.swPush.subscription.subscribe(sub => {
        observer.next(sub !== null);
        observer.complete();
      });
    });
  }
}
