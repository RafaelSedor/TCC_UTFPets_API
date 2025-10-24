import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PetService } from '../services/pet.service';
import { MealService } from '../../meals/services/meal.service';
import { ReminderService } from '../../reminders/services/reminder.service';
import { Pet } from '../../../core/models/pet.model';
import { Meal } from '../../../core/models/meal.model';
import { Reminder } from '../../../core/models/reminder.model';

@Component({
  selector: 'app-pet-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  template: `
    <div class="container">
      @if (loading) {
        <div class="loading">
          <mat-spinner></mat-spinner>
          <p>Carregando...</p>
        </div>
      } @else if (pet) {
        <mat-card>
          <mat-card-header>
            <button mat-icon-button routerLink="/app/pets">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <mat-card-title>{{ pet.name }}</mat-card-title>
            <span class="spacer"></span>
            <button mat-icon-button color="primary" [routerLink]="['/app/pets/edit', pet.id]">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deletePet()">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-header>

          <mat-card-content>
            <div class="pet-info">
              <div class="pet-photo">
                @if (pet.photo_url) {
                  <img [src]="pet.photo_url" [alt]="pet.name">
                } @else {
                  <div class="no-photo">
                    <mat-icon>pets</mat-icon>
                  </div>
                }
              </div>

              <div class="pet-details">
                <div class="detail-item">
                  <mat-icon>category</mat-icon>
                  <span class="label">Espécie:</span>
                  <span class="value">{{ getSpeciesLabel(pet.species) }}</span>
                </div>

                @if (pet.breed) {
                  <div class="detail-item">
                    <mat-icon>info</mat-icon>
                    <span class="label">Raça:</span>
                    <span class="value">{{ pet.breed }}</span>
                  </div>
                }

                @if (pet.birth_date) {
                  <div class="detail-item">
                    <mat-icon>cake</mat-icon>
                    <span class="label">Idade:</span>
                    <span class="value">{{ calculateAge(pet.birth_date) }}</span>
                  </div>
                }

                @if (pet.weight) {
                  <div class="detail-item">
                    <mat-icon>monitor_weight</mat-icon>
                    <span class="label">Peso:</span>
                    <span class="value">{{ pet.weight }} kg</span>
                  </div>
                }

                @if (pet.location) {
                  <div class="detail-item">
                    <mat-icon>place</mat-icon>
                    <span class="label">Localização:</span>
                    <span class="value">{{ pet.location.name }}</span>
                  </div>
                }

                @if (pet.dietary_restrictions) {
                  <div class="detail-item">
                    <mat-icon>restaurant</mat-icon>
                    <span class="label">Restrições Alimentares:</span>
                    <span class="value">{{ pet.dietary_restrictions }}</span>
                  </div>
                }

                @if (pet.feeding_schedule) {
                  <div class="detail-item">
                    <mat-icon>schedule</mat-icon>
                    <span class="label">Horários de Alimentação:</span>
                    <span class="value">{{ pet.feeding_schedule }}</span>
                  </div>
                }
              </div>
            </div>

            <mat-tab-group>
              <mat-tab label="Refeições">
                <div class="tab-content">
                  <div class="tab-header">
                    <h3>Histórico de Refeições</h3>
                    <button mat-raised-button color="primary" [routerLink]="['/app/meals/new']" [queryParams]="{pet_id: pet.id}">
                      <mat-icon>add</mat-icon>
                      Nova Refeição
                    </button>
                  </div>

                  @if (loadingMeals) {
                    <div class="loading">
                      <mat-spinner diameter="40"></mat-spinner>
                    </div>
                  } @else if (meals.length > 0) {
                    <mat-list>
                      @for (meal of meals; track meal.id) {
                        <mat-list-item>
                          <mat-icon matListItemIcon>restaurant</mat-icon>
                          <div matListItemTitle>{{ meal.meal_time | date:'dd/MM/yyyy HH:mm' }}</div>
                          <div matListItemLine>Quantidade: {{ meal.quantity }}g</div>
                          @if (meal.notes) {
                            <div matListItemLine>{{ meal.notes }}</div>
                          }
                        </mat-list-item>
                      }
                    </mat-list>
                  } @else {
                    <p class="no-data">Nenhuma refeição registrada</p>
                  }
                </div>
              </mat-tab>

              <mat-tab label="Lembretes">
                <div class="tab-content">
                  <div class="tab-header">
                    <h3>Lembretes Ativos</h3>
                    <button mat-raised-button color="primary" [routerLink]="['/app/reminders/new']" [queryParams]="{pet_id: pet.id}">
                      <mat-icon>add</mat-icon>
                      Novo Lembrete
                    </button>
                  </div>

                  @if (loadingReminders) {
                    <div class="loading">
                      <mat-spinner diameter="40"></mat-spinner>
                    </div>
                  } @else if (reminders.length > 0) {
                    <mat-list>
                      @for (reminder of reminders; track reminder.id) {
                        <mat-list-item>
                          <mat-icon matListItemIcon [color]="reminder.is_active ? 'primary' : 'warn'">
                            {{ reminder.type === 'feeding' ? 'restaurant' : reminder.type === 'vet' ? 'medical_services' : 'event' }}
                          </mat-icon>
                          <div matListItemTitle>{{ reminder.title }}</div>
                          <div matListItemLine>{{ reminder.reminder_time | date:'dd/MM/yyyy HH:mm' }}</div>
                          @if (reminder.description) {
                            <div matListItemLine>{{ reminder.description }}</div>
                          }
                        </mat-list-item>
                      }
                    </mat-list>
                  } @else {
                    <p class="no-data">Nenhum lembrete configurado</p>
                  }
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="error-message">Pet não encontrado</div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1000px;
      margin: 24px auto;
      padding: 0 16px;
    }

    mat-card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .spacer {
      flex: 1;
    }

    .pet-info {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 32px;
      margin-bottom: 24px;
    }

    .pet-photo {
      width: 300px;
      height: 300px;
      border-radius: 12px;
      overflow: hidden;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pet-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-photo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .no-photo mat-icon {
      font-size: 100px;
      width: 100px;
      height: 100px;
      color: #ccc;
    }

    .pet-details {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: 8px;
      background: #f9f9f9;
    }

    .detail-item mat-icon {
      color: #667eea;
    }

    .detail-item .label {
      font-weight: 500;
      color: #666;
      min-width: 180px;
    }

    .detail-item .value {
      color: #333;
    }

    .tab-content {
      padding: 24px 0;
    }

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .tab-header h3 {
      margin: 0;
      color: #333;
    }

    .no-data {
      text-align: center;
      color: #999;
      padding: 48px;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
    }

    .error-message {
      text-align: center;
      color: #f44336;
      padding: 48px;
      font-size: 18px;
    }

    @media (max-width: 768px) {
      .pet-info {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .pet-photo {
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
      }
    }
  `]
})
export class PetDetailComponent implements OnInit {
  private petService = inject(PetService);
  private mealService = inject(MealService);
  private reminderService = inject(ReminderService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

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
      next: (response) => {
        this.pet = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pet:', error);
        this.loading = false;
      }
    });
  }

  loadMeals(petId: number): void {
    this.loadingMeals = true;
    this.mealService.getAll().subscribe({
      next: (response) => {
        this.meals = response.data.filter(meal => meal.pet_id === petId);
        this.loadingMeals = false;
      },
      error: (error) => {
        console.error('Erro ao carregar refeições:', error);
        this.loadingMeals = false;
      }
    });
  }

  loadReminders(petId: number): void {
    this.loadingReminders = true;
    this.reminderService.getAll().subscribe({
      next: (response) => {
        this.reminders = response.data.filter(reminder => reminder.pet_id === petId);
        this.loadingReminders = false;
      },
      error: (error) => {
        console.error('Erro ao carregar lembretes:', error);
        this.loadingReminders = false;
      }
    });
  }

  getSpeciesLabel(species: string): string {
    const labels: { [key: string]: string } = {
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

  deletePet(): void {
    if (confirm(`Tem certeza que deseja excluir ${this.pet?.name}?`)) {
      if (this.pet?.id) {
        this.petService.delete(this.pet.id).subscribe({
          next: () => {
            this.router.navigate(['/app/pets']);
          },
          error: (error) => {
            console.error('Erro ao deletar pet:', error);
            alert('Erro ao deletar pet. Tente novamente.');
          }
        });
      }
    }
  }
}
