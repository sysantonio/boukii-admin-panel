import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { BookingWizardComponent } from './wizard/booking-wizard.component';
import { BookingWizardDemoComponent } from './wizard/booking-wizard-demo.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'demo',
    pathMatch: 'full'
  },
  {
    path: 'demo',
    component: BookingWizardDemoComponent,
    data: {
      title: 'Sistema de Reservas V3 - Demo',
      description: 'Demostración del nuevo wizard inteligente',
      breadcrumbs: [
        { label: 'Inicio', url: '/home' },
        { label: 'Reservas V3', url: '/bookings-v3' },
        { label: 'Demo' }
      ]
    }
  },
  {
    path: 'wizard',
    component: BookingWizardComponent,
    data: {
      title: 'Nuevo Sistema de Reservas V3',
      description: 'Wizard inteligente de reservas con IA',
      breadcrumbs: [
        { label: 'Inicio', url: '/home' },
        { label: 'Reservas V3', url: '/bookings-v3' },
        { label: 'Nuevo Wizard' }
      ]
    }
  },
  {
    path: 'wizard/:mode',
    component: BookingWizardComponent,
    data: {
      title: 'Sistema de Reservas V3',
      description: 'Modo: Crear/Editar/Ver reserva',
      breadcrumbs: [
        { label: 'Inicio', url: '/home' },
        { label: 'Reservas V3', url: '/bookings-v3' },
        { label: 'Wizard' }
      ]
    }
  },
  {
    path: 'wizard/:mode/:id',
    component: BookingWizardComponent,
    data: {
      title: 'Editar Reserva V3',
      description: 'Edición avanzada con validaciones',
      breadcrumbs: [
        { label: 'Inicio', url: '/home' },
        { label: 'Reservas V3', url: '/bookings-v3' },
        { label: 'Editar Reserva' }
      ]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingsV3RoutingModule { }