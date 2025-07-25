import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { SkiProWizardComponent } from './skipro-wizard.component';
import { SkiProMockDataService } from '../../services/mock/skipro-mock-data.service';

describe('SkiProWizardComponent', () => {
  let component: SkiProWizardComponent;
  let fixture: ComponentFixture<SkiProWizardComponent>;
  let serviceSpy: jasmine.SpyObj<SkiProMockDataService>;
  let router: Router;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('SkiProMockDataService', ['getClientesParaWizard', 'getTiposReserva', 'getCursos']);
    serviceSpy.getClientesParaWizard.and.returnValue(of([]));
    serviceSpy.getTiposReserva.and.returnValue(of([]));
    serviceSpy.getCursos.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [SkiProWizardComponent],
      providers: [{ provide: SkiProMockDataService, useValue: serviceSpy }]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SkiProWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should advance to next step', () => {
    component.wizardState.set({ paso: 1, cliente: {} as any });
    component.pasoSiguiente();
    expect(component.wizardState().paso).toBe(2);
  });

  it('should navigate on close', () => {
    spyOn(router, 'navigate');
    component.cerrarWizard();
    expect(router.navigate).toHaveBeenCalledWith(['/bookings-v3/skipro']);
  });
});
