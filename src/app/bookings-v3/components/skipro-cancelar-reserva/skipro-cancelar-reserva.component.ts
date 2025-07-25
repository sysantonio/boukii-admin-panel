import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SkiProBooking } from '../../interfaces/skipro.interfaces';

@Component({
  selector: 'app-skipro-cancelar-reserva',
  template: `
    <div class="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
      <div class="px-4 py-2 border-b flex justify-between items-center">
        <h2 class="text-lg font-semibold">Cancelar Reserva</h2>
        <button mat-icon-button (click)="cerrar.emit()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="p-4 text-sm">
        <p>¿Seguro que deseas cancelar la reserva {{ reserva?.id }} para {{ reserva?.cliente.nombre }} {{ reserva?.cliente.apellido }}?</p>
      </div>
      <div class="px-4 py-2 border-t flex justify-end gap-2">
        <button mat-button (click)="cerrar.emit()">No</button>
        <button mat-raised-button color="warn" (click)="confirmar()">Sí, cancelar</button>
      </div>
    </div>
  `
})
export class SkiProCancelarReservaComponent {
  @Input() reserva: SkiProBooking | null = null;
  @Output() cancelar = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  confirmar() {
    this.cancelar.emit();
  }
}
