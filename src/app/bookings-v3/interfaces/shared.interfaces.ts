// ============= INTERFACES COMPARTIDAS =============

// Client Related Interfaces
export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  level: string;
  preferredLanguage: string;
  dateOfBirth?: Date;
  totalBookings: number;
  totalSpent: number;
  averageRating: number;
  loyaltyTier: string;
  lastBooking?: Date;
  createdAt: Date;
  tags: string[];
}

export interface ClientSuggestion {
  client: Client;
  matchScore: number;
  matchReasons: string[];
}

export interface Participant {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  age: number;
  level: string;
  phone?: string;
  email?: string;
  medicalInfo?: string;
  emergencyContact: EmergencyContact;
  equipmentNeeds: string[];
  specialRequirements?: string;
  isMinor: boolean;
  guardianId?: number;
}

export interface ParticipantValidation {
  participantId?: string;
  isValid: boolean;
  errors: any[];
  warnings: any[];
  suggestions?: any[];
  ageVerified?: boolean;
  medicalClearance?: boolean;
  equipmentCompatible?: boolean;
  levelAppropriate?: boolean;
  riskAssessment?: any;
}

export interface ScheduleOption {
  id: number;
  date?: Date;
  dates?: string[];
  timeSlot?: TimeSlot;
  timeSlots?: any[];
  available?: boolean;
  spotsLeft?: number;
  totalSpots?: number;
  price?: number;
  totalPrice?: number;
  monitor?: Monitor;
  weatherInfo?: WeatherInfo;
  weather?: any;
  difficulty?: 'low' | 'medium' | 'high';
  crowdLevel?: 'low' | 'medium' | 'high';
  recommendationScore?: number;
  score?: number;
  highlights?: string[];
  flexibility?: any;
}

export interface CalendarDay {
  date: Date;
  isAvailable: boolean;
  availableSlots: ScheduleOption[];
  minPrice: number;
  maxPrice: number;
  weatherScore: number;
  crowdLevel: 'low' | 'medium' | 'high';
  specialEvents?: string[];
  restrictions?: string[];
}

export interface PaymentPlan {
  id: string;
  name: string;
  type: 'full' | 'installments' | 'deposit';
  installments: number;
  firstPayment: number;
  remainingPayments: PaymentInstallment[];
  totalFees: number;
  totalAmount: number;
  description: string;
  features: string[];
  recommended: boolean;
}

export interface PaymentInstallment {
  amount: number;
  dueDate: Date;
  description: string;
}

export interface PromoCode {
  id?: number;
  code: string;
  isValid: boolean;
  type: 'percentage' | 'fixed' | 'bogo';
  value: number;
  description: string;
  minAmount?: number;
  maxDiscount?: number;
  validUntil?: Date;
  restrictions?: string[];
  applicableItems?: string[];
  usageCount?: number;
  maxUsage?: number;
  error?: string;
}

export interface ActivityBundle {
  id: number;
  name: string;
  description: string;
  courses: Course[];
  totalDuration: number;
  bundlePrice: number;
  individualPrice: number;
  savings: number;
  discountPercentage: number;
  isAvailable: boolean;
  validityPeriod: number; // days
  maxParticipants: number;
  restrictions: string[];
  includes: string[];
  excludes: string[];
}

// Entidades base
export interface TimeSlot {
  id: number;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  duration: number;  // minutes
  label: string;     // "Mañana", "Tarde", etc.
  type: 'morning' | 'afternoon' | 'evening' | 'full_day';
  isPeak: boolean;   // Horario pico
  priceMultiplier: number; // Multiplicador de precio
}

export interface Sport {
  id: number;
  name: string;
  slug: string;
  icon: string;
  category: 'winter' | 'summer' | 'water' | 'adventure';
  seasonDependent: boolean;
  weatherDependent: boolean;
  equipment: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  minAge: number;
  maxAge?: number;
  physicalRequirements: string[];
  popularityScore: number;
  averageRating: number;
}

export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timezone: string;
  facilities: string[];
  accessibility: AccessibilityInfo;
  images: string[];
  operatingHours: OperatingHours;
  contactInfo: ContactInfo;
}

export interface AccessibilityInfo {
  wheelchairAccessible: boolean;
  parkingAvailable: boolean;
  publicTransport: boolean;
  specialNeeds: string[];
}

export interface OperatingHours {
  [key: string]: { // 'monday', 'tuesday', etc.
    open: string;
    close: string;
    closed: boolean;
  };
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
  emergencyPhone?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  priority: 'primary' | 'secondary';
}

