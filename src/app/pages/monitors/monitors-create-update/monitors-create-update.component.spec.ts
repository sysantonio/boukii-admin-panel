import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorsCreateUpdateComponent } from './monitors-create-update.component';

describe('MonitorsCreateUpdateComponent', () => {
  let component: MonitorsCreateUpdateComponent;
  let fixture: ComponentFixture<MonitorsCreateUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonitorsCreateUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitorsCreateUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
