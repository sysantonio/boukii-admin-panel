import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BookingsRoutingModule } from './bookings-routing.module';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Translate
import { TranslateModule } from '@ngx-translate/core';

// NgRx
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

// Shared V5 Modules
import { DesignSystemModule } from '../../shared/design-system/design-system.module';
// import { SharedFormsModule } from '../../shared/forms/shared-forms.module';
// import { SharedComponentsModule } from '../../shared/components/shared-components.module';

// Components (comentadas hasta implementar)
// import { BookingListComponent } from './components/booking-list/booking-list.component';
// import { BookingWizardComponent } from './components/booking-wizard/booking-wizard.component';
// import { BookingDetailsComponent } from './components/booking-details/booking-details.component';
// import { BookingCalendarComponent } from './components/booking-calendar/booking-calendar.component';
// import { PricingCalculatorComponent } from './components/pricing-calculator/pricing-calculator.component';
// import { BookingStatusComponent } from './components/booking-status/booking-status.component';
// import { PaymentSummaryComponent } from './components/payment-summary/payment-summary.component';
// import { BookingConfirmationComponent } from './components/booking-confirmation/booking-confirmation.component';

// Season-Aware Components
import { BookingWizardSeasonComponent } from './components/booking-wizard-season/booking-wizard-season.component';
import { BookingListSeasonComponent } from './components/booking-list-season/booking-list-season.component';
// import { AvailabilityMatrixComponent } from './components/availability-matrix/availability-matrix.component';

// Services
import { BookingService } from './services/booking.service';
import { BookingPricingService } from './services/booking-pricing.service';
import { BookingWizardService } from './services/booking-wizard.service';
import { BookingStateService } from './services/booking-state.service';
import {MatDividerModule} from '@angular/material/divider';
import {bookingReducer} from './store/booking.reducer';

// Store (comentado temporalmente)
// import { bookingReducer } from './store/booking.reducer';
// import { BookingEffects } from './store/booking.effects';

@NgModule({
  declarations: [
    // Solo componentes que existen
    BookingWizardSeasonComponent,
    BookingListSeasonComponent
    // BookingListComponent,
    // BookingWizardComponent,
    // BookingDetailsComponent,
    // BookingCalendarComponent,
    // PricingCalculatorComponent,
    // BookingStatusComponent,
    // PaymentSummaryComponent,
    // BookingConfirmationComponent,
    // AvailabilityMatrixComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BookingsRoutingModule,

    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatRadioModule,
    MatExpansionModule,
    MatTooltipModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    TranslateModule,

    // NgRx (comentado temporalmente)
     StoreModule.forFeature('bookings', bookingReducer),
    // EffectsModule.forFeature([BookingEffects]),

    // Shared Modules
    DesignSystemModule,
    MatDividerModule,
    // SharedFormsModule,
    // SharedComponentsModule
  ],
  providers: [
    BookingService,
    BookingPricingService,
    BookingWizardService,
    BookingStateService
  ],
  exports: [
    BookingWizardSeasonComponent,
    BookingListSeasonComponent
    // BookingListComponent,
    // PricingCalculatorComponent,
    // AvailabilityMatrixComponent
  ]
})
export class BookingsModule { }
