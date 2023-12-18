import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { Observable, map, startWith } from 'rxjs';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { LEVELS } from 'src/app/static-data/level-data';
import { MOCK_MONITORS } from 'src/app/static-data/monitors-data';
import { ApiCrudService } from 'src/service/crud.service';
import { CourseUserTransferComponent } from '../course-user-transfer/course-user-transfer.component';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmModalComponent } from '../../monitors/monitor-detail/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'vex-course-detail-modal',
  templateUrl: './course-detail-modal.component.html',
  styleUrls: ['./course-detail-modal.component.scss'],
  animations: [fadeInUp400ms, stagger20ms]
})
export class CourseDetailModalComponent implements OnInit {
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
  subGroupSelectedItemDate: any;
  subGroupSelectedIndex: any = 0;
  selectedDate: string;
  selectedItem: any;
  daysDates = [];
  daysDatesLevels = [];
  monitors = [];
  levels = [];
  courseUsers = [];
  clients = [];
  schoolSports: any = [];
  countries = MOCK_COUNTRIES;
  rangeForm: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder, private crudService: ApiCrudService, private activatedRoute: ActivatedRoute, private router: Router, private dialog: MatDialog,
    private snackbar: MatSnackBar, private cdr: ChangeDetectorRef, @Inject(MAT_DIALOG_DATA) public externalData: any) {

    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
    this.id = this.externalData.id;

    this.generateDurations();
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

    this.getClients();
    this.getMonitors();

    this.crudService.get('/admin/courses/'+this.id)
      .subscribe((data) => {
        this.defaults = data.data;
        this.getStations();

        this.getSeparatedDates(this.defaults.course_dates, true);

        this.crudService.list('/booking-users', 1, 1000, 'desc', 'id', '&course_id='+this.defaults.id)
            .subscribe((result) => {
              this.courseUsers = result.data;
              this.loading = false;

            })

      })

  }

  getStations() {
    this.crudService.list('/stations', 1, 1000,  'desc', 'id', '&school_id=' + this.user.schools[0].id)
      .subscribe((st) => {
        st.data.forEach(element => {
          if (element.id === this.defaults.station_id) {
            this.defaults.station = element;
          }
        });
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
    return monitor && monitor.first_name && monitor.last_name ? monitor.first_name + ' ' + monitor.last_name : '';
  }

  parseDateToDay(date:any, inFormat: string, format: string) {
    return moment(date, inFormat).format(format);
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }

  openUserTransfer(group, subgroup, subgroupNumber) {
    const dialogRef = this.dialog.open(CourseUserTransferComponent, {
      width: '800px',
      height: '800px',
      maxWidth: '100vw',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales
      data: {group: group, subgroup: subgroup, colorKeys: this.colorKeys, groupedByColor: this.groupedByColor, id: this.id, subgroupNumber: subgroupNumber, currentDate: this.subGroupSelectedItemDate}
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {

      }
    });
  }

  deleteSubGroup(subgroup) {
    if (subgroup.booking_users.length < 0) {
      const dialogRef = this.dialog.open(ConfirmModalComponent, {
        maxWidth: '100vw',  // Asegurarse de que no haya un ancho máximo
        panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales,
        data: {message: 'Do you want to remove this subgroup? This action will be permanetly', title: 'Delete subgroup'}
      });

      dialogRef.afterClosed().subscribe((data: any) => {
        if (data) {
          this.crudService.delete('/course-subgroups', subgroup.id)
            .subscribe(() => {
              this.snackbar.open('Grupo eliminado correctamente', 'OK', {duration: 3000})
            })
        }
      });
    } else {
      this.snackbar.open('Este subgrupo tiene reserva asociadas y no puede ser eliminado', 'OK', {duration: 3000});
    }

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
        this.levels.forEach(level => {
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
              level.visible = false;
            });
          });
          this.selectedItem = this.daysDatesLevels[0].dateString;
          this.subGroupSelectedItemDate = moment(this.daysDatesLevels[0].date);
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

  hasMonitorAssigned(date, level) {

    const courseDate = this.defaults.course_dates.find((c) => moment(c.date, 'YYYY-MM-DD').format('YYYY-MM-DD') === date.date);
    const group = courseDate.groups.find((c) => c.course_date_id === courseDate.id && c.degree_id === level.id);

    if (group) {
      const find = group.subgroups.find((c) => c.course_date_id === courseDate.id);
      return find && find.monitor_id !== null;

    }
  }

  activeGroup(event: any, level: any) {

    if(event.source.checked) {
      this.selectedItem = this.daysDatesLevels[0].dateString;
      this.selectedDate = this.defaults.course_dates[0]?.date;
      level.active = event.source.checked;
      level.visible = event.source.checked;

      this.defaults.course_dates.forEach(element => {
        element.groups.push(this.generateGroups(level));
      });

      this.defaults.course_dates.forEach(element => {
        let prevGroup: any = {};
        element.groups.forEach(group => {
          if (group.degree_id === level.id) {
            group.active = event.source.checked;
            group.degree_id = level.id;
            group.course_date_id = prevGroup.course_date_id;
            group.course_id = prevGroup.course_id;
            group.subgroups.push({
              degree_id: level.id,
              monitor_id: null,
              max_participants:null
            })
          } else {
            prevGroup = {
              course_date_id: group.course_date_id,
              course_id: group.course_id,
            }
          }

        });
      });
    } else {
      // eliminar el curso o desactivarlo

      let hasBookings = false;
      const groupsToDelete = [];
      this.defaults.course_dates.forEach(element => {
        element.groups.forEach(group => {
          if (group.degree_id === level.id) {
            groupsToDelete.push(group.id)
          }
        });
      });

      groupsToDelete.forEach(element => {
        if (!hasBookings) {
          this.defaults.course_dates.forEach(cs => {
            cs.groups.forEach(gs => {
              if (gs.degree_id === level.id) {

                if (groupsToDelete.find((g) => g === gs.id)) {
                  gs.subgroups.forEach(sgs => {
                    if (sgs.booking_users.length > 0) {
                      hasBookings = true;
                    }
                  });
                }
              }
            });
          });
        }

      });

      if (!hasBookings) {
        const dialogRef = this.dialog.open(ConfirmModalComponent, {
          maxWidth: '100vw',  // Asegurarse de que no haya un ancho máximo
          panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales,
          data: {message: 'Do you want to remove this group? This action will be permanetly', title: 'Delete group'}
        });

        dialogRef.afterClosed().subscribe((data: any) => {
          if (data) {
            groupsToDelete.forEach(element => {
              this.crudService.delete('/course-groups', element)
                .subscribe(() => {
                  this.snackbar.open('Grupo eleiminado correctamente', 'OK', {duration: 3000});
                })
            });
          }
        });
      } else {
        this.snackbar.open('Este grupo tiene reserva asociadas y no puede ser eliminado', 'OK', {duration: 3000});
      }
    }

  }

  checkIfExistInDate(daySelectedIndex, monitor, level) {

    let blocked = false;
    this.defaults.course_dates[daySelectedIndex].groups.forEach(gs => {
      if (!blocked) {
        gs.subgroups.forEach(sbs => {
          if (sbs.monitor_id === monitor.id) {
            blocked = true;
          }
        });
      }

    });

    return blocked;
  }

  disableActive(level: any) {
    let hasBookings = false;
      const groupsToDelete = [];
      this.defaults.course_dates.forEach(element => {
        element.groups.forEach(group => {
          if (group.degree_id === level.id) {
            groupsToDelete.push(group.id)
          }
        });
      });

      groupsToDelete.forEach(element => {
        if (!hasBookings) {
          this.defaults.course_dates.forEach(cs => {
            cs.groups.forEach(gs => {
              if (gs.degree_id === level.id) {

                if (groupsToDelete.find((g) => g === gs.id)) {
                  gs.subgroups.forEach(sgs => {
                    if (sgs.booking_users && sgs.booking_users.length > 0) {
                      hasBookings = true;
                    }
                  });
                }
              }
            });
          });
        }

      });

      return hasBookings;
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
          group.teacher_min_degree = event.value.id;
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

    let ret = '';
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
              ret = group.subgroups[subGroupIndex]?.monitor?.first_name + ' ' + group.subgroups[subGroupIndex]?.monitor?.last_name;
            }

          });
        }


      return ret === "undefined undefined" ? null : ret;
    }

    calculateMonitorLevel(level: any) {
      let ret = 0;
      this.defaults.course_dates.forEach(courseDate => {
        courseDate.groups.forEach(group => {
          if (level.id === group.degree_id) {
            ret = this.levels.find((l) => l.id === group.teacher_min_degree);
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
            group.subgroups[subGroupSelectedIndex].monitor_id = monitor.id;
          }

        });
      }

    }
  }

  setSubGroupPax(event: any, level: any) {
    if (+event.target.value > this.defaults.max_participants) {
      this.snackbar.open('La capacidad del grupo no puede ser superior al limete de participantes del curso', 'OK', {duration: 3000});
    }

    level.max_participants = +event.target.value <= this.defaults.max_participants ? +event.target.value : this.defaults.max_participants;

    this.defaults.course_dates.forEach(element => {
      element.groups.forEach(group => {
        if (level.id === group.degree_id) {
          group.subgroups.forEach(subGroup => {
            subGroup.max_participants =level.max_participants;
          });
        }
      });
    });
  }

  selectItem(item: any, index: any, subGroupIndex: any, subgroup) {
    this.subGroupSelectedIndex = null;
    this.selectedItem = item.dateString;
    this.selectedDate = item.date;
    this.daySelectedIndex = index;
    this.subGroupSelectedIndex = subGroupIndex;
    this.subGroupSelectedItemDate = moment(item.date);
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

  calculateMaxGroup(level: any) {
    let ret = 0;
    this.defaults.course_dates.forEach(courseDate => {
      courseDate.groups.forEach(group => {
        if (level.id === group.degree_id) {
          ret = group.subgroups[0].max_participants;
        }
      });
    });

    return ret;
  }

  calculateStudentsGroup(level: any) {
    let ret = 0;
    let group = null;
    this.defaults.course_dates.forEach(courseDate => {
      courseDate.groups.forEach(gr => {
        if (level.id === gr.degree_id) {
          group = gr;
        }
      });
    });

    if (group !== null) {
      this.courseUsers.forEach(courseUser => {
        if (courseUser.course_group_id === group.id) {
          ret = ret + 1;
        }
      });
    }


    return ret;
  }

  isInDay(date: any, courseUserId: any) {

    let ret = false;
    const course = this.defaults.course_dates.find((c) => moment(c.date).format('YYYY-MM-DD') === date);
    const courseUsers = this.courseUsers.filter((c) => c.client_id === courseUserId);
    if (course) {
      courseUsers.forEach(courseUser => {
        course.groups.forEach(group => {
          group.subgroups.forEach(element => {
            const exist = courseUser.course_date_id === element.course_date_id && courseUser.course_group_id === element.course_group_id && courseUser.course_subgroup_id === element.id

            if (exist) {
              ret = true;
            }
          });
        });
      });


    }

    return ret;
  }

  calculateFormattedDuration(hourStart: string, hourEnd: string): string {
    // Parsea las horas de inicio y fin
    let start = moment(hourStart, "HH:mm");
    let end = moment(hourEnd, "HH:mm");

    // Calcula la duración
    let duration = moment.duration(end.diff(start));

    // Formatea la duración
    let formattedDuration = "";
    if (duration.hours() > 0) {
      formattedDuration += duration.hours() + "h ";
    }
    if (duration.minutes() > 0) {
      formattedDuration += duration.minutes() + "m";
    }

    return formattedDuration.trim();
  }

  getClients() {
    this.crudService.list('/admin/clients', 1, 10000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
      .subscribe((data: any) => {
        this.clients = data.data;

      })
  }

  getClient(id: any) {
    if (id && id !== null) {
      return this.clients.find((c) => c.id === id);
    }
  }

  calculateAge(birthDateString) {
    if(birthDateString && birthDateString !== null) {
      const today = new Date();
      const birthDate = new Date(birthDateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }

      return age;
    } else {
      return 0;
    }

  }

  getCountry(id: any) {
    const country = this.countries.find((c) => c.id == id);
    return country ? country.name : 'NDF';
  }

  getNacionality(id: any) {
    const country = this.countries.find((c) => c.id == id);
    return country ? country.code : 'NDF';
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

  getMonitors() {
    this.crudService.list('/monitors', 1, 1000, 'asc', 'first_name', '&school_id='+this.user.schools[0].id)
      .subscribe((data) => {
        this.monitors = data.data;

        this.filteredMonitors = this.monitorsForm.valueChanges.pipe(
          startWith(''),
          map((value: any) => typeof value === 'string' ? value : value?.full_name),
          map(full_name => full_name ? this._filterMonitor(full_name) : this.monitors.slice())
        );
      })
  }

  private _filterMonitor(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.monitors.filter(monitor => monitor.full_name.toLowerCase().includes(filterValue));
  }

  getCourseUsers(subGroup: any) {
    let ret = [];

    this.courseUsers.forEach(courseUser => {
      if(courseUser.course_group_id === subGroup.course_group_id && courseUser.course_subgroup_id === subGroup.id) {
        ret.push(courseUser);
      }
    });

    return ret;
  }

  save() {

    let data: any = [];

    if (this.defaults.course_type === 1) {
      this.defaults.course_dates.forEach(dates => {
        const group = [];
        dates.groups.forEach(dateGroup => {
          if (dateGroup.subgroups.length > 0) {
            group.push(dateGroup);
          }
        });
        dates.groups = group;
      });
    }

    if (this.defaults.course_type === 1 && this.defaults.is_flexible) {
      data = {
        course_type: this.defaults.course_type,
        is_flexible: this.defaults.is_flexible,
        name: this.defaults.name,
        short_description: this.defaults.short_description,
        description: this.defaults.description,
        price: this.defaults.price,
        currency: 'CHF',//poner currency de reglajes
        date_start: moment(this.defaults.date_start_res).format('YYYY-MM-DD'),
        date_end: moment(this.defaults.date_end_res).format('YYYY-MM-DD'),
        date_start_res: moment(this.defaults.date_start_res).format('YYYY-MM-DD'),
        date_end_res: moment(this.defaults.date_end_res).format('YYYY-MM-DD'),
        confirm_attendance: false,
        active: this.defaults.active,
        online: this.defaults.online,
        translations: null,
        sport_id: this.defaults.sport_id,
        school_id: this.defaults.school_id, //sacar del global
        station_id: this.defaults.station_id.id,
        max_participants: this.defaults.max_participants,
        course_dates: this.defaults.course_dates
      }
      console.log(data);

    } else if (this.defaults.course_type === 1 && !this.defaults.is_flexible) {
      data = {
        course_type: this.defaults.course_type,
        is_flexible: this.defaults.is_flexible,
        name: this.defaults.name,
        short_description: this.defaults.short_description,
        description: this.defaults.description,
        price: this.defaults.price,
        currency: 'CHF',//poner currency de reglajes
        date_start: moment(this.defaults.date_start_res).format('YYYY-MM-DD'),
        date_end: moment(this.defaults.date_end_res).format('YYYY-MM-DD'),
        date_start_res: moment(this.defaults.date_start_res).format('YYYY-MM-DD'),
        date_end_res: moment(this.defaults.date_end_res).format('YYYY-MM-DD'),
        confirm_attendance: false,
        active: this.defaults.active,
        online: this.defaults.online,
        translations: null,
        sport_id: this.defaults.sport_id,
        school_id: this.defaults.school_id, //sacar del global
        station_id: this.defaults.station_id.id,
        max_participants: this.defaults.max_participants,
        course_dates: this.defaults.course_dates
      }
      console.log(data);
    }

    this.crudService.update('/admin/courses', data, this.id)
      .subscribe((res) => {
        console.log(res);
        this.goTo('/courses');
      })

  }

  checkAvailableMonitors(level: any) {
    let minDegree = 0;
    this.defaults.course_dates[this.daySelectedIndex].groups.forEach(element => {
      if (element.degree_id === level.id) {
        minDegree = element.teachers_min;
      }
    });
    const data = {
      sportId: this.defaults.sport_id,
      minimumDegreeId: minDegree,
      startTime: this.defaults.course_dates[this.daySelectedIndex].hour_start,
      endTime: this.defaults.course_dates[this.daySelectedIndex].hour_end,
      date: this.daysDatesLevels[this.daySelectedIndex].date
    };

    this.crudService.post('/admin/monitors/available', data)
      .subscribe((response) => {
        this.monitors = response.data;
        this.filteredMonitors = this.monitorsForm.valueChanges.pipe(
          startWith(''),
          map((value: any) => typeof value === 'string' ? value : value?.full_name),
          map(full_name => full_name ? this._filterMonitor(full_name) : this.monitors.slice())
        );
      })
  }
}
