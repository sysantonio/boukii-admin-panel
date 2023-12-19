import { AfterViewInit, ChangeDetectorRef, Component, DestroyRef, EventEmitter, Input, OnInit, Output, ViewChild, inject } from '@angular/core';
import { Observable, of, ReplaySubject } from 'rxjs';
import { filter, map, startWith, tap } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatSelectChange } from '@angular/material/select';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { stagger40ms } from 'src/@vex/animations/stagger.animation';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { Router } from '@angular/router';
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { FormControl, UntypedFormControl } from '@angular/forms';
import { ApiCrudService } from 'src/service/crud.service';
import { MOCK_COUNTRIES } from 'src/app/static-data/countries-data';
import { MOCK_PROVINCES } from 'src/app/static-data/province-data';
import moment from 'moment';
import { ConfirmModalComponent } from 'src/app/pages/monitors/monitor-detail/confirm-dialog/confirm-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@UntilDestroy()
@Component({
  selector: 'vex-aio-table',
  templateUrl: './aio-table.component.html',
  styleUrls: ['./aio-table.component.scss'],
  animations: [
    fadeInUp400ms,
    stagger40ms
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'fill'
      } as MatFormFieldDefaultOptions
    }
  ]
})
export class AioTableComponent implements OnInit, AfterViewInit {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  layoutCtrl = new UntypedFormControl('boxed');

  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  subject$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  data$: Observable<any[]> = this.subject$.asObservable();
  data: any[];

  @Input()
  columns: TableColumn<any>[] = [];
  @Input()
  entity: string;
  @Input()
  deleteEntity: string;
  @Input()
  updatePage: string = 'update';
  @Input()
  title: string;
  @Input()
  route: string;
  @Input()
  withHeader: boolean = true;
  @Input()
  canDelete: boolean = false;
  @Input()
  canDeactivate: boolean = false;
  @Input()
  createOnModal: boolean = false;
  @Input()
  widthModal?: string = '90vw';
  @Input()
  heigthModal?: string = '90vh';
  @Input()
  createComponent: any;
  @Input()
  showDetail: boolean = false;
  @Input()
  filterField: any = null;
  @Input()
  filterColumn: any = null;
  @Input()
  with: any = '';
  @Output()
  showDetailEvent = new EventEmitter<any>();
  pageSize = 10;
  totalRecords = 1000;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  dataSource: MatTableDataSource<any> | null;
  selection = new SelectionModel<any>(true, []);
  searchCtrl = new UntypedFormControl();

  loading = true;
  user: any;
  schoolId: any;
  clients: any = [];
  sports: any = [];
  countries = MOCK_COUNTRIES;
  provinces = MOCK_PROVINCES;
  sportsControl = new FormControl();
  filteredSports: Observable<any[]>;
  selectedSports: any[] = [];
  openFilters: boolean = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  reservationTypeSingle = false;
  reservationTypeMultiple = false;

  courseColective = false;
  coursePrivate = false;

  bookingPayed = false;
  bookingNoPayed = false;

  activeCourse = false;
  inActiveCourse = false;
  finishedCourse = false;
  allCourse = true;

  activeBooking = false;
  finishedBooking = false;
  allBookings = true;

  activeMonitor = false;
  inactiveMonitor = false;
  allMonitors = true;

  constructor(private dialog: MatDialog, private router: Router, private crudService: ApiCrudService, private cdr: ChangeDetectorRef) {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
    this.schoolId = this.user.schools[0].id;
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.getClients();
    this.getSports();
  }

  onButtonGroupClick($event){
    let clickedElement = $event.target || $event.srcElement;

    if( clickedElement.nodeName === "BUTTON" ) {

      let isCertainButtonAlreadyActive = clickedElement.parentElement.querySelector(".active");
      // if a Button already has Class: .active
      if( isCertainButtonAlreadyActive ) {
        isCertainButtonAlreadyActive.classList.remove("active");
      }

      clickedElement.className += " active";
    }

  }

