import { inject, InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

import { SmartBookingService } from './smart-booking.service';
import { SmartBookingServiceMock } from './mock/smart-booking.service.mock';

export const SMART_BOOKING_SERVICE = new InjectionToken<SmartBookingService>('SmartBookingService');

export function smartBookingServiceFactory() {
  return environment.useRealServices ?
    inject(SmartBookingService) :
    inject(SmartBookingServiceMock);
}

export const BOOKING_V3_PROVIDERS = [
  { provide: SMART_BOOKING_SERVICE, useFactory: smartBookingServiceFactory }
];
