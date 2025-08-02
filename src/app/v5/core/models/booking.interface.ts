import { Season } from './season.interface';
import { Course } from './course.interface';

export interface Booking {
  id: number;
  season_id: number;
  school_id: number;
  course_id: number;
  client_id: number;
  booking_number: string;
  status: BookingStatus;
  participants: BookingParticipant[];
  pricing_snapshot: BookingPriceSnapshot;
  payments: BookingPayment[];
  communications: BookingCommunication[];
  modifications: BookingModification[];
  metadata: BookingMetadata;
  created_at: Date;
  updated_at: Date;
  season?: Season;
  course?: Course;
}

export type BookingStatus = 
  | 'pending'
  | 'confirmed' 
  | 'paid'
  | 'partial_paid'
  | 'cancelled'
  | 'completed'
  | 'no_show'
  | 'refunded';

export interface BookingParticipant {
  id: number;
  booking_id: number;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  date_of_birth: Date;
  skill_level?: string;
  special_requirements?: string;
  emergency_contact: EmergencyContact;
  insurance_info?: InsuranceInfo;
  created_at: Date;
  updated_at: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface InsuranceInfo {
  provider: string;
  policy_number: string;
  expiry_date: Date;
  coverage_amount?: number;
}

export interface BookingPriceSnapshot {
  id: number;
  booking_id: number;
  snapshot_data: {
    course_price: any;
    calculation_breakdown: PricingBreakdown;
    applied_discounts: AppliedDiscount[];
    extras: BookingExtra[];
    total_calculation: TotalCalculation;
    exchange_rate?: number;
    currency: string;
  };
  is_immutable: boolean;
  created_at: Date;
}

export interface PricingBreakdown {
  base_price: number;
  participant_count: number;
  subtotal: number;
  discount_amount: number;
  extras_total: number;
  tax_amount: number;
  total: number;
  currency: string;
}

export interface AppliedDiscount {
  id: number;
  type: DiscountType;
  name: string;
  description: string;
  amount: number;
  percentage?: number;
  voucher_code?: string;
  applied_at: Date;
}

export type DiscountType = 'percentage' | 'fixed_amount' | 'voucher' | 'loyalty' | 'early_bird' | 'group';

export interface BookingExtra {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  total: number;
  category: string;
  is_required: boolean;
}

export interface TotalCalculation {
  subtotal: number;
  total_discounts: number;
  total_extras: number;
  tax_rate: number;
  tax_amount: number;
  grand_total: number;
  currency: string;
  calculated_at: Date;
}

export interface BookingPayment {
  id: number;
  booking_id: number;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id?: string;
  gateway_response?: any;
  notes?: string;
  processed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'paypal' | 'stripe' | 'other';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';

export interface BookingCommunication {
  id: number;
  booking_id: number;
  type: CommunicationType;
  subject: string;
  content: string;
  recipient_email?: string;
  recipient_phone?: string;
  status: CommunicationStatus;
  sent_at?: Date;
  template_used?: string;
  created_by: number;
  created_at: Date;
}

export type CommunicationType = 'email' | 'sms' | 'internal_note' | 'system_notification';
export type CommunicationStatus = 'draft' | 'sent' | 'delivered' | 'failed' | 'bounced';

export interface BookingModification {
  id: number;
  booking_id: number;
  modification_type: ModificationType;
  original_data: any;
  new_data: any;
  reason: string;
  status: ModificationStatus;
  price_impact: number;
  requires_approval: boolean;
  approved_by?: number;
  approved_at?: Date;
  created_by: number;
  created_at: Date;
}

export type ModificationType = 'date_change' | 'participant_change' | 'course_change' | 'cancellation' | 'extras_change';
export type ModificationStatus = 'pending' | 'approved' | 'rejected' | 'applied';

export interface BookingMetadata {
  source: BookingSource;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  booking_channel: BookingChannel;
  special_requests?: string;
  internal_notes?: string;
  tags?: string[];
}

export type BookingSource = 'web' | 'mobile_app' | 'phone' | 'walk_in' | 'partner' | 'admin_panel';
export type BookingChannel = 'direct' | 'online' | 'iframe' | 'api' | 'manual';

export interface BookingFilter {
  season_id?: number;
  status?: BookingStatus[];
  date_from?: Date;
  date_to?: Date;
  course_id?: number;
  client_id?: number;
  search_term?: string;
  payment_status?: PaymentStatus[];
}

export interface BookingStats {
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  pending_payments: number;
  average_booking_value: number;
  conversion_rate: number;
  cancellation_rate: number;
}

export interface BookingWizardStep {
  step: number;
  title: string;
  component: string;
  is_completed: boolean;
  validation_errors?: string[];
  data?: any;
}

export interface BookingValidation {
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}