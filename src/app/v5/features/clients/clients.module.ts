import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ClientsRoutingModule } from './clients-routing.module';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';

// NgRx (for future implementation)
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

// Shared V5 Modules (comentado hasta implementar)
// import { SharedFormsModule } from '../../shared/forms/shared-forms.module';
// import { SharedComponentsModule } from '../../shared/components/shared-components.module';

// Components (solo los que existen)
import { ClientListSeasonComponent } from './components/client-list-season/client-list-season.component';

// Components comentados hasta implementar
// import { ClientDetailsSeasonComponent } from './components/client-details-season/client-details-season.component';
// import { ClientFormSeasonComponent } from './components/client-form-season/client-form-season.component';
// import { ClientBookingHistoryComponent } from './components/client-booking-history/client-booking-history.component';
// import { ClientCommunicationComponent } from './components/client-communication/client-communication.component';
// import { ClientStatsWidgetComponent } from './components/client-stats-widget/client-stats-widget.component';
// import { ClientSegmentationComponent } from './components/client-segmentation/client-segmentation.component';
// import { ClientImportDialogComponent } from './components/client-import-dialog/client-import-dialog.component';
// import { ClientExportDialogComponent } from './components/client-export-dialog/client-export-dialog.component';

// Dialogs comentados
// import { ClientDeleteConfirmDialogComponent } from './dialogs/client-delete-confirm-dialog/client-delete-confirm-dialog.component';
// import { ClientCommunicationDialogComponent } from './dialogs/client-communication-dialog/client-communication-dialog.component';
// import { ClientMergeDialogComponent } from './dialogs/client-merge-dialog/client-merge-dialog.component';

// Services (solo los que existen)
import { ClientSeasonService } from './services/client-season.service';

// Services comentados hasta implementar
// import { ClientCommunicationService } from './services/client-communication.service';
// import { ClientSegmentationService } from './services/client-segmentation.service';
// import { ClientImportExportService } from './services/client-import-export.service';

// Guards comentados
// import { ClientSeasonGuard } from './guards/client-season.guard';

// Resolvers comentados
// import { ClientDetailsResolver } from './resolvers/client-details.resolver';
// import { ClientStatsResolver } from './resolvers/client-stats.resolver';
import {TranslateModule} from '@ngx-translate/core';
import {MatLegacyChipsModule} from '@angular/material/legacy-chips';

@NgModule({
  declarations: [
    // Solo componentes que existen
    ClientListSeasonComponent

    // Componentes comentados hasta implementar
    // ClientDetailsSeasonComponent,
    // ClientFormSeasonComponent,
    // ClientBookingHistoryComponent,
    // ClientCommunicationComponent,
    // ClientStatsWidgetComponent,
    // ClientSegmentationComponent,
    // ClientImportDialogComponent,
    // ClientExportDialogComponent,
    // ClientDeleteConfirmDialogComponent,
    // ClientCommunicationDialogComponent,
    // ClientMergeDialogComponent
  ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ClientsRoutingModule,

        // Angular Material
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatChipsModule,
        MatMenuModule,
        MatDialogModule,
        MatSnackBarModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTooltipModule,
        MatTabsModule,
        MatExpansionModule,
        MatSlideToggleModule,
        MatDividerModule,
        MatBadgeModule,
        MatListModule,
        MatStepperModule,

        // NgRx (future implementation)
        // StoreModule.forFeature('clients', clientReducer),
        // EffectsModule.forFeature([ClientEffects]),

        // Shared Modules (comentado hasta implementar)
        // SharedFormsModule,
        // SharedComponentsModule,
        TranslateModule,
        MatLegacyChipsModule
    ],
  providers: [
    // Solo servicios que existen
    ClientSeasonService

    // Servicios comentados hasta implementar
    // ClientCommunicationService,
    // ClientSegmentationService,
    // ClientImportExportService,
    // ClientSeasonGuard,
    // ClientDetailsResolver,
    // ClientStatsResolver
  ],
  exports: [
    // Solo componentes que existen
    ClientListSeasonComponent

    // Comentados hasta implementar
    // ClientDetailsSeasonComponent,
    // ClientStatsWidgetComponent
  ]
})
export class ClientsModule {

  constructor() {
    console.log('📊 Clients Module V5 loaded - Season-aware client management with professional UI');
  }
}
