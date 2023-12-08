import { Component, EventEmitter, OnDestroy, OnInit, Output, Input, ChangeDetectorRef } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable, Subscription, forkJoin, map, of, startWith } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { MatDialog } from '@angular/material/dialog';
import { BookingsCreateUpdateModalComponent } from '../bookings-create-update-modal/bookings-create-update-modal.component';
import { ApiCrudService } from 'src/service/crud.service';
import { MatCalendar, MatCalendarCellCssClasses, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Platform } from '@angular/cdk/platform';
import { DateAdapter, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
import { CalendarService } from 'src/service/calendar.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddReductionModalComponent } from './add-reduction/add-reduction.component';
import { AddDiscountBonusModalComponent } from './add-discount-bonus/add-discount-bonus.component';
import { ConfirmModalComponent } from '../../monitors/monitor-detail/confirm-dialog/confirm-dialog.component';
import { AddClientUserModalComponent } from '../../clients/add-client-user/add-client-user.component';
import { PasswordService } from 'src/service/password.service';
import { ClientCreateUpdateModalComponent } from '../../clients/client-create-update-modal/client-create-update-modal.component';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { AddClientSportModalComponent } from '../add-client-sport/add-client-sport.component';
import { Router } from '@angular/router';
import { SchoolService } from 'src/service/school.service';

@Component({
  selector: 'custom-header',
  template: `
    <div class="custom-header">
      <button mat-icon-button (click)="previousClicked()">
        <span class="material-icons">chevron_left</span>
      </button>
      <button mat-icon-button (click)="nextClicked()">
        <span class="material-icons">chevron_right</span>
      </button>
    </div>
  `,
  styles: [`
    .custom-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  `]
})
export class CustomHeader {
  constructor(
    private calendar: MatCalendar<any>,
    private dateAdapter: DateAdapter<any>,
    private calendarService: CalendarService
  ) {}

  getFirstDayOfMonth(date: any): Date {
    return this.dateAdapter.createDate(
      this.dateAdapter.getYear(date),
      this.dateAdapter.getMonth(date),
      1
    );
  }

  previousClicked() {
    const newDate = this.dateAdapter.addCalendarMonths(this.calendar.activeDate, -1);
    this.calendar.activeDate = newDate;
    this.calendarService.notifyMonthChanged(this.getFirstDayOfMonth(newDate));
  }

  nextClicked() {
    const newDate = this.dateAdapter.addCalendarMonths(this.calendar.activeDate, 1);
    this.calendar.activeDate = newDate;
    this.calendarService.notifyMonthChanged(this.getFirstDayOfMonth(newDate));
  }
}

export class CustomDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      return `${this._to2digit(day)}/${this._to2digit(month)}/${year}`;
    } else {
      return date.toDateString();
    }
  }

  private _to2digit(n: number) {
    return ('00' + n).slice(-2);
  }
}

@Component({
  selector: 'vex-bookings-create-update',
  templateUrl: './bookings-create-update.component.html',
  styleUrls: ['./bookings-create-update.component.scss'],
  animations: [fadeInUp400ms, stagger20ms]
})
export class BookingsCreateUpdateComponent implements OnInit {

  privateIcon = 'https://school.boukii.com/assets/icons/prive_ski2x.png';
  collectifIcon = 'https://school.boukii.com/assets/icons/collectif_ski2x.png';
  customHeader = CustomHeader;
  @Input()
  public monthAndYear = new Date();

  @Output()
  public monthAndYearChange = new EventEmitter<Date | null>();

  borderActive: number = -1;
  showDetail: any = [];

  createComponent = BookingsCreateUpdateModalComponent;
  selectedDatePrivate = new Date();

  imagePath = 'https://school.boukii.com/assets/icons/collectif_ski2x.png';
  title = 'Título de la Reserva';
  titleMoniteur = 'Nombre monitor';
  usersCount = 5;
  duration = '3 horas';
  dates = ['03/11/2023', '04/11/2023', '05/11/2023']; // Ejemplo de fechas
  durations = null; // Ejemplo de duraciones
  persons = []; // Ejemplo de número de personas

  reservedDates = [
    new Date(),
    new Date(),
    new Date(),
    new Date(),
    new Date(),
    // ... otras fechas
  ];
  userAvatar = 'https://school.boukii.online/assets/icons/icons-outline-default-avatar.svg';
  userName = 'Nombre de Usuario';
  userNameSub = 'Nombre de Utilizador';
  userLevel = 'Intermedio';
  selectedButton: string = '1';
  selectedSubButton: string = '';
  bookingComplete: boolean = false;

  static id = 100;
  minDate: Date;
  selectedDate = null;
  selectedPrivateCoursesDate = moment();
  selectedItem: any = null;
  selectedCourseDateItem: any = null;
  selectedSubGroupItem: any = null;
  selectedSubGroupItemIndex: any = null;
  courseDates: any = [];
  reservableCourseDate: any = [];

  periodUnique = true;
  periodMultiple = false;
  sameMonitor = false;


  times: string[] = this.generateTimes();
  filteredTimes: Observable<string[]>;

  dateControl = new FormControl();
  timeControl = new FormControl();
  durationControl = new FormControl();
  personsControl = new FormControl();
  clientsForm = new FormControl('');
  subClientForm = new FormControl();
  sportForm = new FormControl();
  levelForm = new FormControl();
  monitorsForm = new FormControl();

  filteredOptions: Observable<any[]>;
  filteredSubClients: Observable<any[]>;
  filteredSports: Observable<any[]>;
  filteredLevel: Observable<any[]>;
  filteredMonitors: Observable<any[]>;

  courseType: any = 'collectif';
  courseTypeId: any = 1;
  opRem = 0;
  boukiiCare = 0;
  form: UntypedFormGroup;
  defaults: any = {
    price_total: null,
    has_cancellation_insurance: false,
    price_cancellation_insurance: 0,
    has_boukii_care: false,
    price_boukii_care: 0,
    currency: null,
    paid_total: null,
    paid: null,
    payrexx_reference: null,
    payrexx_transaction: null,
    attendance: null,
    payrexx_refund: null,
    notes: null,
    notes_school: null,
    school_id: null,
    client_main_id: null,
    payment_method_id: null,
    paxes: null,
    color: null,
  };

  defaultsBookingUser: any = {
    school_id: null,
    booking_id: null,
    client_id: null,
    course_subgroup_id: null,
    course_id: null,
    course_date_id: null,
    degree_id: null,
    course_group_id: null,
    monitor_id: null,
    hour_start: null,
    hour_end: null,
    price: null,
    currency: null,
    date: null,
    attended: null,
    color: null,
  };

  options: string[] = ['One', 'Two', 'Three'];
  mode: 'create' | 'update' = 'create';
  loading: boolean = true;
  loadingUtilizers: boolean = true;
  loadingCalendar: boolean = true;
  loadingDurations: boolean = true;
  sportTypeSelected: number = 1;
  selectedSport: any = null;

