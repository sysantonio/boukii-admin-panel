import { Component, Input, Output, EventEmitter } from '@angular/core';

interface ParticipantDetails {
  nombre: string;
  apellido: string;
  edad: number;
  nivel: string;
  equipoRequerido: boolean;
  tallasEquipo?: {
    esquis: string;
    botas: string;
    bastones: string;
  };
  observaciones: string;
}

@Component({
  selector: 'app-participant-details-step',
  template: `
    <div class="participant-details-step">
      <h3 class="text-lg font-semibold mb-6">Detalles de Participantes</h3>
      <p class="text-secondary mb-6">Complete la información para cada participante ({{ participantes }} personas)</p>
      
      <div class="space-y-6">
        <mat-expansion-panel *ngFor="let participant of participantsList; let i = index"
                           [expanded]="i === 0"
                           class="participant-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                  {{ i + 1 }}
                </div>
                <span>
                  {{ participant.nombre || 'Participante ' + (i + 1) }}
                  {{ participant.apellido }}
                </span>
                <mat-icon *ngIf="isParticipantComplete(participant)" class="text-green-600 ml-auto">
                  check_circle
                </mat-icon>
              </div>
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="participant-form">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <!-- Basic Info -->
              <mat-form-field appearance="outline">
                <mat-label>Nombre *</mat-label>
                <input matInput 
                       [(ngModel)]="participant.nombre"
                       (ngModelChange)="onParticipantChange()"
                       required>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Apellido *</mat-label>
                <input matInput 
                       [(ngModel)]="participant.apellido"
                       (ngModelChange)="onParticipantChange()"
                       required>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Edad *</mat-label>
                <input matInput 
                       type="number" 
                       [(ngModel)]="participant.edad"
                       (ngModelChange)="onParticipantChange()"
                       min="3" 
                       max="99"
                       required>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nivel de esquí *</mat-label>
                <mat-select [(ngModel)]="participant.nivel"
                           (ngModelChange)="onParticipantChange()">
                  <mat-option value="Principiante">Principiante</mat-option>
                  <mat-option value="Intermedio">Intermedio</mat-option>
                  <mat-option value="Avanzado">Avanzado</mat-option>
                  <mat-option value="Experto">Experto</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Equipment Section -->
            <div class="mb-6">
              <div class="flex items-center gap-3 mb-4">
                <mat-checkbox [(ngModel)]="participant.equipoRequerido"
                             (ngModelChange)="onParticipantChange()">
                  Requiere alquiler de equipo
                </mat-checkbox>
              </div>

              <div *ngIf="participant.equipoRequerido" 
                   class="p-4 bg-gray-50 rounded-lg">
                <h5 class="font-medium mb-4">Tallas de Equipo</h5>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <mat-form-field appearance="outline">
                    <mat-label>Talla esquís</mat-label>
                    <mat-select [(ngModel)]="participant.tallasEquipo!.esquis"
                               (ngModelChange)="onParticipantChange()">
                      <mat-option value="140">140 cm</mat-option>
                      <mat-option value="150">150 cm</mat-option>
                      <mat-option value="160">160 cm</mat-option>
                      <mat-option value="170">170 cm</mat-option>
                      <mat-option value="180">180 cm</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Talla botas</mat-label>
                    <mat-select [(ngModel)]="participant.tallasEquipo!.botas"
                               (ngModelChange)="onParticipantChange()">
                      <mat-option *ngFor="let size of bootSizes" [value]="size">
                        {{ size }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Talla bastones</mat-label>
                    <mat-select [(ngModel)]="participant.tallasEquipo!.bastones"
                               (ngModelChange)="onParticipantChange()">
                      <mat-option value="100">100 cm</mat-option>
                      <mat-option value="110">110 cm</mat-option>
                      <mat-option value="120">120 cm</mat-option>
                      <mat-option value="130">130 cm</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
            </div>

            <!-- Observations -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Observaciones</mat-label>
              <textarea matInput 
                        rows="3"
                        [(ngModel)]="participant.observaciones"
                        (ngModelChange)="onParticipantChange()"
                        placeholder="Alergias, medicaciones, limitaciones físicas, etc..."></textarea>
            </mat-form-field>
          </div>
        </mat-expansion-panel>
      </div>

      <!-- Summary -->
      <div class="mt-8 p-4 bg-blue-50 rounded-lg" *ngIf="allParticipantsComplete()">
        <div class="flex items-center text-blue-800">
          <mat-icon class="mr-2">check_circle</mat-icon>
          <span class="font-medium">
            Información completada para {{ participantes }} participante(s)
          </span>
        </div>
      </div>

      <!-- Validation errors -->
      <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded" 
           *ngIf="!allParticipantsComplete() && getIncompleteParticipants().length > 0">
        <div class="flex items-center text-red-600 mb-2">
          <mat-icon class="mr-2">error</mat-icon>
          <span class="font-medium">Información incompleta:</span>
        </div>
        <ul class="text-sm text-red-600 ml-6">
          <li *ngFor="let error of getIncompleteParticipants()">{{ error }}</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .participant-details-step {
      min-height: 500px;
    }
    .mat-mdc-form-field {
      width: 100%;
    }
    .participant-panel {
      margin-bottom: 1rem;
    }
    .participant-form {
      padding-top: 1rem;
    }
  `]
})
export class ParticipantDetailsStepComponent {
  @Input() participantes: number = 1;
  @Input() detallesParticipantes: any[] = [];
  @Output() participantesChanged = new EventEmitter<ParticipantDetails[]>();

