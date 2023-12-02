import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { Observable, map, startWith } from 'rxjs';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { LEVELS } from 'src/app/static-data/level-data';
import { MOCK_MONITORS } from 'src/app/static-data/monitors-data';
import { ApiCrudService } from 'src/service/crud.service';

@Component({
  selector: 'vex-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss'],
  animations: [fadeInUp400ms, stagger20ms]
})
export class CourseDetailComponent implements OnInit {
  imagePath = 'https://school.boukii.com/assets/icons/collectif_ski2x.png';
  imagePathPrivate = 'https://school.boukii.com/assets/icons/prive_ski2x.png';
  userAvatar = 'https://school.boukii.online/assets/icons/icons-outline-default-avatar.svg';

  mode: 'create' | 'update' = 'update';
  today = new Date();
  form: UntypedFormGroup;
  monitorsForm = new FormControl();

  filteredMonitors: Observable<any[]>;

  durations: string[] = [];

  groupedByColor = {};
  colorKeys: string[] = []; // Aquí almacenaremos las claves de colores

  mockLevels = LEVELS;
  mockMonitors = MOCK_MONITORS;
  user: any;
  id: any;

  defaults: any = {
    course_type: null,
    is_flexible: false,
    name: null,
    short_description: null,
    description: null,
    price: null,
    currency: 'CHF',
    date_start: null,
    date_end: null,
    date_start_res: null,
    date_end_res: null,
    confirm_attendance: false,
    active: true,
    online: true,
    image: null,
    translations: null,
    price_range: null,
    discounts: null,
    settings: {
      weekDays: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      }
    },
    sport_id: null,
    school_id: null,
    station_id: null,
    max_participants: null,
    duration: null,
    hour_min: null,
    hour_max: null,
    min_age: null,
    max_age: null,
    course_dates: []
  };

  defaults_course_date = {
    date: null,
    hour_start: null,
    hour_end: null,
  }

  defaults_groups = {
    course_id: null,
    course_date_id: null,
    degree_id: null,
    age_min: null,
    age_max: null,
    recommended_age: null,
    teachers_min: null,
    teachers_max: null,
    observations: null,
    auto: null
  }

  defaults_subgroups = {
    course_id: null,
    course_date_id: null,
    degree_id: null,
    course_group_id: null,
    monitor_id: null,
    max_participants:null,
  }

  loading: boolean = true;

  //NIVELES
  daySelectedIndex: any = 0;
  subGroupSelectedIndex: any = 0;
  selectedDate: string;
  selectedItem: any;
  daysDates = [];
  daysDatesLevels = [];
  levels = [];
  rangeForm: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder, private crudService: ApiCrudService, private activatedRoute: ActivatedRoute, private router: Router) {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
    this.id = this.activatedRoute.snapshot.params.id;

    this.generateDurations();
    this.mockLevels.forEach(level => {
      if (!this.groupedByColor[level.color]) {
        this.groupedByColor[level.color] = [];
      }
      this.groupedByColor[level.color].push(level);
    });

    this.colorKeys = Object.keys(this.groupedByColor);

    this.rangeForm = this.fb.group({
      minAge: ['', [Validators.required, Validators.min(3)]],
      maxAge: ['', [Validators.required, Validators.max(80)]]
    }, { validator: this.ageRangeValidator });
  }

  ageRangeValidator(group: UntypedFormGroup): { [key: string]: any } | null {
    const minAge = group.get('minAge').value;
    const maxAge = group.get('maxAge').value;
    return minAge && maxAge && minAge < maxAge ? null : { 'ageRange': true };
  }

  get minAge() {
    return this.rangeForm.get('minAge');
  }

  get maxAge() {
    return this.rangeForm.get('maxAge');
  }

  ngOnInit() {

    this.crudService.get('/admin/courses/'+this.id)
      .subscribe((data) => {
        this.defaults = data.data;
        this.getSeparatedDates(this.defaults.course_dates, true);
        this.loading = false;

      })

  }


  generateDurations() {
    let minutes = 15;
    const maxMinutes = 7 * 60; // 7 horas en minutos

    while (minutes <= maxMinutes) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      const durationString = `${hours ? hours + 'h ' : ''}${remainingMinutes}min`;
      this.durations.push(durationString);

      minutes += 15;
    }
  }

  displayFnMoniteurs(monitor: any): string {
    return monitor && monitor.full_name ? monitor.full_name : '';
  }

  private _filterMonitor(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.mockMonitors.filter(monitor => monitor.full_name.toLowerCase().includes(filterValue));
  }

  parseDateToDay(date:any, inFormat: string, format: string) {
    return moment(date, inFormat).format(format);
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }



  //NIVELES

  getDegrees() {
    this.groupedByColor = {};
    this.colorKeys= [];
    this.crudService.list('/degrees', 1, 1000,'asc', 'degree_order', '&school_id=' + this.user.schools[0].id + '&sport_id='+ this.defaults.sport_id)
      .subscribe((data) => {

        data.data.forEach(element => {
          if(element.active) {
            this.levels.push(element);

          }
        });
        this.levels.reverse().forEach(level => {
          if (!this.groupedByColor[level.color]) {
            this.groupedByColor[level.color] = [];
          }
          level.active = false;


          this.defaults.course_dates.forEach(cs => {
            cs.groups.forEach(group => {
              if (group.degree_id === level.id) {
                level.active = true;
                level.old = true;
              }
            });
          });
          this.selectedItem = this.daysDatesLevels[0].dateString;
          this.groupedByColor[level.color].push(level);
        });

        this.colorKeys = Object.keys(this.groupedByColor);
      })
  }

  generateGroups(level: any) {
    let ret = {};
    this.levels.forEach(element => {
      if (element.id === level.id){
        ret = {
          course_id: null,
          course_date_id: null,
          degree_id: element.id,
          age_min: null,
          age_max: null,
          recommended_age: null,
          teachers_min: null,
          teachers_max: null,
          observations: null,
          auto: null,
          subgroups: []
        }
      }

    });

    return ret;
  }

  activeGroup(event: any, level: any) {

    this.selectedItem = this.daysDatesLevels[0].dateString;
    this.selectedDate = this.defaults.course_dates[0]?.date;
    level.active = event.source.checked;


    if(event.source.checked) {
      this.defaults.course_dates.forEach(element => {
        element.groups.push(this.generateGroups(level));
      });

      this.defaults.course_dates.forEach(element => {
        element.groups.forEach(group => {
          if (group.degree_id === level.id) {
            group.active = event.source.checked;
            group.subgroups.push({
              degree_id: level.id,
              monitor_id: null,
              max_participants:null
            })
          }

        });
      });
    } else {
      // eliminar el curso o desactivarlo

      this.defaults.course_dates.forEach((element) => {
        element.groups.forEach((group, idx) => {
          if (group.degree_id === level.id) {
            element.groups.splice(idx, 1);

          }
        });
      });


    }

  }

  addSubGroup(level: any) {
    this.defaults.course_dates.forEach(element => {
      element.groups.forEach(group => {
        if (level.id === group.degree_id) {
          group.subgroups.push({
            degree_id: level.id,
            monitor_id: null,
            max_participants:null
          })
        }

      });
    });
  }

  readSubGroups(levelId: number) {

    let ret = [];
    this.defaults.course_dates[0].groups.forEach((group) => {
      if (group.degree_id === levelId) {
        ret = group.subgroups;
      }
    });

    return ret;
  }

  setLevelTeacher(event: any, level: any) {
    this.defaults.course_dates.forEach(element => {
      element.groups.forEach(group => {
        if (level.id === group.degree_id) {
          group.teachers_min = event.value.id;
        }

      });
    });
  }

  setMinAge(event: any, level: any) {
    if (+event.target.value > 3) {

      this.defaults.course_dates.forEach(element => {
        element.groups.forEach(group => {
          if (level.id === group.degree_id) {
            group.age_min = +event.target.value;
          }

        });
      });
    }
  }

  setMaxAge(event: any, level: any) {
    if (+event.target.value < 81) {
      this.defaults.course_dates.forEach(element => {
        element.groups.forEach(group => {
          if (level.id === group.degree_id) {
            group.age_max = +event.target.value;
          }

        });
      });
    }
  }

  getMonitorValue(level: any, subGroupIndex: number, daySelectedIndex: number) {

    let ret = null;
    if(!level.old) {
      this.defaults.course_dates.forEach(courseDate => {

          if (moment(courseDate.date,'YYYY-MM-DD').format('YYYY-MM-DD') === moment(this.selectedDate,'YYYY-MM-DD').format('YYYY-MM-DD')) {
            courseDate.groups.forEach(group => {
              if (group.degree_id === level.id) {
                  ret = group.subgroups[subGroupIndex]?.monitor;
              }
            });
          }
        });

        } else {
          this.defaults.course_dates[daySelectedIndex].groups.forEach(group => {
            if (group.degree_id === level.id) {
              ret = group.subgroups[subGroupIndex]?.monitor.first_name + ' ' + group.subgroups[subGroupIndex]?.monitor.last_name;
            }

          });
        }


      return ret;
    }

    calculateMonitorLevel(level: any) {
      let ret = 0;
      this.defaults.course_dates.forEach(courseDate => {
        courseDate.groups.forEach(group => {
          if (level.id === group.degree_id) {
            ret = level;
          }
        });
      });

      return ret;
    }

    calculateSubGroupPaxes(level: any) {
      let ret = 0;

      this.defaults.course_dates.forEach(element => {
        element.groups.forEach(group => {
          if (level.id === group.degree_id) {
            group.subgroups.forEach(subgroup => {

              ret = ret + subgroup.max_participants;
            });
          }

        });
      });

      return ret;
    }

  setSubGroupMonitor(event: any, monitor: any, level: any, subGroupSelectedIndex: number, daySelectedIndex: number) {

    let monitorSet = false;
    if (event.isUserInput) {

      if (!level.old) {
        this.defaults.course_dates.forEach(courseDate => {
          if (moment(courseDate.date,'YYYY-MM-DD').format('YYYY-MM-DD') === moment(this.selectedDate,'YYYY-MM-DD').format('YYYY-MM-DD')) {
            courseDate.groups.forEach(group => {
              if(group.degree_id === level.id && !monitorSet) {

                group.subgroups[subGroupSelectedIndex].monitor_id = monitor.id;
                group.subgroups[subGroupSelectedIndex].monitor = monitor.first_name + ' ' + monitor.last_name;
                monitorSet = true;
              }
            });
          }
        });
      } else {
        this.defaults.course_dates[daySelectedIndex].groups.forEach(group => {
          if (group.degree_id === level.id) {
            group.subgroups[subGroupSelectedIndex].monitor = monitor;
          }

        });
      }

    }
  }

  setSubGroupPax(event: any, level: any) {
    level.max_participants = +event.target.value;

    this.defaults.course_dates.forEach(element => {
      element.groups.forEach(group => {
        if (level.id === group.degree_id) {
          group.subgroups.forEach(subGroup => {
            subGroup.max_participants = +event.target.value;
          });
        }
      });
    });
  }

  selectItem(item: any, index: any, subGroupIndex: any) {
    this.subGroupSelectedIndex = null;
    this.selectedItem = item.dateString;
    this.selectedDate = item.date;
    this.daySelectedIndex = index;
    this.subGroupSelectedIndex = subGroupIndex;
  }

  calculateAgeMin(level: any) {
    let ret = 0;
    this.defaults.course_dates.forEach(courseDate => {
      courseDate.groups.forEach(group => {
        if (level.id === group.degree_id) {
          ret = group.age_min;
        }
      });
    });

    return ret;
  }

  calculateAgeMax(level: any) {
    let ret = 0;
    this.defaults.course_dates.forEach(courseDate => {
      courseDate.groups.forEach(group => {
        if (level.id === group.degree_id) {
          ret = group.age_max;
        }
      });
    });

    return ret;
  }

  getSeparatedDates(dates: any, onLoad: boolean = false) {

    this.daysDates = [];
    this.daysDatesLevels = [];

    if (this.mode === 'create') {

      this.defaults.course_dates = [];
    }

    dates.forEach(element => {

      if (!onLoad) {
        const hour = element.hour;
        const duration = element.duration;
        const [hours, minutes] = duration.split(' ').reduce((acc, part) => {
          if (part.includes('h')) {
            acc[0] = parseInt(part, 10);
          } else if (part.includes('min')) {
            acc[1] = parseInt(part, 10);
          }
          return acc;
        }, [0, 0]);

        this.daysDatesLevels.push({date: moment(element.date, 'DD-MM-YYYY').format('YYYY-MM-DD'), dateString: moment(element.date, 'DD-MM-YYYY').locale('es').format('LLL').replace(' 0:00', '')});
        if (this.defaults.course_type === 2) {

          this.defaults.course_dates.push({
            date: moment(element.date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
            hour_start: element.hour,
            hour_end: moment(hour, "HH:mm").add(hours, 'hours').add(minutes, 'minutes').format("HH:mm")
          })
        } else {

          this.defaults.course_dates.push({
            date: moment(element.date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
            hour_start: element.hour,
            hour_end: moment(hour, "HH:mm").add(hours, 'hours').add(minutes, 'minutes').format("HH:mm"),
            groups: []
          })
        }
      } else {
        this.daysDatesLevels.push({date: moment(element.date, 'YYYY-MM-DD').format('YYYY-MM-DD'), dateString: moment(element.date, 'YYYY-MM-DD').locale('es').format('LLL').replace(' 0:00', '')});
      }

    });
    this.getDegrees();

  }
}
