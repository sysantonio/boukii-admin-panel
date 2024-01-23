import { Component, ElementRef, HostListener, NgZone, OnInit, QueryList, ViewChild } from '@angular/core';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { SalaryCreateUpdateModalComponent } from './salary-create-update-modal/salary-create-update-modal.component';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { LEVELS } from 'src/app/static-data/level-data';
import { FormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable, forkJoin, map, startWith } from 'rxjs';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { MOCK_PROVINCES } from 'src/app/static-data/province-data';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as moment from 'moment';
import { ApiCrudService } from 'src/service/crud.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ColorSchemeName } from 'src/@vex/config/colorSchemeName';
import { ConfigService } from 'src/@vex/config/config.service';
import { MatDialog } from '@angular/material/dialog';
import { ExtraCreateUpdateModalComponent } from './extra-create-update-modal/extra-create-update-modal.component';
import { LevelGoalsModalComponent } from './level-goals-modal/level-goals-modal.component';
import { SchoolService } from 'src/service/school.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'vex-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [stagger20ms]
})
export class SettingsComponent implements OnInit {
  @ViewChild(MatDatepicker) pickers: QueryList<MatDatepicker<any>>;
  @ViewChild('table-level') dateTable: MatTable<any>;
  @ViewChild('table-extras-sports') dateTableSport: MatTable<any>;
  @ViewChild('forfaitTable') dateTableForfait: MatTable<any>;
  @ViewChild('transportTable') dateTableTransport: MatTable<any>;
  @ViewChild('foodTable') dateTableFood: MatTable<any>;
  @ViewChild('scrollContainer') scrollContainer: ElementRef;

  loading: boolean = true;

  filteredHours: string[];

  seasonForm: UntypedFormGroup;
  myControlCountries = new FormControl();
  myControlProvinces = new FormControl();

  filteredCountries: Observable<any[]>;
  filteredProvinces: Observable<any[]>;

  school: any = [];
  blockages = [];
  mockLevelData = LEVELS;
  mockCountriesData = MOCK_COUNTRIES;
  mockProvincesData = MOCK_PROVINCES;

  holidays = [];
  holidaysSelected = [];
  people = 6; // Aquí puedes cambiar el número de personas
  intervalos = Array.from({ length: 28 }, (_, i) => 15 + i * 15);

  dataSource: any;
  displayedColumns = ['intervalo', ...Array.from({ length: this.people }, (_, i) => `${i + 1}`)];
  dataSourceLevels = new MatTableDataSource([]);
  displayedLevelsColumns: string[] = ['ageMin','ageMax', 'annotation', 'name', 'status', 'color', 'edit'];

  dataSourceSport = new MatTableDataSource([]);
  dataSourceForfait = new MatTableDataSource([]);
  dataSourceTransport = new MatTableDataSource([]);
  dataSourceFood = new MatTableDataSource([]);
  displayedSportColumns: string[] = ['id', 'sport', 'name', 'price', 'tva', 'status', 'edit', 'delete'];
  displayedExtrasColumns: string[] = ['id', 'product', 'name', 'price', 'tva', 'status', 'edit', 'delete'];

  tva = 0;
  boukiiCarePrice = 0;
  cancellationInsurancePercent = 0;

  today = new Date();

  selectedFrom = null;
  selectedTo = null;
  selectedFromHour: any;
  selectedToHour: any;
  hours: string[] = [];
  sports: any = [];
  sportsList: any = [];
  schoolSports: any = [];
  season: any = null;

  defaultsSchoolData = {
    contact_phone: null,
    contact_address: null,
    contact_address_number: null,
    contact_cp: null,
    contact_city: null,
    contact_province: null,
  }

  defaultsCommonExtras = {
    forfait: [],
    transport: [],
    food: [],

  };

