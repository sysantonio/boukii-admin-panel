export interface Monitor {
  id: number;
  school_id: number;
  employee_number: string;
  personal_info: MonitorPersonalInfo;
  contact_info: MonitorContactInfo;
  professional_info: MonitorProfessionalInfo;
  availability: MonitorAvailability;
  certifications: MonitorCertification[];
  performance: MonitorPerformance;
  salary_info: MonitorSalaryInfo;
  emergency_contact: EmergencyContact;
  documents: MonitorDocument[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MonitorPersonalInfo {
  name: string;
  surname: string;
  date_of_birth: Date;
  gender: Gender;
  nationality: string;
  identification: MonitorIdentification;
  languages: LanguageSkill[];
  photo_url?: string;
}

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface MonitorIdentification {
  type: IdentificationType;
  number: string;
  expiry_date?: Date;
  issuing_country: string;
}

export type IdentificationType = 'dni' | 'nie' | 'passport' | 'social_security';

export interface LanguageSkill {
  language: string;
  level: LanguageLevel;
  is_native: boolean;
}

export type LanguageLevel = 'basic' | 'intermediate' | 'advanced' | 'native';

export interface MonitorContactInfo {
  email: string;
  phone: string;
  secondary_phone?: string;
  address: MonitorAddress;
  communication_preferences: CommunicationPreferences;
}

export interface MonitorAddress {
  street: string;
  city: string;
  postal_code: string;
  province: string;
  country: string;
}

export interface CommunicationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  preferred_language: string;
  preferred_contact_method: ContactMethod;
}

export type ContactMethod = 'email' | 'phone' | 'sms' | 'whatsapp';

export interface MonitorProfessionalInfo {
  hire_date: Date;
  employment_type: EmploymentType;
  position: string;
  department: string;
  specializations: Specialization[];
  skills: Skill[];
  experience_years: number;
  bio?: string;
  instructor_level: InstructorLevel;
}

export type EmploymentType = 'full_time' | 'part_time' | 'freelance' | 'seasonal' | 'intern';
export type InstructorLevel = 'trainee' | 'junior' | 'senior' | 'expert' | 'master';

export interface Specialization {
  activity: string;
  level: SpecializationLevel;
  years_experience: number;
  certifications: string[];
}

export type SpecializationLevel = 'basic' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  verified: boolean;
  verified_by?: number;
  verified_at?: Date;
}

export type SkillCategory = 'technical' | 'safety' | 'communication' | 'leadership' | 'first_aid';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface MonitorAvailability {
  season_id: number;
  availability_pattern: AvailabilityPattern;
  time_slots: AvailableTimeSlot[];
  blackout_dates: BlackoutDate[];
  preferred_schedule: PreferredSchedule;
  max_hours_per_week: number;
  overtime_rate_multiplier: number;
}

