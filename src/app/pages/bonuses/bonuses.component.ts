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
  entity = '/vouchers';
  deleteEntity = '/vouchers';
  icon = '../../../assets/img/icons/bonos.svg';

  columns: TableColumn<any>[] = [
    { label: 'Code', property: 'code', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Client', property: 'client_id', type: 'client', visible: true },
    { label: 'Quantity', property: 'quantity', type: 'text', visible: true },
    { label: 'Remaining', property: 'remaining_balance', type: 'text', visible: true },
    { label: 'Payed', property: 'payed', type: 'status', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];
}
