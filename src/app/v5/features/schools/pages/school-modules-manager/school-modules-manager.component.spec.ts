import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SchoolModulesManagerComponent } from './school-modules-manager.component';

describe('SchoolModulesManagerComponent', () => {
  let component: SchoolModulesManagerComponent;
  let fixture: ComponentFixture<SchoolModulesManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchoolModulesManagerComponent]
    });
    fixture = TestBed.createComponent(SchoolModulesManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
