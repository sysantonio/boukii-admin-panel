import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SeasonSelectorComponent } from './components/season-selector/season-selector.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { FormFieldComponent } from './forms/form-field.component';

@NgModule({
  declarations: [
    SeasonSelectorComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    DataTableComponent,
    FormFieldComponent
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
    FormFieldComponent
  ]
})
export class SharedModule {}
