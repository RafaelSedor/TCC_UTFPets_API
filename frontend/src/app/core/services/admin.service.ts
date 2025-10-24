import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  resource_type: string;
  resource_id: number;
  changes: any;
  created_at: string;
}

interface AuditLogResponse {
  data: AuditLog[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/api/v1/admin`;

  constructor(private http: HttpClient) {}

  // Obter logs de auditoria paginados
  getAuditLogs(page: number = 1): Observable<AuditLogResponse> {
    return this.http.get<AuditLogResponse>(`${this.apiUrl}/audit-logs`, {
      params: { page: page.toString() }
    });
  }

  // Obter estatísticas do sistema
  getStats(): Observable<{
    total_users: number;
    total_pets: number;
    total_meals: number;
    active_reminders: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  // Bloquear/desbloquear usuário
  toggleUserStatus(userId: number, active: boolean): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${userId}/status`, { active });
  }

  // Limpar logs antigos
  clearOldLogs(daysToKeep: number = 30): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/audit-logs/clear`, {
      params: { days_to_keep: daysToKeep.toString() }
    });
  }
}