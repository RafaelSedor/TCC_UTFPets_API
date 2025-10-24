import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { PetService } from '../services/pet.service';
import { LocationService } from '../../locations/services/location.service';
import { Location } from '../../../core/models/pet.model';

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <button mat-icon-button routerLink="/app/pets">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <mat-card-title>{{ isEditMode ? 'Editar Pet' : 'Novo Pet' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          @if (loading) {
            <div class="loading">
              <mat-spinner></mat-spinner>
              <p>Carregando...</p>
            </div>
          } @else {
            <form [formGroup]="petForm" (ngSubmit)="onSubmit()">
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nome do Pet</mat-label>
                  <input matInput formControlName="name" placeholder="Ex: Rex">
                  @if (petForm.get('name')?.hasError('required') && petForm.get('name')?.touched) {
                    <mat-error>Nome é obrigatório</mat-error>
                  }
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Espécie</mat-label>
                  <mat-select formControlName="species">
                    <mat-option value="dog">Cachorro</mat-option>
                    <mat-option value="cat">Gato</mat-option>
                    <mat-option value="bird">Pássaro</mat-option>
                    <mat-option value="other">Outro</mat-option>
                  </mat-select>
                  @if (petForm.get('species')?.hasError('required') && petForm.get('species')?.touched) {
                    <mat-error>Espécie é obrigatória</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Raça</mat-label>
                  <input matInput formControlName="breed" placeholder="Ex: Labrador">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Data de Nascimento</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="birth_date">
                  <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Peso (kg)</mat-label>
                  <input matInput type="number" formControlName="weight" placeholder="Ex: 15.5">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Location</mat-label>
                  <mat-select formControlName="location_id">
                    @for (location of locations; track location.id) {
                      <mat-option [value]="location.id">{{ location.name }}</mat-option>
                    }
                  </mat-select>
                  @if (petForm.get('location_id')?.hasError('required') && petForm.get('location_id')?.touched) {
                    <mat-error>Location é obrigatória</mat-error>
                  }
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Restrições Alimentares</mat-label>
                  <textarea matInput formControlName="dietary_restrictions"
                            placeholder="Ex: Alérgico a frango" rows="3"></textarea>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Horários de Alimentação</mat-label>
                  <textarea matInput formControlName="feeding_schedule"
                            placeholder="Ex: 08:00, 12:00, 18:00" rows="2"></textarea>
                </mat-form-field>
              </div>

              <div class="form-row">
                <div class="photo-upload">
                  <label>Foto do Pet</label>
                  <input type="file" #fileInput accept="image/*"
                         (change)="onFileSelected($event)" style="display: none">
                  <button mat-stroked-button type="button" (click)="fileInput.click()">
                    <mat-icon>photo_camera</mat-icon>
                    Escolher Foto
                  </button>
                  @if (selectedFileName) {
                    <span class="file-name">{{ selectedFileName }}</span>
                  }
                  @if (photoPreview) {
                    <img [src]="photoPreview" class="photo-preview" alt="Preview">
                  }
                </div>
              </div>

              @if (errorMessage) {
                <div class="error-message">{{ errorMessage }}</div>
              }

              <div class="form-actions">
                <button mat-button type="button" routerLink="/app/pets">Cancelar</button>
                <button mat-raised-button color="primary" type="submit"
                        [disabled]="submitting || petForm.invalid">
                  @if (submitting) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    {{ isEditMode ? 'Salvar' : 'Cadastrar' }}
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
      max-width: 800px;
      margin: 24px auto;
      padding: 0 16px;
    }

    mat-card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 8px;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      width: calc(50% - 8px);
    }

    .photo-upload {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }

    .photo-upload label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
    }

    .file-name {
      color: #666;
      font-size: 14px;
    }

    .photo-preview {
      max-width: 200px;
      border-radius: 8px;
      margin-top: 8px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
    }

    .error-message {
      color: #f44336;
      padding: 12px;
      background-color: #ffebee;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    mat-spinner {
      margin: 0 auto;
    }
  `]
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
      species: ['dog', Validators.required],
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
      next: (response) => {
        this.locations = response.data;
        if (this.locations.length > 0 && !this.isEditMode) {
          this.petForm.patchValue({ location_id: this.locations[0].id });
        }
      },
      error: (error) => {
        console.error('Erro ao carregar locations:', error);
      }
    });
  }

  loadPet(): void {
    if (!this.petId) return;

    this.loading = true;
    this.petService.getById(this.petId).subscribe({
      next: (response) => {
        const pet = response.data;
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
