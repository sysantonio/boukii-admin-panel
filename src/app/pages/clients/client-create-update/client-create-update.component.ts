import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { _MatTableDataSource } from '@angular/material/table';
import { Observable, map, startWith } from 'rxjs';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { MOCK_LANGS } from 'src/app/static-data/language-data';
import { LEVELS } from 'src/app/static-data/level-data';
import { MOCK_PROVINCES } from 'src/app/static-data/province-data';
import { MOCK_SPORT_DATA } from 'src/app/static-data/sports-data';

@Component({
  selector: 'vex-client-create-update',
  templateUrl: './client-create-update.component.html',
  styleUrls: ['./client-create-update.component.scss'],
  animations: [fadeInUp400ms, stagger20ms]

})
export class ClientCreateUpdateComponent implements OnInit {

  displayedColumns: string[] = ['name', 'date'];

  imagePreviewUrl: string | ArrayBuffer;
  formInfoAccount: UntypedFormGroup;
  formPersonalInfo: UntypedFormGroup;
  formSportInfo: UntypedFormGroup;
  myControlStations = new FormControl();
  myControlCountries = new FormControl();
  myControlProvinces = new FormControl();
  levelForm = new FormControl();

  filteredStations: Observable<any[]>;
  filteredCountries: Observable<any[]>;
  filteredProvinces: Observable<any[]>;
  filteredLevel: Observable<any[]>;

  sportsControl = new FormControl();
  selectedSports: any[] = [];
  filteredSports: Observable<any[]>;
  allSports: any[] = MOCK_SPORT_DATA;
  sportsData = new _MatTableDataSource([]);

  languagesControl = new FormControl([]);
  languages = MOCK_LANGS;
  filteredLanguages: Observable<any[]>;
  selectedLanguages = [];

  optionsStation: string[] = ['Les Pacots', 'Andorra'];

  today: Date;
  minDate: Date;

  mockCivilStatus: string[] = ['Single', 'Mariée', 'Veuf', 'Divorcé'];
  mockCountriesData = MOCK_COUNTRIES;
  mockProvincesData = MOCK_PROVINCES;
  mockLevelData = LEVELS;

  constructor(private fb: UntypedFormBuilder, private cdr: ChangeDetectorRef) {
    this.today = new Date();
    this.minDate = new Date(this.today);
    this.minDate.setFullYear(this.today.getFullYear() - 18);
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

    this.formSportInfo = this.fb.group({
      sportName: [''],
      summary: [''],
      notes: [''],
      hitorical: ['']
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

  private _filterStations(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.optionsStation.filter(option => option.toLowerCase().includes(filterValue));
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
