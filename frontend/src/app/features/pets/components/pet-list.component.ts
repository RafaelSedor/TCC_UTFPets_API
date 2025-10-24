import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PetService } from '../services/pet.service';
import { Pet } from '../../../core/models/pet.model';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Meus Pets</h1>
        <button mat-raised-button color="primary" routerLink="/app/pets/new">
          <mat-icon>add</mat-icon>
          Adicionar Pet
        </button>
      </div>

      @if (loading) {
        <div class="loading">
          <mat-spinner></mat-spinner>
          <p>Carregando pets...</p>
        </div>
      } @else if (pets.length === 0) {
        <mat-card class="empty-state">
          <mat-card-content>
            <mat-icon class="large-icon">pets</mat-icon>
            <h2>Nenhum pet cadastrado</h2>
            <p>Adicione seu primeiro pet para começar!</p>
            <button mat-raised-button color="primary" routerLink="/app/pets/new">
              <mat-icon>add</mat-icon>
              Adicionar Primeiro Pet
            </button>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="pet-grid">
          @for (pet of pets; track pet.id) {
            <mat-card class="pet-card" [routerLink]="['/app/pets', pet.id]">
              <img mat-card-image [src]="pet.photo_url || 'assets/default-pet.png'"
                   [alt]="pet.name">
              <mat-card-header>
                <mat-card-title>{{ pet.name }}</mat-card-title>
                <mat-card-subtitle>{{ getSpeciesLabel(pet.species) }}@if (pet.breed) { - {{ pet.breed }} }</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                @if (pet.weight) {
                  <p><mat-icon>monitor_weight</mat-icon> {{ pet.weight }}kg</p>
                }
                @if (pet.location) {
                  <p><mat-icon>place</mat-icon> {{ pet.location.name }}</p>
                }
              </mat-card-content>
              <mat-card-actions>
                <button mat-button color="primary" [routerLink]="['/app/pets', pet.id]" (click)="$event.stopPropagation()">
                  <mat-icon>visibility</mat-icon>
                  Ver Detalhes
                </button>
                <button mat-button [routerLink]="['/app/pets/edit', pet.id]" (click)="$event.stopPropagation()">
                  <mat-icon>edit</mat-icon>
                  Editar
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .pet-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .pet-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .pet-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .pet-card img {
      height: 200px;
      object-fit: cover;
    }

    .pet-card mat-card-content p {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      color: #666;
    }

    .pet-card mat-card-content mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #667eea;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
    }

    .empty-state mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .large-icon {
      font-size: 72px;
      height: 72px;
      width: 72px;
      color: #999;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
    }

    .loading p {
      margin-top: 16px;
      color: #666;
    }
  `]
})
export class PetListComponent implements OnInit {
  petService = inject(PetService);

  pets: Pet[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadPets();
  }

  loadPets(): void {
    this.petService.getAll().subscribe({
      next: (response) => {
        this.pets = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pets:', error);
        this.pets = [];
        this.loading = false;
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
}
