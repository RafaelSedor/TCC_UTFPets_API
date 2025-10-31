import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';
import { Pet } from '../../../core/models/pet.model';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface AuditLog {
  id: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  action: string;
  auditable_type: string;
  auditable_id: number;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  // ========================================
  // Users Management
  // ========================================

  getUsers(page: number = 1, perPage: number = 20, search?: string, isAdmin?: boolean): Observable<PaginatedResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (isAdmin !== undefined) {
      params = params.set('is_admin', isAdmin ? '1' : '0');
    }

    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/users`, { params });
  }

  updateUserAdminStatus(userId: number, isAdmin: boolean): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, { is_admin: isAdmin });
  }

  // ========================================
  // Pets Management
  // ========================================

  getPets(page: number = 1, perPage: number = 20, search?: string, userId?: number): Observable<PaginatedResponse<Pet>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (userId) {
      params = params.set('user_id', userId.toString());
    }

    return this.http.get<PaginatedResponse<Pet>>(`${this.apiUrl}/pets`, { params });
  }

  // ========================================
  // Audit Logs
  // ========================================

  getAuditLogs(
    page: number = 1,
    perPage: number = 20,
    userId?: number,
    action?: string,
    auditableType?: string,
    startDate?: string,
    endDate?: string
  ): Observable<PaginatedResponse<AuditLog>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (userId) {
      params = params.set('user_id', userId.toString());
    }

    if (action) {
      params = params.set('action', action);
    }

    if (auditableType) {
      params = params.set('auditable_type', auditableType);
    }

    if (startDate) {
      params = params.set('start_date', startDate);
    }

    if (endDate) {
      params = params.set('end_date', endDate);
    }

    return this.http.get<PaginatedResponse<AuditLog>>(`${this.apiUrl}/audit-logs`, { params });
  }
}
