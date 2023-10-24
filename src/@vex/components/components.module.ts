
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AioTableComponent } from './aio-table/aio-table.component';
import { LayoutModule } from '@angular/cdk/layout';
import { PageLayoutModule } from './page-layout/page-layout.module';
import { BreadcrumbsModule } from './breadcrumbs/breadcrumbs.module';
import { BookingsCreateUpdateModule } from 'src/app/pages/bookings/bookings-create-update/bookings-create-update.module';
import { CoursesCreateUpdateModule } from 'src/app/pages/courses/courses-create-update/courses-create-update.module';
import { DateTimeDialogComponent } from './date-time-dialog/date-time-dialog.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { ReductionDialogComponent } from './reduction-dialog/reduction-dialog.component';

@NgModule({
    imports: [
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
      PageLayoutModule,
      BreadcrumbsModule,
      MatPaginatorModule,
      MatTableModule,
      MatSortModule,
      MatCheckboxModule,
      MatIconModule,
      MatButtonModule,
      MatMenuModule,
      FormsModule,
      MatTooltipModule,
      ReactiveFormsModule,
      MatSelectModule,
      MatButtonToggleModule,
      MatDialogModule,
      LayoutModule,
      MatSnackBarModule,
      MatProgressSpinnerModule,
      BookingsCreateUpdateModule,
      CoursesCreateUpdateModule,
      MatAutocompleteModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatInputModule
    ],
  declarations: [AioTableComponent, DateTimeDialogComponent, ReductionDialogComponent],
  entryComponents: [AioTableComponent],
  exports: [AioTableComponent]
})

export class ComponentsModule {
}
