import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';
import { Observable, forkJoin, map, startWith } from 'rxjs';
import { ApiCrudService } from 'src/service/crud.service';
import { ConfirmModalEditBookingComponent } from '../../bookings-create-update-edit/confirm-dialog-edit-booking/confirm-dialog-edit-booking.component';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalComponent } from 'src/app/pages/monitors/monitor-detail/confirm-dialog/confirm-dialog.component';

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

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any, private crudService: ApiCrudService, private dialogRef: MatDialogRef<any>, private translateService: TranslateService, private dialog: MatDialog) {

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

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      data: {title: this.translateService.instant('update_booking_title'), message: this.translateService.instant('update_booking_message')}
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {


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
          });
        });

        let discountReduction = 0;
        const discounts = typeof this.defaults.course.discounts === 'string' ? JSON.parse(this.defaults.course.discounts) : this.defaults.course.discounts;
          //ret = ret + (b?.courseDates[0].price * b.courseDates.length);
          discounts.forEach(element => {
            if (element.date === this.datesControl.value.length) {
              discountReduction = -(this.defaults.course.price * this.datesControl.value.length * (element.percentage / 100));
            }
          });

        const basePrice = this.defaults.course.course_type === 2 ? this.defaults.mainBooking.price : (this.defaults.course.price * this.datesControl.value.length);
        let price = basePrice + discountReduction;
        let boukiiCarePrice = 0;
        let canInsurance = 0;
        let tva = 0;

        if (this.defaults.boukiiCarePrice && this.defaults.boukiiCarePrice > 0) {
          price = price + (this.defaults.boukiiCarePrice * this.defaults.clientIds.length * this.datesControl.value.length);
          boukiiCarePrice = (this.defaults.boukiiCarePrice * this.defaults.clientIds.length * this.datesControl.value.length);
        }

        if (this.defaults.cancellationInsurance && this.defaults.cancellationInsurance > 0) {
          price = price + (this.defaults.cancellationInsurance * (basePrice + (discountReduction)))
          canInsurance = (this.defaults.cancellationInsurance * (basePrice + (discountReduction)))
        }

        if (this.defaults.tva && this.defaults.tva > 0) {
          price = price + (price * this.defaults.tva);
          tva = (price * this.defaults.tva);
        }

        const bookingData = {
          has_boukii_care: this.defaults.boukiiCarePrice && this.defaults.boukiiCarePrice > 0,
          has_cancellation_insurance: this.defaults.cancellationInsurance && this.defaults.cancellationInsurance > 0,
          price_boukii_care: this.defaults.boukiiCarePrice && this.defaults.boukiiCarePrice > 0 ? boukiiCarePrice : 0,
          price_cancellation_insurance: this.defaults.cancellationInsurance && this.defaults.cancellationInsurance > 0 ? canInsurance : 0,
          price_total: price
        };

        this.crudService.update('/bookings', bookingData, this.defaults.mainBooking.booking_id)
          .subscribe(() => {})

        const rqs = [];
        this.defaults.dates.forEach(element => {
          rqs.push(this.crudService.delete('/booking-users', element.id));

        });

        forkJoin(rqs)
          .subscribe(() => {
            this.defaults.clientIds.forEach(client => {
              data.forEach(bu => {
                const basePrice = this.defaults.course.course_type === 2 ? this.defaults.mainBooking.price : parseFloat(this.defaults.course.price);
                bu.client_id = parseInt(client);
                bu.price = parseInt(client) == this.defaults.mainBooking.client_id ? basePrice : 0;
                this.crudService.create('/booking-users', bu)
                  .subscribe((bookingUser) => {

                      const bookingUserExtra = {
                        booking_user_id: bookingUser.data.id,
                        course_extra_id: null,
                      };

                      const courseExtra = {
                        course_id: this.defaults.course.id,
                        name: this.defaults.courseExtra[0].name,
                        description: this.defaults.courseExtra[0].description,
                        price: this.defaults.courseExtra[0].price
                      };

                      this.crudService.create('/course-extras', courseExtra)
                        .subscribe((responseCourseExtra) => {

                          bookingUserExtra.course_extra_id = responseCourseExtra.data.id;
                          this.crudService.create('/booking-user-extras', bookingUserExtra)
                          .subscribe((bookExtra) => {

                          })

                        })
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
    });
  }

}
