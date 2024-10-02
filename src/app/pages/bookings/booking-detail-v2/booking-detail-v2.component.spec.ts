import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingDetailV2Component } from './booking-detail-v2.component';

describe('BookingDetailV2Component', () => {
  let component: BookingDetailV2Component;
  let fixture: ComponentFixture<BookingDetailV2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BookingDetailV2Component]
    });
    fixture = TestBed.createComponent(BookingDetailV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
