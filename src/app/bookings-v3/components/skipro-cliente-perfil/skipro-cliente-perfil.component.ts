import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SkiProMockDataService } from '../../services/mock/skipro-mock-data.service';
import { SkiProCliente } from '../../interfaces/skipro.interfaces';

@Component({
  selector: 'app-skipro-cliente-perfil',
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xl">
              {{ cliente()?.iniciales }}
            </div>
            <div>
              <h2 class="text-xl font-semibold">{{ cliente()?.nombre }} {{ cliente()?.apellido }}</h2>
              <p class="text-sm text-secondary">Cliente desde {{ formatearFecha(cliente()?.fechaRegistro) }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-sm">{{ cliente()?.email }}</span>
                <span class="text-sm">{{ cliente()?.telefono }}</span>
                <mat-icon class="text-yellow-500 text-sm">star</mat-icon>
                <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  {{ cliente()?.nivel }}
                </span>
              </div>
            </div>
          </div>
          <button mat-icon-button (click)="cerrarPerfil()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Métricas -->
        <div class="px-6 py-4 border-b">
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-3xl font-bold text-primary mb-1">{{ cliente()?.totalReservas }}</div>
              <div class="text-sm text-secondary">Reservas totales</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-500 mb-1">{{ cliente()?.cursosCompletados }}</div>
              <div class="text-sm text-secondary">Cursos completados</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-yellow-500 mb-1">{{ cliente()?.gastoTotal }}€</div>
              <div class="text-sm text-secondary">Gasto total</div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="px-6 py-2 border-b">
          <div class="flex gap-4">
            <button class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    [class.bg-primary]="tabActiva() === 'activas'"
                    [class.text-primary-contrast]="tabActiva() === 'activas'"
                    [class.text-secondary]="tabActiva() !== 'activas'"
                    (click)="cambiarTab('activas')">
              <mat-icon class="text-sm mr-1">event</mat-icon>
              Reservas Activas ({{ cliente()?.reservasActivas?.length || 0 }})
            </button>
            <button class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    [class.bg-primary]="tabActiva() === 'historial'"
                    [class.text-primary-contrast]="tabActiva() === 'historial'"
                    [class.text-secondary]="tabActiva() !== 'historial'"
                    (click)="cambiarTab('historial')">
              <mat-icon class="text-sm mr-1">history</mat-icon>
              Historial ({{ cliente()?.historial?.length || 0 }})
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto max-h-80">
          
          <!-- Reservas Activas -->
          <div *ngIf="tabActiva() === 'activas'">
            <div *ngIf="cliente()?.reservasActivas?.length === 0" class="text-center py-8">
              <mat-icon class="text-6xl text-gray-300 mb-4">event_busy</mat-icon>
              <h3 class="text-lg font-medium mb-2">No hay reservas activas</h3>
              <p class="text-secondary">Este cliente no tiene reservas pendientes</p>
            </div>
            
            <div *ngFor="let reserva of cliente()?.reservasActivas" 
                 class="mb-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="text-2xl">
                    {{ getTipoIcon(reserva.tipo) }}
                  </div>
                  <div>
                    <div class="font-semibold">{{ reserva.nombre }}</div>
                    <div class="text-sm text-secondary">{{ reserva.descripcion }}</div>
                    <div class="text-xs text-secondary mt-1">{{ reserva.fechas }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold">{{ reserva.precio }}€</div>
                  <div class="text-xs px-2 py-1 rounded-full"
                       [class.bg-blue-100]="reserva.estado === 'Confirmado'"
                       [class.text-blue-800]="reserva.estado === 'Confirmado'"
                       [class.bg-yellow-100]="reserva.estado === 'Pendiente'"
                       [class.text-yellow-800]="reserva.estado === 'Pendiente'">
                    {{ reserva.estado }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Historial -->
          <div *ngIf="tabActiva() === 'historial'">
            <div *ngIf="cliente()?.historial?.length === 0" class="text-center py-8">
              <mat-icon class="text-6xl text-gray-300 mb-4">history</mat-icon>
              <h3 class="text-lg font-medium mb-2">Sin historial</h3>
              <p class="text-secondary">Este cliente no tiene reservas anteriores</p>
            </div>
            
            <div *ngFor="let reserva of cliente()?.historial" 
                 class="mb-4 p-4 border rounded-lg">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="text-2xl">
                    {{ getTipoIcon(reserva.tipo) }}
                  </div>
                  <div>
                    <div class="font-semibold">{{ reserva.nombre }}</div>
                    <div class="text-sm text-secondary">{{ reserva.descripcion }}</div>
                    <div class="text-xs text-secondary mt-1">{{ reserva.fechas }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold">{{ reserva.precio }}€</div>
                  <div class="text-xs px-2 py-1 rounded-full"
                       [class.bg-green-100]="reserva.estado === 'Completado'"
                       [class.text-green-800]="reserva.estado === 'Completado'"
                       [class.bg-red-100]="reserva.estado === 'Cancelado'"
                       [class.text-red-800]="reserva.estado === 'Cancelado'">
                    {{ reserva.estado }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preferencias (siempre visible) -->
        <div class="px-6 py-4 border-t bg-gray-50">
          <h4 class="font-semibold mb-3">Preferencias</h4>
          <div class="flex flex-wrap gap-2">
            <span *ngFor="let preferencia of cliente()?.preferencias" 
                  class="px-3 py-1 bg-white border rounded-full text-sm">
              {{ preferencia }}
            </span>
            <span *ngIf="!cliente()?.preferencias?.length" 
                  class="text-sm text-secondary italic">
              No hay preferencias registradas
            </span>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t flex justify-between">
          <button mat-button (click)="cerrarPerfil()">Cerrar</button>
          <button mat-raised-button color="primary" (click)="crearNuevaReserva()">
            <mat-icon>add</mat-icon>
            Nueva reserva
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mat-mdc-tab-group {
      border: none;
    }
  `]
})
export class SkiProClientePerfilComponent implements OnInit {
  
  private skipro = inject(SkiProMockDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Signals
  public cliente = signal<SkiProCliente | null>(null);
  public tabActiva = signal<'activas' | 'historial'>('activas');
  public cargando = signal(true);

  ngOnInit() {
    this.cargarCliente();
  }

  private async cargarCliente() {
    const clienteId = this.route.snapshot.paramMap.get('clienteId');
    
    if (!clienteId) {
      console.error('❌ No se proporcionó ID de cliente');
      this.cerrarPerfil();
      return;
    }

    try {
      // Simular búsqueda por email (en las imágenes se ve que se usa el nombre de usuario)
      const clientes = await this.skipro.getClientesParaWizard().toPromise();
      const cliente = clientes?.find(c => 
        c.email.includes(clienteId) || 
        c.nombre.toLowerCase().includes(clienteId.toLowerCase()) ||
        c.apellido.toLowerCase().includes(clienteId.toLowerCase())
      );

      if (cliente) {
        this.cliente.set(cliente);
        console.log('👤 Cliente cargado:', cliente.nombre);
      } else {
        console.error('❌ Cliente no encontrado:', clienteId);
        this.cerrarPerfil();
      }
    } catch (error) {
      console.error('❌ Error loading cliente:', error);
      this.cerrarPerfil();
    } finally {
      this.cargando.set(false);
    }
  }

  cambiarTab(tab: 'activas' | 'historial') {
    this.tabActiva.set(tab);
    console.log('📋 Cambiando a tab:', tab);
  }

  getTipoIcon(tipo: string): string {
    const icons: { [key: string]: string } = {
      'Curso': '🎓',
      'Actividad': '⚡',
      'Material': '📦'
    };
    return icons[tipo] || '📝';
  }

  formatearFecha(fecha?: Date): string {
    if (!fecha) return 'N/A';
    return fecha.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long' 
    });
  }

  crearNuevaReserva() {
    console.log('✨ Creando nueva reserva para cliente:', this.cliente()?.nombre);
    this.router.navigate(['/bookings-v3/skipro/wizard'], {
      queryParams: { clienteId: this.cliente()?.id }
    });
  }

  cerrarPerfil() {
    console.log('❌ Cerrando perfil de cliente');
    this.router.navigate(['/bookings-v3/skipro']);
  }
}