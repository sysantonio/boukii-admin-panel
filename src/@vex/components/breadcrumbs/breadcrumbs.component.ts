import { Component, Input, OnInit } from '@angular/core';
import { trackByValue } from '../../utils/track-by';

@Component({
  selector: 'vex-breadcrumbs',
  template: `
    <div class="flex items-center">
      <vex-breadcrumb>
        <a [routerLink]="['/']">
          <mat-icon svgIcon="mat:home" class="icon-sm"></mat-icon>
        </a>
      </vex-breadcrumb>
      <ng-container *ngFor="let crumb of crumbs; trackBy: trackByValue">
        <div class="w-1 h-1 bg-gray rounded-full ltr:mr-2 rtl:ml-2"></div>
        <vex-breadcrumb>
          <a [routerLink]="[]">
          <span *ngIf="crumb.text !== ''">
            {{ crumb.text | translate }}
          </span>
          <mat-icon *ngIf="crumb.icon !== ''" svgIcon="logo:{{crumb.icon}}" class="icon-sm"></mat-icon></a>
        </vex-breadcrumb>
      </ng-container>
    </div>
  `
})
export class BreadcrumbsComponent implements OnInit {

  @Input() crumbs: any[] = [];

  trackByValue = trackByValue;

  constructor() {
  }

  ngOnInit() {
  }
}
