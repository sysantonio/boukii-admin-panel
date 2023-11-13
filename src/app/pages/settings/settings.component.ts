import { Component, ElementRef, HostListener, NgZone, OnInit, ViewChild } from '@angular/core';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { SalaryCreateUpdateModalComponent } from './salary-create-update-modal/salary-create-update-modal.component';
import { MOCK_SPORT_DATA } from 'src/app/static-data/sports-data';
import { stagger20ms } from 'src/@vex/animations/stagger.animation';
import { LEVELS } from 'src/app/static-data/level-data';
import { MOCK_BLOCK } from 'src/app/static-data/blockage-data';
import { FormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { MOCK_PROVINCES } from 'src/app/static-data/province-data';

@Component({
  selector: 'vex-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [stagger20ms]
})
export class SettingsComponent implements OnInit {

  @ViewChild('scrollContainer') scrollContainer: ElementRef;

  seasonForm: UntypedFormGroup;
  myControlCountries = new FormControl();
  myControlProvinces = new FormControl();

  filteredCountries: Observable<any[]>;
  filteredProvinces: Observable<any[]>;

  mockSportData = MOCK_SPORT_DATA;
  mockLevelData = LEVELS;
  mockBlockageData = MOCK_BLOCK;
  mockCountriesData = MOCK_COUNTRIES;
  mockProvincesData = MOCK_PROVINCES;

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
  today = new Date();

  selectedFromHour: any;
  selectedToHour: any;
  hours: string[] = [];

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

  constructor(private ngZone: NgZone, private fb: UntypedFormBuilder) {}


  ngOnInit() {
    this.generateHours();

    this.seasonForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
      holidays: [''],
      street: [''],
      number: [''],
      postalCode: [''],
      phone: [''],
      country: [''],
      province: [''],
    });

    this.filteredCountries = this.myControlCountries.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this._filterCountries(name) : this.mockCountriesData.slice())
    );

    this.myControlCountries.valueChanges.subscribe(country => {
      this.myControlProvinces.setValue('');  // Limpia la selección anterior de la provincia
      this.filteredProvinces = this._filterProvinces(country.id);
    });
  }

  generateHours() {
    for (let i = 8; i <= 17; i++) {
      for (let j = 0; j < 60; j += 5) {
        const formattedHour = `${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`;
        this.hours.push(formattedHour);
      }
    }
  }

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

  displayFnCountry(country: any): string {
    return country && country.name ? country.name : '';
  }

  displayFnProvince(province: any): string {
    return province && province.name ? province.name : '';
  }

  private _filter(name: string, countryId: number): any[] {
    const filterValue = name.toLowerCase();
    return this.mockProvincesData.filter(province => province.id_country === countryId && province.name.toLowerCase().includes(filterValue));
  }

  private _filterCountries(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.mockCountriesData.filter(country => country.name.toLowerCase().includes(filterValue));
  }

  private _filterProvinces(countryId: number): Observable<any[]> {
    return this.myControlProvinces.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => name ? this._filter(name, countryId) : this.mockProvincesData.filter(p => p.id_country === countryId).slice())
    );
  }
}
