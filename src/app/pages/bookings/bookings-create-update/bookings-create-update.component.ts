import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable, map, of, startWith } from 'rxjs';
import { MOCK_SPORT_DATA, MOCK_SPORT_TYPES } from 'src/app/static-data/sports-data';
import { CLIENTS, SUB_CLIENTS } from 'src/app/static-data/clients-data';
import { LEVELS } from 'src/app/static-data/level-data';
import { MOCK_COURSES } from 'src/app/static-data/courses-data';
import { MOCK_MONITORS } from 'src/app/static-data/monitors-data';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { MatDialog } from '@angular/material/dialog';
import { BookingsCreateUpdateModalComponent } from '../bookings-create-update-modal/bookings-create-update-modal.component';
import { ApiCrudService } from 'src/service/crud.service';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'vex-bookings-create-update',
  templateUrl: './bookings-create-update.component.html',
  styleUrls: ['./bookings-create-update.component.scss'],
  animations: [fadeInUp400ms, stagger20ms]
})
export class BookingsCreateUpdateComponent implements OnInit {

  borderActive: boolean = false;
  showDetail: boolean = true;

  createComponent = BookingsCreateUpdateModalComponent;

  imagePath = 'https://school.boukii.com/assets/icons/collectif_ski2x.png';
  title = 'Título de la Reserva';
  titleMoniteur = 'Nombre monitor';
  usersCount = 5;
  duration = '3 horas';
  dates = ['03/11/2023', '04/11/2023', '05/11/2023']; // Ejemplo de fechas
  durations = ['1h 30', '2h 00', '2h 30']; // Ejemplo de duraciones
  persons = [1, 2, 3, 4]; // Ejemplo de número de personas

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
  selectedButton: string = '';
  selectedSubButton: string = '';
  bookingComplete: boolean = false;

  static id = 100;
  minDate: Date;
  selectedDate: Date;
  selectedItem: any = null;

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

  courseType: any = null;;

  form: UntypedFormGroup;
  defaults: any = {
    price_total: null,
    has_cancellation_insurance: null,
    price_cancellation_insurance: null,
    currency: null,
    paid_total: null,
    paid: null,
    payrexx_reference: null,
    payrexx_transaction: null,
    attendance: null,
    payrexx_refund: null,
    notes: null,
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
  sportTypeSelected: number = -1;

  clients = [];
  mockSubClientsData = SUB_CLIENTS;
  sportData = [];
  sportDataList = [];
  sportTypeData = [];
  levels = [];
  utilizers = [];
  mockCourses = MOCK_COURSES;
  mockMonitors = MOCK_MONITORS;

  constructor(private fb: UntypedFormBuilder, private dialog: MatDialog, private crudService: ApiCrudService) {

                this.minDate = new Date(); // Establecer la fecha mínima como la fecha actual
                this.selectedDate = this.minDate; // Puede ser cualquier fecha que quieras tener seleccionada por defecto
              }

  ngOnInit() {

    this.form = this.fb.group({
      sportType: [null], // Posiblemente establezcas un valor predeterminado aquí
      sportForm: [null],
      sport: [null],
      observations: [null],
      observations_school: [null],
      fromDate: [null]
    })

    this.filteredOptions = this.clientsForm.valueChanges.pipe(
      startWith(''),
      map((value: any) => typeof value === 'string' ? value : value?.full_name),
      map(full_name => full_name ? this._filter(full_name) : this.clients.slice())
    );

    this.clientsForm.valueChanges.subscribe((selectedClient: any) => {

      if (selectedClient) {
        this.filteredSubClients = of(this.mockSubClientsData.filter(sub => sub.selected === selectedClient.selected));
      } else {
        this.filteredSubClients = of([]);
      }
    });

    this.filteredLevel = this.levelForm.valueChanges.pipe(
      startWith(''),
      map((value: any) => typeof value === 'string' ? value : value?.annotation),
      map(annotation => annotation ? this._filterLevel(annotation) : this.levels.slice())
    );

    this.filteredSports = this.sportForm.valueChanges.pipe(
      startWith(''),
      map((value: any) => typeof value === 'string' ? value : value?.name),
      map(name => name ? this._filterSport(name) : this.sportData.slice())
    );

    this.filteredMonitors = this.monitorsForm.valueChanges.pipe(
      startWith(''),
      map((value: any) => typeof value === 'string' ? value : value?.full_name),
      map(full_name => full_name ? this._filterMonitor(full_name) : this.mockMonitors.slice())
    );

    this.filteredTimes = this.timeControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterTime(value))
      );

    if (this.defaults) {
      this.mode = 'update';
    } else {
      this.defaults = {};
      this.mode = 'create';
    }

    this.getSportsType();
    this.getSports();
    this.getClients();
    this.getDegrees();
  }

  filterSportsByType() {
    this.sportTypeSelected = this.form.get('sportType').value;
    let selectedSportType = this.form.get('sportType').value;
    this.filteredSports = of(this.sportData.filter(sport => sport.sport_type === selectedSportType));
    this.sportDataList = this.sportData.filter(sport => sport.sport_type === selectedSportType);
  }

  setCourseType(type: string, id: number) {
    this.courseType = type;
    this.form.get("courseType").patchValue(id);
  }

  selectItem(item: any) {
    this.selectedItem = item;
}

  save() {
    if (this.mode === 'create') {
      this.create();
    } else if (this.mode === 'update') {
      this.update();
    }
  }

  create() {
    const booking = this.form.value;
    this.bookingComplete = true;
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
    return this.mockMonitors.filter(monitor => monitor.full_name.toLowerCase().includes(filterValue));
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
    return client && (client.first_name && client.last_name) ? client.first_name + ' ' + client.last_name : client.first_name;
  }

  displayFnMoniteurs(monitor: any): string {
    return monitor && monitor.full_name ? monitor.full_name : '';
  }

  displayFnSport(sport: any): string {
    return sport && sport.name ? sport.name : '';
  }

  displayFnLevel(level: any): string {
    return level && level.name ? level.name : '';
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

  toggleBorder() {
    this.borderActive = !this.borderActive;
  }

  showDetailFn(event: boolean) {
    this.showDetail = event;
  }

  getClients() {
    this.crudService.list('/clients', 1, 1000)
      .subscribe((data: any) => {
        this.clients = data.data;
        this.loading = false;

      })
  }

  getSportsType() {
    this.crudService.list('/sport-types', 1, 1000)
      .subscribe((data) => {
        this.sportTypeData = data.data.reverse();
      });
  }

  getSports() {
    this.crudService.list('/sports', 1, 1000)
      .subscribe((data) => {
        this.sportData = data.data.reverse();
      });
  }

  selectSport(sport: any) {
    this.defaults.sport_id = sport.id;
    this.form.get("sport").patchValue(sport.id);

  }

  getDegrees() {
    this.crudService.list('/degrees', 1, 1000)
      .subscribe((data) => {
        this.levels = data.data;
      })
  }

  getUtilzers(id: number) {
    this.crudService.get('/admin/clients/' + id +'/utilizers')
      .subscribe((data: any) => {
        this.utilizers = data.data;
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
}