// Course and Activity Related
export interface Course {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  type: CourseType;
  sport: Sport;
  level: CourseLevel;
  duration: number; // en horas
  maxParticipants: number;
  minParticipants: number;
  basePrice: number;
  currency: string;
  images: string[];
  features: string[];
  requirements: string[];
  includes: string[];
  excludes: string[];
  cancellationPolicy: CancellationPolicy;
  weatherDependent: boolean;
  ageRestrictions: AgeRestriction;
  physicalRequirements: string[];
  equipment: EquipmentRequirement[];
  location: Location;
  rating: number;
  reviewCount: number;
  popularityScore: number;
  seasonality: SeasonalityInfo;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseLevel {
  id: number;
  name: string; // "Principiante", "Intermedio", "Avanzado", "Experto"
  slug: string;
  description: string;
  prerequisites: string[];
  icon: string;
  color: string;
  order: number;
}

export interface CourseType {
  id: number;
  name: string; // "Grupal", "Privado", "Semi-privado"
  slug: string;
  description: string;
  maxParticipants: number;
  minParticipants: number;
  priceMultiplier: number;
  icon: string;
  benefits: string[];
}

export interface CancellationPolicy {
  id: number;
  name: string;
  rules: CancellationRule[];
  refundPercentages: RefundPercentage[];
  exceptions: string[];
}

export interface CancellationRule {
  hoursBeforeStart: number;
  refundPercentage: number;
  fees: number;
  conditions: string[];
}

export interface RefundPercentage {
  timeframe: string; // "> 48h", "24-48h", "< 24h"
  percentage: number;
  processingFee: number;
}

export interface AgeRestriction {
  min?: number;
  max?: number;
  requiresGuardian: boolean;
  guardianAge?: number;
  exceptions: string[];
}

export interface EquipmentRequirement {
  id: number;
  name: string;
  type: 'required' | 'recommended' | 'optional';
  category: string;
  rentalAvailable: boolean;
  rentalPrice?: number;
  sizes: string[];
  description: string;
}

export interface SeasonalityInfo {
  peakSeason: DateRange[];
  lowSeason: DateRange[];
  closedDates: DateRange[];
  priceAdjustments: SeasonalPriceAdjustment[];
}

export interface DateRange {
  start: Date;
  end: Date;
  description?: string;
}

export interface SeasonalPriceAdjustment {
  season: 'peak' | 'high' | 'medium' | 'low';
  multiplier: number;
  description: string;
}

// Monitor Related
export interface Monitor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  employeeId: string;
  sports: Sport[];
  certifications: Certification[];
  experience: number; // años
  languages: Language[];
  specialties: string[];
  rating: number;
  reviewCount: number;
  availability: MonitorAvailability;
  pricing: MonitorPricing;
  workload: WorkloadInfo;
  personalityProfile: PersonalityProfile;
  clientFeedback: ClientFeedback[];
  location: Location;
  isActive: boolean;
  hireDate: Date;
  lastActivityDate: Date;
}

export interface Certification {
  id: number;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  level: string;
  verificationCode?: string;
  documentUrl?: string;
  isValid: boolean;
}

export interface Language {
  id: number;
  name: string;
  code: string; // "es", "en", "fr"
  nativeLevel: boolean;
  proficiencyLevel: 'basic' | 'intermediate' | 'advanced' | 'native';
}

export interface MonitorAvailability {
  weeklyHours: WeeklyHours;
  availableSlots: AvailabilitySlot[];
  unavailableDates: DateRange[];
  preferredSlots: TimeSlot[];
  blackoutDates: DateRange[];
  lastUpdated: Date;
}

export interface WeeklyHours {
  [key: string]: { // 'monday', 'tuesday', etc.
    available: boolean;
    startTime: string;
    endTime: string;
    maxHours: number;
  };
}

export interface AvailabilitySlot {
  date: Date;
  timeSlot: TimeSlot;
  status: 'available' | 'busy' | 'preferred' | 'unavailable';
  currentBookings: number;
  maxCapacity: number;
  fatigueLevel: number; // 0-1
  notes?: string;
}

export interface MonitorPricing {
  baseRate: number;
  currency: string;
  rateType: 'hourly' | 'daily' | 'per_session';
  premiumMultiplier: number; // Para horarios pico
  groupDiscountRates: GroupDiscountRate[];
  specialEventRate?: number;
  overtimeRate: number;
}

