import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';
import { Observable, forkJoin, map, startWith } from 'rxjs';
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

    this.selectedDates = this.defaults.course.course_dates;
    this.dates = this.defaults.dates;
  }

  isAfter(date: any) {
    return moment(date.date).isSameOrAfter(moment());
  }

  closeModal() {

    const data = [];

    this.datesControl.value.forEach(element => {
      const date = this.defaults.course.course_dates.filter((d) => d.id === element);
      data.push({
        school_id: this.defaults.mainBooking.school_id,
        booking_id: this.defaults.mainBooking.booking_id,
        client_id: this.defaults.mainBooking.client_id,
        course_id: this.defaults.mainBooking.course_id,
        course_date_id: element,
        monitor_id: this.defaults.mainBooking.monitor_id,
        hour_start: this.defaults.mainBooking.hour_start,
        hour_end: this.defaults.mainBooking.hour_end, //calcular en base a la duracion del curso
        currency: this.defaults.mainBooking.currency,
        notes: this.defaults.mainBooking.notes,
        school_notes: this.defaults.mainBooking.school_notes,
        date: moment(date[0].date).format('YYYY-MM-DD')
      })
    });

    console.log(data);


    const rqs = [];
    this.defaults.dates.forEach(element => {
      rqs.push(this.crudService.delete('/booking-users', element.id));

    });

    forkJoin(rqs)
      .subscribe(() => {
        this.defaults.clientIds.forEach(client => {
          data.forEach(bu => {
            bu.client_id = parseInt(client);
            bu.price = parseInt(client) == this.defaults.mainBooking.client_id ? this.defaults.mainBooking.price : 0;
            this.crudService.create('/booking-users', bu)
              .subscribe((bookingUser) => {

              })
          });
        });
      })



    setTimeout(() => {
      this.dialogRef.close(true)
    }, 1000);

    /*this.dialogRef.close({
    })*/
  }

}
