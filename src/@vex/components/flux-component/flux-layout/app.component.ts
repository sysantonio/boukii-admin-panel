import { Component, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'vex-flux-layout',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class FluxLayoutComponent {
  @ContentChild(TemplateRef) contentTemplate: TemplateRef<any>;
  ShowCard: boolean = false
}

