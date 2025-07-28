import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BookingV3Summary } from '../../../../interfaces/booking-v3.interfaces';

@Component({
  selector: 'app-pricing-confirmation-step',
  template: `
    <div class="pricing-confirmation-step">
      <h3 class="text-lg font-semibold mb-6">Confirmación de Precios</h3>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Booking Summary -->
        <div>
          <h4 class="font-semibold mb-4">Resumen de la Reserva</h4>
          
          <!-- Client Info -->
          <mat-card class="mb-4">
            <div class="p-4">
              <h5 class="font-medium mb-3 flex items-center">
                <mat-icon class="mr-2">person</mat-icon>
                Cliente
              </h5>
              <div class="flex items-center gap-3" *ngIf="resumen?.cliente">
                <div class="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
                  {{ resumen.cliente.iniciales }}
                </div>
                <div>
                  <div class="font-medium">{{ resumen.cliente.nombre }} {{ resumen.cliente.apellido }}</div>
                  <div class="text-sm text-secondary">{{ resumen.cliente.email }}</div>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Activity Info -->
          <mat-card class="mb-4">
            <div class="p-4">
              <h5 class="font-medium mb-3 flex items-center">
                <mat-icon class="mr-2">local_activity</mat-icon>
                Actividad
              </h5>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <mat-icon [style.color]="resumen?.tipoReserva?.color">
                    {{ resumen?.tipoReserva?.icon }}
                  </mat-icon>
                  <span class="font-medium">{{ resumen?.tipoReserva?.nombre }}</span>
                </div>
                <div *ngIf="resumen?.curso" class="text-sm text-secondary ml-6">
                  {{ resumen.curso.nombre }} - {{ resumen.curso.descripcion }}
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Schedule Info -->
          <mat-card>
            <div class="p-4">
              <h5 class="font-medium mb-3 flex items-center">
                <mat-icon class="mr-2">schedule</mat-icon>
                Programación
              </h5>
              <div class="space-y-2 text-sm">
                <div>
                  <span class="font-medium">Fechas:</span>
                  <div class="ml-4 mt-1">
                    <div *ngFor="let fecha of resumen?.fechas" class="text-secondary">
                      {{ fecha | date:'fullDate' }}
                    </div>
                  </div>
                </div>
                <div>
                  <span class="font-medium">Participantes:</span>
                  <span class="ml-2">{{ resumen?.configuracion?.participantes }} persona(s)</span>
                </div>
                <div *ngIf="resumen?.configuracion?.puntoEncuentro">
                  <span class="font-medium">Punto de encuentro:</span>
                  <span class="ml-2">{{ resumen.configuracion.puntoEncuentro }}</span>
                </div>
                <div *ngIf="resumen?.configuracion?.horarioPreferido">
                  <span class="font-medium">Horario:</span>
                  <span class="ml-2">{{ getHorarioDisplay(resumen.configuracion.horarioPreferido) }}</span>
                </div>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Pricing Breakdown -->
        <div>
          <h4 class="font-semibold mb-4">Desglose de Precios</h4>
          
          <mat-card>
            <div class="p-6">
              <!-- Base Price -->
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <div>
                    <div class="font-medium">{{ resumen?.tipoReserva?.nombre }}</div>
                    <div class="text-sm text-secondary" *ngIf="resumen?.curso">
                      {{ resumen.curso.nombre }}
                    </div>
                  </div>
                  <span class="font-semibold">{{ resumen?.precioBase }}€</span>
                </div>

                <!-- Participants multiplier -->
                <div class="flex justify-between items-center text-sm">
                  <span class="text-secondary">
                    {{ resumen?.precioBase }}€ × {{ resumen?.configuracion?.participantes }} participante(s)
                  </span>
                  <span>{{ (resumen?.precioBase || 0) * (resumen?.configuracion?.participantes || 1) }}€</span>
                </div>

                <!-- Date multiplier -->
                <div class="flex justify-between items-center text-sm" *ngIf="(resumen?.fechas?.length || 0) > 1">
                  <span class="text-secondary">
                    × {{ resumen?.fechas?.length }} día(s)
                  </span>
                  <span>{{ calculateSubtotal() }}€</span>
                </div>

                <!-- Equipment rental (if applicable) -->
                <div class="flex justify-between items-center text-sm" *ngIf="hasEquipmentRental()">
                  <span class="text-secondary">
                    Alquiler de equipo ({{ getEquipmentCount() }} persona(s))
                  </span>
                  <span>{{ calculateEquipmentCost() }}€</span>
                </div>

                <!-- Discounts -->
                <div class="flex justify-between items-center text-sm text-green-600" *ngIf="getDiscount() > 0">
                  <span>Descuento aplicado</span>
                  <span>-{{ getDiscount() }}€</span>
                </div>

                <!-- Total -->
                <div class="border-t pt-4 mt-4">
                  <div class="flex justify-between items-center text-xl font-bold">
                    <span>Total</span>
                    <span class="text-primary">{{ resumen?.precioTotal }}€</span>
                  </div>
                </div>

                <!-- Payment Terms -->
                <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h6 class="font-medium mb-2 text-blue-800">Condiciones de Pago</h6>
                  <div class="text-sm text-blue-700 space-y-1">
                    <div>• Pago completo requerido para confirmar la reserva</div>
                    <div>• Cancelación gratuita hasta 48h antes</div>
                    <div>• Reprogramación sin coste hasta 24h antes</div>
                  </div>
                </div>

                <!-- Special Notes -->
                <div class="mt-4 p-4 bg-yellow-50 rounded-lg" *ngIf="resumen?.configuracion?.notasAdicionales">
                  <h6 class="font-medium mb-2 text-yellow-800">Notas Especiales</h6>
                  <p class="text-sm text-yellow-700">{{ resumen.configuracion.notasAdicionales }}</p>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Action Buttons -->
          <div class="mt-6 space-y-3">
            <button mat-raised-button 
                    color="primary" 
                    class="w-full"
                    [disabled]="loading"
                    (click)="onConfirmBooking()">
              <mat-spinner *ngIf="loading" diameter="20" class="mr-2"></mat-spinner>
              <mat-icon *ngIf="!loading">credit_card</mat-icon>
              Proceder al Pago
            </button>
            
            <button mat-stroked-button 
                    class="w-full"
                    [disabled]="loading"
                    (click)="saveAsDraft()">
              <mat-icon>save</mat-icon>
              Guardar como Borrador
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pricing-confirmation-step {
      min-height: 600px;
    }
    .mat-mdc-card {
      @apply shadow-sm border border-gray-200;
    }
  `]
})
export class PricingConfirmationStepComponent {
  @Input() resumen: BookingV3Summary | undefined;
  @Input() loading: boolean = false;
  @Output() confirmBooking = new EventEmitter<void>();