  bookings = [];
  bookingsToCreate = [];
  clients = [];
  sportData = [];
  sportDataList = [];
  sportTypeData = [];
  levels = [];
  utilizers = [];
  courses = [];
  coursesMonth = [];
  monitors = [];
  season = [];
  school = [];
  settings: any = [];
  user: any;
  mainIdSelected = true;
  reduction: any = null;
  finalPrice: any = null;
  finalPriceNoTaxes: any = null;
  bonus: any = [];
  totalPrice: any = 0;
  countries = MOCK_COUNTRIES;
  snackBarRef: any = null;
  schoolSettings: any = [];

  tva = 0;
  cancellationInsurance = 0;
  boukiiCarePrice = 0;

  private subscription: Subscription;

  constructor(private fb: UntypedFormBuilder, private dialog: MatDialog, private crudService: ApiCrudService, private calendarService: CalendarService,
    private snackbar: MatSnackBar, private passwordGen: PasswordService, private router: Router, private schoolService: SchoolService, private cdr: ChangeDetectorRef) {

                this.minDate = new Date(); // Establecer la fecha mínima como la fecha actual
                this.subscription = this.calendarService.monthChanged$.subscribe(firstDayOfMonth => {
                  this.handleMonthChange(firstDayOfMonth);
                  this.selectedDatePrivate = firstDayOfMonth;
                });
              }

  ngOnInit() {
    this.schoolService.getSchoolData()
      .subscribe((data) => {
        this.schoolSettings = data.data;
        this.tva = parseFloat(this.schoolSettings.cancellation_insurance_percent);
        this.cancellationInsurance = parseFloat(this.schoolSettings.bookings_comission_cash);
        this.boukiiCarePrice = parseInt(this.schoolSettings.bookings_comission_boukii_pay);
      })
    this.getData();
  }

