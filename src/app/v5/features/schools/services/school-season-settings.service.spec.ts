import { TestBed } from '@angular/core/testing';
import { SchoolSeasonSettingsService } from './school-season-settings.service';

describe('SchoolSeasonSettingsService', () => {
  let service: SchoolSeasonSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SchoolSeasonSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
