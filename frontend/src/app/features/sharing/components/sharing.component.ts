import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SharingService } from '../services/sharing.service';
import { PetService } from '../../pets/services/pet.service';
import { LocationService, SharedLocationAccess } from '../../locations/services/location.service';
import { SharedPetAccess } from '../../../core/models/shared.model';
import { Pet } from '../../../core/models/pet.model';
import { Location } from '../../../core/models/pet.model';
import { ModalService } from '../../../core/services/modal.service';

type ShareType = 'pet' | 'location';

@Component({
  selector: 'app-sharing',
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
        <h1 class="text-3xl font-bold text-gray-900">Compartilhamento</h1>
        <p class="text-gray-600 mt-1">Compartilhe pets individuais ou locations inteiras com outras pessoas</p>
      </div>

      <!-- Share access form -->
      <div class="card mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Compartilhar Acesso</h2>

        <form [formGroup]="shareForm" (ngSubmit)="shareAccess()" class="space-y-6">
          <!-- Share Type Selection -->
          <div>
            <label class="label">Tipo de Compartilhamento *</label>
            <div class="grid grid-cols-2 gap-4">
              <button
                type="button"
                (click)="selectShareType('pet')"
                class="p-4 border-2 rounded-lg transition-all"
                [class.border-primary-600]="shareType === 'pet'"
                [class.bg-primary-50]="shareType === 'pet'"
                [class.border-gray-300]="shareType !== 'pet'"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center"
                    [class.bg-primary-100]="shareType === 'pet'"
                    [class.bg-gray-100]="shareType !== 'pet'">
                    <svg class="w-6 h-6" [class.text-primary-600]="shareType === 'pet'" [class.text-gray-400]="shareType !== 'pet'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="text-left">
                    <p class="font-semibold text-gray-900">Pet Individual</p>
                    <p class="text-sm text-gray-600">Compartilhar um pet específico</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                (click)="selectShareType('location')"
                class="p-4 border-2 rounded-lg transition-all"
                [class.border-primary-600]="shareType === 'location'"
                [class.bg-primary-50]="shareType === 'location'"
                [class.border-gray-300]="shareType !== 'location'"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center"
                    [class.bg-primary-100]="shareType === 'location'"
                    [class.bg-gray-100]="shareType !== 'location'">
                    <svg class="w-6 h-6" [class.text-primary-600]="shareType === 'location'" [class.text-gray-400]="shareType !== 'location'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div class="text-left">
                    <p class="font-semibold text-gray-900">Location Completa</p>
                    <p class="text-sm text-gray-600">Todos os pets da location</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Pet Select (conditional) -->
          @if (shareType === 'pet') {
            <div>
              <label for="pet_id" class="label">Pet *</label>
              <select
                id="pet_id"
                formControlName="pet_id"
                class="input"
                [class.input-error]="shareForm.get('pet_id')?.invalid && shareForm.get('pet_id')?.touched"
              >
                <option value="">Selecione um pet</option>
                @for (pet of myPets; track pet.id) {
                  <option [value]="pet.id">{{ pet.name }}</option>
                }
              </select>
              @if (shareForm.get('pet_id')?.hasError('required') && shareForm.get('pet_id')?.touched) {
                <p class="error-message">Selecione um pet</p>
              }
            </div>
          }

          <!-- Location Select (conditional) -->
          @if (shareType === 'location') {
            <div>
              <label for="location_id" class="label">Location *</label>
              <select
                id="location_id"
                formControlName="location_id"
                class="input"
                [class.input-error]="shareForm.get('location_id')?.invalid && shareForm.get('location_id')?.touched"
              >
                <option value="">Selecione uma location</option>
                @for (location of myLocations; track location.id) {
                  <option [value]="location.id">{{ location.name }}</option>
                }
              </select>
              @if (shareForm.get('location_id')?.hasError('required') && shareForm.get('location_id')?.touched) {
                <p class="error-message">Selecione uma location</p>
              }
            </div>
          }

          <!-- Email Input -->
          <div>
            <label for="user_email" class="label">Email do Usuário *</label>
            <input
              id="user_email"
              type="email"
              formControlName="user_email"
              placeholder="usuario@exemplo.com"
              class="input"
              [class.input-error]="shareForm.get('user_email')?.invalid && shareForm.get('user_email')?.touched"
            />
            @if (shareForm.get('user_email')?.hasError('required') && shareForm.get('user_email')?.touched) {
              <p class="error-message">Email é obrigatório</p>
            }
            @if (shareForm.get('user_email')?.hasError('email') && shareForm.get('user_email')?.touched) {
              <p class="error-message">Email inválido</p>
            }
          </div>

          <!-- Permission Level Select -->
          <div>
            <label for="permission_level" class="label">Nível de Permissão *</label>
            <select
              id="permission_level"
              formControlName="permission_level"
              class="input"
              [class.input-error]="shareForm.get('permission_level')?.invalid && shareForm.get('permission_level')?.touched"
            >
              @if (shareType === 'pet') {
                <option value="read">👁️ Visualizar apenas</option>
                <option value="write">✏️ Visualizar e editar</option>
              } @else {
                <option value="viewer">👁️ Visualizar apenas</option>
                <option value="editor">✏️ Visualizar e editar</option>
              }
            </select>
            @if (shareForm.get('permission_level')?.hasError('required') && shareForm.get('permission_level')?.touched) {
              <p class="error-message">Selecione um nível de permissão</p>
            }
          </div>

          <!-- Info Box -->
          <div class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-start space-x-2">
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm">
              @if (shareType === 'pet') {
                <p><strong>Compartilhamento de Pet:</strong> O usuário terá acesso apenas ao pet selecionado.</p>
              } @else {
                <p><strong>Compartilhamento de Location:</strong> O usuário terá acesso a todos os pets desta location.</p>
              }
            </div>
          </div>

          <!-- Error Message -->
          @if (errorMessage) {
            <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-2">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
          }

          <!-- Submit Button -->
          <div class="flex justify-end">
            <button
              type="submit"
              class="btn-primary"
              [disabled]="shareForm.invalid || submitting"
            >
              @if (submitting) {
                <div class="flex items-center space-x-2">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Compartilhando...</span>
                </div>
              } @else {
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Compartilhar</span>
                </div>
              }
            </button>
          </div>
        </form>
      </div>

      <!-- Shared access lists tabs -->
      <div class="mb-8">
        <div class="border-b border-gray-200 mb-6">
          <nav class="flex space-x-8">
            <button
              (click)="activeTab = 'shared-by-me'"
              class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              [class.border-primary-600]="activeTab === 'shared-by-me'"
              [class.text-primary-600]="activeTab === 'shared-by-me'"
              [class.border-transparent]="activeTab !== 'shared-by-me'"
              [class.text-gray-500]="activeTab !== 'shared-by-me'"
            >
              Compartilhados por Mim
            </button>
            <button
              (click)="activeTab = 'shared-with-me'"
              class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              [class.border-primary-600]="activeTab === 'shared-with-me'"
              [class.text-primary-600]="activeTab === 'shared-with-me'"
              [class.border-transparent]="activeTab !== 'shared-with-me'"
              [class.text-gray-500]="activeTab !== 'shared-with-me'"
            >
              Compartilhados Comigo
            </button>
          </nav>
        </div>

        @if (activeTab === 'shared-by-me') {
          @if (loading) {
            <div class="flex flex-col items-center justify-center py-20">
              <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
              <p class="text-gray-600 mt-4 text-lg">Carregando compartilhamentos...</p>
            </div>
          } @else if (sharedPetsByMe.length > 0 || sharedLocationsByMe.length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Pet Shares -->
              @for (access of sharedPetsByMe; track access.id) {
                <div class="card">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 class="font-semibold text-gray-900">{{ access.pet.name }}</h3>
                        <p class="text-sm text-gray-600">{{ access.shared_with_user?.name || access.shared_with_user?.email }}</p>
                      </div>
                    </div>
                    <span class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">Pet</span>
                  </div>

                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4"
                    [class.bg-blue-100]="access.permission_level === 'read'"
                    [class.text-blue-800]="access.permission_level === 'read'"
                    [class.bg-green-100]="access.permission_level === 'write'"
                    [class.text-green-800]="access.permission_level === 'write'"
                  >
                    {{ access.permission_level === 'read' ? 'Visualização' : 'Edição' }}
                  </span>

                  <div class="flex space-x-2 pt-4 border-t border-gray-100">
                    <button
                      (click)="updatePetPermission(access)"
                      class="flex-1 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      Alterar
                    </button>
                    <button
                      (click)="revokePetAccess(access)"
                      class="flex-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Revogar
                    </button>
                  </div>
                </div>
              }

              <!-- Location Shares -->
              @for (access of sharedLocationsByMe; track access.id) {
                <div class="card">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 class="font-semibold text-gray-900">{{ access.location.name }}</h3>
                        <p class="text-sm text-gray-600">{{ access.shared_with_user?.name || access.shared_with_user?.email }}</p>
                      </div>
                    </div>
                    <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Location</span>
                  </div>

                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4"
                    [class.bg-blue-100]="access.role === 'viewer'"
                    [class.text-blue-800]="access.role === 'viewer'"
                    [class.bg-green-100]="access.role === 'editor'"
                    [class.text-green-800]="access.role === 'editor'"
                  >
                    {{ access.role === 'viewer' ? 'Visualização' : 'Edição' }}
                  </span>

                  <div class="flex space-x-2 pt-4 border-t border-gray-100">
                    <button
                      (click)="updateLocationPermission(access)"
                      class="flex-1 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      Alterar
                    </button>
                    <button
                      (click)="revokeLocationAccess(access)"
                      class="flex-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Revogar
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="card text-center py-16">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <p class="text-gray-600">Você ainda não compartilhou nada</p>
            </div>
          }
        }

        @if (activeTab === 'shared-with-me') {
          @if (loadingShared) {
            <div class="flex flex-col items-center justify-center py-20">
              <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
              <p class="text-gray-600 mt-4 text-lg">Carregando...</p>
            </div>
          } @else if (sharedPetsWithMe.length > 0 || sharedLocationsWithMe.length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Shared Pets -->
              @for (access of sharedPetsWithMe; track access.id) {
                <div
                  [routerLink]="['/app/pets', access.pet.id]"
                  class="card cursor-pointer hover:shadow-xl transition-all"
                >
                  @if (access.pet.photo_url) {
                    <div class="h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden -mx-6 -mt-6">
                      <img [src]="access.pet.photo_url" [alt]="access.pet.name" class="w-full h-full object-cover" />
                    </div>
                  }
                  <div class="flex items-start justify-between mb-2">
                    <h3 class="text-lg font-bold text-gray-900">{{ access.pet.name }}</h3>
                    <span class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">Pet</span>
                  </div>
                  <p class="text-sm text-gray-600 mb-3">Por: {{ access.pet.owner?.name }}</p>
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                    [class.bg-blue-100]="access.permission_level === 'read'"
                    [class.text-blue-800]="access.permission_level === 'read'"
                    [class.bg-green-100]="access.permission_level === 'write'"
                    [class.text-green-800]="access.permission_level === 'write'"
                  >
                    {{ access.permission_level === 'read' ? 'Visualização' : 'Edição' }}
                  </span>
                </div>
              }

              <!-- Shared Locations -->
              @for (access of sharedLocationsWithMe; track access.id) {
                <div
                  [routerLink]="['/app/locations']"
                  class="card cursor-pointer hover:shadow-xl transition-all"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center space-x-3">
                      <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 class="text-lg font-bold text-gray-900">{{ access.location.name }}</h3>
                        <p class="text-sm text-gray-600">Por: {{ access.owner?.name }}</p>
                      </div>
                    </div>
                    <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Location</span>
                  </div>
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-3"
                    [class.bg-blue-100]="access.role === 'viewer'"
                    [class.text-blue-800]="access.role === 'viewer'"
                    [class.bg-green-100]="access.role === 'editor'"
                    [class.text-green-800]="access.role === 'editor'"
                  >
                    {{ access.role === 'viewer' ? 'Visualização' : 'Edição' }}
                  </span>
                </div>
              }
            </div>
          } @else {
            <div class="card text-center py-16">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-gray-600">Nada compartilhado com você ainda</p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: []
})
export class SharingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sharingService = inject(SharingService);
  private petService = inject(PetService);
  private locationService = inject(LocationService);
  private modalService = inject(ModalService);

  shareForm: FormGroup;
  shareType: ShareType = 'pet';
  activeTab: 'shared-by-me' | 'shared-with-me' = 'shared-by-me';

  myPets: Pet[] = [];
  myLocations: Location[] = [];

  sharedPetsByMe: SharedPetAccess[] = [];
  sharedLocationsByMe: SharedLocationAccess[] = [];

  sharedPetsWithMe: SharedPetAccess[] = [];
  sharedLocationsWithMe: SharedLocationAccess[] = [];

  loading = true;
  loadingShared = true;
  submitting = false;
  errorMessage = '';

  constructor() {
    this.shareForm = this.fb.group({
      pet_id: [''],
      location_id: [''],
      user_email: ['', [Validators.required, Validators.email]],
      permission_level: ['read', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMyPets();
    this.loadMyLocations();
    this.loadSharedAccess();
    this.loadSharedWithMe();
    this.updateFormValidators();
  }

  selectShareType(type: ShareType): void {
    this.shareType = type;
    // Set appropriate default permission level based on type
    const defaultPermission = type === 'pet' ? 'read' : 'viewer';
    this.shareForm.patchValue({ permission_level: defaultPermission });
    this.updateFormValidators();
  }

  updateFormValidators(): void {
    const petIdControl = this.shareForm.get('pet_id');
    const locationIdControl = this.shareForm.get('location_id');

    if (this.shareType === 'pet') {
      petIdControl?.setValidators([Validators.required]);
      locationIdControl?.clearValidators();
      locationIdControl?.setValue('');
    } else {
      locationIdControl?.setValidators([Validators.required]);
      petIdControl?.clearValidators();
      petIdControl?.setValue('');
    }

    petIdControl?.updateValueAndValidity();
    locationIdControl?.updateValueAndValidity();
  }

  loadMyPets(): void {
    this.petService.getAll().subscribe({
      next: (pets) => {
        this.myPets = Array.isArray(pets) ? pets : [];
      },
      error: (error) => {
        console.error('Erro ao carregar pets:', error);
        this.myPets = [];
      }
    });
  }

  loadMyLocations(): void {
    this.locationService.getAll().subscribe({
      next: (locations) => {
        this.myLocations = Array.isArray(locations) ? locations : [];
      },
      error: (error) => {
        console.error('Erro ao carregar locations:', error);
        this.myLocations = [];
      }
    });
  }

  loadSharedAccess(): void {
    this.loading = true;

    // Load shared pets
    this.sharingService.getSharedByMe().subscribe({
      next: (sharedPets) => {
        this.sharedPetsByMe = Array.isArray(sharedPets) ? sharedPets : [];
      },
      error: (error) => {
        console.error('Erro ao carregar pets compartilhados:', error);
        this.sharedPetsByMe = [];
      }
    });

    // Load shared locations
    this.locationService.getAllSharedLocationsByMe().subscribe({
      next: (sharedLocations) => {
        this.sharedLocationsByMe = Array.isArray(sharedLocations) ? sharedLocations : [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar locations compartilhadas:', error);
        this.sharedLocationsByMe = [];
        this.loading = false;
      }
    });
  }

  loadSharedWithMe(): void {
    this.loadingShared = true;

    // Load pets shared with me
    this.sharingService.getSharedWithMe().subscribe({
      next: (sharedPets) => {
        this.sharedPetsWithMe = Array.isArray(sharedPets) ? sharedPets : [];
      },
      error: (error) => {
        console.error('Erro ao carregar pets compartilhados comigo:', error);
        this.sharedPetsWithMe = [];
      }
    });

    // Load locations shared with me
    this.locationService.getSharedLocationsWithMe().subscribe({
      next: (sharedLocations) => {
        this.sharedLocationsWithMe = Array.isArray(sharedLocations) ? sharedLocations : [];
        this.loadingShared = false;
      },
      error: (error) => {
        console.error('Erro ao carregar locations compartilhadas comigo:', error);
        this.sharedLocationsWithMe = [];
        this.loadingShared = false;
      }
    });
  }

  shareAccess(): void {
    if (this.shareForm.valid) {
      this.submitting = true;
      this.errorMessage = '';

      if (this.shareType === 'pet') {
        const data = {
          pet_id: this.shareForm.value.pet_id,
          user_email: this.shareForm.value.user_email,
          permission_level: this.shareForm.value.permission_level
        };

        this.sharingService.shareAccess(data).subscribe({
          next: (access) => {
            this.sharedPetsByMe.push(access);
            this.shareForm.patchValue({ pet_id: '', user_email: '' });
            this.submitting = false;
          },
          error: (error) => {
            console.error('Erro ao compartilhar pet:', error);
            this.errorMessage = error.error?.message || 'Erro ao compartilhar. Verifique o email do usuário.';
            this.submitting = false;
          }
        });
      } else {
        const data = {
          email: this.shareForm.value.user_email,  // Transform user_email to email for backend
          role: this.shareForm.value.permission_level
        };

        this.locationService.shareLocation(this.shareForm.value.location_id, data).subscribe({
          next: (access) => {
            this.sharedLocationsByMe.push(access);
            this.shareForm.patchValue({ location_id: '', user_email: '' });
            this.submitting = false;
          },
          error: (error) => {
            console.error('Erro ao compartilhar location:', error);
            this.errorMessage = error.error?.message || 'Erro ao compartilhar. Verifique o email do usuário.';
            this.submitting = false;
          }
        });
      }
    }
  }

  updatePetPermission(access: SharedPetAccess): void {
    if (!access.pet_id || !access.user_id) {
      console.error('IDs inválidos:', access);
      return;
    }

    const newPermission = access.permission_level === 'read' ? 'write' : 'read';

    this.sharingService.updatePermission(access.pet_id, access.user_id, { permission_level: newPermission }).subscribe({
      next: (updatedAccess) => {
        const index = this.sharedPetsByMe.findIndex(a => a.id === access.id);
        if (index !== -1) {
          this.sharedPetsByMe[index] = updatedAccess;
        }
      },
      error: (error) => {
        console.error('Erro ao atualizar permissão:', error);
      }
    });
  }

  async revokePetAccess(access: SharedPetAccess): Promise<void> {
    if (!access.pet_id || !access.user_id) {
      console.error('IDs inválidos:', access);
      return;
    }

    const userName = access.shared_with_user?.name || access.shared_with_user?.email;
    const confirmed = await this.modalService.confirm(
      `Tem certeza que deseja revogar o acesso de ${userName} ao pet ${access.pet.name}?`,
      'Revogar Acesso',
      'Revogar',
      'Cancelar'
    );

    if (confirmed) {
      this.sharingService.revokeAccess(access.pet_id, access.user_id).subscribe({
        next: () => {
          this.sharedPetsByMe = this.sharedPetsByMe.filter(a => a.id !== access.id);
          this.modalService.success('Acesso revogado com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao revogar acesso:', error);
          this.modalService.showBackendError(error, 'Erro ao revogar acesso. Tente novamente.');
        }
      });
    }
  }

  updateLocationPermission(access: SharedLocationAccess): void {
    const newRole = access.role === 'viewer' ? 'editor' : 'viewer';

    this.locationService.updateLocationPermission(access.location_id, access.user_id, { role: newRole }).subscribe({
      next: (updatedAccess) => {
        const index = this.sharedLocationsByMe.findIndex(a => a.id === access.id);
        if (index !== -1) {
          this.sharedLocationsByMe[index] = updatedAccess;
        }
      },
      error: (error) => {
        console.error('Erro ao atualizar permissão:', error);
      }
    });
  }

  async revokeLocationAccess(access: SharedLocationAccess): Promise<void> {
    const userName = access.shared_with_user?.name || access.shared_with_user?.email;
    const confirmed = await this.modalService.confirm(
      `Tem certeza que deseja revogar o acesso de ${userName} à location ${access.location.name}?`,
      'Revogar Acesso',
      'Revogar',
      'Cancelar'
    );

    if (confirmed) {
      this.locationService.revokeLocationAccess(access.location_id, access.user_id).subscribe({
        next: () => {
          this.sharedLocationsByMe = this.sharedLocationsByMe.filter(a => a.id !== access.id);
          this.modalService.success('Acesso revogado com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao revogar acesso:', error);
          this.modalService.showBackendError(error, 'Erro ao revogar acesso. Tente novamente.');
        }
      });
    }
  }
}
