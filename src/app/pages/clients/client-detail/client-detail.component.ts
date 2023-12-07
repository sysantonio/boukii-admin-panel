import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatTable, _MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { fadeInRight400ms } from 'src/@vex/animations/fade-in-right.animation';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { scaleIn400ms } from 'src/@vex/animations/scale-in.animation';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { MOCK_LANGS } from 'src/app/static-data/language-data';
import { LEVELS } from 'src/app/static-data/level-data';
import { MOCK_PROVINCES } from 'src/app/static-data/province-data';
import { MOCK_SPORT_DATA } from 'src/app/static-data/sports-data';
import { ApiCrudService } from 'src/service/crud.service';
import { ConfirmModalComponent } from '../../monitors/monitor-detail/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AddClientUserModalComponent } from '../add-client-user/add-client-user.component';
import moment from 'moment';
import { PasswordService } from 'src/service/password.service';


@Component({
  selector: 'vex-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss'],
  animations: [fadeInUp400ms, stagger20ms, scaleIn400ms, fadeInRight400ms]

})
export class ClientDetailComponent {

  @ViewChild('sportsCurrentTable') currentSportsTable: MatTable<any>;

  showInfo = true;
  showPersonalInfo = true;
  showAddressInfo: boolean = true;
  showSportInfo: boolean = true;
  editInfo = false;
  editPersonalInfo = false;
  editAddressInfo: boolean = false;
  editSportInfo: boolean = false;

displayedCurrentColumns: string[] = ['name', 'level', 'delete'];
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
  filteredSports: Observable<any[]>;

  sportsControl = new FormControl();
  selectedNewSports: any[] = [];
  selectedSports: any[] = [];
  sportsData = new _MatTableDataSource([]);
  sportsCurrentData = new _MatTableDataSource([]);
  stations = [];

  languagesControl = new FormControl([]);
  languages = [];
  schoolSports = [];
  filteredLanguages: Observable<any[]>;
  selectedLanguages = [];
  deletedItems = [];
  clientUsers = [];

  today: Date;
  minDate: Date;
  loading = true;
  coloring = true;

  mockCivilStatus: string[] = ['Single', 'Mariée', 'Veuf', 'Divorcé'];
  mockCountriesData = MOCK_COUNTRIES;
  mockProvincesData = MOCK_PROVINCES;
  mockLevelData: any = LEVELS;

  mainClient: any;
  defaults = {
    id: null,
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
    image: null,
    language1_id:null,
    language2_id:null,
    language3_id:null,
    language4_id:null,
    language5_id:null,
    language6_id:null,
    user_id: null,
    station_id: null,
    active_station: null
  }

  defaultsObservations = {
    id: null,
    general: null,
    notes: null,
    historical: null,
    client_id: null,
    school_id: null
  }

  defaultsUser = {
    id: null,
    username: null,
    email: null,
    password: null,
    image: null,
    type: 'client',
    active: false,
  }

  groupedByColor = {};
  colorKeys: string[] = []; // Aquí almacenaremos las claves de colores
  user: any;
  id: any;

  allLevels: any = [];
  selectedSport: any;
  clientSport = [];
  clientSchool = [];
  mainId: any;

  constructor(private fb: UntypedFormBuilder, private cdr: ChangeDetectorRef, private crudService: ApiCrudService, private router: Router,
     private activatedRoute: ActivatedRoute, private snackbar: MatSnackBar, private dialog: MatDialog, private passwordGen: PasswordService) {
    this.today = new Date();
    this.minDate = new Date(this.today);
    this.minDate.setFullYear(this.today.getFullYear() - 18);

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
    this.mainId = this.activatedRoute.snapshot.params.id;

    this.getData();

  }

  changeClientData(id: any) {
    this.loading = true;
    this.id = id;
    this.getData(id, true);
  }

