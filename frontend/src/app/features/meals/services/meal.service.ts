import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Meal, MealFormData } from '../../../core/models/meal.model';

@Injectable({
  providedIn: 'root'
})
export class MealService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Helper method to get all meals from all user's pets
  getAll(): Observable<{ data: Meal[] }> {
    // This would need a backend endpoint that returns all meals for the authenticated user
    // For now, we'll return an empty array - you'll need to implement this properly
    // Option 1: Create a new endpoint GET /v1/meals that returns all meals for the user
    // Option 2: Fetch all pets first, then fetch meals for each pet
    return this.http.get<{ data: Meal[] }>(`${this.apiUrl}/v1/meals`);
  }

  getMealsByPet(petId: number): Observable<{ data: Meal[] }> {
    return this.http.get<{ data: Meal[] }>(`${this.apiUrl}/v1/pets/${petId}/meals`);
  }

  getById(petId: number, mealId: number): Observable<{ data: Meal }> {
    return this.http.get<{ data: Meal }>(`${this.apiUrl}/v1/pets/${petId}/meals/${mealId}`);
  }

  create(data: MealFormData): Observable<{ data: Meal }> {
    const petId = data.pet_id;
    const formData = this.toFormData(data);
    return this.http.post<{ data: Meal }>(`${this.apiUrl}/v1/pets/${petId}/meals`, formData);
  }

  update(mealId: number, data: Partial<MealFormData>): Observable<{ data: Meal }> {
    const petId = data.pet_id!;
    const formData = this.toFormData(data);
    return this.http.put<{ data: Meal }>(`${this.apiUrl}/v1/pets/${petId}/meals/${mealId}`, formData);
  }

  delete(petId: number, mealId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/v1/pets/${petId}/meals/${mealId}`);
  }

  markAsConsumed(petId: number, mealId: number): Observable<{ data: Meal }> {
    return this.http.post<{ data: Meal }>(`${this.apiUrl}/v1/pets/${petId}/meals/${mealId}/consume`, {});
  }

  private toFormData(data: Partial<MealFormData>): FormData {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null && key !== 'pet_id') {
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
