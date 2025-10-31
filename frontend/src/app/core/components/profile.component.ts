import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Meu Perfil</h1>
      </div>

      @if (loading) {
        <div class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
        </div>
      } @else if (user) {
        <div class="card">
          <!-- Avatar and Basic Info -->
          <div class="flex items-center space-x-6 pb-6 border-b border-gray-200">
            <div class="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {{ getInitials(user.name) }}
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ user.name }}</h2>
              <p class="text-gray-600 mt-1">{{ user.email }}</p>
            </div>
          </div>

          <!-- User Details -->
          <div class="mt-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                <div class="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                  {{ user.name }}
                </div>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div class="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                  {{ user.email }}
                </div>
              </div>

              <!-- Role Badge -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Conta</label>
                <div class="px-4 py-3 bg-gray-50 rounded-lg">
                  @if (user.is_admin) {
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                      <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Administrador
                    </span>
                  } @else {
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Usuário Padrão
                    </span>
                  }
                </div>
              </div>

              <!-- Created At -->
              @if (user.created_at) {
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Membro desde</label>
                  <div class="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {{ user.created_at | date:'dd/MM/yyyy' }}
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Admin Panel Section -->
          @if (user.is_admin) {
            <div class="mt-8 pt-6 border-t border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Painel Administrativo
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Gerenciar Usuários -->
                <a
                  [routerLink]="['/app/admin/users']"
                  class="flex items-start p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-md group"
                >
                  <div class="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h4 class="font-semibold text-gray-900 group-hover:text-purple-700">Gerenciar Usuários</h4>
                    <p class="text-sm text-gray-600 mt-1">Visualizar e gerenciar todos os usuários do sistema</p>
                  </div>
                </a>

                <!-- Visualizar Pets -->
                <a
                  [routerLink]="['/app/admin/pets']"
                  class="flex items-start p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-md group"
                >
                  <div class="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h4 class="font-semibold text-gray-900 group-hover:text-blue-700">Visualizar Pets</h4>
                    <p class="text-sm text-gray-600 mt-1">Acessar todos os pets cadastrados no sistema</p>
                  </div>
                </a>

                <!-- Logs de Auditoria -->
                <a
                  [routerLink]="['/app/admin/audit-logs']"
                  class="flex items-start p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-md group"
                >
                  <div class="flex-shrink-0 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <h4 class="font-semibold text-gray-900 group-hover:text-green-700">Logs de Auditoria</h4>
                    <p class="text-sm text-gray-600 mt-1">Visualizar registros de atividades do sistema</p>
                  </div>
                </a>
              </div>
            </div>
          }

          <!-- Actions -->
          <div class="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              routerLink="/app/pets"
              class="btn-secondary"
            >
              Voltar
            </button>
            <!-- Future: Add Edit Profile button -->
            <!-- <button class="btn-primary">Editar Perfil</button> -->
          </div>
        </div>
      } @else {
        <div class="card text-center py-16">
          <svg class="w-24 h-24 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar perfil</h2>
          <p class="text-gray-600">Não foi possível carregar suas informações</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);

  user: User | null = null;
  loading = true;

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar perfil:', error);
        this.loading = false;
      }
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
