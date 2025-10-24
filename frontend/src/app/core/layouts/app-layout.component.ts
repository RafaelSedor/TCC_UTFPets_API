import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <aside
        class="bg-gradient-to-b from-primary-600 to-primary-800 text-white transition-all duration-300 ease-in-out"
        [class.w-64]="!isSidebarCollapsed()"
        [class.w-20]="isSidebarCollapsed()"
      >
        <!-- Logo Header -->
        <div class="h-16 flex items-center px-4 border-b border-primary-500">
          @if (!isSidebarCollapsed()) {
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-xl font-bold">UTFPets</span>
            </div>
          } @else {
            <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          }
        </div>

        <!-- Navigation Links -->
        <nav class="mt-6 px-3">
          <a
            routerLink="/app/pets"
            routerLinkActive="bg-white bg-opacity-20 shadow-lg"
            class="flex items-center px-3 py-3 mb-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200 group"
            [class.justify-center]="isSidebarCollapsed()"
          >
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            @if (!isSidebarCollapsed()) {
              <span class="ml-3 font-medium">Meus Pets</span>
            }
          </a>

          <a
            routerLink="/app/meals"
            routerLinkActive="bg-white bg-opacity-20 shadow-lg"
            class="flex items-center px-3 py-3 mb-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200 group"
            [class.justify-center]="isSidebarCollapsed()"
          >
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            @if (!isSidebarCollapsed()) {
              <span class="ml-3 font-medium">Refeições</span>
            }
          </a>

          <a
            routerLink="/app/reminders"
            routerLinkActive="bg-white bg-opacity-20 shadow-lg"
            class="flex items-center px-3 py-3 mb-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200 group"
            [class.justify-center]="isSidebarCollapsed()"
          >
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            @if (!isSidebarCollapsed()) {
              <span class="ml-3 font-medium">Lembretes</span>
            }
          </a>

          <a
            routerLink="/app/locations"
            routerLinkActive="bg-white bg-opacity-20 shadow-lg"
            class="flex items-center px-3 py-3 mb-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200 group"
            [class.justify-center]="isSidebarCollapsed()"
          >
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            @if (!isSidebarCollapsed()) {
              <span class="ml-3 font-medium">Locais</span>
            }
          </a>

          <a
            routerLink="/app/sharing"
            routerLinkActive="bg-white bg-opacity-20 shadow-lg"
            class="flex items-center px-3 py-3 mb-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200 group"
            [class.justify-center]="isSidebarCollapsed()"
          >
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            @if (!isSidebarCollapsed()) {
              <span class="ml-3 font-medium">Compartilhamento</span>
            }
          </a>
        </nav>

        <!-- Logout Button at Bottom -->
        <div class="absolute bottom-4 left-0 right-0 px-3">
          <button
            (click)="logout()"
            class="w-full flex items-center px-3 py-3 rounded-lg hover:bg-red-600 hover:bg-opacity-80 transition-all duration-200 group"
            [class.justify-center]="isSidebarCollapsed()"
          >
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            @if (!isSidebarCollapsed()) {
              <span class="ml-3 font-medium">Sair</span>
            }
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Header -->
        <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
          <button
            (click)="toggleSidebar()"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div class="flex items-center space-x-4">
            <!-- User Profile -->
            <div class="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold">
                U
              </div>
              <div class="hidden md:block">
                <p class="text-sm font-medium text-gray-700">Usuário</p>
                <p class="text-xs text-gray-500">Ver perfil</p>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto bg-gray-50 p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class AppLayoutComponent {
  private authService = inject(AuthService);
  isSidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(value => !value);
  }

  logout(): void {
    this.authService.logout();
  }
}