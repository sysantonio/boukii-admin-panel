import { Component, Input } from '@angular/core';

export type NotificationType = 'info' | 'warning' | 'error' | 'success';
export type NotificationSize = 'sm' | 'md';

@Component({
  selector: 'app-notification-badge',
  template: `
    <div 
      class="notification-badge"
      [class]="getBadgeClasses()"
      [title]="tooltip"
      *ngIf="count > 0"
    >
      {{ displayCount }}
    </div>
  `,
  styleUrls: ['./notification-badge.component.scss']
})
export class NotificationBadgeComponent {
  @Input() count: number = 0;
  @Input() type: NotificationType = 'info';
  @Input() size: NotificationSize = 'md';
  @Input() tooltip?: string;
  @Input() className?: string;

  get displayCount(): string {
    return this.count > 99 ? '99+' : this.count.toString();
  }

  getBadgeClasses(): string {
    const classes = [
      'notification-badge',
      `badge-${this.type}`,
      `badge-${this.size}`,
      this.className || ''
    ];
    
    return classes.filter(c => c).join(' ');
  }
}