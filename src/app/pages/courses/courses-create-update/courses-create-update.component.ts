import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map, of, startWith } from 'rxjs';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { DateTimeDialogComponent } from 'src/@vex/components/date-time-dialog/date-time-dialog.component';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { ReductionDialogComponent } from 'src/@vex/components/reduction-dialog/reduction-dialog.component';
import { PrivateDatesDialogComponent } from 'src/@vex/components/private-dates-dialog/private-dates-dialog.component';
import { ApiCrudService } from 'src/service/crud.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'vex-courses-create-update',
  templateUrl: './courses-create-update.component.html',
  styleUrls: ['./courses-create-update.component.scss',
    '../../../../../node_modules/quill/dist/quill.snow.css',
    '../../../../@vex/styles/partials/plugins/quill/_quill.scss'
  ],
  animations: [fadeInUp400ms,stagger20ms]
})
export class CoursesCreateUpdateComponent implements OnInit {

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('dateTable') dateTable: MatTable<any>;
  @ViewChild('reductionTable') reductionTable: MatTable<any>;
  @ViewChild('privateDatesTable') privateDatesTable: MatTable<any>;
  @ViewChild('privateReductionTable') privateReductionTable: MatTable<any>;
  @ViewChild('levelTable') table: MatTable<any>;

  userAvatar = 'https://school.boukii.online/assets/icons/icons-outline-default-avatar.svg';

  people = 6; // Aquí puedes cambiar el número de personas
  intervalos = Array.from({ length: 28 }, (_, i) => 15 + i * 15);

  hours = [
    '00:00', '01:00', '02:00', '03:00', '04:00',
    '05:00', '06:00', '07:00', '08:00', '09:00',
    '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00', '23:00'
  ];
  filteredToHours = [];

  summary = ``;
  description = ``;

  daysDates = [];
  daysDatesLevels = [];
  days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  startDayControl = new FormControl();
  endDayControl = new FormControl();
  availableEndDays: string[] = [];

  separatedDates = false;
  displayedColumns: string[] = ['date', 'duration', 'hour', 'delete'];
  displayedReductionsColumns: string[] = ['date', 'percentage'];
  displayedPrivateDateColumns: string[] = ['dateFrom', 'dateTo', 'delete'];
  displayedColumnsFlexiblePrices: string[] =['intervalo', ...Array.from({ length: this.people }, (_, i) => `persona ${i + 1}`)];
  dataSource = new MatTableDataSource([]);
  dataSourceReductions = new MatTableDataSource([]);
  dataSourceDatePrivate = new MatTableDataSource([]);
  dataSourceReductionsPrivate = new MatTableDataSource([]);
  dataSourceFlexiblePrices = this.intervalos.map(intervalo => {
    const fila: any = { intervalo: this.formatIntervalo(intervalo) };
    for (let i = 1; i <= this.people; i++) {
      fila[`persona ${i}`] = '';
    }
    return fila;
  });

  myControl = new FormControl();
  myControlSport = new FormControl();
  myControlStations = new FormControl();
  monitorsForm = new FormControl();

  options: any[] = [{id: 1, name:'Cours collectif'}, {id:2, name: 'Cours privés'}];
  stations = [];

  filteredOptions: Observable<any[]>;
  filteredSports: Observable<any[]>;
  filteredStations: Observable<any[]>;
  filteredMonitors: Observable<any[]>;

  courseTypeFormGroup: UntypedFormGroup;
  courseInfoFormGroup: UntypedFormGroup;
  courseInfoPriveFormGroup: UntypedFormGroup;
  courseInfoPriveSeparatedFormGroup: UntypedFormGroup;
  courseInfoCollecDateSplitFormGroup: UntypedFormGroup;
  courseLevelFormGroup: UntypedFormGroup;
  rangeForm: UntypedFormGroup;

  // Nuevos
  courseConfigForm: UntypedFormGroup;

  imagePreviewUrl: string | ArrayBuffer = null;

  today = new Date();
  from: any = null;
  to: any = null;
  daySelectedIndex: any = 0;
  subGroupSelectedIndex: any = 0;
  selectedDate: string;
  selectedItem: any;

