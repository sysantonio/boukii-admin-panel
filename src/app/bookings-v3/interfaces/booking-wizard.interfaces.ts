import { Observable } from 'rxjs';

// ============= INTERFACES BASE =============
export interface BaseWizardStep {
  stepNumber: number;
  stepTitle: string;
  isValid: boolean;
  isCompleted: boolean;
  validationErrors: ValidationError[];
  canProceed: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  code?: string;
}

// ============= PASO 1: CLIENTE + INTELIGENCIA =============
export interface SmartClientStep extends BaseWizardStep {
  // Búsqueda y selección
  clientSearch: string;
  selectedClient: Client | null;
  createNewClient: boolean;
  
  // Sugerencias
  suggestions: ClientSuggestion[];
  recentClients: Client[];
  favoriteClients: Client[];
  frequentClients: Client[];
  
  // Inteligencia del cliente
  clientPreferences: ClientPreferences | null;
  bookingHistory: BookingHistoryItem[];
  suggestedCourseTypes: CourseTypeSuggestion[];
  clientRisk: ClientRiskProfile;
  
  // Estados de carga
  isSearching: boolean;
  isLoadingPreferences: boolean;
  isLoadingHistory: boolean;
}

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto';
  preferredLanguage: string;
  dateOfBirth?: Date;
  emergencyContact?: EmergencyContact;
  medicalConditions?: string;
  createdAt: Date;
  lastBooking?: Date;
  totalBookings: number;
  totalSpent: number;
  averageRating: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  tags: string[];
}

export interface ClientSuggestion {
  client: Client;
  matchScore: number;
  matchReasons: string[];
  distance?: number; // Si hay geolocalización
}

export interface ClientPreferences {
  preferredSports: Sport[];
  preferredMonitors: Monitor[];
  preferredTimeSlots: TimeSlot[];
  preferredGroupSize: number;
  budgetRange: { min: number; max: number };
  specialRequests: string[];
  communicationPreferences: CommunicationPreference[];
  paymentPreferences: PaymentMethod[];
  cancellationInsurance: boolean;
  equipmentRental: boolean;
}

export interface BookingHistoryItem {
  id: number;
  courseType: string;
  courseName: string;
  date: Date;
  status: BookingStatus;
  amount: number;
  rating?: number;
  feedback?: string;
  monitor: Monitor;
  completionRate: number;
}

export interface CourseTypeSuggestion {
  courseType: CourseType;
  confidence: number;
  reason: string;
  previousExperience: boolean;
  recommendedLevel: string;
}

export interface ClientRiskProfile {
  riskLevel: 'Low' | 'Medium' | 'High';
  cancellationRate: number;
  noShowRate: number;
  paymentDelayRate: number;
  riskFactors: string[];
  mitigation: string[];
}

// ============= PASO 2: ACTIVIDAD + DISPONIBILIDAD =============
export interface SmartActivityStep extends BaseWizardStep {
  // Selección básica
  activityType: 'course' | 'activity' | 'material';
  selectedCourse: Course | null;
  availableCourses: Course[];
  courseFilters: CourseFilters;
  
  // Disponibilidad inteligente
  realTimeAvailability: AvailabilityMatrix;
  recommendedCourses: CourseRecommendation[];
  conflictDetection: ConflictAlert[];
  priceCalculation: LivePriceCalculation;
  
  // Estados
  isLoadingCourses: boolean;
  isCheckingAvailability: boolean;
  lastAvailabilityCheck: Date;
}

export interface Course {
  id: number;
  name: string;
  description: string;
  type: CourseType;
  sport: Sport;
  level: string;
  duration: number; // en horas
  maxParticipants: number;
  minParticipants: number;
  basePrice: number;
  images: string[];
  features: string[];
  requirements: string[];
  includes: string[];
  excludes: string[];
  cancellationPolicy: string;
  weatherDependent: boolean;
  ageRestrictions: { min?: number; max?: number };
  physicalRequirements: string[];
  equipment: EquipmentRequirement[];
  location: Location;
  rating: number;
  reviewCount: number;
  popularityScore: number;
  seasonality: SeasonalityInfo;
}

export interface CourseRecommendation {
  course: Course;
  score: number;
  reasons: RecommendationReason[];
  availability: AvailabilityStatus;
  priceComparison: PriceComparison;
  clientFit: ClientFitScore;
}

export interface RecommendationReason {
  type: 'history' | 'preference' | 'level' | 'budget' | 'availability' | 'weather' | 'promotion';
  description: string;
  weight: number;
}

