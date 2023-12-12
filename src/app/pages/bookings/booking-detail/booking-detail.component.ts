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
import { ConfirmModalComponent } from '../../monitors/monitor-detail/confirm-dialog/confirm-dialog.component';
import { AddDiscountBonusModalComponent } from '../bookings-create-update/add-discount-bonus/add-discount-bonus.component';
import { AddReductionModalComponent } from '../bookings-create-update/add-reduction/add-reduction.component';
import { ActivatedRoute } from '@angular/router';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { SchoolService } from 'src/service/school.service';

@Component({
  selector: 'vex-booking-detail',
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.scss'],
  animations: [stagger20ms, fadeInUp400ms]
})
export class BookingDetailComponent implements OnInit {

  privateIcon = 'https://school.boukii.com/assets/icons/prive_ski2x.png';
  collectifIcon = 'https://school.boukii.com/assets/icons/collectif_ski2x.png';
  @Input()
  public monthAndYear = new Date();

  @Output()
  public monthAndYearChange = new EventEmitter<Date | null>();

  borderActive: number = -1;
  showDetail: any = [];

  createComponent = BookingsCreateUpdateModalComponent;
  selectedDatePrivate = new Date();

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
  bookingExtras = [];
  courseExtra = [];
  coursesMonth = [];
  monitors = [];
  season = [];
  school = [];
  settings: any = [];
  user: any;
  id: any;
  selectedForfait = [];
  mainIdSelected = true;
  detailClient: any;
  reduction: any = null;
  finalPrice: any = null;
  finalPriceNoTaxes: any = null;
  bonus: any = [];
  totalPrice: any = 0;
  booking: any;
  bookingUsers: any;
  countries = MOCK_COUNTRIES;
  schoolSettings: any = [];

  tva = 0;
  cancellationInsurance = 0;
  boukiiCarePrice = 0;

  private subscription: Subscription;

