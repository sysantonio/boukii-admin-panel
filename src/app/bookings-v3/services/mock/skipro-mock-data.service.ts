import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { 
  SkiProBooking, 
  SkiProKPIs, 
  SkiProCliente, 
  SkiProTipoReserva, 
  SkiProCurso,
  SkiProFiltroTipo,
  SkiProReservaActiva,
  SkiProHistorialReserva
} from '../../interfaces/skipro.interfaces';

@Injectable({
  providedIn: 'root'
})
export class SkiProMockDataService {

  // ============= CLIENTES MOCK (basados en las imágenes) =============
  getMockClientes(): SkiProCliente[] {
    return [
      {
        id: 1,
        nombre: 'Maria',
        apellido: 'González',
        iniciales: 'MG',
        email: 'maria@email.com',
        telefono: '+34 666 123 456',
        avatar: '/assets/img/avatars/maria.jpg',
        nivel: 'Intermedio',
        fechaRegistro: new Date('2023-12-01'),
        totalReservas: 12,
        cursosCompletados: 8,
        gastoTotal: 1450,
        reservasActivas: [
          {
            id: 'RES001',
            tipo: 'Curso',
            nombre: 'Curso Principiante',
            descripcion: 'Nivel principiante • 5 días • Pista verde',
            estado: 'Confirmado',
            fechas: '25 ene - 29 ene',
            precio: 285
          }
        ],
        historial: [
          {
            id: 'RES_H001',
            tipo: 'Material',
            nombre: 'Pack Esquí Básico',
            descripcion: 'Esquís + Botas + Bastones',
            fechas: '25 ene - 29 ene',
            precio: 60,
            estado: 'Completado'
          }
        ],
        preferencias: ['Esquí alpino', 'Pistas rojas', 'Clases matutinas']
      },
      {
        id: 2,
        nombre: 'Carlos',
        apellido: 'Ruiz',
        iniciales: 'CR',
        email: 'carlos@email.com',
        telefono: '+34 666 789 012',
        nivel: 'Principiante',
        fechaRegistro: new Date('2024-01-01'),
        totalReservas: 1,
        cursosCompletados: 0,
        gastoTotal: 75,
        reservasActivas: [],
        historial: [],
        preferencias: []
      },
      {
        id: 3,
        nombre: 'Laura',
        apellido: 'Martín',
        iniciales: 'LM',
        email: 'laura@email.com',
        telefono: '+34 666 345 678',
        nivel: 'Avanzado',
        fechaRegistro: new Date('2023-11-15'),
        totalReservas: 8,
        cursosCompletados: 6,
        gastoTotal: 945,
        reservasActivas: [],
        historial: [],
        preferencias: []
      },
      {
        id: 4,
        nombre: 'Diego',
        apellido: 'López',
        iniciales: 'DL',
        email: 'diego@email.com',
        telefono: '+34 666 456 789',
        nivel: 'Avanzado',
        fechaRegistro: new Date('2023-10-01'),
        totalReservas: 15,
        cursosCompletados: 12,
        gastoTotal: 2180,
        reservasActivas: [],
        historial: [],
        preferencias: []
      }
    ];
  }

