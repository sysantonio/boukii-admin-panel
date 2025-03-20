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
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'vex-courses-create-update',
  templateUrl: './courses-create-update.component.html',
  styleUrls: ['./courses-create-update.component.scss',],
  animations: [fadeInUp400ms, stagger20ms]
})
export class CoursesCreateUpdateComponent implements OnInit {
  dataSource: any;
  editingIndex: number | null = null;

  ModalFlux: number = +this.activatedRoute.snapshot.queryParamMap['params'].step || 0
  ModalProgress: { Name: string, Modal: number }[] = [
    { Name: "sport", Modal: 0 },
    { Name: "details", Modal: 1 },
    { Name: "dates", Modal: 2 },
    { Name: "details", Modal: 3 },
    { Name: "extras", Modal: 4 },
    { Name: "langs", Modal: 5 },
  ]
  Translate: { Code: string, Name: string }[] = [
    { Code: "fr", Name: "French" },
    { Code: "de", Name: "German" },
    { Code: "en", Name: "English" },
    { Code: "it", Name: "Italian" },
    { Code: "es", Name: "Spanish" },
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
  editModal: boolean = false
  editFunctionName: string | null = null;
  editFunctionArgs: any[] = [];

  setEditFunction(functionName: string, ...args: any[]) {
    this.editFunctionName = functionName;
    this.editFunctionArgs = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
  }

  executeEditFunction() {
    if (this.editFunctionName && typeof this[this.editFunctionName] === 'function') {
      this[this.editFunctionName](...this.editFunctionArgs);
    }
    this.editModal = false;
  }

  translateExpandedIndex: number = 0
  user: any;
  id: any = null;

  constructor(private fb: UntypedFormBuilder, public dialog: MatDialog,
              private crudService: ApiCrudService, private activatedRoute: ActivatedRoute,
              public router: Router, private schoolService: SchoolService,
    public translateService: TranslateService,
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
    forkJoin(
      this.mode === "update" ?
        {
          sports: this.getSports(),
          stations: this.getStations(),
          monitors: this.getMonitors(),
        } : {
          sports: this.getSports(),
          stations: this.getStations(),
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
            setTimeout(() => this.loading = false, 0);
          } else {
            this.monitors = monitors
            this.crudService.get('/admin/courses/' + this.id,
              ['courseGroups.degree', 'courseGroups.courseDates.courseSubgroups.bookingUsers.client', 'sport'])
              .subscribe((data: any) => {
                this.detailData = data.data
                this.detailData.station = this.detailData.station || null;

                // Convertimos los extras de settings en un formato estándar
                const formattedSettingsExtras = this.extras.map(extra => ({
                  id: extra.id,
                  name: extra.name,
                  product: extra.product,
                  price: parseFloat(extra.price), // Aseguramos que el precio sea numérico
                  tva: extra.tva,
                  status: extra.status,
                  active: false // Por defecto, los extras de settings no están activos
                }));

// Convertimos los extras de course_extras al mismo formato y los marcamos como activos
                const formattedCourseExtras = this.detailData.course_extras.map(extra => ({
                  id: extra.id.toString(), // Convertimos el id en string para evitar conflictos de comparación
                  name: extra.name,
                  product: extra.name, // Ajusta esto según corresponda si hay otros tipos
                  price: parseFloat(extra.price),
                  tva: 0, // Si no tienes el dato en course_extras, lo dejamos en 0
                  status: true,
                  active: true // Los extras del curso deben estar activos
                }));

// Unimos ambos arrays sin repetir basándonos en el id y el nombre
                const mergedExtras = [...formattedSettingsExtras, ...formattedCourseExtras].reduce((acc, extra) => {
                  if (!acc.some(e => e.id === extra.id || e.product === extra.product)) {
                    acc.push(extra);
                  }
                  return acc;
                }, []);

                this.extras = mergedExtras;

                if(this.detailData?.settings?.periods?.length > 1){
                  this.PeriodoFecha = 0;
                }

                this.courses.settcourseFormGroup(this.detailData);
                this.courses.courseFormGroup.patchValue({ extras: formattedCourseExtras });
                this.getDegrees();
                setTimeout(() => this.loading = false, 0);
/*                this.crudService.list('/stations', 1, 10000, 'desc', 'id', '&school_id=' + this.detailData.school_id)
                  .subscribe((st: any) => {
                    st.data.forEach((element: any) => {
                      if (element.id === this.detailData.station_id) this.detailData.station = element
                    });
                    //this.extras.push(...this.detailData.extras)
                    //this.crudService.list('/booking-users', 1, 10000, 'desc', 'id', '&school_id=' + this.detailData.school_id + '&course_id=' + this.detailData.id)
                    //  .subscribe((bookingUser) => {
                    //    this.detailData.users = [];
                    //    this.detailData.users = bookingUser.data;
                    //  })
                    this.courses.settcourseFormGroup(this.detailData)
                    this.getDegrees()
                    setTimeout(() => this.loading = false, 0);
                  })*/
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
    const formData = this.extrasFormGroup.getRawValue();
    formData.id = formData.id || "aFOR-" + formData.name + formData.product + formData.price;

    if (this.editingIndex !== null) {
      this.extras[this.editingIndex] = formData; // Actualiza el extra en lugar de crear uno nuevo
    } else {
      this.extras.push(formData); // Agrega un nuevo extra
    }

    this.extrasModal = false;
    this.resetExtraForm();
  }

  resetExtraForm() {
    this.extrasFormGroup.reset({
      id: "",
      product: "",
      name: "",
      price: 1,
      tva: 21,
      status: true,
    });
    this.editingIndex = null;
  }

  editExtra(index: number) {
    this.editingIndex = index;
    this.extrasFormGroup.setValue(this.extras[index]);
    this.extrasModal = true;
  }

  getSportsType = () => this.crudService.list('/sport-types', 1, 1000).pipe(map(data => data.data));
  getMonitors = () => this.crudService.list('/monitors', 1, 10000, 'desc', 'id', '&school_id=' + this.user.schools[0].id).pipe(map(data => data.data));
  getSports = () => this.crudService.list('/school-sports', 1, 10000, 'desc', 'id', '&school_id=' + this.user.schools[0].id, null, null, null, ['sport']).pipe(map(sport => sport.data));

  getStations = () => this.crudService.list('/stations-schools', 1, 10000, 'desc', 'id', '&school_id=' + this.user.schools[0].id).pipe(
    map(station => station.data),
    mergeMap(stations => forkJoin(stations.map((element: any) => this.crudService.get('/stations/' + element.station_id).pipe(map(data => data.data)))))
  );

  getDegrees = () => this.crudService.list('/degrees', 1, 10000, 'asc', 'degree_order', '&school_id=' + this.courses.courseFormGroup.controls['school_id'].value + '&sport_id=' + this.courses.courseFormGroup.controls['sport_id'].value).subscribe((data) => {
    this.detailData.degrees = [];
    data.data.forEach((element: any) => {
      if (element.active) this.detailData.degrees.push({ ...element, }); //Subgrupo: this.getSubGroups(element.id)
    });
    const levelGrop = []


    if (this.detailData.course_dates && Array.isArray(this.detailData.course_dates)) {
      this.detailData.degrees.forEach((level: any) => {
        level.active = false;

        this.detailData.course_dates.forEach((cs: any) => {
          if (cs.course_groups && Array.isArray(cs.course_groups)) {
            cs.course_groups.forEach((group: any) => {
              if (group.degree_id === level.id) {
                level.active = true;
                level.old = true;
                group.age_min = level.age_min;
                group.age_max = level.age_max;

                if (group.course_subgroups && Array.isArray(group.course_subgroups) && group.course_subgroups.length > 0) {
                  level.max_participants = group.course_subgroups[0].max_participants;
                  level.course_subgroups = group.course_subgroups;
                }

                level.visible = false;
              }
            });
          }
        });

        levelGrop.push({ ...level });
      });

      levelGrop.sort((a: any) => (a.active ? -1 : 1));
    }

    this.courses.courseFormGroup.patchValue({ levelGrop });
  });

  Confirm(add: number) {
    this.courses.courseFormGroup.markAsUntouched()
    if ( this.courses.courseFormGroup.controls['course_type'].value === 2 &&
      !this.courses.courseFormGroup.controls['is_flexible'].value && this.ModalFlux === 2) {
      add = add + 1;
    }
    this.ModalFlux += add
    if (this.ModalFlux === 1) {
      if (!this.courses.courseFormGroup.controls["course_type"].value) this.courses.courseFormGroup.patchValue({ course_type: 1 })
      this.courses.courseFormGroup.patchValue({
        icon: this.sportData.find((a: any) => a.sport_id === this.courses.courseFormGroup.controls['sport_id'].value).sport.icon_unselected
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
        if (this.mode === 'create') {

          setTimeout(async () => {
            const languages = ['fr', 'en', 'de', 'es', 'it'];
            const { name, short_description, description } = this.courses.courseFormGroup.controls;
            const translations: any = {};
            try {
              const translationResults = await Promise.allSettled(
                languages.map(async (lang) => {
                  try {
                    const translatedName = await this.crudService.translateText(name.value, lang.toUpperCase()).toPromise();
                    const translatedShortDescription = await this.crudService.translateText(short_description.value, lang.toUpperCase()).toPromise();
                    const translatedDescription = await this.crudService.translateText(description.value, lang.toUpperCase()).toPromise();

                    return {
                      lang,
                      name: translatedName?.data?.translations?.[0]?.text || name.value,
                      short_description: translatedShortDescription?.data?.translations?.[0]?.text || short_description.value,
                      description: translatedDescription?.data?.translations?.[0]?.text || description.value,
                    };
                  } catch (error) {
                    console.error(`Error translating to ${lang}:`, error);
                    return null; // Retorna null en caso de error para que no rompa el flujo
                  }
                })
              );

              // Filtramos los resultados exitosos y asignamos las traducciones
              const translations: Record<string, any> = {};
              translationResults.forEach((result) => {
                if (result.status === "fulfilled" && result.value) {
                  translations[result.value.lang] = {
                    name: result.value.name,
                    short_description: result.value.short_description,
                    description: result.value.description,
                  };
                }
              });

              this.courses.courseFormGroup.patchValue({ translations });

            } catch (error) {
              console.error("Unexpected error in translation process:", error);
            }
          }, 1000);
        }
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

  async translateCourse(lang: string): Promise<void> {
    try {
      const translations = this.courses.courseFormGroup.controls['translations'].value || {};
      const currentTranslation = translations[lang] || {};

      const translatedName = await this.crudService.translateText(currentTranslation.name || this.courses.courseFormGroup.value.name, lang.toUpperCase()).toPromise();
      const translatedShortDescription = await this.crudService.translateText(currentTranslation.short_description || this.courses.courseFormGroup.value.short_description, lang.toUpperCase()).toPromise();
      const translatedDescription = await this.crudService.translateText(currentTranslation.description || this.courses.courseFormGroup.value.description, lang.toUpperCase()).toPromise();

      // Actualizar solo los valores traducidos sin afectar los demás idiomas
      this.courses.courseFormGroup.patchValue({
        translations: {
          ...translations,
          [lang]: {
            name: translatedName?.data?.translations?.[0]?.text || currentTranslation.name,
            short_description: translatedShortDescription?.data?.translations?.[0]?.text || currentTranslation.short_description,
            description: translatedDescription?.data?.translations?.[0]?.text || currentTranslation.description,
          },
        },
      });

    } catch (error) {
      console.error(`Error translating to ${lang}:`, error);
    }
  }

  find = (array: any[], key: string, value: string | boolean) => array.find((a: any) => value ? a[key] === value : a[key])
  filter = (array: any[], key: string, value: string | boolean) => array.filter((a: any) => value ? a[key] === value : a[key])

  selectLevel = (event: any, i: number) => {
    const levelGrop = this.courses.courseFormGroup.controls['levelGrop'].value
    const course_dates = this.courses.courseFormGroup.controls['course_dates'].value
    levelGrop[i].active = event.target.checked
    if (event.target.checked) {
/*      levelGrop[i].age_min = this.courses.courseFormGroup.controls['age_min'].value
      levelGrop[i].age_max = this.courses.courseFormGroup.controls['age_max'].value*/
      levelGrop[i].max_participants = this.courses.courseFormGroup.controls['max_participants'].value
      for (const course of course_dates) {
        if (this.mode === "create") {
          course.course_groups = [...course.course_groups, { ...levelGrop[i], degree_id: levelGrop[i].id, course_subgroups: [] }]
          course.groups = [...course.groups, { ...levelGrop[i], degree_id: levelGrop[i].id, subgroups: [] }]
        }
        else {
          course.course_groups = [...course.course_groups, { ...levelGrop[i], degree_id: levelGrop[i].id, course_id: this.courses.courseFormGroup.controls['id'].value, course_subgroups: [] }]
        }
      }
    } else {
      for (const course of course_dates) {
        course.course_groups = course.course_groups.filter((a: any) => a.id !== levelGrop[i].id)
        if (this.mode === "create") course.groups = course.groups.filter((a: any) => a.id !== levelGrop[i].id)
      }
    }
    this.courses.courseFormGroup.patchValue({ levelGrop, course_dates })
    if (event.target.checked) this.addLevelSubgroup(levelGrop[i], 0, true)
  }

  addLevelSubgroup = (level: any, j: number, add: boolean) => {
    const course_dates = this.courses.courseFormGroup.controls['course_dates'].value.map((course: any) => {
      // Verificamos en course_groups
      for (const group in course.course_groups) {
        if (course.course_groups[group].degree_id === level.id) {
          if (add) {
            if (this.mode === "create") {
              course.groups[group].subgroups = [
                ...course.groups[group].subgroups,
                { degree_id: level.id, max_participants: level.max_participants, monitor: null, monitor_id: null }
              ];
            }
            course.course_groups[group].course_subgroups = [
              ...course.course_groups[group].course_subgroups,
              { degree_id: level.id, max_participants: level.max_participants, monitor: null, monitor_id: null }
            ];
          } else {
            if (this.mode === "create") {
              course.groups[group].subgroups = course.groups[group].subgroups.filter((_, index: number) => index !== j);
            }
            course.course_groups[group].course_subgroups = course.course_groups[group].course_subgroups.filter((_, index: number) => index !== j);
          }
        }
      }

      // Eliminamos también en course_subgroups del propio course_date
      if (!add && course.course_subgroups) {
        course.course_subgroups = course.course_subgroups.filter((_, index: number) => index !== j);
      }

      return course; // Retornamos el course modificado
    });

    this.courses.courseFormGroup.patchValue({ course_dates });
  };

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

  setModalProgress() {
    const courseFormGroup = this.courses.courseFormGroup.getRawValue()
    if (courseFormGroup.course_type === 1) {
      this.ModalProgress = [
         { Name: "sport", Modal: 0 },
        { Name: "data", Modal: 1 },
        { Name: "dates", Modal: 2 },
        { Name: "levels", Modal: 3 },
        { Name: "extras", Modal: 4 },
        { Name: "langs", Modal: 5 },
      ];
    } else if (courseFormGroup.course_type === 2) {
      this.ModalProgress = [
        { Name: "sport", Modal: 0 },
        { Name: "data", Modal: 1 },
        { Name: "dates", Modal: 2 },
      ];
      if (courseFormGroup.is_flexible) {
        this.ModalProgress.push({ Name: "details", Modal: 3 });
        this.ModalProgress.push({ Name: "extras", Modal: 4 });
        this.ModalProgress.push({ Name: "langs", Modal: 5 });
      } else {
        this.ModalProgress.push({ Name: "extras", Modal: 4 });
        this.ModalProgress.push({ Name: "langs", Modal: 5 });
      }
    }
  }

  endCourse() {
    const courseFormGroup = this.courses.courseFormGroup.getRawValue()
    if (courseFormGroup.course_type === 1 && courseFormGroup.course_dates && courseFormGroup.levelGrop) {
      courseFormGroup.course_dates.forEach((courseDate: any) => {
        if (courseDate.course_groups) {
          courseDate.course_groups.forEach((group: any) => {
            // Buscar en levelGrop el que tenga el mismo degree_id que el id del grupo
            const matchingLevel = courseFormGroup.levelGrop.find((level: any) => level.id === group.degree_id);

            if (matchingLevel) {
              // Asignar los valores de age_min y age_max del levelGrop al grupo
              group.age_min = parseInt(matchingLevel.age_min);
              group.age_max = parseInt(matchingLevel.age_max);
            }
          });
        }
      });
    }
    courseFormGroup.translations = JSON.stringify(this.courses.courseFormGroup.controls['translations'].value)
    courseFormGroup.course_type === 1 ? delete courseFormGroup.settings : courseFormGroup.settings = this.courses.courseFormGroup.controls['settings'].value
    if (this.mode === "create") {
      this.crudService.create('/admin/courses', courseFormGroup).subscribe((data) => {
        if (data.success) this.router.navigate(["/courses/detail/" + data.data.id])
      })
    } else {
      this.crudService.update('/admin/courses', courseFormGroup, this.id).subscribe((data) => {
        if (data.success) this.router.navigate(["/courses/detail/" + data.data.id])
      })
    }
  }

  getNumberArray = (num: number): any[] => ['intervalo', ...Array.from({ length: num }, (_, i) => `${i + 1}`)];

  generarIntervalos = (personas: number, intervalo: number, duracion: string[]): any[] => {
    const resultado = [];
    for (let i = 0; i < intervalo; i++) {
      const obj = { intervalo: duracion[i] };
      for (let j = 1; j <= personas; j++) obj[j] = null
      resultado.push(obj);
    } return resultado;
  }

  addCategory = () => this.courses.courseFormGroup.controls['settings'].value.groups.push({ ...this.courses.default_activity_groups })

  addCourseDate = () => {
    const course_date = this.courses.courseFormGroup.controls['course_dates'].value
    const data = JSON.parse(JSON.stringify(course_date[course_date.length - 1]))
    delete data.id
    const newDate = new Date(course_date[course_date.length - 1].date);
    newDate.setDate(newDate.getDate() + 1);
    course_date.push({ ...data, date: newDate })
    this.courses.courseFormGroup.patchValue({ course_dates: course_date })
  }

  monitorSelect(event: any, level: any, j: number) {
    let course_dates = this.courses.courseFormGroup.controls['course_dates'].value
    course_dates[event.i].course_groups[course_dates[event.i].course_groups.findIndex((a: any) => a.degree_id === level.id)].course_subgroups[j].monitor = event.monitor
    course_dates[event.i].course_groups[course_dates[event.i].course_groups.findIndex((a: any) => a.degree_id === level.id)].course_subgroups[j].monitor_id = event.monitor.id
    this.courses.courseFormGroup.patchValue({ course_dates })
  }
  deleteCourseDate(i: number) {
    this.courses.courseFormGroup.controls['course_dates'].value.splice(i, 1)
  }
}