export interface AvailabilityMatrix {
  courseId: number;
  dateRange: { start: Date; end: Date };
  slots: AvailabilitySlot[];
  constraints: AvailabilityConstraint[];
  alternativeOptions: AlternativeOption[];
}

export interface AvailabilitySlot {
  date: Date;
  timeSlot: TimeSlot;
  availableSpots: number;
  totalSpots: number;
  status: 'available' | 'limited' | 'full' | 'unavailable';
  monitor: Monitor | null;
  price: number;
  dynamicPricing: boolean;
  weatherForecast?: WeatherInfo;
  demandLevel: 'low' | 'medium' | 'high';
  conflictsWith: ConflictInfo[];
}

export interface ConflictAlert {
  type: 'schedule' | 'monitor' | 'client' | 'resource' | 'weather';
  severity: 'info' | 'warning' | 'error';
  message: string;
  affectedElements: string[];
  suggestedActions: SuggestedAction[];
  autoResolvable: boolean;
}

// ============= PASO 3: FECHAS + CALENDARIO INTELIGENTE =============
export interface SmartScheduleStep extends BaseWizardStep {
  // Selección de fechas
  selectedDates: Date[];
  availableSlots: TimeSlot[];
  calendarView: 'month' | 'week' | 'list';
  
  // Inteligencia de horarios
  optimalSlots: OptimalSlot[];
  weatherIntegration: WeatherForecast[];
  monitorAvailability: MonitorAvailabilityMap;
  conflictPrevention: ScheduleConflict[];
  
  // Configuración avanzada
  recurringBooking: RecurringConfig | null;
  flexibleDates: FlexibleDateConfig | null;
  multiDateBooking: boolean;
  
  // Estados
  isLoadingCalendar: boolean;
  isCheckingWeather: boolean;
  calendarConstraints: CalendarConstraint[];
}

export interface OptimalSlot {
  date: Date;
  timeSlot: TimeSlot;
  score: number;
  reasons: OptimizationReason[];
  monitor: Monitor;
  expectedWeather: WeatherInfo;
  crowdLevel: 'low' | 'medium' | 'high';
  priceAdvantage: number;
}

export interface OptimizationReason {
  factor: 'weather' | 'price' | 'monitor' | 'crowd' | 'client_preference' | 'availability';
  impact: number;
  description: string;
}

export interface WeatherForecast {
  date: Date;
  temperature: { min: number; max: number };
  conditions: string;
  windSpeed: number;
  visibility: number;
  skiConditions: SkiConditions;
  suitabilityScore: number;
  alerts: WeatherAlert[];
}

export interface SkiConditions {
  snowDepth: number;
  snowQuality: string;
  pistesOpen: number;
  pistesTotal: number;
  liftsOperational: number;
  avalancheRisk: number;
}

export interface MonitorAvailabilityMap {
  [monitorId: number]: {
    monitor: Monitor;
    availability: MonitorAvailabilitySlot[];
    workloadScore: number;
    preferenceMatch: number;
  };
}

export interface MonitorAvailabilitySlot {
  date: Date;
  timeSlot: TimeSlot;
  status: 'available' | 'busy' | 'preferred' | 'unavailable';
  currentBookings: number;
  maxCapacity: number;
  fatigueLevel: number;
}

// ============= PASO 4: MONITOR + ASIGNACIÓN AUTOMÁTICA =============
export interface SmartMonitorStep extends BaseWizardStep {
  // Selección de monitor
  availableMonitors: Monitor[];
  selectedMonitor: Monitor | null;
  monitorFilters: MonitorFilters;
  
  // Recomendaciones inteligentes
  recommendedMonitors: MonitorRecommendation[];
  autoAssignment: boolean;
  monitorWorkload: WorkloadMetrics[];
  clientMonitorHistory: MonitorClientHistory[];
  
  // Estados
  isLoadingMonitors: boolean;
  isAnalyzingFit: boolean;
}

export interface Monitor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  sports: Sport[];
  certifications: Certification[];
  experience: number; // años
  languages: string[];
  specialties: string[];
  rating: number;
  reviewCount: number;
  availability: MonitorAvailability;
  pricing: MonitorPricing;
  workload: WorkloadInfo;
  personalityProfile: PersonalityProfile;
  clientFeedback: ClientFeedback[];
}

export interface MonitorRecommendation {
  monitor: Monitor;
  score: number;
  matchFactors: MatchFactor[];
  availability: AvailabilityStatus;
  clientCompatibility: CompatibilityScore;
  priceImpact: number;
  workloadImpact: WorkloadImpact;
}

