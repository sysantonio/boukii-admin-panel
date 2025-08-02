import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  readonly notifications$ = this.notificationsSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration = 3000): void {
    this.show('success', message, duration);
  }

  error(message: string, duration = 5000): void {
    this.show('error', message, duration);
  }

  info(message: string, duration = 3000): void {
    this.show('info', message, duration);
  }

  warning(message: string, duration = 4000): void {
    this.show('warning', message, duration);
  }

  // Alias methods for consistency with component usage
  showSuccess(message: string): void {
    this.success(message);
  }

  showError(message: string, duration?: number): void {
    this.error(message, duration);
  }

  showWarning(message: string): void {
    this.warning(message);
  }

  showInfo(message: string): void {
    this.info(message);
  }

  private show(type: Notification['type'], message: string, duration: number) {
    const list = this.notificationsSubject.value;
    this.notificationsSubject.next([...list, { type, message }]);
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: [`snackbar-${type}`],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
