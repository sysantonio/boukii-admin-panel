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
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'vex-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent {

  icon = '../../../assets/img/icons/clientes.svg';
  createComponent = ClientsCreateUpdateModule;
  entity = '/admin/clients/mains';
  deleteEntity = '/clients';
  showDetail: boolean = false;
  user: any;

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
  languages = [];
  mainIdSelected = true;
  borderActive = -1;

  constructor(private crudService: ApiCrudService, private router: Router, private translateService: TranslateService,
    private dialog: MatDialog, private snackbar: MatSnackBar) {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
    this.getLanguages();
  }

  columns: TableColumn<any>[] = [
    { label: 'Coronita', property: 'a', type: 'coronita', visible: true, cssClasses: ['font-medium'] },
    { label: 'Id', property: 'id', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'name', property: 'first_name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'surname', property: 'last_name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'age', property: 'birth_date', type: 'birth', visible: true, cssClasses: ['font-medium'] },
    { label: 'users', property: 'utilizers', type: 'count', visible: true, cssClasses: ['font-medium'] },
    { label: 'Email', property: 'email', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'sports', property: 'client_sports', type: 'sports', visible: true, cssClasses: ['font-medium'] },
    { label: 'register', property: 'created_at', type: 'date', visible: true, cssClasses: ['font-medium'] },
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
        this.snackbar.open(this.translateService.instant('snackbar.booking.create'), 'OK', {duration: 3000});
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
        this.crudService.list('/client-sports', 1, 10000, 'desc', 'id', '&client_id='+event.item.id)
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

  toggleBorder(index: number, utilizer: any) {
    this.mainIdSelected = false;
    this.borderActive = index;

  }
}
