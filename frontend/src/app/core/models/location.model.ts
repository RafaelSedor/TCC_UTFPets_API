export interface Location {
  id: number;
  name: string;
  description?: string;
  address?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SharedLocation extends Location {
  role: 'owner' | 'editor' | 'viewer';
  shared_by: string;
  shared_at: string;
}

export interface LocationFormData {
  name: string;
  description?: string;
  address?: string;
  photo?: File;
}

export interface LocationResponse {
  data: Location;
  message: string;
}

export interface LocationListResponse {
  data: Location[];
  message: string;
}