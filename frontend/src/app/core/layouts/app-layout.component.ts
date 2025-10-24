import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" fixedInViewport
          [mode]="'side'"
          [opened]="true">
        <mat-toolbar>UTFPets</mat-toolbar>
        <mat-nav-list>
          <a mat-list-item routerLink="/app/pets" routerLinkActive="active">
            <mat-icon matListItemIcon>pets</mat-icon>
            <span matListItemTitle>Meus Pets</span>
          </a>
          <a mat-list-item routerLink="/app/meals" routerLinkActive="active">
            <mat-icon matListItemIcon>restaurant</mat-icon>
            <span matListItemTitle>Refeições</span>
          </a>
          <a mat-list-item routerLink="/app/reminders" routerLinkActive="active">
            <mat-icon matListItemIcon>notifications</mat-icon>
            <span matListItemTitle>Lembretes</span>
          </a>
          <a mat-list-item routerLink="/app/locations" routerLinkActive="active">
            <mat-icon matListItemIcon>location_on</mat-icon>
            <span matListItemTitle>Locais</span>
          </a>
          <a mat-list-item routerLink="/app/sharing" routerLinkActive="active">
            <mat-icon matListItemIcon>share</mat-icon>
            <span matListItemTitle>Compartilhamento</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="drawer.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-spacer"></span>
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Sair</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 250px;
    }

    .sidenav .mat-toolbar {
      background: inherit;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .content {
      padding: 24px;
    }

    .active {
      background: rgba(0,0,0,0.04);
    }
  `]
})
export class AppLayoutComponent {
  private authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}