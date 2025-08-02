import { Injectable } from '@angular/core';
import { ApiV5Service } from '../../../core/services/api-v5.service';
import { SeasonContextService } from '../../../core/services/season-context.service';
import { 
  CourseSeasonPricing, 
  PriceBreak, 
  CourseExtra 
} from '../../../core/models/course.interface';
import { ApiResponse } from '../../../core/models/api-response.interface';

export interface PricingCalculationRequest {
  courseId: number;
  participantCount: number;
  extras?: number[];
  discountCode?: string;
}

export interface PricingCalculationResult {
  basePrice: number;
  participantTotal: number;
  extrasTotal: number;
  discountAmount: number;
  finalTotal: number;
  breakdown: PricingBreakdown;
  currency: string;
}

export interface PricingBreakdown {
  pricePerParticipant: number;
  participantCount: number;
  subtotal: number;
  appliedExtras: AppliedExtra[];
  appliedDiscounts: AppliedDiscount[];
  taxes?: TaxBreakdown;
}

export interface AppliedExtra {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface AppliedDiscount {
  code?: string;
  type: 'percentage' | 'fixed' | 'voucher';
  amount: number;
  description: string;
}

export interface TaxBreakdown {
  taxRate: number;
  taxAmount: number;
  totalWithTax: number;
}

@Injectable({
  providedIn: 'root'
})
export class CoursePricingService {

  constructor(
    private apiV5: ApiV5Service,
    private seasonContext: SeasonContextService
  ) {}

  async getCoursePricing(courseId: number): Promise<CourseSeasonPricing> {
    const response = await this.apiV5
      .get<ApiResponse<CourseSeasonPricing>>(`courses/${courseId}/pricing`)
      .toPromise();
    
    if (!response?.data) {
      throw new Error('Course pricing not found');
    }
    
    return response.data;
  }

  async updateCoursePricing(courseId: number, pricing: Partial<CourseSeasonPricing>): Promise<CourseSeasonPricing> {
    const response = await this.apiV5
      .put<ApiResponse<CourseSeasonPricing>>(`courses/${courseId}/pricing`, pricing)
      .toPromise();

    if (!response?.data) {
      throw new Error('Failed to update course pricing');
    }
    
    return response.data;
  }

  async calculatePricing(request: PricingCalculationRequest): Promise<PricingCalculationResult> {
    const response = await this.apiV5
      .post<ApiResponse<PricingCalculationResult>>('courses/calculate-pricing', request)
      .toPromise();

    if (!response?.data) {
      throw new Error('Failed to calculate pricing');
    }
    
    return response.data;
  }

  calculateFlexiblePricing(
    pricing: CourseSeasonPricing, 
    participantCount: number
  ): PricingCalculationResult {
    if (pricing.pricing_type !== 'flexible') {
      throw new Error('This method only works for flexible pricing');
    }

    // Find applicable price break
    const sortedBreaks = [...pricing.price_breaks]
      .filter(pb => pb.is_active)
      .sort((a, b) => b.participant_count - a.participant_count);

    let applicableBreak: PriceBreak | null = null;
    for (const priceBreak of sortedBreaks) {
      if (participantCount >= priceBreak.participant_count) {
        applicableBreak = priceBreak;
        break;
      }
    }

    // If no specific break found, use base pricing
    const pricePerParticipant = applicableBreak?.price_per_participant || pricing.base_price;
    const participantTotal = pricePerParticipant * participantCount;

    return {
      basePrice: pricing.base_price,
      participantTotal,
      extrasTotal: 0,
      discountAmount: 0,
      finalTotal: participantTotal,
      currency: pricing.currency,
      breakdown: {
        pricePerParticipant,
        participantCount,
        subtotal: participantTotal,
        appliedExtras: [],
        appliedDiscounts: []
      }
    };
  }

  calculateFixedPricing(
    pricing: CourseSeasonPricing, 
    participantCount: number
  ): PricingCalculationResult {
    if (pricing.pricing_type !== 'fixed') {
      throw new Error('This method only works for fixed pricing');
    }

    // Validate participant count
    if (participantCount < pricing.min_participants) {
      throw new Error(`Minimum ${pricing.min_participants} participants required`);
    }

    if (participantCount > pricing.max_participants) {
      throw new Error(`Maximum ${pricing.max_participants} participants allowed`);
    }

    const totalPrice = pricing.base_price;

    return {
      basePrice: pricing.base_price,
      participantTotal: totalPrice,
      extrasTotal: 0,
      discountAmount: 0,
      finalTotal: totalPrice,
      currency: pricing.currency,
      breakdown: {
        pricePerParticipant: totalPrice / participantCount,
        participantCount,
        subtotal: totalPrice,
        appliedExtras: [],
        appliedDiscounts: []
      }
    };
  }

  addExtrasToCalculation(
    baseCalculation: PricingCalculationResult,
    selectedExtras: CourseExtra[],
    quantities: { [extraId: number]: number } = {}
  ): PricingCalculationResult {
    const appliedExtras: AppliedExtra[] = [];
    let extrasTotal = 0;

    for (const extra of selectedExtras) {
      if (!extra.is_active) continue;

      const quantity = quantities[extra.id] || 1;
      const total = extra.price * quantity;
      
      appliedExtras.push({
        id: extra.id,
        name: extra.name,
        price: extra.price,
        quantity,
        total
      });

      extrasTotal += total;
    }

    const finalTotal = baseCalculation.participantTotal + extrasTotal - baseCalculation.discountAmount;

    return {
      ...baseCalculation,
      extrasTotal,
      finalTotal,
      breakdown: {
        ...baseCalculation.breakdown,
        appliedExtras
      }
    };
  }

  async validateDiscountCode(discountCode: string, courseId: number): Promise<boolean> {
    try {
      const response = await this.apiV5
        .post<ApiResponse<{ valid: boolean }>>('discounts/validate', {
          code: discountCode,
          course_id: courseId
        })
        .toPromise();

      return response?.data?.valid || false;
    } catch (error) {
      console.error('Error validating discount code:', error);
      return false;
    }
  }

  async getSeasonalPricingComparison(courseId: number): Promise<CourseSeasonPricing[]> {
    const response = await this.apiV5
      .get<ApiResponse<CourseSeasonPricing[]>>(`courses/${courseId}/seasonal-pricing`)
      .toPromise();
    
    return response?.data || [];
  }

  async bulkUpdatePricing(
    courseIds: number[],
    pricingUpdate: Partial<CourseSeasonPricing>
  ): Promise<void> {
    await this.apiV5
      .post('courses/bulk-update-pricing', {
        course_ids: courseIds,
        pricing_update: pricingUpdate
      })
      .toPromise();
  }

  canManagePricing(): boolean {
    const currentSeason = this.seasonContext.getCurrentSeason();
    return !!(currentSeason && !currentSeason.is_closed);
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat(navigator.language, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  calculatePricingStatistics(pricings: CourseSeasonPricing[]): {
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    totalCourses: number;
    flexiblePricingCount: number;
    fixedPricingCount: number;
  } {
    if (pricings.length === 0) {
      return {
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        totalCourses: 0,
        flexiblePricingCount: 0,
        fixedPricingCount: 0
      };
    }

    const prices = pricings.map(p => p.base_price);
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const flexiblePricingCount = pricings.filter(p => p.pricing_type === 'flexible').length;
    const fixedPricingCount = pricings.filter(p => p.pricing_type === 'fixed').length;

    return {
      averagePrice,
      minPrice,
      maxPrice,
      totalCourses: pricings.length,
      flexiblePricingCount,
      fixedPricingCount
    };
  }
}