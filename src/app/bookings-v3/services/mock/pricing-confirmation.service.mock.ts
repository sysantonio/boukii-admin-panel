import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// Mock Data Service
import { MockDataService } from './mock-data.service';

// Interfaces
import { PriceBreakdown, PaymentPlan, PromoCode } from '../../interfaces/shared.interfaces';

@Injectable({
  providedIn: 'root'
})
export class PricingConfirmationServiceMock {
  private mockData = inject(MockDataService);

  /**
   * Calcular precio final con todos los descuentos
   */
  calculateFinalPricing(bookingData: {
    courseId: number;
    participantCount: number;
    dates: string[];
    timeSlots: number[];
    addOns?: number[];
    promoCode?: string;
    clientId?: number;
  }): Observable<PriceBreakdown> {
    console.log('💰 [MOCK] Calculating final pricing:', bookingData);
    
    const pricing: PriceBreakdown = {
      subtotal: 285 * bookingData.participantCount,
      basePrice: 285,
      discounts: [
        {
          type: 'early_bird',
          name: 'Reserva Anticipada',
          amount: 25,
          percentage: 8.8,
          description: 'Reservado con más de 7 días de anticipación'
        }
      ],
      addOns: bookingData.addOns?.map(id => ({
        id,
        name: 'Seguro Premium',
        price: 15,
        description: 'Cobertura completa'
      })) || [],
      taxes: {
        iva: 21,
        amount: 54.6
      },
      total: 285 * bookingData.participantCount - 25 + 54.6,
      currency: 'EUR',
      breakdown: {
        course: 285,
        equipment: 0,
        insurance: 15,
        taxes: 54.6,
        discounts: -25
      },
      dynamicFactors: {
        demandMultiplier: 1.0,
        seasonalAdjustment: 0.95,
        weatherBonus: 1.05,
        loyaltyDiscount: 0.9
      },
      validUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      guaranteedPrice: true
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(pricing);
        observer.complete();
      }, 800);
    });
  }

  /**
   * Validar código promocional
   */
  validatePromoCode(code: string, bookingData: any): Observable<PromoCode> {
    console.log('🎫 [MOCK] Validating promo code:', code);
    
    const promoCodes: { [key: string]: PromoCode } = {
      'EARLY20': {
        code: 'EARLY20',
        isValid: true,
        type: 'percentage',
        value: 20,
        description: 'Descuento por reserva anticipada',
        minAmount: 200,
        maxDiscount: 50,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        restrictions: ['No combinable con otras ofertas'],
        applicableItems: ['course'],
        usageCount: 1,
        maxUsage: 1
      },
      'NEWCLIENT': {
        code: 'NEWCLIENT',
        isValid: true,
        type: 'fixed',
        value: 30,
        description: 'Bienvenida nuevo cliente',
        minAmount: 150,
        maxDiscount: 30,
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        restrictions: ['Solo para nuevos clientes'],
        applicableItems: ['course', 'equipment'],
        usageCount: 0,
        maxUsage: 1
      }
    };

    const result = promoCodes[code] || {
      code,
      isValid: false,
      type: 'percentage',
      value: 0,
      description: 'Código promocional no válido',
      error: 'INVALID_CODE'
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(result as PromoCode);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Obtener planes de pago disponibles
   */
  getPaymentPlans(totalAmount: number): Observable<PaymentPlan[]> {
    console.log('💳 [MOCK] Getting payment plans for amount:', totalAmount);
    
    const plans: PaymentPlan[] = [
      {
        id: 'immediate',
        name: 'Pago Inmediato',
        type: 'full',
        installments: 1,
        firstPayment: totalAmount,
        remainingPayments: [],
        totalFees: 0,
        totalAmount: totalAmount,
        description: 'Pago completo al confirmar',
        features: ['Sin recargos', 'Confirmación inmediata'],
        recommended: totalAmount < 300
      },
      {
        id: 'split_50_50',
        name: 'Pago en 2 partes',
        type: 'installments',
        installments: 2,
        firstPayment: totalAmount * 0.5,
        remainingPayments: [
          {
            amount: totalAmount * 0.5,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            description: 'Pago antes del curso'
          }
        ],
        totalFees: 5,
        totalAmount: totalAmount + 5,
        description: '50% ahora, 50% antes del curso',
        features: ['Flexibilidad de pago', 'Pequeño recargo'],
        recommended: totalAmount >= 300 && totalAmount < 600
      },
      {
        id: 'deposit_plus_balance',
        name: 'Señal + Resto',
        type: 'deposit',
        installments: 2,
        firstPayment: 50,
        remainingPayments: [
          {
            amount: totalAmount - 50,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            description: 'Resto 2 semanas antes'
          }
        ],
        totalFees: 0,
        totalAmount: totalAmount,
        description: '€50 señal, resto 2 semanas antes',
        features: ['Mínimo inicial', 'Sin recargos'],
        recommended: totalAmount >= 600
      }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(plans);
        observer.complete();
      }, 400);
    });
  }

  /**
   * Simular procesamiento de pago
   */
  processPayment(paymentData: {
    amount: number;
    paymentMethod: string;
    planId: string;
    cardToken?: string;
    billingAddress?: any;
  }): Observable<any> {
    console.log('💰 [MOCK] Processing payment:', paymentData);
    
    // Simular diferentes resultados
    const success = Math.random() > 0.1; // 90% éxito
    
    const result = {
      success,
      transactionId: `TXN_${Date.now()}`,
      paymentMethod: paymentData.paymentMethod,
      amount: paymentData.amount,
      currency: 'EUR',
      status: success ? 'completed' : 'failed',
      timestamp: new Date(),
      receipt: {
        number: `REC_${Date.now()}`,
        downloadUrl: success ? 'https://example.com/receipt.pdf' : undefined
      },
      nextPayment: paymentData.planId !== 'immediate' ? {
        amount: 200,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        method: 'auto_charge'
      } : undefined,
      error: success ? undefined : {
        code: 'CARD_DECLINED',
        message: 'La tarjeta fue rechazada',
        retryable: true
      }
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(result);
        observer.complete();
      }, 2000); // Simular tiempo de procesamiento
    });
  }

  /**
   * Obtener métodos de pago disponibles
   */
  getPaymentMethods(clientId?: number): Observable<any[]> {
    console.log('💳 [MOCK] Getting payment methods for client:', clientId);
    
    const methods = [
      {
        id: 'card',
        name: 'Tarjeta de Crédito/Débito',
        type: 'card',
        icon: 'credit_card',
        fees: 0,
        processing: 'immediate',
        supported: ['visa', 'mastercard', 'amex'],
        features: ['Pago inmediato', 'Sin recargos']
      },
      {
        id: 'paypal',
        name: 'PayPal',
        type: 'wallet',
        icon: 'paypal',
        fees: 2.5, // %
        processing: 'immediate',
        features: ['Protección del comprador', 'Pequeño recargo']
      },
      {
        id: 'bank_transfer',
        name: 'Transferencia Bancaria',
        type: 'transfer',
        icon: 'account_balance',
        fees: 0,
        processing: '1-2 días',
        features: ['Sin recargos', 'Procesamiento lento'],
        note: 'Confirmación sujeta a recepción del pago'
      },
      {
        id: 'bizum',
        name: 'Bizum',
        type: 'mobile',
        icon: 'smartphone',
        fees: 0,
        processing: 'immediate',
        maxAmount: 500,
        features: ['Instantáneo', 'Solo España']
      }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(methods);
        observer.complete();
      }, 300);
    });
  }

  /**
   * Aplicar descuento automático
   */
  applyAutoDiscounts(bookingData: any): Observable<any[]> {
    console.log('🤖 [MOCK] Applying auto discounts:', bookingData);
    
    const autoDiscounts = [
      {
        id: 'loyalty',
        name: 'Cliente Fiel',
        type: 'percentage',
        value: 10,
        applied: true,
        reason: 'Más de 5 reservas en el último año',
        savings: 28.5
      },
      {
        id: 'group',
        name: 'Descuento Grupo',
        type: 'percentage',
        value: 5,
        applied: bookingData.participantCount >= 4,
        reason: '4 o más participantes',
        savings: bookingData.participantCount >= 4 ? 14.25 : 0
      },
      {
        id: 'weather',
        name: 'Condiciones Óptimas',
        type: 'fixed',
        value: 15,
        applied: true,
        reason: 'Excelentes condiciones meteorológicas',
        savings: 15
      }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(autoDiscounts);
        observer.complete();
      }, 600);
    });
  }

  /**
   * Generar factura pro-forma
   */
  generateProformaInvoice(bookingData: any): Observable<any> {
    console.log('📄 [MOCK] Generating proforma invoice:', bookingData);
    
    const invoice = {
      id: `PROF_${Date.now()}`,
      number: `PF-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      type: 'proforma',
      issueDate: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      client: {
        name: 'Cliente Ejemplo',
        email: 'cliente@example.com',
        address: 'Dirección del cliente'
      },
      items: [
        {
          description: 'Curso de Esquí Principiante',
          quantity: bookingData.participantCount || 1,
          unitPrice: 285,
          total: 285 * (bookingData.participantCount || 1)
        }
      ],
      subtotal: 285 * (bookingData.participantCount || 1),
      discounts: -25,
      taxes: 54.6,
      total: 314.6,
      currency: 'EUR',
      notes: 'Esta factura pro-forma es válida durante 30 días.',
      downloadUrl: 'https://example.com/proforma.pdf'
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(invoice);
        observer.complete();
      }, 1000);
    });
  }
}