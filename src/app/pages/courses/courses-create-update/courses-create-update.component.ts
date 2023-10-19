import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, map, of, startWith } from 'rxjs';
import { MOCK_SPORT_DATA, MOCK_SPORT_TYPES } from 'src/app/static-data/sports-data';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';

@Component({
  selector: 'vex-courses-create-update',
  templateUrl: './courses-create-update.component.html',
  styleUrls: ['./courses-create-update.component.scss'],
  animations: [fadeInUp400ms,stagger20ms]
})
export class CoursesCreateUpdateComponent implements OnInit {

  myControl = new FormControl();
  myControlSportType = new FormControl();
  myControlSport = new FormControl();
  myControlStations = new FormControl();

  options: string[] = ['Cours collectif', 'Cours privés'];
  optionsStation: string[] = ['Les Pacots', 'Andorra'];

  filteredOptions: Observable<any[]>;
  filteredSportTypes: Observable<any[]>;
  filteredSports: Observable<any[]>;
  filteredStations: Observable<any[]>;

  courseInformationFormGroup: UntypedFormGroup;
  courseDatesFormGroup: UntypedFormGroup;

  imagePreviewUrl: string | ArrayBuffer;

  defaults: any = null;

  sportTypeSelected: number = -1;
  mockSportData = MOCK_SPORT_DATA;
  mockSportType = MOCK_SPORT_TYPES;

  mode: 'create' | 'update' = 'create';
  loading: boolean = true;

  durations: string[] = [];

  constructor(private fb: UntypedFormBuilder) {
    this.generateDurations();

  }

  ngOnInit() {

    this.courseInformationFormGroup = this.fb.group({
      courseType: [null, Validators.required], // Posiblemente establezcas un valor predeterminado aquí
      sportType: [null, Validators.required], // Posiblemente establezcas un valor predeterminado aquí
      sport: [null, Validators.required]
    })

    this.courseDatesFormGroup = this.fb.group({
      course_name: [null, Validators.required],
      price: [null, Validators.required],
      station: [null, Validators.required],
      summary: [null, Validators.required],
      description: [null, Validators.required],
      duration: [null, Validators.required],
      participants: [null, Validators.required],
      image: [null],
    })

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
      this.courseInformationFormGroup.get('courseType').setValue(value);
    });

    this.myControlSportType.valueChanges.subscribe(value => {
        this.courseInformationFormGroup.get('sportType').setValue(value);
    });

    this.myControlSport.valueChanges.subscribe(value => {
        this.courseInformationFormGroup.get('sport').setValue(value);
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
    const booking = this.courseInformationFormGroup.value;

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
    const booking = this.courseInformationFormGroup.value;
    booking.id = this.defaults.id;
  }

  isCreateMode() {
    return this.mode === 'create';
  }

  isUpdateMode() {
    return this.mode === 'update';
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
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
}