  getData(id = null, onChangeUser = false) {
    const getId = id === null ? this.mainId : id;

    this.getSchoolSportDegrees();
    this.getLanguages();
    this.getStations();
    this.getClientSchool();
    this.getClientSport();
    this.getClientObservations();

    if (!onChangeUser) {
      this.getClientUtilisateurs();
    }

    this.crudService.get('/clients/'+ getId)
      .subscribe((data) => {
        this.defaults = data.data;
        if (!onChangeUser) {
          this.mainClient = data.data;
        }
        this.crudService.get('/users/'+data.data.user_id)
          .subscribe((user)=> {


            this.defaultsUser = user.data;

            this.formInfoAccount = this.fb.group({
              image: [''],
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

            this.formSportInfo = this.fb.group({
              sportName: [''],
              summary: [''],
              notes: [''],
              hitorical: ['']
            });

            if(!onChangeUser) {

              this.filteredCountries = this.myControlCountries.valueChanges.pipe(
                startWith(''),
                map(value => typeof value === 'string' ? value : value.name),
                map(name => name ? this._filterCountries(name) : this.mockCountriesData.slice())
              );

              this.myControlCountries.valueChanges.subscribe(country => {
                this.myControlProvinces.setValue('');  // Limpia la selección anterior de la provincia
                this.filteredProvinces = this._filterProvinces(country?.id);
              });

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
            setTimeout(() => {

              this.myControlStations.setValue(this.stations.find((s) => s.id === this.defaults.active_station)?.name);
              this.myControlCountries.setValue(this.mockCountriesData.find((c) => c.id === +this.defaults.country));
              this.myControlProvinces.setValue(this.mockProvincesData.find((c) => c.id === +this.defaults.province));
              this.languagesControl.setValue(this.languages.filter((l) => l.id === (this.defaults?.language1_id ||
              this.defaults?.language2_id || this.defaults?.language3_id || this.defaults?.language4_id
              || this.defaults?.language5_id || this.defaults?.language6_id)));

              this.loading = false;

            }, 500);

          })
    })
  }

  getSchoolSportDegrees() {
    this.crudService.list('/school-sports', 1, 1000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
      .subscribe((sport) => {
        this.schoolSports = sport.data;
        sport.data.forEach((element, idx) => {
          this.crudService.list('/degrees', 1, 1000, 'asc', 'degree_order', '&school_id=' + this.user.schools[0].id + '&sport_id='+element.sport_id)
          .subscribe((data) => {
            this.schoolSports[idx].degrees = data.data.reverse();
          });
        });
      })
  }


  getSports() {
    this.crudService.list('/sports', 1, 1000, null, null, '&school_id='+this.user.schools[0].id)
      .subscribe((data) => {
        data.data.forEach(element => {
          this.schoolSports.forEach(sport => {
            if(element.id === sport.sport_id) {
              sport.name = element.name;
              sport.icon_selected = element.icon_selected;
              sport.icon_unselected = element.icon_unselected;
            }
          });
        });

        this.schoolSports.forEach(element => {

          this.clientSport.forEach(sport => {
            if(element.sport_id === sport.sport_id) {
              sport.name = element.name;
              sport.icon_selected = element.icon_selected;
              sport.icon_unselected = element.icon_unselected;
              sport.degrees = element.degrees;
            }
          });
        });

          this.sportsCurrentData.data = this.clientSport;

          const availableSports = [];
          this.schoolSports.forEach(element => {
            if(!this.sportsCurrentData.data.find((s) => s.sport_id === element.sport_id)) {
              availableSports.push(element);
            }
          });
          this.filteredSports = this.sportsControl.valueChanges.pipe(
            startWith(''),
            map((sport: string | null) => sport ? this._filterSports(sport) : availableSports.slice())
          );
      })
  }

  getDegrees() {
    this.clientSport.forEach(element => {
      this.crudService.get('/degrees/'+element.degree_id)
        .subscribe((data) => {
          element.level = data.data;
        })
    });
  }

  getClientObservations() {
    this.crudService.list('/client-observations', 1, 1000, null, null, '&client_id='+this.id)
      .subscribe((data) => {
        if(data.data.length > 0) {

          this.defaultsObservations = data.data[0];
        }
      })
  }

  getClientSchool() {
    this.crudService.list('/clients-schools', 1, 1000, null, null, '&client_id='+this.id)
    .subscribe((data) => {
      this.clientSchool = data.data;

    })
  }

  getClientSport() {
    this.crudService.list('/client-sports', 1, 1000, null, null, '&client_id='+this.id)
      .subscribe((data) => {
        this.clientSport = data.data;
        this.selectedSport = this.clientSport[0];
        this.getSports();
        this.getDegrees();
      })
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


  getLanguages() {
    this.crudService.list('/languages', 1, 1000)
      .subscribe((data) => {
        this.languages = data.data;
        this.setInitLanguages();
      })
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
  private _filterLevel(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.mockLevelData.filter(level => level.annotation.toLowerCase().includes(filterValue));
  }

  private _filterLanguages(value: any): any[] {
    const filterValue = value.toLowerCase();
    return this.languages.filter(language => language?.name.toLowerCase().includes(filterValue));
  }

  private _filterSports(value: any): any[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value?.name?.toLowerCase();
    return this.schoolSports.filter(sport => sport?.name.toLowerCase().indexOf(filterValue) === 0);
  }

  displayFnCountry(country: any): string {
    return country && country.name ? country.name : '';
  }

  displayFnProvince(province: any): string {
    return province && province.name ? province.name : '';
  }

  displayFnLevel(level: any): string {
    return level && level?.name && level?.annotation ? level?.name + ' - ' + level?.annotation : level?.name;
  }

  updateSelectedSports(selected: any[]) {
    this.selectedSports = selected.map(sport => ({
      sportName: sport.name,
      sportId: sport.id,
      level: null
    }));
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

  getClientUtilisateurs() {
    this.crudService.list('/admin/clients/' + this.id +'/utilizers', 1, 1000, 'asc', 'name', '&client_id='+this.id)
      .subscribe((data) => {
        this.clientUsers = data.data;
        this.crudService.list('/clients-utilizers', 1, 1000, 'asc', 'name', '&main_id='+this.id)
        .subscribe((data) => {
          data.data.forEach(element => {
            this.clientUsers.forEach(cl => {
              if (element.client_id === cl.id) {
                cl.utilizer_id = element.id;
              }
            });
          });
        })

      })
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }

  setLanguages() {
    if (this.selectedLanguages.length >= 1) {

      this.defaults.language1_id = this.selectedLanguages[0].id;
    } if (this.selectedLanguages.length >= 2) {

      this.defaults.language2_id = this.selectedLanguages[1].id;
    } if (this.selectedLanguages.length >= 3) {

      this.defaults.language3_id = this.selectedLanguages[2].id;
    } if (this.selectedLanguages.length >= 4) {

      this.defaults.language4_id = this.selectedLanguages[3].id;
    } if (this.selectedLanguages.length >= 5) {

      this.defaults.language5_id = this.selectedLanguages[4].id;
    } if (this.selectedLanguages.length === 6) {

      this.defaults.language6_id = this.selectedLanguages[5].id;
    }
  }

  setInitLanguages() {

    this.languages.forEach(element => {
      if(element.id === this.defaults.language1_id || element.id === this.defaults.language2_id || element.id === this.defaults.language3_id
        || element.id === this.defaults.language4_id || element.id === this.defaults.language5_id || element.id === this.defaults.language6_id) {
          this.selectedLanguages.push(element);
        }
    });
  }

  removeSport(idx: number, element: any) {

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      maxWidth: '100vw',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales,
      data: {message: 'Do you want to remove this item? This action will be permanetly', title: 'Delete monitor course'}
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {

        this.crudService.delete('/client-sports', element.id)
          .subscribe(() => {
            this.deletedItems.push(this.sportsCurrentData.data[idx]);
            this.sportsCurrentData.data.splice(idx, 1);
            this.currentSportsTable.renderRows();
          })
      }
    });
  }

  deleteUserClient(id: number) {

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      maxWidth: '100vw',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales,
      data: {message: 'Do you want to remove this item? This action will be permanetly', title: 'Delete monitor course'}
    });


    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {

        this.crudService.delete('/clients-utilizers', id)
          .subscribe(() => {
            this.getClientUtilisateurs();
            this.snackbar.open('User removed', 'OK', {duration: 3000});
          })
      }
    });
  }

  updateLevel(clientSport, level) {
    this.crudService.update('/client-sports', {client_id: clientSport.data.id, sport_id: clientSport.sport_id, degree_id: level.id, school_id: this.user.schools[0].id}, clientSport.id)
      .subscribe((data) => {
        this.snackbar.open('Level updated', 'OK', {duration: 3000});
      })
  }

  save() {
    this.setLanguages();

    this.crudService.update('/users', this.defaultsUser, this.defaultsUser.id)
      .subscribe((user) => {
        this.defaults.user_id = user.data.id;

        this.crudService.update('/clients', this.defaults, this.id)
          .subscribe((client) => {
            this.snackbar.open('Cliente creado correctamente', 'OK', {duration: 3000});

            this.defaultsObservations.client_id = client.data.id;
            this.defaultsObservations.school_id = this.user.schools[0].id;
            this.crudService.update('/client-observations', this.defaultsObservations, this.defaultsObservations.id)
              .subscribe((obs) => {
                console.log('client observation created');
              })

              this.sportsData.data.forEach(element => {

                this.crudService.create('/client-sports', {client_id: client.data.id, sport_id: element.sport_id, degree_id: element.level.id, school_id: this.user.schools[0].id})
                  .subscribe(() => {
                    console.log('client sport created');
                  })
              });

              setTimeout(() => {
                this.router.navigate(['/clients']);

              }, 2000);
          })
      })
  }

  onTabChange(event: any) {
    if(event.index === 1) {
      this.selectedSport = this.clientSport[0]
      this.selectSportEvo(this.selectedSport);
    }
  }

  selectSportEvo(sport: any) {
    this.coloring = true;
    this.allLevels = [];
    this.selectedSport = sport;

    this.schoolSports.forEach(element => {
      if (this.selectedSport.sport_id === element.sport_id) {
        this.selectedSport.degrees = element.degrees;
      }
    });

    this.selectedSport.degrees.forEach(element => {
      element.inactive_color = this.lightenColor(element.color, 30);
      this.allLevels.push(element);
    });

    this.allLevels.sort((a, b) => a.degree_order - b.degree_order);
    this.coloring = false;
  }

  lightenColor(hexColor:any, percent:any) {

    let r:any = parseInt(hexColor.substring(1, 3), 16);
    let g:any = parseInt(hexColor.substring(3, 5), 16);
    let b:any = parseInt(hexColor.substring(5, 7), 16);

    // Increase the lightness
    r = Math.round(r + (255 - r) * percent / 100);
    g = Math.round(g + (255 - g) * percent / 100);
    b = Math.round(b + (255 - b) * percent / 100);

    // Convert RGB back to hex
    r = r.toString(16).padStart(2, '0');
    g = g.toString(16).padStart(2, '0');
    b = b.toString(16).padStart(2, '0');

    return '#' + r + g + b;
  }

  addUtilisateur() {

    this.crudService.delete('/users', 37).subscribe(() => {console.log('ok')})
    const dialogRef = this.dialog.open(AddClientUserModalComponent, {
      width: '600px',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales,
      data: {id: this.user.schools[0].id}
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {

        if(data.action === 'add') {
          this.crudService.create('/clients-utilizers', {client_id: data.ret, main_id: this.id})
          .subscribe((res) => {
            this.getClientUtilisateurs();
          })
        } else {
          const user = {
            username: data.data.name,
            email: this.defaults.email,
            password: this.passwordGen.generateRandomPassword(12),
            image: null,
            type: 'client',
            active: true,
          }

          const client = {
            email: this.defaults.email,
            first_name: data.data.name,
            last_name: data.data.surname,
            birth_date: moment(data.data.fromDate).format('YYYY-MM-DD'),
            phone: this.defaults.phone,
            telephone: this.defaults.telephone,
            address: this.defaults.address,
            cp: this.defaults.cp,
            city: this.defaults.city,
            province: this.defaults.province,
            country: this.defaults.country,
            image: null,
            language1_id:null,
            language2_id:null,
            language3_id:null,
            language4_id:null,
            language5_id:null,
            language6_id:null,
            user_id: null,
            station_id: this.defaults.station_id
          }
          const sportData = this.sportsCurrentData.data;

          this.setLanguagesUtilizateur(data.data.languages, client);

          this.crudService.create('/users', user)
          .subscribe((user) => {
            this.defaults.user_id = user.data.id;

            this.crudService.create('/clients', client)
              .subscribe((clientCreated) => {
                this.snackbar.open('Cliente creado correctamente', 'OK', {duration: 3000});

                this.crudService.create('/clients-schools', {client_id: clientCreated.data.id, school_id: this.user.schools[0].id})
                  .subscribe((clientSchool) => {
                    sportData.forEach(sport => {

                      this.crudService.create('/client-sports', {client_id: clientCreated.data.id, sport_id: sport.id, degree_id: sport.pivot.degree_id, school_id: this.user.schools[0].id})
                        .subscribe(() => {
                          console.log('client sport created');
                        })
                    });
                  });

                  setTimeout(() => {
                    this.crudService.create('/clients-utilizers', {client_id: clientCreated.data.id, main_id: this.id})
                    .subscribe((res) => {
                      this.getClientUtilisateurs();
                    })}, 1000);
              })
          })
        }
      }
    });

  }

  setLanguagesUtilizateur(langs: any, dataToModify: any) {
    if (langs.length >= 1) {

      dataToModify.language1_id = langs[0].id;
    } if (langs.length >= 2) {

      dataToModify.language2_id = langs[1].id;
    } if (langs.length >= 3) {

      dataToModify.language3_id = langs[2].id;
    } if (langs.length >= 4) {

      dataToModify.language4_id = langs[3].id;
    } if (langs.length >= 5) {

      dataToModify.language5_id = langs[4].id;
    } if (langs.length === 6) {

      dataToModify.language6_id = langs[5].id;
    }
  }
}
