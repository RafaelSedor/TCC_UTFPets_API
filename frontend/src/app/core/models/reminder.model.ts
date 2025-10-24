export interface Reminder {
  id: number;
  pet_id: number;
  title: string;
  description?: string;
  reminder_time: string;
  type: 'feeding' | 'vet' | 'medication' | 'grooming' | 'other';
  repeat_interval?: 'daily' | 'weekly' | 'monthly' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  pet?: {
    id: number;
    name: string;
  };
}

export interface ReminderFormData {
  pet_id: number;
  title: string;
  type: string;
  reminder_time: string;
  repeat_interval?: string | null;
  description?: string;
  is_active: boolean;
}
