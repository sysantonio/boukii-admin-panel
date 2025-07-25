import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

// Vex Modules
import { VexModule } from '../../@vex/vex.module';
import { PageLayoutModule } from '../../@vex/components/page-layout/page-layout.module';

// Routing
import { SkiProRoutingModule } from './skipro-routing.module';

// Components
import { SkiProReservasListComponent } from './components/skipro-reservas-list/skipro-reservas-list.component';
import { SkiProWizardComponent } from './components/skipro-wizard/skipro-wizard.component';
import { SkiProClientePerfilComponent } from './components/skipro-cliente-perfil/skipro-cliente-perfil.component';
import { SkiProWizardInlineComponent } from './components/skipro-wizard-inline/skipro-wizard-inline.component';
import { SkiProClientePerfilInlineComponent } from './components/skipro-cliente-perfil-inline/skipro-cliente-perfil-inline.component';
import { SkiProReservaDetallesComponent } from './components/skipro-reserva-detalles/skipro-reserva-detalles.component';
import { SkiProCancelarReservaComponent } from './components/skipro-cancelar-reserva/skipro-cancelar-reserva.component';
import { BookingDetailModalComponent } from './components/booking-detail-modal/booking-detail-modal.component';
import { CancelBookingDialogComponent } from './components/cancel-booking-dialog/cancel-booking-dialog.component';

// Services
import { SkiProMockDataService } from './services/mock/skipro-mock-data.service';
import { MockDataService } from './services/mock/mock-data.service';

@NgModule({
  declarations: [
    SkiProReservasListComponent,
    SkiProWizardComponent,
    SkiProClientePerfilComponent,
    SkiProWizardInlineComponent,
    SkiProClientePerfilInlineComponent,
    SkiProReservaDetallesComponent,
    SkiProCancelarReservaComponent,
    BookingDetailModalComponent,
    CancelBookingDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    
    // Angular Material
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    
    // Vex
    VexModule,
    PageLayoutModule,
    
    // Routing
    SkiProRoutingModule
  ],
  providers: [
    SkiProMockDataService,
    MockDataService
  ]
})
export class SkiProModule { }