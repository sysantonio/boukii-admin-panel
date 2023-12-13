import { CommonModule, NgFor, NgIf } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { WidgetClientsGroupModule } from 'src/@vex/components/widgets/widget-clients-group/widget-clients-group.module';
import { WidgetClientsSportsModule } from 'src/@vex/components/widgets/widget-clients-sports/widget-clients-sports.module';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatListModule } from '@angular/material/list';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import {MatStepperModule} from '@angular/material/stepper';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BreadcrumbsModule } from 'src/@vex/components/breadcrumbs/breadcrumbs.module';
import { SecondaryToolbarModule } from 'src/@vex/components/secondary-toolbar/secondary-toolbar.module';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MonitorDetailComponent } from './monitor-detail.component';
import { MatTabsModule } from '@angular/material/tabs';
import { CalendarMonitorModule } from './calendar/calendar.module';
import { ConfirmModalModule } from './confirm-dialog/confirm-dialog.component.module';
import { PageLayoutModule } from 'src/@vex/components/page-layout/page-layout.module';
import { ComponentsModule } from 'src/@vex/components/components.module';
import { ComponentsCustomModule } from 'src/app/components/components-custom.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatSelectModule,
    MatMenuModule,
    MatDividerModule,
    MatAutocompleteModule,
    WidgetClientsGroupModule,
    WidgetClientsSportsModule,
    MatCardModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatListModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    MatStepperModule,
    MatSlideToggleModule,
    BreadcrumbsModule,
    SecondaryToolbarModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatChipsModule,
    NgFor,
    NgIf,
    MatTabsModule,
    MatTableModule,
    CalendarMonitorModule,
    ConfirmModalModule,
    PageLayoutModule,
    ComponentsModule,
    ComponentsCustomModule
  ],
  declarations: [MonitorDetailComponent],
  exports: [MonitorDetailComponent]
})
export class MonitorDetailModule {
}
