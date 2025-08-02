import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SeasonSelectorComponent } from './components/season-selector/season-selector.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { FormFieldComponent } from './forms/form-field.component';
import {NotificationBadgeComponent} from './components/notification-badge/notification-badge.component';

@NgModule({
  declarations: [
    SeasonSelectorComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    DataTableComponent,
    FormFieldComponent,
    NotificationBadgeComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    SeasonSelectorComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    DataTableComponent,
    FormFieldComponent,
    NotificationBadgeComponent
  ]
})
export class SharedModule {}
