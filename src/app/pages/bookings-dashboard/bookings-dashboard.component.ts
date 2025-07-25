import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from 'src/service/bookings.service';

@Component({
  selector: 'vex-bookings-dashboard',
  templateUrl: './bookings-dashboard.component.html',
  styleUrls: ['./bookings-dashboard.component.scss']
})
export class BookingsDashboardComponent implements OnInit {
  filters: FormGroup;
  kpis: any = {};
  bookings: any[] = [];
  displayedColumns = ['id', 'client', 'type', 'dates', 'status', 'price', 'actions'];

  constructor(private fb: FormBuilder, private bookingService: BookingService, private router: Router) {
    this.filters = this.fb.group({
      type: [''],
      status: [''],
      start: [null],
      end: [null]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const f = this.filters.value;
    const params: any = {};
    if (f.type) params.type = f.type;
    if (f.status) params.status = f.status;
    if (f.start) params.start_date = f.start;
    if (f.end) params.end_date = f.end;

    this.bookingService.getBookingsKpis(params).subscribe(res => {
      this.kpis = res.data || res;
    });

    this.bookingService.listBookings(params).subscribe(res => {
      this.bookings = res.data || [];
    });
  }

  applyFilters() {
    this.loadData();
  }

  goDetail(row: any) {
    this.router.navigate(['/bookings/update', row.id]);
  }

  edit(row: any) {
    this.router.navigate(['/bookings/edit', row.id]);
  }

  cancel(row: any) {
    // Placeholder for cancellation logic
  }

  openClient(row: any) {
    this.router.navigate(['/clients/update', row.client_main_id]);
  }
}