export interface MatchFactor {
  type: 'experience' | 'specialty' | 'language' | 'personality' | 'history' | 'availability' | 'price';
  score: number;
  description: string;
  weight: number;
}

export interface WorkloadMetrics {
  monitorId: number;
  currentBookings: number;
  maxCapacity: number;
  utilizationRate: number;
  fatigueScore: number;
  performanceImpact: number;
  recommendedLoad: number;
}

// ============= PASO 5: PARTICIPANTES + GESTIÓN DINÁMICA =============
export interface SmartParticipantsStep extends BaseWizardStep {
  // Participantes
  participants: Participant[];
  maxParticipants: number;
  minParticipants: number;
  
  // Gestión avanzada
  familyGrouping: FamilyGroup[];
  ageGroupValidation: AgeGroupRule[];
  equipmentNeeds: EquipmentNeed[];
  insuranceOptions: InsuranceOption[];
  
  // Descuentos y validaciones
  groupDiscounts: DiscountCalculation[];
  participantValidations: ParticipantValidation[];
  
  // Estados
  isValidatingParticipants: boolean;
  isCalculatingDiscounts: boolean;
}

export interface Participant {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  age: number;
  level: string;
  specialRequests?: string;
  medicalConditions?: string;
  emergencyContact: EmergencyContact;
  equipmentSize?: EquipmentSize;
  insuranceOptIn: boolean;
  waiverSigned: boolean;
  clientId?: number; // Si es cliente existente
  isMainContact: boolean;
}

export interface FamilyGroup {
  id: string;
  name: string;
  participants: Participant[];
  discountEligible: boolean;
  discountAmount: number;
  specialConditions: string[];
}

export interface AgeGroupRule {
  name: string;
  minAge: number;
  maxAge: number;
  requirements: string[];
  restrictions: string[];
  supervisorRequired: boolean;
}

export interface EquipmentNeed {
  participantId: string;
  equipmentType: string;
  size: string;
  level: string;
  rentalCost: number;
  availability: boolean;
}

// ============= PASO 6: PRICING + CONFIRMACIÓN INTELIGENTE =============
export interface SmartPricingStep extends BaseWizardStep {
  // Pricing básico
  basePricing: PriceBreakdown;
  appliedDiscounts: AppliedDiscount[];
  extras: ExtraService[];
  paymentOptions: PaymentOption[];
  
  // Pricing inteligente
  dynamicPricing: DynamicPriceCalculation;
  promotionalOffers: PromotionalOffer[];
  paymentPlans: PaymentPlan[];
  revenueOptimization: RevenueOptimization;
  
  // Confirmación
  finalPrice: number;
  paymentMethod: PaymentMethod | null;
  termsAccepted: boolean;
  
  // Estados
  isCalculatingPrice: boolean;
  isProcessingPayment: boolean;
}

export interface PriceBreakdown {
  basePrice: number;
  participantCount: number;
  pricePerParticipant: number;
  subtotal: number;
  discounts: DiscountItem[];
  extras: ExtraItem[];
  taxes: TaxItem[];
  insurance: InsuranceItem[];
  total: number;
  currency: string;
}

export interface DynamicPriceCalculation {
  basePricing: PriceBreakdown;
  demandMultiplier: number;
  seasonalAdjustment: number;
  weatherImpact: number;
  lastMinuteDiscount: number;
  earlyBirdDiscount: number;
  loyaltyDiscount: number;
  groupDiscount: number;
  finalMultiplier: number;
  reasonsForAdjustment: PriceAdjustmentReason[];
}

export interface PromotionalOffer {
  id: number;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'upgrade';
  value: number;
  conditions: OfferCondition[];
  validUntil: Date | null;
  autoApply: boolean;
  priority: number;
  impact: number;
}

export interface PaymentPlan {
  id: number;
  name: string;
  description: string;
  installments: number;
  interestRate: number;
  firstPayment: number;
  installmentAmount: number;
  eligibility: PaymentPlanEligibility;
  benefits: string[];
}

// ============= INTERFACES INCOMPLETAS - COMPLETANDO =============

// Informaci\u00f3n de temporada
export interface SeasonalityInfo {
  peak: SeasonPeriod[];
  low: SeasonPeriod[];
  closed: SeasonPeriod[];
  specialOffers: SeasonalOffer[];
  capacityAdjustments: CapacityAdjustment[];
  priceMultipliers: SeasonalPriceMultiplier[];
}

