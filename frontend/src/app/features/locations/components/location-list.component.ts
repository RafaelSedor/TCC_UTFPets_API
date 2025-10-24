import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { LocationService } from '../services/location.service';
import { Location } from '../../../core/models/shared.model';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Localizações Compartilhadas</h1>
      </div>
      <!-- Create new location form -->
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>Nova Localização</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="locationForm" (ngSubmit)="createLocation()">
            <mat-form-field appearance="outline">
              <mat-label>Nome da Localização</mat-label>
              <input matInput formControlName="name" required placeholder="Ex: Casa, Escritório, Pet Shop">
              @if (locationForm.get('name')?.hasError('required') && locationForm.get('name')?.touched) {
                <mat-error>Nome é obrigatório</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Endereço</mat-label>
              <input matInput formControlName="address" placeholder="Opcional">
            </mat-form-field>

            @if (errorMessage) {
              <div class="error-message">
                <mat-icon>error</mat-icon>
                {{ errorMessage }}
              </div>
            }

            <button mat-raised-button color="primary" type="submit" [disabled]="locationForm.invalid || submitting">
              @if (submitting) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <mat-icon>add</mat-icon>
                Criar Localização
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Locations list -->
      @if (loading) {
        <div class="loading">
          <mat-spinner></mat-spinner>
          <p>Carregando localizações...</p>
        </div>
      } @else if (locations.length > 0) {
        <div class="locations-grid">
          @for (location of locations; track location.id) {
            <mat-card class="location-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>place</mat-icon>
                <mat-card-title>{{ location.name }}</mat-card-title>
                @if (location.address) {
                  <mat-card-subtitle>{{ location.address }}</mat-card-subtitle>
                }
              </mat-card-header>

              <mat-card-content>
                <div class="location-info">
                  <div class="info-item">
                    <mat-icon>pets</mat-icon>
                    <span>{{ location.pets_count || 0 }} pet(s) nesta localização</span>
                  </div>

                  @if (location.created_at) {
                    <div class="info-item">
                      <mat-icon>event</mat-icon>
                      <span>Criado em {{ location.created_at | date:'dd/MM/yyyy' }}</span>
                    </div>
                  }
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-icon-button color="primary" (click)="editLocation(location)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteLocation(location)">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      } @else {
        <div class="empty-state">
          <mat-icon>location_off</mat-icon>
          <h2>Nenhuma localização cadastrada</h2>
          <p>Crie localizações para organizar onde seus pets ficam</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 24px auto;
      padding: 0 16px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 500;
      color: #333;
    }

    .form-card {
      margin-bottom: 32px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    mat-form-field {
      width: 100%;
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

    .locations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .location-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .location-card mat-card-header {
      margin-bottom: 16px;
    }

    .location-card mat-card-content {
      flex: 1;
    }

    .location-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .info-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #667eea;
    }

    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 120px;
      width: 120px;
      height: 120px;
      color: #ccc;
      margin-bottom: 24px;
    }

    .empty-state h2 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .empty-state p {
      margin: 0;
      color: #666;
    }
  `]
})
export class LocationListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private locationService = inject(LocationService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

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
      next: (response) => {
        this.locations = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar localizações:', error);
        this.loading = false;
      }
    });
  }

  createLocation(): void {
    if (this.locationForm.valid) {
      this.submitting = true;
      this.errorMessage = '';

      this.locationService.create(this.locationForm.value).subscribe({
        next: (response) => {
          this.locations.push(response.data);
          this.locationForm.reset();
          this.snackBar.open('Localização criada com sucesso!', 'Fechar', { duration: 3000 });
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

  editLocation(location: Location): void {
    const newName = prompt('Novo nome:', location.name);
    if (newName && newName !== location.name) {
      this.locationService.update(location.id, { name: newName }).subscribe({
        next: (response) => {
          const index = this.locations.findIndex(l => l.id === location.id);
          if (index !== -1) {
            this.locations[index] = response.data;
          }
          this.snackBar.open('Localização atualizada!', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erro ao atualizar localização:', error);
          this.snackBar.open('Erro ao atualizar localização', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  deleteLocation(location: Location): void {
    if (confirm(`Tem certeza que deseja excluir "${location.name}"?`)) {
      this.locationService.delete(location.id).subscribe({
        next: () => {
          this.locations = this.locations.filter(l => l.id !== location.id);
          this.snackBar.open('Localização excluída!', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erro ao deletar localização:', error);
          this.snackBar.open('Erro ao deletar localização', 'Fechar', { duration: 3000 });
        }
      });
    }
  }
}
