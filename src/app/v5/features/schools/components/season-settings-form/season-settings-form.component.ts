import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { FormBuilderService } from '../../../core/services/form-builder.service';
import { requiredTrimmed } from '../../../core/utils/validators';

@Component({
  selector: 'vex-season-settings-form',
  templateUrl: './season-settings-form.component.html',
  styleUrls: ['./season-settings-form.component.scss']
})
export class SeasonSettingsFormComponent {
  form: FormGroup;

  constructor(private fbs: FormBuilderService) {
    this.form = this.fbs.group({
      description: ['', [Validators.required, requiredTrimmed()]]
    });
  }

  submit(): void {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
