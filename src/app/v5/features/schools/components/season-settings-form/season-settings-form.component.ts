import { Component } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
// import { FormBuilderService } from '../../../core/services/form-builder.service'; // Comentado temporalmente
// import { requiredTrimmed } from '../../../core/utils/validators'; // Comentado temporalmente

@Component({
  selector: 'vex-season-settings-form',
  templateUrl: './season-settings-form.component.html',
  styleUrls: ['./season-settings-form.component.scss']
})
export class SeasonSettingsFormComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      description: ['', [Validators.required]]
    });
  }

  submit(): void {
    if (this.form.valid) {
      console.log('Season settings form submitted:', this.form.value);
    }
  }
}
