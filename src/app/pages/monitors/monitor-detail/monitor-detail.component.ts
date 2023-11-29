import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormArray, FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, _MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
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
import { ApiCrudService } from 'src/service/crud.service';

@Component({
  selector: 'vex-monitor-detail',
  templateUrl: './monitor-detail.component.html',
  styleUrls: ['./monitor-detail.component.scss'],
  animations: [fadeInRight400ms, scaleIn400ms, stagger20ms]
})
export class MonitorDetailComponent {
  @ViewChild('sportsCurrentTable') currentSportsTable: MatTable<any>;


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
  filteredSalary: Observable<any[]>;

  salaryForm = new FormControl();

  sportsControl = new FormControl([]);
  selectedSports: any[] = [];
  selectedNewSports: any[] = [];
  filteredSports: Observable<any[]>;
  sportsData = new _MatTableDataSource([]);
  sportsCurrentData = new _MatTableDataSource([]);
  deletedItems = [];

  selectedLanguages = [];
  monitorSportsDegree = [];
  salaryData = [];

  today: Date;
  minDate: Date;
  minDateChild: Date;
  childrenData = new _MatTableDataSource([]);

  displayedColumns: string[] = ['name', 'level', 'salary', 'auth', 'delete'];
  displayedColumnsChildren: string[] = ['name', 'date'];
  mockCivilStatus: string[] = ['Single', 'Mariée', 'Veuf', 'Divorcé'];
  mockCountriesData = MOCK_COUNTRIES;
  mockWorkCountriesData = MOCK_COUNTRIES;
  mockProvincesData = MOCK_PROVINCES;
  mockLevelData = LEVELS;
  languages = [];
  authorisedLevels = [];

  defaults = {
    email: null,
    username: null,
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
    image: null,
    avs: null,
    work_license: null,
    bank_details: null,
    children: null,
    civil_status: null,
    family_allowance: null,
    partner_work_license: null,
    partner_works: null,
    language1_id: null,
    language2_id: null,
    language3_id: null,
    language4_id: null,
    language5_id: null,
    language6_id: null,
    partner_percentaje: null,
    user_id: null,
    active_station: null,
    world_country: null
  }

  defaultsUser = {
    username: null,
    email: null,
    password: null,
    image: null,
    type: 'monitor',
    active: false,
  }

  id: any;
  maxSelection = 6;

  loading: boolean = true;
  user: any;
  schoolSports: any[] = [];
  stations: any[] = [];

  groupedByColor = {};
  colorKeys: string[] = []; // Aquí almacenaremos las claves de colores

  constructor(private fb: UntypedFormBuilder, private cdr: ChangeDetectorRef, private crudService: ApiCrudService, private snackbar: MatSnackBar, private router: Router, private activatedRoute: ActivatedRoute) {
    this.mockLevelData.forEach(level => {
      if (!this.groupedByColor[level.color]) {
        this.groupedByColor[level.color] = [];
      }
      this.groupedByColor[level.color].push(level);
    });

    this.colorKeys = Object.keys(this.groupedByColor);
  }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
    this.id = this.activatedRoute.snapshot.params.id;

    this.crudService.get('/monitors/'+this.id)
      .subscribe((data) => {
        this.defaults = data.data;
        this.crudService.get('/users/'+data.data.user_id)
          .subscribe((user)=> {
            this.defaultsUser = user.data;

            this.getSchoolSportDegrees();
            this.getStations();
            this.getLanguages();

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
              sportName: [],
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

            this.filteredLevel = this.levelForm.valueChanges.pipe(
              startWith(''),
              map((value: any) => typeof value === 'string' ? value : value?.annotation),
              map(annotation => annotation ? this._filterLevel(annotation) : this.mockLevelData.slice())
            );

            this.filteredLanguages = this.languagesControl.valueChanges.pipe(
              startWith(''),
              map(language => (language ? this._filterLanguages(language) : this.languages.slice()))
            );

            this.filteredSalary = this.salaryForm.valueChanges.pipe(
              startWith(''),
              map((value: any) => typeof value === 'string' ? value : value?.annotation),
              map(annotation => annotation ? this._filterSalary(annotation) : this.salaryData.slice())
            );

            setTimeout(() => {
              this.getSalarySchoolData();
              this.getMonitorSportsDegree();
              this.getSports();

              this.myControlStations.setValue(this.stations.find((s) => s.id === this.defaults.active_station).name);
              this.myControlCountries.setValue(this.mockCountriesData.find((c) => c.id === +this.defaults.country));
              this.myControlProvinces.setValue(this.mockProvincesData.find((c) => c.id === +this.defaults.province));
              this.myControlWorkCountries.setValue(this.mockProvincesData.find((c) => c.id === +this.defaults.world_country));
              this.languagesControl.setValue(this.languages.filter((l) => l.id === (this.defaults?.language1_id ||
                this.defaults?.language2_id || this.defaults?.language3_id || this.defaults?.language4_id
                || this.defaults?.language5_id || this.defaults?.language6_id)));



              this.loading = false;

            }, 500);
          })
      })


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
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value?.name?.toLowerCase();
    return this.schoolSports.filter(sport => sport?.name.toLowerCase().indexOf(filterValue) === 0);
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
    return this.stations.filter(option => option.name.toLowerCase().includes(filterValue));
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

