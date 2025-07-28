import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// Interfaces
import { 
  BookingV3, 
  BookingV3KPIs, 
  BookingV3Type, 
  CourseV3,
  BookingV3Summary
} from '../interfaces/booking-v3.interfaces';

@Injectable({
  providedIn: 'root'
})
export class BookingV3Service {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/v3`;

  constructor() {
    console.log('🔧 BookingV3Service initialized with API:', this.apiUrl);
  }

  // ============= BOOKINGS CRUD =============

  getBookings(): Observable<BookingV3[]> {
    if (!environment.useRealServices) {
      return this.getMockBookings();
    }
    return this.http.get<BookingV3[]>(`${this.apiUrl}/bookings`);
  }

  getBookingById(id: string): Observable<BookingV3 | null> {
    if (!environment.useRealServices) {
      return this.getMockBookingById(id);
    }
    return this.http.get<BookingV3>(`${this.apiUrl}/bookings/${id}`);
  }

  getBookingsByClient(clientId: number): Observable<BookingV3[]> {
    if (!environment.useRealServices) {
      return this.getMockBookingsByClient(clientId);
    }
    return this.http.get<BookingV3[]>(`${this.apiUrl}/bookings/client/${clientId}`);
  }

  createBooking(bookingData: any): Observable<{ success: boolean; booking?: BookingV3; message?: string }> {
    if (!environment.useRealServices) {
      return this.createMockBooking(bookingData);
    }
    return this.http.post<{ success: boolean; booking?: BookingV3; message?: string }>(`${this.apiUrl}/bookings`, bookingData);
  }

  updateBooking(id: string, bookingData: any): Observable<{ success: boolean; booking?: BookingV3; message?: string }> {
    if (!environment.useRealServices) {
      return this.updateMockBooking(id, bookingData);
    }
    return this.http.put<{ success: boolean; booking?: BookingV3; message?: string }>(`${this.apiUrl}/bookings/${id}`, bookingData);
  }

  cancelBooking(cancellationData: any): Observable<{ success: boolean; message?: string }> {
    if (!environment.useRealServices) {
      return this.cancelMockBooking(cancellationData);
    }
    return this.http.post<{ success: boolean; message?: string }>(`${this.apiUrl}/bookings/cancel`, cancellationData);
  }

  // ============= DASHBOARD & ANALYTICS =============

  getKPIs(): Observable<BookingV3KPIs> {
    if (!environment.useRealServices) {
      return this.getMockKPIs();
    }
    return this.http.get<BookingV3KPIs>(`${this.apiUrl}/dashboard/kpis`);
  }

  // ============= BOOKING TYPES & COURSES =============

  getBookingTypes(): Observable<BookingV3Type[]> {
    if (!environment.useRealServices) {
      return this.getMockBookingTypes();
    }
    return this.http.get<BookingV3Type[]>(`${this.apiUrl}/booking-types`);
  }

  getCourses(): Observable<CourseV3[]> {
    if (!environment.useRealServices) {
      return this.getMockCourses();
    }
    return this.http.get<CourseV3[]>(`${this.apiUrl}/courses`);
  }

  // ============= MOCK DATA METHODS =============

  private getMockBookings(): Observable<BookingV3[]> {
    const mockBookings: BookingV3[] = [
      {
        id: 'BK-2024-001',
        cliente: {
          id: 1,
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan.perez@email.com',
          telefono: '+34 666 123 456',
          iniciales: 'JP',
          nivel: 'Intermedio',
          fechaRegistro: new Date('2024-01-15')
        },
        tipo: 'Cursos',
        tipoIcon: 'school',
        tipoColor: '#7c3aed',
        reserva: {
          nombre: 'Curso de Esquí Avanzado',
          descripcion: 'Curso intensivo de técnica avanzada',
          detalles: 'Grupo reducido, máximo 6 personas'
        },
        fechas: {
          inicio: new Date('2024-12-15'),
          fin: new Date('2024-12-17'),
          display: '15-17 Dic 2024'
        },
        estado: 'Confirmado',
        estadoColor: '#059669',
        precio: 180,
        moneda: 'EUR',
        fechaCreacion: new Date('2024-11-20'),
        fechaModificacion: new Date('2024-11-22')
      },
      {
        id: 'BK-2024-002',
        cliente: {
          id: 2,
          nombre: 'María',
          apellido: 'González',
          email: 'maria.gonzalez@email.com',
          telefono: '+34 666 789 012',
          iniciales: 'MG',
          nivel: 'Principiante',
          fechaRegistro: new Date('2024-02-10')
        },
        tipo: 'Actividades',
        tipoIcon: 'sports',
        tipoColor: '#2563eb',
        reserva: {
          nombre: 'Raquetas de Nieve',
          descripcion: 'Excursión con raquetas por el valle',
          detalles: 'Incluye almuerzo y guía especializado'
        },
        fechas: {
          inicio: new Date('2024-12-20'),
          display: '20 Dic 2024'
        },
        estado: 'Pendiente',
        estadoColor: '#ea580c',
        precio: 45,
        moneda: 'EUR',
        fechaCreacion: new Date('2024-11-18'),
        participantes: [
          { nombre: 'María', apellido: 'González', edad: 28, nivel: 'Principiante', equipoRequerido: true, observaciones: '' }
        ]
      },
      {
        id: 'BK-2024-003',
        cliente: {
          id: 3,
          nombre: 'Carlos',
          apellido: 'Ruiz',
          email: 'carlos.ruiz@email.com',
          telefono: '+34 666 345 678',
          iniciales: 'CR',
          nivel: 'Avanzado',
          fechaRegistro: new Date('2023-12-05')
        },
        tipo: 'Material',
        tipoIcon: 'inventory',
        tipoColor: '#059669',
        reserva: {
          nombre: 'Alquiler Equipo Completo',
          descripcion: 'Esquís, botas, bastones y casco',
          detalles: '3 días de alquiler'
        },
        fechas: {
          inicio: new Date('2024-12-22'),
          fin: new Date('2024-12-24'),
          display: '22-24 Dic 2024'
        },
        estado: 'Pagado',
        estadoColor: '#2563eb',
        precio: 75,
        moneda: 'EUR',
        fechaCreacion: new Date('2024-11-25')
      }
    ];

    console.log('📊 Mock bookings loaded:', mockBookings.length);
    return of(mockBookings);
  }

  private getMockBookingById(id: string): Observable<BookingV3 | null> {
    return new Observable(observer => {
      this.getMockBookings().subscribe(bookings => {
        const booking = bookings.find(b => b.id === id);
        observer.next(booking || null);
        observer.complete();
      });
    });
  }

  private getMockBookingsByClient(clientId: number): Observable<BookingV3[]> {
    return new Observable(observer => {
      this.getMockBookings().subscribe(bookings => {
        const clientBookings = bookings.filter(b => b.cliente.id === clientId);
        observer.next(clientBookings);
        observer.complete();
      });
    });
  }

  private getMockKPIs(): Observable<BookingV3KPIs> {
    const mockKPIs: BookingV3KPIs = {
      cursos: 25,
      actividades: 18,
      material: 12,
      confirmadas: 31,
      pagadas: 28,
      canceladas: 6
    };

    console.log('📈 Mock KPIs loaded:', mockKPIs);
    return of(mockKPIs);
  }

  private getMockBookingTypes(): Observable<BookingV3Type[]> {
    const mockTypes: BookingV3Type[] = [
      {
        id: 'cursos',
        nombre: 'Cursos',
        descripcion: 'Clases de esquí con instructor',
        icon: 'school',
        color: '#7c3aed',
        precioBase: 60,
        requiresCourse: true
      },
      {
        id: 'actividades',
        nombre: 'Actividades',
        descripcion: 'Experiencias y excursiones',
        icon: 'sports',
        color: '#2563eb',
        precioBase: 35,
        requiresCourse: false
      },
      {
        id: 'material',
        nombre: 'Material',
        descripcion: 'Alquiler de equipos',
        icon: 'inventory',
        color: '#059669',
        precioBase: 25,
        requiresCourse: false
      }
    ];

    return of(mockTypes);
  }

  private getMockCourses(): Observable<CourseV3[]> {
    const mockCourses: CourseV3[] = [
      {
        id: 1,
        nombre: 'Curso Principiante',
        descripcion: 'Primeros pasos en el esquí',
        nivel: 'Principiante',
        duracion: '2 horas',
        precio: 50,
        maxParticipantes: 8
      },
      {
        id: 2,
        nombre: 'Curso Intermedio',
        descripcion: 'Mejora tu técnica',
        nivel: 'Intermedio',
        duracion: '3 horas',
        precio: 70,
        maxParticipantes: 6
      },
      {
        id: 3,
        nombre: 'Curso Avanzado',
        descripcion: 'Técnica avanzada y fuera pista',
        nivel: 'Avanzado',
        duracion: '4 horas',
        precio: 90,
        maxParticipantes: 4
      }
    ];

    return of(mockCourses);
  }

  private createMockBooking(bookingData: any): Observable<{ success: boolean; booking?: BookingV3; message?: string }> {
    console.log('🔨 Creating mock booking:', bookingData);
    
    // Simulate API delay
    return new Observable(observer => {
      setTimeout(() => {
        const newBooking: BookingV3 = {
          id: `BK-2024-${Date.now()}`,
          cliente: bookingData.nuevoCliente || bookingData.cliente,
          tipo: bookingData.tipoReserva?.nombre || 'Cursos',
          tipoIcon: bookingData.tipoReserva?.icon || 'school',
          tipoColor: bookingData.tipoReserva?.color || '#7c3aed',
          reserva: {
            nombre: bookingData.curso?.nombre || bookingData.tipoReserva?.nombre || 'Nueva Reserva',
            descripcion: bookingData.curso?.descripcion || 'Reserva creada',
            detalles: bookingData.notas || ''
          },
          fechas: {
            inicio: bookingData.configuracion?.fechasSeleccionadas[0] || new Date(),
            display: bookingData.configuracion?.fechasSeleccionadas?.length > 1 
              ? `${bookingData.configuracion.fechasSeleccionadas.length} días`
              : new Date().toLocaleDateString()
          },
          estado: 'Pendiente',
          estadoColor: '#ea580c',
          precio: bookingData.precioTotal || 0,
          moneda: 'EUR',
          fechaCreacion: new Date(),
          participantes: bookingData.participantes || []
        };

        observer.next({ success: true, booking: newBooking });
        observer.complete();
      }, 1500);
    });
  }

  private updateMockBooking(id: string, bookingData: any): Observable<{ success: boolean; booking?: BookingV3; message?: string }> {
    console.log('🔄 Updating mock booking:', id, bookingData);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Reserva actualizada correctamente' });
        observer.complete();
      }, 1000);
    });
  }

  private cancelMockBooking(cancellationData: any): Observable<{ success: boolean; message?: string }> {
    console.log('❌ Cancelling mock booking:', cancellationData);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Reserva cancelada correctamente' });
        observer.complete();
      }, 800);
    });
  }
}