export interface SeasonPeriod {
  start: Date;
  end: Date;
  name: string;
  demandLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  priceAdjustment: number;
  description?: string;
}

export interface SeasonalOffer {
  id: number;
  name: string;
  description: string;
  validFrom: Date;
  validTo: Date;
  discount: number;
  conditions: string[];
  applicableCourses: number[];
}

export interface CapacityAdjustment {
  period: SeasonPeriod;
  adjustmentFactor: number;
  reason: string;
}

export interface SeasonalPriceMultiplier {
  period: SeasonPeriod;
  multiplier: number;
  courseTypes: CourseType[];
}

// Requerimientos de equipamiento
export interface EquipmentRequirement {
  id: number;
  name: string;
  type: EquipmentType;
  category: EquipmentCategory;
  isRequired: boolean;
  rentalAvailable: boolean;
  rentalPrice?: number;
  sizes: EquipmentSize[];
  ageRestrictions?: { min?: number; max?: number };
  levelRestrictions?: string[];
  description: string;
  safetyInstructions?: string[];
  maintenanceInfo?: string;
}

export enum EquipmentType {
  SKIS = 'skis',
  BOOTS = 'boots',
  POLES = 'poles',
  HELMET = 'helmet',
  GOGGLES = 'goggles',
  SNOWBOARD = 'snowboard',
  BINDINGS = 'bindings',
  CLOTHING = 'clothing',
  PROTECTION = 'protection'
}

export enum EquipmentCategory {
  SAFETY = 'safety',
  PERFORMANCE = 'performance',
  COMFORT = 'comfort',
  OPTIONAL = 'optional'
}

export interface EquipmentSize {
  size: string;
  measurements: {
    length?: number;
    width?: number;
    weight?: number;
  };
  recommendedFor: {
    height?: { min: number; max: number };
    weight?: { min: number; max: number };
    shoeSize?: { min: number; max: number };
    age?: { min: number; max: number };
  };
  availability: number;
}

// Preferencias de comunicaci\u00f3n
export interface CommunicationPreference {
  channel: CommunicationChannel;
  enabled: boolean;
  timing: CommunicationTiming;
  language: string;
  frequency: CommunicationFrequency;
  optOut: boolean;
  customizations: {
    includeWeather: boolean;
    includeTips: boolean;
    includeOffers: boolean;
    includeReminders: boolean;
  };
}

export enum CommunicationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
  PHONE = 'phone',
  POST = 'post'
}

export interface CommunicationTiming {
  bookingConfirmation: boolean;
  dayBefore: boolean;
  hourBefore: boolean;
  afterCompletion: boolean;
  promotional: boolean;
  businessHoursOnly: boolean;
  timezone: string;
}

export enum CommunicationFrequency {
  IMMEDIATE = 'immediate',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  NEVER = 'never'
}

// M\u00e9todos de pago completos
export interface PaymentMethod {
  id: number;
  name: string;
  type: PaymentType;
  provider: string;
  isDefault: boolean;
  fees: PaymentFee[];
  limits: PaymentLimits;
  acceptedCurrencies: string[];
  processingTime: string;
  securityFeatures: SecurityFeature[];
  availability: PaymentAvailability;
  icon?: string;
  description?: string;
}

export enum PaymentType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  BIZUM = 'bizum',
  CASH = 'cash',
  INSTALLMENTS = 'installments'
}

export interface PaymentFee {
  type: 'percentage' | 'fixed';
  amount: number;
  description: string;
  conditions?: string[];
}

export interface PaymentLimits {
  min: number;
  max: number;
  daily?: number;
  monthly?: number;
}

export interface SecurityFeature {
  name: string;
  description: string;
  enabled: boolean;
}

export interface PaymentAvailability {
  countries: string[];
  excludedCountries?: string[];
  businessHours?: boolean;
  maintenance?: MaintenanceWindow[];
}

export interface MaintenanceWindow {
  start: Date;
  end: Date;
  description: string;
}

// Informaci\u00f3n meteorol\u00f3gica completa
export interface WeatherInfo {
  timestamp: Date;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  uvIndex: number;
  conditions: WeatherCondition;
  precipitation: Precipitation;
  alerts: WeatherAlert[];
  skiingConditions: SkiingConditions;
  suitabilityScore: number;
  recommendation: WeatherRecommendation;
}

export interface WeatherCondition {
  main: string;
  description: string;
  icon: string;
  code: number;
}

export interface Precipitation {
  type: 'none' | 'rain' | 'snow' | 'sleet';
  intensity: 'light' | 'moderate' | 'heavy';
  probability: number;
  amount: number;
}