export interface GroupDiscountRate {
  minParticipants: number;
  maxParticipants: number;
  discountPercentage: number;
}

export interface WorkloadInfo {
  currentWeeklyHours: number;
  maxWeeklyHours: number;
  utilizationRate: number; // 0-1
  bookingsThisWeek: number;
  bookingsThisMonth: number;
  averageRating: number;
  fatigueScore: number; // 0-1
  performanceScore: number; // 0-1
  recommendedLoad: number;
}

export interface PersonalityProfile {
  traits: PersonalityTrait[];
  workingStyle: string[];
  clientTypes: string[]; // Tipos de cliente que mejor maneja
  strengths: string[];
  areas_for_improvement: string[];
  lastAssessment: Date;
}

export interface PersonalityTrait {
  name: string;
  score: number; // 0-1
  description: string;
}

export interface ClientFeedback {
  id: number;
  clientId: number;
  bookingId: number;
  rating: number; // 1-5
  comment: string;
  categories: FeedbackCategory[];
  date: Date;
  isVerified: boolean;
}

export interface FeedbackCategory {
  category: string; // "Profesionalismo", "Paciencia", "Conocimiento técnico"
  rating: number;
}

// Pricing and Financial
export interface PriceBreakdown {
  basePrice: number;
  participantCount?: number;
  pricePerParticipant?: number;
  subtotal: number;
  discounts: any[];
  addOns?: any[];
  extras?: ExtraItem[];
  taxes: any;
  insurance?: InsuranceItem[];
  fees?: FeeItem[];
  total: number;
  currency: string;
  calculatedAt?: Date;
  breakdown?: any;
  dynamicFactors?: any;
  validUntil?: Date;
  guaranteedPrice?: boolean;
}

export interface DiscountItem {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'bogo';
  value: number;
  amount: number;
  reason: string;
  code?: string;
  automatic: boolean;
}

export interface ExtraItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  total: number;
  optional: boolean;
  category: string;
}

export interface TaxItem {
  id: string;
  name: string;
  type: 'VAT' | 'service_tax' | 'local_tax';
  rate: number;
  amount: number;
  description: string;
}

export interface InsuranceItem {
  id: number;
  name: string;
  type: 'cancellation' | 'medical' | 'equipment';
  premium: number;
  coverage: number;
  description: string;
  optional: boolean;
}

export interface FeeItem {
  id: string;
  name: string;
  type: 'booking_fee' | 'processing_fee' | 'service_fee';
  amount: number;
  description: string;
  refundable: boolean;
}

export interface LivePriceCalculation {
  basePrice: number;
  finalPrice: number;
  discounts: DiscountItem[];
  surcharges: SurchargeItem[];
  breakdown: PriceBreakdown;
  lastCalculated: Date;
  isCalculating: boolean;
}

export interface SurchargeItem {
  id: string;
  name: string;
  type: 'peak_time' | 'last_minute' | 'high_demand' | 'weather_premium';
  amount: number;
  percentage?: number;
  reason: string;
  temporary: boolean;
}

// Weather and External Data
export interface WeatherInfo {
  date: Date;
  temperature: TemperatureInfo;
  conditions: string;
  description: string;
  windSpeed: number;
  windDirection: string;
  humidity: number;
  visibility: number;
  precipitation: number;
  skiConditions?: SkiConditions;
  suitabilityScore: number; // 0-1
  alerts: WeatherAlert[];
  lastUpdated: Date;
}

export interface TemperatureInfo {
  current: number;
  min: number;
  max: number;
  feelsLike: number;
  unit: 'celsius' | 'fahrenheit';
}

