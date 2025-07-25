import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PRICING_CONFIRMATION_SERVICE } from '../../../services/service.factory';
import { WizardStateService } from '../../wizard-state.service';

@Component({
  selector: 'app-pricing-confirmation-step',
  templateUrl: './pricing-confirmation-step.component.html'
})
export class PricingConfirmationStepComponent {
  private fb = inject(FormBuilder);
  private wizard = inject(WizardStateService);
  private pricingService = inject(PRICING_CONFIRMATION_SERVICE);

  form: FormGroup = this.fb.group({ agree: [false] });

  @Output() complete = new EventEmitter<void>();

  submit() {
    this.wizard.setStepData('pricing', this.form.value);
    this.pricingService.getPaymentPlans?.(0).subscribe?.();
    this.complete.emit();
  }
}
