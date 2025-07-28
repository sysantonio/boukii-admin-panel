import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookingV3 } from '../../../interfaces/booking-v3.interfaces';

@Component({
  selector: 'app-booking-detail-modal',
  template: `
    <div class="booking-detail-modal">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <div>
          <h2 class="text-xl font-semibold">Detalles de la Reserva</h2>
          <p class="text-sm text-secondary">ID: {{ data.reserva.id }}</p>
        </div>
        <button mat-icon-button (click)="closeDialog()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 max-h-96 overflow-y-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Client Information -->
          <div>
            <h3 class="font-semibold mb-3 flex items-center">
              <mat-icon class="mr-2 text-primary">person</mat-icon>
              Información del Cliente
            </h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
                  {{ data.reserva.cliente.iniciales }}
                </div>
                <div>
                  <div class="font-medium">{{ data.reserva.cliente.nombre }} {{ data.reserva.cliente.apellido }}</div>
                  <div class="text-sm text-secondary">{{ data.reserva.cliente.email }}</div>
                  <div class="text-sm text-secondary">{{ data.reserva.cliente.telefono }}</div>
                </div>
              </div>
              <div class="text-sm">
                <span class="font-medium">Nivel:</span>
                <span class="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs">
                  {{ data.reserva.cliente.nivel }}
                </span>
              </div>
            </div>
          </div>

          <!-- Booking Information -->
          <div>
            <h3 class="font-semibold mb-3 flex items-center">
              <mat-icon class="mr-2 text-primary">local_activity</mat-icon>
              Información de la Reserva
            </h3>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <mat-icon [style.color]="data.reserva.tipoColor">{{ data.reserva.tipoIcon }}</mat-icon>
                <span class="font-medium">{{ data.reserva.tipo }}</span>
              </div>
              <div>
                <div class="font-medium">{{ data.reserva.reserva.nombre }}</div>
                <div class="text-sm text-secondary">{{ data.reserva.reserva.descripcion }}</div>
              </div>
              <div>
                <span class="font-medium">Estado:</span>
                <span class="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      [style.background-color]="data.reserva.estadoColor + '20'"
                      [style.color]="data.reserva.estadoColor">
                  {{ data.reserva.estado }}
                </span>
              </div>
            </div>
          </div>

          <!-- Schedule Information -->
          <div>
            <h3 class="font-semibold mb-3 flex items-center">
              <mat-icon class="mr-2 text-primary">schedule</mat-icon>
              Programación
            </h3>
            <div class="space-y-2 text-sm">
              <div>
                <span class="font-medium">Fechas:</span>
                <div class="ml-4 text-secondary">{{ data.reserva.fechas.display }}</div>
              </div>
              <div *ngIf="data.reserva.fechas.horario">
                <span class="font-medium">Horario:</span>
                <span class="ml-2 text-secondary">{{ data.reserva.fechas.horario }}</span>
              </div>
              <div *ngIf="data.reserva.fechas.puntoEncuentro">
                <span class="font-medium">Punto de encuentro:</span>
                <span class="ml-2 text-secondary">{{ data.reserva.fechas.puntoEncuentro }}</span>
              </div>
            </div>
          </div>

          <!-- Financial Information -->
          <div>
            <h3 class="font-semibold mb-3 flex items-center">
              <mat-icon class="mr-2 text-primary">euro</mat-icon>
              Información Financiera
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="font-medium">Precio total:</span>
                <span class="font-bold text-lg">{{ data.reserva.precio | currency:data.reserva.moneda:'symbol':'1.2-2' }}</span>
              </div>
              <div class="flex justify-between" *ngIf="data.reserva.pagos?.anticipo">
                <span>Anticipo pagado:</span>
                <span class="text-green-600">{{ data.reserva.pagos.anticipo | currency:data.reserva.moneda:'symbol':'1.2-2' }}</span>
              </div>
              <div class="flex justify-between" *ngIf="data.reserva.pagos?.pendiente">
                <span>Pendiente de pago:</span>
                <span class="text-orange-600">{{ data.reserva.pagos.pendiente | currency:data.reserva.moneda:'symbol':'1.2-2' }}</span>
              </div>
              <div class="text-xs text-secondary" *ngIf="data.reserva.fechaCreacion">
                Reserva realizada: {{ data.reserva.fechaCreacion | date:'short' }}
              </div>
            </div>
          </div>

          <!-- Participants Information -->
          <div class="md:col-span-2" *ngIf="data.reserva.participantes?.length">
            <h3 class="font-semibold mb-3 flex items-center">
              <mat-icon class="mr-2 text-primary">group</mat-icon>
              Participantes ({{ data.reserva.participantes.length }})
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div *ngFor="let participante of data.reserva.participantes; let i = index" 
                   class="p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-2 mb-2">
                  <span class="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                    {{ i + 1 }}
                  </span>
                  <span class="font-medium">{{ participante.nombre }} {{ participante.apellido }}</span>
                </div>
                <div class="text-sm text-secondary ml-8">
                  <div>Edad: {{ participante.edad }} años</div>
                  <div>Nivel: {{ participante.nivel }}</div>
                  <div *ngIf="participante.equipoRequerido" class="text-blue-600">
                    Equipo incluido
                  </div>
                  <div *ngIf="participante.observaciones" class="mt-1 text-xs">
                    <strong>Notas:</strong> {{ participante.observaciones }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Notes -->
          <div class="md:col-span-2" *ngIf="data.reserva.notas">
            <h3 class="font-semibold mb-3 flex items-center">
              <mat-icon class="mr-2 text-primary">note</mat-icon>
              Notas Adicionales
            </h3>
            <div class="p-3 bg-yellow-50 rounded-lg text-sm">
              {{ data.reserva.notas }}
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex justify-between items-center p-6 border-t">
        <div class="text-sm text-secondary">
          Última actualización: {{ data.reserva.fechaModificacion | date:'short' || 'No disponible' }}
        </div>
        <div class="flex gap-2">
          <button mat-button (click)="closeDialog()">Cerrar</button>
          <button mat-outlined-button 
                  (click)="editBooking()"
                  [disabled]="data.reserva.estado === 'Cancelado'">
            <mat-icon>edit</mat-icon>
            Editar
          </button>
          <button mat-raised-button 
                  color="primary" 
                  (click)="printBooking()">
            <mat-icon>print</mat-icon>
            Imprimir
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-detail-modal {
      min-width: 600px;
      max-width: 900px;
    }
    
    @media (max-width: 768px) {
      .booking-detail-modal {
        min-width: auto;
        width: 100vw;
        max-width: 100vw;
      }
    }
  `]
})
export class BookingDetailModalComponent {
  private dialogRef = inject(MatDialogRef<BookingDetailModalComponent>);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { reserva: BookingV3 }
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  editBooking(): void {
    this.dialogRef.close({ action: 'edit', reserva: this.data.reserva });
  }

  printBooking(): void {
    // Implementation for printing booking details
    window.print();
  }
}