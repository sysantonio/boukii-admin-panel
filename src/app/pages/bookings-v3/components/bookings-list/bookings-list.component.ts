import { Component, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

// Services
import { BookingV3Service } from '../../services/booking-v3.service';
import { ClientV3Service } from '../../services/client-v3.service';

// Interfaces  
import { 
  BookingV3, 
  BookingV3KPIs, 
  BookingV3Filter,
  ClientV3 
} from '../../interfaces/booking-v3.interfaces';

// Modals
import { BookingDetailModalComponent } from '../modals/booking-detail-modal/booking-detail-modal.component';
import { CancelBookingDialogComponent } from '../modals/cancel-booking-dialog/cancel-booking-dialog.component';

// Routes
import { BookingsV3Routes } from '../../bookings-v3-routing.module';

@Component({
  selector: 'app-bookings-list',
  template: `
    <vex-page-layout>
      <vex-page-layout-header class="pb-16 flex flex-col items-start justify-center">
        <div class="w-full flex flex-col sm:flex-row justify-between">
          <div>
            <h1 class="title mt-0 mb-1">Gestión de Reservas</h1>
            <div class="body-2 text-secondary">
              Sistema unificado de reservas V3 - Cursos, actividades y material
            </div>
          </div>
          <div class="flex gap-4 mt-4 sm:mt-0 items-center">
            <span class="text-sm text-secondary">{{ totalReservas() }} reservas</span>
            <span class="text-sm text-secondary">{{ reservasPendientes() }} pendientes</span>
            <button mat-raised-button color="primary" (click)="crearNuevaReserva()">
              <mat-icon>add</mat-icon>
              Nueva reserva
            </button>
          </div>
        </div>
      </vex-page-layout-header>

      <vex-page-layout-content class="-mt-6">
        <!-- Loading State -->
        <div *ngIf="loading()" class="flex justify-center items-center py-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <!-- Error State -->
        <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <mat-icon class="text-red-600 mr-2">error</mat-icon>
            <span class="text-red-800">{{ error() }}</span>
            <button mat-button color="primary" (click)="recargarDatos()" class="ml-auto">
              Reintentar
            </button>
          </div>
        </div>

        <!-- KPIs Dashboard -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6" *ngIf="!loading()">
          <mat-card class="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer"
                    (click)="filtrarPorTipo('Cursos')">
            <div class="flex items-center justify-center mb-2">
              <mat-icon class="text-purple-500 mr-2">school</mat-icon>
              <span class="text-2xl font-semibold">{{ kpis().cursos }}</span>
            </div>
            <div class="text-sm text-secondary">Cursos</div>
          </mat-card>

          <mat-card class="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer"
                    (click)="filtrarPorTipo('Actividades')">
            <div class="flex items-center justify-center mb-2">
              <mat-icon class="text-blue-500 mr-2">sports</mat-icon>
              <span class="text-2xl font-semibold">{{ kpis().actividades }}</span>
            </div>
            <div class="text-sm text-secondary">Actividades</div>
          </mat-card>

          <mat-card class="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer"
                    (click)="filtrarPorTipo('Material')">
            <div class="flex items-center justify-center mb-2">
              <mat-icon class="text-green-500 mr-2">inventory</mat-icon>
              <span class="text-2xl font-semibold">{{ kpis().material }}</span>
            </div>
            <div class="text-sm text-secondary">Material</div>
          </mat-card>

          <mat-card class="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer"
                    (click)="filtrarPorEstado('Confirmado')">
            <div class="flex items-center justify-center mb-2">
              <mat-icon class="text-green-600 mr-2">check_circle</mat-icon>
              <span class="text-2xl font-semibold">{{ kpis().confirmadas }}</span>
            </div>
            <div class="text-sm text-secondary">Confirmadas</div>
          </mat-card>

          <mat-card class="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer"
                    (click)="filtrarPorEstado('Pagado')">
            <div class="flex items-center justify-center mb-2">
              <mat-icon class="text-blue-600 mr-2">payment</mat-icon>
              <span class="text-2xl font-semibold">{{ kpis().pagadas }}</span>
            </div>
            <div class="text-sm text-secondary">Pagadas</div>
          </mat-card>

          <mat-card class="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer"
                    (click)="filtrarPorEstado('Cancelado')">
            <div class="flex items-center justify-center mb-2">
              <mat-icon class="text-red-600 mr-2">cancel</mat-icon>
              <span class="text-2xl font-semibold">{{ kpis().canceladas }}</span>
            </div>
            <div class="text-sm text-secondary">Canceladas</div>
          </mat-card>
        </div>

        <!-- Filtros -->
        <mat-card class="p-4 mb-6" *ngIf="!loading()">
          <div class="flex flex-col sm:flex-row gap-4 items-end">
            <!-- Filtro por Tipo -->
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Tipo de reserva</mat-label>
              <mat-select [(value)]="filtros.tipo" (selectionChange)="aplicarFiltros()">
                <mat-option value="Todas">Todas</mat-option>
                <mat-option value="Cursos">Cursos</mat-option>
                <mat-option value="Actividades">Actividades</mat-option>
                <mat-option value="Material">Material</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Filtro por Estado -->
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Estado</mat-label>
              <mat-select [(value)]="filtros.estado" (selectionChange)="aplicarFiltros()">
                <mat-option value="">Todos</mat-option>
                <mat-option value="Confirmado">Confirmado</mat-option>
                <mat-option value="Pendiente">Pendiente</mat-option>
                <mat-option value="Pagado">Pagado</mat-option>
                <mat-option value="Cancelado">Cancelado</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Búsqueda -->
            <mat-form-field appearance="outline" class="flex-2">
              <mat-label>Buscar cliente, reserva...</mat-label>
              <input matInput [(ngModel)]="filtros.busqueda" (ngModelChange)="aplicarFiltros()" 
                     placeholder="Nombre del cliente, número de reserva...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <!-- Limpiar Filtros -->
            <button mat-outlined-button (click)="limpiarFiltros()" 
                    [disabled]="!tieneFiltrosActivos()">
              <mat-icon>clear</mat-icon>
              Limpiar
            </button>
          </div>
        </mat-card>

        <!-- Lista de Reservas -->
        <mat-card *ngIf="!loading()">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reserva
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let reserva of reservasFiltradas(); trackBy: trackByReserva"
                    class="hover:bg-gray-50 transition-colors">
                  <!-- Cliente -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
                          {{ reserva.cliente.iniciales }}
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900 cursor-pointer hover:text-purple-600"
                             (click)="verPerfilCliente(reserva.cliente.id)">
                          {{ reserva.cliente.nombre }} {{ reserva.cliente.apellido }}
                        </div>
                        <div class="text-sm text-gray-500">{{ reserva.cliente.email }}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Tipo -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <mat-icon [style.color]="reserva.tipoColor" class="mr-2">{{ reserva.tipoIcon }}</mat-icon>
                      <span class="text-sm font-medium">{{ reserva.tipo }}</span>
                    </div>
                  </td>

                  <!-- Reserva -->
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{{ reserva.reserva.nombre }}</div>
                    <div class="text-sm text-gray-500">{{ reserva.reserva.descripcion }}</div>
                  </td>

                  <!-- Fechas -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ reserva.fechas.display }}
                  </td>

                  <!-- Estado -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          [style.background-color]="reserva.estadoColor + '20'"
                          [style.color]="reserva.estadoColor">
                      {{ reserva.estado }}
                    </span>
                  </td>

                  <!-- Precio -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ reserva.precio | currency:reserva.moneda:'symbol':'1.2-2' }}
                  </td>

                  <!-- Acciones -->
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button mat-icon-button [matMenuTriggerFor]="menuAcciones">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menuAcciones="matMenu">
                      <button mat-menu-item (click)="verDetalleReserva(reserva)">
                        <mat-icon>visibility</mat-icon>
                        <span>Ver detalles</span>
                      </button>
                      <button mat-menu-item (click)="editarReserva(reserva)" 
                              [disabled]="reserva.estado === 'Cancelado'">
                        <mat-icon>edit</mat-icon>
                        <span>Editar</span>
                      </button>
                      <mat-divider></mat-divider>
                      <button mat-menu-item (click)="cancelarReserva(reserva)" 
                              [disabled]="reserva.estado === 'Cancelado'"
                              class="text-red-600">
                        <mat-icon>cancel</mat-icon>
                        <span>Cancelar</span>
                      </button>
                    </mat-menu>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div *ngIf="reservasFiltradas().length === 0" 
                 class="text-center py-12">
              <mat-icon class="text-gray-400 text-4xl mb-4">inbox</mat-icon>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No hay reservas</h3>
              <p class="text-gray-500 mb-4">
                {{ tieneFiltrosActivos() ? 'No se encontraron reservas con los filtros aplicados' : 'Aún no tienes reservas registradas' }}
              </p>
              <button mat-raised-button color="primary" (click)="crearNuevaReserva()">
                <mat-icon>add</mat-icon>
                Crear primera reserva
              </button>
            </div>
          </div>
        </mat-card>
      </vex-page-layout-content>
    </vex-page-layout>
  `,
  styles: [`
    .mat-mdc-card {
      @apply shadow-sm border border-gray-200;
    }
    .mat-mdc-card:hover {
      @apply shadow-md;
    }
    table th {
      @apply font-semibold;
    }
  `]
})
export class BookingsListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Injected Services
  private bookingService = inject(BookingV3Service);
  private clientService = inject(ClientV3Service);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Reactive State
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  reservas = signal<BookingV3[]>([]);
  kpis = signal<BookingV3KPIs>({
    cursos: 0,
    actividades: 0,
    material: 0,
    confirmadas: 0,
    pagadas: 0,
    canceladas: 0
  });

  // Filters
  filtros: BookingV3Filter = {
    tipo: 'Todas',
    estado: '',
    busqueda: ''
  };

  // Computed Values
  reservasFiltradas = computed(() => {
    let filtered = this.reservas();

    // Filtro por tipo
    if (this.filtros.tipo !== 'Todas') {
      filtered = filtered.filter(r => r.tipo === this.filtros.tipo);
    }

    // Filtro por estado
    if (this.filtros.estado) {
      filtered = filtered.filter(r => r.estado === this.filtros.estado);
    }

    // Filtro por búsqueda
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      filtered = filtered.filter(r => 
        r.cliente.nombre.toLowerCase().includes(busqueda) ||
        r.cliente.apellido.toLowerCase().includes(busqueda) ||
        r.cliente.email.toLowerCase().includes(busqueda) ||
        r.reserva.nombre.toLowerCase().includes(busqueda) ||
        r.id.includes(busqueda)
      );
    }

    return filtered;
  });

  totalReservas = computed(() => this.reservas().length);
  reservasPendientes = computed(() => 
    this.reservas().filter(r => r.estado === 'Pendiente').length
  );

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============= DATA LOADING =============

  private async cargarDatos(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      // Cargar reservas y KPIs en paralelo
      const [reservasData, kpisData] = await Promise.all([
        this.bookingService.getBookings().toPromise(),
        this.bookingService.getKPIs().toPromise()
      ]);

      this.reservas.set(reservasData || []);
      this.kpis.set(kpisData || this.kpis());

    } catch (error: any) {
      console.error('Error cargando datos:', error);
      this.error.set('Error al cargar las reservas. Por favor, inténtalo de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  recargarDatos(): void {
    this.cargarDatos();
  }

  // ============= FILTERS =============

  aplicarFiltros(): void {
    // Los filtros se aplican automáticamente vía computed
    // Este método se puede usar para lógica adicional si es necesario
  }

  filtrarPorTipo(tipo: string): void {
    this.filtros.tipo = tipo as any;
  }

  filtrarPorEstado(estado: string): void {
    this.filtros.estado = estado;
  }

  limpiarFiltros(): void {
    this.filtros = {
      tipo: 'Todas',
      estado: '',
      busqueda: ''
    };
  }

  tieneFiltrosActivos(): boolean {
    return this.filtros.tipo !== 'Todas' || 
           !!this.filtros.estado || 
           !!this.filtros.busqueda;
  }

  // ============= ACTIONS =============

  crearNuevaReserva(): void {
    this.router.navigate(['/bookings-v3', BookingsV3Routes.NUEVA_RESERVA]);
  }

  verDetalleReserva(reserva: BookingV3): void {
    const dialogRef = this.dialog.open(BookingDetailModalComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { reserva }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.updated) {
        this.recargarDatos();
      }
    });
  }

  editarReserva(reserva: BookingV3): void {
    this.router.navigate(['/bookings-v3', BookingsV3Routes.EDITAR_RESERVA(reserva.id)]);
  }

  cancelarReserva(reserva: BookingV3): void {
    const dialogRef = this.dialog.open(CancelBookingDialogComponent, {
      width: '500px',
      data: { id: reserva.id, nombre: reserva.reserva.nombre }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Reserva cancelada correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.recargarDatos();
      }
    });
  }

  verPerfilCliente(clienteId: number): void {
    this.router.navigate(['/bookings-v3', BookingsV3Routes.PERFIL_CLIENTE(clienteId)]);
  }

  // ============= UTILITIES =============

  trackByReserva(index: number, reserva: BookingV3): string {
    return reserva.id;
  }
}