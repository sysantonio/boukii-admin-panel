import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// Services
import { ClientV3Service } from '../../services/client-v3.service';
import { BookingV3Service } from '../../services/booking-v3.service';

// Interfaces
import { 
  ClientV3, 
  ClientV3Details, 
  BookingV3,
  ClientV3Statistics
} from '../../interfaces/booking-v3.interfaces';

// Modals
import { BookingDetailModalComponent } from '../modals/booking-detail-modal/booking-detail-modal.component';
import { CancelBookingDialogComponent } from '../modals/cancel-booking-dialog/cancel-booking-dialog.component';

@Component({
  selector: 'app-client-profile',
  template: `
    <vex-page-layout>
      <vex-page-layout-header class="pb-16 flex flex-col items-start justify-center">
        <div class="w-full flex flex-col sm:flex-row justify-between">
          <div class="flex items-center gap-4">
            <button mat-icon-button (click)="volver()" class="mr-2">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div>
              <h1 class="title mt-0 mb-1">Perfil de Cliente</h1>
              <div class="body-2 text-secondary" *ngIf="cliente()">
                {{ cliente()?.nombre }} {{ cliente()?.apellido }}
              </div>
            </div>
          </div>
          <div class="flex gap-2 mt-4 sm:mt-0">
            <button mat-outlined-button (click)="editarCliente()" [disabled]="loading()">
              <mat-icon>edit</mat-icon>
              Editar Cliente
            </button>
            <button mat-raised-button color="primary" (click)="nuevaReserva()" [disabled]="loading()">
              <mat-icon>add</mat-icon>
              Nueva Reserva
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

        <!-- Client Info & Stats -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6" *ngIf="!loading() && cliente()">
          
          <!-- Client Profile Card -->
          <mat-card class="lg:col-span-1">
            <div class="p-6 text-center">
              <div class="w-24 h-24 rounded-full bg-purple-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {{ cliente()?.iniciales }}
              </div>
              <h2 class="text-xl font-semibold mb-2">
                {{ cliente()?.nombre }} {{ cliente()?.apellido }}
              </h2>
              <p class="text-secondary mb-4">{{ cliente()?.email }}</p>
              
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-secondary">Teléfono:</span>
                  <span>{{ cliente()?.telefono || 'No registrado' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-secondary">Nivel:</span>
                  <span class="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {{ cliente()?.nivel }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-secondary">Miembro desde:</span>
                  <span>{{ cliente()?.fechaRegistro | date:'shortDate' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-secondary">Última actividad:</span>
                  <span>{{ stats()?.ultimaActividad | date:'shortDate' || 'Nunca' }}</span>
                </div>
              </div>
            </div>
          </mat-card>

          <!-- Statistics Cards -->
          <div class="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <mat-card class="p-4 text-center hover:shadow-lg transition-shadow">
              <div class="flex items-center justify-center mb-2">
                <mat-icon class="text-blue-500 mr-2">book</mat-icon>
                <span class="text-2xl font-semibold">{{ stats()?.totalReservas || 0 }}</span>
              </div>
              <div class="text-sm text-secondary">Total Reservas</div>
            </mat-card>

            <mat-card class="p-4 text-center hover:shadow-lg transition-shadow">
              <div class="flex items-center justify-center mb-2">
                <mat-icon class="text-green-500 mr-2">check_circle</mat-icon>
                <span class="text-2xl font-semibold">{{ stats()?.reservasCompletadas || 0 }}</span>
              </div>
              <div class="text-sm text-secondary">Completadas</div>
            </mat-card>

            <mat-card class="p-4 text-center hover:shadow-lg transition-shadow">
              <div class="flex items-center justify-center mb-2">
                <mat-icon class="text-orange-500 mr-2">schedule</mat-icon>
                <span class="text-2xl font-semibold">{{ stats()?.reservasActivas || 0 }}</span>
              </div>
              <div class="text-sm text-secondary">Activas</div>
            </mat-card>

            <mat-card class="p-4 text-center hover:shadow-lg transition-shadow">
              <div class="flex items-center justify-center mb-2">
                <mat-icon class="text-purple-500 mr-2">euro</mat-icon>
                <span class="text-2xl font-semibold">{{ stats()?.gastoTotal || 0 }}€</span>
              </div>
              <div class="text-sm text-secondary">Gasto Total</div>
            </mat-card>
          </div>
        </div>

        <!-- Tabs for detailed information -->
        <mat-card *ngIf="!loading() && cliente()">
          <mat-tab-group>
            
            <!-- Reservas Activas -->
            <mat-tab label="Reservas Activas ({{ reservasActivas().length }})">
              <div class="p-6">
                <div *ngIf="reservasActivas().length === 0" class="text-center py-8">
                  <mat-icon class="text-gray-400 text-4xl mb-4">inbox</mat-icon>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Sin reservas activas</h3>
                  <p class="text-gray-500 mb-4">Este cliente no tiene reservas activas actualmente.</p>
                  <button mat-raised-button color="primary" (click)="nuevaReserva()">
                    <mat-icon>add</mat-icon>
                    Crear Nueva Reserva
                  </button>
                </div>

                <div class="space-y-4" *ngIf="reservasActivas().length > 0">
                  <div *ngFor="let reserva of reservasActivas()" 
                       class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                          <mat-icon [style.color]="reserva.tipoColor">{{ reserva.tipoIcon }}</mat-icon>
                          <h4 class="font-semibold">{{ reserva.reserva.nombre }}</h4>
                          <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                                [style.background-color]="reserva.estadoColor + '20'"
                                [style.color]="reserva.estadoColor">
                            {{ reserva.estado }}
                          </span>
                        </div>
                        <p class="text-sm text-secondary mb-2">{{ reserva.reserva.descripcion }}</p>
                        <div class="text-sm">
                          <span class="font-medium">Fechas:</span> {{ reserva.fechas.display }}
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="font-bold text-lg">{{ reserva.precio | currency:reserva.moneda:'symbol':'1.2-2' }}</div>
                        <div class="flex gap-1 mt-2">
                          <button mat-icon-button (click)="verDetalleReserva(reserva)" matTooltip="Ver detalles">
                            <mat-icon>visibility</mat-icon>
                          </button>
                          <button mat-icon-button (click)="editarReserva(reserva)" matTooltip="Editar">
                            <mat-icon>edit</mat-icon>
                          </button>
                          <button mat-icon-button (click)="cancelarReserva(reserva)" 
                                  matTooltip="Cancelar" class="text-red-600">
                            <mat-icon>cancel</mat-icon>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Historial -->
            <mat-tab label="Historial ({{ historialReservas().length }})">
              <div class="p-6">
                <div *ngIf="historialReservas().length === 0" class="text-center py-8">
                  <mat-icon class="text-gray-400 text-4xl mb-4">history</mat-icon>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Sin historial</h3>
                  <p class="text-gray-500">Este cliente no tiene reservas anteriores.</p>
                </div>

                <div class="space-y-4" *ngIf="historialReservas().length > 0">
                  <div *ngFor="let reserva of historialReservas()" 
                       class="border rounded-lg p-4">
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                          <mat-icon [style.color]="reserva.tipoColor">{{ reserva.tipoIcon }}</mat-icon>
                          <h4 class="font-semibold">{{ reserva.reserva.nombre }}</h4>
                          <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                                [style.background-color]="reserva.estadoColor + '20'"
                                [style.color]="reserva.estadoColor">
                            {{ reserva.estado }}
                          </span>
                        </div>
                        <p class="text-sm text-secondary mb-2">{{ reserva.reserva.descripcion }}</p>
                        <div class="text-sm">
                          <span class="font-medium">Fechas:</span> {{ reserva.fechas.display }}
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="font-bold text-lg">{{ reserva.precio | currency:reserva.moneda:'symbol':'1.2-2' }}</div>
                        <button mat-icon-button (click)="verDetalleReserva(reserva)" matTooltip="Ver detalles">
                          <mat-icon>visibility</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Información Adicional -->
            <mat-tab label="Información">
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <!-- Contact Info -->
                  <div>
                    <h3 class="text-lg font-semibold mb-4">Información de Contacto</h3>
                    <div class="space-y-3">
                      <div class="flex justify-between">
                        <span class="text-secondary">Email:</span>
                        <span>{{ cliente()?.email }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-secondary">Teléfono:</span>
                        <span>{{ cliente()?.telefono || 'No registrado' }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-secondary">Nivel:</span>
                        <span>{{ cliente()?.nivel }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Preferences -->
                  <div>
                    <h3 class="text-lg font-semibold mb-4">Preferencias</h3>
                    <div class="space-y-3">
                      <div *ngIf="cliente()?.preferencias?.length === 0" class="text-secondary">
                        Sin preferencias registradas
                      </div>
                      <div *ngFor="let preferencia of cliente()?.preferencias" 
                           class="px-3 py-2 bg-gray-100 rounded-lg">
                        {{ preferencia }}
                      </div>
                    </div>
                  </div>

                  <!-- Notes -->
                  <div class="md:col-span-2">
                    <h3 class="text-lg font-semibold mb-4">Notas</h3>
                    <div class="p-4 bg-gray-50 rounded-lg min-h-24">
                      <p class="text-secondary" *ngIf="!cliente()?.notas">
                        Sin notas adicionales
                      </p>
                      <p *ngIf="cliente()?.notas">{{ cliente()?.notas }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>

          </mat-tab-group>
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
    .mat-mdc-tab-body-content {
      overflow: visible !important;
    }
  `]
})
export class ClientProfileComponent implements OnInit {
  
