import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
@Component({
  selector: 'vex-courses-create-update',
  templateUrl: './courses-create-update.component.html',
  styleUrls: ['./courses-create-update.component.scss'],
  animations: [fadeInUp400ms,stagger20ms]
})
export class CoursesCreateUpdateComponent implements OnInit {

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('dateTable') dateTable: MatTable<any>;
  @ViewChild('reductionTable') reductionTable: MatTable<any>;
  @ViewChild('levelTable') table: MatTable<any>;

  days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  startDayControl = new FormControl();
  endDayControl = new FormControl();
  availableEndDays: string[] = [];

  separatedDates = false;
  displayedColumns: string[] = ['date', 'hour'];
  displayedReductionsColumns: string[] = ['date', 'hour'];
  dataSource = new MatTableDataSource([]);
  dataSourceReductions = new MatTableDataSource([]);

  myControl = new FormControl();
  myControlSportType = new FormControl();
  myControlSport = new FormControl();
  myControlStations = new FormControl();

  options: any[] = [{id: 1, name:'Cours collectif'}, {id:2, name: 'Cours privés'}];
  optionsStation: string[] = ['Les Pacots', 'Andorra'];

  filteredOptions: Observable<any[]>;
  filteredSportTypes: Observable<any[]>;
  filteredSports: Observable<any[]>;
  filteredStations: Observable<any[]>;

  courseTypeFormGroup: UntypedFormGroup;
  courseInfoFormGroup: UntypedFormGroup;
  courseInfoPriveFormGroup: UntypedFormGroup;
  courseInfoPriveSeparatedFormGroup: UntypedFormGroup;
  courseInfoCollecDateSplitFormGroup: UntypedFormGroup;
  courseLevelFormGroup: UntypedFormGroup;

  imagePreviewUrl: string | ArrayBuffer;

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

    this.filteredSportTypes = this.myControlSportType.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filterSportType(value))
    );

    this.filteredSports = this.myControlSport.valueChanges.pipe(
      startWith(''),
      map((value: any) => typeof value === 'string' ? value : value?.name),
      map(name => name ? this._filterSport(name) : this.mockSportData.slice())
    );

    this.myControl.valueChanges.subscribe(value => {
      this.courseTypeFormGroup.get('courseType').setValue(value);
    });

    this.myControlSportType.valueChanges.subscribe(value => {
        this.courseTypeFormGroup.get('sportType').setValue(value);
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

  filterSportsByType(event: any) {
    this.myControlSport.reset();  // Esta línea resetea el mat-autocomplete.
    this.sportTypeSelected = event.option.value.id;
    let selectedSportType = event.option.value.id;
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
        this.dataSource.data.push({date: moment(result.date).format('DD-MM-YYYY'), hour: result.hour});
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
        this.dataSourceReductions.data.push({date: moment(result.date).format('DD-MM-YYYY'), hour: result.hour});
        this.reductionTable?.renderRows();
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
}
