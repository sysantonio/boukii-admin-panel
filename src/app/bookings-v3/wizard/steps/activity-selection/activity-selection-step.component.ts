import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ACTIVITY_SELECTION_SERVICE } from '../../../services/service.factory';
import { WizardStateService } from '../../wizard-state.service';

@Component({
  selector: 'app-activity-selection-step',
  templateUrl: './activity-selection-step.component.html'
})
export class ActivitySelectionStepComponent {
  private fb = inject(FormBuilder);
  private wizard = inject(WizardStateService);
  private activityService = inject(ACTIVITY_SELECTION_SERVICE);

  form: FormGroup = this.fb.group({ course: [''] });

  @Output() complete = new EventEmitter<void>();

  submit() {
    this.wizard.setStepData('activity', this.form.value);
    this.activityService.getAvailableSports?.().subscribe?.();
    this.complete.emit();
  }
}
