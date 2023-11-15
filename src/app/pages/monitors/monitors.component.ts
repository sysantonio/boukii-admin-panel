import { Component } from '@angular/core';
import { MonitorsCreateUpdateComponent } from './monitors-create-update/monitors-create-update.component';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { LEVELS } from 'src/app/static-data/level-data';

@Component({
  selector: 'vex-monitors',
  templateUrl: './monitors.component.html',
  styleUrls: ['./monitors.component.scss']
})
export class MonitorsComponent {

  showDetail: boolean = false;
  detailData: any;
  imageAvatar = 'https://school.boukii.online/assets/icons/icons-outline-default-avatar.svg';
  skiImage = 'https://school.boukii.com/assets/apps/sports/Ski.png';
  groupedByColor = {};
  colorKeys: string[] = []; // Aquí almacenaremos las claves de colores
  mockLevelData = LEVELS;

  constructor() {
    this.mockLevelData.forEach(level => {
      if (!this.groupedByColor[level.color]) {
        this.groupedByColor[level.color] = [];
      }
      this.groupedByColor[level.color].push(level);
    });

    this.colorKeys = Object.keys(this.groupedByColor);
  }

  createComponent = MonitorsCreateUpdateComponent;
  entity = 'monitors';
  columns: TableColumn<any>[] = [
    { label: 'Name', property: 'name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Age', property: 'age', type: 'text', visible: true },
    { label: 'Email', property: 'email', type: 'text', visible: true },
    { label: 'Phone', property: 'phone', type: 'text', visible: true },
    { label: 'Sports', property: 'sport', type: 'text', visible: true },
    { label: 'Level', property: 'niveaux', type: 'level', visible: true },
    { label: 'Register', property: 'register', type: 'register_date', visible: true },
    { label: "Status", property: 'status', type: 'light', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  showDetailEvent(event: any) {
    this.showDetail = event.showDetail;
    this.detailData = event.item;
  }
}
