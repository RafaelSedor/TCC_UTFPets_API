import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Location } from '../../../core/models/pet.model';

export interface LocationFormData {
  name: string;
  description?: string;
}

export interface SharedLocationData {
  email: string;
  role: 'editor' | 'viewer';
}

export interface SharedLocationAccess {
  id: number;
  location_id: number;
  user_id: number;
  role: 'owner' | 'editor' | 'viewer';
  invitation_status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  location: {
    id: number;
    name: string;
    description?: string;
  };
  shared_with_user?: {
    id: number;
    name: string;
    email: string;
  };
  owner?: {
    id: number;
    name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/locations`;

  getAll(): Observable<Location[]> {
    return this.http.get<Location[]>(this.apiUrl);
  }

  getById(id: string): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/${id}`);
  }

  create(data: LocationFormData): Observable<Location> {
    return this.http.post<Location>(this.apiUrl, data);
  }

  update(id: string, data: Partial<LocationFormData>): Observable<Location> {
    return this.http.put<Location>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Shared location methods
  shareLocation(locationId: number, data: SharedLocationData): Observable<SharedLocationAccess> {
    return this.http.post<SharedLocationAccess>(`${this.apiUrl}/${locationId}/share`, data);
  }

  getSharedLocationsByMe(locationId: number): Observable<SharedLocationAccess[]> {
    return this.http.get<SharedLocationAccess[]>(`${this.apiUrl}/${locationId}/share`);
  }

  getAllSharedLocationsByMe(): Observable<SharedLocationAccess[]> {
    return this.http.get<SharedLocationAccess[]>(`${environment.apiUrl}/shared-locations/by-me`);
  }

  getSharedLocationsWithMe(): Observable<SharedLocationAccess[]> {
    return this.http.get<SharedLocationAccess[]>(`${environment.apiUrl}/shared-locations/with-me`);
  }

  updateLocationPermission(locationId: number, userId: number, data: { role: string }): Observable<SharedLocationAccess> {
    return this.http.patch<SharedLocationAccess>(`${this.apiUrl}/${locationId}/share/${userId}`, data);
  }

  revokeLocationAccess(locationId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${locationId}/share/${userId}`);
  }

  acceptLocationInvitation(locationId: number, userId: number): Observable<SharedLocationAccess> {
    return this.http.post<SharedLocationAccess>(`${this.apiUrl}/${locationId}/share/${userId}/accept`, {});
  }
}
