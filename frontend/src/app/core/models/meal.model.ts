export interface Meal {
  id: number;
  pet_id: number;
  food_type: string;
  quantity: number;
  unit: string;
  scheduled_for: string;
  consumed_at?: string;
  notes?: string;
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
  food_type: string;
  quantity: number;
  unit: string;
  scheduled_for: string;
  notes?: string;
}
