import { Component } from '@angular/core';
import { ClientsCreateUpdateModule } from './client-create-update/client-create-update.module';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { LEVELS } from 'src/app/static-data/level-data';
import { ApiCrudService } from 'src/service/crud.service';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { MOCK_PROVINCES } from 'src/app/static-data/province-data';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BookingsCreateUpdateModalComponent } from '../bookings/bookings-create-update-modal/bookings-create-update-modal.component';

@Component({
  selector: 'vex-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent {

  createComponent = ClientsCreateUpdateModule;
  entity = '/admin/clients';
  deleteEntity = '/clients';
  showDetail: boolean = false;

  detailData: any;
  utilizers: any;
  clientSport: any;
  imageAvatar = '../../../assets/img/avatar.png';
  skiImage = 'https://school.boukii.com/assets/apps/sports/Ski.png';
  groupedByColor = {};
  colorKeys: string[] = []; // Aquí almacenaremos las claves de colores
  mockLevelData = LEVELS;
  countries = MOCK_COUNTRIES;
  provinces = MOCK_PROVINCES;
  mainIdSelected = true;
  borderActive = -1;

  constructor(private crudService: ApiCrudService, private router: Router, private dialog: MatDialog) {}

  columns: TableColumn<any>[] = [
    { label: 'Id', property: 'id', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Nombre', property: 'first_name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Apellido', property: 'last_name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Edad', property: 'birth_date', type: 'birth', visible: true, cssClasses: ['font-medium'] },
    { label: 'Usuarios', property: 'utilizers', type: 'count', visible: true, cssClasses: ['font-medium'] },
    { label: 'Email', property: 'email', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Sports', property: 'client_sports', type: 'sports', visible: true, cssClasses: ['font-medium'] },
    { label: 'Registro', property: 'created_at', type: 'date', visible: true, cssClasses: ['font-medium'] },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];


  createBooking() {
    const dialogRef = this.dialog.open(BookingsCreateUpdateModalComponent, {
      width: '100%',
      height: '1200px',
      maxWidth: '90vw',
      panelClass: 'full-screen-dialog',
      data: {
        clientId: this.detailData.id
      }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {

      }
    });
  }

  showDetailEvent(event: any) {

    if (event.showDetail || (!event.showDetail && this.detailData !== null && this.detailData.id !== event.item.id)) {
      this.crudService.get('/clients/'+event.item.id)
      .subscribe((data) => {
        this.detailData = data.data;

        this.crudService.get('/admin/clients/' + event.item.id +'/utilizers')
          .subscribe((uti) => {
            this.utilizers = uti.data;
          })
        this.crudService.list('/client-sports', 1, 1000, 'desc', 'id', '&client_id='+event.item.id)
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

  getNacionality(id: any) {
    const country = this.countries.find((c) => c.id === +id);
    return country ? country.code : 'NDF';
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }

  toggleBorder(index: number, utilizer: any) {
    this.mainIdSelected = false;
    this.borderActive = index;

  }
}
