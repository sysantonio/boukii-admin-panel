import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBookingProcessComponent } from './create-booking-process.component';

describe('CreateBookingProcessComponent', () => {
  let component: CreateBookingProcessComponent;
  let fixture: ComponentFixture<CreateBookingProcessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateBookingProcessComponent]
    });
    fixture = TestBed.createComponent(CreateBookingProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
