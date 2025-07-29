import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeasonSelectorComponent } from './components/season-selector/season-selector.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { DataTableComponent } from './components/data-table/data-table.component';

@NgModule({
  declarations: [
    SeasonSelectorComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    DataTableComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SeasonSelectorComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    DataTableComponent
  ]
})
export class SharedModule {}
