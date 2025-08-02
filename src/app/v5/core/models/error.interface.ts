export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: ErrorContext;
  severity: ErrorSeverity;
  recoverable: boolean;
  userMessage?: string;
  retryable: boolean;
}

export interface ErrorContext {
  userId?: number;
  seasonId?: number;
  schoolId?: number;
  component?: string;
  action?: string;
  payload?: any;
  userAgent?: string;
  url?: string;
  stack?: string;
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCode {
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  OFFLINE_ERROR = 'OFFLINE_ERROR',
  
  // Authentication Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  FORBIDDEN = 'FORBIDDEN',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Business Logic Errors
  SEASON_NOT_SELECTED = 'SEASON_NOT_SELECTED',
  SEASON_CLOSED = 'SEASON_CLOSED',
  INSUFFICIENT_CAPACITY = 'INSUFFICIENT_CAPACITY',
  BOOKING_CONFLICT = 'BOOKING_CONFLICT',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  
  // System Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  
  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ErrorRecoveryAction {
  type: ErrorRecoveryType;
  label: string;
  action: () => void;
  primary?: boolean;
}

export enum ErrorRecoveryType {
  RETRY = 'retry',
  REFRESH = 'refresh',
  NAVIGATE = 'navigate',
  CONTACT_SUPPORT = 'contact_support',
  DISMISS = 'dismiss'
}

export interface ErrorLog {
  id: string;
  error: AppError;
  resolved: boolean;
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
    validation_errors?: ValidationError[];
  };
  meta?: {
    request_id: string;
    timestamp: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}