export interface WeatherAlert {
  id: string;
  type: 'warning' | 'watch' | 'advisory';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  areas: string[];
}

export interface SkiingConditions {
  snowDepth: number;
  snowType: 'powder' | 'packed' | 'crud' | 'ice' | 'slush';
  snowQuality: number; // 1-10
  temperature: number;
  windChill: number;
  visibility: number;
  avalancheRisk: AvalancheRisk;
  pisteConditions: PisteCondition[];
}

export interface AvalancheRisk {
  level: 1 | 2 | 3 | 4 | 5;
  description: string;
  areas: string[];
  advisory: string;
}

export interface PisteCondition {
  name: string;
  status: 'open' | 'closed' | 'limited';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  lastUpdated: Date;
}

export interface WeatherRecommendation {
  recommended: boolean;
  score: number;
  reasons: string[];
  alternatives?: string[];
  bestTimeOfDay?: string;
}

// Informaci\u00f3n de conflictos completa
export interface ConflictInfo {
  id: string;
  type: ConflictType;
  description: string;
  severity: ConflictSeverity;
  affectedBookings: number[];
  resolutionOptions: ConflictResolution[];
  autoResolvable: boolean;
  estimatedImpact: ConflictImpact;
}

export enum ConflictType {
  SCHEDULE_OVERLAP = 'schedule_overlap',
  MONITOR_UNAVAILABLE = 'monitor_unavailable',
  CAPACITY_EXCEEDED = 'capacity_exceeded',
  RESOURCE_CONFLICT = 'resource_conflict',
  WEATHER_RESTRICTION = 'weather_restriction',
  MAINTENANCE = 'maintenance',
  HOLIDAY_CLOSURE = 'holiday_closure'
}

export enum ConflictSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ConflictResolution {
  id: string;
  name: string;
  description: string;
  automatic: boolean;
  costImpact: number;
  timeImpact: number;
  clientImpact: number;
  feasibility: number;
  steps: ResolutionStep[];
}

export interface ResolutionStep {
  order: number;
  description: string;
  automatic: boolean;
  duration: number;
  dependencies?: string[];
}

export interface ConflictImpact {
  financial: number;
  operational: number;
  clientSatisfaction: number;
  reputation: number;
  description: string;
}

// Acciones sugeridas completas
export interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  type: ActionType;
  priority: ActionPriority;
  effort: ActionEffort;
  impact: ActionImpact;
  automatic: boolean;
  parameters?: { [key: string]: any };
  prerequisites?: string[];
  consequences?: ActionConsequence[];
}

export enum ActionType {
  RESCHEDULE = 'reschedule',
  REASSIGN_MONITOR = 'reassign_monitor',
  CHANGE_COURSE = 'change_course',
  SPLIT_GROUP = 'split_group',
  UPGRADE = 'upgrade',
  DISCOUNT = 'discount',
  CANCEL = 'cancel',
  WAITLIST = 'waitlist'
}

