import { Component } from '@angular/core';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { BookingsCreateUpdateComponent } from './bookings-create-update/bookings-create-update.component';

@Component({
  selector: 'vex-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent {

  createComponent = BookingsCreateUpdateComponent;
  entity = 'users';
  columns: TableColumn<any>[] = [
    { label: 'Nombre', property: 'name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Mail', property: 'email', type: 'text', visible: true },
    { label: 'Rol', property: 'rol', type: 'text', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];
}
