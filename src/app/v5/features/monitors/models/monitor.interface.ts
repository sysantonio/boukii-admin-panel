export interface Monitor {
  id: number;
  season_id: number;
  
  // Personal Information
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  mobile_phone?: string;
  birth_date: Date;
  age: number;
  
  // Identification Documents
  document_type: DocumentType;
  document_number: string;
  document_expiry_date?: Date;
  nationality: string;
  
  // Professional Information
  employee_id: string;
  hire_date: Date;
  contract_type: ContractType;
  employment_status: EmploymentStatus;
  department: string;
  position: string;
  reporting_manager_id?: number;
  
  // Certifications and Qualifications
  certifications: MonitorCertification[];
  languages: MonitorLanguage[];
  qualifications: Qualification[];
  
  // Skills and Specializations
  skills: MonitorSkill[];
  specializations: CourseSpecialization[];
  experience_level: ExperienceLevel;
  years_of_experience: number;
  
  // Availability and Scheduling
  availability: MonitorAvailability;
  time_slots: AvailableTimeSlot[];
  preferred_courses: number[]; // Course IDs
  blacklisted_courses: number[]; // Course IDs
  
  // Performance and Statistics
  performance_stats: MonitorPerformanceStats;
  
  // Financial Information
  compensation: MonitorCompensation;
  
  // Contact and Emergency Information
  address: MonitorAddress;
  emergency_contact: EmergencyContact;
  
  // Legal and Compliance
  work_authorization: WorkAuthorization;
  background_check: BackgroundCheck;
  insurance_info: InsuranceInfo;
  
  // System Fields
  status: MonitorStatus;
  profile_picture?: string;
  notes?: string;
  internal_notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;
  
  // Relations (populated when needed)
  assigned_bookings?: any[]; // Booking interface from bookings module
  season?: any; // Season interface from core
  reporting_manager?: Monitor;
  team_members?: Monitor[];
}

export interface MonitorCertification {
  id?: number;
  monitor_id?: number;
  certification_name: string;
  issuing_organization: string;
  certification_number?: string;
  issue_date: Date;
  expiry_date?: Date;
  is_active: boolean;
  is_required: boolean;
  certificate_url?: string;
  verification_status: VerificationStatus;
}

export interface MonitorLanguage {
  language_code: string;
  language_name: string;
  proficiency_level: LanguageProficiency;
  is_native: boolean;
  certification?: string;
}

export interface Qualification {
  id?: number;
  qualification_type: QualificationType;
  qualification_name: string;
  institution: string;
  completion_date: Date;
  grade?: string;
  is_verified: boolean;
  certificate_url?: string;
}

export interface MonitorSkill {
  skill_name: string;
  skill_category: SkillCategory;
  proficiency_level: SkillProficiency;
  years_of_experience: number;
  is_certified: boolean;
  last_used: Date;
  is_core_skill: boolean;
}

export interface CourseSpecialization {
  course_group_id: number;
  course_group_name: string;
  specialization_level: SpecializationLevel;
  years_of_experience: number;
  total_courses_taught: number;
  average_rating: number;
  is_primary_specialization: boolean;
  certification_required: boolean;
  last_taught: Date;
}

export interface MonitorAvailability {
  id?: number;
  monitor_id?: number;
  season_id: number;
  
  // Weekly Availability
  weekly_schedule: WeeklySchedule;
  
  // Exceptions and Overrides
  date_overrides: DateOverride[];
  recurring_exceptions: RecurringException[];
  
  // Capacity and Limits
  max_hours_per_day: number;
  max_hours_per_week: number;
  max_courses_per_day: number;
  max_participants_per_session: number;
  
  // Travel and Location
  available_locations: number[]; // Location IDs
  max_travel_distance_km: number;
  has_vehicle: boolean;
  can_travel_internationally: boolean;
  
  // Special Conditions
  weather_dependent_availability: boolean;
  indoor_only: boolean;
  outdoor_only: boolean;
  equipment_restrictions: string[];
  
