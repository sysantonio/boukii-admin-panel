import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { CommonModule } from "@angular/common";

import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from "@angular/material/radio";
import { BookingFormStepper } from "./form-stepper/form-stepper.component";

import { StepOneComponent } from "./step-one/step-one.component";
import { StepTwoComponent } from "./step-two/step-two.component";
import { StepThreeComponent } from "./step-three/step-three.component";

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
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    TranslateModule,
  ],
  declarations: [
    BookingFormStepper,
    StepOneComponent,
    StepTwoComponent,
    StepThreeComponent,
  ],
  exports: [
    BookingFormStepper,
    StepOneComponent,
    StepTwoComponent,
    StepThreeComponent,
  ],
})
export class BookingComponentsModule {}
