import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PARTICIPANT_DETAILS_SERVICE } from '../../../services/service.factory';
import { WizardStateService } from '../../wizard-state.service';

@Component({
  selector: 'app-participant-details-step',
  templateUrl: './participant-details-step.component.html'
})
export class ParticipantDetailsStepComponent {
  private fb = inject(FormBuilder);
  private wizard = inject(WizardStateService);
  private participantService = inject(PARTICIPANT_DETAILS_SERVICE);

  form: FormGroup = this.fb.group({ count: [1] });

  @Output() complete = new EventEmitter<void>();

  submit() {
    this.wizard.setStepData('participants', this.form.value);
    this.participantService.getSkillLevels?.().subscribe?.();
    this.complete.emit();
  }
}
