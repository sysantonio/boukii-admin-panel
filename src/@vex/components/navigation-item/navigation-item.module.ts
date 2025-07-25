import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationItemComponent } from './navigation-item.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [NavigationItemComponent],
  imports: [
    CommonModule,
    MatMenuModule,
    TranslateModule,
    MatIconModule,
    RouterModule,
    MatRippleModule
  ],
  exports: [NavigationItemComponent]
})
export class NavigationItemModule {
}
