import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LangService } from '../../../../../../service/langService';
import { UtilsService } from '../../../../../../service/utils.service';

import { MatDialog } from '@angular/material/dialog';
import { AddReductionModalComponent } from '../add-reduction/add-reduction.component';
import {
  AddDiscountBonusModalComponent
} from '../../../bookings-create-update/add-discount-bonus/add-discount-bonus.component';

export interface BookingCreateData {
  school_id: number;
  client_main_id: number;
  user_id: number;
  price_total: number;
  has_cancellation_insurance: boolean;
  has_boukii_care: boolean;
  has_reduction: boolean;
  has_tva: boolean;
  price_cancellation_insurance: number;
  price_reduction: number;
  price_boukii_care: number;
  price_tva: number;
  source: 'admin';
  payment_method_id: number | null;
  paid_total: number;
  paid: boolean;
  notes: string;
  notes_school: string;
  paxes: number;
  status: number;
  color: string;
}

@Component({
  selector: 'booking-reservation-detail',
  templateUrl: './booking-reservation-detail.component.html',
  styleUrls: ['./booking-reservation-detail.component.scss']
})
export class BookingReservationDetailComponent implements OnInit {
  @Input() client: any;
  @Input() activities: any;
  @Output() endClick = new EventEmitter()
  @Output() addClick = new EventEmitter()
  bookingData: BookingCreateData = {
    school_id: 0,
    client_main_id: 0,
    user_id: 0,
    price_total: 0,
    has_cancellation_insurance: false,
    has_boukii_care: false,
    has_reduction: false,
    has_tva: false,
    price_cancellation_insurance: 0,
    price_reduction: 0,
    price_boukii_care: 0,
    price_tva: 0,
    source: 'admin',
    payment_method_id: null,
    paid_total: 0,
    paid: false,
    notes: '',
    notes_school: '',
    paxes: 0,
    status: 0,
    color: ''
  };
  cancellationInsurancePercent: number = 0;
  price_tva: number = 0;
  price_boukii_care: number = 0;
  vouchers: any[] = [];
  reduction: any = null;
  school: any;
  settings: any;

  constructor(
    protected langService: LangService,
    protected utilsService: UtilsService,
    private dialog: MatDialog
  ) {
    this.school = this.utilsService.getSchoolData();
    this.settings = JSON.parse(this.school.settings);
    this.cancellationInsurancePercent = parseFloat(this.settings?.taxes?.cancellation_insurance_percent);
    this.price_boukii_care = parseInt(this.settings?.taxes?.boukii_care_price);
    this.price_tva = parseFloat(this.settings?.taxes?.tva);
  }

  ngOnInit(): void {
    this.bookingData.price_total = this.sumActivityTotal();
  }

  protected readonly parseFloat = parseFloat;

  sumActivityTotal(): number {
    return this.activities.reduce((acc, item) => {
      const numericValue = parseFloat(item.total.replace(/[^\d.-]/g, '')); // Eliminar cualquier cosa que no sea un número o signo
      return acc + numericValue;
    }, 0);
  }


  calculateRem(event: any) {
    if (event.source.checked) {
      this.bookingData.price_cancellation_insurance = this.sumActivityTotal() * this.cancellationInsurancePercent;
      this.bookingData.has_cancellation_insurance = event.source.checked;
      this.bookingData.price_total = this.calculateTotal();

    } else {
      this.bookingData.price_cancellation_insurance = 0;
      this.bookingData.has_cancellation_insurance = event.source.checked;
      this.bookingData.price_total = this.calculateTotal();
      return 0;
    }
  }

  recalculateTva() {
    // Calculamos la base imponible sumando los componentes relevantes
    const basePrice = this.sumActivityTotal()
      + this.bookingData.price_cancellation_insurance
      - this.bookingData.price_reduction
      + this.bookingData.price_boukii_care;

    // Calculamos el TVA como un porcentaje de la base imponible
    this.bookingData.price_tva = basePrice * this.price_tva;
  }

  calculateTotal() {
    this.recalculateTva();
    return this.sumActivityTotal() + this.bookingData.price_cancellation_insurance
      - this.bookingData.price_reduction + this.bookingData.price_boukii_care + this.bookingData.price_tva;
  }

  addBonus() {
    const dialogRef = this.dialog.open(AddDiscountBonusModalComponent, {
      width: '600px',
      data: {
        client_id: this.client.id,
        school_id: this.school.id,
        currentPrice: this.sumActivityTotal(),
        appliedBonus: this.vouchers,
        currency: this.activities[0].course.currency
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.vouchers.push(result);
      }
    });
  }

  addReduction() {
    const dialogRef = this.dialog.open(AddReductionModalComponent, {
      width: '300px',
      data: {
        currentPrice: this.sumActivityTotal()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reduction = result;
        this.reduction.appliedPrice = this.calculateReduction();
        this.bookingData.price_reduction = this.reduction.appliedPrice;
      }
    });
  }


  deleteBonus(index: number) {
    this.vouchers.splice(index, 1);
  }

  private calculateReduction() {
    if (this.reduction.type === 1) {
      return (this.sumActivityTotal() * this.reduction.discount) / 100;
    } else {
      return this.reduction.discount > this.sumActivityTotal() ? this.sumActivityTotal() : this.reduction.discount;
    }
  }

  protected readonly isNaN = isNaN;

}
