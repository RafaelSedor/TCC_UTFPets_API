import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="welcome-container">
      <div class="welcome-content">
        <h1>Bem-vindo ao UTFPets</h1>
        <p>Gerencie seus pets e refeições de forma colaborativa</p>
        
        <div class="features">
          <div class="feature">
            <mat-icon>pets</mat-icon>
            <h3>Gerenciamento de Pets</h3>
            <p>Cadastre seus pets e mantenha todas as informações organizadas</p>
          </div>
          
          <div class="feature">
            <mat-icon>restaurant</mat-icon>
            <h3>Controle de Refeições</h3>
            <p>Acompanhe a alimentação com registros detalhados</p>
          </div>
          
          <div class="feature">
            <mat-icon>share</mat-icon>
            <h3>Compartilhamento</h3>
            <p>Compartilhe o cuidado dos pets com família e amigos</p>
          </div>
        </div>

        <div class="cta-buttons">
          <a mat-raised-button color="primary" routerLink="/auth/register">
            Começar Agora
          </a>
          <a mat-stroked-button routerLink="/auth/login">
            Já tenho uma conta
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .welcome-content {
      max-width: 1000px;
      text-align: center;
      padding: 48px 24px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }

    h1 {
      font-size: 2.5em;
      margin-bottom: 16px;
      color: #2c3e50;
    }

    .welcome-content > p {
      font-size: 1.2em;
      color: #666;
      margin-bottom: 48px;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 32px;
      margin: 48px 0;
    }

    .feature {
      padding: 24px;
      border-radius: 8px;
      background: #f8f9fa;
      transition: transform 0.2s;
    }

    .feature:hover {
      transform: translateY(-4px);
    }

    .feature mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #3f51b5;
      margin-bottom: 16px;
    }

    .feature h3 {
      margin: 16px 0;
      color: #2c3e50;
    }

    .feature p {
      color: #666;
    }

    .cta-buttons {
      margin-top: 48px;
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    @media (max-width: 600px) {
      .features {
        grid-template-columns: 1fr;
      }

      .cta-buttons {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class WelcomeComponent {}