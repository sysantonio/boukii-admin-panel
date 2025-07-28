import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BookingV3Type, CourseV3 } from '../../../../interfaces/booking-v3.interfaces';

@Component({
  selector: 'app-activity-selection-step',
  template: `
    <div class="activity-selection-step">
      <h3 class="text-lg font-semibold mb-6">Seleccionar Tipo de Reserva</h3>
      
      <!-- Activity types -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div *ngFor="let tipo of tiposReserva" 
             class="p-6 border-2 rounded-lg cursor-pointer text-center transition-all hover:shadow-md"
             [class.border-primary]="selectedTipo?.id === tipo.id"
             [class.bg-primary-50]="selectedTipo?.id === tipo.id"
             (click)="selectTipo(tipo)">
          <div class="text-4xl mb-3" [style.color]="tipo.color">{{ tipo.icon }}</div>
          <div class="font-semibold mb-2">{{ tipo.nombre }}</div>
          <div class="text-sm text-secondary">{{ tipo.descripcion }}</div>
          <div class="text-lg font-bold mt-2">{{ tipo.precioBase }}€</div>
        </div>
      </div>

      <!-- Course selection (if applicable) -->
      <div *ngIf="selectedTipo?.requiresCourse && cursos.length > 0">
        <h4 class="font-semibold mb-4">Seleccionar Curso</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let curso of cursos" 
               class="border-2 rounded-lg cursor-pointer transition-all hover:shadow-md overflow-hidden"
               [class.border-primary]="selectedCurso?.id === curso.id"
               [class.bg-primary-50]="selectedCurso?.id === curso.id"
               (click)="selectCurso(curso)">
            <div class="h-32 bg-gray-200 flex items-center justify-center">
              <mat-icon class="text-4xl text-gray-400">image</mat-icon>
            </div>
            <div class="p-4">
              <h5 class="font-semibold mb-2">{{ curso.nombre }}</h5>
              <p class="text-sm text-secondary mb-2">{{ curso.descripcion }}</p>
              <div class="flex justify-between items-center">
                <div>
                  <div class="text-sm text-secondary">{{ curso.duracion }}</div>
                  <span class="text-xs px-2 py-1 bg-gray-100 rounded-full">{{ curso.nivel }}</span>
                </div>
                <div class="font-bold text-lg">{{ curso.precio }}€</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .activity-selection-step {
      min-height: 400px;
    }
  `]
})
export class ActivitySelectionStepComponent {
  @Input() tiposReserva: BookingV3Type[] = [];
  @Input() cursos: CourseV3[] = [];
  @Input() selectedTipo: BookingV3Type | undefined;
  @Input() selectedCurso: CourseV3 | undefined;

  @Output() tipoSelected = new EventEmitter<BookingV3Type>();
  @Output() cursoSelected = new EventEmitter<CourseV3>();

  selectTipo(tipo: BookingV3Type): void {
    this.tipoSelected.emit(tipo);
  }

  selectCurso(curso: CourseV3): void {
    this.cursoSelected.emit(curso);
  }
}