import {Component, Input} from '@angular/core';
import {LangService} from '../../../../../../service/langService';
import {UtilsService} from '../../../../../../service/utils.service';

@Component({
  selector: 'booking-reservation-detail',
  templateUrl: './booking-reservation-detail.component.html',
  styleUrls: ['./booking-reservation-detail.component.scss']
})
export class BookingReservationDetailComponent {
  @Input() client: any;

  constructor(
    protected langService: LangService,
    protected utilsService: UtilsService
  ) {}

}
