import { Component } from '@angular/core';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { CoursesCreateUpdateComponent } from './courses-create-update/courses-create-update.component';

@Component({
  selector: 'vex-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent {

  createComponent = CoursesCreateUpdateComponent;
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
