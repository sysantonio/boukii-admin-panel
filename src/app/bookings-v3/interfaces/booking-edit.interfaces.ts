// ============= BOOKING EDIT INTERFACES =============

export interface SmartEditBooking {
  // Información principal
  bookingId: number;
  currentBooking: EnhancedBooking;
  originalBooking: EnhancedBooking; // Para comparar cambios
  
  // Timeline y historial
  bookingTimeline: BookingTimelineEvent[];
  changeHistory: BookingChange[];
  
  // Edición en tiempo real
  editableFields: EditableField[];
  realTimeValidation: ValidationResult[];
  conflictDetection: EditConflict[];
  impactAnalysis: ChangeImpactAnalysis;
  
  // Quick Actions
  quickActions: QuickActionGroup[];
  
  // Comunicación
  notificationSettings: NotificationSetting[];
  autoNotifyClient: boolean;
  notificationTemplates: NotificationTemplate[];
  
  // Pricing
  priceAdjustments: PriceAdjustment[];
  refundCalculations: RefundCalculation[];
  additionalCharges: AdditionalCharge[];
  
  // Estados
  isLoading: boolean;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  saveStatus: 'saved' | 'saving' | 'error' | 'conflict';
}

export interface EnhancedBooking {
  // Información básica
  id: number;
  bookingNumber: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  
  // Cliente y contacto
  client: EnhancedClient;
  participants: EnhancedParticipant[];
  
  // Curso y actividad
  course: EnhancedCourse;
  courseType: CourseType;
  
  // Fechas y horarios
  bookingDates: BookingDate[];
  duration: number;
  timezone: string;
  
  // Monitor y recursos
  monitor: EnhancedMonitor | null;
  location: Location;
  equipment: EquipmentBooking[];
  
  // Pricing y pagos
  pricing: BookingPricing;
  payments: PaymentRecord[];
  refunds: RefundRecord[];
  
  // Notas y comunicación
  notes: BookingNote[];
  internalNotes: string;
  clientNotes: string;
  
  // Metadata
  source: BookingSource;
  tags: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedTo: number | null; // Staff member
  
  // Métricas
  metrics: BookingMetrics;
  satisfaction: SatisfactionRecord | null;
}

export interface BookingTimelineEvent {
  id: number;
  timestamp: Date;
  type: TimelineEventType;
  title: string;
  description: string;
  actor: Actor;
  details: any;
  visibility: 'public' | 'internal' | 'system';
  icon: string;
  color: string;
}

export enum TimelineEventType {
  CREATED = 'created',
  MODIFIED = 'modified',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
  MONITOR_CHANGED = 'monitor_changed',
  PARTICIPANT_ADDED = 'participant_added',
  PARTICIPANT_REMOVED = 'participant_removed',
  NOTE_ADDED = 'note_added',
  EMAIL_SENT = 'email_sent',
  SMS_SENT = 'sms_sent',
  REMINDER_SENT = 'reminder_sent',
  COMPLETED = 'completed',
  FEEDBACK_RECEIVED = 'feedback_received',
  REFUND_PROCESSED = 'refund_processed'
}

export interface EditableField {
  fieldName: string;
  fieldPath: string; // Para nested objects
  label: string;
  type: FieldType;
  currentValue: any;
  newValue: any;
  isEditable: boolean;
  isRequired: boolean;
  validationRules: ValidationRule[];
  dependsOn: string[]; // Otros campos que afectan este
  affects: string[]; // Campos que este afecta
  changeImpact: FieldChangeImpact;
}

export enum FieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PHONE = 'phone',
  NUMBER = 'number',
  DATE = 'date',
  DATETIME = 'datetime',
  TIME = 'time',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  BOOLEAN = 'boolean',
  TEXTAREA = 'textarea',
  CURRENCY = 'currency',
  PARTICIPANT_LIST = 'participant_list',
  DATE_RANGE = 'date_range'
}

export interface ValidationResult {
  fieldName: string;
  isValid: boolean;
  errors: FieldError[];
  warnings: FieldWarning[];
  suggestions: FieldSuggestion[];
}

export interface FieldError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  fixable: boolean;
  autoFix?: () => void;
}

