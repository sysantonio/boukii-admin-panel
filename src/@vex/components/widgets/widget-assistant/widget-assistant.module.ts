import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetAssistantComponent } from './widget-assistant.component';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [WidgetAssistantComponent],
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule
  ],
  exports: [WidgetAssistantComponent]
})
export class WidgetAssistantModule {
}