  // ============= RESERVAS MOCK (exactas a las imágenes) =============
  getMockReservas(): SkiProBooking[] {
    return [
      {
        id: 'RES001',
        cliente: {
          nombre: 'Maria',
          apellido: 'González',
          email: 'maria@email.com',
          telefono: '+34 666 123 456',
          iniciales: 'MG'
        },
        tipo: 'Curso',
        tipoIcon: '🎓',
        tipoColor: '#8B5CF6',
        reserva: {
          nombre: 'Curso Principiante',
          descripcion: 'Nivel principiante • 5 días • Pista verde',
          detalles: '25/01/2025'
        },
        fechas: {
          inicio: new Date('2025-01-25'),
          display: '25/01/2025'
        },
        estado: 'Confirmado',
        estadoColor: '#3B82F6',
        precio: 285,
        moneda: '€'
      },
      {
        id: 'RES002',
        cliente: {
          nombre: 'Carlos',
          apellido: 'Ruiz',
          email: 'carlos@email.com',
          telefono: '+34 666 789 012',
          iniciales: 'CR'
        },
        tipo: 'Material',
        tipoIcon: '📦',
        tipoColor: '#F59E0B',
        reserva: {
          nombre: 'Pack Esquí Completo',
          descripcion: 'Esquís + Botas + Bastones + Casco',
          detalles: '22/01/2025'
        },
        fechas: {
          inicio: new Date('2025-01-22'),
          display: '22/01/2025'
        },
        estado: 'Pendiente',
        estadoColor: '#F59E0B',
        precio: 75,
        moneda: '€'
      },
      {
        id: 'RES003',
        cliente: {
          nombre: 'Laura',
          apellido: 'Martín',
          email: 'laura@email.com',
          telefono: '+34 666 345 678',
          iniciales: 'LM'
        },
        tipo: 'Actividad',
        tipoIcon: '⚡',
        tipoColor: '#06B6D4',
        reserva: {
          nombre: 'Excursión con Raquetas',
          descripcion: 'Sendero del Bosque • 4 horas • Incluye guía',
          detalles: '26/01/2025'
        },
        fechas: {
          inicio: new Date('2025-01-26'),
          display: '26/01/2025'
        },
        estado: 'Pagado',
        estadoColor: '#10B981',
        precio: 45,
        moneda: '€'
      },
      {
        id: 'RES004',
        cliente: {
          nombre: 'Diego',
          apellido: 'López',
          email: 'diego@email.com',
          telefono: '+34 666 456 789',
          iniciales: 'DL'
        },
        tipo: 'Curso',
        tipoIcon: '🎓',
        tipoColor: '#8B5CF6',
        reserva: {
          nombre: 'Curso Privado Avanzado',
          descripcion: 'Nivel avanzado • 3 días • Instructor personal',
          detalles: '28/01/2025'
        },
        fechas: {
          inicio: new Date('2025-01-28'),
          display: '28/01/2025'
        },
        estado: 'Cancelado',
        estadoColor: '#EF4444',
        precio: 450,
        moneda: '€'
      }
    ];
  }

  // ============= KPIs MOCK =============
  getMockKPIs(): SkiProKPIs {
    const reservas = this.getMockReservas();
    return {
      cursos: reservas.filter(r => r.tipo === 'Curso').length,
      actividades: reservas.filter(r => r.tipo === 'Actividad').length,
      material: reservas.filter(r => r.tipo === 'Material').length,
      confirmadas: reservas.filter(r => r.estado === 'Confirmado').length,
      pagadas: reservas.filter(r => r.estado === 'Pagado').length,
      canceladas: reservas.filter(r => r.estado === 'Cancelado').length
    };
  }

  // ============= TIPOS DE RESERVA MOCK =============
  getMockTiposReserva(): SkiProTipoReserva[] {
    return [
      {
        id: 'cursos',
        nombre: 'Cursos',
        descripcion: 'Clases de esquí grupales o privadas',
        icon: '🎓',
        color: '#8B5CF6'
      },
      {
        id: 'actividades',
        nombre: 'Actividades',
        descripcion: 'Excursiones y actividades guiadas',
        icon: '⚡',
        color: '#06B6D4'
      },
      {
        id: 'material',
        nombre: 'Material',
        descripcion: 'Alquiler de equipos deportivos',
        icon: '📦',
        color: '#F59E0B'
      }
    ];
  }

  // ============= CURSOS MOCK =============
  getMockCursos(): SkiProCurso[] {
    return [
      {
        id: 1,
        nombre: 'Curso Principiante',
        descripcion: 'Curso ideal para quienes empiezan en el esquí',
        duracion: '5 días',
        nivel: 'Principiante',
        precio: 285,
        detalles: [
          'Clases en grupo pequeño',
          'Instructor especializado',
          'Zona para principiantes',
          'Material incluido'
        ]
      },
      {
        id: 2,
        nombre: 'Curso Privado Avanzado',
        descripcion: 'Clases personalizadas con instructor dedicado',
        duracion: '3 días',
        nivel: 'Avanzado',
        precio: 450,
        detalles: [
          'Atención personalizada',
          'Instructor elite',
          'Análisis técnico',
          'Progreso acelerado'
        ]
      }
    ];
  }

