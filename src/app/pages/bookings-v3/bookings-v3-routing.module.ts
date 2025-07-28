import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { BookingsListComponent } from './components/bookings-list/bookings-list.component';
import { BookingWizardComponent } from './components/booking-wizard/booking-wizard.component';
import { ClientProfileComponent } from './components/client-profile/client-profile.component';

/**
 * Routing limpio y consolidado para Booking System V3
 * Unifica todas las funcionalidades de Skipro + BookingV3
 */
const routes: Routes = [
  {
    path: '',
    redirectTo: 'reservas',
    pathMatch: 'full'
  },
  
  // 📋 LISTA PRINCIPAL DE RESERVAS
  {
    path: 'reservas',
    component: BookingsListComponent,
    data: { 
      title: 'Gestión de Reservas',
      description: 'Lista completa de reservas con filtros y KPIs',
      toolbarShadowEnabled: false,
      containerEnabled: true
    }
  },
  
  // 🪄 WIZARD PARA NUEVA RESERVA
  {
    path: 'reservas/nueva',
    component: BookingWizardComponent,
    data: { 
      title: 'Nueva Reserva',
      description: 'Wizard inteligente para crear reservas',
      toolbarShadowEnabled: false,
      containerEnabled: false,
      mode: 'create'
    }
  },
  
  // ✏️ WIZARD PARA EDITAR RESERVA EXISTENTE
  {
    path: 'reservas/:id/editar',
    component: BookingWizardComponent,
    data: { 
      title: 'Editar Reserva',
      description: 'Modificar reserva existente',
      toolbarShadowEnabled: false,
      containerEnabled: false,
      mode: 'edit'
    }
  },
  
  // 👤 PERFIL COMPLETO DE CLIENTE
  {
    path: 'clientes/:id',
    component: ClientProfileComponent,
    data: { 
      title: 'Perfil de Cliente',
      description: 'Vista completa del cliente con historial',
      toolbarShadowEnabled: false,
      containerEnabled: false
    }
  },

  // 🚫 FALLBACK - Redirigir a lista principal
  {
    path: '**',
    redirectTo: 'reservas'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingsV3RoutingModule { }

/**
 * Helper para obtener rutas programáticamente
 */
export class BookingsV3Routes {
  static readonly RESERVAS = '';
  static readonly NUEVA_RESERVA = 'reservas/nueva';
  static readonly EDITAR_RESERVA = (id: string) => `reservas/${id}/editar`;
  static readonly PERFIL_CLIENTE = (id: number) => `clientes/${id}`;
}