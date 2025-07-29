import { Injectable } from '@angular/core';
import { FormBuilder, AbstractControlOptions, FormGroup, FormArray, FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {
  constructor(private fb: FormBuilder) {}

  group(controlsConfig: {[key: string]: any}, options?: AbstractControlOptions): FormGroup {
    return this.fb.group(controlsConfig, options);
  }

  control(formState: any, validatorOrOpts?: any, asyncValidator?: any): FormControl {
    return this.fb.control(formState, validatorOrOpts, asyncValidator);
  }

  array(controls: any[], validatorOrOpts?: any, asyncValidator?: any): FormArray {
    return this.fb.array(controls, validatorOrOpts, asyncValidator);
  }
}