  displayFnSalary(salary: any): string {
    return salary && salary.name ? salary.name : '';
  }

  private _filterSalary(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.salaryData.filter(level => level.annotation.toLowerCase().includes(filterValue));
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

  getLanguages() {
    this.crudService.list('/languages', 1, 1000)
      .subscribe((data) => {
        this.languages = data.data;
      })
  }

  getSports() {
    this.crudService.list('/sports', 1, 1000)
      .subscribe((data) => {
        data.data.forEach(element => {
          this.schoolSports.forEach(sport => {
            if(element.id === sport.sport_id) {
              sport.name = element.name;
            }
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

  getSchoolSportDegrees() {
    this.crudService.list('/school-sports', 1, 1000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
      .subscribe((sport) => {
        this.schoolSports = sport.data;
        sport.data.forEach((element, idx) => {
          this.crudService.list('/degrees', 1, 1000, 'asc', 'name', '&school_id=' + this.user.schools[0].id + '&sport_id='+element.sport_id)
          .subscribe((data) => {
            this.schoolSports[idx].degrees = data.data.reverse();
          });
        });
      })
  }

  getMonitorSportsDegree() {
    this.crudService.list('/monitor-sports-degrees', 1, 1000, null, null, '&monitor_id='+this.id)
      .subscribe((monitorDegree) => {
        let selectedSports = []; // Obtén los deportes actualmente seleccionados o inicializa un arreglo vacío
        const level = [];

        this.schoolSports.forEach(element => {

          element.degrees.forEach(degree => {
            monitorDegree.data.forEach(monitorDegree => {
              if ((monitorDegree.sport_id === element.sport_id) && (monitorDegree.degree_id === degree.id)) {
                monitorDegree.degrees = element.degrees;
                monitorDegree.level = degree;
                level.push(monitorDegree);
              }
            });
          });
          if (monitorDegree.data.filter((m) => m.sport_id === element.sport_id).length > 0) {
            selectedSports.push(element);
          }
        });

        selectedSports.forEach(element => {
          const degreeLevel = level.find((l) => l.sport_id === element.sport_id);
          if (degreeLevel) {
            element.level = degreeLevel.level;
            element.salary_level = degreeLevel.salary_level;
          }
        });

        this.sportsCurrentData.data = selectedSports;
        this.selectedSports = selectedSports;
        this.sportsControl.setValue(selectedSports);
        this.monitorSportsDegree = monitorDegree.data;


        const availableSports = [];
        this.schoolSports.forEach(element => {
          if(!this.sportsCurrentData.data.find((s) => s.id === element.id)) {
            availableSports.push(element);
          }
        });
        this.filteredSports = this.sportsControl.valueChanges.pipe(
          startWith(''),
          map((sport: string | null) => sport ? this._filterSports(sport) : availableSports.slice())
        );

        monitorDegree.data.forEach(element => {

          this.crudService.list('/monitor-sport-authorized-degrees', 1, 1000, null, null, '&monitor_sport_id=' + element.id)
            .subscribe((data) => {

              selectedSports.forEach(element => {
                if (element.sport_id === data.data[0].monitor_sport_id) {
                  element.authorisedLevels = data.data;

                }
              });
              console.log(data);
          })
        });
      })
  }


  get rows(): FormArray {
    return this.formWorkInfo.get('rows') as FormArray;
  }

  setLanguages() {
    if (this.selectedLanguages.length >= 1) {

      this.defaults.language1_id = this.selectedLanguages[0];
    } else if (this.selectedLanguages.length >= 2) {

      this.defaults.language2_id = this.selectedLanguages[1];
    } else if (this.selectedLanguages.length >= 3) {

      this.defaults.language3_id = this.selectedLanguages[2];
    } else if (this.selectedLanguages.length >= 4) {

      this.defaults.language4_id = this.selectedLanguages[3];
    } else if (this.selectedLanguages.length >= 5) {

      this.defaults.language5_id = this.selectedLanguages[4];
    } else if (this.selectedLanguages.length === 6) {

      this.defaults.language6_id = this.selectedLanguages[5];
    }
  }

  goTo(route: string) {
    this.router.navigate([route]);
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



  toggleSelection(event: any, sport: any): void {

    if (event.isUserInput) {

      const index = this.selectedNewSports.findIndex(s => s.sport_id === sport.sport_id);
      if (index >= 0) {
        this.selectedNewSports.splice(index, 1);
      } else {
        this.selectedNewSports.push(sport);
      }

      // Crear una nueva referencia para el array
      this.selectedNewSports = [...this.selectedNewSports];

      // Actualizar los datos de la tabla
      this.sportsData.data = this.selectedNewSports;

      // Detectar cambios manualmente para asegurarse de que Angular reconozca los cambios
      this.cdr.detectChanges();
    }
  }

  getSelectedSportsNames(): string {
    return this.sportsControl.value?.map(sport => sport.name).join(', ') || '';
  }

  authoriseLevel(level) {

    const index = this.authorisedLevels.findIndex(l => l === level.id);
    if (index >= 0) {
      this.authorisedLevels.splice(index, 1);
    } else {
      this.authorisedLevels.push(level.id);
    }
  }

  setValueSpouse(value: any) {

      this.defaults.partner_works = value.value === 'y';
      this.cdr.detectChanges();
  }

  setValueLocation(value: any) {

    this.defaults.family_allowance = value.value === 'y';
    this.cdr.detectChanges();

  }

  getSalarySchoolData() {
    this.crudService.list('/school-salary-levels', 1, 1000, 'desc', 'pay', '&school_id='+this.user.schools[0].id)
      .subscribe((data) => {
        this.salaryData = data.data;
      })
  }

  checkMonitorAuth(item: any, id: any) {
    let ret = false;

    if (item.authorisedLevels){
      item.authorisedLevels.forEach(element => {
        if(element.degree_id === id && !ret) {
          ret = true;
        }
      });
    }

    return ret;
  }

  getSalary(id: any) {
    let ret: any;
    this.salaryData.forEach(element => {
      if(element.id === id) {
        ret = element;
      }
    });

    return ret;
  }

  removeSport(idx: number) {
    this.deletedItems.push(this.sportsCurrentData.data[idx]);
    this.sportsCurrentData.data.splice(idx, 1);
    this.currentSportsTable.renderRows();

  }


  save() {
    console.log(this.defaults);
    console.log(this.defaultsUser);
    this.defaultsUser.email = this.defaults.email;
    this.defaultsUser.image = this.imagePreviewUrl;
    this.defaults.image = this.imagePreviewUrl;
    this.setLanguages();

    this.crudService.update('/users', this.defaultsUser, this.defaults.user_id)
      .subscribe((user) => {
        this.defaults.user_id = user.data.id;

        this.crudService.update('/monitors', this.defaults, this.id)
          .subscribe((monitor) => {
            this.snackbar.open('Cliente creado correctamente', 'OK', {duration: 3000});

            // revisar a partir de aqui
            this.crudService.create('/monitors-schools', {monitor_id: monitor.data.id, school_id: this.user.schools[0].id})
              .subscribe((monitorSchool) => {
                this.sportsData.data.forEach(element => {
                  this.crudService.create('/monitor-sports-degrees', {is_default: true, monitor_id: monitor.data.id, sport_id: element.sport_id, school_id: this.user.schools[0].id, degree_id: element.level.id, salary_level: element.salary_id})
                    .subscribe((e) => {
                      this.authorisedLevels.forEach(auLevel => {

                        this.crudService.create('/monitor-sport-authorized-degrees', {monitor_sport_id: e.data.id, degree_id: auLevel})
                          .subscribe((d) => {
                            console.log(d)
                          })
                      });
                    })
                });
                setTimeout(() => {
                  this.router.navigate(['/monitors']);

                }, 3000);
              })
          })
      })
  }
}
