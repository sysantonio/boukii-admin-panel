import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'vex-course-detail-nivel',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class CourseDetailCardNivelComponent {

  @Input() courseFormGroup!: UntypedFormGroup
  week: string[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",]
  find = (array: any[], key: string, value: string) => array.find((a: any) => a[key] === value)
  count = (array: any[], key: string) => Boolean(array.map((a: any) => a[key]).find((a: any) => a))
  DateISO = (value: string) => value ? new Date(value).toISOString().split("T")[0].replace("-", ".").replace("-", ".") : ''
  DateDiff = (value1: string, value2: string): number => Math.round((new Date(value2).getTime() - new Date(value1).getTime()) / 1000 / 60 / 60 / 24)

}
