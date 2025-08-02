import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommunicationsComponent } from './communications.component';

@NgModule({
  declarations: [CommunicationsComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: CommunicationsComponent }])
  ]
})
export class CommunicationsModule { }