import { inject, InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

import { SmartBookingService } from './smart-booking.service';
import { SmartClientService } from './smart-client.service';
import { ClientAnalyticsService } from './client-analytics.service';
import { ActivitySelectionService } from './activity-selection.service';
import { ScheduleSelectionService } from './schedule-selection.service';
import { ParticipantDetailsService } from './participant-details.service';
import { PricingConfirmationService } from './pricing-confirmation.service';

import { SmartBookingServiceMock } from './mock/smart-booking.service.mock';
import { SmartClientServiceMock } from './mock/smart-client.service.mock';
import { ClientAnalyticsServiceMock } from './mock/client-analytics.service.mock';
import { ActivitySelectionServiceMock } from './mock/activity-selection.service.mock';
import { ScheduleSelectionServiceMock } from './mock/schedule-selection.service.mock';
import { ParticipantDetailsServiceMock } from './mock/participant-details.service.mock';
import { PricingConfirmationServiceMock } from './mock/pricing-confirmation.service.mock';

export const SMART_BOOKING_SERVICE = new InjectionToken<SmartBookingService>('SmartBookingService');
export const SMART_CLIENT_SERVICE = new InjectionToken<SmartClientService>('SmartClientService');
export const CLIENT_ANALYTICS_SERVICE = new InjectionToken<ClientAnalyticsService>('ClientAnalyticsService');
export const ACTIVITY_SELECTION_SERVICE = new InjectionToken<ActivitySelectionService>('ActivitySelectionService');
export const SCHEDULE_SELECTION_SERVICE = new InjectionToken<ScheduleSelectionService>('ScheduleSelectionService');
export const PARTICIPANT_DETAILS_SERVICE = new InjectionToken<ParticipantDetailsService>('ParticipantDetailsService');
export const PRICING_CONFIRMATION_SERVICE = new InjectionToken<PricingConfirmationService>('PricingConfirmationService');

export function smartBookingServiceFactory() {
  return environment.useRealServices ?
    inject(SmartBookingService) :
    inject(SmartBookingServiceMock);
}

export function smartClientServiceFactory() {
  return environment.useRealServices ?
    inject(SmartClientService) :
    inject(SmartClientServiceMock);
}

export function clientAnalyticsServiceFactory() {
  return environment.useRealServices ?
    inject(ClientAnalyticsService) :
    inject(ClientAnalyticsServiceMock);
}

export function activitySelectionServiceFactory() {
  return environment.useRealServices ?
    inject(ActivitySelectionService) :
    inject(ActivitySelectionServiceMock);
}

export function scheduleSelectionServiceFactory() {
  return environment.useRealServices ?
    inject(ScheduleSelectionService) :
    inject(ScheduleSelectionServiceMock);
}

export function participantDetailsServiceFactory() {
  return environment.useRealServices ?
    inject(ParticipantDetailsService) :
    inject(ParticipantDetailsServiceMock);
}

export function pricingConfirmationServiceFactory() {
  return environment.useRealServices ?
    inject(PricingConfirmationService) :
    inject(PricingConfirmationServiceMock);
}

export const BOOKING_V3_PROVIDERS = [
  { provide: SMART_BOOKING_SERVICE, useFactory: smartBookingServiceFactory },
  { provide: SMART_CLIENT_SERVICE, useFactory: smartClientServiceFactory },
  { provide: CLIENT_ANALYTICS_SERVICE, useFactory: clientAnalyticsServiceFactory },
  { provide: ACTIVITY_SELECTION_SERVICE, useFactory: activitySelectionServiceFactory },
  { provide: SCHEDULE_SELECTION_SERVICE, useFactory: scheduleSelectionServiceFactory },
  { provide: PARTICIPANT_DETAILS_SERVICE, useFactory: participantDetailsServiceFactory },
  { provide: PRICING_CONFIRMATION_SERVICE, useFactory: pricingConfirmationServiceFactory }
];
