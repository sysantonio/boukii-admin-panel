import { Component, Inject, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookingV3Service } from '../../../services/booking-v3.service';

interface CancelBookingData {
  id: string;
  nombre: string;
  clienteNombre?: string;
}

@Component({
  selector: 'app-cancel-booking-dialog',
  template: `
    <div class="cancel-booking-dialog">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <div class="flex items-center gap-3">
          <mat-icon class="text-red-600 text-2xl">warning</mat-icon>
          <div>
            <h2 class="text-xl font-semibold">Cancelar Reserva</h2>
            <p class="text-sm text-secondary">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <button mat-icon-button (click)="closeDialog()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div class="mb-6">
          <div class="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <div class="flex items-start gap-3">
              <mat-icon class="text-red-600 mt-0.5">info</mat-icon>
              <div>
                <h3 class="font-medium text-red-800 mb-1">¿Estás seguro?</h3>
                <p class="text-sm text-red-700">
                  Vas a cancelar la reserva <strong>"{{ data.nombre }}"</strong>
                  <span *ngIf="data.clienteNombre"> de {{ data.clienteNombre }}</span>.
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <!-- Cancellation Reason -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Motivo de cancelación *</mat-label>
              <mat-select [(ngModel)]="cancellationReason" required>
                <mat-option value="cliente-solicitud">Solicitud del cliente</mat-option>
                <mat-option value="mal-tiempo">Condiciones meteorológicas</mat-option>
                <mat-option value="falta-instructor">Instructor no disponible</mat-option>
                <mat-option value="problema-equipo">Problema con el equipo</mat-option>
                <mat-option value="emergencia">Emergencia</mat-option>
                <mat-option value="otro">Otro motivo</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Custom reason if "otro" is selected -->
            <mat-form-field *ngIf="cancellationReason === 'otro'" 
                           appearance="outline" 
                           class="w-full">
              <mat-label>Especificar motivo</mat-label>
              <input matInput 
                     [(ngModel)]="customReason"
                     placeholder="Describe el motivo de la cancelación">
            </mat-form-field>

            <!-- Additional Comments -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Comentarios adicionales</mat-label>
              <textarea matInput 
                        [(ngModel)]="additionalComments"
                        rows="3"
                        placeholder="Información adicional sobre la cancelación..."></textarea>
            </mat-form-field>

            <!-- Refund Options -->
            <div>
              <h4 class="font-medium mb-3">Política de Reembolso</h4>
              <mat-radio-group [(ngModel)]="refundOption" class="flex flex-col gap-2">
                <mat-radio-button value="full">
                  <div class="ml-2">
                    <div class="font-medium">Reembolso completo</div>
                    <div class="text-sm text-secondary">Devolver el 100% del importe pagado</div>
                  </div>
                </mat-radio-button>
                <mat-radio-button value="partial">
                  <div class="ml-2">
                    <div class="font-medium">Reembolso parcial</div>
                    <div class="text-sm text-secondary">Devolver parcialmente según política</div>
                  </div>
                </mat-radio-button>
                <mat-radio-button value="voucher">
                  <div class="ml-2">
                    <div class="font-medium">Voucher para futura reserva</div>
                    <div class="text-sm text-secondary">Crear voucher por el importe total</div>
                  </div>
                </mat-radio-button>
                <mat-radio-button value="none">
                  <div class="ml-2">
                    <div class="font-medium">Sin reembolso</div>
                    <div class="text-sm text-secondary">No procede reembolso</div>
                  </div>
                </mat-radio-button>
              </mat-radio-group>
            </div>

            <!-- Notification Options -->
            <div>
              <h4 class="font-medium mb-3">Notificaciones</h4>
              <div class="space-y-2">
                <mat-checkbox [(ngModel)]="notifyClient">
                  Notificar al cliente por email
                </mat-checkbox>
                <mat-checkbox [(ngModel)]="notifyInstructor">
                  Notificar al instructor asignado
                </mat-checkbox>
              </div>
            </div>
          </div>
        </div>

        <!-- Validation Errors -->
        <div *ngIf="getValidationErrors().length > 0" 
             class="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <div class="flex items-center text-red-600 mb-2">
            <mat-icon class="mr-2">error</mat-icon>
            <span class="font-medium">Por favor, completa los siguientes campos:</span>
          </div>
          <ul class="text-sm text-red-600 ml-6">
            <li *ngFor="let error of getValidationErrors()">{{ error }}</li>
          </ul>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex justify-between items-center p-6 border-t">
        <div class="text-sm text-secondary">
          ID de reserva: {{ data.id }}
        </div>
        <div class="flex gap-2">
          <button mat-button (click)="closeDialog()" [disabled]="processing()">
            Cancelar
          </button>
          <button mat-raised-button 
                  color="warn"
                  (click)="confirmCancellation()"
                  [disabled]="!isFormValid() || processing()">
            <mat-spinner *ngIf="processing()" diameter="20" class="mr-2"></mat-spinner>
            <mat-icon *ngIf="!processing()">cancel</mat-icon>
            {{ processing() ? 'Cancelando...' : 'Confirmar Cancelación' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cancel-booking-dialog {
      min-width: 500px;
      max-width: 600px;
    }
    
    @media (max-width: 768px) {
      .cancel-booking-dialog {
        min-width: auto;
        width: 100vw;
        max-width: 100vw;
      }
    }

    .mat-mdc-form-field {
      width: 100%;
    }

    .mat-mdc-radio-button {
      margin-bottom: 8px;
    }
  `]
})
export class CancelBookingDialogComponent {
  private dialogRef = inject(MatDialogRef<CancelBookingDialogComponent>);
  private bookingService = inject(BookingV3Service);

  // Form State
  cancellationReason = '';
  customReason = '';
  additionalComments = '';
  refundOption = 'full';
  notifyClient = true;
  notifyInstructor = true;
  processing = signal(false);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CancelBookingData
  ) {}

  closeDialog(): void {
    this.dialogRef.close(false);
  }

  isFormValid(): boolean {
    const hasReason = !!this.cancellationReason;
    const hasCustomReason = this.cancellationReason !== 'otro' || !!this.customReason.trim();
    const hasRefundOption = !!this.refundOption;
    
    return hasReason && hasCustomReason && hasRefundOption;
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];
    
    if (!this.cancellationReason) {
      errors.push('Selecciona un motivo de cancelación');
    }
    
    if (this.cancellationReason === 'otro' && !this.customReason.trim()) {
      errors.push('Especifica el motivo personalizado');
    }
    
    if (!this.refundOption) {
      errors.push('Selecciona una opción de reembolso');
    }
    
    return errors;
  }

  async confirmCancellation(): Promise<void> {
    if (!this.isFormValid()) return;

    try {
      this.processing.set(true);

      const cancellationData = {
        bookingId: this.data.id,
        reason: this.cancellationReason === 'otro' ? this.customReason : this.cancellationReason,
        comments: this.additionalComments,
        refundOption: this.refundOption,
        notifications: {
          client: this.notifyClient,
          instructor: this.notifyInstructor
        }
      };

      const result = await this.bookingService.cancelBooking(cancellationData).toPromise();

      if (result?.success) {
        this.dialogRef.close(true);
      } else {
        throw new Error(result?.message || 'Error al cancelar la reserva');
      }

    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      // Here you would typically show an error message to the user
      // For now, we'll just log it
    } finally {
      this.processing.set(false);
    }
  }
}