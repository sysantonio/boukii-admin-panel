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

  icon = '../../../assets/img/icons/monitores.svg';
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
  languages = [];

  constructor(private crudService: ApiCrudService, private router: Router) {
    this.getLanguages();
    this.mockLevelData.forEach(level => {
      if (!this.groupedByColor[level.color]) {
        this.groupedByColor[level.color] = [];
      }
      this.groupedByColor[level.color].push(level);
    });

    this.colorKeys = Object.keys(this.groupedByColor);
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));


    this.crudService.list('/sports', 1, 10000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
    .subscribe((sport) => {
      this.sports = sport.data;
    })
  }

  createComponent = MonitorsCreateUpdateComponent;
  entity = '/monitors';
  deleteEntity = '/monitors';

  columns: TableColumn<any>[] = [
    { label: 'Id', property: 'id', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'name', property: 'first_name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'surname', property: 'last_name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'age', property: 'birth_date', type: 'birth', visible: true },
    { label: 'Email', property: 'email', type: 'text', visible: true },
    { label: 'mobile', property: 'phone', type: 'text', visible: true },
    { label: 'sports', property: 'sports', type: 'sports_monitor', visible: true },
    { label: 'register', property: 'created_at', type: 'date', visible: true },
    { label: "status", property: 'active_school', type: 'light_school', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  showDetailEvent(event: any) {

    if (event.showDetail || (!event.showDetail && this.detailData !== null && this.detailData.id !== event.item.id)) {
      this.crudService.get('/monitors/'+event.item.id)
      .subscribe((data) => {
        this.detailData = data.data;

        this.crudService.list('/monitor-sports-degrees', 1, 10000, 'desc', 'id', '&monitor_id='+event.item.id+'&school_id='+this.user.schools[0].id)
          .subscribe((mn) => {
            this.monitorSport = mn.data;

            this.monitorSport.forEach(element => {
              this.crudService.list('/monitor-sport-authorized-degrees', 1, 10000, 'desc', 'id', '&monitor_sport_id=' + element.id)
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

            this.showDetail = true;
          })
      })
    } else {
      this.showDetail = event.showDetail;
    }

  }

  getCountry(id: any) {
    const country = this.countries.find((c) => c.id == +id);
    return country ? country.name : 'NDF';
  }

  getProvince(id: any) {
    const province = this.provinces.find((c) => c.id == +id);
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

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