  // ============= MÉTODOS PÚBLICOS =============

  /**
   * Obtener todas las reservas
   */
  getReservas(): Observable<SkiProBooking[]> {
    console.log('📋 [SKIPRO] Getting all reservas');
    return of(this.getMockReservas()).pipe(delay(400));
  }

  /**
   * Obtener reservas filtradas
   */
  getReservasFiltradas(filtro: SkiProFiltroTipo): Observable<SkiProBooking[]> {
    console.log('🔍 [SKIPRO] Filtering reservas by:', filtro);
    let reservas = this.getMockReservas();
    
    if (filtro !== 'Todas') {
      const tipoMap: { [key: string]: string } = {
        'Cursos': 'Curso',
        'Actividades': 'Actividad',
        'Material': 'Material'
      };
      reservas = reservas.filter(r => r.tipo === tipoMap[filtro]);
    }
    
    return of(reservas).pipe(delay(300));
  }

  /**
   * Obtener KPIs del dashboard
   */
  getKPIs(): Observable<SkiProKPIs> {
    console.log('📊 [SKIPRO] Getting KPIs');
    return of(this.getMockKPIs()).pipe(delay(200));
  }

  /**
   * Obtener clientes para wizard
   */
  getClientesParaWizard(): Observable<SkiProCliente[]> {
    console.log('👥 [SKIPRO] Getting clientes for wizard');
    return of(this.getMockClientes()).pipe(delay(300));
  }

  /**
   * Obtener cliente por ID
   */
  getClientePorId(id: number): Observable<SkiProCliente | null> {
    console.log('👤 [SKIPRO] Getting cliente by ID:', id);
    const cliente = this.getMockClientes().find(c => c.id === id) || null;
    return of(cliente).pipe(delay(200));
  }

  /**
   * Obtener tipos de reserva
   */
  getTiposReserva(): Observable<SkiProTipoReserva[]> {
    console.log('🏷️ [SKIPRO] Getting tipos de reserva');
    return of(this.getMockTiposReserva()).pipe(delay(200));
  }

  /**
   * Obtener cursos disponibles
   */
  getCursos(): Observable<SkiProCurso[]> {
    console.log('🎿 [SKIPRO] Getting cursos');
    return of(this.getMockCursos()).pipe(delay(300));
  }

  /**
   * Crear nueva reserva
   */
  crearReserva(reservaData: any): Observable<{ success: boolean; reserva: SkiProBooking }> {
    console.log('✨ [SKIPRO] Creating new reserva:', reservaData);
    
    const nuevaReserva: SkiProBooking = {
      id: `RES${String(Date.now()).slice(-3)}`,
      cliente: reservaData.cliente,
      tipo: reservaData.tipo,
      tipoIcon: reservaData.tipoIcon,
      tipoColor: reservaData.tipoColor,
      reserva: reservaData.reserva,
      fechas: reservaData.fechas,
      estado: 'Confirmado',
      estadoColor: '#3B82F6',
      precio: reservaData.precio,
      moneda: '€'
    };

    const result = {
      success: true,
      reserva: nuevaReserva
    };

    return of(result).pipe(delay(1500));
  }

  /**
   * Buscar clientes
   */
  buscarClientes(query: string): Observable<SkiProCliente[]> {
    console.log('🔍 [SKIPRO] Searching clientes:', query);
    const clientes = this.getMockClientes().filter(cliente =>
      cliente.nombre.toLowerCase().includes(query.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(query.toLowerCase()) ||
      cliente.email.toLowerCase().includes(query.toLowerCase())
    );
    return of(clientes).pipe(delay(400));
  }
}