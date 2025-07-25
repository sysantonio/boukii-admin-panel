import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { SkiProReservasListComponent } from './skipro-reservas-list.component';
import { SkiProMockDataService } from '../../services/mock/skipro-mock-data.service';

describe('SkiProReservasListComponent', () => {
  let component: SkiProReservasListComponent;
  let fixture: ComponentFixture<SkiProReservasListComponent>;
  let serviceSpy: jasmine.SpyObj<SkiProMockDataService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('SkiProMockDataService', ['getReservas', 'getKPIs', 'getReservasFiltradas']);
    serviceSpy.getReservas.and.returnValue(of([]));
    serviceSpy.getKPIs.and.returnValue(of({ cursos: 0, actividades: 0, material: 0, confirmadas: 0, pagadas: 0, canceladas: 0 }));
    serviceSpy.getReservasFiltradas.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [SkiProReservasListComponent],
      providers: [{ provide: SkiProMockDataService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(SkiProReservasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter reservas', fakeAsync(() => {
    const mockReserva = {
      id: '1',
      cliente: { nombre: 'A', apellido: 'B', email: 'a@b.com', telefono: '', iniciales: 'AB' },
      tipo: 'Curso',
      tipoIcon: '🎓',
      tipoColor: '#fff',
      reserva: { nombre: 'Curso', descripcion: '', detalles: '' },
      fechas: { inicio: new Date(), display: '' },
      estado: 'Confirmado',
      estadoColor: '#fff',
      precio: 0,
      moneda: '€'
    } as any;

    serviceSpy.getReservasFiltradas.and.returnValue(of([mockReserva]));

    component.aplicarFiltro('Cursos');
    tick();

    expect(serviceSpy.getReservasFiltradas).toHaveBeenCalledWith('Cursos');
    expect(component.reservasFiltradas().length).toBe(1);
  }));
});
