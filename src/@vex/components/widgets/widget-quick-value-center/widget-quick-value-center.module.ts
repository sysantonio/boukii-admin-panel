import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetQuickValueCenterComponent } from './widget-quick-value-center.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { ShareBottomSheetModule } from '../../share-bottom-sheet/share-bottom-sheet.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [WidgetQuickValueCenterComponent],
  imports: [
    CommonModule,
    MatIconModule,
    TranslateModule,
    MatTooltipModule,
    MatButtonModule,
    ShareBottomSheetModule
  ],
  exports: [WidgetQuickValueCenterComponent]
})
export class WidgetQuickValueCenterModule {
}

