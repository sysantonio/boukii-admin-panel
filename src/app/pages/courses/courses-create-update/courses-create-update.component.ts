import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, map, of, startWith } from 'rxjs';
import { MOCK_SPORT_DATA, MOCK_SPORT_TYPES } from 'src/app/static-data/sports-data';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { DateTimeDialogComponent } from 'src/@vex/components/date-time-dialog/date-time-dialog.component';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { LEVELS } from 'src/app/static-data/level-data';
import { ReductionDialogComponent } from 'src/@vex/components/reduction-dialog/reduction-dialog.component';
import { PrivateDatesDialogComponent } from 'src/@vex/components/private-dates-dialog/private-dates-dialog.component';
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
  @ViewChild('table-private-reduction') privateReductionTable: MatTable<any>;
  @ViewChild('levelTable') table: MatTable<any>;

  hours = [
    '00:00', '01:00', '02:00', '03:00', '04:00',
    '05:00', '06:00', '07:00', '08:00', '09:00',
    '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00', '23:00'
  ];

  summary = ``;
  description = ``;

  days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  startDayControl = new FormControl();
  endDayControl = new FormControl();
  availableEndDays: string[] = [];

  separatedDates = false;
  displayedColumns: string[] = ['date', 'duration', 'hour', 'delete'];
  displayedReductionsColumns: string[] = ['date', 'percentage'];
  displayedPrivateDateColumns: string[] = ['dateFrom', 'dateTo', 'delete'];
  dataSource = new MatTableDataSource([]);
  dataSourceReductions = new MatTableDataSource([]);
  dataSourceDatePrivate = new MatTableDataSource([]);
  dataSourceReductionsPrivate = new MatTableDataSource([]);

  myControl = new FormControl();
  myControlSport = new FormControl();
  myControlStations = new FormControl();

  options: any[] = [{id: 1, name:'Cours collectif'}, {id:2, name: 'Cours privés'}];
  optionsStation: string[] = ['Les Pacots', 'Andorra'];

  filteredOptions: Observable<any[]>;
  filteredSports: Observable<any[]>;
  filteredStations: Observable<any[]>;

  courseTypeFormGroup: UntypedFormGroup;
  courseInfoFormGroup: UntypedFormGroup;
  courseInfoPriveFormGroup: UntypedFormGroup;
  courseInfoPriveSeparatedFormGroup: UntypedFormGroup;
  courseInfoCollecDateSplitFormGroup: UntypedFormGroup;
  courseLevelFormGroup: UntypedFormGroup;

  // Nuevos
  courseConfigForm: UntypedFormGroup;

  imagePreviewUrl: string | ArrayBuffer = null;

  today = new Date();
  from: any = null;
  to: any = null;

  defaults: any = null;

  sportTypeSelected: number = -1;
  mockSportData = MOCK_SPORT_DATA;
  mockSportType = MOCK_SPORT_TYPES;
  mockLevels = LEVELS;

  groupedByColor = {};
  colorKeys: string[] = []; // Aquí almacenaremos las claves de colores
  selectedCourses = new MatTableDataSource([]);
  displayedCourseColumns: string[] = ['course', 'min', 'max', 'levels', 'checkbox', 'delete'];

  mode: 'create' | 'update' = 'create';
  loading: boolean = true;

  durations: string[] = [];
  courseType: any = null;

  constructor(private fb: UntypedFormBuilder, public dialog: MatDialog) {
    this.generateDurations();
    this.mockLevels.forEach(level => {
      if (!this.groupedByColor[level.color]) {
        this.groupedByColor[level.color] = [];
      }
      this.groupedByColor[level.color].push(level);
    });

    this.colorKeys = Object.keys(this.groupedByColor);

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

  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {


    this.dataSource.data.push({date: moment(this.today).format('DD-MM-YYYY'), duration: '2h 30m', hour: '08:30'});
    this.dateTable?.renderRows();

    this.courseTypeFormGroup = this.fb.group({

      sportType: [null, Validators.required], // Posiblemente establezcas un valor predeterminado aquí
      sport: [null, Validators.required],
      courseType: [null, Validators.required],
      separatedDates: [false],
      fromDate: [null],
      toDate: [null],
      reservableFromDate: [null],
      reservableToDate: [false],
      debutFromDate: [null],
      debutToDate: [null],
      startDay: [null],
      endDay: [null]
    })

    this.courseInfoFormGroup = this.fb.group({

      course_name: [null, Validators.required],
      price: [null, Validators.required],
      station: [null, Validators.required],
      summary: [null, Validators.required],
      description: [null, Validators.required],
      duration: [null, Validators.required],
      participants: [null, Validators.required],
      image: [null],
    })


    this.courseInfoPriveFormGroup = this.fb.group({

      course_name: [null, Validators.required],
      price: [null, Validators.required],
      station: [null, Validators.required],
      summary: [null, Validators.required],
      description: [null, Validators.required],
      duration: [null, Validators.required],
      minDuration: [null, Validators.required],
      maxDuration: [null, Validators.required],
      fromHour: [null, Validators.required],
      toHour: [null, Validators.required],
      participants: [null, Validators.required],
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      image: [null],
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

    this.courseConfigForm = this.fb.group({});

    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );

    this.filteredStations = this.myControlStations.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterStations(value))
      );

    this.filteredSports = this.myControlSport.valueChanges.pipe(
      startWith(''),
      map((value: any) => typeof value === 'string' ? value : value?.name),
      map(name => name ? this._filterSport(name) : this.mockSportData.slice())
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

    if (this.defaults) {
      this.mode = 'update';
    } else {
      this.defaults = {};

    }

    this.loading = false;
  }

  save() {
    if (this.mode === 'create') {
      this.create();
    } else if (this.mode === 'update') {
      this.update();
    }
  }

  create() {

  }

  filterSportsByType() {
    this.sportTypeSelected = this.courseTypeFormGroup.get('sportType').value;
    let selectedSportType = this.courseTypeFormGroup.get('sportType').value;
    this.filteredSports = of(this.mockSportData.filter(sport => sport.sport_type === selectedSportType));
  }

  onFileChanged(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
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
    return this.optionsStation.filter(option => option.toLowerCase().includes(filterValue));
  }

  private _filterSportType(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.mockSportType.filter(option => option?.name.toLowerCase().includes(filterValue));
  }

  displayFn(sportType: any): string {
    return sportType && sportType.name ? sportType.name : '';
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

  private _filterSport(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.mockSportData.filter(sport => sport.name.toLowerCase().includes(filterValue));
  }

  generateDurations() {
    let minutes = 15;
    const maxMinutes = 7 * 60; // 7 horas en minutos

    while (minutes <= maxMinutes) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      const durationString = `${hours ? hours + 'h ' : ''}${remainingMinutes}min`;
      this.durations.push(durationString);

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
        this.dataSourceReductions.data.push({date: moment(result.date).format('DD-MM-YYYY'), percentage: result.percentage});
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
        this.dataSourceReductionsPrivate.data.push({date: moment(result.date).format('DD-MM-YYYY'), percentage: result.percentage});
        this.privateReductionTable?.renderRows();
      }
    });
  }

  openDialogPrivateDate(): void {
    const dialogRef = this.dialog.open(PrivateDatesDialogComponent, {
      width: '300px',
      data: {iterations: this.dataSource.data.length}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSourceDatePrivate.data.push({dateFrom: moment(result.dateFrom).format('DD-MM-YYYY'), dateTo: moment(result.dateTo).format('DD-MM-YYYY')});
        this.privateDatesTable?.renderRows();
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
    this.table.renderRows();

    // Aquí también puedes deseleccionar el chip correspondiente
  }

  setCourseType(type: string) {
    this.courseType = type;
  }
}
