export interface Client {
  id: number;
  school_id: number;
  client_number: string;
  personal_info: ClientPersonalInfo;
  contact_info: ClientContactInfo;
  preferences: ClientPreferences;
  loyalty_info: ClientLoyaltyInfo;
  gdpr_consent: GDPRConsent;
  statistics: ClientStatistics;
  tags: string[];
  notes: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ClientPersonalInfo {
  name: string;
  surname: string;
  date_of_birth?: Date;
  gender?: Gender;
  nationality?: string;
  language_preference: string;
  identification: ClientIdentification;
  emergency_contact?: EmergencyContact;
}

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface ClientIdentification {
  type: IdentificationType;
  number: string;
  expiry_date?: Date;
  issuing_country?: string;
}

export type IdentificationType = 'dni' | 'nie' | 'passport' | 'driving_license' | 'other';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface ClientContactInfo {
  email: string;
  phone: string;
  secondary_phone?: string;
  address: ClientAddress;
  communication_preferences: CommunicationPreferences;
}

export interface ClientAddress {
  street: string;
  city: string;
  postal_code: string;
  province: string;
  country: string;
  is_billing_address: boolean;
}

export interface CommunicationPreferences {
  email_marketing: boolean;
  sms_marketing: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  preferred_language: string;
  preferred_contact_method: ContactMethod;
  contact_time_preference: TimePreference;
}

export type ContactMethod = 'email' | 'phone' | 'sms' | 'whatsapp';
export type TimePreference = 'morning' | 'afternoon' | 'evening' | 'any_time';

export interface ClientPreferences {
  skill_levels: SkillLevelPreference[];
  activity_preferences: string[];
  difficulty_preference: DifficultyPreference;
  instructor_preferences: InstructorPreference;
  equipment_preferences: EquipmentPreference;
  accessibility_requirements: AccessibilityRequirement[];
}

export interface SkillLevelPreference {
  activity: string;
  level: SkillLevel;
  last_updated: Date;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type DifficultyPreference = 'easy' | 'moderate' | 'challenging' | 'extreme';

export interface InstructorPreference {
  preferred_instructors: number[];
  instructor_gender_preference?: Gender;
  language_requirements: string[];
}

export interface EquipmentPreference {
  own_equipment: string[];
  equipment_size_info: EquipmentSizeInfo;
  special_requirements: string[];
}

export interface EquipmentSizeInfo {
  shoe_size?: number;
  clothing_size?: string;
  helmet_size?: string;
  weight?: number;
  height?: number;
}

export interface AccessibilityRequirement {
  type: AccessibilityType;
  description: string;
  accommodation_needed: string;
}

export type AccessibilityType = 'mobility' | 'visual' | 'hearing' | 'cognitive' | 'other';

export interface ClientLoyaltyInfo {
  points_balance: number;
  tier_level: LoyaltyTier;
  tier_benefits: string[];
  points_history: LoyaltyTransaction[];
  referral_code: string;
  referred_clients: number;
  lifetime_value: number;
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface LoyaltyTransaction {
  id: number;
  type: LoyaltyTransactionType;
  points: number;
  description: string;
  booking_id?: number;
  created_at: Date;
}

export type LoyaltyTransactionType = 'earned' | 'redeemed' | 'expired' | 'adjusted';

export interface GDPRConsent {
  marketing_consent: boolean;
  data_processing_consent: boolean;
  third_party_sharing_consent: boolean;
  consent_date: Date;
  consent_ip: string;
  withdrawal_date?: Date;
  privacy_policy_version: string;
}

export interface ClientStatistics {
  total_bookings: number;
  total_spent: number;
  average_booking_value: number;
  first_booking_date?: Date;
  last_booking_date?: Date;
  favorite_activities: string[];
  seasonal_patterns: SeasonalPattern[];
  cancellation_rate: number;
  no_show_rate: number;
  satisfaction_score?: number;
}

export interface SeasonalPattern {
  season_id: number;
  bookings_count: number;
  total_spent: number;
  favorite_activities: string[];
}

export interface ClientSegment {
  id: number;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  client_count: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SegmentCriteria {
  age_range?: AgeRange;
  spending_range?: SpendingRange;
  booking_frequency?: BookingFrequency;
  activity_preferences?: string[];
  loyalty_tier?: LoyaltyTier[];
  last_activity_days?: number;
  location?: string[];
  tags?: string[];
}

export interface AgeRange {
  min_age?: number;
  max_age?: number;
}

export interface SpendingRange {
  min_spent?: number;
  max_spent?: number;
}

export interface BookingFrequency {
  min_bookings?: number;
  max_bookings?: number;
  time_period_months?: number;
}

export interface ClientFilter {
  search_term?: string;
  tags?: string[];
  segment_id?: number;
  activity_preferences?: string[];
  age_range?: AgeRange;
  spending_range?: SpendingRange;
  loyalty_tier?: LoyaltyTier[];
  registration_date_from?: Date;
  registration_date_to?: Date;
  last_activity_from?: Date;
  last_activity_to?: Date;
  is_active?: boolean;
}

export interface ClientCommunication {
  id: number;
  client_id: number;
  type: CommunicationType;
  subject: string;
  content: string;
  status: CommunicationStatus;
  sent_at?: Date;
  delivered_at?: Date;
  opened_at?: Date;
  clicked_at?: Date;
  template_id?: number;
  campaign_id?: number;
  created_by: number;
  created_at: Date;
}

export type CommunicationType = 'email' | 'sms' | 'whatsapp' | 'phone_call' | 'postal_mail';
export type CommunicationStatus = 'draft' | 'scheduled' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';