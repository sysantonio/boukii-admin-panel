import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Observable, of, ReplaySubject } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
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
import { UntypedFormControl } from '@angular/forms';
import { ApiCrudService } from 'src/service/crud.service';


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
  updatePage: string = 'update';
  @Input()
  title: string;
  @Input()
  route: string;
  @Input()
  withHeader: boolean = true;
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

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private dialog: MatDialog, private router: Router, private crudService: ApiCrudService) {
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {}

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
    /**
     * Here we are updating our local array.
     * You would probably make an HTTP request here.
     */
    this.data.splice(this.data.findIndex((existing) => existing.id === item.id), 1);
    this.selection.deselect(item);
    this.subject$.next(this.data);

    try {
      const db = getFirestore();
      const menuRef = doc(collection(db, this.entity), item.id);
      await deleteDoc(menuRef);
      console.log('Menu deleted successfully');
    } catch (error) {
      console.error('Error deleting menu:', error);
    }
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
}
