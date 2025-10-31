import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AuditLog } from '../services/admin.service';

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Logs de Auditoria</h1>
            <p class="text-gray-600 mt-1">Registros de atividades do sistema</p>
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
        @if (logs.length > 0) {
          <div class="space-y-4">
            @for (log of logs; track log.id) {
              <div class="card hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between">
                  <!-- Log Info -->
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                      <!-- Action Badge -->
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-green-100 text-green-800': log.action === 'created',
                          'bg-blue-100 text-blue-800': log.action === 'updated',
                          'bg-red-100 text-red-800': log.action === 'deleted'
                        }"
                      >
                        {{ getActionLabel(log.action) }}
                      </span>

                      <!-- Type -->
                      <span class="text-sm text-gray-600">
                        {{ getTypeLabel(log.auditable_type) }} #{{ log.auditable_id }}
                      </span>

                      <!-- Timestamp -->
                      <span class="text-sm text-gray-500">
                        {{ log.created_at | date:'dd/MM/yyyy HH:mm' }}
                      </span>
                    </div>

                    <!-- User -->
                    <div class="flex items-center space-x-2 mb-3">
                      <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {{ getInitials(log.user.name) }}
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ log.user.name }}</p>
                        <p class="text-xs text-gray-500">{{ log.user.email }}</p>
                      </div>
                    </div>

                    <!-- Details Toggle -->
                    @if (log.old_values || log.new_values) {
                      <button
                        (click)="toggleDetails(log.id)"
                        class="text-sm text-primary-600 hover:text-primary-800 font-medium"
                      >
                        {{ expandedLogs.has(log.id) ? 'Ocultar detalhes' : 'Ver detalhes' }}
                      </button>
                    }

                    <!-- Expanded Details -->
                    @if (expandedLogs.has(log.id)) {
                      <div class="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                        @if (log.old_values) {
                          <div>
                            <p class="text-sm font-medium text-gray-700 mb-2">Valores Anteriores:</p>
                            <pre class="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto">{{ log.old_values | json }}</pre>
                          </div>
                        }
                        @if (log.new_values) {
                          <div>
                            <p class="text-sm font-medium text-gray-700 mb-2">Valores Novos:</p>
                            <pre class="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto">{{ log.new_values | json }}</pre>
                          </div>
                        }
                      </div>

                      <!-- IP and User Agent -->
                      <div class="mt-3 text-xs text-gray-500">
                        <p><strong>IP:</strong> {{ log.ip_address }}</p>
                        <p><strong>User Agent:</strong> {{ log.user_agent }}</p>
                      </div>
                    }
                  </div>

                  <!-- Log ID -->
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    #{{ log.id }}
                  </span>
                </div>
              </div>
            }

            <!-- Pagination -->
            @if (pagination && pagination.last_page > 1) {
              <div class="card">
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Nenhum log encontrado</h2>
            <p class="text-gray-600">Tente ajustar os filtros de busca</p>
          </div>
        }
      }
    </div>
  `,
  styles: []
})
export class AdminAuditLogsComponent implements OnInit {
  private adminService = inject(AdminService);

  logs: AuditLog[] = [];
  loading = true;
  currentPage = 1;
  pagination: any = null;
  expandedLogs = new Set<number>();
  Math = Math;

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    this.adminService.getAuditLogs(
      this.currentPage,
      20
    ).subscribe({
      next: (response) => {
        this.logs = response.data;
        this.pagination = response.meta;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar logs:', error);
        this.loading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.pagination.last_page) {
      this.currentPage = page;
      this.loadLogs();
    }
  }

  toggleDetails(logId: number): void {
    if (this.expandedLogs.has(logId)) {
      this.expandedLogs.delete(logId);
    } else {
      this.expandedLogs.add(logId);
    }
  }

  getActionLabel(action: string): string {
    const labels: { [key: string]: string } = {
      created: 'Criado',
      updated: 'Atualizado',
      deleted: 'Excluído'
    };
    return labels[action] || action;
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'App\\Models\\Pet': 'Pet',
      'App\\Models\\Meal': 'Refeição',
      'App\\Models\\Reminder': 'Lembrete',
      'App\\Models\\User': 'Usuário',
      'App\\Models\\Location': 'Location'
    };
    return labels[type] || type;
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
