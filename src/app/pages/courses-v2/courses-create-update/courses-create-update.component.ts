import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { map, forkJoin, mergeMap } from 'rxjs';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { ApiCrudService } from 'src/service/crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SchoolService } from 'src/service/school.service';
import moment from 'moment';

@Component({
  selector: 'vex-courses-create-update',
  templateUrl: './courses-create-update.component.html',
  styleUrls: ['./courses-create-update.component.scss',],
  animations: [fadeInUp400ms, stagger20ms]
})
export class CoursesCreateUpdateComponent implements OnInit {
  dataSource: any;

  ModalFlux: number = +this.activatedRoute.snapshot.queryParamMap['params'].step || 0
  ModalProgress: { Name: string, Modal: number }[] = [
    { Name: "sport", Modal: 0 },
    { Name: "details", Modal: 1 },
    { Name: "dates", Modal: 2 },
    { Name: "levels", Modal: 3 },
    { Name: "extras", Modal: 4 },
    { Name: "langs", Modal: 5 },
  ]
  Translate: { Code: string, Name: string }[] = [
    { Code: "es", Name: "Spanish" },
    { Code: "en", Name: "English" },
    { Code: "fr", Name: "France" },
    { Code: "de", Name: "German" },
    { Code: "it", Name: "Italian" },
  ]
  hours: string[] = [
    //'00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45',
    //'02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45',
    //'04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45',
    //'06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45',
    '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45',
    '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45',
    '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45',
    '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45',
    '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45',
    '18:00',
    //'18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45',
    //'20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45',
    //'22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45',
  ];
  duration: string[] = [
    //'00:00',
    '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45',
    '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45',
    '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45',
    '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45',
  ];

