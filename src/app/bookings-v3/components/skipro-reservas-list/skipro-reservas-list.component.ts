import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SkiProMockDataService } from '../../services/mock/skipro-mock-data.service';
import { MockDataService } from '../../services/mock/mock-data.service';
import { 
  SkiProBooking, 
  SkiProKPIs, 
  SkiProFiltroTipo,
  SkiProCliente 
} from '../../interfaces/skipro.interfaces';

@Component({
  selector: 'app-skipro-reservas-list',
  template: `
    <vex-page-layout>
      <vex-page-layout-header class="pb-16 flex flex-col items-start justify-center">
        <div class="w-full flex flex-col sm:flex-row justify-between">
          <div>
            <h1 class="title mt-0 mb-1">Reservas</h1>
            <div class="body-2 text-secondary">
              Gestiona todas las reservas de cursos, actividades y material
            </div>
          </div>
          <div class="flex gap-4 mt-4 sm:mt-0">
            <span class="text-sm text-secondary">{{ reservas().length }} reservas</span>
            <span class="text-sm text-secondary">1 pendiente</span>
            <button mat-raised-button color="primary" (click)="mostrarWizard = true">
              <mat-icon>add</mat-icon>
              Nueva reserva
            </button>
          </div>
        </div>
      </vex-page-layout-header>

      <vex-page-layout-content class="-mt-6">
        <!-- KPIs Dashboard -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <mat-card class="p-4 text-center">
            <div class="flex items-center justify-center mb-2">
              <mat-icon class="text-purple-500 mr-2">school</mat-icon>
              <span class="text-2xl font-semibold">{{ kpis().cursos }}</span>
            </div>
            <div class="text-sm text-secondary">Cursos</div>
          </mat-card>

          <mat-card class="p-4 text-center">
            <div class="flex items-center justify-center mb-2">
              <mat-icon class="text-cyan-500 mr-2">explore</mat-icon>
              <span class="text-2xl font-semibold">{{ kpis().actividades }}</span>
            </div>
            <div class="text-sm text-secondary">Actividades</div>
          </mat-card>

          <mat-card class="p-4 text-center">
            <div class="flex items-center justify-center mb-2">
              <mat-icon class="text-yellow-500 mr-2">inventory</mat-icon>
              <span class="text-2xl font-semibold">{{ kpis().material }}</span>
            </div>
            <div class="text-sm text-secondary">Material</div>
          </mat-card>

          <mat-card class="p-4 text-center">
            <div class="flex items-center justify-center mb-2">
              <mat-icon class="text-blue-500 mr-2">check_circle</mat-icon>
              <span class="text-2xl font-semibold">{{ kpis().confirmadas }}</span>
            </div>
            <div class="text-sm text-secondary">Confirmadas</div>
          </mat-card>

          <mat-card class="p-4 text-center">
            <div class="flex items-center justify-center mb-2">
              <mat-icon class="text-green-500 mr-2">paid</mat-icon>
              <span class="text-2xl font-semibold">{{ kpis().pagadas }}</span>
            </div>
            <div class="text-sm text-secondary">Pagadas</div>
          </mat-card>

          <mat-card class="p-4 text-center">
            <div class="flex items-center justify-center mb-2">
              <mat-icon class="text-red-500 mr-2">cancel</mat-icon>
              <span class="text-2xl font-semibold">{{ kpis().canceladas }}</span>
            </div>
            <div class="text-sm text-secondary">Canceladas</div>
          </mat-card>
        </div>

        <!-- Filtros -->
        <div class="card overflow-hidden">
          <div class="bg-app-bar px-6 h-16 border-b sticky top-0 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button mat-button 
                      [class.bg-primary]="filtroActivo() === 'Todas'"
                      [class.text-primary-contrast]="filtroActivo() === 'Todas'"
                      (click)="aplicarFiltro('Todas')">
                <mat-icon>list</mat-icon>
                Todas
              </button>
              <button mat-button 
                      [class.bg-purple-500]="filtroActivo() === 'Cursos'"
                      [class.text-white]="filtroActivo() === 'Cursos'"
                      (click)="aplicarFiltro('Cursos')">
                <mat-icon>school</mat-icon>
                Cursos
              </button>
              <button mat-button 
                      [class.bg-cyan-500]="filtroActivo() === 'Actividades'"
                      [class.text-white]="filtroActivo() === 'Actividades'"
                      (click)="aplicarFiltro('Actividades')">
                <mat-icon>explore</mat-icon>
                Actividades
              </button>
              <button mat-button 
                      [class.bg-yellow-500]="filtroActivo() === 'Material'"
                      [class.text-white]="filtroActivo() === 'Material'"
                      (click)="aplicarFiltro('Material')">
                <mat-icon>inventory</mat-icon>
                Material
              </button>
            </div>

            <div class="flex items-center gap-4">
              <mat-form-field appearance="outline" class="w-64">
                <mat-label>Buscar reservas...</mat-label>
                <input matInput 
                       [(ngModel)]="searchQuery" 
                       (ngModelChange)="filtrarReservas()"
                       placeholder="Buscar reservas, instructores, cursos...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <!-- Tabla de Reservas -->
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="reservasFiltradas()" class="w-full">
              
              <!-- Columna ID -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">ID</th>
                <td mat-cell *matCellDef="let reserva" class="font-mono text-sm">
                  {{ reserva.id }}
                </td>
              </ng-container>

              <!-- Columna Cliente -->
              <ng-container matColumnDef="cliente">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Cliente</th>
                <td mat-cell *matCellDef="let reserva" class="py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-sm">
                      {{ reserva.cliente.iniciales }}
                    </div>
                    <div>
                      <div class="font-medium">{{ reserva.cliente.nombre }} {{ reserva.cliente.apellido }}</div>
                      <div class="text-sm text-secondary">{{ reserva.cliente.email }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Columna Tipo -->
              <ng-container matColumnDef="tipo">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Tipo</th>
                <td mat-cell *matCellDef="let reserva">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">{{ reserva.tipoIcon }}</span>
                    <span class="px-2 py-1 rounded-full text-xs font-medium text-white"
                          [style.background-color]="reserva.tipoColor">
                      {{ reserva.tipo }}
                    </span>
                  </div>
                </td>
              </ng-container>

              <!-- Columna Reserva -->
              <ng-container matColumnDef="reserva">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Reserva</th>
                <td mat-cell *matCellDef="let reserva">
                  <div>
                    <div class="font-medium">{{ reserva.reserva.nombre }}</div>
                    <div class="text-sm text-secondary">{{ reserva.reserva.descripcion }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Columna Fechas -->
              <ng-container matColumnDef="fechas">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Fechas</th>
                <td mat-cell *matCellDef="let reserva">
                  <div class="text-sm">
                    <div>{{ reserva.fechas.display }}</div>
                    <div class="text-secondary">{{ formatearHora(reserva.fechas.inicio) }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Columna Estado -->
              <ng-container matColumnDef="estado">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Estado</th>
                <td mat-cell *matCellDef="let reserva">
                  <span class="px-3 py-1 rounded-full text-xs font-medium text-white"
                        [style.background-color]="reserva.estadoColor">
                    {{ reserva.estado }}
                  </span>
                </td>
              </ng-container>

              <!-- Columna Precio -->
              <ng-container matColumnDef="precio">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Precio</th>
                <td mat-cell *matCellDef="let reserva" class="font-semibold">
                  {{ reserva.precio }}{{ reserva.moneda }}
                </td>
              </ng-container>

              <!-- Columna Acciones -->
              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let reserva">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="verDetallesReserva(reserva)">
                      <mat-icon>visibility</mat-icon>
                      Ver detalles
                    </button>
                    <button mat-menu-item (click)="editarReserva(reserva)">
                      <mat-icon>edit</mat-icon>
                      Editar
                    </button>
                    <button mat-menu-item (click)="verPerfilCliente(reserva.cliente)">
                      <mat-icon>person</mat-icon>
                      Perfil cliente
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item class="text-red-500" (click)="cancelarReserva(reserva)">
                      <mat-icon>cancel</mat-icon>
                      Cancelar
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <!-- Estado vacío -->
          <div *ngIf="reservasFiltradas().length === 0" class="p-8 text-center">
            <mat-icon class="text-6xl text-gray-300 mb-4">search_off</mat-icon>
            <h3 class="text-lg font-medium mb-2">No se encontraron reservas</h3>
            <p class="text-secondary">Intenta ajustar los filtros o términos de búsqueda</p>
          </div>
        </div>
      </vex-page-layout-content>
    </vex-page-layout>

    <!-- Modal Wizard Nueva Reserva -->
    <div *ngIf="mostrarWizard" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <app-skipro-wizard-inline 
        (cerrar)="mostrarWizard = false"
        (reservaCreada)="onReservaCreada($event)">
      </app-skipro-wizard-inline>
    </div>

    <!-- Modal Perfil Cliente -->
    <div *ngIf="clienteSeleccionado" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <app-skipro-cliente-perfil-inline 
        [cliente]="clienteSeleccionado"
        (cerrar)="clienteSeleccionado = null"
        (nuevaReserva)="abrirWizardParaCliente($event)">
      </app-skipro-cliente-perfil-inline>
    </div>
  `,
  styles: [`
    .mat-mdc-table {
      background: transparent;
    }
    .mat-mdc-header-row {
      background-color: rgba(0, 0, 0, 0.02);
    }
    .mat-mdc-row:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
  `]
})
export class SkiProReservasListComponent implements OnInit {
  
