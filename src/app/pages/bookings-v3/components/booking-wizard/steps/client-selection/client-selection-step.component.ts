import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { ClientV3 } from '../../../../interfaces/booking-v3.interfaces';

@Component({
  selector: 'app-client-selection-step',
  template: `
    <div class="client-selection-step">
      <h3 class="text-lg font-semibold mb-6">Seleccionar Cliente</h3>
      
      <!-- Search for existing clients -->
      <div class="mb-6">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Buscar cliente existente</mat-label>
          <input matInput 
                 [(ngModel)]="searchTerm" 
                 (ngModelChange)="onSearchChange()"
                 placeholder="Nombre, email o teléfono...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <!-- Existing clients grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8" 
           *ngIf="filteredClients().length > 0">
        
        <div *ngFor="let cliente of filteredClients()" 
             class="p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md"
             [class.border-primary]="selectedCliente?.id === cliente.id"
             [class.bg-primary-50]="selectedCliente?.id === cliente.id"
             (click)="selectCliente(cliente)">
          
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
              {{ cliente.iniciales }}
            </div>
            <div class="flex-1">
              <div class="font-medium">{{ cliente.nombre }} {{ cliente.apellido }}</div>
              <div class="text-sm text-secondary">{{ cliente.email }}</div>
              <div class="text-sm text-secondary">{{ cliente.telefono }}</div>
              <div class="text-xs mt-1">
                <span class="px-2 py-1 bg-gray-100 rounded-full">{{ cliente.nivel }}</span>
              </div>
            </div>
            <mat-icon *ngIf="selectedCliente?.id === cliente.id" 
                     class="text-primary">check_circle</mat-icon>
          </div>
        </div>
      </div>

      <!-- No results message -->
      <div *ngIf="searchTerm && filteredClients().length === 0" 
           class="text-center py-8 mb-6">
        <mat-icon class="text-gray-400 text-4xl mb-4">search_off</mat-icon>
        <h4 class="text-lg font-medium text-gray-900 mb-2">No se encontraron clientes</h4>
        <p class="text-gray-500">No hay clientes que coincidan con "{{ searchTerm }}"</p>
      </div>

      <!-- Create new client section -->
      <div class="border-t pt-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-medium">¿Cliente nuevo?</h4>
          <button mat-stroked-button 
                  [class.border-primary]="isCreatingNew"
                  [class.text-primary]="isCreatingNew"
                  [class.bg-primary-50]="isCreatingNew"
                  (click)="toggleCreateNew()">
            <mat-icon>{{ isCreatingNew ? 'remove' : 'add' }}</mat-icon>
            {{ isCreatingNew ? 'Cancelar' : 'Crear nuevo cliente' }}
          </button>
        </div>
        
        <!-- New client form -->
        <div *ngIf="isCreatingNew" class="p-6 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline">
              <mat-label>Nombre *</mat-label>
              <input matInput 
                     [(ngModel)]="newClientForm.nombre"
                     (ngModelChange)="onNewClientDataChange()"
                     required>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Apellido *</mat-label>
              <input matInput 
                     [(ngModel)]="newClientForm.apellido"
                     (ngModelChange)="onNewClientDataChange()"
                     required>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Email *</mat-label>
              <input matInput 
                     type="email" 
                     [(ngModel)]="newClientForm.email"
                     (ngModelChange)="onNewClientDataChange()"
                     required>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Teléfono</mat-label>
              <input matInput 
                     [(ngModel)]="newClientForm.telefono"
                     (ngModelChange)="onNewClientDataChange()">
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="md:col-span-2">
              <mat-label>Nivel de esquí</mat-label>
              <mat-select [(ngModel)]="newClientForm.nivel"
                         (ngModelChange)="onNewClientDataChange()">
                <mat-option value="Principiante">Principiante</mat-option>
                <mat-option value="Intermedio">Intermedio</mat-option>
                <mat-option value="Avanzado">Avanzado</mat-option>
                <mat-option value="Experto">Experto</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Form validation summary -->
          <div class="mt-4 p-3 bg-white rounded border" *ngIf="newClientFormErrors().length > 0">
            <div class="flex items-center text-red-600 mb-2">
              <mat-icon class="mr-2">error</mat-icon>
              <span class="font-medium">Por favor, completa los siguientes campos:</span>
            </div>
            <ul class="text-sm text-red-600 ml-6">
              <li *ngFor="let error of newClientFormErrors()">{{ error }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Selection summary -->
      <div *ngIf="selectedCliente || (isCreatingNew && isNewClientFormValid())" 
           class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center text-green-800">
          <mat-icon class="mr-2">check_circle</mat-icon>
          <span class="font-medium">
            Cliente seleccionado: 
            <span *ngIf="selectedCliente">{{ selectedCliente.nombre }} {{ selectedCliente.apellido }}</span>
            <span *ngIf="isCreatingNew && isNewClientFormValid()">{{ newClientForm.nombre }} {{ newClientForm.apellido }} (Nuevo)</span>
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .client-selection-step {
      min-height: 400px;
    }
    .mat-mdc-form-field {
      width: 100%;
    }
  `]
})
export class ClientSelectionStepComponent {
  @Input() clientes: ClientV3[] = [];
  @Input() selectedCliente: ClientV3 | undefined;
  @Input() isCreatingNew: boolean = false;

  @Output() clienteSelected = new EventEmitter<ClientV3>();
  @Output() createNewToggle = new EventEmitter<void>();
  @Output() newClienteData = new EventEmitter<Partial<ClientV3>>();

  // Local state
  searchTerm = '';
  filteredClients = signal<ClientV3[]>([]);
  
  newClientForm = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    nivel: 'Principiante' as 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto'
  };

  ngOnInit(): void {
    this.filteredClients.set(this.clientes);
  }

  ngOnChanges(): void {
    this.filterClients();
  }

  onSearchChange(): void {
    this.filterClients();
  }

  private filterClients(): void {
    if (!this.searchTerm.trim()) {
      this.filteredClients.set(this.clientes);
      return;
    }

    const term = this.searchTerm.toLowerCase();
    const filtered = this.clientes.filter(cliente => 
      cliente.nombre.toLowerCase().includes(term) ||
      cliente.apellido.toLowerCase().includes(term) ||
      cliente.email.toLowerCase().includes(term) ||
      cliente.telefono?.toLowerCase().includes(term)
    );
    this.filteredClients.set(filtered);
  }

  selectCliente(cliente: ClientV3): void {
    this.clienteSelected.emit(cliente);
  }

  toggleCreateNew(): void {
    this.createNewToggle.emit();
    // Clear form when canceling
    if (this.isCreatingNew) {
      this.newClientForm = {
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        nivel: 'Principiante'
      };
    }
  }

  onNewClientDataChange(): void {
    this.newClienteData.emit(this.newClientForm);
  }

  isNewClientFormValid(): boolean {
    return !!(
      this.newClientForm.nombre.trim() &&
      this.newClientForm.apellido.trim() &&
      this.newClientForm.email.trim() &&
      this.isValidEmail(this.newClientForm.email)
    );
  }

  newClientFormErrors(): string[] {
    const errors: string[] = [];
    
    if (!this.newClientForm.nombre.trim()) {
      errors.push('Nombre es requerido');
    }
    if (!this.newClientForm.apellido.trim()) {
      errors.push('Apellido es requerido');
    }
    if (!this.newClientForm.email.trim()) {
      errors.push('Email es requerido');
    } else if (!this.isValidEmail(this.newClientForm.email)) {
      errors.push('Email no es válido');
    }
    
    return errors;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}