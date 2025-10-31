import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PetService } from '../services/pet.service';
import { Pet } from '../../../core/models/pet.model';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Meus Pets</h1>
          <p class="text-gray-600 mt-1">Gerencie e acompanhe seus pets</p>
        </div>
        <button
          routerLink="/app/pets/new"
          class="btn-primary flex items-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Adicionar Pet</span>
        </button>
      </div>

      @if (loading) {
        <!-- Loading State -->
        <div class="flex flex-col items-center justify-center py-20">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
          <p class="text-gray-600 mt-4 text-lg">Carregando seus pets...</p>
        </div>
      } @else if (pets.length === 0) {
        <!-- Empty State -->
        <div class="card text-center py-16">
          <div class="flex flex-col items-center space-y-6">
            <div class="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
              <svg class="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Nenhum pet cadastrado ainda</h2>
              <p class="text-gray-600 mb-6">Que tal adicionar seu primeiro pet agora?</p>
            </div>
            <button
              routerLink="/app/pets/new"
              class="btn-primary flex items-center space-x-2 text-lg px-8 py-3"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Adicionar Primeiro Pet</span>
            </button>
          </div>
        </div>
      } @else {
        <!-- Pets Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (pet of pets; track pet.id) {
            <div
              [routerLink]="['/app/pets', pet.id]"
              class="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              <!-- Pet Image -->
              <div class="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
                @if (pet.photo_url) {
                  <img
                    [src]="pet.photo_url"
                    [alt]="pet.name"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                } @else {
                  <div class="w-full h-full flex items-center justify-center">
                    <svg class="w-20 h-20 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                }
                <!-- Species Badge -->
                <div class="absolute top-3 right-3">
                  <span class="px-3 py-1 bg-white bg-opacity-90 backdrop-blur-sm rounded-full text-xs font-semibold text-primary-700">
                    {{ getSpeciesLabel(pet.species) }}
                  </span>
                </div>
              </div>

              <!-- Pet Info -->
              <div class="p-5">
                <h3 class="text-xl font-bold text-gray-900 mb-1">{{ pet.name }}</h3>
                @if (pet.breed) {
                  <p class="text-sm text-gray-600 mb-4">{{ pet.breed }}</p>
                }

                <!-- Details -->
                <div class="space-y-2 mb-4">
                  @if (pet.weight) {
                    <div class="flex items-center text-sm text-gray-600">
                      <svg class="w-4 h-4 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                      <span>{{ pet.weight }}kg</span>
                    </div>
                  }
                  @if (pet.location) {
                    <div class="flex items-center text-sm text-gray-600">
                      <svg class="w-4 h-4 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{{ pet.location.name }}</span>
                    </div>
                  }
                </div>

                <!-- Actions -->
                <div class="flex space-x-2 pt-4 border-t border-gray-100">
                  <button
                    [routerLink]="['/app/pets', pet.id]"
                    (click)="$event.stopPropagation()"
                    class="flex-1 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    Ver Detalhes
                  </button>
                  <button
                    [routerLink]="['/app/pets/edit', pet.id]"
                    (click)="$event.stopPropagation()"
                    class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: []
})
export class PetListComponent implements OnInit {
  petService = inject(PetService);

  pets: Pet[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadPets();
  }

  loadPets(): void {
    this.petService.getAll().subscribe({
      next: (response: any) => {
        // A API retorna um array direto, não um objeto com data
        this.pets = Array.isArray(response) ? response : [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pets:', error);
        this.pets = [];
        this.loading = false;
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
}
