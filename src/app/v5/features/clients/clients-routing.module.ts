import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientListSeasonComponent } from './components/client-list-season/client-list-season.component';

const routes: Routes = [
  {
    path: '',
    component: ClientListSeasonComponent,
    data: {
      title: 'Clients',
      breadcrumb: 'Clients'
    }
  }
  // Rutas adicionales se agregarán cuando se implementen los componentes
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule {}