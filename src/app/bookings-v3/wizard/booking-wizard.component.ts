import { Component, inject } from '@angular/core';
import { SMART_BOOKING_SERVICE, SMART_CLIENT_SERVICE, ACTIVITY_SELECTION_SERVICE, SCHEDULE_SELECTION_SERVICE, PARTICIPANT_DETAILS_SERVICE, PRICING_CONFIRMATION_SERVICE } from '../services/service.factory';
import { WizardStateService } from './wizard-state.service';

@Component({
  selector: 'app-booking-wizard',
  template: `
    <div class="p-6 space-y-4">
      <h2 class="text-xl font-semibold">Booking Wizard</h2>
      <ng-container [ngSwitch]="wizard.currentStep">
        <app-client-selection-step *ngSwitchCase="1" (complete)="next()"></app-client-selection-step>
        <app-activity-selection-step *ngSwitchCase="2" (complete)="next()"></app-activity-selection-step>
        <app-schedule-selection-step *ngSwitchCase="3" (complete)="next()"></app-schedule-selection-step>
        <app-participant-details-step *ngSwitchCase="4" (complete)="next()"></app-participant-details-step>
        <app-pricing-confirmation-step *ngSwitchCase="5" (complete)="next()"></app-pricing-confirmation-step>
        <app-final-review-step *ngSwitchCase="6" (complete)="reset()"></app-final-review-step>
      </ng-container>
      <div class="flex justify-between pt-4">
        <button mat-button (click)="prev()" [disabled]="wizard.currentStep === 1">Back</button>
        <span>Step {{ wizard.currentStep }} / {{ wizard.getState().totalSteps }}</span>
      </div>
    </div>
  `
})
export class BookingWizardComponent {
  wizard = inject(WizardStateService);
  bookingService = inject(SMART_BOOKING_SERVICE);
  clientService = inject(SMART_CLIENT_SERVICE);
  activityService = inject(ACTIVITY_SELECTION_SERVICE);
  scheduleService = inject(SCHEDULE_SELECTION_SERVICE);
  participantService = inject(PARTICIPANT_DETAILS_SERVICE);
  pricingService = inject(PRICING_CONFIRMATION_SERVICE);

  next() { this.wizard.nextStep(); }
  prev() { this.wizard.prevStep(); }
  reset() { this.wizard.reset(); }
}
