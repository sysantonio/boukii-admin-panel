export interface RentalItem {
  id: number;
  school_id: number;
  item_code: string;
  name: string;
  description: string;
  category: RentalCategory;
  specifications: ItemSpecifications;
  pricing: RentalPricing;
  availability: ItemAvailability;
  condition: ItemCondition;
  maintenance: MaintenanceInfo;
  location: ItemLocation;
  photos: ItemPhoto[];
  tags: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RentalCategory {
  id: number;
  name: string;
  description: string;
  parent_category_id?: number;
  subcategories: RentalCategory[];
  sort_order: number;
  is_active: boolean;
}

export interface ItemSpecifications {
  brand?: string;
  model?: string;
  size?: string;
  color?: string;
  weight?: number;
  dimensions?: ItemDimensions;
  material?: string;
  year_manufactured?: number;
  serial_number?: string;
  features: string[];
  compatibility: string[];
  age_range?: AgeRange;
  skill_level?: SkillLevel[];
}

export interface ItemDimensions {
  length?: number;
  width?: number;
  height?: number;
  diameter?: number;
  unit: 'cm' | 'inches' | 'mm';
}

export interface AgeRange {
  min_age?: number;
  max_age?: number;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface RentalPricing {
  season_id: number;
  pricing_type: PricingType;
  rates: RentalRate[];
  deposit_required: boolean;
  deposit_amount?: number;
  insurance_required: boolean;
  insurance_daily_rate?: number;
  late_return_fee_per_day: number;
  damage_assessment_rules: DamageRule[];
  discounts: RentalDiscount[];
}

export type PricingType = 'fixed' | 'tiered' | 'seasonal' | 'dynamic';

export interface RentalRate {
  id: number;
  duration_type: DurationType;
  duration_value: number;
  rate: number;
  currency: string;
  min_duration?: number;
  max_duration?: number;
  is_active: boolean;
}

export type DurationType = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'seasonal';

export interface DamageRule {
  damage_type: DamageType;
  damage_level: DamageLevel;
  charge_percentage: number;
  flat_fee?: number;
  description: string;
}

export type DamageType = 'wear_and_tear' | 'minor_damage' | 'major_damage' | 'total_loss' | 'missing_parts';
export type DamageLevel = 1 | 2 | 3 | 4 | 5;

export interface RentalDiscount {
  id: number;
  name: string;
  type: DiscountType;
  value: number;
  conditions: DiscountCondition;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
}

export type DiscountType = 'percentage' | 'fixed_amount' | 'free_days';

export interface DiscountCondition {
  min_rental_days?: number;
  min_items_count?: number;
  specific_items?: number[];
  client_loyalty_tier?: string[];
  booking_advance_days?: number;
  season_periods?: string[];
}

export interface ItemAvailability {
  total_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  maintenance_quantity: number;
  damaged_quantity: number;
  availability_calendar: AvailabilityDate[];
  booking_rules: RentalBookingRules;
}

export interface AvailabilityDate {
  date: Date;
  available_quantity: number;
  reserved_quantity: number;
  rate_override?: number;
  notes?: string;
}

export interface RentalBookingRules {
  advance_booking_days: number;
  max_rental_duration: number;
  min_rental_duration: number;
  checkout_time: string;
  return_time: string;
  late_return_grace_period_minutes: number;
  requires_pickup: boolean;
  requires_delivery: boolean;
  delivery_radius_km?: number;
  delivery_fee?: number;
}

export interface ItemCondition {
  current_condition: ConditionLevel;
  condition_history: ConditionHistoryEntry[];
  wear_level: WearLevel;
  last_inspection_date: Date;
  next_inspection_due: Date;
  replacement_due_date?: Date;
  estimated_remaining_life_months?: number;
}

export type ConditionLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'unusable';
export type WearLevel = 'new' | 'light' | 'moderate' | 'heavy' | 'end_of_life';

export interface ConditionHistoryEntry {
  id: number;
  assessment_date: Date;
  condition: ConditionLevel;
  wear_level: WearLevel;
  notes: string;
  photos: string[];
  assessed_by: number;
  actions_taken: string[];
}

export interface MaintenanceInfo {
  maintenance_schedule: MaintenanceSchedule;
  maintenance_history: MaintenanceRecord[];
  next_maintenance_due: Date;
  maintenance_cost_to_date: number;
  warranty_info: WarrantyInfo;
}

export interface MaintenanceSchedule {
  routine_maintenance_interval_days: number;
  deep_maintenance_interval_days: number;
  safety_inspection_interval_days: number;
  replacement_recommendation_months: number;
}

export interface MaintenanceRecord {
  id: number;
  maintenance_date: Date;
  maintenance_type: MaintenanceType;
  description: string;
  cost: number;
  parts_replaced: string[];
  performed_by: string;
  next_maintenance_date?: Date;
  before_photos: string[];
  after_photos: string[];
  notes: string;
}

export type MaintenanceType = 'routine' | 'repair' | 'deep_clean' | 'safety_check' | 'replacement' | 'upgrade';

export interface WarrantyInfo {
  has_warranty: boolean;
  warranty_provider?: string;
  warranty_start_date?: Date;
  warranty_end_date?: Date;
  warranty_terms?: string;
  warranty_contact?: string;
}

export interface ItemLocation {
  storage_location: string;
  section: string;
  shelf?: string;
  bin?: string;
  barcode?: string;
  qr_code?: string;
  gps_coordinates?: GPSCoordinates;
}

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

export interface ItemPhoto {
  id: number;
  url: string;
  caption?: string;
  is_primary: boolean;
  upload_date: Date;
  file_size: number;
}

export interface RentalBooking {
  id: number;
  school_id: number;
  season_id: number;
  booking_number: string;
  client_id: number;
  rental_items: RentalBookingItem[];
  rental_period: RentalPeriod;
  pricing_summary: RentalPricingSummary;
  delivery_info?: DeliveryInfo;
  status: RentalBookingStatus;
  payments: RentalPayment[];
  check_out: CheckOutInfo;
  check_in: CheckInInfo;
  notes: string;
  created_at: Date;
  updated_at: Date;
}

export interface RentalBookingItem {
  id: number;
  rental_item_id: number;
  quantity: number;
  daily_rate: number;
  total_days: number;
  subtotal: number;
  deposit_amount: number;
  insurance_amount: number;
  item_condition_at_checkout?: ConditionLevel;
  item_condition_at_return?: ConditionLevel;
  damage_charges?: number;
  rental_item?: RentalItem;
}

export interface RentalPeriod {
  start_date: Date;
  end_date: Date;
  checkout_time: string;
  return_time: string;
  actual_checkout_time?: string;
  actual_return_time?: string;
  total_days: number;
  is_extended: boolean;
  extension_history: RentalExtension[];
}

export interface RentalExtension {
  id: number;
  original_end_date: Date;
  new_end_date: Date;
  additional_days: number;
  additional_cost: number;
  extension_reason: string;
  approved_by: number;
  approved_at: Date;
}

export interface RentalPricingSummary {
  subtotal: number;
  total_deposit: number;
  total_insurance: number;
  delivery_fee: number;
  late_fees: number;
  damage_charges: number;
  discounts_applied: AppliedDiscount[];
  total_amount: number;
  currency: string;
}

export interface AppliedDiscount {
  discount_id: number;
  discount_name: string;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
}

export interface DeliveryInfo {
  requires_delivery: boolean;
  delivery_address: DeliveryAddress;
  delivery_date: Date;
  delivery_time_slot: string;
  delivery_fee: number;
  delivery_status: DeliveryStatus;
  delivery_notes?: string;
  requires_pickup: boolean;
  pickup_date?: Date;
  pickup_time_slot?: string;
  pickup_fee?: number;
  pickup_status?: DeliveryStatus;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  postal_code: string;
  province: string;
  country: string;
  special_instructions?: string;
  contact_phone: string;
}

export type DeliveryStatus = 'scheduled' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
export type RentalBookingStatus = 'pending' | 'confirmed' | 'checked_out' | 'active' | 'overdue' | 'returned' | 'completed' | 'cancelled';

export interface RentalPayment {
  id: number;
  rental_booking_id: number;
  payment_type: RentalPaymentType;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id?: string;
  payment_date?: Date;
  notes?: string;
}

export type RentalPaymentType = 'booking_fee' | 'deposit' | 'insurance' | 'rental_fee' | 'extension_fee' | 'late_fee' | 'damage_charge' | 'refund';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'paypal' | 'stripe';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';

export interface CheckOutInfo {
  checkout_date?: Date;
  checkout_time?: string;
  checked_out_by: number;
  items_condition: ItemCheckoutCondition[];
  customer_signature?: string;
  staff_signature?: string;
  checkout_photos: string[];
  checkout_notes?: string;
}

export interface ItemCheckoutCondition {
  rental_item_id: number;
  quantity: number;
  condition: ConditionLevel;
  damages_noted: string[];
  photos: string[];
  serial_numbers: string[];
}

export interface CheckInInfo {
  checkin_date?: Date;
  checkin_time?: string;
  checked_in_by: number;
  items_condition: ItemCheckinCondition[];
  late_return_minutes?: number;
  late_fees_applied?: number;
  damage_assessment: DamageAssessment;
  customer_signature?: string;
  staff_signature?: string;
  checkin_photos: string[];
  checkin_notes?: string;
}

export interface ItemCheckinCondition {
  rental_item_id: number;
  quantity_returned: number;
  condition: ConditionLevel;
  new_damages: string[];
  missing_parts: string[];
  photos: string[];
  damage_charges: number;
}

export interface DamageAssessment {
  total_damage_cost: number;
  damage_items: DamageItem[];
  assessment_notes: string;
  customer_acknowledged: boolean;
  dispute_raised: boolean;
}

export interface DamageItem {
  rental_item_id: number;
  damage_type: DamageType;
  damage_level: DamageLevel;
  description: string;
  estimated_cost: number;
  photos: string[];
}

export interface RentalWaitlist {
  id: number;
  client_id: number;
  rental_item_id: number;
  requested_start_date: Date;
  requested_end_date: Date;
  quantity_requested: number;
  priority_score: number;
  status: WaitlistStatus;
  created_at: Date;
  notified_at?: Date;
  expires_at: Date;
}

export type WaitlistStatus = 'waiting' | 'notified' | 'accepted' | 'declined' | 'expired';

export interface RentalStats {
  total_items: number;
  available_items: number;
  items_in_maintenance: number;
  active_rentals: number;
  overdue_rentals: number;
  total_revenue_current_season: number;
  utilization_rate: number;
  average_rental_duration: number;
  most_popular_items: PopularItem[];
}

export interface PopularItem {
  item_id: number;
  item_name: string;
  rental_count: number;
  revenue_generated: number;
  utilization_rate: number;
}