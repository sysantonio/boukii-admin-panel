import { Component } from '@angular/core';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';

@Component({
  selector: 'vex-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent {

  entity = 'users';
  columns: TableColumn<any>[] = [
    { label: 'Nombre', property: 'name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Mail', property: 'email', type: 'text', visible: true },
    { label: 'Rol', property: 'rol', type: 'text', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];
}
