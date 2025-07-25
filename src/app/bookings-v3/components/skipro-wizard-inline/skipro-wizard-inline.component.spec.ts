import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SkiProWizardInlineComponent } from './skipro-wizard-inline.component';
import { SkiProMockDataService } from '../../services/mock/skipro-mock-data.service';
import { MockDataService } from '../../services/mock/mock-data.service';

describe('SkiProWizardInlineComponent', () => {
  let component: SkiProWizardInlineComponent;
  let fixture: ComponentFixture<SkiProWizardInlineComponent>;
  let skiproSpy: jasmine.SpyObj<SkiProMockDataService>;
  let mockSpy: jasmine.SpyObj<MockDataService>;

  beforeEach(async () => {
    skiproSpy = jasmine.createSpyObj('SkiProMockDataService', ['getClientesParaWizard', 'getTiposReserva', 'getCursos', 'crearReserva']);
    mockSpy = jasmine.createSpyObj('MockDataService', ['getOptimalSlots', 'getMockWeatherInfo', 'getAvailableCourses', 'calculateDynamicPricing']);

    skiproSpy.getClientesParaWizard.and.returnValue(of([]));
    skiproSpy.getTiposReserva.and.returnValue(of([]));
    skiproSpy.getCursos.and.returnValue(of([]));
    skiproSpy.crearReserva.and.returnValue(of({ success: true, reserva: { id: 'RES' } } as any));

    mockSpy.getOptimalSlots.and.returnValue(of([]));
    mockSpy.getMockWeatherInfo.and.returnValue({} as any);
    mockSpy.getAvailableCourses.and.returnValue(of([]));
    mockSpy.calculateDynamicPricing.and.returnValue(of({ finalPrice: 0 }));

    await TestBed.configureTestingModule({
      declarations: [SkiProWizardInlineComponent],
      providers: [
        { provide: SkiProMockDataService, useValue: skiproSpy },
        { provide: MockDataService, useValue: mockSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SkiProWizardInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close event', () => {
    spyOn(component.cerrar, 'emit');
    component.cerrarWizard();
    expect(component.cerrar.emit).toHaveBeenCalled();
  });

  it('should emit reservaCreada on confirm', async () => {
    spyOn(component.reservaCreada, 'emit');
    component.wizardState.set({
      paso: 4,
      cliente: { id: 1, nombre: 'A', apellido: 'B', iniciales: 'AB', email: 'a', telefono: '', nivel: 'Intermedio', fechaRegistro: new Date(), totalReservas: 0, cursosCompletados: 0, gastoTotal: 0, reservasActivas: [], historial: [], preferencias: [] },
      tipoReserva: { id: 't', nombre: 'T', descripcion: '', icon: '', color: '' },
      cursoSeleccionado: { id: 1, nombre: 'C', descripcion: '', duracion: '', nivel: 'Intermedio', precio: 0, detalles: [] }
    } as any);
    await component.confirmarReserva();
    expect(component.reservaCreada.emit).toHaveBeenCalled();
  });
});
