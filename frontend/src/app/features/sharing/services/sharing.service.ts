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
  getSharedByMe(): Observable<SharedPetAccess[]> {
    // This would need a backend endpoint that returns all shared access created by the user
    return this.http.get<SharedPetAccess[]>(`${this.apiUrl}/shared-pets/by-me`);
  }

  // Get all pets shared WITH the current user
  getSharedWithMe(): Observable<SharedPetAccess[]> {
    // This would need a backend endpoint that returns all pets shared with the user
    return this.http.get<SharedPetAccess[]>(`${this.apiUrl}/shared-pets/with-me`);
  }

  // Share a pet with another user
  shareAccess(data: SharePetRequest): Observable<SharedPetAccess> {
    return this.http.post<SharedPetAccess>(`${this.apiUrl}/pets/${data.pet_id}/share`, {
      email: data.user_email,
      role: data.permission_level === 'write' ? 'editor' : 'viewer'
    });
  }

  // Update permission level
  updatePermission(petId: number, userId: number, data: { permission_level: string }): Observable<SharedPetAccess> {
    // Use the correct nested route format
    return this.http.patch<SharedPetAccess>(`${this.apiUrl}/pets/${petId}/share/${userId}`, {
      role: data.permission_level === 'write' ? 'editor' : 'viewer'
    });
  }

  // Revoke access
  revokeAccess(petId: number, userId: number): Observable<void> {
    // Use the correct nested route format
    return this.http.delete<void>(`${this.apiUrl}/pets/${petId}/share/${userId}`);
  }

  // ========================================
  // Original methods for individual pet sharing
  // ========================================

  getSharedPets(petId: number): Observable<SharedPetAccess[]> {
    return this.http.get<SharedPetAccess[]>(`${this.apiUrl}/pets/${petId}/share`);
  }

  sharePet(petId: number, email: string, role: 'editor' | 'viewer'): Observable<SharedPetAccess> {
    return this.http.post<SharedPetAccess>(`${this.apiUrl}/pets/${petId}/share`, { email, role });
  }

  acceptPetShare(petId: number, userId: number): Observable<SharedPetAccess> {
    return this.http.post<SharedPetAccess>(`${this.apiUrl}/pets/${petId}/share/${userId}/accept`, {});
  }

  updatePetRole(petId: number, userId: number, role: 'editor' | 'viewer'): Observable<SharedPetAccess> {
    return this.http.patch<SharedPetAccess>(`${this.apiUrl}/pets/${petId}/share/${userId}`, { role });
  }

  revokePetAccess(petId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pets/${petId}/share/${userId}`);
  }
}
