import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TodayBookingsData, TodayBooking } from '../../interfaces/dashboard.interfaces';

@Component({
  selector: 'app-today-bookings-table',
  template: `
    <div class="bookings-table-container">
      <div class="bookings-header">
        <div class="header-left">
          <mat-icon class="header-icon">today</mat-icon>
          <div class="header-text">
            <h3 class="header-title">Reservas de Hoy</h3>
            <p class="header-subtitle">
              {{ data?.summary?.confirmed }} confirmadas, {{ data?.summary?.pending }} pendientes • {{ data?.summary?.date }}
            </p>
          </div>
        </div>
        <button mat-raised-button color="primary" class="agenda-button" (click)="openFullAgenda()">
          <mat-icon>calendar_today</mat-icon>
          Agenda Completa
        </button>
      </div>

      <div class="bookings-content" *ngIf="data?.bookings && data.bookings.length > 0; else noBookings">
        <!-- Table Header -->
        <div class="table-header">
          <div class="col-id">ID</div>
          <div class="col-type">Tipo</div>
          <div class="col-course">Curso</div>
          <div class="col-client">Cliente</div>
          <div class="col-instructor">Instructor</div>
          <div class="col-time">Hora</div>
          <div class="col-status">Estado</div>
          <div class="col-price">Precio</div>
          <div class="col-actions">Acciones</div>
        </div>

        <!-- Table Rows -->
        <div class="table-row" *ngFor="let booking of data.bookings; trackBy: trackByBooking">
          <div class="col-id">
            <span class="booking-id">{{ booking.id }}</span>
          </div>
          
          <div class="col-type">
            <span class="booking-type" [class]="getTypeClass(booking.type)">
              {{ booking.type }}
            </span>
          </div>
          
          <div class="col-course">
            <span class="course-name">{{ booking.course }}</span>
          </div>
          
          <div class="col-client">
            <div class="client-info">
              <div class="client-avatar">
                <img *ngIf="booking.client.avatar" 
                     [src]="booking.client.avatar" 
                     [alt]="booking.client.name"
                     class="avatar-img">
                <div *ngIf="!booking.client.avatar" class="avatar-initials">
                  {{ booking.client.initials }}
                </div>
              </div>
              <div class="client-details">
                <div class="client-name">{{ booking.client.name }}</div>
                <div class="client-email">{{ booking.client.email }}</div>
              </div>
            </div>
          </div>
          
          <div class="col-instructor">
            <span class="instructor-name">{{ booking.instructor }}</span>
          </div>
          
          <div class="col-time">
            <div class="time-display">
              <mat-icon class="time-icon">schedule</mat-icon>
              {{ booking.time }}
            </div>
          </div>
          
          <div class="col-status">
            <span class="status-badge" [class]="getStatusClass(booking.status)">
              <mat-icon class="status-icon">{{ getStatusIcon(booking.status) }}</mat-icon>
              {{ booking.status }}
            </span>
          </div>
          
          <div class="col-price">
            <span class="price-amount">€{{ booking.price }}</span>
          </div>
          
          <div class="col-actions">
            <button mat-icon-button class="action-button" 
                    matTooltip="Ver detalles"
                    (click)="viewBooking(booking)">
              <mat-icon>visibility</mat-icon>
            </button>
            <button mat-icon-button class="action-button" 
                    matTooltip="Más opciones"
                    [matMenuTriggerFor]="actionsMenu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #actionsMenu="matMenu">
              <button mat-menu-item (click)="editBooking(booking)">
                <mat-icon>edit</mat-icon>
                <span>Editar</span>
              </button>
              <button mat-menu-item (click)="cancelBooking(booking)">
                <mat-icon>cancel</mat-icon>
                <span>Cancelar</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <ng-template #noBookings>
        <div class="empty-state">
          <mat-icon class="empty-icon">event_available</mat-icon>
          <h4 class="empty-title">No hay reservas para hoy</h4>
          <p class="empty-subtitle">¡Perfecto! Tienes un día libre o las reservas están en otras fechas.</p>
          <button mat-raised-button color="primary" (click)="createBooking()">
            <mat-icon>add</mat-icon>
            Crear Nueva Reserva
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .bookings-table-container {
      background: white;
      border-radius: var(--boukii-radius-lg);
      box-shadow: var(--boukii-shadow);
      border: 1px solid var(--boukii-gray-200);
      transition: all 0.2s ease-in-out;
      padding: 0;
      overflow: hidden;
    }

    .bookings-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--boukii-gray-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: var(--boukii-primary);
    }

    .header-text {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .header-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      color: var(--boukii-gray-900);
    }

    .header-subtitle {
      font-size: 0.875rem;
      color: var(--boukii-gray-600);
      margin: 0;
    }

    .agenda-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: var(--boukii-radius);
    }

    .bookings-content {
      max-height: 400px;
      overflow-y: auto;
    }

    .table-header,
    .table-row {
      display: grid;
      grid-template-columns: 80px 100px 1fr 200px 120px 100px 120px 80px 80px;
      gap: 1rem;
      padding: 1rem 1.5rem;
      align-items: center;
      border-bottom: 1px solid var(--boukii-gray-100);
    }

    .table-header {
      background: var(--boukii-gray-50);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--boukii-gray-600);
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .table-row {
      transition: background-color 0.2s ease;
    }

    .table-row:hover {
      background: var(--boukii-gray-50);
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .booking-id {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--boukii-gray-700);
    }

    .booking-type {
      padding: 0.25rem 0.5rem;
      border-radius: var(--boukii-radius-sm);
      font-size: 0.75rem;
      font-weight: 500;
    }

    .booking-type.privado {
      background: rgba(139, 92, 246, 0.1);
      color: var(--boukii-primary);
    }

    .booking-type.colectivo {
      background: rgba(6, 182, 212, 0.1);
      color: var(--boukii-info);
    }

    .course-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--boukii-gray-800);
    }

    .client-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .client-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-initials {
      width: 100%;
      height: 100%;
      background: var(--boukii-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .client-details {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 0;
    }

    .client-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--boukii-gray-800);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .client-email {
      font-size: 0.75rem;
      color: var(--boukii-gray-600);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .instructor-name {
      font-size: 0.875rem;
      color: var(--boukii-gray-700);
    }

    .time-display {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.875rem;
      color: var(--boukii-gray-700);
    }

    .time-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      color: var(--boukii-gray-500);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      border-radius: var(--boukii-radius);
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.confirmado {
      background: rgba(16, 185, 129, 0.1);
      color: var(--boukii-success);
    }

    .status-badge.pendiente {
      background: rgba(245, 158, 11, 0.1);
      color: var(--boukii-warning);
    }

    .status-badge.cancelado {
      background: rgba(239, 68, 68, 0.1);
      color: var(--boukii-danger);
    }

    .status-icon {
      font-size: 0.875rem;
      width: 0.875rem;
      height: 0.875rem;
    }

    .price-amount {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--boukii-gray-800);
    }

    .action-button {
      width: 32px;
      height: 32px;
      color: var(--boukii-gray-600);
      transition: color 0.2s ease;
    }

    .action-button:hover {
      color: var(--boukii-primary);
    }

    .empty-state {
      padding: 3rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: var(--boukii-gray-400);
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--boukii-gray-700);
      margin: 0;
    }

    .empty-subtitle {
      font-size: 1rem;
      color: var(--boukii-gray-600);
      margin: 0;
      max-width: 400px;
    }

    /* Responsivo */
    @media (max-width: 1200px) {
      .table-header,
      .table-row {
        grid-template-columns: 70px 90px 1fr 180px 100px 90px 110px 70px 70px;
        gap: 0.75rem;
        padding: 1rem;
      }
    }

    @media (max-width: 768px) {
      .bookings-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .header-left {
        justify-content: center;
        text-align: center;
      }

      .agenda-button {
        align-self: center;
      }

      .table-header,
      .table-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
        padding: 1rem;
      }

      .table-header {
        display: none;
      }

      .table-row {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        border: 1px solid var(--boukii-gray-200);
        border-radius: var(--boukii-radius);
        margin: 0.5rem;
      }

      .col-id,
      .col-type,
      .col-course,
      .col-client,
      .col-instructor,
      .col-time,
      .col-status,
      .col-price,
      .col-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .col-id::before { content: "ID: "; }
      .col-type::before { content: "Tipo: "; }
      .col-course::before { content: "Curso: "; }
      .col-instructor::before { content: "Instructor: "; }
      .col-time::before { content: "Hora: "; }
      .col-status::before { content: "Estado: "; }
      .col-price::before { content: "Precio: "; }

      .col-id::before,
      .col-type::before,
      .col-course::before,
      .col-instructor::before,
      .col-time::before,
      .col-status::before,
      .col-price::before {
        font-weight: 600;
        color: var(--boukii-gray-700);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .col-client {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
      }

      .col-actions {
        justify-content: center;
        padding-top: 0.5rem;
        border-top: 1px solid var(--boukii-gray-200);
      }
    }
  `]
})
export class TodayBookingsTableComponent {
  @Input() data?: TodayBookingsData;
  @Output() bookingView = new EventEmitter<TodayBooking>();
  @Output() bookingEdit = new EventEmitter<TodayBooking>();
  @Output() bookingCancel = new EventEmitter<TodayBooking>();
  @Output() bookingCreate = new EventEmitter<void>();
  @Output() fullAgendaOpen = new EventEmitter<void>();

  trackByBooking(index: number, booking: TodayBooking): string {
    return booking.id;
  }

  getTypeClass(type: string): string {
    return type.toLowerCase();
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmado':
        return 'check_circle';
      case 'pendiente':
        return 'schedule';
      case 'cancelado':
        return 'cancel';
      default:
        return 'help';
    }
  }

  viewBooking(booking: TodayBooking): void {
    this.bookingView.emit(booking);
  }

  editBooking(booking: TodayBooking): void {
    this.bookingEdit.emit(booking);
  }

  cancelBooking(booking: TodayBooking): void {
    this.bookingCancel.emit(booking);
  }

  createBooking(): void {
    this.bookingCreate.emit();
  }

  openFullAgenda(): void {
    this.fullAgendaOpen.emit();
  }
}