import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MealService } from '../services/meal.service';
import { Meal } from '../../../core/models/meal.model';

@Component({
  selector: 'app-meal-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Histórico de Refeições</h1>
        <button mat-raised-button color="primary" routerLink="/app/meals/new">
          <mat-icon>add</mat-icon>
          Nova Refeição
        </button>
      </div>
      @if (loading) {
        <div class="loading">
          <mat-spinner></mat-spinner>
          <p>Carregando refeições...</p>
        </div>
      } @else if (meals.length > 0) {
        <div class="meals-grid">
          @for (meal of meals; track meal.id) {
            <mat-card class="meal-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>restaurant</mat-icon>
                <mat-card-title>{{ meal.pet?.name || 'Pet desconhecido' }}</mat-card-title>
                <mat-card-subtitle>{{ meal.meal_time | date:'dd/MM/yyyy HH:mm' }}</mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <div class="meal-info">
                  <div class="info-item">
                    <mat-icon>scale</mat-icon>
                    <span>{{ meal.quantity }}g</span>
                  </div>

                  @if (meal.notes) {
                    <div class="info-item notes">
                      <mat-icon>notes</mat-icon>
                      <span>{{ meal.notes }}</span>
                    </div>
                  }

                  @if (meal.photo_url) {
                    <div class="meal-photo">
                      <img [src]="meal.photo_url" [alt]="'Refeição de ' + (meal.pet?.name || 'pet')">
                    </div>
                  }
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-icon-button color="primary" [routerLink]="['/app/meals/edit', meal.id]">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteMeal(meal)">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      } @else {
        <div class="empty-state">
          <mat-icon>restaurant_menu</mat-icon>
          <h2>Nenhuma refeição registrada</h2>
          <p>Comece registrando a primeira refeição do seu pet</p>
          <button mat-raised-button color="primary" routerLink="/app/meals/new">
            <mat-icon>add</mat-icon>
            Registrar Refeição
          </button>
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

    .meals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .meal-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .meal-card mat-card-header {
      margin-bottom: 16px;
    }

    .meal-card mat-card-content {
      flex: 1;
    }

    .meal-info {
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

    .info-item.notes {
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .meal-photo {
      margin-top: 12px;
      border-radius: 8px;
      overflow: hidden;
      max-height: 200px;
    }

    .meal-photo img {
      width: 100%;
      height: auto;
      display: block;
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
      margin: 0 0 24px 0;
      color: #666;
    }
  `]
})
export class MealListComponent implements OnInit {
  private mealService = inject(MealService);
  private router = inject(Router);

  meals: Meal[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadMeals();
  }

  loadMeals(): void {
    this.loading = true;
    this.mealService.getAll().subscribe({
      next: (response) => {
        this.meals = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar refeições:', error);
        this.loading = false;
      }
    });
  }

  deleteMeal(meal: Meal): void {
    const petName = meal.pet?.name || 'este pet';
    if (confirm(`Tem certeza que deseja excluir esta refeição de ${petName}?`)) {
      this.mealService.delete(meal.pet_id, meal.id).subscribe({
        next: () => {
          this.meals = this.meals.filter(m => m.id !== meal.id);
        },
        error: (error) => {
          console.error('Erro ao deletar refeição:', error);
          alert('Erro ao deletar refeição. Tente novamente.');
        }
      });
    }
  }
}
