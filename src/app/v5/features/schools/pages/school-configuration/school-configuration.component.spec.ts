import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SchoolConfigurationComponent } from './school-configuration.component';

describe('SchoolConfigurationComponent', () => {
  let component: SchoolConfigurationComponent;
  let fixture: ComponentFixture<SchoolConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchoolConfigurationComponent]
    });
    fixture = TestBed.createComponent(SchoolConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
