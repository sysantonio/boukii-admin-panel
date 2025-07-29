import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function requiredTrimmed(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value || '').toString().trim();
    return value ? null : { required: true };
  };
}

export function matchValidator(matchTo: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) {
      return null;
    }
    const matching = parent.get(matchTo);
    return matching && control.value === matching.value ? null : { matching: true };
  };
}
