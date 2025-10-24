import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Pet, PetFormData } from '../../../core/models/pet.model';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/pets`;

  getAll(): Observable<{ data: Pet[] }> {
    return this.http.get<{ data: Pet[] }>(this.apiUrl);
  }

  getById(id: number): Observable<{ data: Pet }> {
    return this.http.get<{ data: Pet }>(`${this.apiUrl}/${id}`);
  }

  create(data: PetFormData): Observable<{ data: Pet }> {
    const formData = this.toFormData(data);
    return this.http.post<{ data: Pet }>(this.apiUrl, formData);
  }

  update(id: number, data: Partial<PetFormData>): Observable<{ data: Pet }> {
    const formData = this.toFormData(data);
    // Laravel method spoofing para PUT via FormData
    formData.append('_method', 'PUT');
    return this.http.post<{ data: Pet }>(`${this.apiUrl}/${id}`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadPhoto(petId: number, photo: File): Observable<{ data: Pet }> {
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('_method', 'PUT');
    return this.http.post<{ data: Pet }>(`${this.apiUrl}/${petId}`, formData);
  }

  private toFormData(data: Partial<PetFormData>): FormData {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        if (key === 'photo' && value instanceof File) {
          formData.append('photo', value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return formData;
  }
}
