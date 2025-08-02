import { Season } from './season.interface';

export interface Course {
  id: number;
  season_id: number;
  school_id: number;
  name: string;
  description: string;
  course_group_id: number;
  course_subgroup_id?: number;
  pricing: CourseSeasonPricing;
  availability: CourseSeasonAvailability;
  settings: any;
  created_at: Date;
  updated_at: Date;
  season?: Season;
}

export interface CourseSeasonPricing {
  id: number;
  course_id: number;
  season_id: number;
  pricing_type: 'flexible' | 'fixed';
  base_price: number;
  min_participants: number;
  max_participants: number;
  price_breaks: PriceBreak[];
  extras: CourseExtra[];
  currency: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PriceBreak {
  id: number;
  participant_count: number;
  price_per_participant: number;
  total_price: number;
  is_active: boolean;
}

export interface CourseExtra {
  id: number;
  name: string;
  description: string;
  price: number;
  is_required: boolean;
  is_active: boolean;
  category: 'insurance' | 'equipment' | 'transport' | 'meal' | 'other';
}

export interface CourseSeasonAvailability {
  id: number;
  course_id: number;
  season_id: number;
  available_dates: AvailableDate[];
  time_slots: TimeSlot[];
  capacity_settings: CapacitySettings;
  booking_rules: BookingRules;
  created_at: Date;
  updated_at: Date;
}

export interface AvailableDate {
  date: Date;
  is_available: boolean;
  capacity_override?: number;
  special_pricing?: number;
  notes?: string;
}

export interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  capacity: number;
  is_active: boolean;
  day_of_week?: number;
}

export interface CapacitySettings {
  default_capacity: number;
  allow_overbooking: boolean;
  overbooking_limit?: number;
  waitlist_enabled: boolean;
  auto_assign_from_waitlist: boolean;
}

export interface BookingRules {
  advance_booking_days: number;
  cancellation_deadline_hours: number;
  modification_deadline_hours: number;
  requires_approval: boolean;
  min_age?: number;
  max_age?: number;
  skill_level_required?: SkillLevel;
}

export interface CourseSettings {
  requires_monitor: boolean;
  monitor_requirements: MonitorRequirement[];
  equipment_included: boolean;
  equipment_list: string[];
  location: CourseLocation;
  weather_dependent: boolean;
  cancellation_weather_conditions: string[];
  tags: string[];
  difficulty_level: DifficultyLevel;
  skill_level: SkillLevel;
}

export interface MonitorRequirement {
  certification: string;
  experience_years?: number;
  specialization?: string;
  is_required: boolean;
}

export interface CourseLocation {
  name: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  indoor: boolean;
  facilities: string[];
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type SkillLevel = 'none' | 'basic' | 'intermediate' | 'advanced' | 'professional';

export interface CourseTemplate {
  id: number;
  name: string;
  description: string;
  course_data: Partial<Course>;
  is_active: boolean;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface CourseGroup {
  id: number;
  school_id: number;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  subgroups: CourseSubgroup[];
  created_at: Date;
  updated_at: Date;
}

export interface CourseSubgroup {
  id: number;
  course_group_id: number;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
