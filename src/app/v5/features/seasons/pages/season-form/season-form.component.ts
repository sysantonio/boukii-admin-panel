import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import {FormBuilderService} from '../../../../core/services/form-builder.service';
import {requiredTrimmed} from '../../../../core/utils/validators';


@Component({
  selector: 'vex-season-form',
  templateUrl: './season-form.component.html',
  styleUrls: ['./season-form.component.scss']
})
export class SeasonFormComponent {
  form: FormGroup;

  constructor(private fbs: FormBuilderService) {
    this.form = this.fbs.group({
      name: ['', [Validators.required, requiredTrimmed()]]
    });
  }

  submit(): void {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
