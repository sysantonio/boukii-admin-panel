export interface Client {
  id: number;
  season_id: number;
  
  // Personal Information
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  mobile_phone?: string;
  birth_date?: Date;
  age?: number;
  
  // Identification Documents
  document_type: DocumentType;
  document_number: string;
  document_expiry_date?: Date;
  nationality?: string;
  
  // Address Information
  address: ClientAddress;
  
  // Contact Preferences
  contact_preferences: ContactPreferences;
  
  // Client Profile
  profile: ClientProfile;
  profile_picture?: string;
  
  // Booking History & Statistics
  booking_stats: ClientBookingStats;
  
  // Emergency Contact
  emergency_contact?: EmergencyContact;
  
  // Legal & Compliance
  gdpr_consent: GDPRConsent;
  marketing_consent: boolean;
  terms_accepted: boolean;
  terms_accepted_date?: Date;
  
  // Financial Information
  payment_info: ClientPaymentInfo;
  
  // Client Status
  status: ClientStatus;
  client_type: ClientType;
  vip_status: boolean;
  loyalty_level: LoyaltyLevel;
  
  // System Fields
  created_at: Date;
  updated_at: Date;
  created_by?: number;
  updated_by?: number;
  last_login?: Date;
  notes?: string;
  internal_notes?: string;
  
  // Relations (populated when needed)
  bookings?: any[]; // Booking interface from bookings module
  season?: any; // Season interface from core
}

