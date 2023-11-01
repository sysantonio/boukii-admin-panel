import { Component, ElementRef, HostListener, NgZone, ViewChild } from '@angular/core';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { SalaryCreateUpdateModalComponent } from './salary-create-update-modal/salary-create-update-modal.component';
import { MOCK_SPORT_DATA } from 'src/app/static-data/sports-data';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { LEVELS } from 'src/app/static-data/level-data';
import { MOCK_BLOCK } from 'src/app/static-data/blockage-data';

@Component({
  selector: 'vex-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [stagger20ms]
})
export class SettingsComponent {

  @ViewChild('scrollContainer') scrollContainer: ElementRef;

  mockSportData = MOCK_SPORT_DATA;
  mockLevelData = LEVELS;
  mockBlockageData = MOCK_BLOCK;

  people = 6; // Aquí puedes cambiar el número de personas
  intervalos = Array.from({ length: 28 }, (_, i) => 15 + i * 15);

  dataSource = this.intervalos.map(intervalo => {
    const fila: any = { intervalo: this.formatIntervalo(intervalo) };
    for (let i = 1; i <= this.people; i++) {
      fila[`persona ${i}`] = '';
    }
    return fila;
  });

  displayedColumns = ['intervalo', ...Array.from({ length: this.people }, (_, i) => `persona ${i + 1}`)];

  constructor(private ngZone: NgZone) {}

  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent) {
    this.ngZone.runOutsideAngular(() => {
      if (this.scrollContainer && this.scrollContainer.nativeElement) {
        const container = this.scrollContainer.nativeElement;
        const isHorizontalScroll = event.shiftKey;
        if (isHorizontalScroll) {
          container.scrollLeft += event.deltaY;
        } else {
          container.scrollLeft += event.deltaY;
        }
        event.preventDefault();
      }
    });
  }

  createComponent = SalaryCreateUpdateModalComponent;
  entity = 'settings';
  columns: TableColumn<any>[] = [
    { label: '#', property: 'id', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Nom', property: 'name', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Paiment', property: 'pay', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }

  ];

  formatIntervalo(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas > 0 ? horas + 'h ' : ''}${mins > 0 ? mins + 'm' : ''}`.trim();
  }

  updateTable() {
    // Lógica para actualizar la tabla basándote en el valor de this.people

    // Por ejemplo, podrías actualizar las columnas mostradas:
    this.displayedColumns = ['intervalo']; // Inicializa con la columna de intervalo
    for (let i = 1; i <= this.people; i++) {
      this.displayedColumns.push(i + ' Persona'); // Añade columnas para cada persona
    }

    // También podrías necesitar actualizar los datos mostrados en la tabla
    // ...
  }
}
