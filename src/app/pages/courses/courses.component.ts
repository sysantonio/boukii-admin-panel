import { Component } from '@angular/core';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { CoursesCreateUpdateComponent } from './courses-create-update/courses-create-update.component';
import { ApiCrudService } from 'src/service/crud.service';
import moment from 'moment';
import { Router } from '@angular/router';

@Component({
  selector: 'vex-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent {

  showDetail: boolean = false;
  detailData: any;
  selectedLevel: any;
  imagePath = 'https://school.boukii.com/assets/icons/collectif_ski2x.png';
  selectedGroup: any = [];
  monitors: any = [];
  groupedByColor = {};
  user:any;
  imageAvatar = '../../../assets/img/avatar.png';
  colorKeys: string[] = []; // Aquí almacenaremos las claves de colores

  createComponent = CoursesCreateUpdateComponent;
  entity = '/admin/courses';
  deleteEntity = '/courses';

  columns: TableColumn<any>[] = [
    { label: 'Id', property: 'id', type: 'text', visible: true },
    { label: 'Type', property: 'course_type', type: 'course_image', visible: true },
    { label: 'Course', property: 'name', type: 'text', visible: true},
    { label: 'Sport', property: 'sport', type: 'sport', visible: true },
    { label: 'FX-FI', property: 'is_flexible', type: 'flexible', visible: true },
    { label: 'Dates', property: 'course_dates', type: 'datesCourse', visible: true },
    { label: 'Duration', property: 'duration', type: 'duration', visible: true },
    { label: 'Price', property: 'price', type: 'price', visible: true },
    { label: 'Enregistrée', property: 'created_at', type: 'date', visible: true },
    { label: 'Reservas', property: 'max_participants', type: 'bookings', visible: true },
    { label: 'Status', property: 'active', type: 'light', visible: true },
    { label: 'Options', property: 'options', type: 'light', visible: true },
    { label: 'Online', property: 'online', type: 'light', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  constructor(private crudService: ApiCrudService, private router: Router) {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
    this.getMonitors();
  }

  showDetailEvent(event: any) {

    if (event.showDetail || (!event.showDetail && this.detailData !== null && this.detailData.id !== event.item.id)) {
      this.detailData = event.item;

      this.groupedByColor = {};
      this.colorKeys= [];
      this.crudService.list('/degrees', 1, 1000,'asc', 'degree_order', '&school_id=' + this.detailData.school_id + '&sport_id='+ this.detailData.sport_id)
        .subscribe((data) => {
          this.detailData.degrees = [];
          data.data.forEach(element => {
            if(element.active) {
              this.detailData.degrees.push(element);
            }
          });


           this.detailData.degrees.forEach(level => {
            if (!this.groupedByColor[level.color]) {
              this.groupedByColor[level.color] = [];
            }
            level.active = false;


            this.detailData.course_dates.forEach(cs => {
              cs.course_groups.forEach(group => {
                if (group.degree_id === level.id) {
                  level.active = true;
                  level.old = true;
                }
                level.visible = false;
              });
            });
            this.groupedByColor[level.color].push(level);
          });

          this.colorKeys = Object.keys(this.groupedByColor);
        });

        this.crudService.list('/stations', 1, 1000,  'desc', 'id', '&school_id=' + this.detailData.school_id)
          .subscribe((st) => {
            st.data.forEach(element => {
              if (element.id === this.detailData.station_id) {
                this.detailData.station = element;
              }
            });
          })
        this.crudService.list('/booking-users', 1, 1000, 'desc', 'id', '&school_id=' + this.detailData.school_id + '&course_id='+ this.detailData.id)
          .subscribe((bookingUser) => {
            this.detailData.users = [];
            this.detailData.users = bookingUser.data;
            this.showDetail = true;

          })
    } else {
      this.showDetail = event.showDetail;
    }

  }

  calculateFormattedDuration(hourStart: string, hourEnd: string): string {
    // Parsea las horas de inicio y fin
    let start = moment(hourStart.replace(': 00', ''), "HH:mm");
    let end = moment(hourEnd.replace(': 00', ''), "HH:mm");

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

  getMonitors() {
    this.crudService.list('/monitors', 1, 1000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
      .subscribe((monitor) => {
        this.monitors = monitor.data;
      })
  }

  getMonitor(id: number) {
    if (id && id !== null) {

      const monitor = this.monitors.find((m) => m.id === id);

      return monitor;
    }
  }

  getStudents(levelId: any) {
    let ret = 0;

    this.detailData.users.forEach(element => {
      if (element.degree_id === levelId) {
        ret = ret + 1;
      }
    });

    return ret;
  }

  getMaxStudents(levelId: any) {
    let ret = 0;

    this.detailData.course_dates.forEach(courseDate => {
      courseDate.course_groups.forEach(group => {
        if (group.degree_id === levelId) {
          group.course_subgroups.forEach(sb => {
            ret = ret + sb.max_participants;
          });
        }
      });

    });

    return ret;
  }

  getGroups(levelId: any) {
    let ret = 0;

    this.detailData.course_dates.forEach(courseDate => {
      courseDate.course_groups.forEach(group => {
        if (group.degree_id === levelId) {
          ret = ret + 1;
        }
      });

    });

    return ret;
  }

  getSubGroups(levelId: any) {
    let ret = 0;

    this.detailData.course_dates.forEach(courseDate => {
      let find = false;
      courseDate.course_groups.forEach(group => {
        if (group.degree_id === levelId && !find) {
          ret = group.course_subgroups[0].max_participants;
          find = true;
        }
      });

    });

    return ret;
  }

  parseDateToText(date: any) {
    return moment(date).format('LLL').replace(' 0:00', '')
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }


  selectGroup(level: any) {
    this.selectedLevel = level;
    this.detailData.course_dates[0].course_groups.forEach(group => {
      if (group.degree_id === level.id) {
        this.selectedGroup = group;
      }
    });

    this.selectedGroup.course_subgroups.forEach(element => {
      this.crudService.list('/booking-users', 1, 1000, 'asc', 'id', '&course_subgroup_id=' + element.id)
        .subscribe((data) => {
          element.totalUsers = data.data.length;
        })
    });
  }
}
