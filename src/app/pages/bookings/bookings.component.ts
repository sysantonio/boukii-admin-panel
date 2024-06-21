import { Component } from '@angular/core';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { BookingsCreateUpdateComponent } from './bookings-create-update/bookings-create-update.component';
import moment from 'moment';
import { ApiCrudService } from 'src/service/crud.service';
import { Router } from '@angular/router';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { MOCK_PROVINCES } from 'src/app/static-data/province-data';
import { SchoolService } from 'src/service/school.service';

@Component({
  selector: 'vex-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent {
  showDetail: boolean = false;
  detailData: any;
  imageAvatar = '../../../assets/img/avatar.png';

  countries = MOCK_COUNTRIES;
  provinces = MOCK_PROVINCES;
  clients = [];
  monitors = [];
  languages = [];
  sports = [];
  bonus: any = [];
  user: any;
  school: any;
  bookingLog: any = [];
  bookingUsersUnique = [];

  createComponent = BookingsCreateUpdateComponent;
  icon = '../../../assets/img/icons/reservas.svg';
  entity = '/bookings';
  deleteEntity = '/bookings';
  columns: TableColumn<any>[] = [
    { label: 'Id', property: 'id', type: 'id', visible: true, cssClasses: ['font-medium'] },
    { label: 'type', property: 'sport', type: 'booking_users_image', visible: true },
    { label: 'course', property: 'bookingusers', type: 'booking_users', visible: true},
    { label: 'client', property: 'client_main_id', type: 'client', visible: true },
    { label: 'dates', property: 'dates', type: 'booking_dates', visible: true },
    { label: 'register', property: 'created_at', type: 'date', visible: true },
    //{ label: 'options', property: 'options', type: 'text', visible: true },
    { label: 'bonus', property: 'bonus', type: 'light', visible: true },
    { label: 'op_rem_abr', property: 'has_cancellation_insurance', type: 'light', visible: true },
    { label: 'B. Care', property: 'has_boukii_care', type: 'light', visible: true },
    { label: 'price', property: 'price_total', type: 'price', visible: true },
    { label: 'method_paiment', property: 'payment_method_id', type: 'payment_method_id', visible: true },
    { label: 'paid', property: 'paid', type: 'payment_status', visible: true },
    { label: 'status', property: 'status', type: 'cancelation_status', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  constructor(private crudService: ApiCrudService, private router: Router, private schoolService: SchoolService) {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));

    this.schoolService.getSchoolData(this.user).subscribe((school) => {
      this.school = school.data;
    })
    this.getMonitors();
    this.getClients();
    this.getSports();
    this.getLanguages();
  }

  showDetailEvent(event: any) {

    if (event.showDetail || (!event.showDetail && this.detailData !== null && this.detailData.id !== event.item.id)) {
      this.bonus = [];
      this.detailData = event.item;
      this.detailData.bookingusers = this.orderBookingUsers(this.detailData.bookingusers);
      this.getUniqueBookingUsers(this.detailData.bookingusers);
      this.getSchoolSportDegrees();
      this.getBookingsLogs(this.detailData.id);
      this.crudService.list('/vouchers-logs', 1, 10000, 'desc', 'id', '&booking_id='+this.detailData.id)
          .subscribe((vl) => {
            if(vl.data.length > 0) {
              vl.data.forEach(voucherLog => {
                this.crudService.get('/vouchers/'+voucherLog.id)
                  .subscribe((v) => {
                    v.data.currentPay = parseFloat(voucherLog.amount);
                    this.bonus.push(v.data);
                  })
              });
            }
          })

          this.detailData.bookingusers.forEach(book => {
            book.courseExtras = [];
            this.crudService.list('/booking-user-extras', 1, 10000, 'desc', 'id', '&booking_user_id='+book.id)
            .subscribe((be) => {
              this.detailData.courseExtras = [];
              be.data.forEach(element => {
                this.crudService.get('/course-extras/' +element.course_extra_id)
                  .subscribe((ce) => {
                    book.courseExtras.push(ce.data);
                })
              });

          })
        });
        this.showDetail = true;
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


  getCountry(id: any) {
    const country = this.countries.find((c) => c.id == +id);
    return country ? country.name : 'NDF';
  }

  getProvince(id: any) {
    const province = this.provinces.find((c) => c.id === +id);
    return province ? province.name : 'NDF';
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

  getLanguage(id: any) {
    const lang = this.languages.find((c) => c.id == +id);
    return lang ? lang.code.toUpperCase() : 'NDF';
  }

  getLanguages() {
    this.crudService.list('/languages', 1, 1000)
      .subscribe((data) => {
        this.languages = data.data.reverse();

      })
  }

  getClient(id: any) {
    if (id && id !== null) {
      return this.clients.find((c) => c.id === id);
    }
  }

  getClientDegree(id: any) {
    if (!id) {
      return 0;
    }
    const client = this.clients.find(c => c.id === id);
    if (!client || !client.client_sports || !client.client_sports.length) {
      return 0;
    }
    const sportId = this.detailData.bookingusers && this.detailData.bookingusers[0] ? this.detailData.bookingusers[0].course.sport_id : null;
    if (!sportId) {
      return 0;
    }
    const clientSport = client.client_sports.find(cs => cs.sport_id === sportId && cs.school_id == this.user.schools[0].id);
    if (!clientSport || !clientSport.degree_id) {
      return 0;
    }
    return clientSport.degree_id;
  }


  getSportName(id) {
    return this.sports.find((s) => s.id === id).name
  }

  getClients() {
    this.crudService.list('/clients', 1, 10000, 'desc', 'id', '&school_id='+this.user.schools[0].id, '&with[]=clientSports')
      .subscribe((client) => {
        this.clients = client.data;
      })
  }

  getMonitors() {
    this.crudService.list('/monitors', 1, 10000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
      .subscribe((monitor) => {
        this.monitors = monitor.data;
      })
  }


  getSports() {
    this.crudService.list('/sports', 1, 10000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
      .subscribe((sport) => {
        this.sports = sport.data;
      })
  }

  getSchoolSportDegrees() {
    this.crudService.list('/school-sports', 1, 10000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
      .subscribe((sport) => {
        this.detailData.sports = sport.data;
        sport.data.forEach((element, idx) => {
          this.crudService.list('/degrees', 1, 10000, 'asc', 'degree_order', '&school_id=' + this.user.schools[0].id + '&sport_id='+element.sport_id + '&active=1')
          .subscribe((data) => {
            //For aureola
            data.data.forEach((degree: any) => {
              degree.inactive_color = this.lightenColor(degree.color, 30);
            });
            this.detailData.sports[idx].degrees = data.data.reverse();

            //For aureola
            if (this.detailData.bookingusers && this.detailData.bookingusers.length) {
              const sportId = this.detailData.bookingusers[0].course.sport_id;
              const matchingSport = this.detailData.sports.find(sport => sport.sport_id === sportId);

              if (matchingSport && matchingSport.degrees) {
                  this.detailData.degrees_sport = [...matchingSport.degrees].reverse();
              } else {
                  this.detailData.degrees_sport = [];
              }
            } else {
                this.detailData.degrees_sport = [];
            }
          });
        });
      })
  }

  private lightenColor(hexColor: string, percent: number): string {
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

    return '#'+r+g+b;
  }

  getDegree(degreeId: any) {
    let ret = null;

    if (this.detailData && this.detailData.sports) {
      this.detailData.sports.forEach(sport => {

        if (sport?.degrees) {
          const degree = sport.degrees.find((d) => d.id === degreeId);

          if (degree) {
            ret = degree;
          }
        }

      });
    }

    return ret;
  }

  getMonitor(id: number) {
    if (id && id !== null) {

      const monitor = this.monitors.find((m) => m.id === id);

      return monitor;
    }
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }

  getTVA() {
    return parseFloat(this.school.bookings_comission_cash) > 0;
  }

  getTVAValue() {
    return parseFloat(this.school.bookings_comission_cash);
  }

  existExtras() {
    let ret = false;

    this.detailData.bookingusers.forEach(element => {
      if (element.courseExtras.length > 0 && !ret) {
        ret = true;
      }
    });

    return ret;
  }

  getExtrasPrice() {
    let ret = 0;

    this.detailData.bookingusers.forEach(element => {
      if (element.courseExtras.length > 0 && !ret) {
        element.courseExtras.forEach(ce => {
          ret = ret + parseFloat(ce.price);
        });
      }
    });

    return ret;
  }

  getBonusPrice() {
    let ret = 0;

    this.bonus.forEach(element => {
      ret = ret + element.currentPay;
    });

    return ret.toFixed(2);
  }

  getUniqueBookingUsers(data: any) {
    const clientIds = new Set();
    const uniqueDates = new Set();
    const uniqueMonitors = new Set();
    this.bookingUsersUnique = [];
    this.bookingUsersUnique = data.filter(item => {
      if ((!clientIds.has(item.client_id) && !uniqueDates.has(item.date)) || !uniqueMonitors.has(item.monitor_id)) {
        clientIds.add(item.client_id);
        uniqueDates.add(item.date);
        uniqueMonitors.add(item.monitor_id);
        return true;
      }
      return false;
    });
  }

  orderBookingUsers(users: any[]) {
    return users.sort((a, b) => {
      // Ordenar por fecha
      const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateComparison !== 0) {
        return dateComparison;
      }

      // Si la fecha es la misma, ordenar por hora de inicio
      return a.hour_start.localeCompare(b.hour_start);
    });
  }

  getBookingsLogs(id) {
    this.crudService.list('/booking-logs', 1, 10000, 'desc', 'id', '&booking_id='+id)
      .subscribe((data) => {
        this.bookingLog = data.data;
      })
  }
}
