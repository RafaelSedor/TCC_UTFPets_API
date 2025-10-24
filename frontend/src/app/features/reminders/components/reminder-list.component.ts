import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReminderService } from '../services/reminder.service';
import { Reminder } from '../../../core/models/reminder.model';

@Component({
  selector: 'app-reminder-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Lembretes</h1>
        <button mat-raised-button color="primary" routerLink="/app/reminders/new">
          <mat-icon>add</mat-icon>
          Novo Lembrete
        </button>
      </div>
      @if (loading) {
        <div class="loading">
          <mat-spinner></mat-spinner>
          <p>Carregando lembretes...</p>
        </div>
      } @else if (reminders.length > 0) {
        <div class="reminders-grid">
          @for (reminder of reminders; track reminder.id) {
            <mat-card class="reminder-card" [class.inactive]="!reminder.is_active">
              <mat-card-header>
                <mat-icon mat-card-avatar [color]="reminder.is_active ? 'primary' : ''">
                  {{ getReminderIcon(reminder.type) }}
                </mat-icon>
                <mat-card-title>{{ reminder.title }}</mat-card-title>
                <mat-card-subtitle>
                  {{ reminder.pet?.name || 'Pet' }} • {{ reminder.reminder_time | date:'dd/MM/yyyy HH:mm' }}
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <div class="reminder-info">
                  <mat-chip [class.active-chip]="reminder.is_active" [class.inactive-chip]="!reminder.is_active">
                    {{ reminder.is_active ? 'Ativo' : 'Inativo' }}
                  </mat-chip>

                  <mat-chip>
                    {{ getReminderTypeLabel(reminder.type) }}
                  </mat-chip>

                  @if (reminder.repeat_interval) {
                    <mat-chip>
                      <mat-icon>repeat</mat-icon>
                      {{ getReminderIntervalLabel(reminder.repeat_interval) }}
                    </mat-chip>
                  }

                  @if (reminder.description) {
                    <div class="description">
                      <mat-icon>notes</mat-icon>
                      <span>{{ reminder.description }}</span>
                    </div>
                  }
                </div>
              </mat-card-content>

              <mat-card-actions>
                <mat-slide-toggle
                  [checked]="reminder.is_active"
                  (change)="toggleReminder(reminder)"
                  color="primary">
                </mat-slide-toggle>
                <span class="spacer"></span>
                <button mat-icon-button color="primary" [routerLink]="['/app/reminders/edit', reminder.id]">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteReminder(reminder)">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      } @else {
        <div class="empty-state">
          <mat-icon>notifications_none</mat-icon>
          <h2>Nenhum lembrete configurado</h2>
          <p>Configure lembretes para não esquecer dos cuidados com seu pet</p>
          <button mat-raised-button color="primary" routerLink="/app/reminders/new">
            <mat-icon>add</mat-icon>
            Criar Lembrete
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 24px auto;
      padding: 0 16px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 500;
      color: #333;
    }

    .spacer {
      flex: 1;
    }

    .reminders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .reminder-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .reminder-card.inactive {
      opacity: 0.7;
    }

    .reminder-card mat-card-header {
      margin-bottom: 16px;
    }

    .reminder-card mat-card-content {
      flex: 1;
    }

    .reminder-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    mat-chip {
      font-size: 12px;
    }

    .active-chip {
      background-color: #4caf50 !important;
      color: white !important;
    }

    .inactive-chip {
      background-color: #9e9e9e !important;
      color: white !important;
    }

    .description {
      display: flex;
      gap: 8px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 4px;
      color: #666;
    }

    .description mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #667eea;
    }

    mat-card-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 120px;
      width: 120px;
      height: 120px;
      color: #ccc;
      margin-bottom: 24px;
    }

    .empty-state h2 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      color: #666;
    }
  `]
})
export class ReminderListComponent implements OnInit {
  private reminderService = inject(ReminderService);
  private router = inject(Router);

  reminders: Reminder[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadReminders();
  }

  loadReminders(): void {
    this.loading = true;
    this.reminderService.getAll().subscribe({
      next: (response) => {
        this.reminders = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar lembretes:', error);
        this.loading = false;
      }
    });
  }

  getReminderIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'feeding': 'restaurant',
      'vet': 'medical_services',
      'medication': 'medication',
      'grooming': 'content_cut',
      'other': 'event'
    };
    return icons[type] || 'event';
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
        alert('Erro ao atualizar lembrete. Tente novamente.');
      }
    });
  }

  deleteReminder(reminder: Reminder): void {
    if (confirm(`Tem certeza que deseja excluir o lembrete "${reminder.title}"?`)) {
      this.reminderService.delete(reminder.id).subscribe({
        next: () => {
          this.reminders = this.reminders.filter(r => r.id !== reminder.id);
        },
        error: (error) => {
          console.error('Erro ao deletar lembrete:', error);
          alert('Erro ao deletar lembrete. Tente novamente.');
        }
      });
    }
  }
}
