import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MealService } from '../services/meal.service';
import { PetService } from '../../pets/services/pet.service';
import { Pet } from '../../../core/models/pet.model';
import { MealFormData } from '../../../core/models/meal.model';

@Component({
  selector: 'app-meal-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,

    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <button mat-icon-button routerLink="/app/meals">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <mat-card-title>{{ isEditMode ? 'Editar Refeição' : 'Registrar Refeição' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          @if (loading) {
            <div class="loading">
              <mat-spinner></mat-spinner>
            </div>
          } @else {
            <form [formGroup]="mealForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline">
                <mat-label>Pet</mat-label>
                <mat-select formControlName="pet_id" required>
                  @for (pet of pets; track pet.id) {
                    <mat-option [value]="pet.id">{{ pet.name }}</mat-option>
                  }
                </mat-select>
                @if (mealForm.get('pet_id')?.hasError('required') && mealForm.get('pet_id')?.touched) {
                  <mat-error>Pet é obrigatório</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Data e Hora da Refeição</mat-label>
                <input matInput type="datetime-local" formControlName="meal_time" required>
                @if (mealForm.get('meal_time')?.hasError('required') && mealForm.get('meal_time')?.touched) {
                  <mat-error>Data e hora são obrigatórios</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Quantidade (gramas)</mat-label>
                <input matInput type="number" formControlName="quantity" required min="0">
                <mat-hint>Quantidade em gramas</mat-hint>
                @if (mealForm.get('quantity')?.hasError('required') && mealForm.get('quantity')?.touched) {
                  <mat-error>Quantidade é obrigatória</mat-error>
                }
                @if (mealForm.get('quantity')?.hasError('min')) {
                  <mat-error>Quantidade deve ser maior que zero</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Observações</mat-label>
                <textarea matInput formControlName="notes" rows="4" placeholder="Ex: Comeu tudo, deixou um pouco, etc."></textarea>
              </mat-form-field>

              <div class="photo-upload">
                <div class="photo-preview">
                  @if (photoPreview) {
                    <img [src]="photoPreview" alt="Preview">
                  } @else {
                    <div class="no-photo">
                      <mat-icon>add_photo_alternate</mat-icon>
                      <span>Adicionar foto</span>
                    </div>
                  }
                </div>
                <input type="file" #fileInput accept="image/*" (change)="onFileSelected($event)" style="display: none">
                <button mat-stroked-button type="button" (click)="fileInput.click()">
                  <mat-icon>upload</mat-icon>
                  {{ photoPreview ? 'Trocar Foto' : 'Adicionar Foto' }}
                </button>
                @if (photoPreview) {
                  <button mat-stroked-button type="button" color="warn" (click)="removePhoto()">
                    <mat-icon>delete</mat-icon>
                    Remover Foto
                  </button>
                }
              </div>

              @if (errorMessage) {
                <div class="error-message">
                  <mat-icon>error</mat-icon>
                  {{ errorMessage }}
                </div>
              }

              <div class="form-actions">
                <button mat-stroked-button type="button" routerLink="/app/meals">
                  Cancelar
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="mealForm.invalid || submitting">
                  @if (submitting) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    {{ isEditMode ? 'Atualizar' : 'Registrar' }}
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
      max-width: 600px;
      margin: 24px auto;
      padding: 0 16px;
    }

    mat-card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    mat-form-field {
      width: 100%;
    }

    .photo-upload {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
    }

    .photo-preview {
      width: 200px;
      height: 200px;
      border: 2px dashed #ddd;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f9f9f9;
    }

    .photo-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-photo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #999;
    }

    .no-photo mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #ffebee;
      color: #c62828;
      border-radius: 4px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
  `]
})
export class MealFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mealService = inject(MealService);
  private petService = inject(PetService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  mealForm: FormGroup;
  pets: Pet[] = [];
  selectedFile?: File;
  photoPreview?: string;
  isEditMode = false;
  mealId?: number;
  loading = true;
  submitting = false;
  errorMessage = '';

  constructor() {
    this.mealForm = this.fb.group({
      pet_id: ['', Validators.required],
      meal_time: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
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
      this.mealForm.patchValue({ meal_time: dateTimeString });
    }
  }

  loadPets(): void {
    this.petService.getAll().subscribe({
      next: (response) => {
        this.pets = response.data;
      },
      error: (error) => {
        console.error('Erro ao carregar pets:', error);
        this.errorMessage = 'Erro ao carregar lista de pets';
      }
    });
  }

  loadMeal(id: number): void {
    // We need to fetch the meal - but we need petId first
    // For now, we'll get petId from query params or fetch all meals
    const petId = this.route.snapshot.queryParamMap.get('pet_id');
    if (petId) {
      this.mealService.getById(+petId, id).subscribe({
        next: (response) => {
          const meal = response.data;

          // Convert meal_time to datetime-local format
          const mealTime = new Date(meal.meal_time);
          const dateTimeString = mealTime.toISOString().slice(0, 16);

          this.mealForm.patchValue({
            pet_id: meal.pet_id,
            meal_time: dateTimeString,
            quantity: meal.quantity,
            notes: meal.notes || ''
          });

          if (meal.photo_url) {
            this.photoPreview = meal.photo_url;
          }

          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar refeição:', error);
          this.errorMessage = 'Erro ao carregar refeição';
          this.loading = false;
        }
      });
    } else {
      this.errorMessage = 'Pet ID não encontrado';
      this.loading = false;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.selectedFile = undefined;
    this.photoPreview = undefined;
  }

  onSubmit(): void {
    if (this.mealForm.valid) {
      this.submitting = true;
      this.errorMessage = '';

      const formData: MealFormData = {
        ...this.mealForm.value,
        photo: this.selectedFile
      };

      const request = this.isEditMode && this.mealId
        ? this.mealService.update(this.mealId, formData)
        : this.mealService.create(formData);

      request.subscribe({
        next: () => {
          this.snackBar.open(
            this.isEditMode ? 'Refeição atualizada com sucesso!' : 'Refeição registrada com sucesso!',
            'Fechar',
            { duration: 3000 }
          );
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
