import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { map, forkJoin, mergeMap } from 'rxjs';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { ApiCrudService } from 'src/service/crud.service';
import { ActivatedRoute } from '@angular/router';
import { SchoolService } from 'src/service/school.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'vex-courses-create-update',
  templateUrl: './courses-create-update.component.html',
  styleUrls: ['./courses-create-update.component.scss',
    '../../../../../node_modules/quill/dist/quill.snow.css',
    '../../../../@vex/styles/partials/plugins/quill/_quill.scss'
  ],
  animations: [fadeInUp400ms, stagger20ms]
})
export class CoursesCreateUpdateComponent implements OnInit {
  dataSource: any;
  displayedColumns = ['intervalo', ...Array.from({ length: 6 }, (_, i) => `${i + 1}`)];

  ModalFlux: number = +this.activatedRoute.snapshot.queryParamMap['params'].step || 0
  ModalProgress: { Name: string, Modal: number }[] = [
    { Name: "DEPORTE", Modal: 0 },
    { Name: "DETALLES", Modal: 1 },
    { Name: "FECHAS", Modal: 2 },
    { Name: "NIVELES", Modal: 3 },
    { Name: "EXTRAS", Modal: 4 },
    { Name: "IDIOMAS", Modal: 5 },
  ]
  Translate: { Code: string, Name: string }[] = [
    { Code: "es", Name: "ESPAÑOL" },
    { Code: "en", Name: "INGLES" },
    { Code: "fr", Name: "FRANCÉS" },
    { Code: "de", Name: "ALEMAN" },
    { Code: "it", Name: "ITALIANO" },
  ]
  hours: string[] = [
    '00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45',
    '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45',
    '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45',
    '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45',
    '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45',
    '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45',
    '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45',
    '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45',
    '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45',
    '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45',
    '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45',
    '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45',
  ];
  ndays: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  weekSelect: string[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  PeriodoFecha: number = 0
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    //height: '56px',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    defaultParagraphSeparator: '',
    defaultFontName: '',
    sanitize: false,  // Esta línea es clave para permitir HTML sin sanitizarlo.
    toolbarPosition: 'bottom',
    outline: true,
    toolbarHiddenButtons: [['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent', 'insertUnorderedList', 'insertOrderedList', 'heading']],
  }
  editor1Config: AngularEditorConfig = { ...this.editorConfig, height: '56px', }
  editor2Config: AngularEditorConfig = { ...this.editorConfig, height: '112px', }

  minDate = new Date(2000, 1, 1);
  nowDate = new Date()
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


