import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import { VexRoutes } from 'src/@vex/interfaces/vex-route.interface';
import { MonitorsComponent } from './monitors.component';
import { MonitorsCreateUpdateComponent } from './monitors-create-update/monitors-create-update.component';


const routes: VexRoutes = [
  {
    path: '',
    component: MonitorsComponent,
    data: {
      toolbarShadowEnabled: true
    }
  },
  {
    path: 'create',
    component: MonitorsCreateUpdateComponent,
    data: {
      toolbarShadowEnabled: true
    }
  },
  {
    path: 'update/:id',
    component: MonitorsCreateUpdateComponent,
    data: {
      toolbarShadowEnabled: true
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MonitorsRoutingModule {
}
