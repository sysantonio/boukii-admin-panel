import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiV5Service } from '../../../core/services/api-v5.service';
import { SeasonContextService } from '../../../core/services/season-context.service';
import { LoggingService } from '../../../core/services/logging.service';
import {
  BookingPricing,
  PricingLineItem,
  CreateBookingRequest,
  EquipmentRental
} from '../models/booking.interface';
import { Course } from '../../../core/models/course.interface';
import { ApiResponse } from '../../../core/models/api-response.interface';

export interface PricingCalculationRequest {
  course_id: number;
  participant_count: number;
  course_date: Date;
  time_slot_id?: number;
  equipment_rentals?: EquipmentRental[];
  discount_codes?: string[];
  client_id?: number; // For loyalty discounts
  special_requests?: string[];
}

export interface PricingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  blockers: string[];
}

export interface PricingComparison {
  current: BookingPricing;
  alternatives: AlternativePricing[];
  savings_opportunities: SavingsOpportunity[];
}

export interface AlternativePricing {
  scenario: string;
  description: string;
  pricing: BookingPricing;
  savings_amount: number;
  requirements: string[];
}

export interface SavingsOpportunity {
  type: 'early_bird' | 'group_discount' | 'loyalty' | 'seasonal' | 'equipment_bundle' | 'multi_course';
  title: string;
  description: string;
  potential_savings: number;
  requirements: string[];
  action_required: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingPricingService {
  private currentPricingSubject = new BehaviorSubject<BookingPricing | null>(null);
  public currentPricing$ = this.currentPricingSubject.asObservable();

  private pricingValidationSubject = new BehaviorSubject<PricingValidationResult | null>(null);
  public pricingValidation$ = this.pricingValidationSubject.asObservable();

  private lastCalculationRequest: PricingCalculationRequest | null = null;

  constructor(
    private apiV5: ApiV5Service,
    private seasonContext: SeasonContextService,
    private logger: LoggingService
  ) {}

  // ==================== MAIN PRICING CALCULATION ====================

  async calculatePricing(request: PricingCalculationRequest): Promise<BookingPricing> {
    this.logger.info('Calculating booking pricing', request);
    this.lastCalculationRequest = request;

    try {
      const response = await this.apiV5
        .post<ApiResponse<BookingPricing>>('bookings/calculate-pricing', {
          ...request,
          course_date: request.course_date.toISOString(),
          season_id: this.seasonContext.getCurrentSeasonId()
        })
        .toPromise();

      if (!response?.data) {
        throw new Error('Invalid pricing calculation response');
      }

      const pricing = response.data;
      this.currentPricingSubject.next(pricing);

      // Validate pricing
      const validation = await this.validatePricing(pricing, request);
      this.pricingValidationSubject.next(validation);

      return pricing;
    } catch (error) {
      this.logger.error('Failed to calculate pricing', { request, error });
      throw error;
    }
  }

  // Real-time pricing updates (for dynamic pricing)
  startRealTimePricing(request: PricingCalculationRequest): Observable<BookingPricing> {
    return new Observable(observer => {
      const updatePricing = async () => {
        try {
          const pricing = await this.calculatePricing(request);
          observer.next(pricing);
        } catch (error) {
          observer.error(error);
        }
      };

      // Initial calculation
      updatePricing();

      // Set up periodic updates (every 30 seconds for dynamic pricing)
      const interval = setInterval(updatePricing, 30000);

      return () => clearInterval(interval);
    });
  }

  // ==================== PRICING BREAKDOWN ANALYSIS ====================

  async getPricingBreakdown(request: PricingCalculationRequest): Promise<PricingLineItem[]> {
    try {
      const response = await this.apiV5
        .post<ApiResponse<PricingLineItem[]>>('bookings/pricing-breakdown', {
          ...request,
          course_date: request.course_date.toISOString(),
          season_id: this.seasonContext.getCurrentSeasonId()
        })
        .toPromise();

      return response?.data || [];
    } catch (error) {
      this.logger.error('Failed to get pricing breakdown', { request, error });
      throw error;
    }
  }

  async getDetailedPricingAnalysis(request: PricingCalculationRequest): Promise<{
    base_pricing: any;
    applied_discounts: PricingLineItem[];
    additional_costs: PricingLineItem[];
    tax_calculation: PricingLineItem[];
    final_totals: PricingLineItem[];
  }> {
    try {
      const response = await this.apiV5
        .post<ApiResponse<any>>('bookings/detailed-pricing-analysis', {
          ...request,
          course_date: request.course_date.toISOString(),
          season_id: this.seasonContext.getCurrentSeasonId()
        })
        .toPromise();

      return response?.data || {
        base_pricing: {},
        applied_discounts: [],
        additional_costs: [],
        tax_calculation: [],
        final_totals: []
      };
    } catch (error) {
      this.logger.error('Failed to get detailed pricing analysis', { request, error });
      throw error;
    }
  }

  // ==================== DISCOUNT MANAGEMENT ====================

  async validateDiscountCode(code: string, request: PricingCalculationRequest): Promise<{
    valid: boolean;
    discount_amount: number;
    discount_type: 'percentage' | 'fixed';
    requirements_met: boolean;
    error_message?: string;
  }> {
    try {
      const response = await this.apiV5
        .post<ApiResponse<any>>('bookings/validate-discount', {
          discount_code: code,
          ...request,
          course_date: request.course_date.toISOString(),
          season_id: this.seasonContext.getCurrentSeasonId()
        })
        .toPromise();

      return response?.data || {
        valid: false,
        discount_amount: 0,
        discount_type: 'fixed',
        requirements_met: false,
        error_message: 'Discount validation failed'
      };
    } catch (error) {
      this.logger.error('Failed to validate discount code', { code, request, error });
      return {
        valid: false,
        discount_amount: 0,
        discount_type: 'fixed',
        requirements_met: false,
        error_message: 'Unable to validate discount code'
      };
    }
  }

  async getAvailableDiscounts(request: PricingCalculationRequest): Promise<{
    automatic_discounts: any[];
    applicable_codes: any[];
    loyalty_discounts: any[];
    seasonal_offers: any[];
  }> {
    try {
      const response = await this.apiV5
        .post<ApiResponse<any>>('bookings/available-discounts', {
          ...request,
          course_date: request.course_date.toISOString(),
          season_id: this.seasonContext.getCurrentSeasonId()
        })
        .toPromise();

      return response?.data || {
        automatic_discounts: [],
        applicable_codes: [],
        loyalty_discounts: [],
        seasonal_offers: []
      };
    } catch (error) {
      this.logger.error('Failed to get available discounts', { request, error });
      return {
        automatic_discounts: [],
        applicable_codes: [],
        loyalty_discounts: [],
        seasonal_offers: []
      };
    }
  }

  // ==================== PRICING COMPARISON ====================

  async getPricingComparison(request: PricingCalculationRequest): Promise<PricingComparison> {
    try {
      const response = await this.apiV5
        .post<ApiResponse<PricingComparison>>('bookings/pricing-comparison', {
          ...request,
          course_date: request.course_date.toISOString(),
          season_id: this.seasonContext.getCurrentSeasonId()
        })
        .toPromise();

      return response?.data || {
        current: {} as BookingPricing,
        alternatives: [],
        savings_opportunities: []
      };
    } catch (error) {
      this.logger.error('Failed to get pricing comparison', { request, error });
      throw error;
    }
  }

  async getSavingsOpportunities(request: PricingCalculationRequest): Promise<SavingsOpportunity[]> {
    try {
      const response = await this.apiV5
        .post<ApiResponse<SavingsOpportunity[]>>('bookings/savings-opportunities', {
          ...request,
          course_date: request.course_date.toISOString(),
          season_id: this.seasonContext.getCurrentSeasonId()
        })
        .toPromise();

      return response?.data || [];
    } catch (error) {
      this.logger.error('Failed to get savings opportunities', { request, error });
      return [];
    }
  }

  // ==================== PRICING VALIDATION ====================

  async validatePricing(pricing: any, request: PricingCalculationRequest): Promise<PricingValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const blockers: string[] = [];

    try {
      // Validate pricing logic
      if (pricing.total_amount <= 0) {
        errors.push('Total amount must be greater than zero');
      }

      if (pricing.base_price_per_participant <= 0) {
        errors.push('Base price per participant must be greater than zero');
      }

      if (pricing.participant_count !== request.participant_count) {
        errors.push('Participant count mismatch in pricing calculation');
      }

      // Validate discount logic
      const totalDiscounts = pricing.early_bird_discount + pricing.group_discount +
                           pricing.loyalty_discount + pricing.custom_discount;

      if (totalDiscounts > pricing.total_base_price) {
        blockers.push('Total discounts exceed base price');
      }

      // Validate tax calculation
      const expectedTax = pricing.subtotal * pricing.tax_rate;
      if (Math.abs(pricing.tax_amount - expectedTax) > 0.01) {
        warnings.push('Tax calculation may be incorrect');
      }

      // Validate final totals
      const calculatedTotal = pricing.subtotal + pricing.tax_amount;
      if (Math.abs(pricing.total_amount - calculatedTotal) > 0.01) {
        errors.push('Total amount calculation error');
      }

      // Business rule validations
      if (request.participant_count > 20) {
        warnings.push('Large group booking - consider special group rates');
      }

      // Seasonal validations
      const currentSeason = this.seasonContext.getCurrentSeason();
      if (currentSeason?.is_closed) {
        blockers.push('Cannot create bookings for closed season');
      }

      return {
        isValid: errors.length === 0 && blockers.length === 0,
        errors,
        warnings,
        blockers
      };

    } catch (error) {
      this.logger.error('Pricing validation failed', { pricing, request, error });
      return {
        isValid: false,
        errors: ['Pricing validation failed'],
        warnings: [],
        blockers: ['Unable to validate pricing']
      };
    }
  }

