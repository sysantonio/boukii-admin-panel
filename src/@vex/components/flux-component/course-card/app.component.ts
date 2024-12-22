import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'vex-course-detail-card',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class CourseDetailCardComponent implements OnChanges {

  @Input() courseFormGroup!: UntypedFormGroup
  @Input() detail: boolean = false
  @Input() step: number = 0
  @Input() mode: 'create' | 'update' = "create"
  @Output() close = new EventEmitter()
  @Output() open = new EventEmitter<number>()
  @Output() edit = new EventEmitter<number>()

  week: string[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",]
  find = (array: any[], key: string, value: string) => array.find((a: any) => a[key] === value)
  count = (array: any[], key: string) => Boolean(array.map((a: any) => a[key]).find((a: any) => a))
  DateISO = (value: string) => value ? new Date(value).toISOString().split("T")[0].replace("-", ".").replace("-", ".") : ''
  DateDiff = (value1: string, value2: string): number => Math.round((new Date(value2).getTime() - new Date(value1).getTime()) / 1000 / 60 / 60 / 24)
  ngOnChanges(): void {
    if (this.courseFormGroup.controls['id']) {
      const course_dates = []
      for (const [index, value] of this.courseFormGroup.controls['course_dates'].value.entries()) {
        if (index !== 0 && course_dates[course_dates.length - 1]["price"] === value["price"] &&
          course_dates[course_dates.length - 1]["hour_end"] === value["hour_end"] &&
          course_dates[course_dates.length - 1]["hour_start"] === value["hour_start"] &&
          new Date(value["date"]).getTime() - new Date(course_dates[course_dates.length - 1]["date_end"]).getTime() === 86400000
        ) {
          course_dates[course_dates.length - 1].date_end = value.date
        } else {
          course_dates.push(value)
          course_dates[course_dates.length - 1].date_end = value.date
        }
      }
      this.courseFormGroup.patchValue({ course_dates })
    }
  }
  JSONParse = (v: string) => JSON.parse(v)
}
