export interface Location {
  id: number;
  name: string;
  address?: string;
  created_at: string;
  updated_at: string;
  pets_count?: number;
}

export interface SharedLocation {
  id: number;
  location_id: number;
  shared_with_user_id: number;
  role: 'owner' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  location?: Location;
  shared_with?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface SharedPetAccess {
  id: number;
  pet_id: number;
  shared_with_user_id: number;
  permission_level: 'read' | 'write';
  created_at: string;
  updated_at: string;
  pet: {
    id: number;
    name: string;
    species: string;
    photo_url?: string;
    owner?: {
      id: number;
      name: string;
      email: string;
    };
  };
  shared_with_user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface SharePetRequest {
  pet_id: number;
  user_email: string;
  permission_level: 'read' | 'write';
}
