import { Injectable } from '@angular/core';
import {AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn, FormArray, FormGroup} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ApiV5Service } from './api-v5.service';
import { I18nService } from './i18n.service';
import { SeasonContextService } from './season-context.service';

export interface ValidationRule {
  validator: ValidatorFn;
  message: string;
  priority?: number;
}

export interface AsyncValidationRule {
  validator: AsyncValidatorFn;
  message: string;
  debounceTime?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  params?: any;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor(
    private apiV5: ApiV5Service,
    private i18n: I18nService,
    private seasonContext: SeasonContextService
  ) {}

  // ==================== BASIC VALIDATORS ====================

  required(message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const isEmpty = value === null || value === undefined ||
                     (typeof value === 'string' && value.trim() === '') ||
                     (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        return {
          required: {
            message: message || this.i18n.translateSync('validation.required'),
            code: 'REQUIRED'
          }
        };
      }
      return null;
    };
  }

  minLength(min: number, message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && value.length < min) {
        return {
          minLength: {
            message: message || this.i18n.translateSync('validation.min_length', { min }),
            code: 'MIN_LENGTH',
            requiredLength: min,
            actualLength: value.length
          }
        };
      }
      return null;
    };
  }

  maxLength(max: number, message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && value.length > max) {
        return {
          maxLength: {
            message: message || this.i18n.translateSync('validation.max_length', { max }),
            code: 'MAX_LENGTH',
            requiredLength: max,
            actualLength: value.length
          }
        };
      }
      return null;
    };
  }

  min(min: number, message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = parseFloat(control.value);
      if (!isNaN(value) && value < min) {
        return {
          min: {
            message: message || this.i18n.translateSync('validation.min_value', { min }),
            code: 'MIN_VALUE',
            min,
            actual: value
          }
        };
      }
      return null;
    };
  }

  max(max: number, message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = parseFloat(control.value);
      if (!isNaN(value) && value > max) {
        return {
          max: {
            message: message || this.i18n.translateSync('validation.max_value', { max }),
            code: 'MAX_VALUE',
            max,
            actual: value
          }
        };
      }
      return null;
    };
  }

  // ==================== PATTERN VALIDATORS ====================

  email(message?: string): ValidatorFn {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return this.pattern(emailPattern, message || this.i18n.translateSync('validation.email'));
  }

  phone(message?: string): ValidatorFn {
    // International phone pattern - flexible for different formats
    const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
    return this.pattern(phonePattern, message || this.i18n.translateSync('validation.phone'));
  }

  dni(message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const dniPattern = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
      if (!dniPattern.test(value)) {
        return {
          dni: {
            message: message || 'DNI format is invalid',
            code: 'INVALID_DNI'
          }
        };
      }

      // Validate DNI letter
      const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
      const number = parseInt(value.substr(0, 8), 10);
      const letter = value.substr(8, 1).toUpperCase();

      if (letters.charAt(number % 23) !== letter) {
        return {
          dni: {
            message: message || 'DNI letter is incorrect',
            code: 'INVALID_DNI_LETTER'
          }
        };
      }

      return null;
    };
  }

  nie(message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const niePattern = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
      if (!niePattern.test(value)) {
        return {
          nie: {
            message: message || 'NIE format is invalid',
            code: 'INVALID_NIE'
          }
        };
      }

      // Convert first letter to number
      const firstChar = value.charAt(0).toUpperCase();
      let nieNumber = value.substring(1, 8);

      if (firstChar === 'X') nieNumber = '0' + nieNumber;
      else if (firstChar === 'Y') nieNumber = '1' + nieNumber;
      else if (firstChar === 'Z') nieNumber = '2' + nieNumber;

      const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
      const number = parseInt(nieNumber, 10);
      const letter = value.substr(8, 1).toUpperCase();

      if (letters.charAt(number % 23) !== letter) {
        return {
          nie: {
            message: message || 'NIE letter is incorrect',
            code: 'INVALID_NIE_LETTER'
          }
        };
      }

      return null;
    };
  }

  private pattern(pattern: RegExp, message: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && !pattern.test(value)) {
        return {
          pattern: {
            message,
            code: 'INVALID_PATTERN',
            requiredPattern: pattern.source,
            actualValue: value
          }
        };
      }
      return null;
    };
  }

  // ==================== DATE VALIDATORS ====================

  dateInFuture(message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const date = new Date(value);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (date <= now) {
        return {
          dateInFuture: {
            message: message || this.i18n.translateSync('validation.date_future'),
            code: 'DATE_NOT_FUTURE'
          }
        };
      }
      return null;
    };
  }

  dateInPast(message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const date = new Date(value);
      const now = new Date();
      now.setHours(23, 59, 59, 999);

      if (date >= now) {
        return {
          dateInPast: {
            message: message || this.i18n.translateSync('validation.date_past'),
            code: 'DATE_NOT_PAST'
          }
        };
      }
      return null;
    };
  }

  dateRange(startDateField: string, endDateField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent) return null;

      const startDate = parent.get(startDateField)?.value;
      const endDate = parent.get(endDateField)?.value;

      if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
        return {
          dateRange: {
            message: 'End date must be after start date',
            code: 'INVALID_DATE_RANGE'
          }
        };
      }
      return null;
    };
  }

  minAge(minAge: number, message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < minAge) {
        return {
          minAge: {
            message: message || `Minimum age is ${minAge} years`,
            code: 'MIN_AGE_NOT_REACHED',
            requiredAge: minAge,
            actualAge: age
          }
        };
      }
      return null;
    };
  }

  // ==================== BUSINESS LOGIC VALIDATORS ====================

  seasonNotClosed(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const currentSeason = this.seasonContext.getCurrentSeason();
      if (currentSeason?.is_closed) {
        return {
          seasonClosed: {
            message: this.i18n.translateSync('validation.season_closed'),
            code: 'SEASON_CLOSED'
          }
        };
      }
      return null;
    };
  }

  priceRange(min?: number, max?: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = parseFloat(control.value);
      if (isNaN(value)) return null;

      if (min !== undefined && value < min) {
        return {
          priceRange: {
            message: `Price must be at least ${min}`,
            code: 'PRICE_TOO_LOW',
            min,
            actual: value
          }
        };
      }

      if (max !== undefined && value > max) {
        return {
          priceRange: {
            message: `Price cannot exceed ${max}`,
            code: 'PRICE_TOO_HIGH',
            max,
            actual: value
          }
        };
      }

      return null;
    };
  }

  capacityLogic(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent) return null;

      const minParticipants = parseInt(parent.get('min_participants')?.value);
      const maxParticipants = parseInt(parent.get('max_participants')?.value);
      const capacity = parseInt(control.value);

      if (minParticipants && capacity < minParticipants) {
        return {
          capacityLogic: {
            message: 'Capacity cannot be less than minimum participants',
            code: 'CAPACITY_TOO_LOW'
          }
        };
      }

      if (maxParticipants && capacity < maxParticipants) {
        return {
          capacityLogic: {
            message: 'Capacity should be at least equal to maximum participants',
            code: 'CAPACITY_INSUFFICIENT'
          }
        };
      }

      return null;
    };
  }

  // ==================== ASYNC VALIDATORS ====================

  uniqueEmail(excludeId?: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return timer(300).pipe(
        switchMap(() =>
          this.apiV5.post<{ exists: boolean }>('validation/unique-email', {
            email: control.value,
            exclude_id: excludeId
          })
        ),
        map((response:any) => {
          if (response.data.exists) {
            return {
              uniqueEmail: {
                message: 'This email is already in use',
                code: 'EMAIL_EXISTS'
              }
            };
          }
          return null;
        }),
        catchError(() => of(null)) // On error, don't show validation error
      );
    };
  }

  courseAvailable(seasonId?: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      const currentSeasonId = seasonId || this.seasonContext.getCurrentSeasonId();
      if (!currentSeasonId) {
        return of({
          courseAvailable: {
            message: 'No season selected',
            code: 'NO_SEASON_SELECTED'
          }
        });
      }

      return this.apiV5.get<{ available: boolean, capacity: number }>
        (`courses/${control.value}/availability?season_id=${currentSeasonId}`).pipe(
        map((response:any) => {
          if (!response.data.available) {
            return {
              courseAvailable: {
                message: 'Course is not available for selected period',
                code: 'COURSE_NOT_AVAILABLE'
              }
            };
          }
          return null;
        }),
        catchError(() => of({
          courseAvailable: {
            message: 'Could not verify course availability',
            code: 'AVAILABILITY_CHECK_FAILED'
          }
        }))
      );
    };
  }

  // ==================== COMPOSITE VALIDATORS ====================

  createPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const errors: any = {};

      if (value.length < 8) {
        errors.passwordLength = {
          message: 'Password must be at least 8 characters long',
          code: 'PASSWORD_TOO_SHORT'
        };
      }

      if (!/[A-Z]/.test(value)) {
        errors.passwordUppercase = {
          message: 'Password must contain at least one uppercase letter',
          code: 'PASSWORD_NO_UPPERCASE'
        };
      }

      if (!/[a-z]/.test(value)) {
        errors.passwordLowercase = {
          message: 'Password must contain at least one lowercase letter',
          code: 'PASSWORD_NO_LOWERCASE'
        };
      }

      if (!/[0-9]/.test(value)) {
        errors.passwordNumber = {
          message: 'Password must contain at least one number',
          code: 'PASSWORD_NO_NUMBER'
        };
      }

      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        errors.passwordSpecial = {
          message: 'Password must contain at least one special character',
          code: 'PASSWORD_NO_SPECIAL'
        };
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  passwordMatch(passwordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent) return null;

      const password = parent.get(passwordField)?.value;
      const confirmPassword = control.value;

      if (password && confirmPassword && password !== confirmPassword) {
        return {
          passwordMatch: {
            message: this.i18n.translateSync('validation.passwords_not_match'),
            code: 'PASSWORDS_NOT_MATCH'
          }
        };
      }
      return null;
    };
  }

  // ==================== UTILITY METHODS ====================

  validateForm(form: AbstractControl): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    this.collectFormErrors(form, '', errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private collectFormErrors(
    control: AbstractControl,
    fieldPath: string,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (control.errors) {
      Object.keys(control.errors).forEach(key => {
        const error = control.errors![key];
        errors.push({
          field: fieldPath,
          code: error.code || key.toUpperCase(),
          message: error.message || `Validation error: ${key}`,
          params: error
        });
      });
    }

    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.keys(control.controls).forEach(key => {
        const childControl = control.get(key);
        const childPath = fieldPath ? `${fieldPath}.${key}` : key;
        if (childControl) {
          this.collectFormErrors(childControl, childPath, errors, warnings);
        }
      });
    }
  }

  getFirstError(control: AbstractControl): string | null {
    if (!control.errors) return null;

    const firstError = Object.values(control.errors)[0];
    return typeof firstError === 'object' && firstError.message
      ? firstError.message
      : 'Validation error';
  }

  markAllFieldsAsTouched(control: AbstractControl): void {
    control.markAsTouched();

    if (control instanceof FormGroup) {
      Object.values(control.controls).forEach(ctrl => {
        this.markAllFieldsAsTouched(ctrl);
      });
    } else if (control instanceof FormArray) {
      control.controls.forEach(ctrl => {
        this.markAllFieldsAsTouched(ctrl);
      });
    }
  }
}