  constructor(private fb: UntypedFormBuilder, public dialog: MatDialog, private crudService: ApiCrudService, private activatedRoute: ActivatedRoute,
    private schoolService: SchoolService,) {
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
      if (this.mode === "create") {
        this.courseFormGroup = this.fb.group({
          sport_id: [this.sportData[0].sport_id, Validators.required],
          course_type: [null, Validators.required],
          course_name: ["", Validators.required],
          summary: ["", Validators.required],
          description: ["", Validators.required],
          course_name_es: ["", Validators.required],
          summary_es: ["", Validators.required],
          description_es: ["", Validators.required],
          course_name_fr: ["", Validators.required],
          summary_fr: ["", Validators.required],
          description_fr: ["", Validators.required],
          course_name_en: ["", Validators.required],
          summary_en: ["", Validators.required],
          description_en: ["", Validators.required],
          course_name_de: ["", Validators.required],
          summary_de: ["", Validators.required],
          description_de: ["", Validators.required],
          course_name_it: ["", Validators.required],
          summary_it: ["", Validators.required],
          description_it: ["", Validators.required],
          price: [null, Validators.required],
          participants: [null, Validators.required],
          img: ["", Validators.required],
          icon: ["", Validators.required],

          age_max: [null, Validators.required], //2
          age_min: [null, Validators.required], //2

          reserve_from: [null, Validators.required],
          reserve_to: [null, Validators.required],
          duration_min: [null, Validators.required], //2

          //Datos en forma de array
          reserve_date: [[], Validators.required],
          discount: [[], Validators.required],
          extras: [[], Validators.required],
          levelGrop: [[], Validators.required],
          categoryPart: [[], Validators.required],
          settings: [{ "weekDays": { "monday": false, "tuesday": false, "wednesday": false, "thursday": false, "friday": false, "saturday": false, "sunday": false }, "periods": [], "groups": [] }, Validators.required],
        });
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
                this.detailData.degrees.forEach(level => {
                  level.active = false;
                  this.detailData.course_dates.forEach(cs => {
                    cs.course_groups.forEach(group => {
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
                        this.courseFormGroup = this.fb.group({
                          sport_id: [this.detailData.sport_id, Validators.required],
                          course_type: [this.detailData.course_type, Validators.required],
                          course_name: [this.detailData.name, Validators.required],
                          summary: [this.detailData.short_description, Validators.required],
                          description: [this.detailData.description, Validators.required],
                          course_name_es: ["", Validators.required],
                          summary_es: ["", Validators.required],
                          description_es: ["", Validators.required],
                          course_name_fr: ["", Validators.required],
                          summary_fr: ["", Validators.required],
                          description_fr: ["", Validators.required],
                          course_name_en: ["", Validators.required],
                          summary_en: ["", Validators.required],
                          description_en: ["", Validators.required],
                          course_name_de: ["", Validators.required],
                          summary_de: ["", Validators.required],
                          description_de: ["", Validators.required],
                          course_name_it: ["", Validators.required],
                          summary_it: ["", Validators.required],
                          description_it: ["", Validators.required],
                          price: [this.detailData.price, Validators.required],
                          participants: [this.detailData.max_participants, Validators.required],
                          img: [this.detailData.image, Validators.required],
                          icon: [this.detailData.sport.icon_unselected, Validators.required],
                          age_max: [this.detailData.age_max, Validators.required],
                          age_min: [this.detailData.age_min, Validators.required],
                          reserve_from: [this.detailData.date_start, Validators.required],
                          reserve_to: [this.detailData.date_end, Validators.required],
                          duration_min: [this.detailData.duration, Validators.required],
                          reserve_date: [this.detailData.course_dates, Validators.required],
                          discount: [[], Validators.required],
                          extras: [[], Validators.required],
                          levelGrop: [this.detailData.degrees, Validators.required],
                          categoryPart: [[], Validators.required],
                          settings: [JSON.parse(this.detailData.settings), Validators.required],
                        });
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

    this.detailData.course_dates.forEach(courseDate => {
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
    data.data.forEach(element => element.active ? this.levels.push(element) : null);
    const levelGrop = []
    this.levels.forEach(level => {
      levelGrop.push({ ...level, id: level.id, age_min: 0, age_max: 0, PartMax: 0, Subgrupo: 0, active: false })
      level.active = false
    })
    this.courseFormGroup.patchValue({ levelGrop })
  });

  Confirm(add: number) {
    this.ModalFlux += add
    if (this.ModalFlux === 1) {
      if (!this.courseFormGroup.controls["course_type"].value) this.courseFormGroup.patchValue({ course_type: 1 })
      this.courseFormGroup.patchValue({
        icon: this.sportData.find((a: any) => a.sport_id === this.courseFormGroup.controls['sport_id'].value).icon_unselected
      })
      this.getDegrees();
    } else if (this.ModalFlux === 2) {
      if (this.courseFormGroup.controls["reserve_date"].value.length === 0)
        this.courseFormGroup.patchValue({ reserve_date: [{ date: this.nowDate, hour_start: "08:00", Duracion: "01:00", date_end: this.nowDate, hour_end: "09:00", Semana: [] }] })
      if (this.courseFormGroup.controls["discount"].value.length === 0) this.courseFormGroup.patchValue({ discount: [{ day: 2, reduccion: 10 }] })
      this.getDegrees();
    } else if (this.ModalFlux === 3) {
      if (this.courseFormGroup.controls["categoryPart"].value.length === 0) {
        this.courseFormGroup.patchValue({
          categoryPart: [{
            name: "",
            age_min: this.courseFormGroup.controls["age_min"].value || 0,
            age_max: this.courseFormGroup.controls["age_max"].value || 99,
            num_min: this.courseFormGroup.controls["participants"].value || 0,
            num_max: this.courseFormGroup.controls["participants"].value || 0,
          }]
        })
      }
    }
    else if (this.ModalFlux === 4) {
      if (!this.courseFormGroup.controls["course_name_es"].value) {
        this.courseFormGroup.patchValue({
          course_name_es: this.courseFormGroup.controls["course_name"].value,
          summary_es: this.courseFormGroup.controls["course_name"].value,
          description_es: this.courseFormGroup.controls["course_name"].value,
          course_name_fr: this.courseFormGroup.controls["course_name"].value,
          summary_fr: this.courseFormGroup.controls["course_name"].value,
          description_fr: this.courseFormGroup.controls["course_name"].value,
          course_name_en: this.courseFormGroup.controls["course_name"].value,
          summary_en: this.courseFormGroup.controls["course_name"].value,
          description_en: this.courseFormGroup.controls["course_name"].value,
          course_name_de: this.courseFormGroup.controls["course_name"].value,
          summary_de: this.courseFormGroup.controls["course_name"].value,
          description_de: this.courseFormGroup.controls["course_name"].value,
          course_name_it: this.courseFormGroup.controls["course_name"].value,
          summary_it: this.courseFormGroup.controls["course_name"].value,
          description_it: this.courseFormGroup.controls["course_name"].value,
        })
      }
    }
    else if (this.ModalFlux === 6) {
      this.ModalFlux--
      this.confirmModal = true
    }
  }

  find = (array: any[], key: string, value: string) => array.find((a: any) => a[key] === value)
  selectLevel = (event: any, i: number) => {
    const levelGrop = this.courseFormGroup.controls['levelGrop'].value
    levelGrop[i].active = event.target.checked
    levelGrop[i].age_min = this.courseFormGroup.controls['age_min'].value || 0
    levelGrop[i].age_max = this.courseFormGroup.controls['age_max'].value || 99
    levelGrop[i].PartMax = this.courseFormGroup.controls['participants'].value || 0
    this.courseFormGroup.patchValue({ levelGrop })
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
  selectAllweek = (event: any) => {
    const settings = this.courseFormGroup.controls['settings'].value
    settings.weekDays = { "monday": event.checked, "tuesday": event.checked, "wednesday": event.checked, "thursday": event.checked, "friday": event.checked, "saturday": event.checked, "sunday": event.checked }
    this.courseFormGroup.patchValue({ settings })
  }

}
