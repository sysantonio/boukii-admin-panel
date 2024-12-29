import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-select',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class ComponenteSelectComponent {
  @Input() control!: string
  @Input() value!: string
  @Input() label!: string
  @Input() type: "number" | "text" | "tel" | "email" = "text"
  @Input() form!: FormGroup
  @Input() required: boolean = false

  @Input() table!: any[]
  @Input() id!: string
  @Input() name!: string

  @Output() do = new EventEmitter()

  displayFn = (value: any): string => this.id && this.name ? this.table.find((a: any) => a[this.id] === value)[this.name] : value

}