export enum ActionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ActionEffort {
  MINIMAL = 'minimal',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export interface ActionImpact {
  client: number;
  business: number;
  operations: number;
  description: string;
}

export interface ActionConsequence {
  type: 'positive' | 'negative' | 'neutral';
  description: string;
  likelihood: number;
  severity: number;
}

// C\u00e1lculo de precios en vivo
export interface LivePriceCalculation {
  courseId: number;
  basePrice: number;
  currentPrice: number;
  factors: PricingFactor[];
  discount: DiscountInfo;
  surge: SurgeInfo;
  comparison: PriceComparison;
  history: PriceHistory[];
  forecast: PriceForecast;
  lastUpdated: Date;
}

export interface PricingFactor {
  name: string;
  type: 'multiplier' | 'addition' | 'subtraction';
  value: number;
  impact: number;
  description: string;
  category: 'demand' | 'season' | 'weather' | 'time' | 'promotion' | 'capacity';
}

export interface DiscountInfo {
  available: boolean;
  amount: number;
  type: 'percentage' | 'fixed';
  reason: string;
  conditions: string[];
  expiresAt?: Date;
}

export interface SurgeInfo {
  active: boolean;
  multiplier: number;
  reason: string;
  estimatedDuration: number;
  peakTime?: Date;
}

export interface PriceComparison {
  yesterday: number;
  lastWeek: number;
  lastMonth: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
}

export interface PriceHistory {
  date: Date;
  price: number;
  factors: string[];
}

export interface PriceForecast {
  nextHour: number;
  nextDay: number;
  nextWeek: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

// Estados de disponibilidad completos
export interface AvailabilityStatus {
  status: 'available' | 'limited' | 'full' | 'unavailable';
  spotsLeft: number;
  totalSpots: number;
  waitingList: number;
  lastUpdated: Date;
  estimatedAvailability?: Date;
  alternatives: AlternativeAvailability[];
}

export interface AlternativeAvailability {
  type: 'time' | 'date' | 'course' | 'monitor';
  description: string;
  availability: AvailabilityStatus;
  priceDifference: number;
  effort: 'none' | 'minimal' | 'moderate' | 'significant';
}

// Coincidencia de cliente completa
export interface ClientFitScore {
  overall: number;
  factors: FitFactor[];
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

export interface FitFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
  category: 'experience' | 'preference' | 'physical' | 'schedule' | 'budget';
}

// Interfaces adicionales que faltaban
export interface CourseFilters {
  sports: number[];
  levels: string[];
  types: CourseType[];
  priceRange: { min: number; max: number };
  duration: { min: number; max: number };
  timeSlots: number[];
  monitors: number[];
  features: string[];
  locations: number[];
  availability: AvailabilityFilterOptions;
  weather: WeatherFilterOptions;
  ratings: { min: number };
}

export interface AvailabilityFilterOptions {
  onlyAvailable: boolean;
  includeWaitlist: boolean;
  flexibleDates: boolean;
  dateRange: { start: Date; end: Date };
}

export interface WeatherFilterOptions {
  minimumConditions: number;
  excludeBadWeather: boolean;
  preferredConditions: string[];
}

export interface AvailabilityConstraint {
  type: 'time' | 'capacity' | 'monitor' | 'resource' | 'policy' | 'weather';
  description: string;
  severity: 'blocking' | 'warning' | 'info';
  affectedSlots: Date[];
  workaround?: string;
  automaticResolution?: boolean;
}

export interface AlternativeOption {
  type: 'date' | 'time' | 'course' | 'monitor' | 'package';
  description: string;
  option: any;
  benefits: string[];
  drawbacks: string[];
  priceDifference: number;
  availabilityImprovement: number;
  effortRequired: 'none' | 'minimal' | 'moderate' | 'significant';
  recommendationScore: number;
}

export interface RecurringConfig {
  enabled: boolean;
  pattern: RecurringPattern;
  frequency: RecurringFrequency;
  endCondition: RecurringEndCondition;
  exceptions: Date[];
  priceAgreement: RecurringPriceAgreement;
  autoConfirm: boolean;
  allowModifications: boolean;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  customRules?: string[];
}

export interface RecurringFrequency {
  value: number;
  unit: 'days' | 'weeks' | 'months';
  maxOccurrences?: number;
}

export interface RecurringEndCondition {
  type: 'never' | 'after_occurrences' | 'on_date';
  value?: number | Date;
}

export interface RecurringPriceAgreement {
  type: 'fixed' | 'market' | 'discount';
  value?: number;
  discountPercentage?: number;
  priceProtection: boolean;
}

export interface FlexibleDateConfig {
  enabled: boolean;
  flexibilityWindow: number; // d\u00edas
  preferredDates: Date[];
  excludedDates: Date[];
  priorities: DatePriority[];
  automaticSelection: boolean;
  notificationPreferences: FlexibleDateNotifications;
}

export interface DatePriority {
  date: Date;
  priority: number;
  reason: string;
}

export interface FlexibleDateNotifications {
  onBetterOptionAvailable: boolean;
  onPriceChange: boolean;
  onCapacityChange: boolean;
  advanceNotice: number; // horas
}

export interface ScheduleConflict {
  id: string;
  type: ConflictType;
  description: string;
  affectedSlots: TimeSlot[];
  severity: ConflictSeverity;
  resolutionOptions: ConflictResolution[];
  impact: ConflictImpact;
  autoResolvable: boolean;
  deadline?: Date;
}

export interface CalendarConstraint {
  type: 'blackout' | 'maintenance' | 'holiday' | 'weather' | 'capacity' | 'monitor';
  startDate: Date;
  endDate: Date;
  description: string;
  severity: 'info' | 'warning' | 'error';
  affectedCourses: number[];
  workaround?: string;
  recurring?: RecurringPattern;
}

// Interfaces adicionales de monitor
export interface MonitorFilters {
  sports: number[];
  experience: { min: number; max: number };
  languages: string[];
  specialties: string[];
  rating: { min: number };
  availability: MonitorAvailabilityFilter;
  pricing: { max: number };
  certifications: string[];
}

export interface MonitorAvailabilityFilter {
  dateRange: { start: Date; end: Date };
  timeSlots: number[];
  workloadPreference: 'light' | 'normal' | 'heavy';
}

export interface Certification {
  id: number;
  name: string;
  authority: string;
  level: string;
  expiryDate?: Date;
  verified: boolean;
}

export interface MonitorAvailability {
  schedule: MonitorScheduleSlot[];
  exceptions: MonitorException[];
  preferences: MonitorPreferences;
  constraints: MonitorConstraint[];
}

export interface MonitorScheduleSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxBookings: number;
  preferredCapacity: number;
}

export interface MonitorException {
  date: Date;
  type: 'unavailable' | 'limited' | 'preferred';
  reason: string;
  alternativeMonitor?: number;
}

export interface MonitorPreferences {
  preferredSports: number[];
  preferredLevels: string[];
  preferredGroupSizes: { min: number; max: number };
  workingHours: { start: string; end: string };
  breakDuration: number;
  maxConsecutiveHours: number;
}

export interface MonitorConstraint {
  type: 'certification' | 'experience' | 'physical' | 'language' | 'equipment';
  description: string;
  enforced: boolean;
  workaround?: string;
}

export interface MonitorPricing {
  hourlyRate: number;
  premiumRate?: number;
  groupDiscount?: number;
  seasonalAdjustment: SeasonalPriceMultiplier[];
  specialRates: SpecialRate[];
}

export interface SpecialRate {
  type: 'holiday' | 'weekend' | 'evening' | 'competition';
  multiplier: number;
  description: string;
}

export interface WorkloadInfo {
  currentBookings: number;
  maxCapacity: number;
  utilizationRate: number;
  fatigueLevel: number;
  performanceScore: number;
  optimalLoad: number;
  warnings: WorkloadWarning[];
}

export interface WorkloadWarning {
  type: 'overload' | 'underutilized' | 'fatigue' | 'quality_risk';
  message: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface PersonalityProfile {
  teachingStyle: string[];
  communicationStyle: string;
  patientLevel: number;
  energyLevel: number;
  adaptability: number;
  specializations: string[];
  clientTypes: string[];
}

export interface ClientFeedback {
  id: number;
  clientId: number;
  rating: number;
  comment: string;
  date: Date;
  verified: boolean;
  categories: FeedbackCategory[];
}

export interface FeedbackCategory {
  name: string;
  rating: number;
  weight: number;
}

export interface CompatibilityScore {
  overall: number;
  teaching: number;
  communication: number;
  personality: number;
  experience: number;
  factors: CompatibilityFactor[];
}

export interface CompatibilityFactor {
  name: string;
  score: number;
  importance: number;
  description: string;
}

export interface WorkloadImpact {
  current: number;
  projected: number;
  change: number;
  recommendation: string;
  risks: string[];
}

export interface MonitorClientHistory {
  monitorId: number;
  clientId: number;
  previousBookings: number;
  averageRating: number;
  lastBooking: Date;
  compatibility: number;
  notes: string[];
}

// Interfaces de participantes y validaci\u00f3n
export interface ParticipantValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationSuggestion[];
  riskAssessment: RiskAssessment;
}

export interface ValidationSuggestion {
  field: string;
  message: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
}

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high';
  factors: RiskFactor[];
  recommendations: string[];
  requiresApproval: boolean;
}

