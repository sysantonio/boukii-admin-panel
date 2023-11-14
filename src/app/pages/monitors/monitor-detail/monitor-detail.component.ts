import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { _MatTableDataSource } from '@angular/material/table';
import { Observable, map, startWith } from 'rxjs';
import { fadeInRight400ms } from 'src/@vex/animations/fade-in-right.animation';
import { scaleIn400ms } from 'src/@vex/animations/scale-in.animation';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { friendSuggestions } from 'src/app/static-data/friend-suggestions';
import { MOCK_LANGS } from 'src/app/static-data/language-data';
import { LEVELS } from 'src/app/static-data/level-data';
import { MOCK_PROVINCES } from 'src/app/static-data/province-data';
import { MOCK_SPORT_DATA } from 'src/app/static-data/sports-data';

@Component({
  selector: 'vex-monitor-detail',
  templateUrl: './monitor-detail.component.html',
  styleUrls: ['./monitor-detail.component.scss'],
  animations: [fadeInRight400ms, scaleIn400ms, stagger20ms]
})
export class MonitorDetailComponent {
  suggestions = friendSuggestions;
  showInfo = true;
  showPersonalInfo = true;
  showWorkInfo = true;
  showCivilStatusInfo = true;
  showSportInfo = true;
  showWork = true;

  editInfo = false;
  editPersonalInfo = false;
  editWorkInfo = false;
  editCivilStatusInfo = false;
  editSportInfo = false;
  editWork = false;


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

  groupedByColor = {};
  colorKeys: string[] = []; // Aquí almacenaremos las claves de colores

  constructor(private fb: UntypedFormBuilder, private cdr: ChangeDetectorRef) {
    this.mockLevelData.forEach(level => {
      if (!this.groupedByColor[level.color]) {
        this.groupedByColor[level.color] = [];
      }
      this.groupedByColor[level.color].push(level);
    });

    this.colorKeys = Object.keys(this.groupedByColor);
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

      fromDate: [''],
      phone: ['', Validators.required],
      mobile: ['', Validators.required],
      address: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: this.myControlCountries,
      province: this.myControlProvinces,

      avs: [],
      workId: [],
      iban: [],
      countryWork: this.myControlWorkCountries,
      children: [],
    });

    this.formWorkInfo = this.fb.group({

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

  addFriend(friend: any) {
    friend.added = true;
  }

  removeFriend(friend: any) {
    friend.added = false;
  }

  trackByName(index: number, friend: any) {
    return friend.name;
  }

  showInfoEvent(event: boolean) {
    this.showInfo = event;
  }

  showPersonalInfoEvent(event: boolean) {
    this.showPersonalInfo = event;
  }

  showWorkInfoEvent(event: boolean) {
    this.showWorkInfo = event;
  }

  showCivilStatusInfoEvent(event: boolean) {
    this.showCivilStatusInfo = event;
  }


  showInfoEditEvent(event: boolean) {
    this.editInfo = event;
  }

  showPersonalInfoEditEvent(event: boolean) {
    this.editPersonalInfo = event;
  }

  showWorkInfoEditEvent(event: boolean) {
    this.editWorkInfo = event;
  }

  showCivilStatusInfoEditEvent(event: boolean) {
    this.editCivilStatusInfo = event;
  }

  showSportInfoEvent(event: boolean) {
    this.showSportInfo = event;
  }

  showSportInfoEditEvent(event: boolean) {
    this.editSportInfo = event;
  }

  showWorkEvent(event: boolean) {
    this.showWork = event;
  }

  showWorkEditEvent(event: boolean) {
    this.editWork = event;
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

  private _filterStations(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.optionsStation.filter(option => option.toLowerCase().includes(filterValue));
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

  getSelectedLanguageNames(): string {
    return this.selectedLanguages.map(language => language.name).join(', ');
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
}