export interface SkiConditions {
  snowDepth: number;
  snowQuality: 'powder' | 'packed' | 'icy' | 'slushy';
  newSnowfall: number;
  pistesOpen: number;
  pistesTotal: number;
  liftsOperational: number;
  liftsTotal: number;
  avalancheRisk: number; // 1-5
  conditions: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface WeatherAlert {
  id: string;
  type: 'snow' | 'wind' | 'temperature' | 'visibility' | 'avalanche';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  affectedActivities: string[];
}

export interface WeatherForecast {
  date: Date;
  temperature: TemperatureInfo;
  conditions: string;
  windSpeed: number;
  visibility: number;
  skiConditions: SkiConditions;
  suitabilityScore: number;
  alerts: WeatherAlert[];
}

export interface WeatherConsideration {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  recommendation: string;
}

// Availability and Scheduling
export interface AvailabilityMatrix {
  courseId: number;
  dateRange: DateRange;
  slots: AvailabilitySlot[];
  constraints: AvailabilityConstraint[];
  alternativeOptions: AlternativeOption[];
  lastUpdated: Date;
}

export interface AvailabilityConstraint {
  type: 'weather' | 'capacity' | 'monitor' | 'resource' | 'policy';
  description: string;
  severity: 'blocking' | 'warning' | 'info';
  affectedSlots: string[];
  resolution?: string;
}

export interface AlternativeOption {
  type: 'date' | 'time' | 'course' | 'monitor';
  suggestion: any;
  reason: string;
  score: number;
  available: boolean;
}

export interface OptimalSlot {
  id: string;
  date: Date;
  timeSlot: TimeSlot;
  score: number;
  reasons: OptimizationReason[];
  monitor: Monitor;
  expectedWeather: WeatherInfo;
  crowdLevel: 'low' | 'medium' | 'high';
  priceAdvantage: number;
  availability: AvailabilityStatus;
}

export interface OptimizationReason {
  factor: 'weather' | 'price' | 'monitor' | 'crowd' | 'client_preference' | 'availability';
  impact: number; // -1 to 1
  description: string;
  weight: number;
}

export interface AvailabilityStatus {
  available: boolean;
  spotsLeft: number;
  totalSpots: number;
  waitingList: number;
  lastBooking: Date;
}

// Notifications and Communication
export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  channel: 'email' | 'sms' | 'push' | 'whatsapp';
  subject: string;
  content: string;
  variables: TemplateVariable[];
  language: string;
  customizable: boolean;
  category: string;
  isActive: boolean;
}

export interface TemplateVariable {
  key: string;
  name: string;
  description: string;
  required: boolean;
  defaultValue?: string;
  format?: 'text' | 'date' | 'currency' | 'number';
  validation?: string;
}

export enum NotificationType {
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_MODIFIED = 'booking_modified',
  BOOKING_CANCELLED = 'booking_cancelled',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',
  REMINDER_24H = 'reminder_24h',
  REMINDER_2H = 'reminder_2h',
  WEATHER_ALERT = 'weather_alert',
  SCHEDULE_CHANGE = 'schedule_change',
  MONITOR_CHANGE = 'monitor_change',
  PROMO_OFFER = 'promo_offer',
  BIRTHDAY_OFFER = 'birthday_offer',
  SEASON_START = 'season_start'
}

export interface CommunicationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  whatsapp: boolean;
  marketing: boolean;
  reminders: boolean;
  promotions: boolean;
  weatherAlerts: boolean;
  bookingUpdates: boolean;
  preferredLanguage: string;
  timezone: string;
}

// Validation and Errors
export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  code?: string;
  context?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationSuggestion[];
  score?: number;
}

export interface ValidationSuggestion {
  field: string;
  suggestion: string;
  action?: () => void;
  benefit: string;
}

// Analytics and Metrics
export interface BookingMetrics {
  // Tiempos
  createdToConfirmedTime: number; // minutos
  confirmationToStartTime: number;
  totalProcessingTime: number;
  
  // Actividad
  modificationsCount: number;
  communicationsCount: number;
  viewsCount: number;
  
  // Rendimiento
  clientEngagementScore: number; // 0-1
  profitMargin: number;
  revenuePerHour: number;
  
  // Calidad
  satisfactionScore?: number; // 1-5
  completionRate: number; // 0-1
  onTimeArrival: boolean;
  weatherImpact: boolean;
  
  // Comparativas
  performanceVsAverage: number; // -1 to 1
  seasonalPerformance: number;
  
  lastUpdated: Date;
}

export interface ClientMetrics {
  totalBookings: number;
  totalSpent: number;
  averageBookingValue: number;
  averageRating: number;
  cancellationRate: number;
  noShowRate: number;
  repeatBookingRate: number;
  referralCount: number;
  lifetimeValue: number;
  riskScore: number; // 0-1
  loyaltyScore: number; // 0-1
  lastBookingDate: Date;
  firstBookingDate: Date;
  preferredActivities: string[];
  seasonalActivity: SeasonalActivity[];
}

export interface SeasonalActivity {
  season: string;
  bookings: number;
  spending: number;
  activities: string[];
}

// Equipment and Resources
export interface EquipmentBooking {
  id: number;
  equipmentId: number;
  equipment: Equipment;
  quantity: number;
  size: string;
  condition: 'new' | 'good' | 'fair' | 'needs_maintenance';
  rentalPrice: number;
  notes?: string;
}