  ndays: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  weekSelect: string[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  PeriodoFecha: number = 0

  nowDate = new Date()
  minDate = this.nowDate;
  maxDate = new Date(2099, 12, 31);

  courseFormGroup: UntypedFormGroup; //El bueno
  extrasFormGroup: UntypedFormGroup; //crear extras nuevas

  sportData: any = [];
  sportDataList: any = [];
  sportTypeData: any = [];
  stations: any = [];
  levels: any = [];
  monitors: any = [];
  schoolData: any = [];
  extras: any = []

  mode: 'create' | 'update' = 'create';
  loading: boolean = true;
  extrasModal: boolean = false
  confirmModal: boolean = false
  translateExpandedIndex: number = 0
  user: any;
  id: any = null;
  default_course_dates: { date: Date, hour_start: string, hour_end: string, Duracion: string, date_end: Date, Semana: any[], groups: any[] } =
    {
      date: this.nowDate,
      hour_start: this.hours[0],
      Duracion: this.duration[0],
      date_end: this.nowDate,
      hour_end: this.hours[4],
      Semana: [],
      groups: []
    }
  default_activity_groups: { "groupName": string, "ageMin": number, "ageMax": number, "optionName": string, "price": number } =
    {
      "groupName": "",
      "ageMin": 18,
      "ageMax": 99,
      "optionName": "",
      "price": 0
    }
  constructor(private fb: UntypedFormBuilder, public dialog: MatDialog, private crudService: ApiCrudService, private activatedRoute: ActivatedRoute, private router: Router, private schoolService: SchoolService,) {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
    this.id = this.activatedRoute.snapshot.params.id;
    this.ModalFlux = +this.activatedRoute.snapshot.queryParamMap['params'].step || 0
  }
  detailData: any

  ngOnInit() {
    const extras = JSON.parse(JSON.parse(localStorage.getItem("boukiiUser")).schools[0].settings).extras
    this.extras = [...extras.food, ...extras.forfait, ...extras.transport]
    this.mode = this.id ? 'update' : 'create';
    forkJoin({
      sportTypes: this.getSportsType(),
      sports: this.getSports(),
      stations: this.getStations(),
      monitors: this.getMonitors()
    }).subscribe(({ sportTypes, sports, stations, monitors }) => {
      this.sportTypeData = sportTypes;
      this.sportData = sports;
      this.stations = stations;
      this.monitors = monitors;
      const settings = JSON.parse(this.user.schools[0].settings);
      this.courseFormGroup = this.fb.group({
        sport_id: [this.sportData[0].sport_id, Validators.required],
        is_flexible: [false,],
        course_type: [null, Validators.required],
        name: ["PROBANDO", Validators.required],
        short_description: ["PROBANDO RESUMEN", Validators.required],
        description: ["PROBANDO DESCRIPCION", Validators.required],
        price: [100, [Validators.required, Validators.min(1)]],
        currency: [settings?.taxes?.currency || 'CHF'],
        max_participants: [10, [Validators.required, Validators.min(1)]],
        image: ["", Validators.required],
        icon: ["", Validators.required],
        age_max: [99, [Validators.required, Validators.min(0), Validators.max(99)]],
        age_min: [0, [Validators.required, Validators.min(0), Validators.max(99)]],
        date_start: [this.nowDate, Validators.required],
        date_end: [this.nowDate, Validators.required],
        date_start_res: [this.nowDate],
        date_end_res: [this.nowDate],
        duration: [this.duration[0], Validators.required], //2
        confirm_attendance: [false],
        active: [true],
        online: [true],
        options: [true],
        translations: [
          {
            es: {
              name: '',
              short_description: '',
              description: ''
            },
            en: {
              name: '',
              short_description: '',
              description: ''
            },
            fr: {
              name: '',
              short_description: '',
              description: ''
            },
            it: {
              name: '',
              short_description: '',
              description: ''
            },
            de: {
              name: '',
              short_description: '',
              description: ''
            },
          }
        ],
        school_id: [null],
        station_id: [null],
        //Datos en forma de array
        course_dates: [[], Validators.required],
        discounts: [[{ day: 2, reduccion: 10 }], Validators.required], //1 flex
        unique: [true], //2 flex
        hour_min: [this.hours[0]], //2
        hour_max: [this.hours[4]], //2
        price_range: [[]], //2
        extras: [[], Validators.required],
        levelGrop: [[], Validators.required],
        settings: [
          {
            weekDays: {
              monday: false,
              tuesday: false,
              wednesday: false,
              thursday: false,
              friday: false,
              saturday: false,
              sunday: false
            },
            periods: [],
            groups: [
              this.default_activity_groups
            ]
          }
        ],
      });
      if (this.mode === "create") {
        this.loading = false
        this.Confirm(0)
      } else {
        this.crudService.get('/admin/courses/' + this.id,
          ['courseGroups.degree', 'courseGroups.courseDates.courseSubgroups.bookingUsers.client', 'sport'])
          .subscribe((data: any) => {
            this.detailData = data.data
            this.crudService.list('/degrees', 1, 10000, 'asc', 'degree_order', '&school_id=' + this.detailData.school_id + '&sport_id=' + this.detailData.sport_id)
              .subscribe((data) => {
                this.detailData.degrees = [];
                data.data.forEach(element => {
                  if (element.active) this.detailData.degrees.push({ ...element, Subgrupo: this.getSubGroups(element.id) });
                });
                this.detailData.degrees.forEach((level: any) => {
                  level.active = false;
                  this.detailData.course_dates.forEach((cs: any) => {
                    cs.course_groups.forEach((group: any) => {
                      if (group.degree_id === level.id) {
                        level.active = true;
                        level.old = true;
                      } level.visible = false;
                    });
                  });
                });
                this.crudService.list('/stations', 1, 10000, 'desc', 'id', '&school_id=' + this.detailData.school_id)
                  .subscribe((st) => {
                    st.data.forEach(element => {
                      if (element.id === this.detailData.station_id) this.detailData.station = element
                    });
                    this.crudService.list('/booking-users', 1, 10000, 'desc', 'id', '&school_id=' + this.detailData.school_id + '&course_id=' + this.detailData.id)
                      .subscribe((bookingUser) => {
                        this.detailData.users = [];
                        this.detailData.users = bookingUser.data;
                        this.courseFormGroup.patchValue({
                          sport_id: this.detailData.sport_id,
                          course_type: this.detailData.course_type,
                          name: this.detailData.name,
                          short_description: this.detailData.short_description,
                          description: this.detailData.description,
                          price: this.detailData.price,
                          currency: this.detailData.currency,
                          max_participants: this.detailData.max_participants,
                          image: this.detailData.image,
                          icon: this.detailData.sport.icon_unselected,
                          age_max: this.detailData.age_max,
                          age_min: this.detailData.age_min,
                          date_start: moment(this.detailData.date_start_res).format('YYYY-MM-DD'),
                          date_end: moment(this.detailData.date_end_res).format('YYYY-MM-DD'),
                          date_start_res: moment(this.detailData.date_start_res).format('YYYY-MM-DD'),
                          date_end_res: moment(this.detailData.date_end_res).format('YYYY-MM-DD'),
                          duration: this.detailData.duration,
                          course_dates: this.detailData.course_dates,
                          levelGrop: this.detailData.degrees,
                          settings: this.detailData.settings,
                          discounts: this.detailData.discounts,
                          translations: this.detailData.translations,
                        })
                        this.getDegrees()
                        this.Confirm(0)
                        this.loading = false
                      })
                  })
              });
          })
      }
      this.extrasFormGroup = this.fb.group({
        id: ["", Validators.required],
        product: ["", Validators.required],
        name: ["", Validators.required],
        price: ["", Validators.required],
        iva: ["", Validators.required],
        status: ["", Validators.required],
      })
      this.schoolService.getSchoolData()
        .subscribe((data) => {
          this.schoolData = data.data;
        })
    });
  }

  getSubGroups(levelId: any) {
    let ret = 0;

    this.detailData.course_dates.forEach((courseDate: any) => {
      let find = false;
      courseDate.course_groups.forEach(group => {
        if (group.degree_id === levelId && !find) {
          ret = group.course_subgroups[0]?.max_participants;
          find = true;
        }
      });

    });

    return ret;
  }
  displayFn = (value: any): string => value
  getSportsType = () => this.crudService.list('/sport-types', 1, 1000).pipe(map(data => data.data));
  getMonitors = () => this.crudService.list('/monitors', 1, 10000, 'desc', 'id', '&school_id=' + this.user.schools[0].id).pipe(map(data => data.data));
  getSports = () => this.crudService.list('/school-sports', 1, 10000, 'desc', 'id', '&school_id=' + this.user.schools[0].id).pipe(
    map(sport => sport.data),
    mergeMap(sports =>
      forkJoin(sports.map(element =>
        this.crudService.get('/sports/' + element.sport_id).pipe(
          map(data => {
            element.name = data.data.name;
            element.icon_selected = data.data.icon_selected;
            element.icon_unselected = data.data.icon_unselected;
            element.sport_type = data.data.sport_type;
            return element;
          })
        )
      ))
    )
  );
  getStations = () => this.crudService.list('/stations-schools', 1, 10000, 'desc', 'id', '&school_id=' + this.user.schools[0].id).pipe(
    map(station => station.data),
    mergeMap(stations => forkJoin(stations.map(element => this.crudService.get('/stations/' + element.station_id).pipe(map(data => data.data)))))
  );
  getDegrees = () => this.crudService.list('/degrees', 1, 10000, 'asc', 'degree_order', '&school_id=' + this.user.schools[0].id + '&sport_id=' + this.courseFormGroup.controls['sport_id'].value).subscribe((data) => {
    this.levels = []
    data.data.forEach((element: any) => element.active ? this.levels.push(element) : null);
    const levelGrop = []
    this.levels.forEach((level: any) => {
      levelGrop.push({ ...level, id: level.id, age_min: 0, age_max: 0, PartMax: 0, Subgrupo: 0, active: false })
      level.active = false
    })
    this.courseFormGroup.patchValue({ levelGrop })
  });

  Confirm(add: number) {
    this.courseFormGroup.markAsUntouched()
    this.ModalFlux += add
    if (this.ModalFlux === 1) {
      if (!this.courseFormGroup.controls["course_type"].value) this.courseFormGroup.patchValue({ course_type: 1 })
      this.courseFormGroup.patchValue({
        icon: this.sportData.find((a: any) => a.sport_id === this.courseFormGroup.controls['sport_id'].value).icon_unselected
      })
      this.getDegrees();
    } else if (this.ModalFlux === 2) {
      if (
        this.courseFormGroup.controls["name"].status === 'VALID' &&
        this.courseFormGroup.controls["short_description"].status === 'VALID' &&
        this.courseFormGroup.controls["description"].status === 'VALID' &&
        this.courseFormGroup.controls["price"].status === 'VALID' &&
        this.courseFormGroup.controls["max_participants"].status === 'VALID' &&
        (
          this.courseFormGroup.controls['course_type'].value > 1 &&
          this.courseFormGroup.controls["age_min"].status === 'VALID' &&
          this.courseFormGroup.controls["age_max"].status === 'VALID' ||
          this.courseFormGroup.controls['course_type'].value === 1
        )
      ) {
        if (this.courseFormGroup.controls["course_dates"].value.length === 0)
          this.courseFormGroup.patchValue({ course_dates: [this.default_course_dates] })
        this.getDegrees();
      } else {
        this.courseFormGroup.markAllAsTouched()
        this.ModalFlux -= add
      }
    } else if (this.ModalFlux === 3) {
      if (
        this.courseFormGroup.controls["date_start"].status === 'VALID' &&
        this.courseFormGroup.controls["date_end"].status === 'VALID'
      ) {


      } else {
        this.courseFormGroup.markAllAsTouched()
        this.ModalFlux -= add
      }
      if (this.courseFormGroup.controls['course_type'].value === 2) {
        this.courseFormGroup.patchValue({
          price_range: this.generarIntervalos(
            this.courseFormGroup.controls["max_participants"].value,
            this.duration.length,
            this.duration
          )
        })
        console.log(this.courseFormGroup.controls["price_range"].value)
      }
    }
    else if (this.ModalFlux === 4) {
      if (this.courseFormGroup.controls['course_type'].value === 1) {
        if (this.courseFormGroup.controls['levelGrop'].value.some((item: any) => item.active)) {
          if (!this.courseFormGroup.controls["translations"].value.es.name) {
            this.courseFormGroup.patchValue({
              translations:
              {
                es: {
                  name: this.courseFormGroup.controls["name"].value,
                  short_description: this.courseFormGroup.controls["short_description"].value,
                  description: this.courseFormGroup.controls["description"].value
                },
                en: {
                  name: this.courseFormGroup.controls["name"].value,
                  short_description: this.courseFormGroup.controls["short_description"].value,
                  description: this.courseFormGroup.controls["description"].value
                },
                fr: {
                  name: this.courseFormGroup.controls["name"].value,
                  short_description: this.courseFormGroup.controls["short_description"].value,
                  description: this.courseFormGroup.controls["description"].value
                },
                it: {
                  name: this.courseFormGroup.controls["name"].value,
                  short_description: this.courseFormGroup.controls["short_description"].value,
                  description: this.courseFormGroup.controls["description"].value
                },
                de: {
                  name: this.courseFormGroup.controls["name"].value,
                  short_description: this.courseFormGroup.controls["short_description"].value,
                  description: this.courseFormGroup.controls["description"].value
                },
              }
            })
          }
        } else {

          this.ModalFlux -= add
        }
      } else if (this.courseFormGroup.controls['course_type'].value === 2) {

      } else if (this.courseFormGroup.controls['course_type'].value === 3) {

      } else {

        this.ModalFlux -= add
      }

    }
    else if (this.ModalFlux === 6) {
      this.ModalFlux--
      this.confirmModal = true
    }
  }

  find = (array: any[], key: string, value: string | boolean) => array.find((a: any) => a[key] === value)

  selectLevel = (event: any, i: number) => {
    const levelGrop = this.courseFormGroup.controls['levelGrop'].value
    levelGrop[i].active = event.target.checked
    levelGrop[i].age_min = this.courseFormGroup.controls['age_min'].value || 0
    levelGrop[i].age_max = this.courseFormGroup.controls['age_max'].value || 99
    levelGrop[i].PartMax = this.courseFormGroup.controls['max_participants'].value || 0
    this.courseFormGroup.patchValue({ levelGrop })
    this.addLevelSubgroup(i, 1)
  }
  addLevelSubgroup = (i: number, add: number) => {
    const levelGrop = this.courseFormGroup.controls['levelGrop'].value
    levelGrop[i].Subgrupo = levelGrop[i].Subgrupo + add
    this.courseFormGroup.patchValue({ levelGrop })
  }
  selectExtra = (event: any, item: any) => {
    const extras = this.courseFormGroup.controls['extras'].value
    if (event.checked || !extras.find((a: any) => a.id === item.id)) this.courseFormGroup.patchValue({ extras: [...extras, item] })
    else this.courseFormGroup.patchValue({ extras: extras.filter((a: any) => a.id !== item.id) })
  }
  selectWeek = (day: string, event: any) => {
    const settings = this.courseFormGroup.controls['settings'].value
    if (day === "0") settings.weekDays = { monday: event.checked, tuesday: event.checked, wednesday: event.checked, thursday: event.checked, friday: event.checked, saturday: event.checked, sunday: event.checked }
    else settings.weekDays[day] = event.checked
    this.courseFormGroup.patchValue({ settings: settings })
  }

  endCourse() {
    const courseFormGroup = this.courseFormGroup.getRawValue()
    courseFormGroup.translations = JSON.stringify(this.courseFormGroup.controls['translations'].value)
    courseFormGroup.settings = JSON.stringify(this.courseFormGroup.controls['settings'].value)
    courseFormGroup.discounts = JSON.stringify(this.courseFormGroup.controls['discounts'].value)
    for (const level of courseFormGroup.levelGrop) {
      if (courseFormGroup.levelGrop.active) {
        courseFormGroup.course_dates.groups.push(level)
      }
    }

    if (!courseFormGroup.options) delete courseFormGroup.options;

    this.mode === "create" ?
      this.crudService.create('/admin/courses', courseFormGroup).subscribe((data) => {
        console.log(data)
        if (data.success) this.router.navigate(["/courses/detail/" + data.data.id])
      })
      :
      this.crudService.update('/admin/courses', courseFormGroup, this.id).subscribe((data) => {
        if (data.success) this.router.navigate(["/courses/detail/" + data.data.id])
      })
  }
  getNumberArray = (num: number): any[] => ['intervalo', ...Array.from({ length: num }, (_, i) => `${i + 1}`)];;
  generarIntervalos = (personas: number, intervalo: number, duracion: string[]): any[] => {
    const resultado = [];
    for (let i = 0; i < intervalo; i++) {
      const obj = { intervalo: duracion[i] };
      for (let j = 1; j <= personas; j++) {
        obj[j] = this.courseFormGroup.controls['price'].value;
      }
      resultado.push(obj);
    }
    return resultado;
  }
}