export interface RiskFactor {
  type: 'age' | 'medical' | 'experience' | 'physical' | 'environmental';
  description: string;
  severity: number;
  mitigation: string;
}

export interface InsuranceOption {
  id: number;
  name: string;
  description: string;
  coverage: InsuranceCoverage[];
  cost: number;
  mandatory: boolean;
  eligibility: InsuranceEligibility;
  terms: string;
}

export interface InsuranceCoverage {
  type: 'accident' | 'cancellation' | 'equipment' | 'medical';
  description: string;
  limit: number;
  deductible: number;
  exclusions: string[];
}

export interface InsuranceEligibility {
  ageRange: { min: number; max: number };
  activityTypes: string[];
  riskLevels: string[];
  preExistingConditions: boolean;
}

// Interfaces de descuentos y precios
export interface DiscountCalculation {
  type: 'group' | 'family' | 'early_bird' | 'loyalty' | 'seasonal' | 'promotional';
  name: string;
  description: string;
  amount: number;
  percentage?: number;
  conditions: DiscountCondition[];
  eligibility: DiscountEligibility;
  stackable: boolean;
  priority: number;
}

export interface DiscountCondition {
  type: 'quantity' | 'age' | 'date' | 'membership' | 'booking_window';
  operator: 'equals' | 'greater_than' | 'less_than' | 'between';
  value: any;
  description: string;
}

