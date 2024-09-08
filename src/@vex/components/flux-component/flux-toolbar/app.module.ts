import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FluxToolbarComponent } from './app.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { SecondaryToolbarModule } from '../../secondary-toolbar/secondary-toolbar.module';


@NgModule({
  declarations: [FluxToolbarComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    SecondaryToolbarModule
  ],
  exports: [FluxToolbarComponent]
})
export class FluxToolbarModule { }
