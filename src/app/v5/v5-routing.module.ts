import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { V5LayoutComponent } from './layout/v5-layout.component';
import { WelcomeComponent } from './components/welcome/welcome.component';

const routes: Routes = [
  {
    path: '',
    component: V5LayoutComponent,
    children: [
      { path: '', component: WelcomeComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class V5RoutingModule {}
