import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { SecondaryToolbarModule } from '../../secondary-toolbar/secondary-toolbar.module';
import { TranslateModule } from '@ngx-translate/core';
import { ComponenteInputComponent } from './input.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  declarations: [ComponenteInputComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    SecondaryToolbarModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  exports: [ComponenteInputComponent]
})
export class ComponenteInputModule { }