  constructor(private fb: UntypedFormBuilder, private dialog: MatDialog, private crudService: ApiCrudService, private calendarService: CalendarService,
    private snackbar: MatSnackBar, private activatedRoute: ActivatedRoute, private schoolService: SchoolService) {

                this.minDate = new Date(); // Establecer la fecha mínima como la fecha actual
                this.subscription = this.calendarService.monthChanged$.subscribe(firstDayOfMonth => {
                  this.handleMonthChange(firstDayOfMonth);
                });
              }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));

    this.getMonitors();
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
    this.id = this.activatedRoute.snapshot.params.id;


    this.crudService.get('/schools/'+this.user.schools[0].id)
    .subscribe((school) => {
      this.school = school.data;
      this.settings = JSON.parse(school.data.settings);

      forkJoin([this.getSportsType(), this.getClients()])
      .subscribe((data: any) => {
        this.sportTypeData = data[0].data.reverse();
        this.clients = data[1].data;
        this.detailClient = this.clients[0];

        this.crudService.get('/bookings/'+this.id)
      .subscribe((data) => {
        this.booking = data.data;

        this.crudService.list('/booking-users', 1, 1000, null, null, '&booking_id='+this.id)
          .subscribe((bookingUser) => {
            this.bookingUsers = bookingUser.data;

            const groupedByCourseId = bookingUser.data.reduce((accumulator, currentValue) => {
              // Obtiene el course_id del objeto actual
              const key = currentValue.course_id;

              // Si el acumulador ya no tiene este course_id como clave, inicialízalo
              if (!accumulator[key]) {
                accumulator[key] = [];
              }

              // Agrega el objeto actual al array correspondiente para este course_id
              accumulator[key].push(currentValue);

              return accumulator;
            }, {});

            for (const courseId in groupedByCourseId) {
              if (groupedByCourseId.hasOwnProperty(courseId)) {
                const data = {price_total: 0, courseDates: []}
                groupedByCourseId[courseId].forEach(element => {
                  data.price_total = data.price_total + parseInt(element.price);
                  data.courseDates.push(element);
                });
                this.bookingsToCreate.push(data);

                this.crudService.get('/courses/' + courseId)
                  .subscribe((course) => {
                    this.courses.push(course.data);
                  })
              }
            }


            this.bookingUsers.forEach((bu ,idx) => {
              this.crudService.list('/booking-user-extras', 1, 1000, null, null, '&booking_user_id='+bu.id)
                .subscribe((bue) =>{
                  if (bue.data.length > 0) {
                    this.bookingExtras.push(bue.data[0]);
                    bue.data.forEach(element => {
                      this.crudService.get('/course-extras/'+element.course_extra_id)
                      .subscribe((ce) => {
                        if (ce.data) {
                          ce.data.course_date_id = bu.course_date_id;
                          ce.data.booking_user_id = bu.id;
                          this.courseExtra.push(ce.data);
                        }
                      })
                    });
                  }
                })
            });

            this.calculateFinalPrice();
            setTimeout(() => {
              this.loading = false;
            }, 0);
          })
        });
      });

    });
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

    if (this.courseTypeId === 2 && this.checkAllFields()) {

      this.snackbar.open('Complete los campos de fecha y hora de la reserva del curso', 'OK', {duration:3000});
      return;
    }

    let data: any = {};
      data.price_total = +this.selectedItem.price;
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

    this.finalPrice = this.getBasePrice();
    //this.create();
  }

  create() {

    /*let data: any = {};
    const courseDates = [];

    this.bookingsToCreate.forEach(element => {
      element.courseDates.forEach(cs => {
        courseDates.push(cs);

      });

      let paxes = 0;
      paxes = paxes + element.paxes;
      data = {
        price_total: element.price_total,
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
      })*/

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

  private _filterLevel(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.levels.filter(level => level.annotation.toLowerCase().includes(filterValue));
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
    this.detailClient = this.clients.find((c) => c.id === utilizer.id);

    this.detailClient.sports.forEach(sport => {

      if (sport.id === this.defaults.sport_id) {
        const level = this.levels.find((l) => l.id === sport.pivot.degree_id);
        this.levelForm.patchValue(level);
        this.defaultsBookingUser.degree_id = level.id;
        this.getCourses(level, this.monthAndYear);
      }
    });
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
    if(birthDateString && birthDateString !== null) {
      const today = new Date();
      const birthDate = new Date(birthDateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }

      return age;
    } else {
      return 0;
    }

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

  getClientAvatar(id: number) {

    if (id === null) {
      return this.userAvatar;
    } else {

      const client = this.clients.find((m) => m.id === id);
      return client.image;
    }
  }

  getClientName(id: number) {
    if (id && id !== null) {

      const client = this.clients.find((m) => m.id === id);

      return client.first_name + ' ' + client.last_name;
    }
  }

  getClient(id: number) {
    if (id && id !== null) {

      const client = this.clients.find((m) => m.id === id);

      return client;
    }
  }


  getCourse(id: number) {

    if (id && id !== null) {
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

  setForfait(event:any, forfait: any) {

    if (event.source.checked) {

      this.selectedForfait = forfait;
    } else {
      this.selectedForfait = null;
    }
  }

  deleteBooking(index: number, data: any) {


    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      maxWidth: '100vw',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales,
      data: {message: 'Do you want to remove this item? This action will be permanetly', title: 'Delete monitor course'}
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {

        this.crudService.delete('/booking-users', data.id)
          .subscribe(() => {
            this.bookingsToCreate.splice(index, 1);
            this.snackbar.open('Item deleted', 'OK', {duration: 3000});
          })
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
      return (this.getBasePrice() * this.reduction.discount) / 100;
    } else {
      return this.reduction.discount > this.getBasePrice() ? this.getBasePrice() : this.reduction.discount;
    }
  }

  calculateBonusDiscount() {
    if (this.bonus.bonus.remaining_balance > this.getBasePrice()) {
      return this.getBasePrice();
    } else {
      return this.bonus.bonus.remaining_balance;
    }
  }


  calculateRem(event: any) {
    if(event.source.checked) {
      this.opRem = this.getBasePrice() * 0.10;
      this.defaults.has_cancellation_insurance = event.source.checked;
      this.defaults.price_cancellation_insurance = this.getBasePrice() * 0.10;
      return this.getBasePrice() * 0.10;
    } else {
      this.opRem = 0;
      this.defaults.has_cancellation_insurance = event.source.checked;
      this.defaults.price_cancellation_insurance = 0;
      return 0;
    }
  }

  calculateBoukiiCare(event: any) {
    if(event.source.checked) {
      this.boukiiCare = this.getBasePrice() * 0.10;

      this.defaults.has_boukii_care = event.source.checked;
      this.defaults.price_boukii_care = this.getBasePrice() * 0.10;
      return this.getBasePrice() * 0.10;
    } else {
      this.boukiiCare = 0;

      this.defaults.has_boukii_care = event.source.checked;
      this.defaults.price_boukii_care = 0;
      return 0;
    }
  }

  setReemToItem(event: any, item: any) {
    if(event.source.checked) {
      item.has_cancellation_insurance = event.source.checked;
      item.price_cancellation_insurance = item.price_total * 0.10;
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

    this.courseExtra.forEach(element => {

        price = price + (+element.price);
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

    if(this.booking.has_cancellation_insurance) {
      price = price + (this.getBasePrice() * this.cancellationInsurance);
    }

    if(this.booking.has_boukii_care) {
      // coger valores de reglajes
      price = price + this.getBasePrice() + (this.boukiiCarePrice * this.getBookingPaxes() * this.getBookingDates());
    }

    // añadir desde reglajes el tva
    this.finalPrice = price + (price * this.tva);
    this.finalPriceNoTaxes = price;
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

  getCourseExtraForfait(forfait: any, data: any) {
    const courseExtra = this.courseExtra.find((c) => c.course_id === data.course_id && c.course_date_id === data.course_date_id && forfait.id === c.name);
    if (courseExtra) {
      data.forfait = courseExtra;
      return true;
    }
  }

  convertToInt(value: any) {
    return parseFloat(value);
  }


  getCourseExtraForfaitPrice(data: any) {
    let ret = 0;
    this.courseExtra.forEach(c => {

      if (c.course_id === data.course_id) {
        ret = ret + parseFloat(c.price);
        data.forfait = c;
      }
    });
    return ret;
  }

  getBookingPaxes(){
    let ret = 0;
    this.bookingsToCreate.forEach(element => {
      ret = ret + element.paxes;
    });

    return ret;
  }

  getBookingDates(){
    let ret = 0;
    this.bookingsToCreate.forEach(element => {
      ret = ret + element.courseDates.length;
    });

    return ret;
  }
}
