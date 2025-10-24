import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Location } from '../../../core/models/pet.model';

export interface LocationFormData {
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/locations`;

  getAll(): Observable<{ data: Location[] }> {
    return this.http.get<{ data: Location[] }>(this.apiUrl);
  }

  getById(id: number): Observable<{ data: Location }> {
    return this.http.get<{ data: Location }>(`${this.apiUrl}/${id}`);
  }

  create(data: LocationFormData): Observable<{ data: Location }> {
    return this.http.post<{ data: Location }>(this.apiUrl, data);
  }

  update(id: number, data: Partial<LocationFormData>): Observable<{ data: Location }> {
    return this.http.put<{ data: Location }>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
