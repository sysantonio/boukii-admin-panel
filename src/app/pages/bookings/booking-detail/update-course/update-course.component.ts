import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';
import { Observable, map, startWith } from 'rxjs';
import { ApiCrudService } from 'src/service/crud.service';

@Component({
  selector: 'vex-update-course',
  templateUrl: './update-course.component.html',
  styleUrls: ['./update-course.component.scss']
})
export class UpdateCourseModalComponent implements OnInit {

  selectedDates: any = [];
  dates: any = [];
  form: UntypedFormGroup;
  datesControl = new FormControl();

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any, private crudService: ApiCrudService, private dialogRef: MatDialogRef<any>, private fb: UntypedFormBuilder) {

  }

  ngOnInit(): void {

    const ids = [];
    this.defaults.dates.forEach(element => {
      ids.push(element.course_date_id);
    });
    this.datesControl.patchValue(ids)

    this.selectedDates = this.defaults.course.course_dates.filter((d) => moment(d.date).isSameOrAfter(moment()));
    this.dates = this.defaults.dates;
  }

  closeModal() {

    const data = [];

    this.datesControl.value.forEach(element => {
      const date = this.defaults.course.course_dates.filter((d) => d.id === element);
      data.push({
        school_id: this.defaults.mainBooking.school_id,
        booking_id: this.defaults.mainBooking.id,
        client_id: this.defaults.mainBooking.client_id,
        course_id: this.defaults.mainBooking.course_id,
        course_date_id: element,
        monitor_id: this.defaults.mainBooking.monitor_id,
        hour_start: this.defaults.mainBooking.hour_start,
        hour_end: this.defaults.mainBooking.hour_end, //calcular en base a la duracion del curso
        price: this.defaults.mainBooking.price,
        currency: this.defaults.mainBooking.currency,
        notes: this.defaults.mainBooking.notes,
        school_notes: this.defaults.mainBooking.school_notes,
        date: moment(date[0].date).format('YYYY-MM-DD')
      })
    });

    console.log(data);

    /*this.dialogRef.close({
    })*/
  }

}