export interface EditConflict {
  type: ConflictType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedFields: string[];
  conflictsWith: ConflictSource[];
  resolutionOptions: ConflictResolution[];
  autoResolvable: boolean;
  requiresApproval: boolean;
}

export enum ConflictType {
  SCHEDULE_CONFLICT = 'schedule_conflict',
  MONITOR_UNAVAILABLE = 'monitor_unavailable',
  CAPACITY_EXCEEDED = 'capacity_exceeded',
  PRICE_CHANGE = 'price_change',
  POLICY_VIOLATION = 'policy_violation',
  RESOURCE_CONFLICT = 'resource_conflict',
  WEATHER_RESTRICTION = 'weather_restriction',
  AGE_RESTRICTION = 'age_restriction'
}

export interface ConflictSource {
  type: 'booking' | 'monitor' | 'resource' | 'policy' | 'weather';
  id: number | string;
  name: string;
  details: any;
}

export interface ConflictResolution {
  id: string;
  title: string;
  description: string;
  action: () => Promise<void>;
  impact: ResolutionImpact;
  automatic: boolean;
  requiresConfirmation: boolean;
}

export interface ChangeImpactAnalysis {
  changedFields: string[];
  impactedSystems: ImpactedSystem[];
  costImplications: CostImplication[];
  clientNotificationRequired: boolean;
  approvalRequired: boolean;
  estimatedProcessingTime: number;
  riskLevel: 'low' | 'medium' | 'high';
  rollbackPossible: boolean;
}

export interface ImpactedSystem {
  system: 'pricing' | 'scheduling' | 'monitor' | 'equipment' | 'billing' | 'communications';
  impact: 'none' | 'low' | 'medium' | 'high';
  description: string;
  actions: string[];
}

export interface CostImplication {
  type: 'refund' | 'additional_charge' | 'discount' | 'fee';
  amount: number;
  reason: string;
  isOptional: boolean;
  requiresApproval: boolean;
}

// ============= QUICK ACTIONS =============
export interface QuickActionGroup {
  id: string;
  title: string;
  icon: string;
  actions: QuickAction[];
  contextual: boolean;
  visible: boolean;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => Promise<void> | void;
  enabled: boolean;
  requiresConfirmation: boolean;
  confirmationMessage?: string;
  shortcut?: string;
  badge?: string | number;
}

// Tipos específicos de Quick Actions
export interface RescheduleOptions {
  availableSlots: AvailableSlot[];
  suggestedSlots: SuggestedSlot[];
  conflictingBookings: ConflictingBooking[];
  rescheduleFee: number;
  cancellationDeadline: Date;
  weatherConsiderations: WeatherConsideration[];
}

export interface MonitorChangeOptions {
  availableMonitors: AvailableMonitor[];
  recommendedMonitors: RecommendedMonitor[];
  changeFee: number;
  impactOnPrice: number;
  clientPreferences: MonitorPreference[];
  notificationRequired: boolean;
}

export interface AddParticipantOptions {
  maxAdditionalParticipants: number;
  pricePerAdditionalParticipant: number;
  availableSpots: number;
  ageRestrictions: AgeRestriction[];
  equipmentAvailability: EquipmentAvailability[];
  groupDiscountImpact: DiscountImpact;
}

// ============= NOTIFICACIONES =============
export interface NotificationSetting {
  type: NotificationType;
  enabled: boolean;
  method: 'email' | 'sms' | 'push' | 'whatsapp';
  timing: NotificationTiming;
  template: string;
  customizable: boolean;
}

export enum NotificationType {
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_MODIFIED = 'booking_modified',
  BOOKING_CANCELLED = 'booking_cancelled',
  PAYMENT_RECEIVED = 'payment_received',
  REMINDER_24H = 'reminder_24h',
  REMINDER_2H = 'reminder_2h',
  WEATHER_ALERT = 'weather_alert',
  SCHEDULE_CHANGE = 'schedule_change',
  MONITOR_CHANGE = 'monitor_change'
}

export interface NotificationTiming {
  immediate: boolean;
  delay: number; // minutes
  scheduledFor?: Date;
  businessHoursOnly: boolean;
  timezone: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject: string;
  content: string;
  variables: TemplateVariable[];
  language: string;
  customizable: boolean;
}

