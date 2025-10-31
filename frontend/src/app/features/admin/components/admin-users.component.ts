import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, PaginatedResponse } from '../services/admin.service';
import { User } from '../../../core/models/user.model';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
            <p class="text-gray-600 mt-1">Visualize e gerencie todos os usuários do sistema</p>
          </div>
          <button
            routerLink="/app/profile"
            class="btn-secondary"
          >
            Voltar ao Perfil
          </button>
        </div>
      </div>

      @if (loading) {
        <div class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
        </div>
      } @else {
        @if (users.length > 0) {
          <div class="card overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Membro desde
                    </th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (user of users; track user.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {{ getInitials(user.name) }}
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                            <div class="text-sm text-gray-500">ID: {{ user.id }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ user.email }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        @if (user.is_admin) {
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Admin
                          </span>
                        } @else {
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Usuário
                          </span>
                        }
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ user.created_at | date:'dd/MM/yyyy' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          (click)="toggleAdminStatus(user)"
                          [disabled]="updatingUserId === user.id"
                          class="text-primary-600 hover:text-primary-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          @if (updatingUserId === user.id) {
                            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          } @else {
                            {{ user.is_admin ? 'Remover Admin' : 'Tornar Admin' }}
                          }
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            @if (pagination && pagination.last_page > 1) {
              <div class="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-700">
                    Mostrando
                    <span class="font-medium">{{ (pagination.current_page - 1) * pagination.per_page + 1 }}</span>
                    até
                    <span class="font-medium">{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span>
                    de
                    <span class="font-medium">{{ pagination.total }}</span>
                    resultados
                  </div>
                  <div class="flex space-x-2">
                    <button
                      (click)="goToPage(pagination.current_page - 1)"
                      [disabled]="pagination.current_page === 1"
                      class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      (click)="goToPage(pagination.current_page + 1)"
                      [disabled]="pagination.current_page === pagination.last_page"
                      class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="card text-center py-16">
            <svg class="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Nenhum usuário encontrado</h2>
            <p class="text-gray-600">Tente ajustar os filtros de busca</p>
          </div>
        }
      }
    </div>
  `,
  styles: []
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private modalService = inject(ModalService);

  users: User[] = [];
  loading = true;
  currentPage = 1;
  updatingUserId: number | null = null;
  pagination: any = null;
  Math = Math;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers(this.currentPage, 20).subscribe({
      next: (response) => {
        this.users = response.data;
        this.pagination = response.meta;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.loading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.pagination.last_page) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  async toggleAdminStatus(user: User): Promise<void> {
    const action = user.is_admin ? 'remover permissão de admin' : 'tornar admin';
    const confirmed = await this.modalService.confirm(
      `Tem certeza que deseja ${action} para ${user.name}?`,
      'Alterar Permissões',
      'Confirmar',
      'Cancelar'
    );

    if (confirmed) {
      this.updatingUserId = user.id;
      this.adminService.updateUserAdminStatus(user.id, !user.is_admin).subscribe({
        next: (updatedUser) => {
          user.is_admin = updatedUser.is_admin;
          this.updatingUserId = null;
          this.modalService.success(`Permissões de ${user.name} atualizadas com sucesso!`);
        },
        error: (error) => {
          console.error('Erro ao atualizar status de admin:', error);
          this.modalService.showBackendError(error, 'Erro ao atualizar permissões do usuário. Tente novamente.');
          this.updatingUserId = null;
        }
      });
    }
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
