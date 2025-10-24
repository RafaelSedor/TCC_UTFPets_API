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
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SharingService } from '../services/sharing.service';
import { PetService } from '../../pets/services/pet.service';
import { SharedPetAccess } from '../../../core/models/shared.model';
import { Pet } from '../../../core/models/pet.model';

@Component({
  selector: 'app-sharing',
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
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Compartilhamento de Pets</h1>
      </div>
      <!-- Share access form -->
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>Compartilhar Acesso</mat-card-title>
          <mat-card-subtitle>Permita que outras pessoas visualizem e gerenciem seus pets</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="shareForm" (ngSubmit)="shareAccess()">
            <mat-form-field appearance="outline">
              <mat-label>Pet</mat-label>
              <mat-select formControlName="pet_id" required>
                @for (pet of myPets; track pet.id) {
                  <mat-option [value]="pet.id">{{ pet.name }}</mat-option>
                }
              </mat-select>
              @if (shareForm.get('pet_id')?.hasError('required') && shareForm.get('pet_id')?.touched) {
                <mat-error>Selecione um pet</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email do Usuário</mat-label>
              <input matInput type="email" formControlName="user_email" required placeholder="usuario@exemplo.com">
              @if (shareForm.get('user_email')?.hasError('required') && shareForm.get('user_email')?.touched) {
                <mat-error>Email é obrigatório</mat-error>
              }
              @if (shareForm.get('user_email')?.hasError('email')) {
                <mat-error>Email inválido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nível de Permissão</mat-label>
              <mat-select formControlName="permission_level" required>
                <mat-option value="read">
                  <mat-icon>visibility</mat-icon>
                  Visualizar apenas
                </mat-option>
                <mat-option value="write">
                  <mat-icon>edit</mat-icon>
                  Visualizar e editar
                </mat-option>
              </mat-select>
              @if (shareForm.get('permission_level')?.hasError('required') && shareForm.get('permission_level')?.touched) {
                <mat-error>Selecione um nível de permissão</mat-error>
              }
            </mat-form-field>

            @if (errorMessage) {
              <div class="error-message">
                <mat-icon>error</mat-icon>
                {{ errorMessage }}
              </div>
            }

            <button mat-raised-button color="primary" type="submit" [disabled]="shareForm.invalid || submitting">
              @if (submitting) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <mat-icon>share</mat-icon>
                Compartilhar
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Shared access list -->
      <h2>Acessos Compartilhados</h2>

      @if (loading) {
        <div class="loading">
          <mat-spinner></mat-spinner>
          <p>Carregando acessos...</p>
        </div>
      } @else if (sharedAccess.length > 0) {
        <div class="access-grid">
          @for (access of sharedAccess; track access.id) {
            <mat-card class="access-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>{{ access.permission_level === 'write' ? 'edit' : 'visibility' }}</mat-icon>
                <mat-card-title>{{ access.pet.name }}</mat-card-title>
                <mat-card-subtitle>Compartilhado com {{ access.shared_with_user?.name || access.shared_with_user?.email }}</mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <div class="access-info">
                  <mat-chip [class.read-chip]="access.permission_level === 'read'" [class.write-chip]="access.permission_level === 'write'">
                    {{ access.permission_level === 'read' ? 'Somente Leitura' : 'Leitura e Escrita' }}
                  </mat-chip>

                  @if (access.created_at) {
                    <div class="info-item">
                      <mat-icon>event</mat-icon>
                      <span>Compartilhado em {{ access.created_at | date:'dd/MM/yyyy' }}</span>
                    </div>
                  }
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-icon-button color="primary" (click)="updatePermission(access)">
                  <mat-icon>sync</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="revokeAccess(access)">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      } @else {
        <div class="empty-state">
          <mat-icon>group_off</mat-icon>
          <h3>Nenhum acesso compartilhado</h3>
          <p>Compartilhe seus pets com familiares e amigos</p>
        </div>
      }

      <!-- Pets shared with me -->
      <h2>Pets Compartilhados Comigo</h2>

      @if (loadingShared) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (sharedWithMe.length > 0) {
        <div class="pets-grid">
          @for (access of sharedWithMe; track access.id) {
            <mat-card class="pet-card" [routerLink]="['/app/pets', access.pet.id]">
              <mat-card-header>
                <mat-icon mat-card-avatar>pets</mat-icon>
                <mat-card-title>{{ access.pet.name }}</mat-card-title>
                <mat-card-subtitle>Proprietário: {{ access.pet.owner?.name }}</mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                @if (access.pet.photo_url) {
                  <img [src]="access.pet.photo_url" [alt]="access.pet.name" class="pet-photo">
                }

                <mat-chip [class.read-chip]="access.permission_level === 'read'" [class.write-chip]="access.permission_level === 'write'">
                  {{ access.permission_level === 'read' ? 'Somente Visualização' : 'Pode Editar' }}
                </mat-chip>
              </mat-card-content>
            </mat-card>
          }
        </div>
      } @else {
        <div class="empty-state">
          <mat-icon>pets</mat-icon>
          <h3>Nenhum pet compartilhado com você</h3>
          <p>Aguarde alguém compartilhar um pet com você</p>
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

    h2 {
      margin: 32px 0 16px 0;
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

    mat-option {
      display: flex;
      align-items: center;
      gap: 8px;
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

    .access-grid, .pets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .access-card, .pet-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .pet-card {
      cursor: pointer;
      transition: transform 0.2s;
    }

    .pet-card:hover {
      transform: translateY(-4px);
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    mat-card-content {
      flex: 1;
    }

    .access-info {
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

    mat-chip {
      font-size: 12px;
    }

    .read-chip {
      background-color: #2196f3 !important;
      color: white !important;
    }

    .write-chip {
      background-color: #4caf50 !important;
      color: white !important;
    }

    .pet-photo {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 12px;
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
      padding: 48px 24px;
      text-align: center;
      background: #f9f9f9;
      border-radius: 8px;
      margin-bottom: 32px;
    }

    .empty-state mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .empty-state p {
      margin: 0;
      color: #666;
    }
  `]
})
export class SharingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sharingService = inject(SharingService);
  private petService = inject(PetService);
  private snackBar = inject(MatSnackBar);

  shareForm: FormGroup;
  myPets: Pet[] = [];
  sharedAccess: SharedPetAccess[] = [];
  sharedWithMe: SharedPetAccess[] = [];
  loading = true;
  loadingShared = true;
  submitting = false;
  errorMessage = '';

  constructor() {
    this.shareForm = this.fb.group({
      pet_id: ['', Validators.required],
      user_email: ['', [Validators.required, Validators.email]],
      permission_level: ['read', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMyPets();
    this.loadSharedAccess();
    this.loadSharedWithMe();
  }

  loadMyPets(): void {
    this.petService.getAll().subscribe({
      next: (response) => {
        this.myPets = response.data;
      },
      error: (error) => {
        console.error('Erro ao carregar pets:', error);
      }
    });
  }

  loadSharedAccess(): void {
    this.loading = true;
    this.sharingService.getSharedByMe().subscribe({
      next: (response) => {
        this.sharedAccess = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar acessos compartilhados:', error);
        this.loading = false;
      }
    });
  }

  loadSharedWithMe(): void {
    this.loadingShared = true;
    this.sharingService.getSharedWithMe().subscribe({
      next: (response) => {
        this.sharedWithMe = response.data;
        this.loadingShared = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pets compartilhados:', error);
        this.loadingShared = false;
      }
    });
  }

  shareAccess(): void {
    if (this.shareForm.valid) {
      this.submitting = true;
      this.errorMessage = '';

      this.sharingService.shareAccess(this.shareForm.value).subscribe({
        next: (response) => {
          this.sharedAccess.push(response.data);
          this.shareForm.reset({ permission_level: 'read' });
          this.snackBar.open('Acesso compartilhado com sucesso!', 'Fechar', { duration: 3000 });
          this.submitting = false;
        },
        error: (error) => {
          console.error('Erro ao compartilhar acesso:', error);
          this.errorMessage = error.error?.message || 'Erro ao compartilhar acesso. Verifique o email do usuário.';
          this.submitting = false;
        }
      });
    }
  }

  updatePermission(access: SharedPetAccess): void {
    const newPermission = access.permission_level === 'read' ? 'write' : 'read';

    this.sharingService.updatePermission(access.id, { permission_level: newPermission }).subscribe({
      next: (response) => {
        const index = this.sharedAccess.findIndex(a => a.id === access.id);
        if (index !== -1) {
          this.sharedAccess[index] = response.data;
        }
        this.snackBar.open('Permissão atualizada!', 'Fechar', { duration: 3000 });
      },
      error: (error) => {
        console.error('Erro ao atualizar permissão:', error);
        this.snackBar.open('Erro ao atualizar permissão', 'Fechar', { duration: 3000 });
      }
    });
  }

  revokeAccess(access: SharedPetAccess): void {
    const userName = access.shared_with_user?.name || access.shared_with_user?.email;
    if (confirm(`Tem certeza que deseja revogar o acesso de ${userName} ao pet ${access.pet.name}?`)) {
      this.sharingService.revokeAccess(access.id).subscribe({
        next: () => {
          this.sharedAccess = this.sharedAccess.filter(a => a.id !== access.id);
          this.snackBar.open('Acesso revogado!', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erro ao revogar acesso:', error);
          this.snackBar.open('Erro ao revogar acesso', 'Fechar', { duration: 3000 });
        }
      });
    }
  }
}
