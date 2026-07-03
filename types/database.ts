export type Area = {
  id: string;
  name: string;
  created_at: string;
};

export type School = {
  id: string;
  name: string;
  code: string;
  area_id: string | null;
  total_cows: number;
  completed_cows: number;
  damaged_devices: number;
  created_at: string;
  updated_at: string;
  areas?: Area | null;
};

export type Update = {
  id: string;
  school_id: string | null;
  user_id: string | null;
  cows_completed: number;
  damaged_devices: number;
  room_number: string | null;
  notes: string | null;
  created_at: string;
  schools?: Pick<School, "id" | "name" | "code" | "area_id"> | null;
};

export type CowTotalChange = {
  id: string;
  school_id: string | null;
  changed_by: string | null;
  old_total: number;
  new_total: number;
  reason: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    role: string | null;
  } | null;
};