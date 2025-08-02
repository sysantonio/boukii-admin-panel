export interface Booking {
  id: number;
  season_id: number;
  course_id: number;
  client_id: number;
  monitor_id?: number;
  reference_number: string;
  booking_number: string;

  // Booking Details
  booking_date: Date;
  course_date: Date;
  time_slot_id: number;
  participant_count: number;
  total_participants: number;

  // Participant Information
  participants: BookingParticipant[];

  // Pricing
  pricing: any;

  // Status Management
  status: BookingStatus;
  payment_status: PaymentStatus;

  // Additional Information
  special_requirements?: string;
  accessibility_requirements?: string;
  notes?: string;
  internal_notes?: string;
  course_group: string;

  // Weather and Conditions
  weather_dependent: boolean;
  weather_status?: WeatherStatus;

  // Timestamps
  created_at: Date;
  updated_at: Date;
  confirmed_at?: Date;
  cancelled_at?: Date;

  // Relations (populated when needed)
  course?: any; // Course interface from core
  client?: any; // Client interface from core
  monitor?: any; // Monitor interface from core
  season?: any; // Season interface from core
}

export interface BookingParticipant {
  id?: number;
  booking_id?: number;
  name: string;
  age: number;
  birth_date: Date;
  emergency_contact: string;
  emergency_phone: string;
  medical_conditions?: string;
  skill_level?: SkillLevel;
  previous_experience: boolean;
  equipment_rental: EquipmentRental[];
  dietary_restrictions?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface BookingPricing {
  id?: number;
  booking_id?: number;

  // Base Pricing
  base_price_per_participant: number;
  total_base_price: number;

  // Discounts and Modifiers
  early_bird_discount: number;
  group_discount: number;
  seasonal_modifier: number;
  loyalty_discount: number;
  custom_discount: number;
  discount_reason?: string;

  // Additional Costs
  equipment_cost: number;
  insurance_cost: number;
  extra_services_cost: number;

  // Taxes and Final Totals
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;

  // Payment Information
  amount_paid: number;
  amount_due: number;
  currency: string;

  // Pricing Breakdown
  pricing_breakdown: PricingLineItem[];

  created_at?: Date;
  updated_at?: Date;
}

export interface PricingLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  type: PricingItemType;
  is_optional: boolean;
}

export interface EquipmentRental {
  equipment_id: number;
  equipment_name: string;
  quantity: number;
  daily_rate: number;
  total_cost: number;
}

export type BookingStatus =
  | 'draft'
  | 'pending_payment'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'partial'
  | 'paid'
  | 'refunded'
  | 'cancelled';

export type WeatherStatus =
  | 'good'
  | 'acceptable'
  | 'concerning'
  | 'cancelled_weather';

export type SkillLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export type PricingItemType =
  | 'base'
  | 'equipment'
  | 'insurance'
  | 'extra_service'
  | 'discount'
  | 'tax';

// Booking Creation and Update DTOs
export interface CreateBookingRequest {
  course_id: number;
  client_id: number;
  course_date: Date;
  time_slot_id: number;
  participant_count: number;
  participants: Omit<BookingParticipant, 'id' | 'booking_id' | 'created_at' | 'updated_at'>[];
  special_requirements?: string;
  notes?: string;
  pricing_overrides?: Partial<BookingPricing>;
}

export interface UpdateBookingRequest extends Partial<CreateBookingRequest> {
  id: number;
  status?: BookingStatus;
  internal_notes?: string;
}

// Booking Search and Filter
export interface BookingSearchCriteria {
  season_id?: number;
  course_id?: number;
  client_id?: number;
  monitor_id?: number;
  status?: BookingStatus[];
  payment_status?: PaymentStatus[];
  date_from?: Date;
  date_to?: Date;
  reference_number?: string;
  client_name?: string;
  page?: number;
  limit?: number;
  sort_by?: BookingSortField;
  sort_order?: 'asc' | 'desc';
}

export type BookingSortField =
  | 'created_at'
  | 'course_date'
  | 'booking_date'
  | 'total_amount'
  | 'status'
  | 'client_name';

// Booking Statistics
export interface BookingStats {
  total_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  average_booking_value: number;
  occupancy_rate: number;
  popular_courses: CoursePopularity[];
  booking_trends: BookingTrend[];
}

export interface CoursePopularity {
  course_id: number;
  course_name: string;
  booking_count: number;
  revenue: number;
}

export interface BookingTrend {
  date: Date;
  booking_count: number;
  revenue: number;
}

// Wizard and UI State
export interface BookingWizardState {
  currentStep: BookingWizardStep;
  steps: BookingWizardStepData[];
  isValid: boolean;
  canProceed: boolean;
  formData: Partial<CreateBookingRequest>;
  pricingCalculation?: BookingPricing;
  availabilityCheck?: any; // From course availability service
  errors: { [key: string]: string[] };
}

export type BookingWizardStep =
  | 'course_selection'
  | 'date_time'
  | 'participants'
  | 'extras'
  | 'pricing'
  | 'payment'
  | 'confirmation';

export interface BookingWizardStepData {
  step: BookingWizardStep;
  title: string;
  description: string;
  isValid: boolean;
  isComplete: boolean;
  canSkip: boolean;
  errors: string[];
}

// Booking Analytics
export interface BookingAnalytics {
  period_start: Date;
  period_end: Date;
  metrics: BookingMetrics;
  seasonal_analysis: SeasonalBookingAnalysis;
  course_performance: CourseBookingPerformance[];
  client_analysis: ClientBookingAnalysis;
}

export interface BookingMetrics {
  total_bookings: number;
  total_revenue: number;
  average_booking_value: number;
  conversion_rate: number;
  cancellation_rate: number;
  no_show_rate: number;
  repeat_customer_rate: number;
}

export interface SeasonalBookingAnalysis {
  peak_days: Date[];
  low_demand_days: Date[];
  seasonal_trends: { [month: string]: BookingTrend };
  weather_impact: WeatherImpactAnalysis;
}

export interface CourseBookingPerformance {
  course_id: number;
  course_name: string;
  bookings: number;
  revenue: number;
  average_participants: number;
  occupancy_rate: number;
  customer_satisfaction: number;
}

export interface ClientBookingAnalysis {
  new_clients: number;
  returning_clients: number;
  client_lifetime_value: number;
  booking_frequency: { [clientId: number]: number };
}

export interface WeatherImpactAnalysis {
  weather_cancellations: number;
  weather_related_revenue_loss: number;
  most_affected_courses: number[];
}
