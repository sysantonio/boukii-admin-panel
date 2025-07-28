import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  BookingV3WizardState, 
  ClientV3, 
  BookingV3Type, 
  CourseV3,
  BookingV3Configuration,
  BookingV3Summary
} from '../../interfaces/booking-v3.interfaces';
import { BookingV3Service } from '../../services/booking-v3.service';
import { ClientV3Service } from '../../services/client-v3.service';
import { WizardStateService } from '../../services/wizard-state.service';

@Component({
  selector: 'app-booking-wizard',
  template: `
    <vex-page-layout>
      <vex-page-layout-header class="pb-16 flex flex-col items-start justify-center">
        <div class="w-full flex flex-col sm:flex-row justify-between">
          <div>
            <h1 class="title mt-0 mb-1">{{ isEditing ? 'Editar Reserva' : 'Nueva Reserva' }}</h1>
            <div class="body-2 text-secondary">
              {{ getStepDescription() }}
            </div>
          </div>
          <div class="flex gap-4 mt-4 sm:mt-0 items-center">
            <button mat-outlined-button (click)="cancelar()">
              <mat-icon>close</mat-icon>
              Cancelar
            </button>
          </div>
        </div>
      </vex-page-layout-header>

      <vex-page-layout-content class="-mt-6">
        <!-- Loading State -->
        <div *ngIf="loading()" class="flex justify-center items-center py-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <!-- Progress Stepper -->
        <mat-card class="mb-6" *ngIf="!loading()">
          <div class="p-6">
            <mat-stepper [selectedIndex]="currentStep() - 1" [linear]="true" #stepper>
              
              <!-- STEP 1: Cliente Selection -->
              <mat-step [completed]="isStepCompleted(1)">
                <ng-template matStepLabel>Seleccionar Cliente</ng-template>
                <div class="py-6">
                  <app-client-selection-step 
                    [clientes]="availableClients()"
                    [selectedCliente]="wizardState().cliente"
                    [isCreatingNew]="wizardState().crearNuevoCliente"
                    (clienteSelected)="onClienteSelected($event)"
                    (createNewToggle)="onCreateNewClienteToggle()"
                    (newClienteData)="onNewClienteData($event)">
                  </app-client-selection-step>
                </div>
              </mat-step>

              <!-- STEP 2: Activity Selection -->
              <mat-step [completed]="isStepCompleted(2)">
                <ng-template matStepLabel>Tipo de Reserva</ng-template>
                <div class="py-6">
                  <app-activity-selection-step 
                    [tiposReserva]="availableTypes()"
                    [cursos]="availableCourses()"
                    [selectedTipo]="wizardState().tipoReserva"
                    [selectedCurso]="wizardState().cursoSeleccionado"
                    (tipoSelected)="onTipoSelected($event)"
                    (cursoSelected)="onCursoSelected($event)">
                  </app-activity-selection-step>
                </div>
              </mat-step>

              <!-- STEP 3: Schedule Selection -->
              <mat-step [completed]="isStepCompleted(3)">
                <ng-template matStepLabel>Programación</ng-template>
                <div class="py-6">
                  <app-schedule-selection-step 
                    [configuracion]="wizardState().configuracion"
                    (configuracionChanged)="onConfigurationChanged($event)">
                  </app-schedule-selection-step>
                </div>
              </mat-step>

              <!-- STEP 4: Participant Details -->
              <mat-step [completed]="isStepCompleted(4)">
                <ng-template matStepLabel>Detalles de Participantes</ng-template>
                <div class="py-6">
                  <app-participant-details-step 
                    [participantes]="wizardState().configuracion?.participantes || 1"
                    [detallesParticipantes]="wizardState().detallesParticipantes"
                    (participantesChanged)="onParticipantesChanged($event)">
                  </app-participant-details-step>
                </div>
              </mat-step>

              <!-- STEP 5: Pricing & Confirmation -->
              <mat-step [completed]="isStepCompleted(5)">
                <ng-template matStepLabel>Pricing</ng-template>
                <div class="py-6">
                  <app-pricing-confirmation-step 
                    [resumen]="buildSummary()"
                    [loading]="saving()"
                    (confirmBooking)="onConfirmBooking()">
                  </app-pricing-confirmation-step>
                </div>
              </mat-step>

              <!-- STEP 6: Final Review -->
              <mat-step [completed]="isStepCompleted(6)">
                <ng-template matStepLabel>Revisión Final</ng-template>
                <div class="py-6">
                  <app-final-review-step 
                    [resumen]="buildSummary()"
                    [loading]="saving()"
                    (finalizeBooking)="onFinalizeBooking()">
                  </app-final-review-step>
                </div>
              </mat-step>

            </mat-stepper>

            <!-- Navigation Buttons -->
            <div class="flex justify-between mt-6 pt-6 border-t">
              <button mat-button 
                      (click)="previousStep()" 
                      [disabled]="currentStep() === 1 || saving()">
                <mat-icon>arrow_back</mat-icon>
                Anterior
              </button>
              
              <div class="flex gap-2">
                <button mat-button (click)="cancelar()">Cancelar</button>
                
                <button *ngIf="currentStep() < 6" 
                        mat-raised-button 
                        color="primary"
                        (click)="nextStep()"
                        [disabled]="!canAdvance() || saving()">
                  Siguiente
                  <mat-icon>arrow_forward</mat-icon>
                </button>
                
                <button *ngIf="currentStep() === 6" 
                        mat-raised-button 
                        color="primary"
                        (click)="onFinalizeBooking()"
                        [disabled]="!canFinalize() || saving()">
                  <mat-spinner *ngIf="saving()" diameter="20" class="mr-2"></mat-spinner>
                  <mat-icon *ngIf="!saving()">check</mat-icon>
                  {{ isEditing ? 'Actualizar Reserva' : 'Crear Reserva' }}
                </button>
              </div>
            </div>
          </div>
        </mat-card>
      </vex-page-layout-content>
    </vex-page-layout>
  `,
  styles: [`
    .mat-stepper-horizontal {
      margin-top: 0;
    }
    .mat-step-header {
      pointer-events: none;
    }
  `]
})
export class BookingWizardComponent implements OnInit {
  