export interface Equipment {
  id: number;
  name: string;
  type: string;
  category: string;
  brand: string;
  model: string;
  sizes: string[];
  dailyRate: number;
  weeklyRate: number;
  purchaseDate: Date;
  condition: 'new' | 'good' | 'fair' | 'needs_maintenance' | 'retired';
  maintenanceHistory: MaintenanceRecord[];
  location: string;
  isAvailable: boolean;
  reservations: EquipmentReservation[];
}

export interface MaintenanceRecord {
  id: number;
  date: Date;
  type: 'routine' | 'repair' | 'safety_check';
  description: string;
  cost: number;
  performedBy: string;
  nextMaintenanceDate?: Date;
}

export interface EquipmentReservation {
  bookingId: number;
  startDate: Date;
  endDate: Date;
  status: 'reserved' | 'checked_out' | 'returned';
}

export interface EquipmentSize {
  type: string; // 'ski', 'boot', 'helmet'
  size: string;
  measurements?: any;
}

export interface EquipmentNeed {
  participantId: string;
  equipmentType: string;
  size: string;
  level: string;
  rentalCost: number;
  availability: boolean;
  alternatives: Equipment[];
}

export interface EquipmentAvailability {
  equipmentType: string;
  totalUnits: number;
  availableUnits: number;
  reservedUnits: number;
  maintenanceUnits: number;
  sizes: SizeAvailability[];
}

export interface SizeAvailability {
  size: string;
  available: number;
  total: number;
}

// Payment and Financial
export interface PaymentMethod {
  id: number;
  name: string;
  type: 'cash' | 'card' | 'transfer' | 'digital_wallet' | 'crypto';
  provider?: string;
  isDefault: boolean;
  isActive: boolean;
  processingFee: number;
  processingTime: string;
  supportedCurrencies: string[];
  minAmount?: number;
  maxAmount?: number;
}

export interface PaymentRecord {
  id: number;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  processedAt?: Date;
  failureReason?: string;
  refundAmount?: number;
  refundedAt?: Date;
  fees: number;
  netAmount: number;
}

export interface RefundRecord {
  id: number;
  originalPaymentId: number;
  amount: number;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  processedAt?: Date;
  processingFee: number;
  netRefund: number;
  method: 'original_payment' | 'credit' | 'voucher';
}

// Enums and Constants
export enum BookingStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  REFUNDED = 'refunded'
}

export enum BookingSource {
  WEBSITE = 'website',
  MOBILE_APP = 'mobile_app',
  ADMIN_PANEL = 'admin_panel',
  PHONE = 'phone',
  WALK_IN = 'walk_in',
  PARTNER = 'partner',
  SOCIAL_MEDIA = 'social_media',
  EMAIL_CAMPAIGN = 'email_campaign'
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Suggested Actions and Conflicts
export interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  type?: string;
  priority?: string;
  effort?: string;
  impact?: string;
  automatic?: boolean;
}

// Utility Types
export interface FilterOptions {
  [key: string]: any;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

export interface SearchOptions {
  query: string;
  fields: string[];
  fuzzy: boolean;
  filters?: FilterOptions;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  warnings?: string[];
  meta?: {
    pagination?: PaginationOptions;
    filters?: FilterOptions;
    sort?: SortOptions;
    timestamp: Date;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: {
    pagination: PaginationOptions & {
      hasNext: boolean;
      hasPrev: boolean;
      totalPages: number;
    };
    filters?: FilterOptions;
    sort?: SortOptions;
    timestamp: Date;
  };
}

// Configuration Types
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  features: {
    enableRealTimeUpdates: boolean;
    enableSmartSuggestions: boolean;
    enableWeatherIntegration: boolean;
    enableAdvancedAnalytics: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    animations: boolean;
    compactMode: boolean;
    language: string;
  };
  cache: {
    enabled: boolean;
    duration: number;
    maxSize: number;
  };
}

// Event Types for Real-time Updates
export interface BookingEvent {
  type: 'created' | 'updated' | 'cancelled' | 'completed' | 'status_changed';
  bookingId: number;
  data: any;
  timestamp: Date;
  source: string;
  userId?: number;
}

export interface AvailabilityEvent {
  type: 'slots_updated' | 'capacity_changed' | 'monitor_unavailable';
  courseId: number;
  affectedDates: Date[];
  data: any;
  timestamp: Date;
}

export interface SystemEvent {
  type: 'maintenance' | 'feature_update' | 'alert' | 'performance';
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  data?: any;
  timestamp: Date;
}