import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

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
  selectedPaymentOption: string | null;
  paid_total: number;
  paid: boolean;
  notes: string;
  notes_school: string;
  paxes: number;
  status: number;
  color: string;
  vouchers: any[];
  reduction: any;
  basket: any[] | null;
  cart: any[] | null;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private bookingDataSubject = new BehaviorSubject<BookingCreateData | null>(null);
  public editData;
  constructor() {}

  setBookingData(data: BookingCreateData) {
    this.bookingDataSubject.next(data);
  }

  getBookingData(): BookingCreateData | null {
    return this.bookingDataSubject.value;
  }

  calculatePendingPrice(): number {
    const totalVouchers =  this.getBookingData().vouchers.reduce((acc, item) => acc + item.bonus.reducePrice, 0);
    const total =  this.getBookingData().price_total - totalVouchers;

    return total > 0 ? total : 0; // Si el precio total es negativo o cero, devolver 0.
  }


  updateBookingData(partialData: Partial<BookingCreateData>) {
    const currentData = this.getBookingData();
    if (currentData) {
      const updatedData = { ...currentData, ...partialData };
      this.setBookingData(updatedData);
    }
  }

  setCart(normalizedDates, bookingData: BookingCreateData) {
    let cart = [];
    let group_id = 0;
    normalizedDates.forEach(item => {
      group_id++;
      // Inicializar variables para el cálculo del precio
      let totalExtrasPrice = 0;
      item.utilizers.forEach(utilizer => {
        item.dates.forEach(date => {
          let bookingUser: any = {};
          bookingUser.client_id = utilizer.id;
          bookingUser.group_id = group_id;

          // Obtener los valores desde bookingData
          let reduction = bookingData.price_reduction || 0;
          let cancellationInsurance = bookingData.price_cancellation_insurance || 0;
          let boukiiCare =bookingData.price_boukii_care || 0;
          let tva = bookingData.price_tva || 0;

          // Calcular el valor total de los vouchers
          let totalVoucherDiscount = 0;
          if (bookingData.vouchers && bookingData.vouchers.length > 0) {
            bookingData.vouchers.forEach(voucher => {
              if (voucher.bonus && voucher.bonus.reducePrice) {
                totalVoucherDiscount += parseFloat(voucher.bonus.reducePrice || 0); // Asumimos que 'reducePrice' contiene el monto del descuento
              }
            });
          }

          let extras = [];

          // Recolectar los extras y calcular su precio total
          if (item.course.course_type == 2) {
            date.utilizers.find(u => u.first_name == utilizer.first_name && u.last_name == utilizer.last_name)
              .extras.forEach(extra => {
              let extraPrice = parseFloat(extra.price);
              totalExtrasPrice += extraPrice;
              extras.push({
                course_extra_id: extra.id,
                name: extra.name,
                quantity: extra.quantity,
                price: extraPrice
              });
            });
          } else {
            date.extras.forEach(extra => {
              let extraPrice = parseFloat(extra.price);
              totalExtrasPrice += extraPrice;
              extras.push({
                course_extra_id: extra.id,
                name: extra.name,
                quantity: extra.quantity,
                price: extraPrice
              });
            });
          }

          // Asignar valores al objeto de usuario de la reserva
          bookingUser.price_base = parseFloat(item.totalSinExtras); // Precio base calculado
          bookingUser.extra_price = parseFloat(item.extrasTotal); // Precio base calculado
          bookingUser.price = parseFloat(item.total.replace(/[^\d.-]/g, '')); // Precio total (base + extras)
          bookingUser.currency = item.course.currency;
          bookingUser.course_id = item.course.id;
          bookingUser.course_name = item.course.name;
          bookingUser.notes_school = bookingData.notes_school;
          bookingUser.notes = bookingData.notes;
          bookingUser.course_type = item.course.course_type;
          bookingUser.currency = item.course.currency;
          bookingUser.degree_id = item.sportLevel.id;
          bookingUser.course_date_id = item.course.course_dates.find(d =>
            moment(d.date).format('YYYY-MM-DD') == moment(date.date).format('YYYY-MM-DD')).id;
          bookingUser.hour_start = date.startHour;
          bookingUser.hour_end = date.endHour;

          // Asignar los extras al usuario de la reserva
          bookingUser.extras = extras;

          // Añadir el usuario con la reserva completa al carrito
          cart.push(bookingUser);
        });
      });

    });

    return cart;
  }
  resetBookingData() {
    this.bookingDataSubject.next({
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
      selectedPaymentOption: '',
      paxes: 0,
      status: 0,
      color: '',
      vouchers: [],  // Reset de vouchers
      reduction: null,  // Reset de reduction
      basket: null,  // Reset de reduction
      cart:  null
    });
  }
}