  private skipro = inject(SkiProMockDataService);
  private router = inject(Router);

  // Signals
  public reservas = signal<SkiProBooking[]>([]);
  public reservasFiltradas = signal<SkiProBooking[]>([]);
  public kpis = signal<SkiProKPIs>({
    cursos: 0,
    actividades: 0,
    material: 0,
    confirmadas: 0,
    pagadas: 0,
    canceladas: 0
  });
  public filtroActivo = signal<SkiProFiltroTipo>('Todas');

  // Propiedades
  public searchQuery = '';
  public displayedColumns = ['id', 'cliente', 'tipo', 'reserva', 'fechas', 'estado', 'precio', 'acciones'];
  public mostrarWizard = false;
  public clienteSeleccionado: SkiProCliente | null = null;

  ngOnInit() {
    this.cargarDatos();
  }

  private async cargarDatos() {
    try {
      const [reservas, kpis] = await Promise.all([
        this.skipro.getReservas().toPromise(),
        this.skipro.getKPIs().toPromise()
      ]);

      this.reservas.set(reservas || []);
      this.reservasFiltradas.set(reservas || []);
      this.kpis.set(kpis || this.kpis());

      console.log('📊 SkiPro Reservas loaded:', reservas?.length, 'reservas');
    } catch (error) {
      console.error('❌ Error loading SkiPro data:', error);
    }
  }

