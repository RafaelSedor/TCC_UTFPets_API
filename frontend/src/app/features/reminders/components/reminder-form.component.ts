import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
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
    RouterModule
  ],
  template: `
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="flex items-center space-x-4 mb-8">
        <button
          routerLink="/app/reminders"
          class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ isEditMode ? 'Editar Lembrete' : 'Criar Lembrete' }}</h1>
          <p class="text-gray-600 mt-1">{{ isEditMode ? 'Atualize as informações do lembrete' : 'Configure um novo lembrete para seu pet' }}</p>
        </div>
      </div>

      <!-- Form Card -->
      <div class="card">
        @if (loading) {
          <div class="flex flex-col items-center justify-center py-20">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
            <p class="text-gray-600 mt-4 text-lg">Carregando...</p>
          </div>
        } @else {
          <form [formGroup]="reminderForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Pet Select -->
            <div>
              <label for="pet_id" class="label">Pet *</label>
              <select
                id="pet_id"
                formControlName="pet_id"
                class="input"
                [class.input-error]="reminderForm.get('pet_id')?.invalid && reminderForm.get('pet_id')?.touched"
              >
                <option value="">Selecione um pet</option>
                @for (pet of pets; track pet.id) {
                  <option [value]="pet.id">{{ pet.name }}</option>
                }
              </select>
              @if (reminderForm.get('pet_id')?.hasError('required') && reminderForm.get('pet_id')?.touched) {
                <p class="error-message">Pet é obrigatório</p>
              }
            </div>

            <!-- Title Input -->
            <div>
              <label for="title" class="label">Título *</label>
              <input
                id="title"
                type="text"
                formControlName="title"
                placeholder="Ex: Dar remédio"
                class="input"
                [class.input-error]="reminderForm.get('title')?.invalid && reminderForm.get('title')?.touched"
              />
              @if (reminderForm.get('title')?.hasError('required') && reminderForm.get('title')?.touched) {
                <p class="error-message">Título é obrigatório</p>
              }
            </div>

            <!-- Type Select -->
            <div>
              <label for="type" class="label">Tipo *</label>
              <select
                id="type"
                formControlName="type"
                class="input"
                [class.input-error]="reminderForm.get('type')?.invalid && reminderForm.get('type')?.touched"
              >
                <option value="">Selecione um tipo</option>
                <option value="feeding">
                  🍽️ Alimentação
                </option>
                <option value="vet">
                  🏥 Veterinário
                </option>
                <option value="medication">
                  💊 Medicação
                </option>
                <option value="grooming">
                  ✂️ Higiene
                </option>
                <option value="other">
                  📅 Outro
                </option>
              </select>
              @if (reminderForm.get('type')?.hasError('required') && reminderForm.get('type')?.touched) {
                <p class="error-message">Tipo é obrigatório</p>
              }
            </div>

            <!-- Date Time Input -->
            <div>
              <label for="reminder_time" class="label">Data e Hora *</label>
              <input
                id="reminder_time"
                type="datetime-local"
                formControlName="reminder_time"
                class="input"
                [class.input-error]="reminderForm.get('reminder_time')?.invalid && reminderForm.get('reminder_time')?.touched"
              />
              @if (reminderForm.get('reminder_time')?.hasError('required') && reminderForm.get('reminder_time')?.touched) {
                <p class="error-message">Data e hora são obrigatórios</p>
              }
            </div>

            <!-- Repeat Interval Select -->
            <div>
              <label for="repeat_interval" class="label">Repetir</label>
              <select
                id="repeat_interval"
                formControlName="repeat_interval"
                class="input"
              >
                <option [ngValue]="null">Não repetir</option>
                <option value="daily">🔄 Diariamente</option>
                <option value="weekly">📅 Semanalmente</option>
                <option value="monthly">🗓️ Mensalmente</option>
              </select>
            </div>

            <!-- Description Textarea -->
            <div>
              <label for="description" class="label">Descrição</label>
              <textarea
                id="description"
                formControlName="description"
                rows="4"
                placeholder="Adicione detalhes sobre o lembrete..."
                class="input resize-none"
              ></textarea>
            </div>

            <!-- Active Toggle -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-gray-900">Lembrete ativo</p>
                  <p class="text-sm text-gray-600">Receber notificações deste lembrete</p>
                </div>
              </div>
              <button
                type="button"
                (click)="toggleActive()"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                [ngClass]="reminderForm.get('is_active')?.value ? 'bg-primary-600' : 'bg-gray-200'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  [ngClass]="reminderForm.get('is_active')?.value ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>

            <!-- Error Message -->
            @if (errorMessage) {
              <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-2">
                <svg class="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ errorMessage }}</span>
              </div>
            }

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                routerLink="/app/reminders"
                class="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn-primary"
                [disabled]="reminderForm.invalid || submitting"
              >
                @if (submitting) {
                  <div class="flex items-center space-x-2">
                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{{ isEditMode ? 'Atualizando...' : 'Criando...' }}</span>
                  </div>
                } @else {
                  <span>{{ isEditMode ? 'Atualizar' : 'Criar' }}</span>
                }
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: []
})
export class ReminderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reminderService = inject(ReminderService);
  private petService = inject(PetService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  reminderForm: FormGroup;
  pets: Pet[] = [];
  isEditMode = false;
  reminderId?: string;  // UUID
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
      this.reminderId = id;  // Keep as string (UUID)
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
      next: (pets) => {
        this.pets = Array.isArray(pets) ? pets : [];
      },
      error: (error) => {
        console.error('Erro ao carregar pets:', error);
        this.errorMessage = 'Erro ao carregar lista de pets';
        this.pets = [];
      }
    });
  }

  loadReminder(id: string): void {
    this.reminderService.getById(id).subscribe({
      next: (reminder) => {
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

  toggleActive(): void {
    const currentValue = this.reminderForm.get('is_active')?.value;
    this.reminderForm.patchValue({ is_active: !currentValue });
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    Object.keys(this.reminderForm.controls).forEach(key => {
      this.reminderForm.get(key)?.markAsTouched();
    });

    // Debug: Log form values and validity
    console.log('Form values:', this.reminderForm.value);
    console.log('Form valid:', this.reminderForm.valid);
    console.log('Form errors:', this.reminderForm.errors);
    Object.keys(this.reminderForm.controls).forEach(key => {
      const control = this.reminderForm.get(key);
      if (control?.invalid) {
        console.log(`${key} is invalid:`, control.errors);
      }
    });

    if (this.reminderForm.valid) {
      this.submitting = true;
      this.errorMessage = '';

      const formData: ReminderFormData = this.reminderForm.value;

      const request = this.isEditMode && this.reminderId
        ? this.reminderService.update(this.reminderId, formData)
        : this.reminderService.create(formData);

      request.subscribe({
        next: () => {
          this.router.navigate(['/app/reminders']);
        },
        error: (error) => {
          console.error('Erro ao salvar lembrete:', error);
          this.errorMessage = error.error?.message || 'Erro ao salvar lembrete. Tente novamente.';
          this.submitting = false;
        }
      });
    } else {
      // Show error message when form is invalid
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
    }
  }
}