  // Injected Services
  private clientService = inject(ClientV3Service);
  private bookingService = inject(BookingV3Service);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Reactive State
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  cliente = signal<ClientV3 | null>(null);
  reservas = signal<BookingV3[]>([]);
  stats = signal<ClientV3Statistics | null>(null);

  // Computed Values
  reservasActivas = computed(() => 
    this.reservas().filter(r => ['Confirmado', 'Pendiente', 'Pagado'].includes(r.estado))
  );

  historialReservas = computed(() => 
    this.reservas().filter(r => ['Completado', 'Cancelado'].includes(r.estado))
  );

  async ngOnInit(): Promise<void> {
    const clienteId = this.route.snapshot.paramMap.get('id');
    if (clienteId) {
      await this.cargarDatosCliente(parseInt(clienteId));
    } else {
      this.error.set('ID de cliente no válido');
      this.loading.set(false);
    }
  }

  private async cargarDatosCliente(clienteId: number): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      // Load client data and their bookings in parallel
      const [clienteData, reservasData, statsData] = await Promise.all([
        this.clientService.getClientById(clienteId).toPromise(),
        this.bookingService.getBookingsByClient(clienteId).toPromise(),
        this.clientService.getClientStatistics(clienteId).toPromise()
      ]);

      if (!clienteData) {
        this.error.set('Cliente no encontrado');
        return;
      }

