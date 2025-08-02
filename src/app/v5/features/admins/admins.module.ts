import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AdminsComponent } from './admins.component';

@NgModule({
  declarations: [AdminsComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: AdminsComponent }])
  ]
})
export class AdminsModule { }