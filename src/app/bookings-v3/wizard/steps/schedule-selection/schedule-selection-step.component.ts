import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SCHEDULE_SELECTION_SERVICE } from '../../../services/service.factory';
import { WizardStateService } from '../../wizard-state.service';

@Component({
  selector: 'app-schedule-selection-step',
  templateUrl: './schedule-selection-step.component.html'
})
export class ScheduleSelectionStepComponent {
  private fb = inject(FormBuilder);
  private wizard = inject(WizardStateService);
  private scheduleService = inject(SCHEDULE_SELECTION_SERVICE);

  form: FormGroup = this.fb.group({ date: [null] });

  @Output() complete = new EventEmitter<void>();

  submit() {
    this.wizard.setStepData('schedule', this.form.value);
    this.scheduleService.getAvailabilityCalendar?.(0).subscribe?.();
    this.complete.emit();
  }
}