  getData() {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));

    this.form = this.fb.group({
      sportType: [1], // Posiblemente establezcas un valor predeterminado aquí
      sportForm: [null],
      courseType: ['collectif'],
      sport: [null],
      observations: [null],
      observations_school: [null],
      fromDate: [null],
      periodUnique: [false],
      periodMultiple: [false],
      sameMonitor: [false]
    });

    this.getSports();
    this.getMonitors();
    this.getSeason();
    this.getSchool();

    forkJoin([this.getSportsType(), this.getClients()])
      .subscribe((data: any) => {
        this.sportTypeData = data[0].data.reverse();
        this.clients = data[1].data;


        this.filterSportsByType(true);

        this.filteredOptions = this.clientsForm.valueChanges.pipe(
          startWith(''),
          map((value: any) => typeof value === 'string' ? value : value?.full_name),
          map(full_name => full_name ? this._filter(full_name) : this.clients.slice())
        );

        this.filteredSports = this.sportForm.valueChanges.pipe(
          startWith(''),
          map((value: any) => typeof value === 'string' ? value : value?.name),
          map(name => name ? this._filterSport(name) : this.sportData.slice())
        );

        this.filteredMonitors = this.monitorsForm.valueChanges.pipe(
          startWith(''),
          map((value: any) => typeof value === 'string' ? value : value?.full_name),
          map(full_name => full_name ? this._filterMonitor(full_name) : this.monitors.slice())
        );

        this.filteredTimes = this.timeControl.valueChanges
          .pipe(
            startWith(''),
            map(value => this._filterTime(value))
          );

          setTimeout(() => {

            this.filteredSports = of(this.sportData.filter(sport => sport.sport_type === this.sportTypeSelected));
            this.sportDataList = this.sportData.filter(sport => sport.sport_type === this.sportTypeSelected);
            this.selectSport(this.sportDataList[0]);
            this.getUtilzers(this.clients[0], true);
            //this.getDegrees(this.defaults.sport_id);

            setTimeout(() => {
              this.clientsForm.patchValue(this.clients[0]);

            }, 500);
          }, 500);
      })
  }

  generateArray(paxes: number) {
    this.persons = [];
    for (let i = 1; i <= paxes; i++) {
      this.persons.push(i);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  filterSportsByType(onload = false) {
    if(this.snackBarRef!==null) {

      this.snackBarRef.dismiss();
    }
    this.sportTypeSelected = this.form.get('sportType').value;
    let selectedSportType = this.form.get('sportType').value;
    this.filteredSports = of(this.sportData.filter(sport => sport.sport_type === selectedSportType));
    this.sportDataList = this.sportData.filter(sport => sport.sport_type === selectedSportType);

    if (!onload) {
      const client = this.clients.find((c) => c.id === this.defaultsBookingUser.client_id);
      client.sports.forEach(sport => {

        if (sport.id === this.defaults.sport_id) {
          const level = this.levels.find((l) => l.id === sport.pivot.degree_id);
          this.levelForm.patchValue(level);
          this.defaultsBookingUser.degree_id = level.id;
          this.getCourses(level, this.monthAndYear);
        }
      });
    }

  }

  setCourseType(type: string, id: number) {
    if(this.snackBarRef!==null) {

      this.snackBarRef.dismiss();
    }
    this.courseType = type;
    this.courseTypeId = id;
    this.form.get("courseType").patchValue(id);

    const client = this.clients.find((c) => c.id === this.defaultsBookingUser.client_id);
    let hasSport = false;
    client.sports.forEach(sport => {

      if (sport.id === this.defaults.sport_id) {
        const level = this.levels.find((l) => l.id === sport.pivot.degree_id);
        this.levelForm.patchValue(level);
        this.defaultsBookingUser.degree_id = level.id;
        hasSport = true;
        this.getCourses(level, this.monthAndYear);
      }
    });

    if (!hasSport) {
      this.snackbar.open('El usuario no tiene este deporte asociado. Si se crea una reserva con este deporte, se le asignará automáticamente el nivel seleccionado', 'OK', {duration:3000});
    }
  }

  selectItem(item: any) {

    if(this.snackBarRef!==null) {

      this.snackBarRef.dismiss();
    }

    if (item.course_type === 1) {
      if (this.selectedItem !== null && this.selectedItem?.id !== item.id) {
        this.reservableCourseDate = [];

      }
      this.courseDates = [];
      this.selectedItem = item;
      this.selectedSubGroupItem  = null;
      this.courseDates.push(this.defaultsBookingUser);
    } else {
      this.generateArray(item.max_participants);
      this.courseDates = [];


      this.selectedItem = item;
      this.courseDates.push({
        school_id: this.user.schools[0].id,
        booking_id: null,
        client_id: this.defaultsBookingUser.client_id,
        course_subgroup_id: null,
        course_id: item.id,
        hour_start: null,
        hour_end: null,
        price: this.selectedItem.price,
        currency: this.selectedItem.currency,
        date: null,
        attended: false
      });
      if (item.is_flexible) {
        this.generateCourseDurations(item.course_dates[0].hour_start, item.course_dates[0].hour_end, item.duration);
      }
    }


  }

  selectSubGroupItem(item: any, subGroupIndex: any) {
    this.selectedSubGroupItem = item;
    this.selectedSubGroupItemIndex = subGroupIndex;
  }

  addCourseDate() {
    this.courseDates.push({
      school_id: this.user.schools[0].id,
      booking_id: null,
      client_id: this.defaultsBookingUser.client_id,
      course_subgroup_id: null,
      course_id: this.selectedItem.id,
      hour_start: null,
      hour_end: null,
      price: this.selectedItem.price,
      currency: this.selectedItem.currency,
      date: null,
      attended: false
    });
  }

  addReservableCourseDate(item, event) {
    if (event.checked) {
      this.reservableCourseDate.push(item);
    } else {
      const index = this.reservableCourseDate.findIndex((c) => c.id === item.id);
      this.reservableCourseDate.splice(index, 1);
    }
  }

  setCourseDateItemPrivateNoFlexible(item: any, date: any) {
    item.course_date_id = date.id;
    item.date = date.date;
  }

  calculateAvailableHours(selectedCourseDateItem: any, time: any) {

    const start = moment(selectedCourseDateItem.hour_start, 'HH:mm:ss');
    const end = moment(selectedCourseDateItem.hour_end, 'HH:mm:ss');

    const hour = moment(time, 'HH:mm')

    return hour.isSameOrBefore(start) && hour.isSameOrAfter(end);
  }

  resetCourseDates() {
    if (this.courseDates.length > 1) {
      const firstDate = this.courseDates[0];
      this.courseDates = [];
      this.courseDates.push(firstDate);
    }
  }

  addAnotherCourse() {
    this.selectedItem = null;
    this.selectedCourseDateItem = null;
    this.selectedSubGroupItem = null;
    this.selectedSubGroupItemIndex = null;
    this.reservableCourseDate = [];
    this.periodMultiple = false;
    this.periodUnique = true;
    this.sameMonitor = false;
  }

  confirmBooking() {

    if (this.courseTypeId === 2 && this.checkAllFields()) {

      this.snackbar.open('Complete los campos de fecha y hora de la reserva del curso', 'OK', {duration:3000});
      return;
    }

    if (this.courseTypeId === 1 && this.selectedItem.is_flexible && this.reservableCourseDate.length === 0) {

      this.snackbar.open('Selecciona alguna de las fechas del curso flexible seleccionado', 'OK', {duration:3000});
      return;
    }

    let data: any = {};
      data.price_total = this.selectedItem.is_flexible && this.selectedItem.course_type === 2 ? 0 : +this.selectedItem.price;
      data.has_cancellation_insurance = this.defaults.has_cancellation_insurance;
      data.price_cancellation_insurance = 0;
      data.has_boukii_care = this.defaults.has_boukii_care;
      data.price_boukii_care = 0;
      data.payment_method_id = this.defaults.payment_method_id;
      data.paid = this.defaults.paid;
      data.currency = this.selectedItem.currency;
      data.school_id = this.user.schools[0].id;
      data.client_main_id = this.defaults.client_main_id.id;
      data.notes = this.defaults.notes;
      data.notes_school = this.defaults.notes_school;
      data.paxes = null;
      data.courseDates = [];

      if (this.courseTypeId === 1 && !this.selectedItem.is_flexible) {
        this.selectedItem.course_dates.forEach(item => {
          if (this.canBook(item.date)) {
            let monitorId = null;
            let degreeId = null;
            let subgroupId = null;
            let monitorFind = false;
            item.course_groups.forEach(groups => {
              if (!monitorFind) {
                if(groups.course_subgroups[this.selectedSubGroupItemIndex].degree_id === this.levelForm.value.id) {
                  monitorId = groups.course_subgroups[this.selectedSubGroupItemIndex].monitor_id;
                  degreeId = groups.course_subgroups[this.selectedSubGroupItemIndex].degree_id;
                  subgroupId = groups.course_subgroups[this.selectedSubGroupItemIndex].id;
                  monitorFind = true;
                }
              }
            })
              data.courseDates.push({
                school_id: this.user.schools[0].id,
                booking_id: null,
                client_id: this.courseDates[0].client_id,
                course_id: this.selectedItem.id,
                course_date_id: item.course_groups[0].course_date_id,
                degree_id: degreeId,
                monitor_id: monitorId,
                subgroup_id: subgroupId,
                hour_start: item.hour_start,
                hour_end: item.hour_end,
                price: +this.selectedItem.price,
                currency: this.selectedItem.currency,
                course: this.selectedItem,
                date: moment(item.date, 'YYYY-MM-DD').format('YYYY-MM-DD')
            });
          }
        });
      } else if (this.courseTypeId === 1 && this.selectedItem.is_flexible) {
        this.reservableCourseDate.forEach(item => {
          if (this.canBook(item.date)) {
              let monitorId = null;
              let degreeId = null;
              let monitorFind = false;
              item.course_groups.forEach(groups => {
                if (!monitorFind) {
                  if(groups.course_subgroups[this.selectedSubGroupItemIndex].degree_id === this.levelForm.value.id) {
                    monitorId = groups.course_subgroups[this.selectedSubGroupItemIndex].monitor_id;
                    degreeId = groups.course_subgroups[this.selectedSubGroupItemIndex].degree_id;
                    monitorFind = true;
                  }
                }

              });
              data.courseDates.push({
                school_id: this.user.schools[0].id,
                booking_id: null,
                client_id: this.courseDates[0].client_id,
                course_id: this.selectedItem.id,
                course_date_id: item.course_date_id,
                degree_id: degreeId,
                monitor_id: monitorId,
                hour_start: item.hour_start,
                hour_end: item.hour_end,
                price: +this.selectedItem.price,
                currency: this.selectedItem.currency,
                course: this.selectedItem,
                date: moment(item.date, 'YYYY-MM-DD').format('YYYY-MM-DD')
            });
          }
        });
      } else if (this.courseTypeId === 2 && this.selectedItem.is_flexible) {
        this.courseDates.forEach(item => {
          data.price_total = data.price_total + (parseFloat(this.selectedItem.price_range.find((p) => p.intervalo === item.duration)[item.paxes]));
            data.courseDates.push({
              school_id: this.user.schools[0].id,
              booking_id: null,
              client_id: item.client_id,
              course_id: item.id,
              course_date_id: item.course_date_id,
              monitor_id: item.monitor_id,
              hour_start: item.hour_start,
              hour_end: null, //calcular en base a la duracion del curso
              price: +item.price,
              currency: item.currency,
              paxes: item.paxes,
              course: this.selectedItem,
              date: moment(item.date, 'YYYY-MM-DD').format('YYYY-MM-DD')
          });
        });
      } else if (this.courseTypeId === 2 && !this.selectedItem.is_flexible) {
        this.courseDates.forEach(item => {
          data.courseDates.push({
            school_id: this.user.schools[0].id,
            booking_id: null,
            client_id: item.client_id,
            course_id: item.course_id,
            course_date_id: item.course_date_id,
            monitor_id: item.monitor_id,
            hour_start: item.hour_start,
            hour_end: null, //calcular en base a la duracion del curso
            price: +item.price,
            currency: item.currency,
            course: this.selectedItem,
            date: moment(item.date, 'YYYY-MM-DD').format('YYYY-MM-DD')
          });
        });
      }

      this.bookingsToCreate.push(data);
      this.showDetail = this.bookingsToCreate.length - 1;
      this.clientsForm.disable();
  }

  save() {
    this.bookingComplete = true;
    this.addAnotherCourse();
    this.calculateFinalPrice();
    //this.create();
  }

  create() {

    let data: any = {};
    const courseDates = [];
    const bookingExtras = [];

    this.bookingsToCreate.forEach((element, idx) => {
      element.courseDates.forEach(cs => {
        courseDates.push(cs);
      });

      let paxes = 0;
      paxes = paxes + element.paxes;
      data = {
        price_total: this.finalPrice,
        has_cancellation_insurance: this.defaults.has_cancellation_insurance,
        price_cancellation_insurance: this.defaults.has_cancellation_insurance ? element.price_total * 0.10 : 0,
        currency: element.currency,
        paid_total: element.paid_total,
        paid: element.paid,
        notes: element.notes,
        notes_school: element.notes_school,
        school_id: element.school_id,
        client_main_id: element.client_main_id,
        paxes: paxes,
        payment_method_id: element.payment_method_id
      }

      if (element.forfait) {

        bookingExtras.push({forfait: element.forfait, idx: idx});
      }
    });

    const clientsWithoutSelectedSport = [];
    this.bookingsToCreate.forEach(element => {
      const client = this.clients.find((c) => c.id === element.courseDates[0].client_id);
      const bookSport = client.sports.find((c) => c.id === element.courseDates[0].course.sport_id);
      if (!bookSport || bookSport === null) {

        clientsWithoutSelectedSport.push({
          client_id: client.id,
          sport_id: element.courseDates[0].course.sport_id,
          degree_id: element.courseDates[0].degree_id,
          school_id: this.user.schools[0].id
        })
      }
    });

    clientsWithoutSelectedSport.forEach(element => {
      this.crudService.create('/client-sports', element)
        .subscribe(() => {
          console.log('Client sport created');
        })
    });


    this.crudService.create('/bookings', data)
    .subscribe((booking) => {
      console.log('booking, created', booking);
      this.processBonus();
      let rqs = [];

        courseDates.forEach(item => {
          if (this.getCourse(item.course_id).course_type === 1) {

            if (this.canBook(item.date)) {
              rqs.push({
                school_id: item.school_id,
                booking_id: booking.data.id,
                client_id: item.client_id,
                course_id: item.course_id,
                course_subgroup_id: item.subgroup_id,
                course_date_id: item.course_date_id,
                degree_id: item.degree_id,
                monitor_id: item.monitor_id,
                hour_start: item.hour_start,
                hour_end: item.hour_end,
                price: item.price,
                currency: item.currency,
                date: item.date,
                attended: false
              });
            }
          }

          if (this.getCourse(item.course_id).course_type === 2) {
            rqs.push({
              school_id: item.school_id,
              booking_id: booking.data.id,
              client_id: item.client_id,
              course_id: item.id,
              course_date_id: item.course_date_id,
              monitor_id: item.monitor_id,
              hour_start: item.hour_start,
              hour_end: null, //calcular en base a la duracion del curso
              price: item.price,
              currency: item.currency,
              paxes: item.paxes,
              date: moment(item.date, 'YYYY-MM-DD').format('YYYY-MM-DD')
            });
          }

          rqs.forEach((rq, idx) => {
            const bExtra = bookingExtras.find((b)=> b.idx === idx);

            this.crudService.create('/booking-users', rq)
            .subscribe((bookingUser) => {
              if (bExtra) {
                const bookingUserExtra = {
                  booking_user_id: bookingUser.data.id,
                  course_extra_id: null,
                }
                const courseExtra = {
                  course_id: rq.course_id,
                  name: bExtra.forfait.id,
                  description: bExtra.forfait.name,
                  price: bExtra.forfait.price + ((bExtra.forfait.price * bExtra.forfait.tva) / 100),
                }
                this.crudService.create('/course-extras', courseExtra)
                  .subscribe((responseCourseExtra) => {

                    bookingUserExtra.course_extra_id = responseCourseExtra.data.id;
                    this.crudService.create('/booking-user-extras', bookingUserExtra)
                    .subscribe((bookExtra) => {
                      console.log("b.extra created", bookExtra, idx);
                    })
                  })
              }

              setTimeout(() => {
                this.goTo('/bookings');
              }, 1000);
            });
          });

        });
      })

  }

  processBonus() {
    if (this.bonus.length > 0) {
      this.bonus.forEach(element => {
        const data = {
          code: element.bonus.code,
          quantity: element.bonus.quantity,
          remaining_balance: element.bonus.quantity - element.bonus.reducePrice,
          payed: element.bonus.quantity - element.bonus.reducePrice === 0,
          client_id: element.bonus.client_id.id,
          school_id: this.user.schools[0].id
        };
        this.crudService.update('/vouchers', data, element.id)
          .subscribe((result) => {
            console.log(result);
          })
      });
    }
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }

  update() {
    const booking = this.form.value;
    booking.id = this.defaults.id;

  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }


  // pasar a utils
  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.clients.filter(client => (client.first_name.toLowerCase().includes(filterValue) || client.last_name.toLowerCase().includes(filterValue)));
  }

  private _filterMonitor(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.monitors.filter(monitor => monitor.full_name.toLowerCase().includes(filterValue));
  }

  private _filterLevel(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.levels.filter(level => level.annotation.toLowerCase().includes(filterValue));
  }

  private _filterSport(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.sportData.filter(sport => sport.name.toLowerCase().includes(filterValue));
  }

  private _filterTime(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.times.filter(time => time.toLowerCase().includes(filterValue));
  }

  displayFn(client: any): string {
    return client && (client?.first_name && client?.last_name) ? client?.first_name + ' ' + client?.last_name : client?.first_name;
  }

  displayFnMoniteurs(monitor: any): string {
    return monitor && monitor.first_name && monitor.last_name ? monitor.first_name + ' ' + monitor.last_name : '';
  }

  displayFnSport(sport: any): string {
    return sport && sport.name ? sport.name : '';
  }

  displayFnLevel(level: any): string {
    return level && level?.name && level?.annotation ? level?.annotation + ' ' + level?.name : level?.name;
  }

  displayFnTime(time: any): string {
    return time && time.name ? time.name : '';
  }

  generateTimes(): string[] {
    let times = [];
    let dt = new Date(2023, 0, 1, 8, 0, 0, 0);
    const end = new Date(2023, 0, 1, 17, 55, 0, 0);

    while (dt <= end) {
      const time = ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2);
      times.push(time);
      dt.setMinutes(dt.getMinutes() + 5); // Incrementa en 5 minutos
    }
    return times;
  }

  openBookingModal() {

    const dialogRef = this.dialog.open(this.createComponent, {
      width: '90vw',
      height: '90vh',
      maxWidth: '100vw',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog'  // Si necesitas estilos adicionales
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {

      }
    });
  }

  selectMainUser(user: any) {
    this.defaultsBookingUser.client_id = user.id;
    const client = this.clients.find((c) => c.id === user.id);

    client.sports.forEach(sport => {

      if (sport.id === this.defaults.sport_id) {
        const level = this.levels.find((l) => l.id === sport.pivot.degree_id);
        this.levelForm.patchValue(level);
        this.defaultsBookingUser.degree_id = level.id;
        this.getCourses(level, this.monthAndYear);
      }
    });
  }

  toggleBorder(index: number, utilizer: any) {
    this.mainIdSelected = false;
    this.borderActive = index;
    this.defaultsBookingUser.client_id = utilizer.id;
    const client = this.clients.find((c) => c.id === utilizer.id);


    if (client.sports.length > 0) {
      let hasSport = false;
      client.sports.forEach(sport => {

        if (sport.id === this.defaults.sport_id) {
          const level = this.levels.find((l) => l.id === sport.pivot.degree_id);
          this.levelForm.patchValue(level);
          this.defaultsBookingUser.degree_id = level.id;
          hasSport = true;
          this.getCourses(level, this.monthAndYear);
        }
      });

      if (!hasSport) {
        this.courses = [];
          this.snackBarRef = this.snackbar.open('Este usuario no tiene el deporte ' + this.selectedSport.name + ' asociado. ¿Quieres añadirlo?', 'Si', {duration: 10000});
          this.snackBarRef.onAction().subscribe(() => {
            this.addSportToUser(this.selectedSport.sport_id);
          });
      }
    } else {
      this.snackBarRef = this.snackbar.open('Este usuario no tiene ningún deporte asociado. ¿Quieres añadirlo?', 'Si', {duration: 10000});
      this.snackBarRef.onAction().subscribe(() => {
        this.addSportToUser(this.selectedSport.sport_id);
      });
    }

  }

  showDetailFn(id: number) {
    this.showDetail = id;
  }

  getClients() {
    return this.crudService.list('/admin/clients', 1, 1000, 'desc', 'id', '&school_id='+this.user.schools[0].id);/*
      .subscribe((data: any) => {
        this.clients = data.data;
        this.loading = false;

      })*/
  }

  getSportsType() {
    return this.crudService.list('/sport-types', 1, 1000);/*
      .subscribe((data) => {
        this.sportTypeData = data.data.reverse();
      });*/
  }

  getSports() {
    this.crudService.list('/school-sports', 1, 1000, 'asc', 'sport_id', '&school_id='+this.user.schools[0].id)
      .subscribe((sport) => {
        this.sportData = sport.data.reverse();
        this.sportData.forEach(element => {
          this.crudService.get('/sports/'+element.sport_id)
            .subscribe((data) => {
              element.name = data.data.name;
              element.icon_selected = data.data.icon_selected;
              element.icon_unselected = data.data.icon_unselected;
              element.sport_type = data.data.sport_type;
            });
        });

      })

  }

  selectSport(sport: any) {
    if(this.snackBarRef!==null) {

      this.snackBarRef.dismiss();
    }
    this.defaults.sport_id = sport.sport_id;
    this.form.get("sport").patchValue(sport.sport_id);
    this.selectedSport = sport;
    this.getDegrees(sport.sport_id);
  }

  getDegrees(sportId: number) {
   this.crudService.list('/degrees', 1, 1000, 'asc', 'degree_order', '&school_id='+this.user.schools[0].id + '&sport_id='+sportId + '&active=1')
      .subscribe((data) => {
        this.levels = data.data.sort((a, b) => a.degree_order - b.degree_order);

        this.filteredLevel = this.levelForm.valueChanges.pipe(
          startWith(''),
          map((value: any) => typeof value === 'string' ? value : value?.annotation),
          map(annotation => annotation ? this._filterLevel(annotation) : this.levels.slice())
        );
        let hasSport = false;
        const client = this.clients.find((c) => c.id === this.defaultsBookingUser.client_id);
        client.sports.forEach(sport => {
          if (sport.id === this.defaults.sport_id) {
            const level = this.levels.find((l) => l.id === sport.pivot.degree_id);
            this.levelForm.patchValue(level);
            this.defaultsBookingUser.degree_id = level.id;
            hasSport = true;
            this.getCourses(level, this.monthAndYear);
          }
        });

        if (!hasSport && client.sports.length === 0) {
          this.snackBarRef = this.snackbar.open('Este usuario no tiene ningún deporte asociado. ¿Quieres añadirlo?', 'Si', {duration: 10000});
          this.snackBarRef.onAction().subscribe(() => {
            this.addSportToUser(this.selectedSport.sport_id);
          });
        } else if(!hasSport && client.sports.length > 0) {
          this.courses = [];
          this.snackBarRef = this.snackbar.open('Este usuario no tiene el deporte ' + this.selectedSport.name + ' asociado. ¿Quieres añadirlo?', 'Si', {duration: 10000});
          this.snackBarRef.onAction().subscribe(() => {
            this.addSportToUser(this.selectedSport.sport_id);
          });
        }
      })
  }


  addSportToUser(sportId = null) {

    const dialogRef = this.dialog.open(AddClientSportModalComponent, {
      maxWidth: '100vw',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales,
      data: {sport_id: sportId, title: 'Assign sport'}
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {

        data.data.forEach(element => {

          this.crudService.create('/client-sports', {client_id: this.defaultsBookingUser.client_id, sport_id: element.sport_id, degree_id: element.level.id, school_id: this.user.schools[0].id})
            .subscribe(() => {
              console.log('client sport created');
              this.crudService.list('/admin/clients', 1, 1000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
                .subscribe((cl) => {
                  this.clients = cl.data;
                  const client = this.clients.find((c) => c.id === this.defaultsBookingUser.client_id);
                  client.sports.forEach(sport => {
                    if (sport.id === this.defaults.sport_id) {
                      const level = this.levels.find((l) => l.id === sport.pivot.degree_id);
                      this.levelForm.patchValue(level);
                      this.defaultsBookingUser.degree_id = level.id;
                      this.getCourses(level, this.monthAndYear);
                    }
                  });
                })
            })
        });
      }
    });
  }
  getUtilzers(client: any, onLoad = false) {
    if(this.snackBarRef!==null) {

      this.snackBarRef.dismiss();
    }

    this.loadingUtilizers = true;
    this.utilizers = [];
    this.mainIdSelected = true;
    this.borderActive = -1;
    this.defaultsBookingUser.client_id = client.id;

    this.crudService.get('/admin/clients/' + client.id +'/utilizers')
      .subscribe((data: any) => {
        this.utilizers = data.data;
        if (!onLoad) {
          client.sports.forEach(sport => {
            if (sport.id === this.defaults.sport_id) {
              const level = this.levels.find((l) => l.id === sport.pivot.degree_id);
              this.levelForm.patchValue(level);
              this.defaultsBookingUser.degree_id = level.id;
              this.clientsForm.patchValue(client);
              this.getCourses(level, this.monthAndYear);
            }
          });
        }

        //this.getDegrees(this.defaults.sport_id);
        this.loadingUtilizers = false
      });


  }

  getCourses(level: any, date: any, fromPrivate = false) {

    this.loadingCalendar = true;
    this.dateClass();
    this.privateDateClass();
    let today, minDate,maxDate;

    if (!fromPrivate) {
      if (date === null) {
        today = moment();
        minDate = moment().startOf('month').isBefore(today) ? today : moment().startOf('month');
        maxDate = moment().endOf('month');
      } else {
        today = moment();
        minDate = moment(date).startOf('month').isBefore(today) ? today : moment(date).startOf('month');
        maxDate = moment(date).endOf('month');
      }
    } else {
      minDate = moment(date);
      maxDate = moment(date);
    }

    const rq = {
      start_date: minDate.format('YYYY-MM-DD'),
      end_date: maxDate.format('YYYY-MM-DD'),
      course_type: this.courseTypeId,
      sport_id: this.form.value.sport,
      client_id: this.defaultsBookingUser.client_id,
      degree_id: level.id,
      get_lower_degrees: false
    };

    this.crudService.post('/availability', rq)
      .subscribe((data) => {
        console.log(data);

        this.defaultsBookingUser.degree_id = level.id;
        this.courses = data.data;
        if (!fromPrivate) {

          this.coursesMonth = data.data;
        }

        if (data.data.length === 0) {
          this.snackbar.open('No hay cursos disponibles con estos filtros', 'OK', {duration: 1500});
        }
        this.loading = false;
        this.loadingCalendar = false;
      })
  }

  calculateAge(birthDateString) {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
  }

  emitDateChange(event: any, fromPrivate = false): void {
    this.selectedItem = null;
    this.monthAndYear = moment(this.minDate).isAfter(moment(event.value)) ? this.minDate : event.value;
    this.getCourses(this.levelForm.value.id, this.monthAndYear, fromPrivate);
  }

  getMonitors() {
    this.crudService.list('/monitors', 1, 1000, 'asc', 'first_name', '&school_id='+this.user.schools[0].id)
      .subscribe((data) => {
        this.monitors = data.data;
      })
  }

  addTimeToDate(timeString: any) {
    const match = timeString.match(/(\d+)h (\d+)min/);

    if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);

        // Suponiendo que 'fecha' es tu fecha actual en Moment.js
        let fecha = moment();
        fecha.add(hours, 'hours').add(minutes, 'minutes');

        return fecha;
    } else {
        throw new Error('Formato de tiempo inválido');
    }
  }

  getSeason() {
    this.crudService.list('/seasons', 1, 1000, 'asc', 'id', '&school_id='+this.user.schools[0].id+'&is_active=1')
      .subscribe((season) => {
        this.season = season.data[0];
      })
  }

  getSchool() {
    this.crudService.get('/schools/'+this.user.schools[0].id)
      .subscribe((school) => {
        this.school = school.data;
        this.settings = JSON.parse(school.data.settings);
      })
  }

  dateClass() {

    return (date: Date): MatCalendarCellCssClasses => {
      const dates = this.compareCourseDates();
      const currentDate = moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD');
          if (dates.indexOf(currentDate) !== -1 && moment(this.minDate).isSameOrBefore(moment(date))) {
            return 'with-course';
          } else {
            return;
          }

    };
  }

  privateDateClass() {

    return (date: Date): MatCalendarCellCssClasses => {
      const dates = this.comparePrivateCourseDates();
      const currentDate = moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD');
          if (dates.indexOf(currentDate) !== -1 && moment(this.minDate).isSameOrBefore(moment(date))) {
            return 'with-course-private';
          } else {
            return;
          }

    };
  }

  canBook(date: any) {
    return moment(date, 'YYYY-MM-DD').isSameOrAfter(moment(this.minDate));
  }

  getLevelColor(id: any) {
    if (id && id !== null) {
      return this.levels.find((l) => l.id === id).color;

    }
  }

  getLevelOrder(id: any) {
    if (id && id !== null) {
      return this.levels.find((l) => l.id === id).degree_order;

    }
  }

  getLevelName(id: any) {
    if (id && id !== null) {

      const level = this.levels.find((l) => l.id === id);
      return level.annotation + ' - ' + level.name;
    }
  }

  getMonitorAvatar(id: number) {

    if (id && id === null) {
      return this.userAvatar;
    } else {

      const monitor = this.monitors.find((m) => m.id === id);
      return monitor?.image;
    }
  }

  getMonitorName(id: number) {
    if (id && id !== null) {

      const monitor = this.monitors.find((m) => m.id === id);

      return monitor.first_name + ' ' + monitor.last_name;
    }
  }

  getMonitorCountry(id: number) {
    if (id && id !== null) {

      const monitor = this.monitors.find((m) => m.id === id);

      return +monitor?.country;
    }
  }

  getMonitorProvince(id: number) {
    if (id && id !== null) {

      const monitor = this.monitors.find((m) => m.id === id);

      return +monitor?.province;
    }
  }

  getMonitorBirth(id: number) {
    if (id && id !== null) {

      const monitor = this.monitors.find((m) => m.id === id);

      return monitor?.birth_date;
    }
  }

  getClientAvatar(id: number) {

    if (id === null) {
      return this.userAvatar;
    } else {

      const client = this.clients.find((m) => m.id === id);
      return client.image;
    }
  }

  getClientName(id: number) {
    if (id !== null) {

      const client = this.clients.find((m) => m.id === id);

      return client.first_name + ' ' + client.last_name;
    }
  }


  getCourse(id: number) {

    if (id !== null) {
      const course = this.courses.find((m) => m.id === id);

      return course;
    }

  }

  compareCourseDates() {
    let ret = [];
    this.courses.forEach(course => {
      course.course_dates.forEach(courseDate => {
        ret.push(moment(courseDate.date, 'YYYY-MM-DD').format('YYYY-MM-DD'));
      });
    });

    return ret;
  }

  comparePrivateCourseDates() {
    let ret = [];
    this.coursesMonth.forEach(course => {
      course.course_dates.forEach(courseDate => {
        ret.push(moment(courseDate.date, 'YYYY-MM-DD').format('YYYY-MM-DD'));
      });
    });

    return ret;
  }

  handleDateChange(event: any) {
    this.getCourses(this.levelForm.value, event, true);
  }

  handleMonthChange(firstDayOfMonth: Date) {
    this.selectedItem = null;
    this.monthAndYear = moment(this.minDate).isAfter(moment(firstDayOfMonth)) ? this.minDate : firstDayOfMonth;
    this.getCourses(this.levelForm.value, this.monthAndYear);
  }

  setClientsNotes(event: any) {
    this.defaults.notes = event.target.value;
  }

  setSchoolNotes(event: any) {
    this.defaults.school_notes = event.target.value;
  }

  public monthChanged(value: any, widget: any): void {
    this.selectedItem = null;
    this.monthAndYear = moment(this.minDate).isAfter(moment(value)) ? this.minDate : value;
    this.getCourses(this.levelForm.value.id, this.monthAndYear);

    widget.close();
  }

  checkAllFields() {
    let ret = false;

    for (let i = 0; i<this.courseDates.length; i++){
      if((!this.courseDates[i].date && this.courseDates[i].date === null) || this.courseDates[i].hour_start === null) {
        ret = true;
        break;
      }
    }

    return ret;
  }

  getBookableCourses(dates: any) {
    return dates.find((d) => this.canBook(d.date)).course_groups;
  }

  calculateHourEnd(hour: any, duration: any) {
    if(duration.includes('h')) {
      const hours = duration.split(' ')[0].replace('h', '');
      const minutes = duration.split(' ')[1].replace('min', '');

      return moment(hour, 'HH:mm').add(hours, 'h').add(minutes, 'm').format('HH:mm');
    } else {
      const minutes = duration.split(' ')[1].replace('min', '');

      return moment(hour, 'HH:mm').add(minutes, 'm').format('HH:mm');
    }
  }

  getBoukiiCare() {
    return this.defaults.has_boukii_care ? this.getBasePrice() * 0.10 : 0;
  }

  getOpRemPrice() {
    return this.defaults.has_cancellation_insurance ? this.getBasePrice() * 0.10 : 0;
  }


  getAvailableWeekDays(settings: any) {
    const data = JSON.parse(settings);
    let ret = null;
    if (data !== null) {
      if (data.weekDays.monday) {
        ret = ret === null ? 'Monday' : ret + ' - ' + 'Monday';
      }
      if (data.weekDays.tuesday) {
        ret = ret === null ? 'Tuesday' : ret + ' - ' + 'Tuesday';
      }
      if (data.weekDays.wednesday) {
        ret = ret === null ? 'Wednesday' : ret + ' - ' + 'Wednesday';
      }
      if (data.weekDays.thursday) {
        ret = ret === null ? 'Thursday' : ret + ' - ' + 'Thursday';
      }
      if (data.weekDays.friday) {
        ret = ret === null ? 'Friday' : ret + ' - ' + 'Friday';
      }
      if (data.weekDays.saturday) {
        ret = ret === null ? 'Saturday' : ret + ' - ' + 'Saturday';
      }
      if (data.weekDays.sunday) {
        ret = ret === null ? 'Sunday' : ret + ' - ' + 'Sunday';
      }
    }
    return ret;
  }

  getBasePrice() {
    let ret = 0;

    this.bookingsToCreate.forEach(element => {
      ret = ret + element.price_total;
    });

    return ret;
  }

  setForfait(event:any, forfait: any, booking: any, bookingIndex: number) {

    if (event.source.checked) {
      booking.forfait = forfait;
      this.calculateFinalPrice();
    } else {
      booking.forfait = null;
      this.calculateFinalPrice();
    }
  }

  deleteBooking(index: number) {


    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      maxWidth: '100vw',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales,
      data: {message: 'Do you want to remove this item? This action will be permanetly', title: 'Delete monitor course'}
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {

        this.bookingsToCreate.splice(index, 1);

        if(this.bookingsToCreate.length === 0) {
          this.clientsForm.enable();
          this.bookingComplete = false;
        }
      }
    });
  }

  addBonus() {
    const dialogRef = this.dialog.open(AddDiscountBonusModalComponent, {
      width: '600px',
      data: {
        client_id: this.bookingsToCreate[0].client_main_id,
        school_id: this.bookingsToCreate[0].school_id,
        currentPrice: this.finalPriceNoTaxes,
        appliedBonus: this.bonus,
        currency:  this.bookingsToCreate[0].currency
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.calculateFinalPrice();
        this.bonus.push(result);
        this.calculateFinalPrice();
      }
    });
  }

  addReduction() {
    const dialogRef = this.dialog.open(AddReductionModalComponent, {
      width: '300px',
      data: {
        currentPrice: this.finalPriceNoTaxes
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.calculateFinalPrice();
        this.reduction = result;
        this.calculateFinalPrice();
      }
    });
  }

  calculateReduction() {

    if (this.reduction.type === 1) {
      return (this.finalPrice * this.reduction.discount) / 100;
    } else {
      return this.reduction.discount > this.finalPrice ? this.finalPrice: this.reduction.discount;
    }
  }

  calculateBonusDiscount() {
    let ret = 0;
    this.bonus.forEach(element => {

      if (ret < this.finalPrice) {

        if (element.bonus.remaining_balance > this.finalPrice) {
          ret = this.finalPrice;
        } else {
          ret = element.bonus.remaining_balance;
        }
      }
    });

    return ret;
  }


  calculateRem(event: any) {
    if(event.source.checked) {
      this.opRem = this.getBasePrice() * this.cancellationInsurance;
      this.defaults.has_cancellation_insurance = event.source.checked;
      this.defaults.price_cancellation_insurance = this.getBasePrice() * this.cancellationInsurance;
      this.calculateFinalPrice();
      return this.getBasePrice() *this.cancellationInsurance;
    } else {
      this.opRem = 0;
      this.defaults.has_cancellation_insurance = event.source.checked;
      this.defaults.price_cancellation_insurance = 0;
      this.calculateFinalPrice();
      return 0;
    }
  }

  calculateBoukiiCare(event: any) {
    if(event.source.checked) {
      this.boukiiCare = this.getBasePrice() * this.boukiiCarePrice;
      this.calculateFinalPrice();
      this.defaults.has_boukii_care = event.source.checked;
      this.defaults.price_boukii_care = this.getBasePrice() * this.boukiiCarePrice;
      return this.getBasePrice() * this.boukiiCarePrice;
    } else {
      this.boukiiCare = 0;
      this.calculateFinalPrice();
      this.defaults.has_boukii_care = event.source.checked;
      this.defaults.price_boukii_care = 0;
      return 0;
    }
  }

  setReemToItem(event: any, item: any) {
    if(event.source.checked) {
      item.has_cancellation_insurance = event.source.checked;
      item.price_cancellation_insurance = item.price_total * this.cancellationInsurance;
    } else {
      item.has_cancellation_insurance = event.source.checked;
      item.price_cancellation_insurance = 0;

    }
  }

  setBoukiiCareToItem(event: any, item: any) {
    if(event.source.checked) {
      item.has_boukii_care = event.source.checked;
      item.price_boukii_care = item.price_total * 0.10;
    } else {
      item.has_boukii_care = event.source.checked;
      item.price_boukii_care = 0;

    }
  }

  addClient() {

    const dialogRef = this.dialog.open(ClientCreateUpdateModalComponent, {
      width: '1000px',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales,
      data: {id: this.user.schools[0].id}
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {

        this.crudService.list('/admin/clients', 1, 1000, 'desc', 'id', '&school_id='+1)
          .subscribe((cl: any) => {
            const newClient = cl.data.find((c) => c.id = data.data.id);
            this.clientsForm.patchValue(newClient);
            this.defaults.client_main_id = newClient;
            this.getUtilzers(data.data.id, true);

          })

      }
    })
  }


  addUtilisateur() {

    const dialogRef = this.dialog.open(AddClientUserModalComponent, {
      width: '600px',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales,
      data: {id: this.user.schools[0].id}
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {

        if(data.action === 'add') {
          this.crudService.create('/clients-utilizers', {client_id: data.ret, main_id: this.defaults.client_main_id.id})
          .subscribe((res) => {
            this.getUtilzers(this.defaults.client_main_id, true);
          })
        } else {
          const user = {
            username: data.data.name,
            email: this.defaults.client_main_id.email,
            password: this.passwordGen.generateRandomPassword(12),
            image: null,
            type: 'client',
            active: true,
          }

          const client = {
            email: this.defaults.client_main_id.email,
            first_name: data.data.name,
            last_name: data.data.surname,
            birth_date: moment(data.data.fromDate).format('YYYY-MM-DD'),
            phone: this.defaults.client_main_id.phone,
            telephone: this.defaults.client_main_id.telephone,
            address: this.defaults.client_main_id.address,
            cp: this.defaults.client_main_id.cp,
            city: this.defaults.client_main_id.city,
            province: this.defaults.client_main_id.province,
            country: this.defaults.client_main_id.country,
            image: null,
            language1_id:null,
            language2_id:null,
            language3_id:null,
            language4_id:null,
            language5_id:null,
            language6_id:null,
            user_id: null,
            station_id: this.defaults.client_main_id.station_id
          }

          this.setLanguages(data.data.languages, client);

          this.crudService.create('/users', user)
          .subscribe((user) => {
            client.user_id = user.data.id;

            this.crudService.create('/clients', client)
              .subscribe((clientCreated) => {
                this.snackbar.open('Cliente creado correctamente', 'OK', {duration: 3000});

                this.crudService.create('/clients-schools', {client_id: clientCreated.data.id, school_id: this.user.schools[0].id})
                  .subscribe((clientSchool) => {

                    setTimeout(() => {
                      this.crudService.create('/clients-utilizers', {client_id: clientCreated.data.id, main_id: this.defaults.client_main_id.id})
                      .subscribe((res) => {
                        this.getUtilzers(this.defaults.client_main_id, true);
                      })}, 1000);
                  });

              })
          })
        }
      }
    });

  }

  setLanguages(langs: any, dataToModify: any) {
    if (langs.length >= 1) {

      dataToModify.language1_id = langs[0].id;
    } if (langs.length >= 2) {

      dataToModify.language2_id = langs[1].id;
    } if (langs.length >= 3) {

      dataToModify.language3_id = langs[2].id;
    } if (langs.length >= 4) {

      dataToModify.language4_id = langs[3].id;
    } if (langs.length >= 5) {

      dataToModify.language5_id = langs[4].id;
    } if (langs.length === 6) {

      dataToModify.language6_id = langs[5].id;
    }
  }

  getNacionality(id: any) {
    const country = this.countries.find((c) => c.id === id);
    return country ? country.code : 'NDF';
  }

  getCountry(id: any) {
    const country = this.countries.find((c) => c.id === id);
    return country ? country.name : 'NDF';
  }

  calculateFinalPrice() {
    let price = this.getBasePrice();

    //forfait primero

    this.bookingsToCreate.forEach(element => {
      if (element.forfait) {

        price = price + element.forfait.price + (element.forfait.price * (element.forfait.tva / 100));
      }
    });

    if (this.reduction !== null) {
      if (this.reduction.type === 1) {
        price = price - ((price * this.reduction.discount) / 100);
      } else {
        price = price - (this.reduction.discount > price ? price : this.reduction.discount);
      }
    }

    if (this.bonus !== null && price > 0) {
      this.bonus.forEach(element => {
        if (price > 0) {

          if (element.bonus.remaining_balance > price) {
            price = price - price;
          } else {
            price = price - element.bonus.remaining_balance;
          }
        }
      });
    }

    if(this.defaults.has_cancellation_insurance) {
      price = price + (this.getBasePrice() * this.cancellationInsurance);
    }

    if(this.defaults.has_boukii_care) {
      // coger valores de reglajes
      price = price + (this.getBasePrice() * this.boukiiCarePrice);
    }

    // añadir desde reglajes el tva
    this.finalPrice = price + (price * this.tva);
    this.finalPriceNoTaxes = price;
  }

  deleteBonus(index: number) {
    this.bonus.splice(index, 1);
    this.calculateFinalPrice();
  }

  generateCourseHours(startTime: string, endTime: string, interval: string): string[] {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const intervalParts = interval.split(' ');

    let intervalHours = 0;
    let intervalMinutes = 0;

    intervalParts.forEach(part => {
      if (part.includes('h')) {
        intervalHours = parseInt(part, 10);
      } else if (part.includes('min')) {
        intervalMinutes = parseInt(part, 10);
      }
    });

    let currentHours = startHours;
    let currentMinutes = startMinutes;
    const result = [];

    while (currentHours <= endHours || (currentHours === endHours && currentMinutes <= endMinutes)) {
      result.push(`${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`);
      currentMinutes += intervalMinutes;
      currentHours += intervalHours + Math.floor(currentMinutes / 60);
      currentMinutes %= 60;
    }

    return result;
  }

  generateCourseDurations(startTime: any, endTime: any, interval: any) {

    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const formatMinutes = (totalMinutes: number) => {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours > 0 ? hours + 'h' : ''} ${minutes > 0 ? minutes + 'm' : ''}`.trim();
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Expresión regular para capturar horas y/o minutos
    const intervalMatch = interval.match(/(\d+)(h|min)/g);
    let intervalTotalMinutes = 0;

    if (intervalMatch) {
      intervalMatch.forEach(part => {
        if (part.includes('h')) {
          intervalTotalMinutes += parseInt(part, 10) * 60;
        } else if (part.includes('min')) {
          intervalTotalMinutes += parseInt(part, 10);
        }
      });
    } else {
      // Si el intervalo no coincide con el formato esperado, manejar el error o asignar un valor por defecto
      console.error("Interval format is not correct.");
      return [];
    }

    const durations = [];
    for (let minutes = startMinutes + intervalTotalMinutes; minutes <= endMinutes; minutes += intervalTotalMinutes) {
      durations.push(formatMinutes(minutes - startMinutes));
    }

    const tableDurations = [];
    const tablePaxes = [];

    durations.forEach(element => {
      const priceRange = this.selectedItem.price_range.find((p) => p.intervalo === element);
      if (priceRange && priceRange.intervalo === element ) {

        if (this.extractValues(priceRange)[0]) {
          tableDurations.push(this.extractValues(priceRange)[0].interval);



          this.extractValues(priceRange).forEach(element => {
            const pax = element.key;

            if (pax && tablePaxes.length === 0 || pax && tablePaxes.length > 0 && !tablePaxes.find((p) => p === pax)) {
              tablePaxes.push(element.key);
            }
          });
        }

      }
    });

    this.durations = tableDurations;
    this.persons = tablePaxes;
  }

  calculateAvailablePaxes(event: any) {
    const paxes = [];

    const data = this.selectedItem.price_range.find(p => p.intervalo === event);

    this.extractValues(data).forEach(element => {
      const pax = element.key;

      if (pax && paxes.length === 0 || pax && paxes.length > 0 && !paxes.find((p) => p === pax)) {
        paxes.push(element.key);
      }
    });

    this.persons = paxes;

  }

  extractValues(data: any): { key: string, value: string, interval: string }[] {
    let results = [];

    for (const key in data) {
        if (data.hasOwnProperty(key) && data[key] != null && key !== "intervalo") {
            results.push({ key: key, value: data[key], interval: data["intervalo"] });
        }
    }

    return results;
  }
}
