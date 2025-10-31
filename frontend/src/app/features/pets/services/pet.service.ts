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
  private apiUrl = `${environment.apiUrl}/pets`;

  getAll(): Observable<Pet[]> {
    return this.http.get<Pet[]>(this.apiUrl);
  }

  getById(id: number): Observable<Pet> {
    return this.http.get<Pet>(`${this.apiUrl}/${id}`);
  }

  create(data: PetFormData): Observable<Pet> {
    const formData = this.toFormData(data);
    return this.http.post<Pet>(this.apiUrl, formData);
  }

  update(id: number, data: Partial<PetFormData>): Observable<Pet> {
    const formData = this.toFormData(data);
    // Laravel method spoofing para PUT via FormData
    formData.append('_method', 'PUT');
    return this.http.post<Pet>(`${this.apiUrl}/${id}`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadPhoto(petId: number, photo: File): Observable<Pet> {
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('_method', 'PUT');
    return this.http.post<Pet>(`${this.apiUrl}/${petId}`, formData);
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
