import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatTable, _MatTableDataSource } from '@angular/material/table';
import { Observable, map, startWith } from 'rxjs';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { MOCK_LANGS } from 'src/app/static-data/language-data';
import { LEVELS } from 'src/app/static-data/level-data';
import { MOCK_PROVINCES } from 'src/app/static-data/province-data';
import { MOCK_SPORT_DATA } from 'src/app/static-data/sports-data';

@Component({
  selector: 'vex-monitors-create-update',
  templateUrl: './monitors-create-update.component.html',
  styleUrls: ['./monitors-create-update.component.scss'],
  animations: [fadeInUp400ms, stagger20ms]
})
export class MonitorsCreateUpdateComponent implements OnInit {

  @ViewChild('childrenTable') table: MatTable<any>;
  displayedColumns: string[] = ['name', 'date'];

  imagePreviewUrl: string | ArrayBuffer;
  formInfoAccount: UntypedFormGroup;
  formPersonalInfo: UntypedFormGroup;
  formWorkInfo: UntypedFormGroup;
  formCivilStatusInfo: UntypedFormGroup;
  myControlStations = new FormControl();
  myControlCountries = new FormControl();
  myControlWorkCountries = new FormControl();
  myControlProvinces = new FormControl();
  myControlCivilStatus = new FormControl();
  levelForm = new FormControl();
  languagesControl = new FormControl([]);

  filteredStations: Observable<any[]>;
  filteredCountries: Observable<any[]>;
  filteredWorkCountries: Observable<any[]>;
  filteredProvinces: Observable<any[]>;
  filteredCivilStatus: Observable<string[]>;
  filteredLevel: Observable<any[]>;
  filteredLanguages: Observable<any[]>;

  sportsControl = new FormControl();
  selectedSports: any[] = [];
  filteredSports: Observable<any[]>;
  allSports: any[] = MOCK_SPORT_DATA;
  sportsData = new _MatTableDataSource([]);

  optionsStation: string[] = ['Les Pacots', 'Andorra'];
  selectedLanguages = [];

  today: Date;
  minDate: Date;
  minDateChild: Date;
  childrenData = new _MatTableDataSource([]);

  mockCivilStatus: string[] = ['Single', 'Mariée', 'Veuf', 'Divorcé'];
  mockCountriesData = MOCK_COUNTRIES;
  mockWorkCountriesData = MOCK_COUNTRIES;
  mockProvincesData = MOCK_PROVINCES;
  mockLevelData = LEVELS;
  languages = MOCK_LANGS;

  constructor(private fb: UntypedFormBuilder, private cdr: ChangeDetectorRef) {
    this.today = new Date();
    this.minDate = new Date(this.today);
    this.minDateChild = new Date(this.today);
    this.minDate.setFullYear(this.today.getFullYear() - 18);
    this.minDateChild.setFullYear(this.today.getFullYear() - 3);
  }

