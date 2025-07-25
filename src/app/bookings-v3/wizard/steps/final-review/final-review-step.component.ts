import { Component, EventEmitter, Output, inject } from '@angular/core';
import { WizardStateService } from '../../wizard-state.service';

@Component({
  selector: 'app-final-review-step',
  templateUrl: './final-review-step.component.html'
})
export class FinalReviewStepComponent {
  private wizard = inject(WizardStateService);

  @Output() complete = new EventEmitter<void>();

  get state() {
    return this.wizard.getState();
  }

  finish() {
    this.complete.emit();
    this.wizard.reset();
  }
}