  filterData(incFilter = '') {
    let filter = '';

    if(this.entity.includes('booking')) {

      if (this.courseColective && !this.coursePrivate) {
        filter = filter + '&course_type=1';
      } else if (!this.courseColective && this.coursePrivate) {
        filter = filter + '&course_type=2';
      }

      if (this.bookingPayed && !this.bookingNoPayed) {
        filter = filter + '&paid=1';
      } else if (!this.bookingPayed && this.bookingNoPayed) {
        filter = filter + '&paid=0';
      }

      if (this.courseColective && !this.coursePrivate) {
        filter = filter + '&courseType=1';
      } else if (!this.courseColective && this.coursePrivate) {
        filter = filter + '&courseType=2';
      }

      if (this.reservationTypeSingle && !this.reservationTypeMultiple) {
        filter = filter + '&isMultiple=0';
      } else if (!this.reservationTypeSingle && this.reservationTypeMultiple) {
        filter = filter + '&isMultiple=1';
      }

    }

    if(this.entity.includes('courses')) {

      if (this.courseColective && !this.coursePrivate) {
        filter = filter + '&course_type=1';
      } else if (!this.courseColective && this.coursePrivate) {
        filter = filter + '&course_type=2';
      }

      if(this.sportsControl.value.length !== this.sports.length) {
        const ids = [];
        this.sportsControl.value.forEach(element => {
          ids.push(element.id);
        });
        filter = filter + '&sport_id='+ids.toString();
      }
    }
    this.getFilteredData(1, 10, incFilter + filter);
  }

  /**
   * Example on how to get data and pass it to the table - usually you would want a dedicated service with a HTTP request for this
   * We are simulating this request here.
   */
  getFilteredData(pageIndex: number, pageSize: number, filter: any) {
    this.loading = true;

    // Asegúrate de que pageIndex y pageSize se pasan correctamente.
    // Puede que necesites ajustar pageIndex según cómo espera tu backend que se paginen los índices (base 0 o base 1).
    this.crudService.list(this.entity, pageIndex, pageSize, 'desc', 'id', filter + (this.filterField !== null ? '&'+this.filterColumn +'='+this.filterField : ''), '', '', this.with)
      .subscribe((response: any) => {
        this.data = response.data;
        this.dataSource.data = response.data;
        this.totalRecords = response.total; // Total de registros disponibles.
        console.log(`Data received for page: ${pageIndex}`);

        this.loading = false;
      });
  }


  /**
   * Example on how to get data and pass it to the table - usually you would want a dedicated service with a HTTP request for this
   * We are simulating this request here.
   */
  getData(pageIndex: number, pageSize: number) {
    this.loading = true;

    // Asegúrate de que pageIndex y pageSize se pasan correctamente.
    // Puede que necesites ajustar pageIndex según cómo espera tu backend que se paginen los índices (base 0 o base 1).
    this.crudService.list(this.entity, pageIndex, pageSize, 'desc', 'id', (this.filterField !== null ? '&'+this.filterColumn +'='+this.filterField : ''), '', '', this.with)
      .subscribe((response: any) => {
        this.data = response.data;
        this.dataSource.data = response.data;
        this.totalRecords = response.total; // Total de registros disponibles.
        console.log(`Data received for page: ${pageIndex}`);

        this.searchCtrl.valueChanges
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((value) => this.onFilterChange(value));
        this.loading = false;
      });
  }

  onPageChange(event: PageEvent) {
    // La API puede esperar la primera página como 1, no como 0.
    this.getData(event.pageIndex +1, event.pageSize);
  }

ngAfterViewInit() {
  this.dataSource = new MatTableDataSource();
  this.dataSource.sort = this.sort;

  // Llama a getData con la primera página. Asegúrate de que este valor coincida con cómo tu API espera la primera página.
  this.getData(1, 10); // Si tu API espera que la primera página sea 1 en lugar de 0.

  // ... otros inicializadores
}

  create() {
    if (!this.createOnModal) {
      const route = '/' + this.route + '/create';
      this.router.navigate([route]);
    } else {
      this.createModal();
    }
  }