  created_at: Date;
  updated_at: Date;
}

export interface WeeklySchedule {
  monday: DailySchedule;
  tuesday: DailySchedule;
  wednesday: DailySchedule;
  thursday: DailySchedule;
  friday: DailySchedule;
  saturday: DailySchedule;
  sunday: DailySchedule;
}

export interface DailySchedule {
  is_available: boolean;
  time_slots: TimeSlotAvailability[];
  break_time?: BreakTime;
  notes?: string;
}

export interface TimeSlotAvailability {
  start_time: string; // HH:mm format
  end_time: string;   // HH:mm format
  is_available: boolean;
  is_preferred_time: boolean;
  hourly_rate_modifier?: number; // Multiplier for base rate
}

export interface BreakTime {
  start_time: string;
  end_time: string;
  is_flexible: boolean;
}

export interface DateOverride {
  date: Date;
  override_type: OverrideType;
  is_available: boolean;
  custom_schedule?: DailySchedule;
  reason: string;
  notes?: string;
}

export interface RecurringException {
  exception_type: ExceptionType;
  start_date: Date;
  end_date?: Date;
  days_of_week: number[]; // 0-6, Sunday = 0
  is_available: boolean;
  reason: string;
  recurrence_pattern: RecurrencePattern;
}

export interface AvailableTimeSlot {
  id: number;
  date: Date;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booking_id?: number;
  course_id?: number;
  participants_count?: number;
  status: TimeSlotStatus;
  location_id?: number;
  travel_time_minutes?: number;
  setup_time_minutes?: number;
  cleanup_time_minutes?: number;
}

export interface MonitorPerformanceStats {
  // Course Statistics
  total_courses_taught: number;
  total_hours_taught: number;
  total_participants_taught: number;
  courses_this_season: number;
  hours_this_season: number;
  
  // Ratings and Reviews
  average_rating: number;
  total_reviews: number;
  rating_distribution: RatingDistribution;
  
  // Reliability Metrics
  attendance_rate: number;
  punctuality_rate: number;
  cancellation_rate: number;
  no_show_rate: number;
  
  // Performance Trends
  monthly_performance: MonthlyPerformance[];
  course_performance: CoursePerformanceMetrics[];
  
  // Financial Performance
  total_earnings_this_season: number;
  average_hourly_rate: number;
  bonus_earnings: number;
  
  // Growth Metrics
  skill_development_score: number;
  certification_progress: number;
  training_hours_completed: number;
  
  last_updated: Date;
}

export interface RatingDistribution {
  five_stars: number;
  four_stars: number;
  three_stars: number;
  two_stars: number;
  one_star: number;
}

export interface MonthlyPerformance {
  month: string;
  year: number;
  courses_taught: number;
  hours_worked: number;
  participants_count: number;
  average_rating: number;
  earnings: number;
  attendance_rate: number;
}

export interface CoursePerformanceMetrics {
  course_group_id: number;
  course_group_name: string;
  courses_taught: number;
  total_participants: number;
  average_rating: number;
  completion_rate: number;
  repeat_client_rate: number;
  revenue_generated: number;
}

export interface MonitorCompensation {
  base_hourly_rate: number;
  currency: string;
  pay_frequency: PayFrequency;
  
  // Rate Modifiers
  weekend_rate_multiplier: number;
  holiday_rate_multiplier: number;
  overtime_rate_multiplier: number;
  specialized_course_bonus: number;
  
  // Benefits
  has_health_insurance: boolean;
  has_dental_insurance: boolean;
  vacation_days_per_year: number;
  sick_days_per_year: number;
  
  // Performance Bonuses
  performance_bonus_eligible: boolean;
  bonus_criteria: BonusCriteria[];
  
  // Equipment Allowance
  equipment_allowance_monthly: number;
  transport_allowance_per_km: number;
  
  // Tax Information
  tax_status: TaxStatus;
  tax_identification_number?: string;
  
  effective_date: Date;
  next_review_date: Date;
}

