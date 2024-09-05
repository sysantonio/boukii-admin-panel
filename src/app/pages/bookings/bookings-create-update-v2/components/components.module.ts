import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { CommonModule } from "@angular/common";

import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { BookingFormStepper } from "./form-stepper/form-stepper.component";
import { StepOneComponent } from "./step-one/step-one.component";
import { MatButtonModule } from "@angular/material/button";
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    TranslateModule,
  ],
  declarations: [BookingFormStepper, StepOneComponent],
  exports: [BookingFormStepper, StepOneComponent],
})
export class BookingComponentsModule {}
