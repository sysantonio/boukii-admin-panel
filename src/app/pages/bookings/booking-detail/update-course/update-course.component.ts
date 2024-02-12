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
  hourStart = '';
  noAvailableMonitorDate = [];

  constructor(@Inject(MAT_DIALOG_DATA) public defaults: any, private crudService: ApiCrudService, private dialogRef: MatDialogRef<any>,
    private translateService: TranslateService, private dialog: MatDialog, private snackbar: MatSnackBar) {

  }

  ngOnInit(): void {

    this.hourStart = this.defaults.mainBooking.hour_start;
    this.hourStart = this.hourStart.replace(':00', '');
    const ids = [];
    this.defaults.dates.forEach(element => {
      ids.push(element.course_date_id);
    });
    this.datesControl.patchValue(ids)

    this.selectedDates = this.defaults.course.course_dates;
    this.dates = this.defaults.dates;
  }

  transformTime(time: string): string {
    let duration = moment.duration(time);
    let hours = duration.hours();
    let minutes = duration.minutes();
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  }

  calculateAvailableHours(selectedCourseDateItem: any, time: any) {

    const start = moment(selectedCourseDateItem.hour_start, 'HH:mm:ss');
    const end = moment(selectedCourseDateItem.hour_end, 'HH:mm:ss');

    const hour = moment(time, 'HH:mm')

    return hour.isSameOrBefore(start) && hour.isSameOrAfter(end);
  }

  generateCourseHours(startTime: string, endTime: string, mainDuration: string, interval: string): string[] {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const intervalParts = interval.split(' ');
    const mainDurationParts = mainDuration.split(' ');

    let intervalHours = 0;
    let intervalMinutes = 0;
    let mainDurationHours = 0;
    let mainDurationMinutes = 0;

    intervalParts.forEach(part => {
        if (part.includes('h')) {
            intervalHours = parseInt(part, 10);
        } else if (part.includes('min')) {
            intervalMinutes = parseInt(part, 10);
        }
    });

    mainDurationParts.forEach(part => {
        if (part.includes('h')) {
            mainDurationHours = parseInt(part, 10);
        } else if (part.includes('min')) {
            mainDurationMinutes = parseInt(part, 10);
        }
    });

    let currentHours = startHours;
    let currentMinutes = startMinutes;
    const result = [];

    while (true) {
        let nextIntervalEndHours = currentHours + mainDurationHours;
        let nextIntervalEndMinutes = currentMinutes + mainDurationMinutes;

        nextIntervalEndHours += Math.floor(nextIntervalEndMinutes / 60);
        nextIntervalEndMinutes %= 60;

        if (nextIntervalEndHours > endHours || (nextIntervalEndHours === endHours && nextIntervalEndMinutes > endMinutes)) {
            break;
        }

        result.push(`${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`);

        currentMinutes += intervalMinutes;
        currentHours += intervalHours + Math.floor(currentMinutes / 60);
        currentMinutes %= 60;

        if (currentHours > endHours || (currentHours === endHours && currentMinutes >= endMinutes)) {
            break;
        }
    }

    return result;
  }


  isAfter(date: any) {
    return moment(date.date).isAfter(moment());
  }

  calculateHourEnd(hour: any, duration: any) {
    if(duration.includes('h') && duration.includes('min')) {
      const hours = duration.split(' ')[0].replace('h', '');
      const minutes = duration.split(' ')[1].replace('min', '');

      return moment(hour, 'HH:mm').add(hours, 'h').add(minutes, 'm').format('HH:mm');
    } else if(duration.includes('h')) {
      const hours = duration.split(' ')[0].replace('h', '');

      return moment(hour, 'HH:mm').add(hours, 'h').format('HH:mm');
    } else {
      const minutes = duration.split(' ')[0].replace('min', '');

      return moment(hour, 'HH:mm').add(minutes, 'm').format('HH:mm');
    }
  }

  closeModal() {

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      data: {title: this.translateService.instant('update_booking_title'), message: this.translateService.instant('update_booking_message')}
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        const monitorAvailableRQS = [];

        this.datesControl.value.forEach(element => {
          const date = this.defaults.course.course_dates.filter((d) => d.id === element);
          const degreeId = this.defaults.dates.find((d) => d.course_date_id === element)?.degree_id;
          monitorAvailableRQS.push(this.checkAvailableMonitors(this.defaults.course.course_type === 2 ? this.hourStart : this.defaults.mainBooking.hour_start,
            this.defaults.course.duration, moment(date[0].date).format('YYYY-MM-DD'), degreeId ? degreeId : this.defaults.dates[0].degree_id));

        });


        forkJoin(monitorAvailableRQS)
          .subscribe((monitorsResponse) => {
            const data = [];

            this.datesControl.value.forEach((element, idx) => {
              const date = this.defaults.dates.filter((d) => d.id === element);

              if (date[0].monitor_id !== null) {
                const monitor = monitorsResponse[idx].data.find((m) => m.id === date[0].monitor_id);

                if (!monitor) {
                  this.noAvailableMonitorDate.push({date: date});
                }
              }
            });

            if (this.noAvailableMonitorDate.length > 0) {
              console.log(this.noAvailableMonitorDate);
            } else {

              this.datesControl.value.forEach(element => {
                // bucle a los monitores y comprobar que ese monitor esta libre
                const date = this.defaults.course.course_dates.filter((d) => d.id === element);
                const dateDegreeId = this.defaults.dates.find((d) => d.course_date_id === element)?.degree_id;
                const dateMonitorId = this.defaults.dates.find((d) => d.course_date_id === element)?.monitor_id;
                data.push({
                  school_id: this.defaults.mainBooking.school_id,
                  booking_id: this.defaults.mainBooking.booking_id,
                  client_id: this.defaults.mainBooking.client_id,
                  course_id: this.defaults.mainBooking.course_id,
                  course_date_id: element,
                  course_subgroup_id: this.defaults.mainBooking.course_subgroup_id,
                  course_group_id: this.defaults.mainBooking.course_group_id,
                  degree_id: dateDegreeId ? dateDegreeId : null,
                  monitor_id: dateMonitorId ? dateMonitorId : null,
                  hour_start: this.defaults.course.course_type === 2 ? this.hourStart : this.defaults.mainBooking.hour_start,
                  hour_end: this.defaults.course.course_type === 2 ? this.calculateHourEnd(this.hourStart, this.defaults.course.duration) : this.defaults.mainBooking.hour_end,
                  currency: this.defaults.mainBooking.currency,
                  notes: this.defaults.mainBooking.notes,
                  school_notes: this.defaults.mainBooking.school_notes,
                  date: moment(date[0].date).format('YYYY-MM-DD'),
                  attended: this.defaults.mainBooking.attended
                });
              });

              let discountReduction = 0;
              const discounts = typeof this.defaults.course.discounts === 'string' ? JSON.parse(this.defaults.course.discounts) : this.defaults.course.discounts;
                //ret = ret + (b?.courseDates[0].price * b.courseDates.length);
                if (discounts !== null) {
                  discounts.forEach(element => {
                    if (element.date === this.datesControl.value.length) {
                      discountReduction = -(this.defaults.course.price * this.datesControl.value.length * (element.percentage / 100));
                    }
                  });
                }


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

                          if (this.defaults.courseExtra.length > 0) {
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
                          }

                        })
                    });
                  });
                })



              setTimeout(() => {
                this.dialogRef.close(true)
              }, 1000);
            }
            /*this.dialogRef.close({})*/
          })
      }
    });
  }

  checkAvailableMonitors(start: any, duration: any, date, degreeId) {

    let data: any;
    if(this.defaults.course.is_flexible) {
      data = {
        sportId: this.defaults.course.sport_id,
        minimumDegreeId: degreeId,
        startTime: start,
        endTime: this.calculateHourEnd(start, duration),
        date: moment(date).format('YYYY-MM-DD'),
        clientIds: this.defaults.clientIds
      };
    } else{
      data = {
        sportId: this.defaults.course.sport_id,
        minimumDegreeId: degreeId,
        startTime: start,
        endTime: this.calculateHourEnd(start, this.defaults.course.duration),
        date: moment(date).format('YYYY-MM-DD'),
        clientIds: this.defaults.clientIds
      };
    }

    return this.crudService.post('/admin/monitors/available', data);
  }
}
