import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Skipro Components
import { SkiProReservasListComponent } from './components/skipro-reservas-list/skipro-reservas-list.component';
import { SkiProWizardComponent } from './components/skipro-wizard/skipro-wizard.component';
import { SkiProClientePerfilComponent } from './components/skipro-cliente-perfil/skipro-cliente-perfil.component';
import { SkiProReservaDetallesComponent } from './components/skipro-reserva-detalles/skipro-reserva-detalles.component';

// Booking V3 Components
import { BookingWizardComponent } from './wizard/booking-wizard.component';
import { BookingWizardDemoComponent } from './wizard/booking-wizard-demo.component';

/**
 * Routing unificado para Booking System V3 & Skipro
 * Consolida todas las rutas en un solo módulo para mejor mantenimiento
 */
const routes: Routes = [
  {
    path: '',
    redirectTo: 'reservas',
    pathMatch: 'full'
  },
  
  // 📋 GESTIÓN DE RESERVAS
  {
    path: 'reservas',
    component: SkiProReservasListComponent,
    data: { 
      title: 'Gestión de Reservas',
      description: 'Lista completa de reservas con filtros y KPIs',
      breadcrumb: 'Reservas'
    }
  },
  
  // 🪄 WIZARD DE CREACIÓN
  {
    path: 'reservas/nueva',
    component: SkiProWizardComponent,
    data: { 
      title: 'Nueva Reserva',
      description: 'Wizard inteligente para crear reservas paso a paso',
      breadcrumb: 'Nueva Reserva'
    }
  },
  
  // 📝 DETALLES DE RESERVA
  {
    path: 'reservas/:id',
    component: SkiProReservaDetallesComponent,
    data: { 
      title: 'Detalle de Reserva',
      description: 'Vista completa de la reserva con opciones de edición',
      breadcrumb: 'Detalle'
    }
  },
  
  // ✏️ EDICIÓN DE RESERVA
  {
    path: 'reservas/:id/editar',
    component: SkiProWizardComponent,
    data: { 
      title: 'Editar Reserva',
      description: 'Modificar reserva existente',
      breadcrumb: 'Editar',
      mode: 'edit'
    }
  },
  
  // 👥 GESTIÓN DE CLIENTES
  {
    path: 'clientes',
    loadChildren: () => import('./modules/clients/clients.module').then(m => m.ClientsModule),
    data: { 
      title: 'Gestión de Clientes',
      breadcrumb: 'Clientes'
    }
  },
  
  // 👤 PERFIL DE CLIENTE
  {
    path: 'clientes/:id',
    component: SkiProClientePerfilComponent,
    data: { 
      title: 'Perfil de Cliente',
      description: 'Vista completa del cliente con historial y analytics',
      breadcrumb: 'Perfil Cliente'
    }
  },
  
  // 🎓 CURSOS Y ACTIVIDADES
  {
    path: 'cursos',
    loadChildren: () => import('./modules/courses/courses.module').then(m => m.CoursesModule),
    data: { 
      title: 'Gestión de Cursos',
      breadcrumb: 'Cursos'
    }
  },
  
  // 📊 ANALYTICS Y REPORTES
  {
    path: 'analytics',
    loadChildren: () => import('./modules/analytics/analytics.module').then(m => m.AnalyticsModule),
    data: { 
      title: 'Analytics y Reportes',
      breadcrumb: 'Analytics'
    }
  },
  
  // 🧪 DEMO Y TESTING (Solo en desarrollo)
  {
    path: 'demo',
    children: [
      {
        path: 'wizard-v3',
        component: BookingWizardComponent,
        data: { 
          title: 'Demo Wizard V3',
          description: 'Versión demo del wizard avanzado',
          breadcrumb: 'Demo Wizard V3'
        }
      },
      {
        path: 'wizard-demo',
        component: BookingWizardDemoComponent,
        data: { 
          title: 'Demo Wizard Original',
          description: 'Demo del wizard original para comparación',
          breadcrumb: 'Demo Original'
        }
      }
    ]
  },
  
  // 🔧 CONFIGURACIÓN
  {
    path: 'configuracion',
    loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule),
    data: { 
      title: 'Configuración del Sistema',
      breadcrumb: 'Configuración'
    }
  },
  
  // 🚫 RUTAS NO ENCONTRADAS
  {
    path: '**',
    redirectTo: 'reservas'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingsV3UnifiedRoutingModule { 

  /**
   * Configuración de rutas disponible para otros módulos
   */
  static getRouteConfig() {
    return {
      main: '/bookings-v3/reservas',
      newBooking: '/bookings-v3/reservas/nueva',
      clientProfile: (id: number) => `/bookings-v3/clientes/${id}`,
      bookingDetail: (id: string) => `/bookings-v3/reservas/${id}`,
      editBooking: (id: string) => `/bookings-v3/reservas/${id}/editar`,
      analytics: '/bookings-v3/analytics',
      courses: '/bookings-v3/cursos'
    };
  }
}