import { Component, Inject, OnInit, Optional } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { BookingService } from '../../../../service/bookings.service';
import { ApiCrudService } from '../../../../service/crud.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingDialogComponent } from '../bookings-create-update/components/booking-dialog/booking-dialog.component';

@Component({
  selector: 'booking-detail-v2',
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.scss']
})
export class BookingDetailV2Component implements OnInit {
  payModal: boolean = false;
  deleteModal: boolean = false
  endModal: boolean = false
  deleteIndex: number = 1
  mainClient: any;
  bookingData$ = new BehaviorSubject<any>(null);
  groupedActivities: any[] = [];
  id: number;
  private activitiesChangedSubject = new Subject<void>();

  activitiesChanged$ = this.activitiesChangedSubject.asObservable();

  constructor(
    public translateService: TranslateService,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    public bookingService: BookingService,
    private crudService: ApiCrudService,
    private snackbar: MatSnackBar,
    @Optional() @Inject(MAT_DIALOG_DATA) public incData: any
  ) {

  }

  ngOnInit(): void {
    if (!this.incData) this.id = this.activatedRoute.snapshot.params.id;
    else this.id = this.incData.id;
    this.getBooking();
  }

  getBooking() {
    this.crudService
      .get("/bookings/" + this.id, [
        "user",
        "clientMain",
        "vouchersLogs.voucher",
        "bookingUsers.course.courseDates.courseGroups.courseSubgroups",
        "bookingUsers.course.courseExtras",
        "bookingUsers.bookingUserExtras.courseExtra",
        "bookingUsers.client",
        "bookingUsers.courseDate",
        "bookingUsers.monitor",
        "bookingUsers.degree",
        "payments",
        "bookingLogs"
      ])
      .subscribe((data) => {
        this.bookingData$.next(data.data);
        this.groupedActivities = this.groupBookingUsersByGroupId(data.data);
      });
  }

  groupBookingUsersByGroupId(booking: any) {
    this.mainClient = booking.client_main;
    const groupedActivities = booking.booking_users.reduce((acc: any, user: any) => {
      const groupId = user.group_id;
      const courseType = user.course.course_type;

      if (!acc[groupId]) {
        acc[groupId] = {
          sport: user.course.sport,
          course: user.course,
          sportLevel: user.degree,
          dates: [],
          monitors: [],
          utilizers: [],
          clientObs: user.notes,
          schoolObs: user.notes_school,
          total: user.price,
          status: user.status
        };
      }

      const currentStatus = acc[groupId].status;
      if (currentStatus !== user.status) {
        if (currentStatus !== 3) acc[groupId].status = (user.status === 1) ? currentStatus : 3;
      }

      const isUserAlreadyAdded = acc[groupId].utilizers.some(utilizer =>
        utilizer.first_name === user.client.first_name &&
        utilizer.last_name === user.client.last_name
      );

      if (!isUserAlreadyAdded) {
        acc[groupId].utilizers.push({
          id: user.client_id,
          first_name: user.client.first_name,
          last_name: user.client.last_name,
          image: user.client.image || null,
          birth_date: user.client.birth_date,
          language1_id: user.client.language1_id,
          country: user.client.country,
          extras: []
        });
      }
      const dateIndex = acc[groupId].dates.findIndex((date: any) =>
        date.id === user.course_date_id &&
        date.startHour === user.hour_start &&
        date.endHour === user.hour_end
      );
      if (dateIndex === -1) {
        acc[groupId].dates.push({
          id: user.course_date_id,
          date: user.course_date?.date,
          startHour: user.hour_start,
          endHour: user.hour_end,
          duration: user.formattedDuration,
          currency: booking.currency,
          monitor: user.monitor,
          utilizers: [],
          extras: [],
          booking_users: [],
        });
      }
      const currentDate = acc[groupId].dates.find((date: any) =>
        date.id === user.course_date_id &&
        date.startHour === user.hour_start &&
        date.endHour === user.hour_end
      );
      currentDate.booking_users.push(user);
      if (courseType !== 1) {
        const isUserAlreadyAdded = currentDate.utilizers.some(utilizer =>
          utilizer.first_name === user.client.first_name &&
          utilizer.last_name === user.client.last_name
        );

        if (!isUserAlreadyAdded) {
          currentDate.utilizers.push({
            id: user.client_id,
            first_name: user.client.first_name,
            last_name: user.client.last_name,
            image: user.client.image || null,
            birth_date: user.client.birth_date,
            language1_id: user.client.language1_id,
            country: user.client.country,
            extras: []
          });
        }
        const utilizer = currentDate.utilizers.find(utilizer =>
          utilizer.first_name === user.client.first_name &&
          utilizer.last_name === user.client.last_name
        );
        if (user.booking_user_extras && user.booking_user_extras.length > 0) utilizer.extras.push(...user.booking_user_extras.map((extra: any) => (extra.course_extra)));
      }
      if (courseType === 1 && user.booking_user_extras && user.booking_user_extras.length > 0) currentDate.extras.push(...user.booking_user_extras.map((extra: any) => (extra.course_extra)));

      if (user.monitor_id) acc[groupId].monitors.push(user.monitor_id);
      return acc;
    }, {});
    console.log(groupedActivities)
    return Object.values(groupedActivities);
  }

  editActivity(data: any, index: any) {
    if (data.course_dates) {

      this.crudService.post('/admin/bookings/update',
        {
          dates: data.course_dates,
          total: data.total,
          group_id: this.groupedActivities[index].dates[0].booking_users[0].group_id,
          booking_id: this.id
        })
        .subscribe((response) => {
          this.bookingData$.next(response.data);
          this.groupedActivities = [...this.groupBookingUsersByGroupId(response.data)];
          this.activitiesChangedSubject.next(response.data);
          this.snackbar.open(this.translateService.instant('snackbar.booking_detail.update'), 'OK', { duration: 3000 });
        });

    }
    if (data.schoolObs || data.clientObs) {
      this.groupedActivities[index].schoolObs = data.schoolObs;
      this.groupedActivities[index].clientObs = data.clientObs;
    }
  }

  cancelActivity(index: any) {
    const group = this.groupedActivities[index];
    const bookingUserIds = group.dates.flatMap(date =>
      date.booking_users.map(b => b.id)
    );
    this.crudService.post('/admin/bookings/cancel',
      { bookingUsers: bookingUserIds })
      .subscribe((response) => {
        this.groupedActivities[index].status = 2;
        let bookingData = {
          ...response.data,
          vouchers: response.data.voucher_logs
        };
        this.bookingData$.next(bookingData);
        this.snackbar.open(this.translateService.instant('snackbar.booking_detail.delete'), 'OK', { duration: 3000 });
        this.deleteModal = false;
      });
  }

  
}
