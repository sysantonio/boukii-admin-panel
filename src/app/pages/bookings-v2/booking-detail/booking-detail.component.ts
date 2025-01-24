import { ChangeDetectorRef, Component, Inject, OnInit, Optional } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { BookingService } from '../../../../service/bookings.service';
import { ApiCrudService } from '../../../../service/crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'booking-detail',
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

  // Observable que el hijo podrá suscribirse
  activitiesChanged$ = this.activitiesChangedSubject.asObservable();


  constructor(
    public translateService: TranslateService,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    public bookingService: BookingService,
    private crudService: ApiCrudService,
    private snackbar: MatSnackBar,
    private router: Router,
    @Optional() @Inject(MAT_DIALOG_DATA) public incData: any
  ) {

  }

  ngOnInit(): void {
    if (!this.incData) {
      this.id = this.activatedRoute.snapshot.params.id;
    } else {
      this.id = this.incData.id;
    }
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
        // Si hay un status diferente y el status actual no es 3, actualiza a 3
        if (currentStatus !== 3) {
          acc[groupId].status = (user.status === 1) ? currentStatus : 3;
        }
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
          extras: [] // Añadimos los extras a nivel de utilizador si el curso no es de tipo 1
        });
      }

      // Encontrar o crear la fecha en acc[groupId].dates
      const dateIndex = acc[groupId].dates.findIndex(date =>
        date.id === user.course_date_id &&
        date.startHour === user.hour_start &&
        date.endHour === user.hour_end
      );

      if (dateIndex === -1) {
        // Si la fecha no existe, la añadimos
        acc[groupId].dates.push({
          id: user.course_date_id,
          date: user.course_date.date,
          startHour: user.hour_start,
          endHour: user.hour_end,
          duration: user.formattedDuration,
          currency: booking.currency,
          monitor: user.monitor,
          utilizers: [], // Añadimos los utilizadores a nivel de fecha
          extras: [], // Solo para course_type 1
          booking_users: [], // Array para almacenar los usuarios que asisten a esta fecha
        });
      }

      const currentDate = acc[groupId].dates.find(date =>
        date.id === user.course_date_id &&
        date.startHour === user.hour_start &&
        date.endHour === user.hour_end
      );

      // Añadir el usuario al array de booking_users de la fecha correspondiente
      currentDate.booking_users.push(user); // Añadir el usuario entero

      // Si el curso no es de tipo 1, añadimos los utilizadores por fecha
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
            extras: [] // Añadimos los extras a nivel de utilizador para la fecha
          });
        }

        const utilizer = currentDate.utilizers.find(utilizer =>
          utilizer.first_name === user.client.first_name &&
          utilizer.last_name === user.client.last_name
        );

        // Añadimos los extras por utilizador y fecha
        if (user.booking_user_extras && user.booking_user_extras.length > 0) {
          utilizer.extras.push(...user.booking_user_extras.map(extra => (extra.course_extra)));
        }
      }

      // Si el curso es de tipo 1, los extras van a nivel de fecha
      if (courseType === 1 && user.booking_user_extras && user.booking_user_extras.length > 0) {
        currentDate.extras.push(...user.booking_user_extras.map(extra => (extra.course_extra)));
      }

      // Añadir los monitores
      if (user.monitor_id) {
        acc[groupId].monitors.push(user.monitor_id);
      }

      return acc;
    }, {});

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
          // Si es necesario modificar los vouchers
          this.bookingData$.next(response.data);

          // Crear una nueva referencia para groupedActivities
          this.groupedActivities = [...this.groupBookingUsersByGroupId(response.data)];

          // Notificar el cambio
          this.activitiesChangedSubject.next(response.data);

          // Mostrar mensaje de éxito
          this.snackbar.open(this.translateService.instant('snackbar.booking_detail.update'), 'OK', { duration: 3000 });
        });

    }
    if (data.schoolObs || data.clientObs) {
      this.groupedActivities[index].schoolObs = data.schoolObs;
      this.groupedActivities[index].clientObs = data.clientObs;
    }
  }

  cancelActivity(index) {
    const group = this.groupedActivities[index];

    // Extrae todas las IDs de booking_users en cada fecha
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
