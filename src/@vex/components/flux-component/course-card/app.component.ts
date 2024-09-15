import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'vex-course-detail-card',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class CourseDetailCardComponent {

  @Input() courseFormGroup!: UntypedFormGroup
  @Input() detail: boolean = false
  @Output() close = new EventEmitter()
  @Output() open = new EventEmitter<number>()
  @Output() edit = new EventEmitter<number>()
  find = (array: any[], key: string, value: string) => array.find((a: any) => a[key] === value)
  count = (array: any[], key: string) => Boolean(array.map((a: any) => a[key]).find((a: any) => a))
  DateISO = (value: string) => value ? new Date(value).toISOString().split("T")[0] : ''
  DateDiff = (value1: string, value2: string): number => Math.round((new Date(value2).getTime() - new Date(value1).getTime()) / 1000 / 60 / 60 / 24)

}
