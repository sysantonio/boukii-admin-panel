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
  durations = ['1h 30', '2h 00', '2h 30']; // Ejemplo de duraciones
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

  form: UntypedFormGroup;
  defaults: any = {
    price_total: null,
    has_cancellation_insurance: false,
    price_cancellation_insurance: null,
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
  loadingCalendar: boolean = true;
  sportTypeSelected: number = 1;

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
  selectedForfait = null;
  mainIdSelected = true;
  detailClient: any;
  private subscription: Subscription;

  constructor(private fb: UntypedFormBuilder, private dialog: MatDialog, private crudService: ApiCrudService, private calendarService: CalendarService, private snackbar: MatSnackBar) {

                this.minDate = new Date(); // Establecer la fecha mínima como la fecha actual
                this.subscription = this.calendarService.monthChanged$.subscribe(firstDayOfMonth => {
                  this.handleMonthChange(firstDayOfMonth);
                });
              }

  ngOnInit() {
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
        this.detailClient = this.clients[0];


        this.filterSportsByType();

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
            this.getDegrees(this.defaults.sport_id, true);

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

  filterSportsByType() {
    this.sportTypeSelected = this.form.get('sportType').value;
    let selectedSportType = this.form.get('sportType').value;
    this.filteredSports = of(this.sportData.filter(sport => sport.sport_type === selectedSportType));
    this.sportDataList = this.sportData.filter(sport => sport.sport_type === selectedSportType);
  }

  setCourseType(type: string, id: number) {
    this.courseType = type;
    this.courseTypeId = id;
    this.form.get("courseType").patchValue(id);

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

  selectItem(item: any) {

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
        client_id: this.detailClient.id,
        course_subgroup_id: null,
        course_id: item.id,
        hour_start: null,
        hour_end: null,
        price: this.selectedItem.price,
        currency: this.selectedItem.currency,
        date: null,
        attended: false
      });
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
      client_id: this.detailClient.id,
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

    return !hour.isBetween(start, end);
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
    this.getData();
  }

  confirmBooking() {

    if (this.courseTypeId === 2) {
      this.checkAllFields();

      this.snackbar.open('Complete los campos de fecha y hora de la reserva del curso', 'OK', {duration:3000});
      return;
    }

    let data: any = {};
      data.price_total = +this.selectedItem.price;
      data.has_cancellation_insurance = this.defaults.has_cancellation_insurance;
      data.payment_method_id = this.defaults.payment_method_id;
      data.paid = this.defaults.paid;
      data.price_cancellation_insurance = 0;
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
              data.courseDates.push({
                school_id: this.user.schools[0].id,
                booking_id: null,
                client_id: this.courseDates[0].client_id,
                course_id: this.selectedItem.id,
                course_date_id: item.course_groups[0].course_date_id,
                degree_id: item.course_groups[0].course_subgroups[this.selectedSubGroupItemIndex].degree_id,
                monitor_id: item.course_groups[0].course_subgroups[this.selectedSubGroupItemIndex].monitor_id,
                subgroup_id: item.course_groups[0].course_subgroups[this.selectedSubGroupItemIndex].id,
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
              data.courseDates.push({
                school_id: this.user.schools[0].id,
                booking_id: null,
                client_id: this.courseDates[0].client_id,
                course_id: this.selectedItem.id,
                course_date_id: item.course_date_id,
                degree_id: item.course_groups[0].course_subgroups[this.selectedSubGroupItemIndex].degree_id,
                monitor_id: item.course_groups[0].course_subgroups[this.selectedSubGroupItemIndex].monitor_id,
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
  }

  save() {
    this.bookingComplete = true;
    //this.create();
  }

  create() {

    let data: any = {};
    const courseDates = [];

    this.bookingsToCreate.forEach(element => {
      element.courseDates.forEach(cs => {
        courseDates.push(cs);

      });

      let paxes = 0;
      paxes = paxes + element.paxes;
      data = {
        price_total: element.price_total,
        has_cancellation_insurance: element.has_cancellation_insurance,
        price_cancellation_insurance: element.price_cancellation_insurance,
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
    });

      this.crudService.create('/bookings', data)
      .subscribe((booking) => {
        console.log('booking, created', booking);

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

            rqs.forEach(rq => {
              this.crudService.create('/booking-users', rq)
              .subscribe((bookingUser) => {
                console.log('bookingUser, created', bookingUser);
              });
            });

          });
      })

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

  toggleBorder(index: number, utilizer: any) {
    this.mainIdSelected = false;
    this.borderActive = index;
    this.defaultsBookingUser.client_id = utilizer.id;
    this.detailClient = this.clients.find((c) => c.id === utilizer.id)
  }

  showDetailFn(id: number) {
    this.showDetail = id;
  }

  getClients() {
    return this.crudService.list('/admin/clients', 1, 1000, 'desc', 'id', '&school_id='+1);/*
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
    this.defaults.sport_id = sport.sport_id;
    this.form.get("sport").patchValue(sport.sport_id);
    this.getDegrees(sport.sport_id);
  }

  getDegrees(sportId: number, onLoad:boolean = false) {
   this.crudService.list('/degrees', 1, 1000, 'asc', 'degree_order', '&school_id='+this.user.schools[0].id + '&sport_id='+sportId + '&active=1')
      .subscribe((data) => {
        this.levels = data.data.sort((a, b) => a.degree_order - b.degree_order);


        this.filteredLevel = this.levelForm.valueChanges.pipe(
          startWith(''),
          map((value: any) => typeof value === 'string' ? value : value?.annotation),
          map(annotation => annotation ? this._filterLevel(annotation) : this.levels.slice())
        );

        if (onLoad) {
          this.clients[0].sports.forEach(sport => {
            if (sport.id === this.defaults.sport_id) {
              const level = this.levels.find((l) => l.id === sport.pivot.degree_id);
              this.levelForm.patchValue(level);
              this.defaultsBookingUser.degree_id = level.id;
              this.getCourses(level, this.monthAndYear);
            }
          });
        }
      })
  }

  getUtilzers(client: any, onLoad = false) {
    this.defaultsBookingUser.client_id = client.id;
    this.crudService.get('/admin/clients/' + client.id +'/utilizers')
      .subscribe((data: any) => {
        this.utilizers = data.data;
      });

      if (!onLoad) {
        client.sports.forEach(sport => {

          if (sport.id === this.defaults.sport_id) {
            const level = this.levels.find((l) => l.id === sport.pivot.degree_id);
            this.levelForm.patchValue(level);
            this.defaultsBookingUser.degree_id = level.id;
            this.getCourses(level, this.monthAndYear);
          }
        });
      }

      this.getDegrees(this.defaults.sport_id, false);
  }

  getCourses(level: any, date: any, fromPrivate = false) {

    this.loadingCalendar = true;
    this.dateClass();
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
      get_lower_degrees: true
    };

    this.crudService.post('/availability', rq)
      .subscribe((data) => {
        console.log(data);

        this.defaultsBookingUser.degree_id = level.id;
        this.courses = data.data;
        if (!fromPrivate) {

          this.coursesMonth = data.data;
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

  emitDateChange(event: MatDatepickerInputEvent<Date | null, unknown>): void {
    this.getCourses(this.levelForm.value, event.value, true);
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
        this.selectedForfait = this.settings.extras.forfait.length > 0 ? this.settings.extras.forfait.length[0] : null;
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
    if (id !== null) {
      return this.levels.find((l) => l.id === id).color;

    }
  }

  getLevelOrder(id: any) {
    if (id !== null) {
      return this.levels.find((l) => l.id === id).degree_order;

    }
  }

  getLevelName(id: any) {
    if (id !== null) {

      const level = this.levels.find((l) => l.id === id);
      return level.annotation + ' - ' + level.name;
    }
  }

  getMonitorAvatar(id: number) {

    if (id === null) {
      return this.userAvatar;
    } else {

      const monitor = this.monitors.find((m) => m.id === id);
      return monitor.image;
    }
  }

  getMonitorName(id: number) {
    if (id !== null) {

      const monitor = this.monitors.find((m) => m.id === id);

      return monitor.first_name + ' ' + monitor.last_name;
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

  handleMonthChange(firstDayOfMonth: Date) {
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
    this.monthAndYear = moment(this.minDate).isAfter(moment(value)) ? this.minDate : value;
    this.getCourses(this.levelForm.value.id, this.monthAndYear);

    widget.close();
  }

  checkAllFields() {
    let ret = false;

    for (let i = 0; i<this.courseDates.length; i++){
      if((!this.courseDates[i].date && this.courseDates[i].date === null) || this.courseDates[i].monitor_id === null) {
        ret = true;
        break;
      }
    }

    return ret;
  }

  getBookableCourses(dates: any) {
    return dates.find((d) => this.canBook(d.date)).course_groups;
  }
}