  ngOnInit(): void {
    this.formInfoAccount = this.fb.group({
      image: [''],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      station: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6), this.passwordValidator]],

    });

    this.formPersonalInfo = this.fb.group({
      fromDate: [''],
      phone: ['', Validators.required],
      mobile: ['', Validators.required],
      address: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: this.myControlCountries,
      province: this.myControlProvinces

    });

    this.formWorkInfo = this.fb.group({
      avs: [],
      workId: [],
      iban: [],
      countryWork: this.myControlWorkCountries,
      children: [],
      childName: [],
      childAge: [],
      sports: [],
      sportName: []
    });

    this.formCivilStatusInfo = this.fb.group({

      civilStatus: [],
      spouse: ['No'],
      workMobility: ['No'],
      spouseWorkId: [],
      spousePercentage: []
    });

    this.filteredStations = this.myControlStations.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterStations(value))
      );

      this.myControlStations.valueChanges.subscribe(value => {
        this.formInfoAccount.get('station').setValue(value);
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

    this.filteredWorkCountries = this.myControlWorkCountries.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this._filterCountries(name) : this.mockWorkCountriesData.slice())
    );

    /*this.myControlWorkCountries.valueChanges.subscribe(country => {
      this.formWorkInfo.get('countryWork').setValue(country);
    });*/

    this.filteredCivilStatus = this.myControlCivilStatus.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCivilStatus(value))
    );

    this.filteredSports = this.sportsControl.valueChanges.pipe(
      startWith(''),
      map((sport: string | null) => sport ? this._filterSports(sport) : this.allSports.slice())
    );

    this.filteredLevel = this.levelForm.valueChanges.pipe(
      startWith(''),
      map((value: any) => typeof value === 'string' ? value : value?.annotation),
      map(annotation => annotation ? this._filterLevel(annotation) : this.mockLevelData.slice())
    );

    this.filteredLanguages = this.languagesControl.valueChanges.pipe(
      startWith(''),
      map(language => (language ? this._filterLanguages(language) : this.languages.slice()))
    );
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

  private _filterStations(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.optionsStation.filter(option => option.toLowerCase().includes(filterValue));
  }

  passwordValidator(formControl: FormControl) {
    const { value } = formControl;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    if (hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar) {
      return null;
    } else {
      return { passwordStrength: true };
    }
  }

  /**Countries */

  private _filterCountries(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.mockCountriesData.filter(country => country.name.toLowerCase().includes(filterValue));
  }

  private _filterProvinces(countryId: number): Observable<any[]> {
    return this.myControlProvinces.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this._filter(name, countryId) : this.mockProvincesData.filter(p => p.id_country === countryId).slice())
    );
  }

  private _filter(name: string, countryId: number): any[] {
    const filterValue = name.toLowerCase();
    return this.mockProvincesData.filter(province => province.id_country === countryId && province.name.toLowerCase().includes(filterValue));
  }

  private _filterCivilStatus(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.mockCivilStatus.filter(civilStatus => civilStatus.toLowerCase().includes(filterValue));
  }

  private _filterSports(value: any): any[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value?.name.toLowerCase();
    return this.allSports.filter(sport => sport?.name.toLowerCase().indexOf(filterValue) === 0);
  }

  private _filterLevel(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.mockLevelData.filter(level => level.annotation.toLowerCase().includes(filterValue));
  }

  private _filterLanguages(value: any): any[] {
    const filterValue = value.toLowerCase();
    return this.languages.filter(language => language?.name.toLowerCase().includes(filterValue));
  }

  displayFnCountry(country: any): string {
    return country && country.name ? country.name : '';
  }

  displayFnProvince(province: any): string {
    return province && province.name ? province.name : '';
  }

  displayFnLevel(level: any): string {
    return level && level.name ? level.name : '';
  }

  removeChild(course: any) {

    let index = -1;

    this.childrenData.data.forEach((element, idx) => {
      if (course.annotation === element.annotation && course.name === element.name) {
        index = idx;
      }
    });
    if (index > -1) {
      this.childrenData.data.splice(index, 1);
      this.table.renderRows();

    }
    // Aquí también puedes deseleccionar el chip correspondiente
  }

  updateChildren(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const num = parseInt(inputElement.value, 10);

    if (isNaN(num) || num < 0) {
      return;
    }

    const currentData = this.childrenData.data;
    const difference = num - currentData.length;

    if (difference > 0) {
      for (let i = 0; i < difference; i++) {
        currentData.push({ name: '', date: null });
      }
    } else if (difference < 0) {
      currentData.splice(num);
    }

    this.childrenData.data = [...currentData];
  }

  updateSelectedSports(selected: any[]) {
    this.selectedSports = selected.map(sport => ({
      sportName: sport.name,
      sportId: sport.id,
      level: null
    }));
  }

  toggleSelection(sport: any): void {
    const index = this.selectedSports.findIndex(s => s.sportId === sport.id);
    if (index >= 0) {
      this.selectedSports.splice(index, 1);
    } else {
      this.selectedSports.push({ sportName: sport.name, sportId: sport.id, level: null });
    }

    // Crear una nueva referencia para el array
    this.selectedSports = [...this.selectedSports];

    // Actualizar los datos de la tabla
    this.sportsData.data = this.selectedSports;

    // Detectar cambios manualmente para asegurarse de que Angular reconozca los cambios
    this.cdr.detectChanges();

    console.log(this.selectedSports);
  }

  getSelectedSportsNames(): string {
    return this.sportsControl.value?.map(sport => sport.name).join(', ') || '';
  }

  toggleSelectionLanguages(language: any): void {
    const index = this.selectedLanguages.findIndex(l => l.code === language.code);
    if (index >= 0) {
      this.selectedLanguages.splice(index, 1);
    } else {
      this.selectedLanguages.push({ name: language.name, code: language.code });
    }
    console.log(this.selectedLanguages);
  }

  getSelectedLanguageNames(): string {
    return this.selectedLanguages.map(language => language.name).join(', ');
  }
}