export interface BonusCriteria {
  criteria_name: string;
  target_value: number;
  bonus_amount: number;
  bonus_type: BonusType;
  is_active: boolean;
}

export interface MonitorAddress {
  street: string;
  street_number?: string;
  apartment?: string;
  city: string;
  postal_code: string;
  province: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  is_primary: boolean;
}

export interface WorkAuthorization {
  has_work_permit: boolean;
  work_permit_number?: string;
  work_permit_expiry?: Date;
  visa_status?: VisaStatus;
  visa_expiry?: Date;
  eu_citizen: boolean;
  can_work_weekends: boolean;
  can_work_holidays: boolean;
  max_weekly_hours: number;
}

export interface BackgroundCheck {
  is_completed: boolean;
  completion_date?: Date;
  check_type: BackgroundCheckType;
  status: BackgroundCheckStatus;
  valid_until?: Date;
  provider: string;
  reference_number?: string;
  notes?: string;
}

export interface InsuranceInfo {
  professional_liability: InsuranceCoverage;
  public_liability: InsuranceCoverage;
  equipment_insurance?: InsuranceCoverage;
  health_insurance?: InsuranceCoverage;
}

export interface InsuranceCoverage {
  provider: string;
  policy_number: string;
  coverage_amount: number;
  effective_date: Date;
  expiry_date: Date;
  is_active: boolean;
}

// Enums and Types
export type DocumentType = 'dni' | 'nie' | 'passport' | 'driver_license';

export type ContractType = 'full_time' | 'part_time' | 'seasonal' | 'freelance' | 'intern' | 'volunteer';

export type EmploymentStatus = 'active' | 'inactive' | 'on_leave' | 'terminated' | 'suspended' | 'probation';

export type MonitorStatus = 'available' | 'busy' | 'on_break' | 'sick_leave' | 'vacation' | 'unavailable';

export type VerificationStatus = 'pending' | 'verified' | 'expired' | 'invalid' | 'not_required';

export type LanguageProficiency = 'basic' | 'intermediate' | 'advanced' | 'fluent' | 'native';

export type QualificationType = 'degree' | 'diploma' | 'certificate' | 'license' | 'training' | 'other';

export type SkillCategory = 'technical' | 'safety' | 'communication' | 'leadership' | 'specialized' | 'soft_skills';

export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type SpecializationLevel = 'assistant' | 'instructor' | 'senior_instructor' | 'specialist' | 'master';

export type ExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'expert';

export type OverrideType = 'availability_change' | 'special_event' | 'maintenance' | 'personal' | 'training';

export type ExceptionType = 'vacation' | 'sick_leave' | 'training' | 'maintenance' | 'special_event';

export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'custom';

export type TimeSlotStatus = 'available' | 'booked' | 'blocked' | 'maintenance' | 'travel_time';

export type PayFrequency = 'hourly' | 'daily' | 'weekly' | 'bi_weekly' | 'monthly';

export type BonusType = 'fixed' | 'percentage' | 'per_participant' | 'per_course';

export type TaxStatus = 'employee' | 'contractor' | 'freelancer' | 'intern';

export type VisaStatus = 'tourist' | 'student' | 'work' | 'residence' | 'citizen';

export type BackgroundCheckType = 'basic' | 'enhanced' | 'criminal' | 'reference' | 'education';

export type BackgroundCheckStatus = 'pending' | 'in_progress' | 'completed' | 'cleared' | 'flagged' | 'failed';

// Monitor Creation and Update DTOs
export interface CreateMonitorRequest {
  // Personal Information
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date: Date;
  document_type: DocumentType;
  document_number: string;
  nationality: string;
  
  // Professional Information
  hire_date: Date;
  contract_type: ContractType;
  department: string;
  position: string;
  
  // Address
  address: Omit<MonitorAddress, 'coordinates'>;
  
  // Emergency Contact
  emergency_contact: Omit<EmergencyContact, 'is_primary'>;
  
  // Basic Compensation
  base_hourly_rate: number;
  