  participantsList: ParticipantDetails[] = [];
  bootSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'];

  ngOnInit(): void {
    this.initializeParticipants();
  }

  ngOnChanges(): void {
    if (this.participantes !== this.participantsList.length) {
      this.initializeParticipants();
    }
  }

  private initializeParticipants(): void {
    const newList: ParticipantDetails[] = [];
    
    for (let i = 0; i < this.participantes; i++) {
      const existing = this.detallesParticipantes[i] || {};
      newList.push({
        nombre: existing.nombre || '',
        apellido: existing.apellido || '',
        edad: existing.edad || 18,
        nivel: existing.nivel || 'Principiante',
        equipoRequerido: existing.equipoRequerido || false,
        tallasEquipo: existing.tallasEquipo || {
          esquis: '',
          botas: '',
          bastones: ''
        },
        observaciones: existing.observaciones || ''
      });
    }
    
    this.participantsList = newList;
  }

  onParticipantChange(): void {
    // Initialize equipment sizes if equipment is required
    this.participantsList.forEach(participant => {
      if (participant.equipoRequerido && !participant.tallasEquipo) {
        participant.tallasEquipo = {
          esquis: '',
          botas: '',
          bastones: ''
        };
      }
    });

    this.participantesChanged.emit([...this.participantsList]);
  }

  isParticipantComplete(participant: ParticipantDetails): boolean {
    const basicInfoComplete = !!(
      participant.nombre.trim() &&
      participant.apellido.trim() &&
      participant.edad > 0 &&
      participant.nivel
    );

    if (!basicInfoComplete) return false;

    // If equipment is required, check equipment sizes
    if (participant.equipoRequerido) {
      return !!(
        participant.tallasEquipo?.esquis &&
        participant.tallasEquipo?.botas &&
        participant.tallasEquipo?.bastones
      );
    }

    return true;
  }

  allParticipantsComplete(): boolean {
    return this.participantsList.every(p => this.isParticipantComplete(p));
  }

  getIncompleteParticipants(): string[] {
    const errors: string[] = [];
    
    this.participantsList.forEach((participant, index) => {
      if (!this.isParticipantComplete(participant)) {
        const participantName = participant.nombre || `Participante ${index + 1}`;
        
        if (!participant.nombre.trim()) {
          errors.push(`${participantName}: Falta nombre`);
        }
        if (!participant.apellido.trim()) {
          errors.push(`${participantName}: Falta apellido`);
        }
        if (!participant.edad || participant.edad <= 0) {
          errors.push(`${participantName}: Falta edad válida`);
        }
        if (participant.equipoRequerido) {
          if (!participant.tallasEquipo?.esquis) {
            errors.push(`${participantName}: Falta talla de esquís`);
          }
          if (!participant.tallasEquipo?.botas) {
            errors.push(`${participantName}: Falta talla de botas`);
          }
          if (!participant.tallasEquipo?.bastones) {
            errors.push(`${participantName}: Falta talla de bastones`);
          }
        }
      }
    });
    
    return errors;
  }
}