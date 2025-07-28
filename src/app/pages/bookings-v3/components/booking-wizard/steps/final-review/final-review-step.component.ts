import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BookingV3Summary } from '../../../../interfaces/booking-v3.interfaces';

@Component({
  selector: 'app-final-review-step',
  template: `
    <div class="final-review-step">
      <div class="text-center mb-8">
        <mat-icon class="text-6xl text-green-500 mb-4">check_circle_outline</mat-icon>
        <h3 class="text-2xl font-semibold mb-2">Revisión Final</h3>
        <p class="text-secondary">Revise toda la información antes de confirmar la reserva</p>
      </div>

      <div class="max-w-4xl mx-auto space-y-6">
        
        <!-- Complete Summary Card -->
        <mat-card class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <!-- Left Column - Booking Details -->
            <div>
              <h4 class="font-semibold mb-4 flex items-center">
                <mat-icon class="mr-2 text-primary">assignment</mat-icon>
                Detalles de la Reserva
              </h4>
              
              <!-- Client -->
              <div class="mb-6">
                <h5 class="font-medium mb-2">Cliente</h5>
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div class="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
                    {{ resumen?.cliente?.iniciales }}
                  </div>
                  <div>
                    <div class="font-medium">{{ resumen?.cliente?.nombre }} {{ resumen?.cliente?.apellido }}</div>
                    <div class="text-sm text-secondary">{{ resumen?.cliente?.email }}</div>
                    <div class="text-sm text-secondary">{{ resumen?.cliente?.telefono }}</div>
                  </div>
                </div>
              </div>

              <!-- Activity -->
              <div class="mb-6">
                <h5 class="font-medium mb-2">Actividad</h5>
                <div class="p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <mat-icon [style.color]="resumen?.tipoReserva?.color">
                      {{ resumen?.tipoReserva?.icon }}
                    </mat-icon>
                    <span class="font-medium">{{ resumen?.tipoReserva?.nombre }}</span>
                  </div>
                  <div *ngIf="resumen?.curso" class="text-sm text-secondary">
                    <strong>{{ resumen.curso.nombre }}</strong> - {{ resumen.curso.descripcion }}
                  </div>
                </div>
              </div>

              <!-- Schedule -->
              <div class="mb-6">
                <h5 class="font-medium mb-2">Programación</h5>
                <div class="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
                  <div>
                    <span class="font-medium">Fechas:</span>
                    <div class="ml-4 mt-1 space-y-1">
                      <div *ngFor="let fecha of resumen?.fechas" class="text-secondary">
                        {{ fecha | date:'EEEE, d MMMM y':'es' }}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span class="font-medium">Horario:</span>
                    <span class="ml-2">{{ getHorarioDisplay(resumen?.configuracion?.horarioPreferido) }}</span>
                  </div>
                  <div *ngIf="resumen?.configuracion?.puntoEncuentro">
                    <span class="font-medium">Punto de encuentro:</span>
                    <span class="ml-2">{{ resumen.configuracion.puntoEncuentro }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column - Participants & Pricing -->
            <div>
              <h4 class="font-semibold mb-4 flex items-center">
                <mat-icon class="mr-2 text-primary">group</mat-icon>
                Participantes y Precio
              </h4>

              <!-- Participants -->
              <div class="mb-6">
                <h5 class="font-medium mb-2">
                  Participantes ({{ resumen?.participantes?.length || 0 }})
                </h5>
                <div class="space-y-2">
                  <div *ngFor="let participante of resumen?.participantes; let i = index" 
                       class="p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                        {{ i + 1 }}
                      </span>
                      <span class="font-medium">{{ participante.nombre }} {{ participante.apellido }}</span>
                      <span class="text-xs px-2 py-1 bg-gray-200 rounded-full">{{ participante.nivel }}</span>
                    </div>
                    <div class="text-sm text-secondary ml-8">
                      {{ participante.edad }} años
                      <span *ngIf="participante.equipoRequerido" class="ml-2">
                        • Equipo incluido
                      </span>
                    </div>
                    <div *ngIf="participante.observaciones" class="text-xs text-secondary ml-8 mt-1">
                      {{ participante.observaciones }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pricing Summary -->
              <div class="mb-6">
                <h5 class="font-medium mb-2">Resumen de Precio</h5>
                <div class="p-4 bg-primary-50 rounded-lg space-y-2">
                  <div class="flex justify-between text-sm">
                    <span>Precio base:</span>
                    <span>{{ resumen?.precioBase }}€</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span>Participantes:</span>
                    <span>× {{ resumen?.configuracion?.participantes }}</span>
                  </div>
                  <div class="flex justify-between text-sm" *ngIf="(resumen?.fechas?.length || 0) > 1">
                    <span>Días:</span>
                    <span>× {{ resumen?.fechas?.length }}</span>
                  </div>
                  <div class="flex justify-between text-sm" *ngIf="hasEquipmentRental()">
                    <span>Alquiler equipo:</span>
                    <span>{{ calculateEquipmentCost() }}€</span>
                  </div>
                  <div class="border-t border-primary-200 pt-2 mt-2">
                    <div class="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span class="text-primary">{{ resumen?.precioTotal }}€</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Notes -->
          <div *ngIf="resumen?.configuracion?.notasAdicionales" class="mt-6 pt-6 border-t">
            <h5 class="font-medium mb-2">Notas Adicionales</h5>
            <div class="p-3 bg-yellow-50 rounded-lg text-sm">
              {{ resumen.configuracion.notasAdicionales }}
            </div>
          </div>
        </mat-card>

        <!-- Terms and Conditions -->
        <mat-card class="p-6">
          <h4 class="font-semibold mb-4 flex items-center">
            <mat-icon class="mr-2 text-primary">gavel</mat-icon>
            Términos y Condiciones
          </h4>
          
          <div class="space-y-4 text-sm">
            <div class="flex items-start gap-3">
              <mat-checkbox [(ngModel)]="termsAccepted" 
                           (ngModelChange)="onTermsChange()"
                           color="primary">
              </mat-checkbox>
              <div>
                <strong>Acepto los términos y condiciones de la reserva:</strong>
                <ul class="mt-2 space-y-1 text-secondary ml-4 list-disc">
                  <li>Pago completo requerido para confirmar la reserva</li>
                  <li>Cancelación gratuita hasta 48 horas antes del inicio</li>
                  <li>Reprogramación sin coste hasta 24 horas antes</li>
                  <li>El equipo de esquí está sujeto a disponibilidad</li>
                  <li>Los instructores se asignan según disponibilidad y nivel</li>
                </ul>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <mat-checkbox [(ngModel)]="dataProcessingAccepted" 
                           (ngModelChange)="onTermsChange()"
                           color="primary">
              </mat-checkbox>
              <div>
                <strong>Acepto el tratamiento de datos personales</strong>
                <p class="mt-2 text-secondary">
                  Los datos proporcionados serán utilizados únicamente para la gestión de la reserva 
                  y comunicaciones relacionadas con el servicio.
                </p>
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Final Actions -->
        <div class="text-center space-y-4">
          <div class="p-4 bg-green-50 rounded-lg" *ngIf="allTermsAccepted()">
            <div class="flex items-center justify-center text-green-800">
              <mat-icon class="mr-2">check_circle</mat-icon>
              <span class="font-medium">Todo listo para confirmar la reserva</span>
            </div>
          </div>

          <div class="p-4 bg-red-50 rounded-lg" *ngIf="!allTermsAccepted()">
            <div class="flex items-center justify-center text-red-800">
              <mat-icon class="mr-2">error</mat-icon>
              <span class="font-medium">Por favor, acepta todos los términos para continuar</span>
            </div>
          </div>

          <div class="flex gap-4 justify-center">
            <button mat-stroked-button 
                    class="px-8"
                    [disabled]="loading">
              <mat-icon>edit</mat-icon>
              Modificar
            </button>
            
            <button mat-raised-button 
                    color="primary" 
                    class="px-8"
                    [disabled]="!allTermsAccepted() || loading"
                    (click)="onFinalizeBooking()">
              <mat-spinner *ngIf="loading" diameter="20" class="mr-2"></mat-spinner>
              <mat-icon *ngIf="!loading">payment</mat-icon>
              Confirmar y Pagar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .final-review-step {
      min-height: 600px;
    }
    .mat-mdc-card {
      @apply shadow-sm border border-gray-200;
    }
  `]
})
export class FinalReviewStepComponent {
  @Input() resumen: BookingV3Summary | undefined;
  @Input() loading: boolean = false;
  @Output() finalizeBooking = new EventEmitter<void>();

  termsAccepted = false;
  dataProcessingAccepted = false;

  hasEquipmentRental(): boolean {
    return this.resumen?.participantes?.some(p => p.equipoRequerido) || false;
  }

  calculateEquipmentCost(): number {
    const equipmentCostPerPerson = 15; // €15 per person per day
    const count = this.resumen?.participantes?.filter(p => p.equipoRequerido).length || 0;
    const days = this.resumen?.fechas?.length || 1;
    return count * equipmentCostPerPerson * days;
  }

  getHorarioDisplay(horario: string | undefined): string {
    switch (horario) {
      case 'manana': return 'Mañana (9:00-12:00)';
      case 'tarde': return 'Tarde (13:00-16:00)';
      case 'completo': return 'Día completo';
      default: return horario || 'No especificado';
    }
  }

  onTermsChange(): void {
    // This allows for additional validation or actions when terms change
  }

  allTermsAccepted(): boolean {
    return this.termsAccepted && this.dataProcessingAccepted;
  }

  onFinalizeBooking(): void {
    if (this.allTermsAccepted()) {
      this.finalizeBooking.emit();
    }
  }
}