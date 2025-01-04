import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-form-datepicker',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class ComponenteComponent {
  @Input() control!: string
  @Input() value: Date = new Date()
  @Input() name!: string
  @Input() form!: FormGroup
  @Input() required: boolean = false
  @Input() startAt: Date = new Date()
  @Input() min: Date = new Date()
  @Input() max: Date = new Date(2099, 12, 31);
  @Output() do = new EventEmitter()

  get c(): { [key: string]: AbstractControl } { return this.form.controls; }

  constructor(private TranslateService: TranslateService) { }
  getErrorMessage(controlName: string): string {
    const control = this.c[controlName];
    if (control.errors) {
      for (const errorKey in control.errors) {
        if (control.errors.hasOwnProperty(errorKey)) {
          const params = control.errors[errorKey];
          return this.TranslateService.instant(`errors.${errorKey}`, params);
        }
      }
    }
    return '';
  }

}