export interface TemplateVariable {
  key: string;
  description: string;
  required: boolean;
  defaultValue?: string;
  format?: string;
}

// ============= PRICING ADJUSTMENTS =============
export interface PriceAdjustment {
  id: string;
  type: 'discount' | 'surcharge' | 'refund' | 'credit';
  reason: string;
  amount: number;
  percentage?: number;
  applied: boolean;
  appliedAt?: Date;
  appliedBy?: number;
  requiresApproval: boolean;
  approved: boolean;
  approvedBy?: number;
  approvedAt?: Date;
  notes: string;
}

export interface RefundCalculation {
  eligibleAmount: number;
  processingFee: number;
  cancellationFee: number;
  netRefund: number;
  refundMethod: 'original_payment' | 'credit' | 'voucher';
  processingTime: string;
  conditions: string[];
  requiresApproval: boolean;
}

export interface AdditionalCharge {
  id: string;
  description: string;
  amount: number;
  type: 'service_fee' | 'equipment' | 'insurance' | 'modification_fee' | 'late_fee';
  required: boolean;
  applied: boolean;
  appliedAt?: Date;
  notes: string;
}

// ============= BOOKING CHANGES =============
export interface BookingChange {
  id: number;
  timestamp: Date;
  changedBy: Actor;
  changeType: ChangeType;
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
  notes: string;
  impactLevel: 'low' | 'medium' | 'high';
  clientNotified: boolean;
  approved: boolean;
  approvedBy?: Actor;
  approvedAt?: Date;
}

export enum ChangeType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  RESCHEDULE = 'reschedule',
  REASSIGN = 'reassign',
  CANCEL = 'cancel',
  REFUND = 'refund',
  NOTE = 'note'
}

export interface Actor {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'monitor' | 'client' | 'system';
  avatar?: string;
}

// ============= EXTENDED ENTITIES =============
export interface EnhancedClient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  preferences: ClientPreferences;
  metrics: ClientMetrics;
  riskProfile: ClientRiskProfile;
  tags: string[];
  vipStatus: boolean;
  loyaltyLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  communicationPreferences: CommunicationPreferences;
}

export interface EnhancedParticipant {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  level: string;
  specialRequests: string[];
  medicalConditions: string[];
  emergencyContact: EmergencyContact;
  waiverStatus: WaiverStatus;
  equipmentNeeds: EquipmentNeed[];
  insuranceOptIn: boolean;
}

export interface EnhancedMonitor {
  id: number;
  firstName: string;
  lastName: string;
  specialties: string[];
  availability: MonitorAvailability;
  currentWorkload: number;
  rating: number;
  certifications: Certification[];
  languages: string[];
  clientCompatibility: number;
}

export interface BookingMetrics {
  createdToConfirmedTime: number;
  modificationsCount: number;
  communicationsCount: number;
  clientEngagementScore: number;
  profitMargin: number;
  satisfactionScore?: number;
  completionRate: number;
  onTimeArrival: boolean;
  weatherImpact: boolean;
}

// ============= ESTADOS Y CONFIGURACIÓN =============
export interface EditBookingState {
  mode: 'view' | 'edit' | 'bulk_edit';
  selectedFields: string[];
  unsavedChanges: boolean;
  validationInProgress: boolean;
  conflicts: EditConflict[];
  lastValidation: Date;
  autoSave: boolean;
  autoSaveInterval: number;
}

export interface EditBookingConfig {
  allowedFields: string[];
  requiredApprovals: string[];
  notificationRules: NotificationRule[];
  validationRules: ValidationRule[];
  costThresholds: CostThreshold[];
  autoActions: AutoAction[];
}

export interface NotificationRule {
  trigger: string;
  condition: string;
  recipients: string[];
  template: string;
  delay?: number;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface CostThreshold {
  type: 'refund' | 'charge' | 'discount';
  amount: number;
  requiresApproval: boolean;
  approvers: number[];
  notificationRequired: boolean;
}

export interface AutoAction {
  trigger: string;
  condition: string;
  action: string;
  parameters: any;
  enabled: boolean;
}