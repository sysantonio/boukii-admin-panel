import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SMART_CLIENT_SERVICE } from '../../../services/service.factory';
import { WizardStateService } from '../../wizard-state.service';

@Component({
  selector: 'app-client-selection-step',
  templateUrl: './client-selection-step.component.html'
})
export class ClientSelectionStepComponent {
  private fb = inject(FormBuilder);
  private wizard = inject(WizardStateService);
  private clientService = inject(SMART_CLIENT_SERVICE);

  form: FormGroup = this.fb.group({ clientId: [''] });

  @Output() complete = new EventEmitter<void>();

  submit() {
    this.wizard.setStepData('client', this.form.value);
    // Example integration with service
    this.clientService.searchClients?.(this.form.value.clientId)?.subscribe?.();
    this.complete.emit();
  }
}
