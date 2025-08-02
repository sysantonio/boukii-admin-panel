import { TestBed } from '@angular/core/testing';

import { CoursePricingService } from './course-pricing.service';

describe('CoursePricingService', () => {
  let service: CoursePricingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoursePricingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
