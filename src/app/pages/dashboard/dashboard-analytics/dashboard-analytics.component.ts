import { Component } from '@angular/core';
import { TableColumn } from 'src/@vex/interfaces/table-column.interface';
import { defaultChartOptions } from 'src/@vex/utils/default-chart-options';
import { tableSalesData } from 'src/app/static-data/table-sales-data';
import { BookingsCreateUpdateComponent } from '../../bookings/bookings-create-update/bookings-create-update.component';

@Component({
  selector: 'vex-dashboard-analytics',
  templateUrl: './dashboard-analytics.component.html',
  styleUrls: ['./dashboard-analytics.component.scss']
})
export class DashboardAnalyticsComponent {

  entity = '/bookings';
  createComponent = BookingsCreateUpdateComponent;
  deleteEntity = '/bookings';
  columns: TableColumn<any>[] = [
    { label: 'Id', property: 'id', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'Type', property: 'type', type: 'booking_users_image', visible: true },
    { label: 'Course', property: 'bookingusers', type: 'booking_users', visible: true},
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

  /*tableColumns: TableColumn<any>[] = [
    {
      label: '',
      property: 'status',
      type: 'badge'
    },
    {
      label: 'PRODUCT',
      property: 'name',
      type: 'text'
    },
    {
      label: '$ PRICE',
      property: 'price',
      type: 'text',
      cssClasses: ['font-medium']
    },
    {
      label: 'DATE',
      property: 'timestamp',
      type: 'text',
      cssClasses: ['text-secondary']
    }
  ];
  tableData = tableSalesData;

  series: ApexAxisChartSeries = [{
    name: 'Subscribers',
    data: [28, 40, 36, 0, 52, 38, 60, 55, 67, 33, 89, 44]
  }];

  userSessionsSeries: ApexAxisChartSeries = [
    {
      name: 'Users',
      data: [10, 50, 26, 50, 38, 60, 50, 25, 61, 80, 40, 60]
    },
    {
      name: 'Sessions',
      data: [5, 21, 42, 70, 41, 20, 35, 50, 10, 15, 30, 50]
    },
  ];

  salesSeries: ApexAxisChartSeries = [{
    name: 'Sales',
    data: [28, 40, 36, 0, 52, 38, 60, 55, 99, 54, 38, 87]
  }];

  pageViewsSeries: ApexAxisChartSeries = [{
    name: 'Page Views',
    data: [405, 800, 200, 600, 105, 788, 600, 204]
  }];

  uniqueUsersSeries: ApexAxisChartSeries = [{
    name: 'Unique Users',
    data: [356, 806, 600, 754, 432, 854, 555, 1004]
  }];

  uniqueUsersOptions = defaultChartOptions({
    chart: {
      type: 'area',
      height: 100
    },
    colors: ['#ff9800']
  });*/
}
