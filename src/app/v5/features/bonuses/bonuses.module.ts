import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BonusesComponent } from './bonuses.component';

@NgModule({
  declarations: [BonusesComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: BonusesComponent }])
  ]
})
export class BonusesModule { }