  // Initial Availability
  max_hours_per_week: number;
  available_locations: number[];
  
  notes?: string;
}

export interface UpdateMonitorRequest extends Partial<CreateMonitorRequest> {
  id: number;
  status?: MonitorStatus;
  employment_status?: EmploymentStatus;
  internal_notes?: string;
}

// Monitor Search and Filter
export interface MonitorSearchCriteria {
  season_id?: number;
  query?: string; // Search in name, email, phone, employee_id
  status?: MonitorStatus[];
  employment_status?: EmploymentStatus[];
  contract_type?: ContractType[];
  department?: string[];
  specializations?: number[]; // Course group IDs
  available_on_date?: Date;
  available_time_from?: string;
  available_time_to?: string;
  location_id?: number;
  min_rating?: number;
  max_hourly_rate?: number;
  min_hourly_rate?: number;
  has_certification?: string;
  language?: string;
  experience_level?: ExperienceLevel[];
  page?: number;
  limit?: number;
  sort_by?: MonitorSortField;
  sort_order?: 'asc' | 'desc';
}

export type MonitorSortField = 
  | 'created_at'
  | 'last_name'
  | 'hire_date'
  | 'base_hourly_rate'
  | 'average_rating'
  | 'total_courses_taught'
  | 'attendance_rate';

// Monitor Statistics
export interface MonitorStats {
  total_monitors: number;
  active_monitors: number;
  available_monitors: number;
  new_monitors_this_month: number;
  average_rating: number;
  total_hours_this_season: number;
  average_hourly_rate: number;
  top_performers: TopPerformer[];
  specialization_distribution: SpecializationDistribution[];
  availability_trends: AvailabilityTrend[];
}

export interface TopPerformer {
  monitor_id: number;
  monitor_name: string;
  average_rating: number;
  courses_taught: number;
  total_hours: number;
  performance_score: number;
}

export interface SpecializationDistribution {
  specialization: string;
  monitor_count: number;
  percentage: number;
  average_rating: number;
}

export interface AvailabilityTrend {
  date: Date;
  available_monitors: number;
  booked_hours: number;
  utilization_rate: number;
}

// Monitor Scheduling
export interface MonitorScheduleRequest {
  monitor_id: number;
  date: Date;
  start_time: string;
  end_time: string;
  course_id: number;
  booking_id: number;
  location_id?: number;
  special_requirements?: string;
}

export interface MonitorScheduleConflict {
  conflict_type: 'double_booking' | 'unavailable' | 'travel_time' | 'break_time' | 'max_hours';
  conflicting_booking_id?: number;
  message: string;
  suggested_alternatives: MonitorAlternative[];
}

export interface MonitorAlternative {
  monitor_id: number;
  monitor_name: string;
  specialization_match: number; // 0-100%
  availability_confirmed: boolean;
  hourly_rate: number;
  rating: number;
  travel_distance_km?: number;
}

// Monitor Evaluation
export interface MonitorEvaluation {
  id: number;
  monitor_id: number;
  evaluator_id: number;
  evaluation_period_start: Date;
  evaluation_period_end: Date;
  
  // Performance Scores (1-10)
  technical_skills: number;
  communication_skills: number;
  punctuality: number;
  professionalism: number;
  client_satisfaction: number;
  adaptability: number;
  teamwork: number;
  
  overall_score: number;
  strengths: string[];
  areas_for_improvement: string[];
  development_goals: string[];
  
  // Ratings from clients/bookings
  client_feedback_summary: ClientFeedbackSummary;
  
  evaluation_date: Date;
  next_evaluation_date: Date;
  evaluator_notes: string;
  monitor_response?: string;
  
  action_plan: ActionPlanItem[];
}

export interface ClientFeedbackSummary {
  total_reviews: number;
  average_rating: number;
  positive_feedback_themes: string[];
  improvement_suggestions: string[];
  would_book_again_percentage: number;
}

export interface ActionPlanItem {
  action: string;
  target_date: Date;
  responsible_party: 'monitor' | 'manager' | 'hr';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}