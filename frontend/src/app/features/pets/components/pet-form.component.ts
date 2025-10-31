import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PetService } from '../services/pet.service';
import { LocationService } from '../../locations/services/location.service';
import { Location } from '../../../core/models/pet.model';

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center mb-6">
        <button
          routerLink="/app/pets"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
        >
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ isEditMode ? 'Editar Pet' : 'Novo Pet' }}</h1>
          <p class="text-gray-600 mt-1">{{ isEditMode ? 'Atualize as informações do seu pet' : 'Adicione um novo pet à sua família' }}</p>
        </div>
      </div>

      @if (loading) {
        <div class="flex flex-col items-center justify-center py-20">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
          <p class="text-gray-600 mt-4 text-lg">Carregando...</p>
        </div>
      } @else {
        <form [formGroup]="petForm" (ngSubmit)="onSubmit()" class="card space-y-6">
          <!-- Nome do Pet -->
          <div>
            <label class="label-text">Nome do Pet *</label>
            <input
              type="text"
              formControlName="name"
              placeholder="Ex: Rex, Mia, Bob..."
              class="input-field"
              [class.border-red-500]="petForm.get('name')?.invalid && petForm.get('name')?.touched"
            />
            @if (petForm.get('name')?.hasError('required') && petForm.get('name')?.touched) {
              <p class="mt-1 text-sm text-red-600">📝 Nome é obrigatório</p>
            }
          </div>

          <!-- Espécie e Raça -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="label-text">Espécie *</label>
              <select
                formControlName="species"
                class="input-field"
                [class.border-red-500]="petForm.get('species')?.invalid && petForm.get('species')?.touched"
              >
                <option value="">Selecione a espécie...</option>
                <option value="Cachorro">🐕 Cachorro</option>
                <option value="Gato">🐱 Gato</option>
                <option value="Pássaro">🐦 Pássaro</option>
                <option value="Peixe">🐟 Peixe</option>
                <option value="Réptil">🦎 Réptil</option>
                <option value="Roedor">🐭 Roedor</option>
                <option value="Outro">🐾 Outro</option>
              </select>
              @if (petForm.get('species')?.hasError('required') && petForm.get('species')?.touched) {
                <p class="mt-1 text-sm text-red-600">🐾 Espécie é obrigatória</p>
              }
            </div>

            <div>
              <label class="label-text">Raça</label>
              <input
                type="text"
                formControlName="breed"
                placeholder="Ex: Labrador, Siamês..."
                class="input-field"
              />
            </div>
          </div>

          <!-- Data de Nascimento e Peso -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="label-text">Data de Nascimento</label>
              <input
                type="date"
                formControlName="birth_date"
                class="input-field"
              />
            </div>

            <div>
              <label class="label-text">Peso (kg)</label>
              <div class="relative">
                <input
                  type="number"
                  step="0.1"
                  formControlName="weight"
                  placeholder="Ex: 25.5"
                  class="input-field pr-12"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">kg</span>
              </div>
            </div>
          </div>

          <!-- Location -->
          <div>
            <label class="label-text">Local *</label>
            <select
              formControlName="location_id"
              class="input-field"
              [class.border-red-500]="petForm.get('location_id')?.invalid && petForm.get('location_id')?.touched"
            >
              <option value="">Selecione um local</option>
              @for (location of locations; track location.id) {
                <option [value]="location.id">{{ location.name }}</option>
              }
            </select>
            @if (petForm.get('location_id')?.hasError('required') && petForm.get('location_id')?.touched) {
              <p class="mt-1 text-sm text-red-600">📍 Local é obrigatório</p>
            }
          </div>

          <!-- Restrições Alimentares -->
          <div>
            <label class="label-text">Restrições Alimentares</label>
            <textarea
              formControlName="dietary_restrictions"
              rows="3"
              placeholder="Ex: Alérgico a frango, intolerante à lactose..."
              class="input-field resize-none"
            ></textarea>
          </div>

          <!-- Horários de Alimentação -->
          <div>
            <label class="label-text">Horários de Alimentação</label>
            <textarea
              formControlName="feeding_schedule"
              rows="2"
              placeholder="Ex: 08:00, 12:00, 18:00"
              class="input-field resize-none"
            ></textarea>
          </div>

          <!-- Foto do Pet -->
          <div>
            <label class="label-text">Foto do Pet</label>
            <div class="flex items-center space-x-4">
              <input
                type="file"
                #fileInput
                accept="image/*"
                (change)="onFileSelected($event)"
                class="hidden"
              />
              <button
                type="button"
                (click)="fileInput.click()"
                class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Escolher Foto</span>
              </button>
              @if (selectedFileName) {
                <span class="text-sm text-gray-600">{{ selectedFileName }}</span>
              }
            </div>
            @if (photoPreview) {
              <div class="mt-4">
                <img [src]="photoPreview" alt="Preview" class="w-48 h-48 object-cover rounded-xl border-2 border-gray-200 shadow-sm" />
              </div>
            }
          </div>

          <!-- Error Message -->
          @if (errorMessage) {
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm text-red-700">{{ errorMessage }}</p>
              </div>
            </div>
          }

          <!-- Form Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              routerLink="/app/pets"
              class="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="submitting || petForm.invalid"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 px-6 py-2.5"
            >
              @if (submitting) {
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Salvando...</span>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ isEditMode ? 'Salvar Alterações' : 'Cadastrar Pet' }}</span>
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: []
})
export class PetFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private petService = inject(PetService);
  private locationService = inject(LocationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  petForm: FormGroup;
  loading = false;
  submitting = false;
  errorMessage = '';
  isEditMode = false;
  petId?: number;
  selectedFile?: File;
  selectedFileName = '';
  photoPreview = '';
  locations: Location[] = [];

  constructor() {
    this.petForm = this.fb.group({
      name: ['', Validators.required],
      species: ['', Validators.required],
      breed: [''],
      birth_date: [''],
      weight: [''],
      location_id: ['', Validators.required],
      dietary_restrictions: [''],
      feeding_schedule: ['']
    });
  }

  ngOnInit(): void {
    this.loadLocations();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.petId = +id;
      this.loadPet();
    }
  }

  loadLocations(): void {
    this.locationService.getAll().subscribe({
      next: (locations) => {
        this.locations = Array.isArray(locations) ? locations : [];
        if (this.locations.length > 0 && !this.isEditMode) {
          this.petForm.patchValue({ location_id: this.locations[0].id });
        }
      },
      error: (error) => {
        console.error('Erro ao carregar locations:', error);
        this.locations = [];
      }
    });
  }

  loadPet(): void {
    if (!this.petId) return;

    this.loading = true;
    this.petService.getById(this.petId).subscribe({
      next: (pet) => {
        this.petForm.patchValue({
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          birth_date: pet.birth_date,
          weight: pet.weight,
          location_id: pet.location_id,
          dietary_restrictions: pet.dietary_restrictions,
          feeding_schedule: pet.feeding_schedule
        });

        if (pet.photo_url) {
          this.photoPreview = pet.photo_url;
        }

        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar pet';
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;

      // Preview da imagem
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.petForm.invalid) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const formData = {
      ...this.petForm.value,
      photo: this.selectedFile
    };

    const request = this.isEditMode && this.petId
      ? this.petService.update(this.petId, formData)
      : this.petService.create(formData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/app/pets']);
      },
      error: (error) => {
        this.submitting = false;
        this.errorMessage = error.error?.message || 'Erro ao salvar pet';
      }
    });
  }
}
