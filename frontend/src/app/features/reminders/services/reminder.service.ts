import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Reminder, ReminderFormData } from '../../../core/models/reminder.model';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Helper method to get all reminders from all user's pets
  getAll(): Observable<{ data: Reminder[] }> {
    // This would need a backend endpoint that returns all reminders for the authenticated user
    // For now, calling a hypothetical endpoint
    return this.http.get<{ data: Reminder[] }>(`${this.apiUrl}/v1/reminders`);
  }

  getRemindersByPet(petId: number): Observable<{ data: Reminder[] }> {
    return this.http.get<{ data: Reminder[] }>(`${this.apiUrl}/v1/pets/${petId}/reminders`);
  }

  getById(reminderId: number): Observable<{ data: Reminder }> {
    return this.http.get<{ data: Reminder }>(`${this.apiUrl}/v1/reminders/${reminderId}`);
  }

  create(data: ReminderFormData): Observable<{ data: Reminder }> {
    const petId = data.pet_id;
    return this.http.post<{ data: Reminder }>(`${this.apiUrl}/v1/pets/${petId}/reminders`, data);
  }

  update(reminderId: number, data: Partial<ReminderFormData>): Observable<{ data: Reminder }> {
    return this.http.patch<{ data: Reminder }>(`${this.apiUrl}/v1/reminders/${reminderId}`, data);
  }

  delete(reminderId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/v1/reminders/${reminderId}`);
  }

  complete(reminderId: number): Observable<{ data: Reminder }> {
    return this.http.post<{ data: Reminder }>(`${this.apiUrl}/v1/reminders/${reminderId}/complete`, {});
  }

  snooze(reminderId: number, minutes: number): Observable<{ data: Reminder }> {
    return this.http.post<{ data: Reminder }>(`${this.apiUrl}/v1/reminders/${reminderId}/snooze`, { minutes });
  }
}
