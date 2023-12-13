import { Component } from '@angular/core';
import { MonitorsCreateUpdateComponent } from './monitors-create-update/monitors-create-update.component';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { LEVELS } from 'src/app/static-data/level-data';
import { MOCK_PROVINCES } from 'src/app/static-data/province-data';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { ApiCrudService } from 'src/service/crud.service';
import { Router } from '@angular/router';

@Component({
  selector: 'vex-monitors',
  templateUrl: './monitors.component.html',
  styleUrls: ['./monitors.component.scss']
})
export class MonitorsComponent {

  showDetail: boolean = false;
  monitorSport: any;
  detailData: any;
  sports = [];
  user: any;
  imageAvatar = '../../../assets/img/avatar.png';
  skiImage = 'https://school.boukii.com/assets/apps/sports/Ski.png';
  groupedByColor = {};
  colorKeys: string[] = []; // Aquí almacenaremos las claves de colores
  mockLevelData = LEVELS;
  countries = MOCK_COUNTRIES;
  provinces = MOCK_PROVINCES;

  constructor(private crudService: ApiCrudService, private router: Router) {
    this.mockLevelData.forEach(level => {
      if (!this.groupedByColor[level.color]) {
        this.groupedByColor[level.color] = [];
      }
      this.groupedByColor[level.color].push(level);
    });

    this.colorKeys = Object.keys(this.groupedByColor);
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));


    this.crudService.list('/sports', 1, 1000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
    .subscribe((sport) => {
      this.sports = sport.data;
    })
  }

  createComponent = MonitorsCreateUpdateComponent;
  entity = '/monitors';
  columns: TableColumn<any>[] = [
    { label: 'Name', property: 'first_name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Age', property: 'age', type: 'text', visible: true },
    { label: 'Email', property: 'email', type: 'text', visible: true },
    { label: 'Phone', property: 'phone', type: 'text', visible: true },
    { label: 'Sports', property: 'sport', type: 'text', visible: true },
    { label: 'Level', property: 'niveaux', type: 'level', visible: true },
    { label: 'Register', property: 'created_at', type: 'date', visible: true },
    { label: "Status", property: 'status', type: 'light', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  showDetailEvent(event: any) {

    if (event.showDetail) {
      this.crudService.get('/monitors/'+event.item.id)
      .subscribe((data) => {
        this.detailData = data.data;

        this.crudService.list('/monitor-sports-degrees', 1, 1000, 'desc', 'id', '&monitor_id='+event.item.id)
          .subscribe((mn) => {
            this.monitorSport = mn.data;

            this.monitorSport.forEach(element => {
              this.crudService.list('/monitor-sport-authorized-degrees', 1, 1000, 'desc', 'id', '&monitor_sport_id=' + element.id)
                .subscribe((msad) => {
                  element.authorized = msad.data;
                });

                this.crudService.get('/sports/'+element.sport_id)
                  .subscribe((sport) => {
                    element.name = sport.data.name;
                    element.icon_selected = sport.data.icon_selected;
                    element.icon_unselected = sport.data.icon_unselected;
                  });

                  this.crudService.get('/degrees/'+element.degree_id)
                  .subscribe((level) => {
                    element.level = level.data;

                });
            });

            this.showDetail = event.showDetail;
          })
      })
    } else {
      this.showDetail = event.showDetail;
    }

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

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
