import { TestBed } from '@angular/core/testing';

import { CourseAvailabilityService } from './course-availability.service';

describe('CourseAvailabilityService', () => {
  let service: CourseAvailabilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseAvailabilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
