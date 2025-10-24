export interface Meal {
  id: number;
  pet_id: number;
  meal_time: string;
  quantity: number;
  notes?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  pet?: {
    id: number;
    name: string;
    species: string;
  };
}

export interface MealFormData {
  pet_id: number;
  meal_time: string;
  quantity: number;
  notes?: string;
  photo?: File;
}
