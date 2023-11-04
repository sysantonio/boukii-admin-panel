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

@Component({
  selector: 'vex-bookings-create-update',
  templateUrl: './bookings-create-update.component.html',
  styleUrls: ['./bookings-create-update.component.scss'],
  animations: [fadeInUp400ms, stagger20ms]
})
export class BookingsCreateUpdateComponent implements OnInit {

  borderActive: boolean = false;

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
  defaults: any = null;

  options: string[] = ['One', 'Two', 'Three'];
  mode: 'create' | 'update' = 'create';
  loading: boolean = true;
  sportTypeSelected: number = -1;

  mockClientsData = CLIENTS;
  mockSubClientsData = SUB_CLIENTS;
  mockSportType = MOCK_SPORT_TYPES;
  mockSportData = MOCK_SPORT_DATA;
  mockLevelData = LEVELS;
  mockCourses = MOCK_COURSES;
  mockMonitors = MOCK_MONITORS;

  constructor(private fb: UntypedFormBuilder, private dialog: MatDialog) {

                this.minDate = new Date(); // Establecer la fecha mínima como la fecha actual
                this.selectedDate = this.minDate; // Puede ser cualquier fecha que quieras tener seleccionada por defecto
              }

  ngOnInit() {

    this.form = this.fb.group({
      sportType: [null], // Posiblemente establezcas un valor predeterminado aquí
      sportForm: [null],
      observations: [null],
      observations_school: [null],
    })

    this.filteredOptions = this.clientsForm.valueChanges.pipe(
      startWith(''),
      map((value: any) => typeof value === 'string' ? value : value?.full_name),
      map(full_name => full_name ? this._filter(full_name) : this.mockClientsData.slice())
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
      map(annotation => annotation ? this._filterLevel(annotation) : this.mockLevelData.slice())
    );

    this.filteredSports = this.sportForm.valueChanges.pipe(
      startWith(''),
      map((value: any) => typeof value === 'string' ? value : value?.name),
      map(name => name ? this._filterSport(name) : this.mockSportData.slice())
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

    this.loading = false;
  }

  filterSportsByType() {
    this.sportTypeSelected = this.form.get('sportType').value;
    let selectedSportType = this.form.get('sportType').value;
    this.filteredSports = of(this.mockSportData.filter(sport => sport.sport_type === selectedSportType));
  }

  setCourseType(type: string) {
    this.courseType = type;
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
    return this.mockClientsData.filter(client => client.full_name.toLowerCase().includes(filterValue));
  }

  private _filterMonitor(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.mockMonitors.filter(monitor => monitor.full_name.toLowerCase().includes(filterValue));
  }

  private _filterLevel(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.mockLevelData.filter(level => level.annotation.toLowerCase().includes(filterValue));
  }

  private _filterSport(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.mockSportData.filter(sport => sport.name.toLowerCase().includes(filterValue));
  }

  private _filterTime(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.times.filter(time => time.toLowerCase().includes(filterValue));
  }

  displayFn(client: any): string {
    return client && client.full_name ? client.full_name : '';
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
}
