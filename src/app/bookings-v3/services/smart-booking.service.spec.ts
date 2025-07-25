import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SmartBookingService } from './smart-booking.service';
import { environment } from '../../../environments/environment';

describe('SmartBookingService', () => {
  let service: SmartBookingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SmartBookingService]
    });
    service = TestBed.inject(SmartBookingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should POST to smart-create when creating booking', fakeAsync(() => {
    const mock = { client: { id: 1 } };
    let result: any;
    service.createBooking(mock as any).then(res => (result = res));

    const req = http.expectOne(`${environment.baseUrl}/v2/bookings/smart-create`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: { id: 10 } });
    tick();

    expect(result.success).toBeTrue();
    expect(result.data.id).toBe(10);
  }));

  it('should POST to cancel endpoint', fakeAsync(() => {
    service.cancelBooking('5', 'test');
    const req = http.expectOne(`${environment.baseUrl}/v2/bookings/5/cancel`);
    expect(req.request.method).toBe('POST');
    req.flush({});
    tick();
  }));
});