export interface AvailabilityPattern {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

export interface DayAvailability {
  is_available: boolean;
  start_time?: string;
  end_time?: string;
  break_periods?: BreakPeriod[];
  notes?: string;
}

export interface BreakPeriod {
  start_time: string;
  end_time: string;
  type: BreakType;
}

export type BreakType = 'lunch' | 'rest' | 'personal' | 'maintenance';

export interface AvailableTimeSlot {
  id: number;
  date: Date;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_preferred: boolean;
  rate_override?: number;
  notes?: string;
}

export interface BlackoutDate {
  id: number;
  start_date: Date;
  end_date: Date;
  reason: BlackoutReason;
  description: string;
  is_approved: boolean;
  approved_by?: number;
  approved_at?: Date;
}

export type BlackoutReason = 'vacation' | 'sick_leave' | 'personal' | 'training' | 'other_commitment';

export interface PreferredSchedule {
  preferred_days: number[];
  preferred_start_time: string;
  preferred_end_time: string;
  max_consecutive_hours: number;
  min_break_between_sessions: number;
}

export interface MonitorCertification {
  id: number;
  name: string;
  issuing_organization: string;
  certification_number: string;
  issue_date: Date;
  expiry_date?: Date;
  level?: CertificationLevel;
  status: CertificationStatus;
  document_url?: string;
  verification_status: VerificationStatus;
  renewal_reminder_sent: boolean;
}

export type CertificationLevel = 'basic' | 'intermediate' | 'advanced' | 'instructor' | 'examiner';
export type CertificationStatus = 'active' | 'expired' | 'suspended' | 'pending_renewal';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'expired';

export interface MonitorPerformance {
  season_id: number;
  total_hours_worked: number;
  total_sessions_conducted: number;
  client_ratings: ClientRating[];
  average_rating: number;
  feedback_summary: FeedbackSummary;
  performance_metrics: PerformanceMetrics;
  goals: PerformanceGoal[];
}

export interface ClientRating {
  booking_id: number;
  client_id: number;
  rating: number;
  feedback?: string;
  rating_date: Date;
  categories: RatingCategory[];
}

export interface RatingCategory {
  category: string;
  rating: number;
}

export interface FeedbackSummary {
  positive_comments: string[];
  areas_for_improvement: string[];
  recurring_themes: string[];
  action_items: string[];
}

export interface PerformanceMetrics {
  punctuality_score: number;
  client_satisfaction_score: number;
  session_completion_rate: number;
  no_show_rate: number;
  revenue_generated: number;
  efficiency_score: number;
}

export interface PerformanceGoal {
  id: number;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: Date;
  status: GoalStatus;
  created_by: number;
  created_at: Date;
}

export type GoalStatus = 'pending' | 'in_progress' | 'achieved' | 'missed' | 'cancelled';

export interface MonitorSalaryInfo {
  season_id: number;
  base_hourly_rate: number;
  overtime_rate: number;
  performance_bonus_rate?: number;
  payment_frequency: PaymentFrequency;
  payment_method: PaymentMethod;
  bank_details: BankDetails;
  tax_information: TaxInformation;
  salary_history: SalaryHistoryEntry[];
}

export type PaymentFrequency = 'weekly' | 'biweekly' | 'monthly' | 'per_session';
export type PaymentMethod = 'bank_transfer' | 'cash' | 'check' | 'paypal';

export interface BankDetails {
  bank_name: string;
  account_holder: string;
  account_number: string;
  routing_number?: string;
  iban?: string;
  swift_code?: string;
}

export interface TaxInformation {
  tax_id: string;
  tax_residence: string;
  tax_category: TaxCategory;
  withholding_rate: number;
}

export type TaxCategory = 'employee' | 'contractor' | 'freelancer';

export interface SalaryHistoryEntry {
  id: number;
  effective_date: Date;
  hourly_rate: number;
  reason: string;
  approved_by: number;
  created_at: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  secondary_phone?: string;
  email?: string;
  address?: string;
}

export interface MonitorDocument {
  id: number;
  type: DocumentType;
  name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  upload_date: Date;
  expiry_date?: Date;
  is_verified: boolean;
  verified_by?: number;
  verified_at?: Date;
  notes?: string;
}

export type DocumentType = 'contract' | 'id_document' | 'certification' | 'insurance' | 'tax_form' | 'medical_certificate' | 'photo' | 'other';

export interface MonitorAssignment {
  id: number;
  monitor_id: number;
  course_id: number;
  booking_id: number;
  assignment_date: Date;
  start_time: string;
  end_time: string;
  status: AssignmentStatus;
  hourly_rate: number;
  notes?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export type AssignmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface MonitorFilter {
  search_term?: string;
  specializations?: string[];
  availability_date?: Date;
  employment_type?: EmploymentType[];
  certification_required?: string[];
  experience_years_min?: number;
  rating_min?: number;
  is_active?: boolean;
  languages?: string[];
}

export interface MonitorStats {
  total_monitors: number;
  active_monitors: number;
  available_monitors: number;
  average_rating: number;
  total_certifications: number;
  certifications_expiring_soon: number;
}