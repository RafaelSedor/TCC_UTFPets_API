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
  getAll(): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(`${this.apiUrl}/reminders`);
  }

  getRemindersByPet(petId: number): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(`${this.apiUrl}/pets/${petId}/reminders`);
  }

  getById(reminderId: string): Observable<Reminder> {
    return this.http.get<Reminder>(`${this.apiUrl}/reminders/${reminderId}`);
  }

  create(data: ReminderFormData): Observable<Reminder> {
    const petId = data.pet_id;

    // Transform frontend fields to backend fields
    const backendData = {
      title: data.title,
      description: data.description || '',
      scheduled_at: data.reminder_time, // Convert reminder_time to scheduled_at
      repeat_rule: data.repeat_interval || null, // Convert repeat_interval to repeat_rule
    };

    return this.http.post<Reminder>(`${this.apiUrl}/pets/${petId}/reminders`, backendData);
  }

  update(reminderId: string, data: Partial<ReminderFormData>): Observable<Reminder> {
    // Transform frontend fields to backend fields
    const backendData: any = {};

    if (data.title !== undefined) backendData.title = data.title;
    if (data.description !== undefined) backendData.description = data.description;
    if (data.reminder_time !== undefined) backendData.scheduled_at = data.reminder_time;
    if (data.repeat_interval !== undefined) backendData.repeat_rule = data.repeat_interval;

    return this.http.patch<Reminder>(`${this.apiUrl}/reminders/${reminderId}`, backendData);
  }

  delete(reminderId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reminders/${reminderId}`);
  }

  complete(reminderId: string): Observable<Reminder> {
    return this.http.post<Reminder>(`${this.apiUrl}/reminders/${reminderId}/complete`, {});
  }

  snooze(reminderId: string, minutes: number): Observable<Reminder> {
    return this.http.post<Reminder>(`${this.apiUrl}/reminders/${reminderId}/snooze`, { minutes });
  }
}
