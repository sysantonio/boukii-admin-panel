import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SchoolInfoCardComponent } from './school-info-card.component';

describe('SchoolInfoCardComponent', () => {
  let component: SchoolInfoCardComponent;
  let fixture: ComponentFixture<SchoolInfoCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchoolInfoCardComponent]
    });
    fixture = TestBed.createComponent(SchoolInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