export interface ClientAddress {
  street: string;
  street_number?: string;
  apartment?: string;
  city: string;
  postal_code: string;
  province: string;
  country: string;
  is_primary: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ContactPreferences {
  preferred_language: string;
  preferred_contact_method: ContactMethod;
  contact_time_preference: TimePreference;
  timezone?: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  push_notifications: boolean;
}

export interface ClientProfile {
  avatar_url?: string;
  bio?: string;
  interests: string[];
  skill_levels: { [activity: string]: SkillLevel };
  medical_conditions?: string;
  dietary_restrictions?: string;
  accessibility_needs?: string;
  previous_experience: { [activity: string]: ExperienceLevel };
  preferred_activities: number[]; // Course IDs
  blacklisted_activities: number[]; // Course IDs
  group_preferences: GroupPreference;
  equipment_owned: EquipmentItem[];
}

export interface ClientBookingStats {
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  no_show_count: number;
  total_spent: number;
  average_booking_value: number;
  last_booking_date?: Date;
  next_booking_date?: Date;
  favorite_activities: ActivityPreference[];
  seasonal_activity: SeasonalActivity[];
  booking_frequency: BookingFrequency;
  customer_lifetime_value: number;
  referrals_made: number;
  loyalty_points: number;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface GDPRConsent {
  data_processing_consent: boolean;
  marketing_consent: boolean;
  third_party_sharing_consent: boolean;
  consent_date: Date;
  consent_ip?: string;
  withdrawal_date?: Date;
  legal_basis: GDPRLegalBasis;
}

export interface ClientPaymentInfo {
  preferred_payment_method: PaymentMethod;
  credit_limit?: number;
  outstanding_balance: number;
  payment_terms?: number; // days
  late_payment_fees: number;
  discount_percentage?: number;
  tax_exempt: boolean;
  billing_address_same_as_contact: boolean;
  billing_address?: ClientAddress;
}

export interface ActivityPreference {
  activity_id: number;
  activity_name: string;
  booking_count: number;
  total_spent: number;
  average_rating?: number;
  last_booked?: Date;
}

export interface SeasonalActivity {
  season_id: number;
  season_name: string;
  booking_count: number;
  total_spent: number;
  activities: ActivityPreference[];
}

export interface EquipmentItem {
  equipment_type: string;
  brand?: string;
  model?: string;
  size?: string;
  owned_since?: Date;
  needs_rental: boolean;
}

// Enums and Types
export type DocumentType = 'dni' | 'nie' | 'passport' | 'driver_license' | 'other';

export type ClientStatus = 'active' | 'inactive' | 'suspended' | 'blacklisted' | 'pending_verification';

export type ClientType = 'individual' | 'family' | 'group' | 'corporate' | 'school' | 'club';

export type LoyaltyLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type ContactMethod = 'email' | 'phone' | 'sms' | 'whatsapp' | 'postal';

export type TimePreference = 'morning' | 'afternoon' | 'evening' | 'any';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type ExperienceLevel = 'none' | 'minimal' | 'some' | 'extensive' | 'professional';

export type GroupPreference = 'small' | 'medium' | 'large' | 'private' | 'any';

export type GDPRLegalBasis = 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'paypal' | 'bizum' | 'financing';

export type BookingFrequency = 'first_time' | 'occasional' | 'regular' | 'frequent' | 'vip';

// Client Creation and Update DTOs
export interface CreateClientRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile_phone?: string;
  birth_date?: Date;
  nationality?: string;
  document_type: DocumentType;
  document_number: string;
  document_expiry_date?: Date;
  address: Omit<ClientAddress, 'is_primary'>;
  emergency_contact?: Omit<EmergencyContact, 'id'>;
  contact_preferences: Partial<ContactPreferences>;
  profile: Partial<ClientProfile>;
  gdpr_consent: Omit<GDPRConsent, 'consent_date' | 'consent_ip'>;
  marketing_consent: boolean;
  terms_accepted: boolean;
  notes?: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  id: number;
  status?: ClientStatus;
  internal_notes?: string;
}

// Client Search and Filter
export interface ClientSearchCriteria {
  season_id?: number;
  query?: string; // Search in name, email, phone, document
  status?: ClientStatus[];
  client_type?: ClientType[];
  loyalty_level?: LoyaltyLevel[];
  city?: string;
  country?: string;
  age_from?: number;
  age_to?: number;
  total_spent_from?: number;
  total_spent_to?: number;
  last_booking_from?: Date;
  last_booking_to?: Date;
  registration_from?: Date;
  registration_to?: Date;
  has_upcoming_bookings?: boolean;
  has_outstanding_balance?: boolean;
  vip_only?: boolean;
  page?: number;
  limit?: number;
  sort_by?: ClientSortField;
  sort_order?: 'asc' | 'desc';
}

export type ClientSortField = 
  | 'created_at'
  | 'last_name'
  | 'email'
  | 'total_spent'
  | 'total_bookings'
  | 'last_booking_date'
  | 'loyalty_level';

// Client Statistics and Analytics
export interface ClientStats {
  total_clients: number;
  active_clients: number;
  new_clients_this_month: number;
  vip_clients: number;
  total_client_value: number;
  average_client_value: number;
  client_retention_rate: number;
  client_acquisition_cost: number;
  top_cities: CityStats[];
  age_distribution: AgeDistribution[];
  loyalty_distribution: LoyaltyDistribution[];
  booking_patterns: ClientBookingPattern[];
}

export interface CityStats {
  city: string;
  client_count: number;
  total_revenue: number;
  average_client_value: number;
}

export interface AgeDistribution {
  age_range: string;
  client_count: number;
  percentage: number;
}

export interface LoyaltyDistribution {
  loyalty_level: LoyaltyLevel;
  client_count: number;
  percentage: number;
  average_spent: number;
}

export interface ClientBookingPattern {
  pattern_type: string;
  description: string;
  client_count: number;
  revenue_impact: number;
}

// Client Communication
export interface ClientCommunication {
  id: number;
  client_id: number;
  type: CommunicationType;
  subject: string;
  content: string;
  channel: ContactMethod;
  status: CommunicationStatus;
  sent_at?: Date;
  delivered_at?: Date;
  opened_at?: Date;
  clicked_at?: Date;
  replied_at?: Date;
  created_by: number;
  template_id?: number;
  campaign_id?: number;
}

export type CommunicationType = 
  | 'booking_confirmation'
  | 'booking_reminder'
  | 'booking_cancellation'
  | 'payment_reminder'
  | 'marketing'
  | 'newsletter'
  | 'survey'
  | 'support'
  | 'system_notification';

export type CommunicationStatus = 
  | 'draft'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'bounced'
  | 'unsubscribed';

// Client Segmentation
export interface ClientSegment {
  id: number;
  name: string;
  description: string;
  criteria: ClientSegmentCriteria;
  client_count: number;
  created_at: Date;
  updated_at: Date;
  is_dynamic: boolean;
  auto_update: boolean;
}

export interface ClientSegmentCriteria {
  conditions: SegmentCondition[];
  operator: 'AND' | 'OR';
}

export interface SegmentCondition {
  field: string;
  operator: SegmentOperator;
  value: any;
  type: SegmentFieldType;
}

export type SegmentOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'
  | 'between'
  | 'is_null'
  | 'is_not_null';

export type SegmentFieldType = 
  | 'string'
  | 'number'
  | 'date'
  | 'boolean'
  | 'array'
  | 'enum';

// Client Import/Export
export interface ClientImportResult {
  total_processed: number;
  successful_imports: number;
  failed_imports: number;
  duplicates_found: number;
  errors: ClientImportError[];
  imported_clients: Client[];
}

export interface ClientImportError {
  row: number;
  field?: string;
  error: string;
  data: any;
}

export interface ClientExportRequest {
  criteria: ClientSearchCriteria;
  format: 'csv' | 'excel' | 'json';
  fields: string[];
  include_booking_history: boolean;
  include_communication_history: boolean;
}