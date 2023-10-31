import { Component } from '@angular/core';
import { ClientsCreateUpdateModule } from './client-create-update/client-create-update.module';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';

@Component({
  selector: 'vex-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent {

  createComponent = ClientsCreateUpdateModule;
  entity = 'clients';
  columns: TableColumn<any>[] = [
    { label: 'Nombre', property: 'name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];
}
