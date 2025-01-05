import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { map, forkJoin, mergeMap } from 'rxjs';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { ApiCrudService } from 'src/service/crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SchoolService } from 'src/service/school.service';
import { CoursesService } from 'src/service/courses.service';

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

  PeriodoFecha: number = 0
  extrasFormGroup: UntypedFormGroup; //crear extras nuevas
  nowDate: Date = new Date()
  sportData: any = [];
  sportDataList: any = [];
  sportTypeData: any = [];
  stations: any = [];
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

  constructor(private fb: UntypedFormBuilder, public dialog: MatDialog, private crudService: ApiCrudService, private activatedRoute: ActivatedRoute, private router: Router, private schoolService: SchoolService,
    public courses: CoursesService
  ) {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
    this.id = this.activatedRoute.snapshot.params.id;
    this.ModalFlux = +this.activatedRoute.snapshot.queryParamMap['params'].step || 0
  }
  detailData: any = { degrees: [], course_dates: [] }

  ngOnInit() {
    const extras = JSON.parse(JSON.parse(localStorage.getItem("boukiiUser")).schools[0].settings).extras
    this.extras = [...extras.food, ...extras.forfait, ...extras.transport]
    this.mode = this.id ? 'update' : 'create';
    forkJoin({
      sports: this.getSports(),
      stations: this.getStations(),
      monitors: this.mode === "update" ? this.getMonitors() : null,
    }).subscribe(({ sports, stations, monitors }) => {
      this.sportData = sports;
      this.stations = stations;
      this.courses.resetcourseFormGroup()
      if (this.mode === "create") {
        this.courses.courseFormGroup.patchValue({
          sport_id: this.sportData[0].sport_id,
          station_id: this.stations[0].id,
          duration: this.courses.duration[0],
          school_id: this.user.schools[0].id,
          hour_min: this.courses.hours[0],
          hour_max: this.courses.hours[4],
        })
        this.Confirm(0)
        this.loading = false
      } else {
        this.monitors = monitors
        console.log(this.monitors)
        this.crudService.get('/admin/courses/' + this.id,
          ['courseGroups.degree', 'courseGroups.courseDates.courseSubgroups.bookingUsers.client', 'sport'])
          .subscribe((data: any) => {
            this.detailData = data.data
            this.crudService.list('/stations', 1, 10000, 'desc', 'id', '&school_id=' + this.detailData.school_id)
              .subscribe((st: any) => {
                st.data.forEach((element: any) => {
                  if (element.id === this.detailData.station_id) this.detailData.station = element
                });
                //this.crudService.list('/booking-users', 1, 10000, 'desc', 'id', '&school_id=' + this.detailData.school_id + '&course_id=' + this.detailData.id)
                //  .subscribe((bookingUser) => {
                //    this.detailData.users = [];
                //    this.detailData.users = bookingUser.data;
                //  })
                this.courses.settcourseFormGroup(this.detailData)
                this.getDegrees()
                setTimeout(() => this.loading = false, 0);
              })
          })
      }
      this.extrasFormGroup = this.fb.group({
        id: ["", Validators.required],
        product: ["", Validators.required],
        name: ["", Validators.required],
        price: [1, Validators.required],
        tva: [21, Validators.required],
        status: [true, Validators.required],
      })
      this.schoolService.getSchoolData().subscribe((data) => { this.schoolData = data.data })
    });
  }

  createExtras() {
    this.extrasModal = false;
    this.extrasFormGroup.patchValue({ id: "FOR-" + this.extrasFormGroup.controls['name'].value + this.extrasFormGroup.controls['product'].value + this.extrasFormGroup.controls['price'].value })
    this.extras.push(this.extrasFormGroup.getRawValue());
    this.extrasFormGroup = this.fb.group({
      id: ["", Validators.required],
      product: ["", Validators.required],
      name: ["", Validators.required],
      price: [1, Validators.required],
      tva: [21, Validators.required],
      status: [true, Validators.required],
    })
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
    mergeMap(stations => forkJoin(stations.map((element: any) => this.crudService.get('/stations/' + element.station_id).pipe(map(data => data.data)))))
  );

  getDegrees = () => this.crudService.list('/degrees', 1, 10000, 'asc', 'degree_order', '&school_id=' + this.courses.courseFormGroup.controls['school_id'].value + '&sport_id=' + this.courses.courseFormGroup.controls['sport_id'].value).subscribe((data) => {
    this.detailData.degrees = [];
    data.data.forEach((element: any) => {
      if (element.active) this.detailData.degrees.push({ ...element, Subgrupo: this.getSubGroups(element.id) });
    });
    const levelGrop = []
    this.detailData.degrees.forEach((level: any) => {
      level.active = false;
      this.detailData.course_dates.forEach((cs: any) => {
        cs.course_groups.forEach((group: any) => {
          if (group.degree_id === level.id) {
            level.active = true;
            level.old = true;
            level.age_min = group.age_min
            level.age_max = group.age_max
            level.max_participants = group.max_participants
            level.Subgrupo = group.course_subgroups.length
          } level.visible = false;
        });
      });
      levelGrop.push({ ...level })
    });
    this.courses.courseFormGroup.patchValue({ levelGrop })
  });

  Confirm(add: number) {
    this.courses.courseFormGroup.markAsUntouched()
    this.ModalFlux += add
    if (this.ModalFlux === 1) {
      if (!this.courses.courseFormGroup.controls["course_type"].value) this.courses.courseFormGroup.patchValue({ course_type: 1 })
      this.courses.courseFormGroup.patchValue({
        icon: this.sportData.find((a: any) => a.sport_id === this.courses.courseFormGroup.controls['sport_id'].value).icon_unselected
      })
      this.getDegrees();
    } else if (this.ModalFlux === 2) {
      if (
        this.courses.courseFormGroup.controls["name"].status === 'VALID' &&
        this.courses.courseFormGroup.controls["short_description"].status === 'VALID' &&
        this.courses.courseFormGroup.controls["description"].status === 'VALID' &&
        this.courses.courseFormGroup.controls["price"].status === 'VALID' &&
        this.courses.courseFormGroup.controls["max_participants"].status === 'VALID' &&
        (
          this.courses.courseFormGroup.controls['course_type'].value > 1 &&
          this.courses.courseFormGroup.controls["age_min"].status === 'VALID' &&
          this.courses.courseFormGroup.controls["age_max"].status === 'VALID' ||
          this.courses.courseFormGroup.controls['course_type'].value === 1
        )
      ) {
      } else {
        this.courses.courseFormGroup.markAllAsTouched()
        this.ModalFlux -= add
      }
    } else if (this.ModalFlux === 3) {
      if (
        this.courses.courseFormGroup.controls["date_start"].status === 'VALID' &&
        this.courses.courseFormGroup.controls["date_end"].status === 'VALID'
      ) {
      } else {
        this.courses.courseFormGroup.markAllAsTouched()
        this.ModalFlux -= add
      }
      if (this.courses.courseFormGroup.controls['course_type'].value === 2) {
        let Range = this.generarIntervalos(
          this.courses.courseFormGroup.controls["max_participants"].value,
          this.courses.duration.length,
          this.courses.duration
        )
        const settings = JSON.parse(this.user.schools[0].settings);
        for (const range in settings.prices_range.prices) Range[range] = { ...Range[range], ...settings.prices_range.prices[range] }
        this.courses.courseFormGroup.patchValue({ price_range: Range })
      }
    }
    else if (this.ModalFlux === 4) {
      if (this.courses.courseFormGroup.controls['course_type'].value === 1) {
        if (this.courses.courseFormGroup.controls['levelGrop'].value.some((item: any) => item.active)) {
          if (!this.courses.courseFormGroup.controls["translations"].value.es.name) {
            this.courses.courseFormGroup.patchValue({
              translations:
              {
                es: {
                  name: this.courses.courseFormGroup.controls["name"].value,
                  short_description: this.courses.courseFormGroup.controls["short_description"].value,
                  description: this.courses.courseFormGroup.controls["description"].value
                },
                en: {
                  name: this.courses.courseFormGroup.controls["name"].value,
                  short_description: this.courses.courseFormGroup.controls["short_description"].value,
                  description: this.courses.courseFormGroup.controls["description"].value
                },
                fr: {
                  name: this.courses.courseFormGroup.controls["name"].value,
                  short_description: this.courses.courseFormGroup.controls["short_description"].value,
                  description: this.courses.courseFormGroup.controls["description"].value
                },
                it: {
                  name: this.courses.courseFormGroup.controls["name"].value,
                  short_description: this.courses.courseFormGroup.controls["short_description"].value,
                  description: this.courses.courseFormGroup.controls["description"].value
                },
                de: {
                  name: this.courses.courseFormGroup.controls["name"].value,
                  short_description: this.courses.courseFormGroup.controls["short_description"].value,
                  description: this.courses.courseFormGroup.controls["description"].value
                },
              }
            })
          }
        } else {
          this.ModalFlux -= add
        }
      } else if (this.courses.courseFormGroup.controls['course_type'].value === 2) {

      } else {
        const groups = this.courses.courseFormGroup.controls['settings'].value.groups;
        if (groups.every((group: any) => group.groupName && group.ageMin > 0 && group.ageMax > 0 && group.price > 0)) {
        } else {
          this.courses.courseFormGroup.controls['settings'].markAllAsTouched()
          this.ModalFlux -= add
        }
      }
    }
    else if (this.ModalFlux === 6) {
      this.ModalFlux--
      this.confirmModal = true
    }
  }

  find = (array: any[], key: string, value: string | boolean) => array.find((a: any) => a[key] === value)

  selectLevel = (event: any, i: number) => {
    const levelGrop = this.courses.courseFormGroup.controls['levelGrop'].value
    levelGrop[i].active = event.target.checked
    if (event.target.checked) {
      levelGrop[i].age_min = this.courses.courseFormGroup.controls['age_min'].value
      levelGrop[i].age_max = this.courses.courseFormGroup.controls['age_max'].value
      levelGrop[i].max_participants = this.courses.courseFormGroup.controls['max_participants'].value
      levelGrop[i].Subgrupo = 1
    } else {
      levelGrop[i].Subgrupo = 0
    }
    this.courses.courseFormGroup.patchValue({ levelGrop })
  }

  addLevelSubgroup = (i: number, add: number) => {
    const levelGrop = this.courses.courseFormGroup.controls['levelGrop'].value
    levelGrop[i].Subgrupo += add
    this.courses.courseFormGroup.patchValue({ levelGrop })
  }

  selectExtra = (event: any, item: any, i: number) => {
    if (this.courses.courseFormGroup.controls['course_type'].value === 3) {
      this.courses.courseFormGroup.controls['settings'].value.groups = JSON.parse(JSON.stringify(this.courses.courseFormGroup.controls['settings'].value.groups))
      if (event.checked || !this.courses.courseFormGroup.controls['settings'].value.groups[i].extras.find((a: any) => a.id === item.id)) this.courses.courseFormGroup.controls['settings'].value.groups[i].extras.push(item)
      else this.courses.courseFormGroup.controls['settings'].value.groups[i].extras = this.courses.courseFormGroup.controls['settings'].value.groups[i].extras.filter((a: any) => a.id !== item.id)
    } else {
      const extras = this.courses.courseFormGroup.controls['extras'].value
      if (event.checked || !extras.find((a: any) => a.id === item.id)) this.courses.courseFormGroup.patchValue({ extras: [...extras, item] })
      else this.courses.courseFormGroup.patchValue({ extras: extras.filter((a: any) => a.id !== item.id) })
    }
  }

  selectWeek = (day: string, event: any) => {
    const settings = this.courses.courseFormGroup.controls['settings'].value
    if (day === "0") settings.weekDays = { monday: event.checked, tuesday: event.checked, wednesday: event.checked, thursday: event.checked, friday: event.checked, saturday: event.checked, sunday: event.checked }
    else settings.weekDays[day] = event.checked
    this.courses.courseFormGroup.patchValue({ settings: settings })
  }

  endCourse() {
    const courseFormGroup = this.courses.courseFormGroup.getRawValue()
    courseFormGroup.translations = JSON.stringify(this.courses.courseFormGroup.controls['translations'].value)
    courseFormGroup.course_type === 1 ? delete courseFormGroup.settings : courseFormGroup.settings = JSON.stringify(this.courses.courseFormGroup.controls['settings'].value)
    courseFormGroup.discounts = JSON.stringify(this.courses.courseFormGroup.controls['discounts'].value)
    console.log(courseFormGroup.levelGrop)
    console.log(courseFormGroup.course_dates)
    for (const level of courseFormGroup.levelGrop) {
      for (const course of courseFormGroup.course_dates) {
        if (level.active) {
          const group = { ...level, degree_id: level.id, subgroups: [] }
          for (const subgroup of [].constructor(level.Subgrupo))
            group.subgroups.push({ degree_id: level.id, max_participants: level.max_participants })
          course.course_groups.push(group)
          if (course.groups) course.groups.push(group)
        }
      }
    }
    if (!courseFormGroup.options) delete courseFormGroup.options;
    this.mode === "create" ?
      this.crudService.create('/admin/courses', courseFormGroup).subscribe((data) => {
        if (data.success) this.router.navigate(["/courses/detail/" + data.data.id])
      }) :
      this.crudService.update('/admin/courses', courseFormGroup, this.id).subscribe((data) => {
        if (data.success) this.router.navigate(["/courses/detail/" + data.data.id])
      })
  }

  getNumberArray = (num: number): any[] => ['intervalo', ...Array.from({ length: num }, (_, i) => `${i + 1}`)];;

  generarIntervalos = (personas: number, intervalo: number, duracion: string[]): any[] => {
    const resultado = [];
    for (let i = 0; i < intervalo; i++) {
      const obj = { intervalo: duracion[i] };
      for (let j = 1; j <= personas; j++) obj[j] = null
      resultado.push(obj);
    } return resultado;
  }
  addCategory = () => this.courses.courseFormGroup.controls['settings'].value.groups.push({ ...this.courses.default_activity_groups })
  addCourseDate = () => this.courses.courseFormGroup.controls['course_dates'].value.push({ ...this.courses.default_course_dates })

}
