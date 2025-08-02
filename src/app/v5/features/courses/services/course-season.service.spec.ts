import { TestBed } from '@angular/core/testing';

import { CourseSeasonService } from './course-season.service';

describe('CourseSeasonService', () => {
  let service: CourseSeasonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseSeasonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
