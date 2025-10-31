import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MealService } from '../services/meal.service';
import { PetService } from '../../pets/services/pet.service';
import { Pet } from '../../../core/models/pet.model';

@Component({
  selector: 'app-meal-form',
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
          routerLink="/app/meals"
          class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ isEditMode ? 'Editar Refeição' : 'Registrar Refeição' }}</h1>
          <p class="text-gray-600 mt-1">{{ isEditMode ? 'Atualize as informações da refeição' : 'Registre uma nova refeição para seu pet' }}</p>
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
          <form [formGroup]="mealForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Pet Select -->
            <div>
              <label for="pet_id" class="label">Pet *</label>
              <select
                id="pet_id"
                formControlName="pet_id"
                class="input"
                [class.input-error]="mealForm.get('pet_id')?.invalid && mealForm.get('pet_id')?.touched"
              >
                <option value="">Selecione um pet</option>
                @for (pet of pets; track pet.id) {
                  <option [value]="pet.id">{{ pet.name }}</option>
                }
              </select>
              @if (mealForm.get('pet_id')?.hasError('required') && mealForm.get('pet_id')?.touched) {
                <p class="error-message">Pet é obrigatório</p>
              }
            </div>

            <!-- Food Type Input -->
            <div>
              <label for="food_type" class="label">Tipo de Alimento *</label>
              <input
                id="food_type"
                type="text"
                formControlName="food_type"
                placeholder="Ex: Ração Premium, Patê de Frango, etc."
                class="input"
                [class.input-error]="mealForm.get('food_type')?.invalid && mealForm.get('food_type')?.touched"
              />
              @if (mealForm.get('food_type')?.hasError('required') && mealForm.get('food_type')?.touched) {
                <p class="error-message">Tipo de alimento é obrigatório</p>
              }
            </div>

            <!-- Quantity and Unit -->
            <div class="grid grid-cols-2 gap-4">
              <!-- Quantity Input -->
              <div>
                <label for="quantity" class="label">Quantidade *</label>
                <input
                  id="quantity"
                  type="number"
                  formControlName="quantity"
                  placeholder="Ex: 150"
                  min="0"
                  step="0.01"
                  class="input"
                  [class.input-error]="mealForm.get('quantity')?.invalid && mealForm.get('quantity')?.touched"
                />
                @if (mealForm.get('quantity')?.hasError('required') && mealForm.get('quantity')?.touched) {
                  <p class="error-message">Quantidade é obrigatória</p>
                }
                @if (mealForm.get('quantity')?.hasError('min') && mealForm.get('quantity')?.touched) {
                  <p class="error-message">Quantidade deve ser maior que zero</p>
                }
              </div>

              <!-- Unit Select -->
              <div>
                <label for="unit" class="label">Unidade *</label>
                <select
                  id="unit"
                  formControlName="unit"
                  class="input"
                  [class.input-error]="mealForm.get('unit')?.invalid && mealForm.get('unit')?.touched"
                >
                  <option value="">Selecione</option>
                  <option value="g">Gramas (g)</option>
                  <option value="ml">Mililitros (ml)</option>
                </select>
                @if (mealForm.get('unit')?.hasError('required') && mealForm.get('unit')?.touched) {
                  <p class="error-message">Unidade é obrigatória</p>
                }
              </div>
            </div>

            <!-- Date Time Input -->
            <div>
              <label for="scheduled_for" class="label">Data e Hora da Refeição *</label>
              <input
                id="scheduled_for"
                type="datetime-local"
                formControlName="scheduled_for"
                class="input"
                [class.input-error]="mealForm.get('scheduled_for')?.invalid && mealForm.get('scheduled_for')?.touched"
              />
              @if (mealForm.get('scheduled_for')?.hasError('required') && mealForm.get('scheduled_for')?.touched) {
                <p class="error-message">Data e hora são obrigatórios</p>
              }
            </div>

            <!-- Notes Textarea -->
            <div>
              <label for="notes" class="label">Observações</label>
              <textarea
                id="notes"
                formControlName="notes"
                rows="4"
                placeholder="Ex: Comeu tudo, deixou um pouco, preferiu a ração nova..."
                class="input resize-none"
              ></textarea>
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
                routerLink="/app/meals"
                class="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn-primary"
                [disabled]="mealForm.invalid || submitting"
              >
                @if (submitting) {
                  <div class="flex items-center space-x-2">
                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{{ isEditMode ? 'Atualizando...' : 'Registrando...' }}</span>
                  </div>
                } @else {
                  <span>{{ isEditMode ? 'Atualizar' : 'Registrar' }}</span>
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
export class MealFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mealService = inject(MealService);
  private petService = inject(PetService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mealForm: FormGroup;
  pets: Pet[] = [];
  isEditMode = false;
  mealId?: number;
  loading = true;
  submitting = false;
  errorMessage = '';

  constructor() {
    this.mealForm = this.fb.group({
      pet_id: ['', Validators.required],
      food_type: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(0)]],
      unit: ['', Validators.required],
      scheduled_for: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadPets();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.mealId = +id;
      this.loadMeal(this.mealId);
    } else {
      this.loading = false;

      // Check for pet_id query param
      const petId = this.route.snapshot.queryParamMap.get('pet_id');
      if (petId) {
        this.mealForm.patchValue({ pet_id: +petId });
      }

      // Set current date/time as default
      const now = new Date();
      const dateTimeString = now.toISOString().slice(0, 16);
      this.mealForm.patchValue({
        scheduled_for: dateTimeString,
        unit: 'g' // Default to grams
      });
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

  loadMeal(id: number): void {
    // Primeiro, buscar a refeição da lista geral para obter o pet_id
    this.mealService.getAll().subscribe({
      next: (meals) => {
        const meal = meals.find(m => m.id === id);
        if (meal) {
          // Agora que temos o pet_id, buscar os detalhes completos
          this.mealService.getById(meal.pet_id, id).subscribe({
            next: (mealDetails) => {
              const scheduledFor = new Date(mealDetails.scheduled_for);
              const dateTimeString = scheduledFor.toISOString().slice(0, 16);

              this.mealForm.patchValue({
                pet_id: mealDetails.pet_id,
                food_type: mealDetails.food_type,
                quantity: mealDetails.quantity,
                unit: mealDetails.unit,
                scheduled_for: dateTimeString,
                notes: mealDetails.notes || ''
              });

              this.loading = false;
            },
            error: (error) => {
              console.error('Erro ao carregar detalhes da refeição:', error);
              this.errorMessage = 'Erro ao carregar refeição';
              this.loading = false;
            }
          });
        } else {
          this.errorMessage = 'Refeição não encontrada';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Erro ao buscar refeição:', error);
        this.errorMessage = 'Erro ao carregar refeição';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.mealForm.valid) {
      this.submitting = true;
      this.errorMessage = '';

      const formData = this.mealForm.value;

      const request = this.isEditMode && this.mealId
        ? this.mealService.update(this.mealId, formData)
        : this.mealService.create(formData);

      request.subscribe({
        next: () => {
          this.router.navigate(['/app/meals']);
        },
        error: (error) => {
          console.error('Erro ao salvar refeição:', error);
          this.errorMessage = error.error?.message || 'Erro ao salvar refeição. Tente novamente.';
          this.submitting = false;
        }
      });
    }
  }
}
