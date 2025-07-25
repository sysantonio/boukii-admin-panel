import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SkiProReservasListComponent } from './components/skipro-reservas-list/skipro-reservas-list.component';
import { SkiProWizardComponent } from './components/skipro-wizard/skipro-wizard.component';
import { SkiProClientePerfilComponent } from './components/skipro-cliente-perfil/skipro-cliente-perfil.component';

const routes: Routes = [
  {
    path: '',
    component: SkiProReservasListComponent,
    data: {
      toolbarShadowEnabled: false,
      containerEnabled: true
    }
  },
  {
    path: 'wizard',
    component: SkiProWizardComponent,
    data: {
      toolbarShadowEnabled: false,
      containerEnabled: false
    }
  },
  {
    path: 'wizard/:reservaId',
    component: SkiProWizardComponent,
    data: {
      toolbarShadowEnabled: false,
      containerEnabled: false
    }
  },
  {
    path: 'cliente/:clienteId',
    component: SkiProClientePerfilComponent,
    data: {
      toolbarShadowEnabled: false,
      containerEnabled: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SkiProRoutingModule { }