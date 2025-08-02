import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PlannerComponent } from './planner.component';

@NgModule({
  declarations: [
    PlannerComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild([
      {
        path: '',
        component: PlannerComponent,
        data: {
          title: 'Planificador',
          breadcrumb: 'Planificador'
        }
      }
    ])
  ]
})
export class PlannerModule { }