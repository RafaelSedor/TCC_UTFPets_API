import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SharedPetAccess, SharePetRequest } from '../../../core/models/shared.model';

@Injectable({
  providedIn: 'root'
})
export class SharingService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ========================================
  // Pet Sharing - Simplified for the component
  // ========================================

  // Get all pets shared BY the current user
  getSharedByMe(): Observable<{ data: SharedPetAccess[] }> {
    // This would need a backend endpoint that returns all shared access created by the user
    return this.http.get<{ data: SharedPetAccess[] }>(`${this.apiUrl}/v1/shared-pets/by-me`);
  }

  // Get all pets shared WITH the current user
  getSharedWithMe(): Observable<{ data: SharedPetAccess[] }> {
    // This would need a backend endpoint that returns all pets shared with the user
    return this.http.get<{ data: SharedPetAccess[] }>(`${this.apiUrl}/v1/shared-pets/with-me`);
  }

  // Share a pet with another user
  shareAccess(data: SharePetRequest): Observable<{ data: SharedPetAccess }> {
    return this.http.post<{ data: SharedPetAccess }>(`${this.apiUrl}/v1/pets/${data.pet_id}/share`, {
      email: data.user_email,
      role: data.permission_level === 'write' ? 'editor' : 'viewer'
    });
  }

  // Update permission level
  updatePermission(accessId: number, data: { permission_level: string }): Observable<{ data: SharedPetAccess }> {
    // This needs to extract petId and userId from the access somehow
    // For now, using a simplified endpoint
    return this.http.patch<{ data: SharedPetAccess }>(`${this.apiUrl}/v1/shared-pets/${accessId}`, {
      role: data.permission_level === 'write' ? 'editor' : 'viewer'
    });
  }

  // Revoke access
  revokeAccess(accessId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/v1/shared-pets/${accessId}`);
  }

  // ========================================
  // Original methods for individual pet sharing
  // ========================================

  getSharedPets(petId: number): Observable<{ data: SharedPetAccess[] }> {
    return this.http.get<{ data: SharedPetAccess[] }>(`${this.apiUrl}/v1/pets/${petId}/share`);
  }

  sharePet(petId: number, email: string, role: 'editor' | 'viewer'): Observable<{ data: SharedPetAccess }> {
    return this.http.post<{ data: SharedPetAccess }>(`${this.apiUrl}/v1/pets/${petId}/share`, { email, role });
  }

  acceptPetShare(petId: number, userId: number): Observable<{ data: SharedPetAccess }> {
    return this.http.post<{ data: SharedPetAccess }>(`${this.apiUrl}/v1/pets/${petId}/share/${userId}/accept`, {});
  }

  updatePetRole(petId: number, userId: number, role: 'editor' | 'viewer'): Observable<{ data: SharedPetAccess }> {
    return this.http.patch<{ data: SharedPetAccess }>(`${this.apiUrl}/v1/pets/${petId}/share/${userId}`, { role });
  }

  revokePetAccess(petId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/v1/pets/${petId}/share/${userId}`);
  }
}
