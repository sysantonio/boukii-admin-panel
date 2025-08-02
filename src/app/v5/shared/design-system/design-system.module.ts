import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

// Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';

// Design System Components
import { BoukiiButtonComponent } from './components/button/button.component';
import { BoukiiCardComponent } from './components/card/card.component';
import { BoukiiLayoutBaseComponent } from './layout/layout-base.component';
import {MatSelectModule} from '@angular/material/select';

@NgModule({
  declarations: [
    BoukiiButtonComponent,
    BoukiiCardComponent,
    BoukiiLayoutBaseComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSelectModule
  ],
  exports: [
    BoukiiButtonComponent,
    BoukiiCardComponent,
    BoukiiLayoutBaseComponent
  ]
})
export class DesignSystemModule { }