  async aplicarFiltro(filtro: SkiProFiltroTipo) {
    this.filtroActivo.set(filtro);
    console.log('🔍 Aplicando filtro:', filtro);
    
    try {
      const reservasFiltradas = await this.skipro.getReservasFiltradas(filtro).toPromise();
      this.reservasFiltradas.set(reservasFiltradas || []);
    } catch (error) {
      console.error('❌ Error applying filter:', error);
    }
  }

  filtrarReservas() {
    const query = this.searchQuery.toLowerCase();
    const reservasBase = this.reservas();
    
    if (!query) {
      this.aplicarFiltro(this.filtroActivo());
      return;
    }

    const filtradas = reservasBase.filter(reserva =>
      reserva.cliente.nombre.toLowerCase().includes(query) ||
      reserva.cliente.apellido.toLowerCase().includes(query) ||
      reserva.cliente.email.toLowerCase().includes(query) ||
      reserva.reserva.nombre.toLowerCase().includes(query) ||
      reserva.reserva.descripcion.toLowerCase().includes(query) ||
      reserva.id.toLowerCase().includes(query)
    );

    this.reservasFiltradas.set(filtradas);
  }

  abrirWizardNuevaReserva() {
    console.log('✨ Abriendo wizard nueva reserva');
    this.mostrarWizard = true;
  }

  verDetallesReserva(reserva: SkiProBooking) {
    console.log('👁️ Ver detalles reserva:', reserva.id);
    // TODO: Abrir modal de detalles
  }

  editarReserva(reserva: SkiProBooking) {
    console.log('✏️ Editar reserva:', reserva.id);
    // TODO: Abrir wizard en modo edición
    this.mostrarWizard = true;
  }

  async verPerfilCliente(cliente: any) {
    console.log('👤 Ver perfil cliente:', cliente.nombre);
    try {
      // Buscar el cliente completo
      const clientes = await this.skipro.getClientesParaWizard().toPromise();
      const clienteCompleto = clientes?.find(c => 
        c.email === cliente.email || 
        (c.nombre === cliente.nombre && c.apellido === cliente.apellido)
      );
      
      if (clienteCompleto) {
        this.clienteSeleccionado = clienteCompleto;
      }
    } catch (error) {
      console.error('❌ Error loading cliente:', error);
    }
  }

  cancelarReserva(reserva: SkiProBooking) {
    console.log('❌ Cancelar reserva:', reserva.id);
    // TODO: Implementar cancelación
  }

  formatearHora(fecha: Date): string {
    return fecha.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  onReservaCreada(reserva: SkiProBooking) {
    console.log('✅ Reserva creada:', reserva.id);
    this.mostrarWizard = false;
    // Recargar datos
    this.cargarDatos();
  }

  abrirWizardParaCliente(cliente: SkiProCliente) {
    console.log('✨ Abriendo wizard para cliente:', cliente.nombre);
    this.clienteSeleccionado = null;
    this.mostrarWizard = true;
    // TODO: Pre-seleccionar cliente en wizard
  }
}