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
  getAll(): Observable<Meal[]> {
    return this.http.get<Meal[]>(`${this.apiUrl}/meals`);
  }

  getMealsByPet(petId: number): Observable<Meal[]> {
    return this.http.get<Meal[]>(`${this.apiUrl}/pets/${petId}/meals`);
  }

  getById(petId: number, mealId: number): Observable<Meal> {
    return this.http.get<Meal>(`${this.apiUrl}/pets/${petId}/meals/${mealId}`);
  }

  create(data: MealFormData): Observable<Meal> {
    const petId = data.pet_id;
    const formData = this.toFormData(data);
    return this.http.post<Meal>(`${this.apiUrl}/pets/${petId}/meals`, formData);
  }

  update(mealId: number, data: Partial<MealFormData>): Observable<Meal> {
    const petId = data.pet_id!;
    const formData = this.toFormData(data);
    return this.http.put<Meal>(`${this.apiUrl}/pets/${petId}/meals/${mealId}`, formData);
  }

  delete(petId: number, mealId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pets/${petId}/meals/${mealId}`);
  }

  markAsConsumed(petId: number, mealId: number): Observable<Meal> {
    return this.http.post<Meal>(`${this.apiUrl}/pets/${petId}/meals/${mealId}/consume`, {});
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
