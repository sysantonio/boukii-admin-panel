import { Component } from '@angular/core';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { BookingsCreateUpdateComponent } from './bookings-create-update/bookings-create-update.component';

@Component({
  selector: 'vex-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent {
  showDetail: boolean = false;
  detailData: any;
  imageAvatar = 'https://school.boukii.online/assets/icons/icons-outline-default-avatar.svg';

  createComponent = BookingsCreateUpdateComponent;
  entity = '/bookings';
  columns: TableColumn<any>[] = [
    { label: 'Id', property: 'id', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Type', property: 'type', type: 'booking_users_image', visible: true },
    { label: 'Course', property: 'bookingusers', type: 'booking_users', visible: true},
    { label: 'Dates', property: 'dates', type: 'booking_dates', visible: true },
    { label: 'Client', property: 'client_main_id', type: 'client', visible: true },
    { label: 'Enregistrée', property: 'created_at', type: 'date', visible: true },
    { label: 'Options', property: 'options', type: 'text', visible: true },
    { label: 'Bons', property: 'bonus', type: 'light', visible: true },
    { label: 'OP. Rem', property: 'has_cancellation_insurance', type: 'light', visible: true },
    { label: 'B. Care', property: 'has_boukii_care', type: 'light', visible: true },
    { label: 'Prix', property: 'price_total', type: 'price', visible: true },
    { label: 'M. Paiment', property: 'payment_method', type: 'text', visible: true },
    { label: 'Status', property: 'paid', type: 'payment_status', visible: true },
    { label: 'Status 2', property: 'cancelation', type: 'cancelation_status', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  constructor() {

  }

  showDetailEvent(event: any) {
    this.showDetail = event.showDetail;
    this.detailData = event.item;
  }
}