  createModal() {

    const dialogRef = this.dialog.open(this.createComponent, {
      width: this.widthModal,
      height: this.heigthModal,
      maxWidth: '100vw',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog'  // Si necesitas estilos adicionales
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.getData(1, 10);

      }
    });
  }

  update(row: any) {
    if (!this.createOnModal) {
      this.router.navigate(['/' + this.route + '/' +this.updatePage + '/' +row.id]);

    } else {
      this.updateModal(row);
    }
  }

  updateModal(row: any) {
    const dialogRef = this.dialog.open(this.createComponent, {
      width: this.widthModal,
      height: this.heigthModal,
      maxWidth: '100vw',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales
      data: row
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.getData(1, 10);
      }
    });
  }

  showDetailFn(row: any) {
    this.showDetailEvent.emit({showDetail: !this.showDetail, item: row});
  }

  async delete(item: any) {

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      maxWidth: '100vw',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales,
      data: {message: 'Do you want to remove this item? This action will be permanetly', title: 'Delete monitor course'}
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {

        this.crudService.delete(this.deleteEntity, item.id)
          .subscribe(() => {
            this.getData(1, 10);
          })
      }
    });
  }

  deactivate(item: any) {

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      maxWidth: '100vw',  // Asegurarse de que no haya un ancho máximo
      panelClass: 'full-screen-dialog',  // Si necesitas estilos adicionales,
      data: {message: 'Do you want to remove this item? This action will be permanetly', title: 'Delete monitor course'}
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {

        this.crudService.update(this.deleteEntity, {active: false}, item.id)
          .subscribe(() => {
            this.getData(1, 10);
          })
      }
    });
  }
  deleteMultiple(items: any[]) {
    /**
     * Here we are updating our local array.
     * You would probably make an HTTP request here.
     */
    items.forEach(c => this.delete(c));
  }

  onFilterChange(value: string) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  toggleColumnVisibility(column, event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    column.visible = !column.visible;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  onLabelChange(change: MatSelectChange, row: any) {
    const index = this.data.findIndex(c => c === row);
    this.data[index].labels = change.value;
    this.subject$.next(this.data);
  }

  transformDates(dates: any) {
    let ret = "";
    if (dates) {

      dates.forEach((element, idx) => {
        if (idx < 2) {
          ret = ret + '<b>' + element + '</b>' + '<br>';
        } else if (idx === 2){
          ret = ret + element + '-';
        } else {
          ret = ret + element;
        }
      });
    }

    return ret;
  }

  transformRegisterDates(dates: any) {
    let ret = "";
    if (dates) {

      dates.forEach((element, idx) => {
        if (idx === 0) {
          ret = ret + '<b>' + element + '</b>' + '<br>';
        } else {
          ret = ret + element;
        }
      });
    }

    return ret;
  }

  calculateAge(birthDateString) {
    if(birthDateString && birthDateString !== null) {
      const today = new Date();
      const birthDate = new Date(birthDateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }

      return age;
    } else {
      return 0;
    }

  }

  calculateMaxBookings(data: any) {
    let ret = 0;

    if (data.is_flexible && data.course_type === 1) {
      data.course_dates.forEach(courseDate => {
        courseDate.course_groups.forEach(group => {
            group.course_subgroups.forEach(sb => {
              ret = ret + sb.max_participants;
            });
        });

      });
    } else {
      return data.max_participants * data.course_dates.length;
    }
    return ret;
  }

  getSportNames(data: any) {
    let ret = 'NDF';

    data.forEach((element, idx) => {
      ret = element.sport.name + (idx + 1 === data.length ? '' : ', ');
    });

    return ret;
  }
  getSportNamesMonitor(data: any) {
    let ret = 'NDF';

    data.forEach((element, idx) => {
      ret = element.name + (idx + 1 === data.length ? '' : ', ');
    });

    return ret;
  }

  getBookingCourse(data: any) {
    if (data.length === 1 || this.checkIfCourseIdIsSame(data)) {
      return data[0].course.name;
    } else {
      return 'MULTIPLE';
    }
  }

  checkIfCourseIdIsSame(data: any[]): boolean {
    if (data.length === 0) {
      return true; // o false, según tu lógica de negocio
    }

    const firstCourseId = data[0].course.id;
    return data.every(item => item.course.id === firstCourseId);
  }

  getBookingCourseMonitorClient(data: any) {
    return data.name;
  }

  getMinMaxDates(data: any[]): { minDate: string, maxDate: string, days: number } {
    let days = 0;
    if (data.length === 0) {
      return { minDate: '', maxDate: '', days: days };
    }

    let minDate = new Date(data[0].date);
    let maxDate = new Date(data[0].date);

    data.forEach(item => {
      const currentDate = new Date(item.date);
      if (currentDate < minDate) {
        minDate = currentDate;
      }
      if (currentDate > maxDate) {
        maxDate = currentDate;
      }
      days = days + 1;
    });

    return { minDate: minDate.toISOString(), maxDate: maxDate.toISOString(), days: days };
  }

  getMinMaxHours(data: any[]): { minHour: string, maxHour: string } {
    if (data.length === 0) {
      return { minHour: '', maxHour: '' };
    }
    let minHour = null;
    let maxHour = null;
    if (data[0].course.course_type === 2) {
      minHour = data[0].hour_start;
      maxHour = this.calculateHourEnd(data[0].hour_start, data[0].course.duration);

    } else {
      minHour = data[0].hour_start;
      maxHour = data[0].hour_end.replace(':00', '');

      data.forEach(item => {
        if (item.hour_start < minHour) {
          minHour = item.hour_start;
        }
        if (item.hour_end > maxHour) {
          maxHour = item.hour_end.replace(':00', '');
        }
      });
    }

    minHour = minHour.replace(':00', '');

    return { minHour, maxHour };
  }

  calculateHourEnd(hour: any, duration: any) {
    if(duration.includes('h') && duration.includes('min')) {
      const hours = duration.split(' ')[0].replace('h', '');
      const minutes = duration.split(' ')[1].replace('min', '');

      return moment(hour, 'HH:mm').add(hours, 'h').add(minutes, 'm').format('HH:mm');
    } else if(duration.includes('h')) {
      const hours = duration.split(' ')[0].replace('h', '');

      return moment(hour, 'HH:mm').add(hours, 'h').format('HH:mm');
    } else {
      const minutes = duration.split(' ')[0].replace('min', '');

      return moment(hour, 'HH:mm').add(minutes, 'm').format('HH:mm');
    }
  }

  getCourseType(data: any) {
    //if (data.length === 1) {
      return data.course_type === 1 ? 'collectif' : 'prive'
    /*} else {
      return 'MULTIPLE';
    }*/
  }

  getBookingType(data: any) {
    //if (data.length === 1) {
      return data.course.course_type === 1 ? 'collectif' : 'prive'
    /*} else {
      return 'MULTIPLE';
    }*/
  }

  getCourseImage(data: any) {
    //if (data.length === 1) {
      const ret = this.sports.find((s) => s.id === data.sport_id);
      return ret ? ret.name.toLowerCase() : '';
   /* } else {
      return 'MULTIPLE';
    }*/
  }

  getBookingImage(data: any) {
    //if (data.length === 1) {
      const ret = this.sports.find((s) => s.id === data.course.sport_id);
      return ret ? ret.name.toLowerCase() : '';
   /* } else {
      return 'MULTIPLE';
    }*/
  }

  getClient(id: number) {
    if (id && id !== null) {

      const client = this.clients.find((m) => m.id === id);

      return client;
    }
  }

  getClients() {
    this.crudService.list('/admin/clients', 1, 10000, 'desc', 'id', '&school_id='+this.user.schools[0].id)
      .subscribe((data: any) => {
        this.clients = data.data;

      })
  }
  getSports() {
    this.crudService.list('/sports', 1, 1000, 'asc', 'name', '&school_id='+this.user.schools[0].id)
      .subscribe((data) => {
        this.sports = data.data;
        this.sportsControl.patchValue(data.data);

        this.filteredSports = this.sportsControl.valueChanges.pipe(
          startWith(''),
          map((sport: string | null) => sport ? this._filterSports(sport) : this.sports.slice())
        );

      })
  }

  getCountry(id: any) {
    const country = this.countries.find((c) => c.id == +id);
    return country ? country.name : 'NDF';
  }

  getProvince(id: any) {
    const province = this.provinces.find((c) => c.id == +id);
    return province ? province.name : 'NDF';
  }

  getNacionality(id: any) {
    const country = this.countries.find((c) => c.id == +id);
    return country ? country.code : 'NDF';
  }

  getSelectedSportsNames(): string {
    return this.sportsControl.value?.map(sport => sport.name).join(', ') || '';
  }

  private _filterSports(value: any): any[] {
    const filterValue = typeof value === 'string' ? value?.toLowerCase() : value?.name.toLowerCase();
    return this.sports.filter(sport => sport?.name.toLowerCase().indexOf(filterValue) === 0);
  }

  toggleSelection(sport: any): void {
    const index = this.selectedSports.findIndex(s => s.sport_id === sport.sport_id);
    if (index >= 0) {
      this.selectedSports.splice(index, 1);
    } else {
      this.selectedSports.push(sport);
    }

    // Crear una nueva referencia para el array
    this.selectedSports = [...this.selectedSports];

    // Detectar cambios manualmente para asegurarse de que Angular reconozca los cambios
    this.cdr.detectChanges();
  }

}
