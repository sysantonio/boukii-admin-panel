import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';

// Vex Modules
import { VexModule } from '../../../@vex/vex.module';
import { PageLayoutModule } from '../../../@vex/components/page-layout/page-layout.module';
import { SecondaryToolbarModule } from '../../../@vex/components/secondary-toolbar/secondary-toolbar.module';
import { BreadcrumbsModule } from '../../../@vex/components/breadcrumbs/breadcrumbs.module';

// Routing
import { BookingsV3RoutingModule } from './bookings-v3-routing.module';

// Main List Component (consolidado de Skipro)
import { BookingsListComponent } from './components/bookings-list/bookings-list.component';

// Wizard Components (consolidado V3 + Skipro)
import { BookingWizardComponent } from './components/booking-wizard/booking-wizard.component';
import { ClientSelectionStepComponent } from './components/booking-wizard/steps/client-selection/client-selection-step.component';
import { ActivitySelectionStepComponent } from './components/booking-wizard/steps/activity-selection/activity-selection-step.component';
import { ScheduleSelectionStepComponent } from './components/booking-wizard/steps/schedule-selection/schedule-selection-step.component';
import { ParticipantDetailsStepComponent } from './components/booking-wizard/steps/participant-details/participant-details-step.component';
import { PricingConfirmationStepComponent } from './components/booking-wizard/steps/pricing-confirmation/pricing-confirmation-step.component';
import { FinalReviewStepComponent } from './components/booking-wizard/steps/final-review/final-review-step.component';

// Client Management Components  
import { ClientProfileComponent } from './components/client-profile/client-profile.component';

// Modal Components
import { BookingDetailModalComponent } from './components/modals/booking-detail-modal/booking-detail-modal.component';
import { CancelBookingDialogComponent } from './components/modals/cancel-booking-dialog/cancel-booking-dialog.component';

// Shared Services
import { BookingV3Service } from './services/booking-v3.service';
import { ClientV3Service } from './services/client-v3.service';
import { WizardStateService } from './services/wizard-state.service';

// Service Factory para mock/real services
import { BOOKING_V3_PROVIDERS } from './services/service.factory';

@NgModule({
  declarations: [
    // Main Components
    BookingsListComponent,
    ClientProfileComponent,
    
    // Wizard Components
    BookingWizardComponent,
    ClientSelectionStepComponent,
    ActivitySelectionStepComponent,
    ScheduleSelectionStepComponent,
    ParticipantDetailsStepComponent,
    PricingConfirmationStepComponent,
    FinalReviewStepComponent,
    
    // Modal Components
    BookingDetailModalComponent,
    CancelBookingDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    
    // Angular Material Modules
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatRadioModule,
    MatExpansionModule,
    MatBadgeModule,
    MatListModule,
    MatDividerModule,
    MatTableModule,
    MatMenuModule,
    
    // Vex Modules
    VexModule,
    PageLayoutModule,
    SecondaryToolbarModule,
    BreadcrumbsModule,
    
    // Routing
    BookingsV3RoutingModule
  ],
  providers: [
    // Local Services
    BookingV3Service,
    ClientV3Service,
    WizardStateService,
    
    // Factory Services (mock/real toggle)
    ...BOOKING_V3_PROVIDERS
  ]
})
export class BookingsV3Module { }