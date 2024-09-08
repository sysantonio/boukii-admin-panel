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
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { BookingFormStepper } from "./form-stepper/form-stepper.component";
import { MatDatepickerModule } from "@angular/material/datepicker";

import { StepOneComponent } from "./step-one/step-one.component";
import { StepTwoComponent } from "./step-two/step-two.component";
import { StepThreeComponent } from "./step-three/step-three.component";
import { StepFourComponent } from "./step-four/step-four.component";

import { BookingDescriptionCard } from "./booking-description-card/booking-description-card.component";
import { BookingDialogComponent } from "./booking-dialog/booking-dialog.component";

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
    MatDialogModule,
    MatDatepickerModule,
  ],
  declarations: [
    BookingFormStepper,
    StepOneComponent,
    StepTwoComponent,
    StepThreeComponent,
    BookingDescriptionCard,
    BookingDialogComponent,
    StepFourComponent,
  ],
  exports: [
    BookingFormStepper,
    StepOneComponent,
    StepTwoComponent,
    StepThreeComponent,
    BookingDescriptionCard,
    BookingDialogComponent,
    StepFourComponent,
  ],
})
export class BookingComponentsModule {}
