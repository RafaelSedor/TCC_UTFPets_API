import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReminderService } from '../services/reminder.service';
import { Reminder } from '../../../core/models/reminder.model';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-reminder-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Lembretes</h1>
          <p class="text-gray-600 mt-1">Gerencie os lembretes dos seus pets</p>
        </div>
        <button
          routerLink="/app/reminders/new"
          class="btn-primary flex items-center space-x-2 px-6 py-3"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Novo Lembrete</span>
        </button>
      </div>

      @if (loading) {
        <div class="flex flex-col items-center justify-center py-20">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
          <p class="text-gray-600 mt-4 text-lg">Carregando lembretes...</p>
        </div>
      } @else if (reminders.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (reminder of reminders; track reminder.id) {
            <div class="card hover:shadow-xl transition-all duration-300 group" [class.opacity-60]="!reminder.is_active">
              <!-- Header with Icon -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      [ngClass]="reminder.is_active ? 'bg-accent-100' : 'bg-gray-100'">
                      <svg class="w-5 h-5" [ngClass]="reminder.is_active ? 'text-accent-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        @if (reminder.type === 'feeding') {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        } @else if (reminder.type === 'vet') {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        } @else if (reminder.type === 'medication') {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        } @else if (reminder.type === 'grooming') {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                        } @else {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        }
                      </svg>
                    </div>
                    <span class="text-xs font-medium px-2.5 py-1 rounded-full"
                      [ngClass]="reminder.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'">
                      {{ reminder.is_active ? 'Ativo' : 'Inativo' }}
                    </span>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {{ reminder.title }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">{{ reminder.pet?.name || 'Pet' }}</p>
                </div>
              </div>

              <!-- Reminder Details -->
              <div class="space-y-3 mb-4">
                <div class="flex items-center space-x-2 text-gray-700">
                  <svg class="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm">{{ reminder.reminder_time | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>

                <div class="flex items-center space-x-2">
                  <span class="text-xs px-2.5 py-1 bg-primary-100 text-primary-800 rounded-full font-medium">
                    {{ getReminderTypeLabel(reminder.type) }}
                  </span>
                  @if (reminder.repeat_interval) {
                    <span class="text-xs px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full font-medium flex items-center space-x-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>{{ getReminderIntervalLabel(reminder.repeat_interval) }}</span>
                    </span>
                  }
                </div>

                @if (reminder.description) {
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-start space-x-2">
                      <svg class="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <p class="text-xs text-gray-600">{{ reminder.description }}</p>
                    </div>
                  </div>
                }
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  (click)="toggleReminder(reminder)"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  [ngClass]="reminder.is_active ? 'bg-primary-600' : 'bg-gray-200'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    [ngClass]="reminder.is_active ? 'translate-x-6' : 'translate-x-1'"
                  ></span>
                </button>

                <div class="flex space-x-2">
                  <button
                    [routerLink]="['/app/reminders/edit', reminder.id]"
                    class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    (click)="deleteReminder(reminder)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="card text-center py-16">
          <svg class="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Nenhum lembrete configurado</h2>
          <p class="text-gray-600 mb-6">Configure lembretes para não esquecer dos cuidados com seu pet</p>
          <button
            routerLink="/app/reminders/new"
            class="btn-primary inline-flex items-center space-x-2 px-6 py-3"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Criar Primeiro Lembrete</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: []
})
export class ReminderListComponent implements OnInit {
  private reminderService = inject(ReminderService);
  private router = inject(Router);
  private modalService = inject(ModalService);

  reminders: Reminder[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadReminders();
  }

  loadReminders(): void {
    this.loading = true;
    this.reminderService.getAll().subscribe({
      next: (reminders) => {
        this.reminders = Array.isArray(reminders) ? reminders : [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar lembretes:', error);
        this.reminders = [];
        this.loading = false;
      }
    });
  }

  getReminderTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'feeding': 'Alimentação',
      'vet': 'Veterinário',
      'medication': 'Medicação',
      'grooming': 'Higiene',
      'other': 'Outro'
    };
    return labels[type] || type;
  }

  getReminderIntervalLabel(interval: string): string {
    const labels: { [key: string]: string } = {
      'daily': 'Diário',
      'weekly': 'Semanal',
      'monthly': 'Mensal'
    };
    return labels[interval] || interval;
  }

  toggleReminder(reminder: Reminder): void {
    const newStatus = !reminder.is_active;
    this.reminderService.update(reminder.id, { is_active: newStatus }).subscribe({
      next: () => {
        reminder.is_active = newStatus;
      },
      error: (error) => {
        console.error('Erro ao atualizar lembrete:', error);
        this.modalService.showBackendError(error, 'Erro ao atualizar lembrete. Tente novamente.');
      }
    });
  }

  async deleteReminder(reminder: Reminder): Promise<void> {
    const confirmed = await this.modalService.confirm(
      `Tem certeza que deseja excluir o lembrete "${reminder.title}"? Esta ação não pode ser desfeita.`,
      'Excluir Lembrete',
      'Excluir',
      'Cancelar'
    );

    if (confirmed) {
      this.reminderService.delete(reminder.id).subscribe({
        next: () => {
          this.reminders = this.reminders.filter(r => r.id !== reminder.id);
          this.modalService.success('Lembrete excluído com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao deletar lembrete:', error);
          this.modalService.showBackendError(error, 'Erro ao deletar lembrete. Tente novamente.');
        }
      });
    }
  }
}
