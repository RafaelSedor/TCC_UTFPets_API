import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MealService } from '../services/meal.service';
import { Meal } from '../../../core/models/meal.model';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-meal-list',
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
          <h1 class="text-3xl font-bold text-gray-900">Histórico de Refeições</h1>
          <p class="text-gray-600 mt-1">Acompanhe todas as refeições dos seus pets</p>
        </div>
        <button
          routerLink="/app/meals/new"
          class="btn-primary flex items-center space-x-2 px-6 py-3"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nova Refeição</span>
        </button>
      </div>

      @if (loading) {
        <div class="flex flex-col items-center justify-center py-20">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
          <p class="text-gray-600 mt-4 text-lg">Carregando refeições...</p>
        </div>
      } @else if (meals.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (meal of meals; track meal.id) {
            <div class="card hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <!-- Pet Name & Time -->
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {{ meal.pet?.name || 'Pet desconhecido' }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">{{ meal.scheduled_for | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
                <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>

              <!-- Meal Info -->
              <div class="space-y-3">
                <div class="p-3 bg-primary-50 rounded-lg">
                  <p class="text-sm font-semibold text-primary-900 mb-1">Tipo de Alimento</p>
                  <p class="text-gray-700">{{ meal.food_type }}</p>
                </div>

                <div class="flex items-center space-x-2 text-gray-700">
                  <svg class="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  <span class="font-medium">{{ meal.quantity }}{{ meal.unit }}</span>
                </div>

                @if (meal.consumed_at) {
                  <div class="flex items-center space-x-2 text-green-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-sm">Consumida em {{ meal.consumed_at | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                }

                @if (meal.notes) {
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-start space-x-2">
                      <svg class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <p class="text-sm text-gray-600">{{ meal.notes }}</p>
                    </div>
                  </div>
                }
              </div>

              <!-- Actions -->
              <div class="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  [routerLink]="['/app/meals/edit', meal.id]"
                  class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  (click)="deleteMeal(meal)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="card text-center py-16">
          <svg class="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Nenhuma refeição registrada</h2>
          <p class="text-gray-600 mb-6">Comece registrando a primeira refeição do seu pet</p>
          <button
            routerLink="/app/meals/new"
            class="btn-primary inline-flex items-center space-x-2 px-6 py-3"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Registrar Primeira Refeição</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: []
})
export class MealListComponent implements OnInit {
  private mealService = inject(MealService);
  private router = inject(Router);
  private modalService = inject(ModalService);

  meals: Meal[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadMeals();
  }

  loadMeals(): void {
    this.loading = true;
    this.mealService.getAll().subscribe({
      next: (meals) => {
        this.meals = Array.isArray(meals) ? meals : [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar refeições:', error);
        this.meals = [];
        this.loading = false;
      }
    });
  }

  async deleteMeal(meal: Meal): Promise<void> {
    const petName = meal.pet?.name || 'este pet';
    const confirmed = await this.modalService.confirm(
      `Tem certeza que deseja excluir esta refeição de ${petName}? Esta ação não pode ser desfeita.`,
      'Excluir Refeição',
      'Excluir',
      'Cancelar'
    );

    if (confirmed) {
      this.mealService.delete(meal.pet_id, meal.id).subscribe({
        next: () => {
          this.meals = this.meals.filter(m => m.id !== meal.id);
          this.modalService.success('Refeição excluída com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao deletar refeição:', error);
          this.modalService.showBackendError(error, 'Erro ao deletar refeição. Tente novamente.');
        }
      });
    }
  }
}
