import { Component } from '@angular/core';
import { ClientsCreateUpdateModule } from './client-create-update/client-create-update.module';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { LEVELS } from 'src/app/static-data/level-data';

@Component({
  selector: 'vex-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent {

  createComponent = ClientsCreateUpdateModule;
  entity = 'clients'; showDetail: boolean = false;

  detailData: any;
  imageAvatar = 'https://school.boukii.online/assets/icons/icons-outline-default-avatar.svg';
  skiImage = 'https://school.boukii.com/assets/apps/sports/Ski.png';
  groupedByColor = {};
  colorKeys: string[] = []; // Aquí almacenaremos las claves de colores
  mockLevelData = LEVELS;

  constructor() {

  }

  columns: TableColumn<any>[] = [
    { label: 'Tipo', property: 'type', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Nombre', property: 'name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Edad', property: 'age', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Usuarios', property: 'users', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Email', property: 'email', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Sports', property: 'sport', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Nivel', property: 'level', type: 'level', visible: true, cssClasses: ['font-medium'] },
    { label: 'Registro', property: 'register', type: 'register_date', visible: true, cssClasses: ['font-medium'] },
    { label: 'Status', property: 'status', type: 'light', visible: true, cssClasses: ['font-medium'] },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  showDetailEvent(event: any) {
    this.showDetail = event.showDetail;
    this.detailData = event.item;
  }
}