      this.cliente.set(clienteData);
      this.reservas.set(reservasData || []);
      this.stats.set(statsData || null);

    } catch (error: any) {
      console.error('Error loading client data:', error);
      this.error.set('Error al cargar los datos del cliente. Por favor, inténtalo de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  recargarDatos(): void {
    const clienteId = this.route.snapshot.paramMap.get('id');
    if (clienteId) {
      this.cargarDatosCliente(parseInt(clienteId));
    }
  }

  // ============= ACTIONS =============

  volver(): void {
    this.router.navigate(['/bookings-v3/reservas']);
  }

  editarCliente(): void {
    const clienteId = this.cliente()?.id;
    if (clienteId) {
      // Navigate to client edit form (would need to be implemented)
      console.log('Edit client:', clienteId);
      this.snackBar.open('Funcionalidad de edición en desarrollo', 'Cerrar', {
        duration: 3000
      });
    }
  }

  nuevaReserva(): void {
    const clienteId = this.cliente()?.id;
    if (clienteId) {
      this.router.navigate(['/bookings-v3/reservas/nueva'], {
        queryParams: { clienteId }
      });
    }
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
    this.router.navigate(['/bookings-v3/reservas', reserva.id, 'editar']);
  }

  cancelarReserva(reserva: BookingV3): void {
    const dialogRef = this.dialog.open(CancelBookingDialogComponent, {
      width: '500px',
      data: { 
        id: reserva.id, 
        nombre: reserva.reserva.nombre,
        clienteNombre: `${reserva.cliente.nombre} ${reserva.cliente.apellido}`
      }
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
}