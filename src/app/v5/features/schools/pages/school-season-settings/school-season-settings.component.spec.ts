import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SchoolSeasonSettingsComponent } from './school-season-settings.component';

describe('SchoolSeasonSettingsComponent', () => {
  let component: SchoolSeasonSettingsComponent;
  let fixture: ComponentFixture<SchoolSeasonSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchoolSeasonSettingsComponent]
    });
    fixture = TestBed.createComponent(SchoolSeasonSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