  // Injected Services
  private bookingService = inject(BookingV3Service);
  private clientService = inject(ClientV3Service);
  private wizardService = inject(WizardStateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Reactive State
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  currentStep = signal<number>(1);
  isEditing = signal<boolean>(false);
  
  // Data Signals
  availableClients = signal<ClientV3[]>([]);
  availableTypes = signal<BookingV3Type[]>([]);
  availableCourses = signal<CourseV3[]>([]);
  wizardState = signal<BookingV3WizardState>({
    paso: 1,
    cliente: undefined,
    tipoReserva: undefined,
    cursoSeleccionado: undefined,
    configuracion: {
      participantes: 1,
      fechasSeleccionadas: [],
      puntoEncuentro: '',
      notasAdicionales: ''
    },
    detallesParticipantes: [],
    crearNuevoCliente: false
  });

  async ngOnInit(): Promise<void> {
    await this.initializeWizard();
  }

  private async initializeWizard(): Promise<void> {
    try {
      this.loading.set(true);

      // Check if editing existing booking
      const bookingId = this.route.snapshot.paramMap.get('id');
      if (bookingId) {
        this.isEditing.set(true);
        await this.loadExistingBooking(bookingId);
      }

      // Load all required data
      await this.loadWizardData();

    } catch (error: any) {
      console.error('Error initializing wizard:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadWizardData(): Promise<void> {
    try {
      const [clients, types, courses] = await Promise.all([
        this.clientService.getClients().toPromise(),
        this.bookingService.getBookingTypes().toPromise(),
        this.bookingService.getCourses().toPromise()
      ]);

      this.availableClients.set(clients || []);
      this.availableTypes.set(types || []);
      this.availableCourses.set(courses || []);

    } catch (error: any) {
      console.error('Error loading wizard data:', error);
    }
  }

  private async loadExistingBooking(bookingId: string): Promise<void> {
    try {
      const booking = await this.bookingService.getBookingById(bookingId).toPromise();
      if (booking) {
        // Pre-populate wizard state with existing booking data
        this.wizardState.update(state => ({
          ...state,
          // Map existing booking to wizard state
          // This would need to be implemented based on your booking structure
        }));
      }
    } catch (error: any) {
      console.error('Error loading existing booking:', error);
    }
  }

  // ============= STEP MANAGEMENT =============

  nextStep(): void {
    if (this.canAdvance()) {
      const next = Math.min(6, this.currentStep() + 1);
      this.currentStep.set(next);
      this.wizardState.update(state => ({ ...state, paso: next }));
    }
  }

  previousStep(): void {
    const prev = Math.max(1, this.currentStep() - 1);
    this.currentStep.set(prev);
    this.wizardState.update(state => ({ ...state, paso: prev }));
  }

  canAdvance(): boolean {
    const state = this.wizardState();
    
    switch (this.currentStep()) {
      case 1:
        return !!(state.cliente || state.crearNuevoCliente);
      case 2:
        return !!state.tipoReserva && 
               (state.tipoReserva.requiresCourse ? !!state.cursoSeleccionado : true);
      case 3:
        return !!state.configuracion && 
               state.configuracion.participantes > 0 &&
               state.configuracion.fechasSeleccionadas.length > 0;
      case 4:
        return state.detallesParticipantes?.length === state.configuracion?.participantes;
      case 5:
        return true; // Pricing step validation
      default:
        return true;
    }
  }

  canFinalize(): boolean {
    return this.isStepCompleted(1) && 
           this.isStepCompleted(2) && 
           this.isStepCompleted(3) && 
           this.isStepCompleted(4) && 
           this.isStepCompleted(5);
  }

  isStepCompleted(step: number): boolean {
    const state = this.wizardState();
    
    switch (step) {
      case 1: return !!(state.cliente || state.crearNuevoCliente);
      case 2: return !!state.tipoReserva;
      case 3: return !!state.configuracion?.fechasSeleccionadas?.length;
      case 4: return state.detallesParticipantes?.length === state.configuracion?.participantes;
      case 5: return true;
      case 6: return true;
      default: return false;
    }
  }

  // ============= EVENT HANDLERS =============

  onClienteSelected(cliente: ClientV3): void {
    this.wizardState.update(state => ({ 
      ...state, 
      cliente, 
      crearNuevoCliente: false 
    }));
  }

  onCreateNewClienteToggle(): void {
    this.wizardState.update(state => ({ 
      ...state, 
      crearNuevoCliente: !state.crearNuevoCliente,
      cliente: state.crearNuevoCliente ? undefined : state.cliente
    }));
  }

  onNewClienteData(clienteData: Partial<ClientV3>): void {
    // Handle new client data creation
    this.wizardState.update(state => ({ 
      ...state, 
      nuevoClienteData: clienteData
    }));
  }

  onTipoSelected(tipo: BookingV3Type): void {
    this.wizardState.update(state => ({ 
      ...state, 
      tipoReserva: tipo,
      cursoSeleccionado: undefined // Reset course selection
    }));
  }

  onCursoSelected(curso: CourseV3): void {
    this.wizardState.update(state => ({ ...state, cursoSeleccionado: curso }));
  }

  onConfigurationChanged(configuracion: BookingV3Configuration): void {
    this.wizardState.update(state => ({ ...state, configuracion }));
  }

  onParticipantesChanged(detallesParticipantes: any[]): void {
    this.wizardState.update(state => ({ ...state, detallesParticipantes }));
  }

  onConfirmBooking(): void {
    // Move to final review step
    this.nextStep();
  }

  async onFinalizeBooking(): Promise<void> {
    try {
      this.saving.set(true);
      
      const bookingData = this.buildBookingData();
      
      let result;
      if (this.isEditing()) {
        const bookingId = this.route.snapshot.paramMap.get('id')!;
        result = await this.bookingService.updateBooking(bookingId, bookingData).toPromise();
      } else {
        result = await this.bookingService.createBooking(bookingData).toPromise();
      }

      if (result?.success) {
        // Navigate back to list with success message
        this.router.navigate(['/bookings-v3/reservas'], {
          queryParams: { 
            success: this.isEditing() ? 'updated' : 'created',
            id: result.booking?.id 
          }
        });
      }

    } catch (error: any) {
      console.error('Error finalizing booking:', error);
      // Handle error (show snackbar, etc.)
    } finally {
      this.saving.set(false);
    }
  }

  // ============= UTILITIES =============

  buildSummary(): BookingV3Summary {
    const state = this.wizardState();
    
    return {
      cliente: state.cliente || this.buildClienteFromForm(),
      tipoReserva: state.tipoReserva!,
      curso: state.cursoSeleccionado,
      configuracion: state.configuracion!,
      participantes: state.detallesParticipantes || [],
      precioBase: this.calculateBasePrice(),
      precioTotal: this.calculateTotalPrice(),
      fechas: state.configuracion?.fechasSeleccionadas || []
    };
  }

  private buildClienteFromForm(): ClientV3 | undefined {
    const state = this.wizardState();
    if (!state.crearNuevoCliente || !state.nuevoClienteData) return undefined;

    const data = state.nuevoClienteData;
    return {
      id: 0, // Will be assigned by backend
      nombre: data.nombre || '',
      apellido: data.apellido || '',
      email: data.email || '',
      telefono: data.telefono || '',
      nivel: data.nivel || 'Principiante',
      iniciales: ((data.nombre?.[0] || '') + (data.apellido?.[0] || '')).toUpperCase(),
      fechaRegistro: new Date(),
      isNew: true
    } as ClientV3;
  }

  private buildBookingData(): any {
    const summary = this.buildSummary();
    
    return {
      clienteId: summary.cliente?.id,
      nuevoCliente: summary.cliente?.isNew ? summary.cliente : undefined,
      tipoReservaId: summary.tipoReserva?.id,
      cursoId: summary.curso?.id,
      configuracion: summary.configuracion,
      participantes: summary.participantes,
      precioTotal: summary.precioTotal,
      notas: summary.configuracion?.notasAdicionales
    };
  }

  private calculateBasePrice(): number {
    const state = this.wizardState();
    return state.cursoSeleccionado?.precio || state.tipoReserva?.precioBase || 0;
  }

  private calculateTotalPrice(): number {
    const basePrice = this.calculateBasePrice();
    const participantes = this.wizardState().configuracion?.participantes || 1;
    return basePrice * participantes;
  }

  getStepDescription(): string {
    const descriptions = [
      'Paso 1 de 6: Seleccionar o crear cliente',
      'Paso 2 de 6: Elegir tipo de reserva y curso',
      'Paso 3 de 6: Configurar fechas y horarios',
      'Paso 4 de 6: Detalles de participantes',
      'Paso 5 de 6: Confirmar precios',
      'Paso 6 de 6: Revisión final y confirmación'
    ];
    return descriptions[this.currentStep() - 1] || '';
  }

  cancelar(): void {
    // Clear wizard state and navigate back
    this.wizardService.resetState();
    this.router.navigate(['/bookings-v3/reservas']);
  }
}