  // ==================== PRICING HISTORY AND TRACKING ====================

  async getPricingHistory(courseId: number, days: number = 30): Promise<{
    date: Date;
    base_price: number;
    average_final_price: number;
    booking_count: number;
  }[]> {
    try {
      const response = await this.apiV5
        .get<ApiResponse<any[]>>(`courses/${courseId}/pricing-history`, {
          params: {
            days: days.toString(),
            season_id: this.seasonContext.getCurrentSeasonId()?.toString() || ''
          }
        })
        .toPromise();

      return response?.data || [];
    } catch (error) {
      this.logger.error('Failed to get pricing history', { courseId, days, error });
      return [];
    }
  }

  async trackPricingDecision(
    pricingId: number,
    decision: 'accepted' | 'modified' | 'rejected',
    reason?: string
  ): Promise<void> {
    try {
      await this.apiV5
        .post('bookings/track-pricing-decision', {
          pricing_id: pricingId,
          decision,
          reason,
          timestamp: new Date().toISOString()
        })
        .toPromise();

      this.logger.info('Pricing decision tracked', { pricingId, decision, reason });
    } catch (error) {
      this.logger.error('Failed to track pricing decision', { pricingId, decision, reason, error });
    }
  }

  // ==================== UTILITY METHODS ====================

  getCurrentPricing(): BookingPricing | null {
    return this.currentPricingSubject.value;
  }

  getCurrentValidation(): PricingValidationResult | null {
    return this.pricingValidationSubject.value;
  }

  clearCurrentPricing(): void {
    this.currentPricingSubject.next(null);
    this.pricingValidationSubject.next(null);
    this.lastCalculationRequest = null;
  }

  async recalculatePricing(): Promise<BookingPricing | null> {
    if (!this.lastCalculationRequest) {
      return null;
    }

    return this.calculatePricing(this.lastCalculationRequest);
  }

  formatPrice(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  calculateTotalDiscount(pricing: BookingPricing): number {
    return pricing.early_bird_discount +
           pricing.group_discount +
           pricing.loyalty_discount +
           pricing.custom_discount;
  }

  calculateSavingsPercentage(originalPrice: number, finalPrice: number): number {
    if (originalPrice <= 0) return 0;
    return ((originalPrice - finalPrice) / originalPrice) * 100;
  }
}
