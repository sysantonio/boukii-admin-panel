import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { MOCK_LANGS } from 'src/app/static-data/language-data';
import { MOCK_PROVINCES } from 'src/app/static-data/province-data';
import { ApiCrudService } from 'src/service/crud.service';

@Component({
  selector: 'vex-admin-create-update',
  templateUrl: './admin-create-update.component.html',
  styleUrls: ['./admin-create-update.component.scss'],
  animations: [stagger20ms, fadeInUp400ms]
})
export class AdminCreateUpdateComponent implements OnInit {

  displayedColumns: string[] = ['name', 'date'];

  formInfoAccount: UntypedFormGroup;
  formPersonalInfo: UntypedFormGroup;
  myControlCountries = new FormControl();
  myControlProvinces = new FormControl();
  levelForm = new FormControl();

  filteredCountries: Observable<any[]>;
  filteredProvinces: Observable<any[]>;

  languagesControl = new FormControl([]);
  languages = [];
  filteredLanguages: Observable<any[]>;
  selectedLanguages = [];

  loading = true;

  today: Date;
  minDate: Date;

  mockCountriesData = MOCK_COUNTRIES;
  mockProvincesData = MOCK_PROVINCES;

  maxSelection = 6;

  defaults = {
    email: null,
    first_name: null,
    last_name: null,
    birth_date: null,
    phone: null,
    telephone: null,
    address: null,
    cp: null,
    city: null,
    province: null,
    country: null,
    language1_id:null,
    language2_id:null,
    language3_id:null,
    language4_id:null,
    language5_id:null,
    language6_id:null,
    user_id: null
  }

  defaultsUser = {
    username: null,
    email: null,
    password: null,
    type: 'admin',
    active: false,
  }

  user: any;
  mode: 'create' | 'update' = 'create';

  constructor(private fb: UntypedFormBuilder, private cdr: ChangeDetectorRef, private snackbar: MatSnackBar, private router: Router, private crudService: ApiCrudService) {
    this.today = new Date();
    this.minDate = new Date(this.today);
    this.minDate.setFullYear(this.today.getFullYear() - 18);
  }

  ngOnInit(): void {

    this.user = JSON.parse(localStorage.getItem('boukiiUser'));

    this.formInfoAccount = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
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


    this.filteredCountries = this.myControlCountries.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this._filterCountries(name) : this.mockCountriesData.slice())
    );

    this.myControlCountries.valueChanges.subscribe(country => {
      this.myControlProvinces.setValue('');  // Limpia la selección anterior de la provincia
      this.filteredProvinces = this._filterProvinces(country.id);
    });

    this.filteredLanguages = this.languagesControl.valueChanges.pipe(
      startWith(''),
      map(language => (language ? this._filterLanguages(language) : this.languages.slice()))
    );

    this.getLanguages();
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
      map(name => name ? this._filter(name, countryId) : this.mockProvincesData.filter(p => p.country_id === countryId).slice())
    );
  }

  private _filter(name: string, countryId: number): any[] {
    const filterValue = name.toLowerCase();
    return this.mockProvincesData.filter(province => province.country_id === countryId && province.name.toLowerCase().includes(filterValue));
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

  toggleSelectionLanguages(language: any): void {
    if (this.selectedLanguages.length < this.maxSelection) {

      const index = this.selectedLanguages.findIndex(l => l.code === language.code);
      if (index >= 0) {
        this.selectedLanguages.splice(index, 1);
      } else {
        this.selectedLanguages.push({ id: language.id, name: language.name, code: language.code });
      }
    } else {
      this.snackbar.open('Tan solo pueden seleccionarse 6 idiomas', 'OK', {duration: 3000});
    }
  }

  getSelectedLanguageNames(): string {
    return this.selectedLanguages.map(language => language.name).join(', ');
  }

  getLanguages() {
    this.crudService.list('/languages', 1, 1000)
      .subscribe((data) => {
        this.languages = data.data.reverse();
        this.loading = false;

      })
  }



  save() {

    if (this.mode === 'create') {
      this.create();
    } else if (this.mode === 'update') {
      this.update();
    }
  }

  create() {
    console.log(this.defaults);
    console.log(this.defaultsUser);
    this.defaultsUser.email = this.defaults.email;
    this.setLanguages();

    this.crudService.create('/users', this.defaultsUser)
      .subscribe((user) => {
        this.defaults.user_id = user.data.id;

        this.crudService.create('/clients', this.defaults)
          .subscribe((client) => {
            this.snackbar.open('Administrador creado correctamente', 'OK', {duration: 3000});
            this.router.navigate(['/admins']);
          })
      })
  }

  update() {}

  setLanguages() {
    if (this.selectedLanguages.length >= 1) {

      this.defaults.language1_id = this.selectedLanguages[0].id;
    } else if (this.selectedLanguages.length >= 2) {

      this.defaults.language2_id = this.selectedLanguages[1].id;
    } else if (this.selectedLanguages.length >= 3) {

      this.defaults.language3_id = this.selectedLanguages[2].id;
    } else if (this.selectedLanguages.length >= 4) {

      this.defaults.language4_id = this.selectedLanguages[3].id;
    } else if (this.selectedLanguages.length >= 5) {

      this.defaults.language5_id = this.selectedLanguages[4].id;
    } else if (this.selectedLanguages.length === 6) {

      this.defaults.language6_id = this.selectedLanguages[5].id;
    }
  }
}

