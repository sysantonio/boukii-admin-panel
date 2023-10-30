import { Component } from '@angular/core';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { BonusesCreateUpdateComponent } from './bonuses-create-update/bonuses-create-update.component';

@Component({
  selector: 'vex-bonuses',
  templateUrl: './bonuses.component.html',
  styleUrls: ['./bonuses.component.scss']
})
export class BonusesComponent {

  createComponent = BonusesCreateUpdateComponent;
  entity = 'bookings';
  columns: TableColumn<any>[] = [
    { label: 'Nombre', property: 'name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Mail', property: 'email', type: 'text', visible: true },
    { label: 'Rol', property: 'rol', type: 'text', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];
}
