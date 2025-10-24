import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReminderService } from '../services/reminder.service';
import { PetService } from '../../pets/services/pet.service';
import { Pet } from '../../../core/models/pet.model';
import { ReminderFormData } from '../../../core/models/reminder.model';

@Component({
  selector: 'app-reminder-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <button mat-icon-button routerLink="/app/reminders">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <mat-card-title>{{ isEditMode ? 'Editar Lembrete' : 'Criar Lembrete' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          @if (loading) {
            <div class="loading">
              <mat-spinner></mat-spinner>
            </div>
          } @else {
            <form [formGroup]="reminderForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline">
                <mat-label>Pet</mat-label>
                <mat-select formControlName="pet_id" required>
                  @for (pet of pets; track pet.id) {
                    <mat-option [value]="pet.id">{{ pet.name }}</mat-option>
                  }
                </mat-select>
                @if (reminderForm.get('pet_id')?.hasError('required') && reminderForm.get('pet_id')?.touched) {
                  <mat-error>Pet é obrigatório</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Título</mat-label>
                <input matInput formControlName="title" required placeholder="Ex: Dar remédio">
                @if (reminderForm.get('title')?.hasError('required') && reminderForm.get('title')?.touched) {
                  <mat-error>Título é obrigatório</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Tipo</mat-label>
                <mat-select formControlName="type" required>
                  <mat-option value="feeding">
                    <mat-icon>restaurant</mat-icon>
                    Alimentação
                  </mat-option>
                  <mat-option value="vet">
                    <mat-icon>medical_services</mat-icon>
                    Veterinário
                  </mat-option>
                  <mat-option value="medication">
                    <mat-icon>medication</mat-icon>
                    Medicação
                  </mat-option>
                  <mat-option value="grooming">
                    <mat-icon>content_cut</mat-icon>
                    Higiene
                  </mat-option>
                  <mat-option value="other">
                    <mat-icon>event</mat-icon>
                    Outro
                  </mat-option>
                </mat-select>
                @if (reminderForm.get('type')?.hasError('required') && reminderForm.get('type')?.touched) {
                  <mat-error>Tipo é obrigatório</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Data e Hora</mat-label>
                <input matInput type="datetime-local" formControlName="reminder_time" required>
                @if (reminderForm.get('reminder_time')?.hasError('required') && reminderForm.get('reminder_time')?.touched) {
                  <mat-error>Data e hora são obrigatórios</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Repetir</mat-label>
                <mat-select formControlName="repeat_interval">
                  <mat-option [value]="null">Não repetir</mat-option>
                  <mat-option value="daily">Diariamente</mat-option>
                  <mat-option value="weekly">Semanalmente</mat-option>
                  <mat-option value="monthly">Mensalmente</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Descrição</mat-label>
                <textarea
                  matInput
                  formControlName="description"
                  rows="4"
                  placeholder="Adicione detalhes sobre o lembrete...">
                </textarea>
              </mat-form-field>

              <div class="toggle-field">
                <mat-slide-toggle formControlName="is_active" color="primary">
                  Lembrete ativo
                </mat-slide-toggle>
              </div>

              @if (errorMessage) {
                <div class="error-message">
                  <mat-icon>error</mat-icon>
                  {{ errorMessage }}
                </div>
              }

              <div class="form-actions">
                <button mat-stroked-button type="button" routerLink="/app/reminders">
                  Cancelar
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="reminderForm.invalid || submitting">
                  @if (submitting) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    {{ isEditMode ? 'Atualizar' : 'Criar' }}
                  }
                </button>
              </div>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 24px auto;
      padding: 0 16px;
    }

    mat-card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    mat-form-field {
      width: 100%;
    }

    mat-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toggle-field {
      padding: 12px 0;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #ffebee;
      color: #c62828;
      border-radius: 4px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
  `]
})
export class ReminderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reminderService = inject(ReminderService);
  private petService = inject(PetService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  reminderForm: FormGroup;
  pets: Pet[] = [];
  isEditMode = false;
  reminderId?: number;
  loading = true;
  submitting = false;
  errorMessage = '';

  constructor() {
    this.reminderForm = this.fb.group({
      pet_id: ['', Validators.required],
      title: ['', Validators.required],
      type: ['', Validators.required],
      reminder_time: ['', Validators.required],
      repeat_interval: [null],
      description: [''],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.loadPets();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.reminderId = +id;
      this.loadReminder(this.reminderId);
    } else {
      this.loading = false;

      // Check for pet_id query param
      const petId = this.route.snapshot.queryParamMap.get('pet_id');
      if (petId) {
        this.reminderForm.patchValue({ pet_id: +petId });
      }
    }
  }

  loadPets(): void {
    this.petService.getAll().subscribe({
      next: (response) => {
        this.pets = response.data;
      },
      error: (error) => {
        console.error('Erro ao carregar pets:', error);
        this.errorMessage = 'Erro ao carregar lista de pets';
      }
    });
  }

  loadReminder(id: number): void {
    this.reminderService.getById(id).subscribe({
      next: (response) => {
        const reminder = response.data;

        // Convert reminder_time to datetime-local format
        const reminderTime = new Date(reminder.reminder_time);
        const dateTimeString = reminderTime.toISOString().slice(0, 16);

        this.reminderForm.patchValue({
          pet_id: reminder.pet_id,
          title: reminder.title,
          type: reminder.type,
          reminder_time: dateTimeString,
          repeat_interval: reminder.repeat_interval,
          description: reminder.description || '',
          is_active: reminder.is_active
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar lembrete:', error);
        this.errorMessage = 'Erro ao carregar lembrete';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.reminderForm.valid) {
      this.submitting = true;
      this.errorMessage = '';

      const formData: ReminderFormData = this.reminderForm.value;

      const request = this.isEditMode && this.reminderId
        ? this.reminderService.update(this.reminderId, formData)
        : this.reminderService.create(formData);

      request.subscribe({
        next: () => {
          this.snackBar.open(
            this.isEditMode ? 'Lembrete atualizado com sucesso!' : 'Lembrete criado com sucesso!',
            'Fechar',
            { duration: 3000 }
          );
          this.router.navigate(['/app/reminders']);
        },
        error: (error) => {
          console.error('Erro ao salvar lembrete:', error);
          this.errorMessage = error.error?.message || 'Erro ao salvar lembrete. Tente novamente.';
          this.submitting = false;
        }
      });
    }
  }
}
