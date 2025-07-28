import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BookingV3Configuration } from '../../../../interfaces/booking-v3.interfaces';

@Component({
  selector: 'app-schedule-selection-step',
  template: `
    <div class="schedule-selection-step">
      <h3 class="text-lg font-semibold mb-6">Configurar Fechas y Horarios</h3>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Date Selection -->
        <div>
          <h4 class="font-semibold mb-4">Seleccionar Fechas</h4>
          <mat-calendar 
            [selected]="selectedDates"
            (selectedChange)="onDateSelected($event)"
            [dateFilter]="dateFilter">
          </mat-calendar>
          
          <div class="mt-4" *ngIf="selectedDates.length > 0">
            <h5 class="font-medium mb-2">Fechas seleccionadas:</h5>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let date of selectedDates" 
                    class="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center">
                {{ date | date:'shortDate' }}
                <button (click)="removeDate(date)" class="ml-2 text-primary-600">
                  <mat-icon class="text-sm">close</mat-icon>
                </button>
              </span>
            </div>
          </div>
        </div>

        <!-- Configuration -->
        <div>
          <h4 class="font-semibold mb-4">Configuración</h4>
          
          <div class="space-y-6">
            <!-- Participants -->
            <div>
              <label class="block font-medium mb-2">Número de participantes</label>
              <div class="flex items-center gap-3">
                <button mat-icon-button (click)="changeParticipants(-1)" 
                        [disabled]="localConfig.participantes <= 1">
                  <mat-icon>remove</mat-icon>
                </button>
                <span class="w-12 text-center font-semibold text-lg">{{ localConfig.participantes }}</span>
                <button mat-icon-button (click)="changeParticipants(1)">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </div>

            <!-- Meeting Point -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Punto de encuentro</mat-label>
              <mat-select [(ngModel)]="localConfig.puntoEncuentro" 
                         (ngModelChange)="onConfigChange()">
                <mat-option value="escuela-base">Escuela Base</mat-option>
                <mat-option value="pista-verde">Pista Verde</mat-option>
                <mat-option value="telecabina">Telecabina</mat-option>
                <mat-option value="parking-principal">Parking Principal</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Time Slots -->
            <div>
              <label class="block font-medium mb-2">Horario preferido</label>
              <mat-chip-listbox class="w-full" [(ngModel)]="localConfig.horarioPreferido" 
                              (ngModelChange)="onConfigChange()">
                <mat-chip-option value="manana">Mañana (9:00-12:00)</mat-chip-option>
                <mat-chip-option value="tarde">Tarde (13:00-16:00)</mat-chip-option>
                <mat-chip-option value="completo">Día completo</mat-chip-option>
              </mat-chip-listbox>
            </div>

            <!-- Additional Notes -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Notas adicionales</mat-label>
              <textarea matInput 
                        rows="4"
                        [(ngModel)]="localConfig.notasAdicionales"
                        (ngModelChange)="onConfigChange()"
                        placeholder="Comentarios, necesidades especiales, etc..."></textarea>
            </mat-form-field>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .schedule-selection-step {
      min-height: 500px;
    }
    .mat-mdc-form-field {
      width: 100%;
    }
  `]
})
export class ScheduleSelectionStepComponent {
  @Input() configuracion: BookingV3Configuration | undefined;
  @Output() configuracionChanged = new EventEmitter<BookingV3Configuration>();

  selectedDates: Date[] = [];
  localConfig: BookingV3Configuration = {
    participantes: 1,
    fechasSeleccionadas: [],
    puntoEncuentro: '',
    notasAdicionales: '',
    horarioPreferido: 'manana'
  };

  ngOnInit(): void {
    if (this.configuracion) {
      this.localConfig = { ...this.configuracion };
      this.selectedDates = [...this.configuracion.fechasSeleccionadas];
    }
  }

  ngOnChanges(): void {
    if (this.configuracion) {
      this.localConfig = { ...this.configuracion };
      this.selectedDates = [...this.configuracion.fechasSeleccionadas];
    }
  }

  onDateSelected(date: Date | null): void {
    if (!date) return;
    
    // Toggle date selection
    const dateIndex = this.selectedDates.findIndex(d => d.getTime() === date.getTime());
    if (dateIndex >= 0) {
      this.selectedDates.splice(dateIndex, 1);
    } else {
      this.selectedDates.push(date);
    }
    
    this.updateConfiguration();
  }

  removeDate(date: Date): void {
    const index = this.selectedDates.findIndex(d => d.getTime() === date.getTime());
    if (index >= 0) {
      this.selectedDates.splice(index, 1);
      this.updateConfiguration();
    }
  }

  changeParticipants(delta: number): void {
    this.localConfig.participantes = Math.max(1, this.localConfig.participantes + delta);
    this.onConfigChange();
  }

  onConfigChange(): void {
    this.updateConfiguration();
  }

  private updateConfiguration(): void {
    const updatedConfig: BookingV3Configuration = {
      ...this.localConfig,
      fechasSeleccionadas: [...this.selectedDates]
    };
    
    this.configuracionChanged.emit(updatedConfig);
  }

  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    // Only allow future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };
}