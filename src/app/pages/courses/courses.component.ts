import { Component } from '@angular/core';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { CoursesCreateUpdateComponent } from './courses-create-update/courses-create-update.component';
import { LEVELS } from 'src/app/static-data/level-data';

@Component({
  selector: 'vex-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent {

  showDetail: boolean = false;
  detailData: any;
  imageAvatar = 'https://school.boukii.online/assets/icons/icons-outline-default-avatar.svg';
  imagePath = 'https://school.boukii.com/assets/icons/collectif_ski2x.png';

  groupedByColor = {};
  colorKeys: string[] = []; // Aquí almacenaremos las claves de colores
  mockLevels = LEVELS;

  createComponent = CoursesCreateUpdateComponent;
  entity = '/courses';
  columns: TableColumn<any>[] = [
    { label: 'Type', property: 'course_type', type: 'image', visible: true },
    { label: 'Course', property: 'name', type: 'text', visible: true},
    { label: 'Sport', property: 'sport', type: 'text', visible: true },
    { label: 'FX-FI', property: 'max_participants', type: 'text', visible: true },
    { label: 'Dates', property: 'dates', type: 'dates', visible: true },
    { label: 'Duration', property: 'duration', type: 'text', visible: true },
    { label: 'Price', property: 'price', type: 'price', visible: true },
    { label: 'Enregistrée', property: 'register', type: 'register_date', visible: true },
    { label: 'Reservas', property: 'bookings', type: 'bookings', visible: true },
    { label: 'Status', property: 'active', type: 'light', visible: true },
    { label: 'Options', property: 'options', type: 'light', visible: true },
    { label: 'Online', property: 'online', type: 'light', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  constructor() {
    this.mockLevels.forEach(level => {
      if (!this.groupedByColor[level.color]) {
        this.groupedByColor[level.color] = [];
      }
      this.groupedByColor[level.color].push(level);
    });

    this.colorKeys = Object.keys(this.groupedByColor);
  }

  showDetailEvent(event: any) {
    this.showDetail = event.showDetail;
    this.detailData = event.item;
  }
}
