import { Component } from '@angular/core';
import { MonitorsCreateUpdateComponent } from './monitors-create-update/monitors-create-update.component';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';

@Component({
  selector: 'vex-monitors',
  templateUrl: './monitors.component.html',
  styleUrls: ['./monitors.component.scss']
})
export class MonitorsComponent {

  constructor() {

  }

  createComponent = MonitorsCreateUpdateComponent;
  entity = 'courses';
  columns: TableColumn<any>[] = [
    { label: 'Course', property: 'name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Sport', property: 'sport', type: 'text', visible: true },
    { label: 'Jours', property: 'journey', type: 'text', visible: true },
    { label: 'Jours', property: 'duration', type: 'text', visible: true },
    { label: 'Máx Participants', property: 'max_participants', type: 'text', visible: true },
    { label: 'Prix', property: 'price', type: 'text', visible: true },
    { label: 'Depuis', property: 'start_date', type: 'text', visible: true },
    { label: "Jusqu'à", property: 'end_date', type: 'text', visible: true },
    { label: 'Etat', property: 'status', type: 'text', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];
}
