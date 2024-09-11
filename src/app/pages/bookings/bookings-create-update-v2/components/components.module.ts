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
import { MatSelectModule } from "@angular/material/select";

import { StepOneComponent } from "./step-one/step-one.component";
import { StepTwoComponent } from "./step-two/step-two.component";
import { StepThreeComponent } from "./step-three/step-three.component";
import { StepFourComponent } from "./step-four/step-four.component";
import { StepDetailsComponent } from "./step-details/step-details.component";

import { BookingDescriptionCard } from "./booking-description-card/booking-description-card.component";
import { BookingDialogComponent } from "./booking-dialog/booking-dialog.component";
import { CustomHeader } from "./calendar/custom-header/custom-header.component";
import { FormDetailsPrivateComponent } from "./form-details-private/form-details-private.component";

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
    MatSelectModule,
  ],
  declarations: [
    BookingFormStepper,
    StepOneComponent,
    StepTwoComponent,
    StepThreeComponent,
    BookingDescriptionCard,
    BookingDialogComponent,
    StepFourComponent,
    CustomHeader,
    StepDetailsComponent,
    FormDetailsPrivateComponent,
  ],
  exports: [
    BookingFormStepper,
    StepOneComponent,
    StepTwoComponent,
    StepThreeComponent,
    BookingDescriptionCard,
    BookingDialogComponent,
    StepFourComponent,
    CustomHeader,
    StepDetailsComponent,
    FormDetailsPrivateComponent,
  ],
})
export class BookingComponentsModule {}
