import { Provider } from '@angular/core';
import { environment } from '../../../../environments/environment';

// Import mock services
import { BookingV3Service } from './booking-v3.service';
import { ClientV3Service } from './client-v3.service';
import { WizardStateService } from './wizard-state.service';

/**
 * Service Factory for BookingV3 Module
 * 
 * This factory allows switching between mock and real services
 * based on environment configuration.
 * 
 * When environment.useRealServices = false: Uses mock data services
 * When environment.useRealServices = true: Uses real API services
 * 
 * The services themselves handle this logic internally, so we just
 * provide the standard services here.
 */

export const BOOKING_V3_PROVIDERS: Provider[] = [
  // Core Services (these handle mock/real switching internally)
  BookingV3Service,
  ClientV3Service,
  WizardStateService,
  
  // Service Factory Tokens (if needed in the future)
  // {
  //   provide: 'BOOKING_SERVICE_CONFIG',
  //   useValue: {
  //     useRealServices: environment.useRealServices,
  //     apiUrl: environment.apiUrl,
  //     mockDelay: environment.mockDelay || 1000
  //   }
  // }
];

/**
 * Helper function to create service instances programmatically
 * (if needed for advanced use cases)
 */
export function createBookingV3ServiceFactory() {
  return {
    bookingService: new BookingV3Service(),
    clientService: new ClientV3Service(),
    wizardService: new WizardStateService()
  };
}

/**
 * Configuration helper for determining service mode
 */
export function getServiceMode(): 'mock' | 'real' {
  return environment.useRealServices ? 'real' : 'mock';
}

console.log(`🏭 BookingV3 Service Factory initialized in ${getServiceMode()} mode`);