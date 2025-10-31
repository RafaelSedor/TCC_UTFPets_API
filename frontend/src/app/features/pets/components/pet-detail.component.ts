import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PetService } from '../services/pet.service';
import { MealService } from '../../meals/services/meal.service';
import { ReminderService } from '../../reminders/services/reminder.service';
import { Pet } from '../../../core/models/pet.model';
import { Meal } from '../../../core/models/meal.model';
import { Reminder } from '../../../core/models/reminder.model';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-pet-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      @if (loading) {
        <div class="flex flex-col items-center justify-center py-20">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
          <p class="text-gray-600 mt-4 text-lg">Carregando...</p>
        </div>
      } @else if (pet) {
        <!-- Header with Back Button -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center">
            <button
              routerLink="/app/pets"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
            >
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ pet.name }}</h1>
              <p class="text-gray-600 mt-1">{{ getSpeciesLabel(pet.species) }}</p>
            </div>
          </div>

          <div class="flex space-x-3">
            <button
              [routerLink]="['/app/pets/edit', pet.id]"
              class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Editar</span>
            </button>
            <button
              (click)="deletePet()"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Excluir</span>
            </button>
          </div>
        </div>

        <!-- Pet Info Card -->
        <div class="card mb-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Photo -->
            <div class="flex justify-center items-start">
              @if (pet.photo_url) {
                <img
                  [src]="pet.photo_url"
                  [alt]="pet.name"
                  class="w-full max-w-sm h-80 object-cover rounded-2xl shadow-lg"
                />
              } @else {
                <div class="w-full max-w-sm h-80 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                  <svg class="w-32 h-32 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              }
            </div>

            <!-- Details -->
            <div class="lg:col-span-2 space-y-4">
              @if (pet.breed) {
                <div class="flex items-start">
                  <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 font-medium">Raça</p>
                    <p class="text-lg text-gray-900">{{ pet.breed }}</p>
                  </div>
                </div>
              }

              @if (pet.birth_date) {
                <div class="flex items-start">
                  <div class="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg class="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 font-medium">Idade</p>
                    <p class="text-lg text-gray-900">{{ calculateAge(pet.birth_date) }}</p>
                  </div>
                </div>
              }

              @if (pet.weight) {
                <div class="flex items-start">
                  <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 font-medium">Peso</p>
                    <p class="text-lg text-gray-900">{{ pet.weight }} kg</p>
                  </div>
                </div>
              }

              @if (pet.location) {
                <div class="flex items-start">
                  <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 font-medium">Localização</p>
                    <p class="text-lg text-gray-900">{{ pet.location.name }}</p>
                  </div>
                </div>
              }

              @if (pet.dietary_restrictions) {
                <div class="flex items-start">
                  <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 font-medium">Restrições Alimentares</p>
                    <p class="text-lg text-gray-900">{{ pet.dietary_restrictions }}</p>
                  </div>
                </div>
              }

              @if (pet.feeding_schedule) {
                <div class="flex items-start">
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 font-medium">Horários de Alimentação</p>
                    <p class="text-lg text-gray-900">{{ pet.feeding_schedule }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Tabs for Meals and Reminders -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Meals Tab -->
          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Refeições</h2>
              <button
                [routerLink]="['/app/meals/new']"
                [queryParams]="{pet_id: pet.id}"
                class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Nova Refeição</span>
              </button>
            </div>

            @if (loadingMeals) {
              <div class="flex justify-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
              </div>
            } @else if (meals.length > 0) {
              <div class="space-y-3 max-h-96 overflow-y-auto">
                @for (meal of meals; track meal.id) {
                  <div class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex items-start justify-between">
                      <div class="flex items-start space-x-3">
                        <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <p class="font-medium text-gray-900">{{ meal.scheduled_for | date:'dd/MM/yyyy HH:mm' }}</p>
                          <p class="text-sm text-gray-600">{{ meal.food_type }} - {{ meal.quantity }}{{ meal.unit }}</p>
                          @if (meal.notes) {
                            <p class="text-sm text-gray-500 mt-1">{{ meal.notes }}</p>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-12">
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p class="text-gray-500">Nenhuma refeição registrada</p>
              </div>
            }
          </div>

          <!-- Reminders Tab -->
          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Lembretes</h2>
              <button
                [routerLink]="['/app/reminders/new']"
                [queryParams]="{pet_id: pet.id}"
                class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Novo Lembrete</span>
              </button>
            </div>

            @if (loadingReminders) {
              <div class="flex justify-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
              </div>
            } @else if (reminders.length > 0) {
              <div class="space-y-3 max-h-96 overflow-y-auto">
                @for (reminder of reminders; track reminder.id) {
                  <div class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex items-start space-x-3">
                      <div class="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <p class="font-medium text-gray-900">{{ reminder.title }}</p>
                        <p class="text-sm text-gray-600">{{ reminder.reminder_time | date:'dd/MM/yyyy HH:mm' }}</p>
                        @if (reminder.description) {
                          <p class="text-sm text-gray-500 mt-1">{{ reminder.description }}</p>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-12">
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p class="text-gray-500">Nenhum lembrete configurado</p>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="card text-center py-16">
          <svg class="w-24 h-24 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Pet não encontrado</h2>
          <p class="text-gray-600 mb-6">O pet que você está procurando não existe ou foi removido</p>
          <button
            routerLink="/app/pets"
            class="btn-primary inline-flex items-center space-x-2 px-6 py-3"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Voltar para Pets</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: []
})
export class PetDetailComponent implements OnInit {
  private petService = inject(PetService);
  private mealService = inject(MealService);
  private reminderService = inject(ReminderService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private modalService = inject(ModalService);

  pet?: Pet;
  meals: Meal[] = [];
  reminders: Reminder[] = [];
  loading = true;
  loadingMeals = false;
  loadingReminders = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPet(+id);
      this.loadMeals(+id);
      this.loadReminders(+id);
    }
  }

  loadPet(id: number): void {
    this.loading = true;
    this.petService.getById(id).subscribe({
      next: (pet) => {
        this.pet = pet;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pet:', error);
        this.pet = undefined;
        this.loading = false;
      }
    });
  }

  loadMeals(petId: number): void {
    this.loadingMeals = true;
    this.mealService.getAll().subscribe({
      next: (meals) => {
        this.meals = Array.isArray(meals)
          ? meals.filter(meal => meal.pet_id === petId)
          : [];
        this.loadingMeals = false;
      },
      error: (error) => {
        console.error('Erro ao carregar refeições:', error);
        this.meals = [];
        this.loadingMeals = false;
      }
    });
  }

  loadReminders(petId: number): void {
    this.loadingReminders = true;
    this.reminderService.getAll().subscribe({
      next: (reminders) => {
        this.reminders = Array.isArray(reminders)
          ? reminders.filter(reminder => reminder.pet_id === petId)
          : [];
        this.loadingReminders = false;
      },
      error: (error) => {
        console.error('Erro ao carregar lembretes:', error);
        this.reminders = [];
        this.loadingReminders = false;
      }
    });
  }

  getSpeciesLabel(species: string): string {
    const labels: { [key: string]: string } = {
      'Cachorro': 'Cachorro',
      'Gato': 'Gato',
      'Pássaro': 'Pássaro',
      'Peixe': 'Peixe',
      'Réptil': 'Réptil',
      'Roedor': 'Roedor',
      'Outro': 'Outro',
      // Fallbacks para valores antigos em inglês
      'dog': 'Cachorro',
      'cat': 'Gato',
      'bird': 'Pássaro',
      'other': 'Outro'
    };
    return labels[species] || species;
  }

  calculateAge(birthDate: string): string {
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();

    if (years === 0) {
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else if (months < 0) {
      return `${years - 1} ${years - 1 === 1 ? 'ano' : 'anos'}`;
    } else {
      return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
  }

  async deletePet(): Promise<void> {
    const confirmed = await this.modalService.confirm(
      `Tem certeza que deseja excluir ${this.pet?.name}? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.`,
      'Excluir Pet',
      'Excluir',
      'Cancelar'
    );

    if (confirmed && this.pet?.id) {
      this.petService.delete(this.pet.id).subscribe({
        next: () => {
          this.modalService.success('Pet excluído com sucesso!');
          this.router.navigate(['/app/pets']);
        },
        error: (error) => {
          console.error('Erro ao deletar pet:', error);
          this.modalService.showBackendError(error, 'Erro ao deletar pet. Tente novamente.');
        }
      });
    }
  }
}
