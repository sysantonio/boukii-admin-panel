import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SkiProMockDataService } from '../../services/mock/skipro-mock-data.service';
import { 
  SkiProWizardState, 
  SkiProCliente, 
  SkiProTipoReserva, 
  SkiProCurso,
  SkiProConfiguracionReserva,
  SkiProResumenReserva
} from '../../interfaces/skipro.interfaces';

@Component({
  selector: 'app-skipro-wizard',
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b flex items-center justify-between">
          <div class="flex items-center gap-3">
            <mat-icon class="text-2xl">{{ getStepIcon() }}</mat-icon>
            <div>
              <h2 class="text-xl font-semibold">{{ editMode ? 'Editar Reserva' : 'Nueva Reserva' }}</h2>
              <p class="text-sm text-secondary">{{ getStepDescription() }}</p>
            </div>
          </div>
          <button mat-icon-button (click)="cerrarWizard()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Progress Steps -->
        <div class="px-6 py-4 border-b">
          <div class="flex items-center justify-center gap-4">
            <div *ngFor="let step of [1,2,3,4]; let i = index" 
                 class="flex items-center">
              <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold"
                   [class.bg-primary]="wizardState().paso > i"
                   [class.text-primary-contrast]="wizardState().paso > i"
                   [class.border-primary]="wizardState().paso === i + 1"
                   [class.text-primary]="wizardState().paso === i + 1"
                   [class.border-gray-300]="wizardState().paso < i + 1">
                <mat-icon *ngIf="wizardState().paso > i" class="text-lg">check</mat-icon>
                <span *ngIf="wizardState().paso <= i">{{ step }}</span>
              </div>
              <div *ngIf="i < 3" class="w-12 h-0.5 bg-gray-300 mx-2"
                   [class.bg-primary]="wizardState().paso > i + 1"></div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto max-h-96">
          
          <!-- PASO 1: Selección de Cliente -->
          <div *ngIf="wizardState().paso === 1">
            <h3 class="text-lg font-semibold mb-4">Seleccionar Cliente</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div *ngFor="let cliente of clientesDisponibles()" 
                   class="p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md"
                   [class.border-primary]="wizardState().cliente?.id === cliente.id"
                   [class.bg-primary-50]="wizardState().cliente?.id === cliente.id"
                   (click)="seleccionarCliente(cliente)">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
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
                  <mat-icon *ngIf="wizardState().cliente?.id === cliente.id" 
                           class="text-primary">check_circle</mat-icon>
                </div>
              </div>
            </div>

            <div class="border-t pt-4">
              <h4 class="font-medium mb-3">O crear nuevo cliente</h4>
              <button mat-stroked-button 
                      class="w-full"
                      [class.border-primary]="wizardState().crearNuevoCliente"
                      [class.text-primary]="wizardState().crearNuevoCliente"
                      (click)="toggleCrearNuevoCliente()">
                <mat-icon>add</mat-icon>
                Añadir nuevo cliente
              </button>
              
              <!-- Formulario nuevo cliente -->
              <div *ngIf="wizardState().crearNuevoCliente" class="mt-4 p-4 bg-gray-50 rounded-lg">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <mat-form-field appearance="outline">
                    <mat-label>Nombre</mat-label>
                    <input matInput [(ngModel)]="nuevoClienteForm.nombre">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Apellido</mat-label>
                    <input matInput [(ngModel)]="nuevoClienteForm.apellido">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" [(ngModel)]="nuevoClienteForm.email">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Teléfono</mat-label>
                    <input matInput [(ngModel)]="nuevoClienteForm.telefono">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="md:col-span-2">
                    <mat-label>Nivel</mat-label>
                    <mat-select [(ngModel)]="nuevoClienteForm.nivel">
                      <mat-option value="Principiante">Principiante</mat-option>
                      <mat-option value="Intermedio">Intermedio</mat-option>
                      <mat-option value="Avanzado">Avanzado</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
            </div>
          </div>

          <!-- PASO 2: Tipo de Reserva y Curso -->
          <div *ngIf="wizardState().paso === 2">
            <h3 class="text-lg font-semibold mb-4">Tipo de Reserva</h3>
            
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div *ngFor="let tipo of tiposReserva()" 
                   class="p-6 border-2 rounded-lg cursor-pointer text-center transition-all hover:shadow-md"
                   [class.border-primary]="wizardState().tipoReserva?.id === tipo.id"
                   [class.bg-primary-50]="wizardState().tipoReserva?.id === tipo.id"
                   (click)="seleccionarTipoReserva(tipo)">
                <div class="text-4xl mb-3" [style.color]="tipo.color">{{ tipo.icon }}</div>
                <div class="font-semibold mb-2">{{ tipo.nombre }}</div>
                <div class="text-sm text-secondary">{{ tipo.descripcion }}</div>
              </div>
            </div>

            <!-- Selección de Curso (solo si tipo = Cursos) -->
            <div *ngIf="wizardState().tipoReserva?.id === 'cursos'">
              <h4 class="font-semibold mb-4">Seleccionar Curso</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div *ngFor="let curso of cursosDisponibles()" 
                     class="p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md"
                     [class.border-primary]="wizardState().cursoSeleccionado?.id === curso.id"
                     [class.bg-primary-50]="wizardState().cursoSeleccionado?.id === curso.id"
                     (click)="seleccionarCurso(curso)">
                  <div class="w-full h-32 bg-gray-200 rounded-md mb-3 flex items-center justify-center">
                    <mat-icon class="text-4xl text-gray-400">image</mat-icon>
                  </div>
                  <div class="font-semibold mb-2">{{ curso.nombre }}</div>
                  <div class="text-sm text-secondary mb-2">{{ curso.descripcion }}</div>
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="text-sm text-secondary">{{ curso.duracion }}</div>
                      <div class="text-xs px-2 py-1 bg-gray-100 rounded-full inline-block">
                        {{ curso.nivel }}
                      </div>
                    </div>
                    <div class="font-bold text-lg">{{ curso.precio }}€</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PASO 3: Configuración -->
          <div *ngIf="wizardState().paso === 3">
            <h3 class="text-lg font-semibold mb-4">Configurar Reserva</h3>
            
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <label class="font-medium">Número de participantes</label>
                <div class="flex items-center gap-3">
                  <button mat-icon-button (click)="cambiarParticipantes(-1)" 
                          [disabled]="configuracion().participantes <= 1">
                    <mat-icon>remove</mat-icon>
                  </button>
                  <span class="w-8 text-center font-semibold">{{ configuracion().participantes }}</span>
                  <button mat-icon-button (click)="cambiarParticipantes(1)">
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
              </div>

              <div>
                <label class="font-medium mb-2 block">Fecha(s)</label>
                <button mat-stroked-button class="w-full text-left">
                  <mat-icon>event</mat-icon>
                  {{ configuracion().fechasSeleccionadas.length }} fecha(s) seleccionada(s)
                </button>
              </div>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Punto de encuentro</mat-label>
                <mat-select [(ngModel)]="configuracionForm.puntoEncuentro">
                  <mat-option value="escuela-base">Escuela Base</mat-option>
                  <mat-option value="pista-verde">Pista Verde</mat-option>
                  <mat-option value="telecabina">Telecabina</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Notas adicionales</mat-label>
                <textarea matInput 
                          rows="3"
                          [(ngModel)]="configuracionForm.notasAdicionales"
                          placeholder="Comentarios, necesidades especiales, etc..."></textarea>
              </mat-form-field>
            </div>
          </div>

          <!-- PASO 4: Resumen y Confirmación -->
          <div *ngIf="wizardState().paso === 4">
            <h3 class="text-lg font-semibold mb-4">Revisión y Confirmación</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Cliente -->
              <div class="p-4 border rounded-lg">
                <h4 class="font-semibold mb-3">Cliente</h4>
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                    {{ getClienteSeleccionado()?.iniciales }}
                  </div>
                  <div>
                    <div class="font-medium">{{ getClienteSeleccionado()?.nombre }} {{ getClienteSeleccionado()?.apellido }}</div>
                    <div class="text-sm text-secondary">{{ getClienteSeleccionado()?.email }}</div>
                  </div>
                </div>
              </div>

              <!-- Resumen de Precio -->
              <div class="p-4 border rounded-lg">
                <h4 class="font-semibold mb-3">Resumen de Precio</h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>Precio base:</span>
                    <span>{{ calcularPrecioBase() }}€</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Participantes:</span>
                    <span>x{{ configuracion().participantes }}</span>
                  </div>
                  <div class="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span class="text-primary">{{ calcularTotal() }}€</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detalles de la Reserva -->
            <div class="mt-6 p-4 border rounded-lg">
              <h4 class="font-semibold mb-3">Detalles de la Reserva</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium">Tipo:</span>
                  <span class="ml-2">{{ wizardState().tipoReserva?.nombre }}</span>
                </div>
                <div>
                  <span class="font-medium">Elemento:</span>
                  <span class="ml-2">{{ wizardState().cursoSeleccionado?.nombre || 'N/A' }}</span>
                </div>
                <div>
                  <span class="font-medium">Participantes:</span>
                  <span class="ml-2">{{ configuracion().participantes }}</span>
                </div>
                <div>
                  <span class="font-medium">Fechas:</span>
                  <span class="ml-2">{{ configuracion().fechasSeleccionadas.length }} día(s)</span>
                </div>
                <div class="md:col-span-2">
                  <span class="font-medium">Punto encuentro:</span>
                  <span class="ml-2">{{ configuracionForm.puntoEncuentro || 'No especificado' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t flex justify-between">
          <button mat-button (click)="pasoPrevio()" [disabled]="wizardState().paso === 1">
            <mat-icon>arrow_back</mat-icon>
            Anterior
          </button>
          
          <div class="flex gap-2">
            <button mat-button (click)="cerrarWizard()">Cancelar</button>
            
            <button *ngIf="wizardState().paso < 4" 
                    mat-raised-button 
                    color="primary"
                    (click)="pasoSiguiente()"
                    [disabled]="!puedeAvanzar()">
              Siguiente
              <mat-icon>arrow_forward</mat-icon>
            </button>
            
            <button *ngIf="wizardState().paso === 4" 
                    mat-raised-button 
                    color="primary"
                    (click)="confirmarReserva()"
                    [disabled]="procesandoReserva()">
              <mat-icon *ngIf="!procesandoReserva()">check</mat-icon>
              <mat-spinner *ngIf="procesandoReserva()" diameter="20"></mat-spinner>
              Confirmar Reserva
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mat-mdc-form-field {
      width: 100%;
    }
  `]
})
export class SkiProWizardComponent implements OnInit {
  
  private skipro = inject(SkiProMockDataService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signals
  public wizardState = signal<SkiProWizardState>({ paso: 1 });
  public clientesDisponibles = signal<SkiProCliente[]>([]);
  public tiposReserva = signal<SkiProTipoReserva[]>([]);
  public cursosDisponibles = signal<SkiProCurso[]>([]);
  public configuracion = signal<SkiProConfiguracionReserva>({
    participantes: 2,
    fechasSeleccionadas: [new Date()],
    puntoEncuentro: ''
  });
  public procesandoReserva = signal(false);
  public editMode = false;

  // Forms
  public nuevoClienteForm = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    nivel: 'Principiante' as 'Principiante' | 'Intermedio' | 'Avanzado'
  };

  public configuracionForm = {
    puntoEncuentro: '',
    notasAdicionales: ''
  };

  ngOnInit() {
    this.cargarDatos();
  }

  private async cargarDatos() {
    try {
      const [clientes, tipos, cursos] = await Promise.all([
        this.skipro.getClientesParaWizard().toPromise(),
        this.skipro.getTiposReserva().toPromise(),
        this.skipro.getCursos().toPromise()
      ]);

      this.clientesDisponibles.set(clientes || []);
      this.tiposReserva.set(tipos || []);
      this.cursosDisponibles.set(cursos || []);

      const clienteId = this.route.snapshot.queryParamMap.get('clienteId');
      if (clienteId) {
        const pre = clientes?.find(c => String(c.id) === clienteId);
        if (pre) {
          this.seleccionarCliente(pre);
        }
      }

      const reservaId = this.route.snapshot.paramMap.get('reservaId');
      if (reservaId) {
        const reserva = await this.skipro.getReservaPorId(reservaId).toPromise();
        if (reserva) {
          const cli = clientes?.find(c => c.email === reserva.cliente.email);
          const tipo = tipos?.find(t => t.nombre === reserva.tipo);
          const curso = cursos?.find(c => c.nombre === reserva.reserva.nombre);
          this.wizardState.update(state => ({
            ...state,
            cliente: cli || state.cliente,
            tipoReserva: tipo,
            cursoSeleccionado: curso
          }));
          this.editMode = true;
        }
      }

      console.log('🧙‍♂️ SkiPro Wizard loaded');
    } catch (error) {
      console.error('❌ Error loading wizard data:', error);
    }
  }

  // Navegación entre pasos
  pasoSiguiente() {
    if (this.puedeAvanzar()) {
      const currentState = this.wizardState();
      this.wizardState.set({ ...currentState, paso: currentState.paso + 1 });
      console.log('➡️ Avanzando a paso:', currentState.paso + 1);
    }
  }

  pasoPrevio() {
    const currentState = this.wizardState();
    if (currentState.paso > 1) {
      this.wizardState.set({ ...currentState, paso: currentState.paso - 1 });
      console.log('⬅️ Retrocediendo a paso:', currentState.paso - 1);
    }
  }

  puedeAvanzar(): boolean {
    const state = this.wizardState();
    
    switch (state.paso) {
      case 1:
        return !!(state.cliente || state.crearNuevoCliente);
      case 2:
        return !!state.tipoReserva && (state.tipoReserva.id !== 'cursos' || !!state.cursoSeleccionado);
      case 3:
        return this.configuracion().participantes > 0;
      default:
        return true;
    }
  }

  // Paso 1: Selección de cliente
  seleccionarCliente(cliente: SkiProCliente) {
    const currentState = this.wizardState();
    this.wizardState.set({ 
      ...currentState, 
      cliente, 
      crearNuevoCliente: false 
    });
    console.log('👤 Cliente seleccionado:', cliente.nombre);
  }

  toggleCrearNuevoCliente() {
    const currentState = this.wizardState();
    this.wizardState.set({ 
      ...currentState, 
      crearNuevoCliente: !currentState.crearNuevoCliente,
      cliente: currentState.crearNuevoCliente ? undefined : currentState.cliente
    });
  }

  // Paso 2: Tipo de reserva
  seleccionarTipoReserva(tipo: SkiProTipoReserva) {
    const currentState = this.wizardState();
    this.wizardState.set({ 
      ...currentState, 
      tipoReserva: tipo,
      cursoSeleccionado: undefined // Reset curso selection
    });
    console.log('🏷️ Tipo seleccionado:', tipo.nombre);
  }

  seleccionarCurso(curso: SkiProCurso) {
    const currentState = this.wizardState();
    this.wizardState.set({ ...currentState, cursoSeleccionado: curso });
    console.log('🎿 Curso seleccionado:', curso.nombre);
  }

  // Paso 3: Configuración
  cambiarParticipantes(delta: number) {
    const currentConfig = this.configuracion();
    const nuevosParticipantes = Math.max(1, currentConfig.participantes + delta);
    this.configuracion.set({ ...currentConfig, participantes: nuevosParticipantes });
  }

  // Paso 4: Confirmación
  getClienteSeleccionado(): SkiProCliente | null {
    if (this.wizardState().cliente) {
      return this.wizardState().cliente!;
    }
    if (this.wizardState().crearNuevoCliente) {
      return {
        id: 0,
        nombre: this.nuevoClienteForm.nombre,
        apellido: this.nuevoClienteForm.apellido,
        iniciales: (this.nuevoClienteForm.nombre[0] + this.nuevoClienteForm.apellido[0]).toUpperCase(),
        email: this.nuevoClienteForm.email,
        telefono: this.nuevoClienteForm.telefono,
        nivel: this.nuevoClienteForm.nivel,
        fechaRegistro: new Date(),
        totalReservas: 0,
        cursosCompletados: 0,
        gastoTotal: 0,
        reservasActivas: [],
        historial: [],
        preferencias: []
      };
    }
    return null;
  }

  calcularPrecioBase(): number {
    return this.wizardState().cursoSeleccionado?.precio || 0;
  }

  calcularTotal(): number {
    const base = this.calcularPrecioBase();
    const participantes = this.configuracion().participantes;
    return base * participantes;
  }

  async confirmarReserva() {
    this.procesandoReserva.set(true);
    console.log('✨ Confirmando reserva...');

    try {
      const reservaData = {
        cliente: this.getClienteSeleccionado(),
        tipo: this.wizardState().tipoReserva?.nombre,
        tipoIcon: this.wizardState().tipoReserva?.icon,
        tipoColor: this.wizardState().tipoReserva?.color,
        reserva: {
          nombre: this.wizardState().cursoSeleccionado?.nombre || this.wizardState().tipoReserva?.nombre,
          descripcion: this.wizardState().cursoSeleccionado?.descripcion || this.wizardState().tipoReserva?.descripcion,
          detalles: new Date().toLocaleDateString()
        },
        fechas: {
          inicio: new Date(),
          display: new Date().toLocaleDateString()
        },
        precio: this.calcularTotal()
      };

      const result = await this.skipro.crearReserva(reservaData).toPromise();
      
      if (result?.success) {
        console.log('✅ Reserva creada exitosamente:', result.reserva.id);
        this.cerrarWizard();
        // TODO: Mostrar notificación de éxito
      }
    } catch (error) {
      console.error('❌ Error creating reserva:', error);
    } finally {
      this.procesandoReserva.set(false);
    }
  }

  // Utilidades
  getStepIcon(): string {
    const icons = ['person', 'star', 'settings', 'check'];
    return icons[this.wizardState().paso - 1] || 'help';
  }

  getStepDescription(): string {
    const descriptions = [
      'Paso 1 de 4: Seleccionar Cliente',
      'Paso 2 de 4: Tipo de Reserva',
      'Paso 3 de 4: Configurar Reserva',
      'Paso 4 de 4: Revisión y Pago'
    ];
    return descriptions[this.wizardState().paso - 1] || '';
  }

  cerrarWizard() {
    console.log('❌ Cerrando wizard');
    this.router.navigate(['/bookings-v3/skipro']);
  }
}