  theme = 'light';
  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent) {
    this.ngZone.runOutsideAngular(() => {
      if (this.scrollContainer && this.scrollContainer.nativeElement) {
        const container = this.scrollContainer.nativeElement;
        const isHorizontalScroll = event.shiftKey;
        if (isHorizontalScroll) {
          container.scrollLeft += event.deltaY;
        } else {
          container.scrollLeft += event.deltaY;
        }
        event.preventDefault();
      }
    });
  }

  createComponent = SalaryCreateUpdateModalComponent;

  entitySalary = '/school-salary-levels';
  dataSourceSalary = new MatTableDataSource();
  columns: TableColumn<any>[] = [
    { label: '#', property: 'id', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'name', property: 'name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'method_paiment', property: 'pay', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'status', property: 'active', type: 'status', visible: true, cssClasses: ['font-medium'] },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }

  ];
  authorized = true;
  authorizedBookingComm = true;
  selectedSport = -1;

  hasCancellationInsurance = false;
  hasBoukiiCare = false;
  hasTVA = false;

  user: any;

  constructor(private ngZone: NgZone, private fb: UntypedFormBuilder, private crudService: ApiCrudService, private snackbar: MatSnackBar,
    private configService: ConfigService, private dialog: MatDialog, private schoolService: SchoolService, private translateSerivce: TranslateService) {
    this.filteredHours = this.hours;
  }


  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));

    /*this.mockLevelData.forEach(element => {
      this.crudService.create('/degrees', element)

      .subscribe(() => console.log('ok'))
    });*/
    /*this.crudService.list('/degrees', 1, 10000)
      .subscribe((data) => {
        data.data.forEach(element => {
          this.crudService.delete('/degrees', element.id)
          .subscribe(() => console.log('ok'))
        });
      })*/
    this.generateHours();
    this.getData();

  }

  getData() {
    this.crudService.get('/schools/'+this.user.schools[0].id)
      .subscribe((data) => {

        this.school = data.data;

        forkJoin([this.getSchoolSeason(),this.getSports(),this.getBlockages(), this.getSchoolSports()])
          .subscribe((data: any) => {
            this.season = data[0].data.filter((s) => s.is_active)[0];
            this.sports = data[1].data;
            this.blockages = data[2].data;
            this.schoolSports = data[3].data;
            data[3].data.forEach((element, idx) => {
              this.sportsList.push(element.sport_id);

              const sportData = this.sports.find((s) => s.id === element.sport_id);
              this.schoolSports[idx].name = sportData.name;
              this.schoolSports[idx].icon_selected = sportData.icon_selected;
              this.schoolSports[idx].icon_unselected = sportData.icon_unselected;
              this.schoolSports[idx].sport_type = sportData.sport_type;
            });

            if (this.season) {

              this.holidays = JSON.parse(this.season.vacation_days);
            }
            this.getSchoolSportDegrees();

            this.selectedFrom = moment(this.season?.start_date).toDate();
            this.selectedTo = moment(this.season?.end_date).toDate();

            this.seasonForm = this.fb.group({
              fromDate: [moment(this.season?.start_date).toDate()],
              toDate: [moment(this.season?.end_date).toDate()],
              startHour: [this.season?.hour_start],
              endHour: [this.season?.hour_end],
              contact_phone: [this.school.contact_phone],
              contact_address: [this.school.contact_address],
              contact_address_number: [this.school.contact_address_number],
              contact_cp: [this.school.contact_cp],
              contact_city: [this.school.contact_city],
              contact_province: [this.school.contact_province]

            });

            this.defaultsSchoolData.contact_phone = this.school.contact_phone;
            this.defaultsSchoolData.contact_address = this.school.contact_address;
            this.defaultsSchoolData.contact_address_number = this.school.contact_address_number;
            this.defaultsSchoolData.contact_cp = this.school.contact_cp;
            this.defaultsSchoolData.contact_city = this.school.contact_city;
            this.defaultsSchoolData.contact_province = this.school.contact_province;

            this.seasonForm.get('startHour').valueChanges.subscribe(selectedHour => {
              this.filterHours(selectedHour);
            });

            this.filteredCountries = this.myControlCountries.valueChanges.pipe(
              startWith(''),
              map(value => typeof value === 'string' ? value : value.name),
              map(name => name ? this._filterCountries(name) : this.mockCountriesData.slice())
            );

            this.myControlCountries.valueChanges.subscribe(country => {
              this.myControlProvinces.setValue('');  // Limpia la selección anterior de la provincia
              this.filteredProvinces = this._filterProvinces(country.id);
            });

            const settings = JSON.parse(this.school.settings);
            this.people = settings &&  settings.prices_range.people ? settings.prices_range.people : this.people;
            this.displayedColumns = ['intervalo', ...Array.from({ length: this.people }, (_, i) => `${i + 1}`)];
            this.dataSource = settings &&  settings.prices_range.prices && settings.prices_range.prices !== null ? settings.prices_range.prices :
            this.intervalos.map(intervalo => {
              const fila: any = { intervalo: this.formatIntervalo(intervalo) };
              for (let i = 1; i <= this.people; i++) {
                fila[`${i}`] = '';
              }
              return fila;
            });


            this.hasCancellationInsurance = settings?.taxes?.cancellation_insurance_percent !== null && parseFloat(settings?.taxes?.cancellation_insurance_percent) !== 0 && !isNaN(parseFloat(settings?.taxes?.cancellation_insurance_percent));
            this.hasBoukiiCare = settings?.taxes?.boukii_care_price !== null && parseInt(settings?.taxes?.boukii_care_price) !== 0 && !isNaN(parseInt(settings?.taxes?.boukii_care_price));
            this.hasTVA = settings?.taxes?.tva !== null && parseFloat(settings?.taxes?.tva) !== 0 && !isNaN(parseFloat(settings?.taxes?.tva));

            this.cancellationInsurancePercent = parseFloat(settings?.taxes?.cancellation_insurance_percent);
            this.boukiiCarePrice = parseInt(settings?.taxes?.boukii_care_price);
            this.tva = parseFloat(settings?.taxes?.tva);

            this.dataSourceForfait.data = settings?.extras.forfait;
            this.dataSourceFood.data = settings?.extras.food;
            this.dataSourceTransport.data = settings?.extras.transport;

            setTimeout(() => {
              this.dataSourceLevels.data = this.schoolSports[0].degrees;

            }, 500);

            this.loading = false;
          });
      });
  }

  addHoliday() {
    this.holidays.push(new Date()); // Agrega una nueva fecha al array
  }

  generateHours() {
    for (let i = 0; i <= 23; i++) {
      for (let j = 0; j < 60; j += 60) {
        const formattedHour = `${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`;
        this.hours.push(formattedHour);
      }
    }
  }

  formatIntervalo(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas > 0 ? horas + 'h ' : ''}${mins > 0 ? mins + 'm' : ''}`.trim();
  }

  updateTable() {
    // Lógica para actualizar la tabla basándote en el valor de this.people

    // Por ejemplo, podrías actualizar las columnas mostradas:
    this.displayedColumns = ['intervalo']; // Inicializa con la columna de intervalo
    for (let i = 1; i <= this.people; i++) {
      this.displayedColumns.push(`${i}`); // Añade columnas para cada persona
    }

    // También podrías necesitar actualizar los datos mostrados en la tabla
    // ...
  }

  displayFnCountry(country: any): string {
    return country && country.name ? country.name : '';
  }

  displayFnProvince(province: any): string {
    return province && province.name ? province.name : '';
  }

  private _filter(name: string, countryId: number): any[] {
    const filterValue = name.toLowerCase();
    return this.mockProvincesData.filter(province => province.country_id === countryId && province.name.toLowerCase().includes(filterValue));
  }

  private _filterCountries(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.mockCountriesData.filter(country => country.name.toLowerCase().includes(filterValue));
  }

  private _filterProvinces(countryId: number): Observable<any[]> {
    return this.myControlProvinces.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this._filter(name, countryId) : this.mockProvincesData.filter(p => p.country_id === countryId).slice())
    );
  }

  editGoal(data: any, id: number) {
    const dialogRef = this.dialog.open(LevelGoalsModalComponent, {
      width: '90vw',
      height: '90vh',
      maxWidth: '100vw',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales
      data: data
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        if(data.deletedGoals.length > 1) {
          data.deletedGoals.forEach(element => {
            this.crudService.delete('/degrees-school-sport-goals', element.id)
              .subscribe((res) => {
                this.snackbar.open(this.translateSerivce.instant('snackbar.settings.objectives_update'), 'OK', {duration: 3000});
              })
          });
        }
        data.goals.forEach(element => {
          if(element.id) {

          this.crudService.update('/degrees-school-sport-goals', element, element.id)
          .subscribe((data) => {
            this.snackbar.open(this.translateSerivce.instant('snackbar.settings.objectives_update'), 'OK', {duration: 3000});
          })
          } else {
            this.crudService.create('/degrees-school-sport-goals', element)
            .subscribe((data) => {
              this.snackbar.open(this.translateSerivce.instant('snackbar.settings.objectives_created'), 'OK', {duration: 3000});
            })
          }


        });


        setTimeout(() => {
          this.getData();
        }, 500);
      }
    });
  }

  isEven(index: number): boolean {
    return index % 2 === 0;
  }

  filterHours(selectedHour: string) {
    const selectedIndex = this.hours.indexOf(selectedHour);
    this.filteredHours = selectedIndex >= 0 ? this.hours.slice(selectedIndex) : this.hours;
  }

  onDateSelect(event: MatDatepickerInputEvent<Date>, index: any) {
    const selectedDate = event.value;
    const selectedDateFormat = moment(selectedDate).format('YYYY-MM-DD');

    if (index <= this.holidays.length && this.season && this.season !== null) {
      this.holidays[index] = selectedDateFormat;
    } else {
      this.holidays.push(selectedDateFormat);
    }

    if (!this.season || this.season === null) {
      this.holidaysSelected.push(selectedDateFormat);
    }
  }

  getSchoolSeason() {
    return this.crudService.list('/seasons', 1, 10000, 'asc', 'id', '&school_id='+this.user.schools[0].id);
  }

  deleteHoliday(index: any) {
    this.holidays.splice(index, 1);
  }

  saveSeason() {

    let holidays = [];

    if (this.season && this.season !== null) {

      holidays = this.holidays;
    } else {
      this.holidaysSelected.forEach(element => {
        console.log(moment(element).format('YYYY-MM-DD'));
        holidays.push(moment(element).format('YYYY-MM-DD'));
      });
    }

    const data = {
      name: "Temporada 1",
      start_date: moment(this.selectedFrom,).format('YYYY-MM-DD'),
      end_date: moment(this.selectedTo,).format('YYYY-MM-DD'),
      is_active: true,
      school_id: this.user.schools[0].id,
      hour_start: this.selectedFromHour,
      hour_end: this.selectedToHour,
      vacation_days: JSON.stringify(holidays)
    }

    if (this.season && this.season !== null) {
      this.crudService.update('/seasons', data, this.season.id)
      .subscribe((res) => {
        console.log(res);
        this.snackbar.open(this.translateSerivce.instant('snackbar.settings.season_created'), 'Close', {duration: 3000});
        this.getData();
        this.schoolService.refreshSchoolData();
      });
    } else {
      this.crudService.create('/seasons', data)
      .subscribe((res) => {
        console.log(res);
        this.snackbar.open(this.translateSerivce.instant('snackbar.settings.season_updated'), 'Close', {duration: 3000});
        this.getData();
        this.schoolService.refreshSchoolData();
      });
    }

  }

  saveContactData() {

    const data = {
      contact_phone: this.defaultsSchoolData.contact_phone,
      contact_address: this.defaultsSchoolData.contact_address + ', ' + this.defaultsSchoolData.contact_address_number,
      contact_cp: this.defaultsSchoolData.contact_cp,
      contact_city: this.defaultsSchoolData.contact_city,
      contact_province: this.defaultsSchoolData.contact_province,
    }

    this.crudService.update('/schools', data, this.school.id)
      .subscribe((res) => {
        console.log(res);
        this.snackbar.open(this.translateSerivce.instant('snackbar.settings.save'), this.translateSerivce.instant('cancel'), {duration: 3000});
        this.getData();
        this.schoolService.refreshSchoolData();
      });
  }

  saveSchoolSports() {

    this.crudService.update('/schools', {sport_ids: this.sportsList}, this.school.id +'/sports')
      .subscribe((res) => {
        console.log(res);
        res.data.sports.forEach(sport => {
          const hasDegrees = this.schoolSports.filter((s) => s.sport_id === sport.id).length > 0;

          if (!hasDegrees) {
            this.mockLevelData.forEach((degree, idx) => {
              degree.sport_id = sport.id;
              degree.school_id = this.school.id;
              degree.degree_order = idx;
              degree.level = 'test';
              degree.progress = 0;


              this.crudService.create('/degrees', degree)
                .subscribe((data) => {
                  console.log(data)
                  this.schoolService.refreshSchoolData();
                });
            });

            setTimeout(() => {
              this.getSchoolSportDegrees();
            }, 1000);
          }

        });
        this.snackbar.open(this.translateSerivce.instant('snackbar.settings.sports'), 'OK', {duration: 3000});
      });
  }

  savePrices() {

    const data = {
      prices_range: {people: this.people, prices: this.dataSource},
      monitor_app_client_messages_permission: this.authorized,
      monitor_app_client_bookings_permission: this.authorizedBookingComm,
      extras: {forfait: this.dataSourceForfait.data, food: this.dataSourceFood.data, transport: this.dataSourceTransport.data},
      degrees: this.dataSourceLevels.data
    }

    this.crudService.update('/schools', {name: this.school.name, description: this.school.description, settings: JSON.stringify(data)}, this.school.id)
      .subscribe(() => {
        this.snackbar.open(this.translateSerivce.instant('snackbar.settings.prices'), 'OK', {duration: 3000});
        this.schoolService.refreshSchoolData();
      })
  }

  getSports() {
    return this.crudService.list('/sports', 1, 1000);
  }

  getSchoolSports() {
    return this.crudService.list('/school-sports', 1, 10000, 'desc', 'id', '&school_id='+this.school.id);
  }

  getSchoolSportDegrees() {
    this.sportsList.forEach((element, idx) => {
      this.crudService.list('/degrees', 1, 10000, 'asc', 'degree_order', '&school_id=' + this.school.id + '&sport_id='+element)
        .subscribe((data) => {
          this.schoolSports[idx].degrees = data.data;
          this.selectedSport = this.schoolSports[0].id;
        });
    });
  }


  setSport(id: number) {
    let index = this.sportsList.indexOf(id);

    if (this.sportsList.length === 0) {
      this.sportsList.push(id);
    } else if(this.sportsList.length > 0 && index === -1) {
      this.sportsList.push(id);
    } else if(this.sportsList.length > 0 && index !== -1) {
      this.sportsList.splice(index, 1);
    }
  }

  getBlockages() {
    return this.crudService.list('/school-colors', 1, 10000, 'desc', 'id', '&school_id='+this.user.schools[0].id+'&default=1');
  }

  saveBlockages() {
    this.blockages.forEach(element => {
      element.school_id = this.school.id;
      this.crudService.update('/school-colors', element, element.id)
        .subscribe(() => {
        })
    });

    this.snackbar.open(this.translateSerivce.instant('snackbar.settings.blocks'), 'OK', {duration: 3000});
  }


  onAuthorizedChange(event: any) {
    this.authorized = event;
  }


  onAuthorizedBookingChange(event: any) {
    this.authorizedBookingComm = event;
  }

  saveMonitorsAuth() {
    const data = {
      prices_range: {people: this.people, prices: this.dataSource},
      monitor_app_client_messages_permission: this.authorized,
      monitor_app_client_bookings_permission: this.authorizedBookingComm,
      extras: {forfait: this.dataSourceForfait.data, food: this.dataSourceFood.data, transport: this.dataSourceTransport.data},
      degrees: this.dataSourceLevels.data
    }

    this.crudService.update('/schools', {name: this.school.name, description: this.school.description, settings: JSON.stringify(data)}, this.school.id)
      .subscribe(() => {
        this.snackbar.open(this.translateSerivce.instant('snackbar.settings.auths'), 'OK', {duration: 3000});
        this.getData();
        this.schoolService.refreshSchoolData();
      })
  }

  setTheme() {

    if (this.theme === 'dark'){

      this.configService.updateConfig({
        style: {
          colorScheme: ColorSchemeName.dark
        }
      });
    } else {

      this.configService.updateConfig({
        style: {
          colorScheme: ColorSchemeName.light
        }
      });
    }
  }

  createExtra(product: string, isEdit: boolean, idx: number, extra: any) {

    const dialogRef = this.dialog.open(ExtraCreateUpdateModalComponent, {
      width: '90vw',
      height: '90vh',
      maxWidth: '100vw',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales
      data: isEdit ? extra : {
        product: product,
        name: '',
        price: '',
        tva: '',
        status: false
      }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        if (data.product === 'Forfait') {

          this.addForfait(data, isEdit, idx);
        } else if (data.product === 'Food') {
          this.addFood(data, isEdit, idx);
        } else if (data.product === 'Transport') {
          this.addTransport(data, isEdit, idx);
        }

        this.saveExtra();
      }
    });
  }

  selectSport(id: number ) {
    this.selectedSport = id;
  }

  addForfait(data: any, isEdit: any, idx: number) {


    if (isEdit) {
      this.dataSourceForfait.data[idx] = data;
    } else {

      this.dataSourceForfait.data.push({
        id: 'FOR-' + this.generateRandomNumber(),
        product: 'Forfait',
        name: data.name ,
        price: data.price ,
        tva: data.tva ,
        status: data.status
      });
    }
    this.dateTableForfait.renderRows();

  }

  addFood(data: any, isEdit: any, idx: number) {


    if (isEdit) {
      this.dataSourceFood.data[idx] = data;
    } else {

      this.dataSourceFood.data.push({
        id: 'FOR-' + this.generateRandomNumber(),
        product: 'Forfait',
        name: data.name ,
        price: data.price ,
        tva: data.tva ,
        status: data.status
      });
    }
    this.dateTableFood.renderRows();

  }

  addTransport(data: any, isEdit: any, idx: number) {


    if (isEdit) {
      this.dataSourceTransport.data[idx] = data;
    } else {

      this.dataSourceTransport.data.push({
        id: 'FOR-' + this.generateRandomNumber(),
        product: 'Forfait',
        name: data.name ,
        price: data.price ,
        tva: data.tva ,
        status: data.status
      });
    }
    this.dateTableTransport.renderRows();

  }

  deleteExtra(index: number, type: string) {
    if (type === 'Forfait') {

      this.dataSourceForfait.data.splice(index, 1);
      this.dateTableForfait.renderRows();
    } else if (type=== 'Food') {
      this.dataSourceFood.data.splice(index, 1);
      this.dateTableFood.renderRows();
    } else if (type === 'Transport') {
      this.dataSourceTransport.data.splice(index, 1);
      this.dateTableTransport.renderRows();
    }

    this.saveExtra();
  }

  saveExtra() {
    const data = {
      prices_range: {people: this.people, prices: this.dataSource},
      monitor_app_client_messages_permission: this.authorized,
      monitor_app_client_bookings_permission: this.authorizedBookingComm,
      extras: {forfait: this.dataSourceForfait.data, food: this.dataSourceFood.data, transport: this.dataSourceTransport.data},
      degrees: this.dataSourceLevels.data
    }

    this.crudService.update('/schools', {name: this.school.name, description: this.school.description, settings: JSON.stringify(data)}, this.school.id)
      .subscribe(() => {
        this.snackbar.open(this.translateSerivce.instant('snackbar.settings.extras'), 'OK', {duration: 3000});
        this.schoolService.refreshSchoolData();

        this.getData();

      })
  }

  saveTaxes() {

    const data = {
      taxes: {cancellation_insurance_percent: this.hasCancellationInsurance ? this.cancellationInsurancePercent : 0,
        boukii_care_price: this.hasBoukiiCare ? this.boukiiCarePrice : 0,
        tva: this.hasTVA ? this.tva : 0},
      prices_range: {people: this.people, prices: this.dataSource},
      monitor_app_client_messages_permission: this.authorized,
      monitor_app_client_bookings_permission: this.authorizedBookingComm,
      extras: {forfait: this.dataSourceForfait.data, food: this.dataSourceFood.data, transport: this.dataSourceTransport.data},
      degrees: this.dataSourceLevels.data
    }

    this.crudService.update('/schools', {name: this.school.name, description: this.school.description, settings: JSON.stringify(data)}, this.school.id)
      .subscribe(() => {

        this.snackbar.open(this.translateSerivce.instant('snackbar.settings.taxes'), 'OK', {duration: 3000});
        this.schoolService.refreshSchoolData();
        this.getData();

      })
  }

  updateTVAValue(event: any) {

    this.tva = parseInt(event.target.value) / 100;
  }

  updateBoukiiCareValue(event: any) {

    this.boukiiCarePrice = parseInt(event.target.value);
  }

  updateInsuranceValue(event: any) {

    this.cancellationInsurancePercent = parseInt(event.target.value) / 100;
  }

  updateSportDegrees() {
    this.dataSourceLevels.data.forEach(element => {
      this.crudService.update('/degrees', element, element.id)
        .subscribe((degree) => {
          console.log(degree);
        })
    });

    this.snackbar.open(this.translateSerivce.instant('snackbar.settings.levels'), 'OK', {duration: 3000});
  }

  generateRandomNumber() {
    const min = 10000000; // límite inferior para un número de 5 cifras
    const max = 99999999; // límite superior para un número de 5 cifras
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
