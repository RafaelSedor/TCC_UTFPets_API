export interface Pet {
  id: number;
  user_id: number;
  location_id: string | null;  // UUID - references Location
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'other';
  breed?: string;
  birth_date?: string;
  weight?: number;
  photo_url?: string;
  dietary_restrictions?: string;
  feeding_schedule?: string;
  created_at: string;
  updated_at: string;
  location?: Location;
}

export interface Location {
  id: string;  // UUID
  user_id: number;
  name: string;
  address?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  pets_count?: number;
}

export interface PetFormData {
  name: string;
  species: string;
  breed?: string;
  birth_date?: string;
  weight?: number;
  photo?: File;
  dietary_restrictions?: string;
  feeding_schedule?: string;
  location_id: string | null;  // UUID - references Location
}
