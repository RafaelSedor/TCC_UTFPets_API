import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LocationService } from '../services/location.service';
import { Location } from '../../../core/models/pet.model';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Localizações Compartilhadas</h1>
        <p class="text-gray-600 mt-1">Organize os lugares onde seus pets ficam</p>
      </div>

      <!-- Create New Location Form -->
      <div class="card mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Nova Localização</h2>
        <form [formGroup]="locationForm" (ngSubmit)="createLocation()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label-text">Nome da Localização *</label>
              <input
                type="text"
                formControlName="name"
                placeholder="Ex: Casa, Escritório, Pet Shop"
                class="input-field"
                [class.border-red-500]="locationForm.get('name')?.invalid && locationForm.get('name')?.touched"
              />
              @if (locationForm.get('name')?.hasError('required') && locationForm.get('name')?.touched) {
                <p class="mt-1 text-sm text-red-600">📝 Nome é obrigatório</p>
              }
            </div>

            <div>
              <label class="label-text">Endereço (Opcional)</label>
              <input
                type="text"
                formControlName="address"
                placeholder="Ex: Rua das Flores, 123"
                class="input-field"
              />
            </div>
          </div>

          @if (errorMessage) {
            <div class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-800">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
          }

          <div class="flex justify-end">
            <button
              type="submit"
              [disabled]="locationForm.invalid || submitting"
              class="btn-primary flex items-center space-x-2 px-6 py-2.5 disabled:opacity-50"
            >
              @if (submitting) {
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Criando...</span>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Criar Localização</span>
              }
            </button>
          </div>
        </form>
      </div>

      <!-- Locations List -->
      @if (loading) {
        <div class="flex flex-col items-center justify-center py-20">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
          <p class="text-gray-600 mt-4 text-lg">Carregando localizações...</p>
        </div>
      } @else if (locations.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (location of locations; track location.id) {
            <div class="card hover:shadow-xl transition-all duration-300 group">
              <!-- Location Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-start space-x-3 flex-1">
                  <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                      {{ location.name }}
                    </h3>
                    @if (location.address) {
                      <p class="text-sm text-gray-600 mt-1 truncate">{{ location.address }}</p>
                    }
                  </div>
                </div>
              </div>

              <!-- Location Info -->
              <div class="space-y-3 mb-4">
                <div class="flex items-center space-x-2 text-gray-700">
                  <svg class="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm">{{ location.pets_count || 0 }} pet(s) nesta localização</span>
                </div>

                @if (location.created_at) {
                  <div class="flex items-center space-x-2 text-gray-700">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm">Criado em {{ location.created_at | date:'dd/MM/yyyy' }}</span>
                  </div>
                }
              </div>

              <!-- Actions -->
              <div class="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                <button
                  (click)="editLocation(location)"
                  class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  (click)="deleteLocation(location)"
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Nenhuma localização cadastrada</h2>
          <p class="text-gray-600">Crie localizações para organizar onde seus pets ficam</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class LocationListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private locationService = inject(LocationService);
  private modalService = inject(ModalService);

  locationForm: FormGroup;
  locations: Location[] = [];
  loading = true;
  submitting = false;
  errorMessage = '';

  constructor() {
    this.locationForm = this.fb.group({
      name: ['', Validators.required],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.loading = true;
    this.locationService.getAll().subscribe({
      next: (locations) => {
        this.locations = Array.isArray(locations) ? locations : [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar localizações:', error);
        this.locations = [];
        this.loading = false;
      }
    });
  }

  createLocation(): void {
    if (this.locationForm.valid) {
      this.submitting = true;
      this.errorMessage = '';

      this.locationService.create(this.locationForm.value).subscribe({
        next: (location) => {
          this.locations.push(location);
          this.locationForm.reset();
          this.submitting = false;
        },
        error: (error) => {
          console.error('Erro ao criar localização:', error);
          this.errorMessage = error.error?.message || 'Erro ao criar localização. Tente novamente.';
          this.submitting = false;
        }
      });
    }
  }

  async editLocation(location: Location): Promise<void> {
    // TODO: Implementar modal de edição com formulário completo
    // Por enquanto, vamos usar o modal de confirmação como exemplo
    await this.modalService.alert(
      'A edição de localização será implementada com um formulário modal completo em breve.',
      'Editar Localização'
    );
  }

  async deleteLocation(location: Location): Promise<void> {
    const confirmed = await this.modalService.confirm(
      `Tem certeza que deseja excluir "${location.name}"? Esta ação não pode ser desfeita.`,
      'Excluir Localização',
      'Excluir',
      'Cancelar'
    );

    if (confirmed) {
      this.locationService.delete(location.id).subscribe({
        next: () => {
          this.locations = this.locations.filter(l => l.id !== location.id);
          this.modalService.success('Localização excluída com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao deletar localização:', error);
          this.modalService.showBackendError(error, 'Erro ao deletar localização. Tente novamente.');
        }
      });
    }
  }
}
