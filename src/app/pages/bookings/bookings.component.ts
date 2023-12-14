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
  sports = [];
  bonus: any = [];
  user: any;
  school: any;

  createComponent = BookingsCreateUpdateComponent;
  entity = '/bookings';
  columns: TableColumn<any>[] = [
    { label: 'Id', property: 'id', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Type', property: 'type', type: 'booking_users_image', visible: true },
    { label: 'Course', property: 'bookingusers', type: 'booking_users', visible: true},
    { label: 'Dates', property: 'dates', type: 'booking_dates', visible: true },
    { label: 'Client', property: 'client_main_id', type: 'client', visible: true },
    { label: 'Enregistrée', property: 'created_at', type: 'date', visible: true },
    { label: 'Options', property: 'options', type: 'text', visible: true },
    { label: 'Bons', property: 'bonus', type: 'light', visible: true },
    { label: 'OP. Rem', property: 'has_cancellation_insurance', type: 'light', visible: true },
    { label: 'B. Care', property: 'has_boukii_care', type: 'light', visible: true },
    { label: 'Prix', property: 'price_total', type: 'price', visible: true },
    { label: 'M. Paiment', property: 'payment_method', type: 'text', visible: true },
    { label: 'Status', property: 'paid', type: 'payment_status', visible: true },
    { label: 'Status 2', property: 'cancelation', type: 'cancelation_status', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  constructor(private crudService: ApiCrudService, private router: Router, private schoolService: SchoolService) {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));

    this.schoolService.getSchoolData().subscribe((school) => {
      this.school = school.data;
    })
    this.getMonitors();
    this.getClients();
    this.getSports();
  }

  showDetailEvent(event: any) {

    if (event.showDetail || (!event.showDetail && this.detailData !== null && this.detailData.id !== event.item.id)) {
      this.bonus = [];
      this.detailData = event.item;
      this.getSchoolSportDegrees();
      this.crudService.list('/vouchers-logs', 1, 1000, 'desc', 'id', '&booking_id='+this.detailData.id)
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
            this.crudService.list('/booking-user-extras', 1, 1000, 'desc', 'id', '&booking_user_id='+book.id)
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
    const country = this.countries.find((c) => c.id === +id);
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

  getNacionality(id: any) {
    const country = this.countries.find((c) => c.id === +id);
    return country ? country.code : 'NDF';
  }



  getClient(id: any) {
    if (id && id !== null) {
      return this.clients.find((c) => c.id === id);
    }
  }

  getSportName(id) {
    return this.sports.find((s) => s.id = id).name
  }

  getClients() {
    this.crudService.list('/admin/clients', 1, 1000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
      .subscribe((client) => {
        this.clients = client.data;
      })
  }

  getMonitors() {
    this.crudService.list('/monitors', 1, 1000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
      .subscribe((monitor) => {
        this.monitors = monitor.data;
      })
  }


  getSports() {
    this.crudService.list('/sports', 1, 1000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
      .subscribe((sport) => {
        this.sports = sport.data;
      })
  }

  getSchoolSportDegrees() {
    this.crudService.list('/school-sports', 1, 1000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
      .subscribe((sport) => {
        this.detailData.sports = sport.data;
        sport.data.forEach((element, idx) => {
          this.crudService.list('/degrees', 1, 1000, 'asc', 'degree_order', '&school_id=' + this.user.schools[0].id + '&sport_id='+element.sport_id + '&active=1')
          .subscribe((data) => {
            this.detailData.sports[idx].degrees = data.data.reverse();
          });
        });
      })
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
}
