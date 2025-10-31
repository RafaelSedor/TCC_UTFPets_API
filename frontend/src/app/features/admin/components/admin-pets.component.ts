import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, PaginatedResponse } from '../services/admin.service';
import { Pet } from '../../../core/models/pet.model';

@Component({
  selector: 'app-admin-pets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Visualizar Pets</h1>
            <p class="text-gray-600 mt-1">Todos os pets cadastrados no sistema</p>
          </div>
          <button
            routerLink="/app/profile"
            class="btn-secondary"
          >
            Voltar ao Perfil
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Search -->
          <div>
            <label class="label">Buscar Pet</label>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
              placeholder="Nome ou espécie..."
              class="input"
            />
          </div>

          <!-- User ID Filter -->
          <div>
            <label class="label">Filtrar por Dono (ID)</label>
            <input
              type="number"
              [(ngModel)]="filterUserId"
              (input)="onFilterChange()"
              placeholder="ID do usuário..."
              class="input"
            />
          </div>
        </div>
      </div>

      @if (loading) {
        <div class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
        </div>
      } @else {
        @if (pets.length > 0) {
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (pet of pets; track pet.id) {
                <div class="card hover:shadow-lg transition-shadow">
                  <!-- Pet Image -->
                  <div class="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-t-lg overflow-hidden">
                    @if (pet.photo_url) {
                      <img
                        [src]="pet.photo_url"
                        [alt]="pet.name"
                        class="w-full h-full object-cover"
                      />
                    } @else {
                      <div class="w-full h-full flex items-center justify-center">
                        <svg class="w-24 h-24 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    }
                  </div>

                  <!-- Pet Info -->
                  <div class="p-4">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">{{ pet.name }}</h3>

                    <div class="space-y-2 text-sm">
                      <div class="flex items-center text-gray-600">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {{ pet.species }}
                      </div>

                      @if (pet.breed) {
                        <div class="flex items-center text-gray-600">
                          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {{ pet.breed }}
                        </div>
                      }

                      @if (pet.birth_date) {
                        <div class="flex items-center text-gray-600">
                          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {{ pet.birth_date | date:'dd/MM/yyyy' }}
                        </div>
                      }

                      <div class="flex items-center text-gray-600">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Dono ID: {{ pet.user_id }}
                      </div>
                    </div>

                    <!-- Pet ID Badge -->
                    <div class="mt-4 pt-4 border-t border-gray-200">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ID: {{ pet.id }}
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Pagination -->
            @if (pagination && pagination.last_page > 1) {
              <div class="card">
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-700">
                    Mostrando
                    <span class="font-medium">{{ (pagination.current_page - 1) * pagination.per_page + 1 }}</span>
                    até
                    <span class="font-medium">{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span>
                    de
                    <span class="font-medium">{{ pagination.total }}</span>
                    resultados
                  </div>
                  <div class="flex space-x-2">
                    <button
                      (click)="goToPage(pagination.current_page - 1)"
                      [disabled]="pagination.current_page === 1"
                      class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      (click)="goToPage(pagination.current_page + 1)"
                      [disabled]="pagination.current_page === pagination.last_page"
                      class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="card text-center py-16">
            <svg class="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Nenhum pet encontrado</h2>
            <p class="text-gray-600">Tente ajustar os filtros de busca</p>
          </div>
        }
      }
    </div>
  `,
  styles: []
})
export class AdminPetsComponent implements OnInit {
  private adminService = inject(AdminService);

  pets: Pet[] = [];
  loading = true;
  searchTerm = '';
  filterUserId?: number;
  currentPage = 1;
  pagination: any = null;
  Math = Math;

  private searchTimeout: any;

  ngOnInit(): void {
    this.loadPets();
  }

  loadPets(): void {
    this.loading = true;
    this.adminService.getPets(this.currentPage, 20, this.searchTerm, this.filterUserId).subscribe({
      next: (response) => {
        this.pets = response.data;
        this.pagination = response.meta;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pets:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadPets();
    }, 500);
  }

  onFilterChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadPets();
    }, 500);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.pagination.last_page) {
      this.currentPage = page;
      this.loadPets();
    }
  }
}