export interface DiscountEligibility {
  clientTypes: string[];
  bookingTypes: string[];
  courseTypes: CourseType[];
  minimumAmount?: number;
  maximumDiscount?: number;
}

export interface DiscountItem {
  id: number;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
  description: string;
}

export interface ExtraItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
  optional: boolean;
}

export interface TaxItem {
  name: string;
  rate: number;
  amount: number;
  type: 'inclusive' | 'exclusive';
}

export interface InsuranceItem {
  id: number;
  name: string;
  cost: number;
  coverage: string;
  mandatory: boolean;
}

export interface AppliedDiscount {
  discount: DiscountCalculation;
  appliedAmount: number;
  reason: string;
  automatic: boolean;
}

export interface ExtraService {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  required: boolean;
  popular: boolean;
  availability: ServiceAvailability;
}

export interface ServiceAvailability {
  available: boolean;
  limitedQuantity?: number;
  seasonalRestrictions?: SeasonPeriod[];
  conditions?: string[];
}

export interface PaymentOption {
  method: PaymentMethod;
  plan: PaymentPlan;
  fees: number;
  processingTime: string;
  recommended: boolean;
}

export interface RevenueOptimization {
  currentRevenue: number;
  optimizedRevenue: number;
  improvement: number;
  suggestions: OptimizationSuggestion[];
  risks: OptimizationRisk[];
}

export interface OptimizationSuggestion {
  type: 'pricing' | 'upsell' | 'cross_sell' | 'timing';
  description: string;
  impact: number;
  effort: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface OptimizationRisk {
  type: 'customer_satisfaction' | 'demand_reduction' | 'competition';
  description: string;
  probability: number;
  impact: number;
  mitigation: string;
}

export interface PriceAdjustmentReason {
  factor: string;
  impact: number;
  description: string;
  category: 'positive' | 'negative' | 'neutral';
}

export interface OfferCondition {
  type: 'minimum_amount' | 'participant_count' | 'advance_booking' | 'membership';
  value: any;
  description: string;
}

export interface PaymentPlanEligibility {
  minimumAmount: number;
  creditScore?: number;
  membershipRequired?: boolean;
  restrictions: string[];
}

// Interfaces de accesibilidad
export interface AccessibilityInfo {
  wheelchairAccessible: boolean;
  parkingAvailable: boolean;
  publicTransport: boolean;
  assistiveEquipment: string[];
  specialAccommodations: string[];
  accessibilityRating: number;
}

// ============= INTERFACES DE SOPORTE COMPLETADAS ============="}
export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  duration: number;
  label: string;
}

export interface Sport {
  id: number;
  name: string;
  icon: string;
  category: string;
  seasonDependent: boolean;
  weatherDependent: boolean;
  equipment: string[];
}

export interface Location {
  id: number;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  facilities: string[];
  accessibility: AccessibilityInfo;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// ============= ENUMS =============
export enum BookingStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  REFUNDED = 'refunded'
}

export enum CourseType {
  GROUP = 'group',
  PRIVATE = 'private',
  SEMI_PRIVATE = 'semi_private',
  WORKSHOP = 'workshop',
  CAMP = 'camp',
  CLINIC = 'clinic'
}

// ============= WIZARD PRINCIPAL =============
export interface BookingWizardState {
  currentStep: number;
  totalSteps: number;
  steps: {
    client: SmartClientStep;
    activity: SmartActivityStep;
    schedule: SmartScheduleStep;
    monitor: SmartMonitorStep;
    participants: SmartParticipantsStep;
    pricing: SmartPricingStep;
  };
  
  // Estado global
  isValid: boolean;
  canProceed: boolean;
  hasUnsavedChanges: boolean;
  validationErrors: ValidationError[];
  
  // Configuración
  autoSave: boolean;
  autoSaveInterval: number;
  lastSaved: Date | null;
  
  // Navegación
  navigationHistory: number[];
  allowSkipSteps: boolean;
  requiredSteps: number[];
}

export interface WizardConfig {
  autoAdvance: boolean;
  showProgress: boolean;
  allowBackNavigation: boolean;
  saveOnStepChange: boolean;
  validateOnChange: boolean;
  showHints: boolean;
  enableKeyboardNavigation: boolean;
  theme: 'light' | 'dark' | 'auto';
  animations: boolean;
}