  defaults: any = {
    course_type: null,
    is_flexible: false,
    name: null,
    short_description: null,
    description: null,
    price: null,
    currency: 'CHF',
    date_start: null,
    date_end: null,
    date_start_res: null,
    date_end_res: null,
    confirm_attendance: false,
    active: true,
    online: true,
    image: this.imagePreviewUrl,
    translations: null,
    price_range: this.dataSourceFlexiblePrices,
    discounts: null,
    settings: {
      weekDays: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      }
    },
    sport_id: null,
    school_id: null,
    station_id: null,
    max_participants: null,
    duration: null,
    hour_min: null,
    hour_max: null,
    min_age: null,
    max_age: null,
    course_dates: []
  };

  defaults_course_date = {
    date: null,
    hour_start: null,
    hour_end: null,
  }

  defaults_groups = {
    course_id: null,
    course_date_id: null,
    degree_id: null,
    age_min: null,
    age_max: null,
    recommended_age: null,
    teachers_min: null,
    teachers_max: null,
    observations: null,
    auto: null
  }

  defaults_subgroups = {
    course_id: null,
    course_date_id: null,
    degree_id: null,
    course_group_id: null,
    monitor_id: null,
    max_participants:null,
  }

  sportTypeSelected: number = -1;
  sportData = [];
  sportDataList = [];
  sportTypeData = [];
  levels = [];
  monitors = [];

  groupedByColor = {};
  colorKeys: string[] = []; // Aquí almacenaremos las claves de colores
  selectedCourses = new MatTableDataSource([]);
  displayedCourseColumns: string[] = ['course', 'min', 'max', 'levels', 'checkbox', 'delete'];

  mode: 'create' | 'update' = 'create';
  loading: boolean = true;

  durations = [];
  filteredMaxDurations = [];
  courseType: any = null;
  courseComplete: boolean = false;
  user: any;
  id: any = null;

  constructor(private fb: UntypedFormBuilder, public dialog: MatDialog, private crudService: ApiCrudService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
    this.id = this.activatedRoute.snapshot.params.id;

    this.generateDurations();

    this.startDayControl.valueChanges.subscribe(startDay => {
      const index = this.days.indexOf(startDay);
      if (index !== -1) {
        this.availableEndDays = this.days.slice(index + 1);
        this.endDayControl.enable();
        this.endDayControl.setValue(null); // Reset end day if start day changes
      } else {
        this.endDayControl.disable();
      }
    });

    this.rangeForm = this.fb.group({
      minAge: ['', [Validators.required, Validators.min(3)]],
      maxAge: ['', [Validators.required, Validators.max(80)]]
    }, { validator: this.ageRangeValidator });

  }

  ageRangeValidator(group: UntypedFormGroup): { [key: string]: any } | null {
    const minAge = group.get('minAge').value;
    const maxAge = group.get('maxAge').value;
    return minAge && maxAge && minAge < maxAge ? null : { 'ageRange': true };
  }

  get minAge() {
    return this.rangeForm.get('minAge');
  }

  get maxAge() {
    return this.rangeForm.get('maxAge');
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {
    if (!this.id) {
      this.mode = 'create';
    } else {
      this.mode = 'update';
    }

    if (this.mode === 'update') {
      this.crudService.get('/admin/courses/'+this.id)
        .subscribe((course) => {
          this.defaults = course.data;
          this.getSeparatedDates(this.defaults.course_dates, true);
          this.getDegrees();
          this.courseTypeFormGroup = this.fb.group({

            sportType: [1, Validators.required], // Posiblemente establezcas un valor predeterminado aquí
            sport: [null, Validators.required],
            courseType: [null, Validators.required],
            separatedDates: [false]
          })

          this.courseInfoFormGroup = this.fb.group({

            course_name: [null, Validators.required],
            price: [null, Validators.required],
            station: [null, Validators.required],
            summary: [null, Validators.required],
            description: [null, Validators.required],
            duration: [null],
            participants: [null],
            ageFrom: [null, Validators.required],
            ageTo: [null, Validators.required],
            image: [null],
          })


          this.courseInfoPriveFormGroup = this.fb.group({

            duration: [null, Validators.required],
            minDuration: [null, Validators.required],
            maxDuration: [null, Validators.required],
            fromHour: [null, Validators.required],
            toHour: [null, Validators.required],
            participants: [null, Validators.required],
            fromDate: [null, Validators.required],
            toDate: [null, Validators.required],
            from: [null, Validators.required],
            to: [null, Validators.required],
            image: [null],
            periodeUnique: new FormControl(false),
            periodeMultiple: new FormControl(false)
          })

          this.courseLevelFormGroup = this.fb.group({});

          this.courseInfoCollecDateSplitFormGroup = this.fb.group({
            course_name: [null, Validators.required],
            price: [null, Validators.required],
            station: [null, Validators.required],
            summary: [null, Validators.required],
            description: [null, Validators.required],
            duration: [null, Validators.required],
            participants: [null, Validators.required],
            image: [null],
          });

          this.courseInfoPriveSeparatedFormGroup = this.fb.group({
            course_name: [null, Validators.required],
            price: ['Flexible', Validators.required],
            station: [null, Validators.required],
            summary: [null, Validators.required],
            description: [null, Validators.required],
            duration: [null, Validators.required],
            participants: [null, Validators.required],
            image: [null],
          });

          this.courseConfigForm = this.fb.group({

            fromDate: [null],
            toDate: [null],
            from: [null],
            to: [null],
            duration: [null],
            participants: [null],
          });

          this.filteredOptions = this.myControl.valueChanges
            .pipe(
              startWith(''),
              map(value => this._filter(value))
            );

            this.filteredStations = this.myControlStations.valueChanges
            .pipe(
              startWith(''),
              map(value => typeof value === 'string' ? value : value.name),
              map(name => name ? this._filterStations(name) : this.stations.slice())
            );

          this.filteredSports = this.myControlSport.valueChanges.pipe(
            startWith(''),
            map((value: any) => typeof value === 'string' ? value : value?.name),
            map(name => name ? this._filterSport(name) : this.sportData.slice())
          );

          this.filteredMonitors = this.monitorsForm.valueChanges.pipe(
            startWith(''),
            map((value: any) => typeof value === 'string' ? value : value?.full_name),
            map(full_name => full_name ? this._filterMonitor(full_name) : this.monitors.slice())
          );

          this.myControl.valueChanges.subscribe(value => {
            this.courseTypeFormGroup.get('courseType').setValue(value);
          });

          this.myControlSport.valueChanges.subscribe(value => {
              this.courseTypeFormGroup.get('sport').setValue(value);
          });

          this.myControlStations.valueChanges.subscribe(value => {
              this.courseInfoFormGroup.get('station').setValue(value);
          });

          this.courseInfoPriveFormGroup.get('minDuration').valueChanges.subscribe(selectedDuration => {
            this.updateMaxDurationOptions(selectedDuration);
          });

          this.courseInfoPriveFormGroup.get('fromHour').valueChanges.subscribe(selectedStartHour => {
            this.updateToHourOptions(selectedStartHour);
          });



          this.getSportsType();
          this.getSports();
          this.getStations();
          this.getMonitors();
          setTimeout(() => {
            this.filterSportsByType();

          }, 500);
        })
    } else {
      this.courseTypeFormGroup = this.fb.group({

        sportType: [1, Validators.required], // Posiblemente establezcas un valor predeterminado aquí
        sport: [null, Validators.required],
        courseType: [null, Validators.required],
        separatedDates: [false]
      })

      this.courseInfoFormGroup = this.fb.group({

        course_name: [null, Validators.required],
        price: [null, Validators.required],
        station: [null, Validators.required],
        summary: [null, Validators.required],
        description: [null, Validators.required],
        duration: [null],
        participants: [null],
        ageFrom: [null, Validators.required],
        ageTo: [null, Validators.required],
        image: [null],
      })


      this.courseInfoPriveFormGroup = this.fb.group({

        duration: [null, Validators.required],
        minDuration: [null, Validators.required],
        maxDuration: [null, Validators.required],
        fromHour: [null, Validators.required],
        toHour: [null, Validators.required],
        participants: [null, Validators.required],
        fromDate: [null, Validators.required],
        toDate: [null, Validators.required],
        from: [null, Validators.required],
        to: [null, Validators.required],
        image: [null],
        periodeUnique: new FormControl(false),
        periodeMultiple: new FormControl(false)
      })

      this.courseLevelFormGroup = this.fb.group({});

      this.courseInfoCollecDateSplitFormGroup = this.fb.group({
        course_name: [null, Validators.required],
        price: [null, Validators.required],
        station: [null, Validators.required],
        summary: [null, Validators.required],
        description: [null, Validators.required],
        duration: [null, Validators.required],
        participants: [null, Validators.required],
        image: [null],
      });

      this.courseInfoPriveSeparatedFormGroup = this.fb.group({
        course_name: [null, Validators.required],
        price: ['Flexible', Validators.required],
        station: [null, Validators.required],
        summary: [null, Validators.required],
        description: [null, Validators.required],
        duration: [null, Validators.required],
        participants: [null, Validators.required],
        image: [null],
      });

      this.courseConfigForm = this.fb.group({

        fromDate: [null],
        toDate: [null],
        from: [null],
        to: [null],
        duration: [null],
        participants: [null],
      });

      this.filteredOptions = this.myControl.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        );

        this.filteredStations = this.myControlStations.valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value.name),
          map(name => name ? this._filterStations(name) : this.stations.slice())
        );

      this.filteredSports = this.myControlSport.valueChanges.pipe(
        startWith(''),
        map((value: any) => typeof value === 'string' ? value : value?.name),
        map(name => name ? this._filterSport(name) : this.sportData.slice())
      );

      this.filteredMonitors = this.monitorsForm.valueChanges.pipe(
        startWith(''),
        map((value: any) => typeof value === 'string' ? value : value?.full_name),
        map(full_name => full_name ? this._filterMonitor(full_name) : this.monitors.slice())
      );

      this.myControl.valueChanges.subscribe(value => {
        this.courseTypeFormGroup.get('courseType').setValue(value);
      });

      this.myControlSport.valueChanges.subscribe(value => {
          this.courseTypeFormGroup.get('sport').setValue(value);
      });

      this.myControlStations.valueChanges.subscribe(value => {
          this.courseInfoFormGroup.get('station').setValue(value);
      });

      this.courseInfoPriveFormGroup.get('minDuration').valueChanges.subscribe(selectedDuration => {
        this.updateMaxDurationOptions(selectedDuration);
      });

      this.courseInfoPriveFormGroup.get('fromHour').valueChanges.subscribe(selectedStartHour => {
        this.updateToHourOptions(selectedStartHour);
      });



      this.getSportsType();
      this.getSports();
      this.getStations();
      this.getMonitors();
      setTimeout(() => {
        this.filterSportsByType();

      }, 500);
    }
  }

  get periodeUnique() {
    return this.courseInfoPriveFormGroup.get('periodeUnique').value;
  }

  get periodeMultiple() {
    return this.courseInfoPriveFormGroup.get('periodeMultiple').value;
  }

  onCheckboxChange(type: string) {
    if (type === 'unique') {
      this.courseInfoPriveFormGroup.patchValue({ periodeMultiple: false });
      this.dataSourceDatePrivate.data = [];
      this.privateDatesTable?.renderRows();

    } else {
      this.courseInfoPriveFormGroup.patchValue({ periodeUnique: false });
    }
  }

  save() {
    if (this.mode === 'create') {
      this.create();
    } else if (this.mode === 'update') {
      this.update();
    }
  }

  create() {

    let data: any = [];

    let sortedDates = this.defaults.course_dates.map(d => new Date(d.date)).sort((a, b) => a - b);

    let lowestDate = moment(sortedDates[0]).format('YYYY-MM-DD');
    let highestDate = moment(sortedDates[sortedDates.length - 1]).format('YYYY-MM-DD');

    let courseDates = [];

    if (this.courseType === 'collectif') {
      this.defaults.course_dates.forEach(dates => {
        const group = [];
        dates.groups.forEach(dateGroup => {
          if (dateGroup.subgroups.length > 0) {
            group.push(dateGroup);
          }
        });
        dates.groups = group;
      });
    } else {
      courseDates = this.defaults.course_dates;
    }


    if (this.defaults.course_type === 1 && this.defaults.is_flexible) {
      data = {
        course_type: this.defaults.course_type,
        is_flexible: this.defaults.is_flexible,
        name: this.defaults.name,
        short_description: this.defaults.short_description,
        description: this.defaults.description,
        price: this.defaults.price,
        currency: 'CHF',//poner currency de reglajes
        date_start: lowestDate,
        date_end: highestDate,
        date_start_res: this.defaults.date_start_res,
        date_end_res: this.defaults.date_end_res,
        confirm_attendance: false,
        active: this.defaults.active,
        online: this.defaults.online,
        image: this.imagePreviewUrl,
        translations: null,
        discounts: JSON.stringify(this.dataSourceReductions.data),
        sport_id: this.defaults.sport_id,
        school_id: null, //sacar del global
        station_id: this.defaults.station_id.id,
        max_participants: this.defaults.max_participants,
        course_dates: this.defaults.course_dates
      }
      console.log(data);

    } else if (this.defaults.course_type === 1 && !this.defaults.is_flexible) {
      data = {
        course_type: this.defaults.course_type,
        is_flexible: this.defaults.is_flexible,
        name: this.defaults.name,
        short_description: this.defaults.short_description,
        description: this.defaults.description,
        price: this.defaults.price,
        currency: 'CHF',//poner currency de reglajes
        date_start: lowestDate,
        date_end: highestDate,
        date_start_res: this.defaults.date_start_res,
        date_end_res: this.defaults.date_end_res,
        confirm_attendance: false,
        active: this.defaults.active,
        online: this.defaults.online,
        image: this.imagePreviewUrl,
        translations: null,
        sport_id: this.defaults.sport_id,
        school_id: null, //sacar del global
        station_id: this.defaults.station_id.id,
        max_participants: this.defaults.max_participants,
        course_dates: this.defaults.course_dates
      }
      console.log(data);
    } else if (this.defaults.course_type === 2  && this.defaults.is_flexible) {
      data = {
        course_type: this.defaults.course_type,
        is_flexible: this.defaults.is_flexible,
        name: this.defaults.name,
        short_description: this.defaults.short_description,
        description: this.defaults.description,
        price: this.defaults.price,
        currency: 'CHF',
        date_start: lowestDate,
        date_end: highestDate,
        date_start_res: lowestDate,
        date_end_res: highestDate,
        active: this.defaults.active,
        online: this.defaults.online,
        image: this.imagePreviewUrl,
        confirm_attendance: false,
        translations: null,
        discounts: JSON.stringify(this.dataSourceReductionsPrivate.data),
        price_range: this.dataSourceFlexiblePrices,
        sport_id: this.defaults.sport_id,
        school_id: this.defaults.school_id,
        station_id: this.defaults.station_id.id,
        max_participants: this.defaults.max_participants,
        duration: this.defaults.duration,
        min_age: this.defaults.min_age,
        max_age: this.defaults.max_age,
        course_dates: this.defaults.course_dates,
        settings: JSON.stringify(this.defaults.settings)
      };
      console.log(data);
    } else if (this.defaults.course_type === 2 && !this.defaults.is_flexible) {
      data = {
        course_type: this.defaults.course_type,
        is_flexible: this.defaults.is_flexible,
        name: this.defaults.name,
        short_description: this.defaults.short_description,
        description: this.defaults.description,
        price: this.defaults.price,
        currency: 'CHF',
        date_start_res: lowestDate,
        date_end_res: highestDate,
        date_start: lowestDate,
        date_end: highestDate,
        active: this.defaults.active,
        online: this.defaults.online,
        image: this.imagePreviewUrl,
        confirm_attendance: false,
        translations: null,
        price_range: null,
        sport_id: this.defaults.sport_id,
        school_id: this.defaults.school_id,
        station_id: this.defaults.station_id.id,
        max_participants: this.defaults.max_participants,
        duration: this.defaults.duration,
        min_age: this.defaults.min_age,
        max_age: this.defaults.max_age,
        course_dates: this.defaults.course_dates

      };
    }

    this.defaults.date_start = this.defaults.date_start_res;
    this.defaults.date_end = this.defaults.date_end_res;
    data.school_id = this.user.schools[0].id;

    this.crudService.create('/admin/courses', data)
      .subscribe((res) => {
        console.log(res);
        this.goTo('/courses');
      })

  }

  goTo(route: string) {
    this.router.navigate([route]);
  }


  filterSportsByType() {
    this.sportTypeSelected = this.courseTypeFormGroup.get('sportType').value;
    let selectedSportType = this.courseTypeFormGroup.get('sportType').value;
    this.filteredSports = of(this.sportData.filter(sport => sport.sport_type === selectedSportType));
    this.sportDataList = this.sportData.filter(sport => sport.sport_type === selectedSportType);
  }

  onFileChanged(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
        this.defaults.image = reader.result;
      };

      reader.readAsDataURL(file);
    }
  }

  update() {
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.name.toLowerCase().includes(filterValue));
  }


  private _filterStations(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.stations.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  displayFn(sportType: any): string {
    return sportType && sportType.name ? sportType.name : '';
  }

  displayFnStation(station: any): string {
    return station && station.name ? station.name : '';
  }

  displayFnSport(sport: any): string {
    return sport && sport.name ? sport.name : '';
  }

  displayFnCourse(course: any): string {
    return course && course.name ? course.name : '';
  }

  displayFnLevel(sportType: any): string {
    return sportType && sportType.annotation && sportType.name ? sportType.annotation + ' - ' + sportType.name : '';
  }

  displayFnMoniteurs(monitor: any): string {
    return monitor && monitor.first_name && monitor.last_name ? monitor.first_name + ' ' + monitor.last_name : '';
  }

  private _filterSport(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.sportData.filter(sport => sport.name.toLowerCase().includes(filterValue));
  }

  private _filterMonitor(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.monitors.filter(monitor => monitor.full_name.toLowerCase().includes(filterValue));
  }

  generateDurations() {
    let minutes = 15;
    const maxMinutes = 7 * 60; // 7 horas en minutos
    this.durations = [];

    while (minutes <= maxMinutes) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      const durationString = `${hours ? hours + 'h ' : ''}${remainingMinutes}min`;
      this.durations.push({ text: durationString, value: minutes });

      minutes += 15;
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DateTimeDialogComponent, {
      width: '300px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.data.push({date: moment(result.date).format('DD-MM-YYYY'), duration: result.duration, hour: result.hour});
        this.dateTable?.renderRows();
      }
    });
  }

  openDialogReductions(): void {
    const dialogRef = this.dialog.open(ReductionDialogComponent, {
      width: '300px',
      data: {iterations: this.dataSource.data.length}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSourceReductions.data.push({date: result.dateIndex, percentage: result.percentage});
        this.reductionTable?.renderRows();
      }
    });
  }

  openDialogPrivateReductions(): void {
    const dialogRef = this.dialog.open(ReductionDialogComponent, {
      width: '300px',
      data: {iterations: this.dataSourceDatePrivate.data.length}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSourceReductionsPrivate.data.push({date: result.dateIndex, percentage: result.percentage});
        this.privateReductionTable?.renderRows();
      }
    });
  }

  openDialogPrivateDate(): void {
    const dialogRef = this.dialog.open(PrivateDatesDialogComponent, {
      width: '300px',
      data: {
        iterations: this.dataSource.data.length,
        dateFrom: this.today
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSourceDatePrivate.data.push({dateFrom: moment(result.dateFrom).format('DD-MM-YYYY'), dateTo: moment(result.dateTo).format('DD-MM-YYYY')});
        this.privateDatesTable?.renderRows();
        this.getDatesBetween(moment(result.dateFrom), moment(result.dateTo), true);
      }
    });
  }

  onChipClick(level: any) {
    const selectedCourse: any = {
      annotation: level.annotation,
      name: level.name
    };
    this.selectedCourses.data.push(selectedCourse);
    this.table.renderRows();

  }

  removeCourse(course: any) {

    let index = -1;

    this.selectedCourses.data.forEach((element, idx) => {
      if (course.annotation === element.annotation && course.name === element.name) {
        index = idx;
      }
    });
    if (index > -1) {
      this.selectedCourses.data.splice(index, 1);
      this.table.renderRows();

    }
    // Aquí también puedes deseleccionar el chip correspondiente
  }

  removeReduction(redcution: any, index: any) {
    this.dataSourceReductions.data.splice(index, 1);
    this.reductionTable.renderRows();

    // Aquí también puedes deseleccionar el chip correspondiente
  }

  removePrivateReduction(redcution: any, index: any) {
    this.dataSourceReductionsPrivate.data.splice(index, 1);
    this.privateReductionTable.renderRows();

    // Aquí también puedes deseleccionar el chip correspondiente
  }

  removePrivateDate(index: any) {
    this.dataSourceDatePrivate.data.splice(index, 1);
    this.privateDatesTable.renderRows();

    // Aquí también puedes deseleccionar el chip correspondiente
  }

  selectSport(sport: any) {
    this.defaults.sport_id = sport.sport_id;
    this.courseTypeFormGroup.get("sport").patchValue(sport.sport_id);
    this.getDegrees();
  }

  setCourseType(type: string, id: number) {

    this.defaults = {
      course_type: null,
      is_flexible: this.defaults.is_flexible,
      name: null,
      short_description: null,
      description: null,
      price: null,
      currency: 'CHF',
      date_start: null,
      date_end: null,
      date_start_res: null,
      date_end_res: null,
      confirm_attendance: false,
      active: true,
      online: true,
      image: this.imagePreviewUrl,
      translations: null,
      price_range: this.dataSourceFlexiblePrices,
      discounts: null,
      settings: {
        weekDays: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false
        }
      },
      sport_id: this.defaults.sport_id,
      school_id: null,
      station_id: null,
      max_participants: null,
      duration: null,
      hour_min: null,
      hour_max: null,
      course_dates: [],
      groups: []
    };

    this.courseType = type;
    this.courseTypeFormGroup.get("courseType").patchValue(id);
    this.defaults.course_type = id;

    this.courseInfoFormGroup.reset();
    this.courseInfoPriveFormGroup.reset();
    this.courseInfoPriveSeparatedFormGroup.reset();
    this.courseInfoCollecDateSplitFormGroup.reset();
    this.courseLevelFormGroup.reset();
  }

  setFlexibility(event: any) {
    this.defaults.is_flexible = event.target.checked;
    this.daysDates = [];
    this.daysDatesLevels = [];

  }

  updateTable() {
    // Lógica para actualizar la tabla basándote en el valor de this.people

    // Por ejemplo, podrías actualizar las columnas mostradas:
    this.displayedColumns = ['intervalo']; // Inicializa con la columna de intervalo
    for (let i = 1; i <= this.people; i++) {
      this.displayedColumns.push(i + ' Persona'); // Añade columnas para cada persona
    }

    // También podrías necesitar actualizar los datos mostrados en la tabla
    // ...
  }

  formatIntervalo(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas > 0 ? horas + 'h ' : ''}${mins > 0 ? mins + 'm' : ''}`.trim();
  }

  getSportsType() {
    this.crudService.list('/sport-types', 1, 1000)
      .subscribe((data) => {
        this.sportTypeData = data.data;
      });
  }

  getSports() {
    this.crudService.list('/school-sports', 1, 1000, 'asc', 'name', '&school_id='+this.user.schools[0].id)
      .subscribe((sport) => {
        this.sportData = sport.data;
        this.sportData.forEach(element => {
          this.crudService.get('/sports/'+element.sport_id)
            .subscribe((data) => {
              element.name = data.data.name;
              element.icon_selected = data.data.icon_selected;
              element.icon_unselected = data.data.icon_unselected;
              element.sport_type = data.data.sport_type;
              this.loading = false;
            });
        });

      })

  }

  getStations() {
    this.crudService.list('/stations-schools', 1, 1000, null, null, '&school_id='+this.user.schools[0].id)
      .subscribe((station) => {
        station.data.forEach(element => {
          this.crudService.get('/stations/'+element.id)
            .subscribe((data) => {
              this.stations.push(data.data);

            })
        });
      })
  }

  getMonitors() {
    this.crudService.list('/monitors', 1, 1000)
      .subscribe((data) => {
        this.monitors = data.data;
      });
  }

  getDegrees() {
    this.groupedByColor = {};
    this.colorKeys= [];
    this.crudService.list('/degrees', 1, 1000,'asc', 'degree_order', '&school_id=' + this.user.schools[0].id + '&sport_id='+ this.defaults.sport_id)
      .subscribe((data) => {
        data.data.forEach(element => {
          if(element.active) {
            this.levels.push(element);
          }
        });
        this.levels.reverse().forEach(level => {
          if (!this.groupedByColor[level.color]) {
            this.groupedByColor[level.color] = [];
          }
          level.active = false;

          if (this.mode === 'update') {

            this.defaults.course_dates.forEach(cs => {
              cs.groups.forEach(group => {
                if (group.degree_id === level.id) {
                  level.active = true;
                  level.old = true;
                }
              });
            });
            this.selectedItem = this.daysDatesLevels[0].dateString;
          }
          this.groupedByColor[level.color].push(level);
        });

        this.colorKeys = Object.keys(this.groupedByColor);
      })
  }

  calculateAgeMin(level: any) {
    let ret = 0;
    this.defaults.course_dates.forEach(courseDate => {
      courseDate.groups.forEach(group => {
        if (level.id === group.degree_id) {
          ret = group.age_min;
        }
      });
    });

    return ret;
  }

  calculateAgeMax(level: any) {
    let ret = 0;
    this.defaults.course_dates.forEach(courseDate => {
      courseDate.groups.forEach(group => {
        if (level.id === group.degree_id) {
          ret = group.age_max;
        }
      });
    });

    return ret;
  }

  getDatesBetween(startDate, endDate, process) {

    if (process) {
      this.daysDatesLevels = [];
      let daysOfWeekAdded = new Set();
      let currentDate = moment(startDate);

      while (currentDate <= moment(endDate)) {
        let dayOfWeek = currentDate.format('dddd');

        if (!daysOfWeekAdded.has(dayOfWeek)) {
          this.daysDates.push(dayOfWeek.toLowerCase());

          /*{
            date: currentDate.format('YYYY-MM-DD'),
            dayOfWeek: dayOfWeek.toLowerCase()
          }*/
          daysOfWeekAdded.add(dayOfWeek);
        }

        this.daysDatesLevels.push({date: currentDate.format('YYYY-MM-DD'), dateString: currentDate.locale('en').format('LLL').replace(' 0:00', '')});
        this.defaults.course_dates.push({
          date: currentDate.format('YYYY-MM-DD'),
          hour_start: null,
          hour_end: null,
        })
        currentDate = currentDate.add(1, 'days');
      }
    }

  }

  getSeparatedDates(dates: any, onLoad: boolean = false) {

    this.daysDates = [];
    this.daysDatesLevels = [];

    if (this.mode === 'create') {

      this.defaults.course_dates = [];
    }

    dates.forEach(element => {

      if (!onLoad) {
        const hour = element.hour;
        const duration = element.duration;
        const [hours, minutes] = duration.split(' ').reduce((acc, part) => {
          if (part.includes('h')) {
            acc[0] = parseInt(part, 10);
          } else if (part.includes('min')) {
            acc[1] = parseInt(part, 10);
          }
          return acc;
        }, [0, 0]);

        this.daysDatesLevels.push({date: moment(element.date, 'DD-MM-YYYY').format('YYYY-MM-DD'), dateString: moment(element.date, 'DD-MM-YYYY').locale('es').format('LLL').replace(' 0:00', '')});
        if (this.courseType === 'privee') {

          this.defaults.course_dates.push({
            date: moment(element.date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
            hour_start: element.hour,
            hour_end: moment(hour, "HH:mm").add(hours, 'hours').add(minutes, 'minutes').format("HH:mm")
          })
        } else {

          this.defaults.course_dates.push({
            date: moment(element.date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
            hour_start: element.hour,
            hour_end: moment(hour, "HH:mm").add(hours, 'hours').add(minutes, 'minutes').format("HH:mm"),
            groups: []
          })
        }
      } else {
        this.daysDatesLevels.push({date: moment(element.date, 'YYYY-MM-DD').format('YYYY-MM-DD'), dateString: moment(element.date, 'YYYY-MM-DD').locale('es').format('LLL').replace(' 0:00', '')});
      }

    });

  }

  updateMaxDurationOptions(selectedMinDuration) {
    const minDurationValue = this.durations.find(d => d.text === selectedMinDuration)?.value;
    this.filteredMaxDurations = this.durations.filter(d => d.value >= minDurationValue);
  }

  updateToHourOptions(selectedStartHour) {
    const startIndex = this.hours.indexOf(selectedStartHour);
    this.filteredToHours = this.hours.slice(startIndex + 1);
  }

  loadData(event: any) {
    if (event.selectedIndex === 3 && this.defaults.course_type === 1) {

      this.getSeparatedDates(this.dataSource.data);
    }
  }

  generateGroups(level: any) {
    let ret = {};
    this.levels.forEach(element => {
      if (element.id === level.id){
        ret = {
          course_id: null,
          course_date_id: null,
          degree_id: element.id,
          age_min: null,
          age_max: null,
          recommended_age: null,
          teachers_min: null,
          teachers_max: null,
          observations: null,
          auto: null,
          subgroups: []
        }
      }

    });

    return ret;
  }

  activeGroup(event: any, level: any) {

    this.selectedItem = this.daysDatesLevels[0].dateString;
    this.selectedDate = this.defaults.course_dates[0]?.date;
    level.active = event.source.checked;


    if(event.source.checked) {
      this.defaults.course_dates.forEach(element => {
        element.groups.push(this.generateGroups(level));
      });

      this.defaults.course_dates.forEach(element => {
        element.groups.forEach(group => {
          if (group.degree_id === level.id) {
            group.active = event.source.checked;
            group.subgroups.push({
              degree_id: level.id,
              monitor_id: null,
              max_participants:null
            })
          }

        });
      });
    } else {
      // eliminar el curso o desactivarlo

      this.defaults.course_dates.forEach((element) => {
        element.groups.forEach((group, idx) => {
          if (group.degree_id === level.id) {
            element.groups.splice(idx, 1);

          }
        });
      });


    }

  }

  addSubGroup(level: any) {
    this.defaults.course_dates.forEach(element => {
      element.groups.forEach(group => {
        if (level.id === group.degree_id) {
          group.subgroups.push({
            degree_id: level.id,
            monitor_id: null,
            max_participants:null
          })
        }

      });
    });
  }

  readSubGroups(levelId: number) {

    let ret = [];
    this.defaults.course_dates[0].groups.forEach((group) => {
      if (group.degree_id === levelId) {
        ret = group.subgroups;
      }
    });

    return ret;
  }

  setLevelTeacher(level: any) {
    this.defaults.course_dates.forEach(element => {
      element.groups.forEach(group => {
        if (level.id === group.degree_id) {
          group.teachers_min = level.id;
        }

      });
    });
  }

  setMinAge(event: any, level: any) {
    if (+event.target.value >= 3) {

      this.defaults.course_dates.forEach(element => {
        element.groups.forEach(group => {
          if (level.id === group.degree_id) {
            group.age_min = +event.target.value;
          }

        });
      });
    }
  }

  setMaxAge(event: any, level: any) {
    if (+event.target.value < 81) {
      this.defaults.course_dates.forEach(element => {
        element.groups.forEach(group => {
          if (level.id === group.degree_id) {
            group.age_max = +event.target.value;
          }

        });
      });
    }
  }

  getMonitorValue(level: any, subGroupIndex: number, daySelectedIndex: number) {

    let ret = null;
    if(!level.old) {
      this.defaults.course_dates.forEach(courseDate => {

          if (moment(courseDate.date,'YYYY-MM-DD').format('YYYY-MM-DD') === moment(this.selectedDate,'YYYY-MM-DD').format('YYYY-MM-DD')) {
            courseDate.groups.forEach(group => {
              if (group.degree_id === level.id) {
                  ret = group.subgroups[subGroupIndex]?.monitor;
              }
            });
          }
        });

        } else {
          this.defaults.course_dates[daySelectedIndex].groups.forEach(group => {
            if (group.degree_id === level.id) {
              ret = group.subgroups[subGroupIndex]?.monitor?.first_name + ' ' + group.subgroups[subGroupIndex]?.monitor?.last_name;
            }

          });
        }


      return ret;
    }

    calculateMonitorLevel(level: any) {
      let ret = 0;
      this.defaults.course_dates.forEach(courseDate => {
        courseDate.groups.forEach(group => {
          if (level.id === group.degree_id) {
            ret = level;
          }
        });
      });

      return ret;
    }

    calculateSubGroupPaxes(level: any) {
      let ret = 0;

      this.defaults.course_dates.forEach(element => {
        element.groups.forEach(group => {
          if (level.id === group.degree_id) {
            group.subgroups.forEach(subgroup => {

              ret = ret + subgroup.max_participants;
            });
          }

        });
      });

      return ret;
    }

  setSubGroupMonitor(event: any, monitor: any, level: any, subGroupSelectedIndex: number, daySelectedIndex: number) {

    let monitorSet = false;
    if (event.isUserInput) {

      if (!level.old) {
        this.defaults.course_dates.forEach(courseDate => {
          if (moment(courseDate.date,'YYYY-MM-DD').format('YYYY-MM-DD') === moment(this.selectedDate,'YYYY-MM-DD').format('YYYY-MM-DD')) {
            courseDate.groups.forEach(group => {
              if(group.degree_id === level.id && !monitorSet) {

                group.subgroups[subGroupSelectedIndex].monitor_id = monitor.id;
                group.subgroups[subGroupSelectedIndex].monitor = monitor.first_name + ' ' + monitor.last_name;
                monitorSet = true;
              }
            });
          }
        });
      } else {
        this.defaults.course_dates[daySelectedIndex].groups.forEach(group => {
          if (group.degree_id === level.id) {
            group.subgroups[subGroupSelectedIndex].monitor = monitor;
          }

        });
      }

    }
  }

  setSubGroupPax(event: any, level: any) {
    level.max_participants = +event.target.value;

    this.defaults.course_dates.forEach(element => {
      element.groups.forEach(group => {
        if (level.id === group.degree_id) {
          group.subgroups.forEach(subGroup => {
            subGroup.max_participants = +event.target.value;
          });
        }
      });
    });
  }

  selectItem(item: any, index: any, subGroupIndex: any) {
    this.subGroupSelectedIndex = null;
    this.selectedItem = item.dateString;
    this.selectedDate = item.date;
    this.daySelectedIndex = index;
    this.subGroupSelectedIndex = subGroupIndex;
  }

  setStation(station: any) {
    this.defaults.station_id = station.id;
  }

  addWeekDay(event: any, day: string) {
    if (day === 'all') {
      this.defaults.settings.weekDays.monday = event.source.checked;
      this.defaults.settings.weekDays.tuesday = event.source.checked;
      this.defaults.settings.weekDays.wednesday = event.source.checked;
      this.defaults.settings.weekDays.thursday = event.source.checked;
      this.defaults.settings.weekDays.friday = event.source.checked;
      this.defaults.settings.weekDays.saturday = event.source.checked;
      this.defaults.settings.weekDays.sunday = event.source.checked;
    } else {
      this.defaults.settings.weekDays[day] = event.source.checked;
    }
  }

  setDebut(hour: any) {
    this.defaults.course_dates.forEach(element => {
      element.hour_start = hour;
    });
  }

  setHourEnd(hour: any) {
    this.defaults.course_dates.forEach(element => {
      element.hour_end = hour;
    });
  }

}
