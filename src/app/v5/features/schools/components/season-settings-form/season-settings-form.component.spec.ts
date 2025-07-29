import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeasonSettingsFormComponent } from './season-settings-form.component';

describe('SeasonSettingsFormComponent', () => {
  let component: SeasonSettingsFormComponent;
  let fixture: ComponentFixture<SeasonSettingsFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SeasonSettingsFormComponent]
    });
    fixture = TestBed.createComponent(SeasonSettingsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
