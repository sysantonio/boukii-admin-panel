import { Component } from '@angular/core';
import { ClientsCreateUpdateModule } from './client-create-update/client-create-update.module';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { LEVELS } from 'src/app/static-data/level-data';
import { ApiCrudService } from 'src/service/crud.service';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { MOCK_PROVINCES } from 'src/app/static-data/province-data';
import { Router } from '@angular/router';

@Component({
  selector: 'vex-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent {

  createComponent = ClientsCreateUpdateModule;
  entity = '/clients'; showDetail: boolean = false;

  detailData: any;
  clientSport: any;
  imageAvatar = 'https://school.boukii.online/assets/icons/icons-outline-default-avatar.svg';
  skiImage = 'https://school.boukii.com/assets/apps/sports/Ski.png';
  groupedByColor = {};
  colorKeys: string[] = []; // Aquí almacenaremos las claves de colores
  mockLevelData = LEVELS;
  countries = MOCK_COUNTRIES;
  provinces = MOCK_PROVINCES;

  constructor(private crudService: ApiCrudService, private router: Router) {

  }

  columns: TableColumn<any>[] = [
    { label: 'Tipo', property: 'type', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Nombre', property: 'first_name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Edad', property: 'birth_date', type: 'birth', visible: true, cssClasses: ['font-medium'] },
    { label: 'Usuarios', property: 'users', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Email', property: 'email', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Sports', property: 'sport', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Nivel', property: 'level', type: 'level', visible: true, cssClasses: ['font-medium'] },
    { label: 'Registro', property: 'register', type: 'register_date', visible: true, cssClasses: ['font-medium'] },
    { label: 'Status', property: 'status', type: 'light', visible: true, cssClasses: ['font-medium'] },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  showDetailEvent(event: any) {

    if (event.showDetail) {
      this.crudService.get('/clients/'+event.item.id)
      .subscribe((data) => {
        this.detailData = data.data;

        this
        this.crudService.list('/client-sports', 1, 1000, null, null, '&client_id='+event.item.id)
          .subscribe((cl) => {
            this.clientSport = cl.data;

            this.clientSport.forEach(element => {
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
