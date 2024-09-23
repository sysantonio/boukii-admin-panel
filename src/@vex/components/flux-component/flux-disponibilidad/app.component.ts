import { Component, Input, } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'vex-flux-disponibilidad',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class FluxDisponibilidadComponent {
  cambiarModal: boolean = false
  @Input() mode: 'create' | 'update' = "create"
  @Input() courseFormGroup!: UntypedFormGroup

  ISODate = (n: number) => new Date(new Date().getTime() + n * 24 * 60 * 60 * 1000).toISOString()
  displayFn = (value: any): string => value
  ramdonColor = () => Math.random() > 0.5 ? "#2FAA41" : Math.random() > 0.5 ? "#FFCF25" : Math.random() > 0.5 ? '#E70F0F' : '#C7D0D3'
  selectDate: number = 0

}


