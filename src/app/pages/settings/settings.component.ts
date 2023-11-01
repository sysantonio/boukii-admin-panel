import { Component } from '@angular/core';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { SalaryCreateUpdateModalComponent } from './salary-create-update-modal/salary-create-update-modal.component';
import { MOCK_SPORT_DATA } from 'src/app/static-data/sports-data';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { LEVELS } from 'src/app/static-data/level-data';

@Component({
  selector: 'vex-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [stagger20ms]
})
export class SettingsComponent {

  mockSportData = MOCK_SPORT_DATA;
  mockLevelData = LEVELS;
  constructor() {}

  createComponent = SalaryCreateUpdateModalComponent;
  entity = 'settings';
  columns: TableColumn<any>[] = [
    { label: '#', property: 'id', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Nom', property: 'name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Paiment', property: 'pay', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }

  ];

}
