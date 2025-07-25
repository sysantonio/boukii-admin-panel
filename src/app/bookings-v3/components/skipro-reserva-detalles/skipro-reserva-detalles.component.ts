import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SkiProBooking } from '../../interfaces/skipro.interfaces';

@Component({
  selector: 'app-skipro-reserva-detalles',
  template: `
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
      <div class="px-4 py-2 border-b flex justify-between items-center">
        <h2 class="text-lg font-semibold">Detalle Reserva {{ reserva?.id }}</h2>
        <button mat-icon-button (click)="cerrar.emit()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="p-4 space-y-2 text-sm">
        <div><span class="font-medium">Cliente:</span> {{ reserva?.cliente.nombre }} {{ reserva?.cliente.apellido }}</div>
        <div><span class="font-medium">Tipo:</span> {{ reserva?.tipo }}</div>
        <div><span class="font-medium">Elemento:</span> {{ reserva?.reserva.nombre }}</div>
        <div><span class="font-medium">Fechas:</span> {{ reserva?.fechas.display }}</div>
        <div><span class="font-medium">Estado:</span> {{ reserva?.estado }}</div>
        <div><span class="font-medium">Precio:</span> {{ reserva?.precio }} {{ reserva?.moneda }}</div>
      </div>
      <div class="px-4 py-2 border-t flex justify-end">
        <button mat-button (click)="cerrar.emit()">Cerrar</button>
      </div>
    </div>
  `
})
export class SkiProReservaDetallesComponent {
  @Input() reserva: SkiProBooking | null = null;
  @Output() cerrar = new EventEmitter<void>();
}