  calculateSubtotal(): number {
    if (!this.resumen) return 0;
    
    const basePrice = this.resumen.precioBase || 0;
    const participants = this.resumen.configuracion?.participantes || 1;
    const days = this.resumen.fechas?.length || 1;
    
    return basePrice * participants * days;
  }

  hasEquipmentRental(): boolean {
    return this.resumen?.participantes?.some(p => p.equipoRequerido) || false;
  }

  getEquipmentCount(): number {
    return this.resumen?.participantes?.filter(p => p.equipoRequerido).length || 0;
  }

  calculateEquipmentCost(): number {
    const equipmentCostPerPerson = 15; // €15 per person per day
    const count = this.getEquipmentCount();
    const days = this.resumen?.fechas?.length || 1;
    return count * equipmentCostPerPerson * days;
  }

  getDiscount(): number {
    // Calculate any applicable discounts
    // This could be based on multiple days, group size, etc.
    const subtotal = this.calculateSubtotal();
    const participants = this.resumen?.configuracion?.participantes || 1;
    const days = this.resumen?.fechas?.length || 1;
    
    let discount = 0;
    
    // Group discount (5+ people)
    if (participants >= 5) {
      discount += subtotal * 0.1; // 10% group discount
    }
    
    // Multi-day discount (3+ days)
    if (days >= 3) {
      discount += subtotal * 0.05; // 5% multi-day discount
    }
    
    return Math.round(discount);
  }

  getHorarioDisplay(horario: string): string {
    switch (horario) {
      case 'manana': return 'Mañana (9:00-12:00)';
      case 'tarde': return 'Tarde (13:00-16:00)';
      case 'completo': return 'Día completo';
      default: return horario;
    }
  }

  onConfirmBooking(): void {
    this.confirmBooking.emit();
  }

  saveAsDraft(): void {
    // Implementation for saving as draft
    console.log('Saving as draft...');
  }
}