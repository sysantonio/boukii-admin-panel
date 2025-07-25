// ============= INTERFACES BASADAS EN DISEÑO SKIPRO =============

export interface SkiProBooking {
  id: string;
  cliente: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    avatar?: string;
    iniciales: string;
  };
  tipo: 'Curso' | 'Actividad' | 'Material';
  tipoIcon: string;
  tipoColor: string;
  reserva: {
    nombre: string;
    descripcion: string;
    detalles: string;
  };
  fechas: {
    inicio: Date;
    fin?: Date;
    display: string;
  };
  estado: 'Confirmado' | 'Pendiente' | 'Pagado' | 'Cancelado';
  estadoColor: string;
  precio: number;
  moneda: string;
}

export interface SkiProKPIs {
  cursos: number;
  actividades: number;
  material: number;
  confirmadas: number;
  pagadas: number;
  canceladas: number;
}

export interface SkiProCliente {
  id: number;
  nombre: string;
  apellido: string;
  iniciales: string;
  email: string;
  telefono: string;
  avatar?: string;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  fechaRegistro: Date;
  totalReservas: number;
  cursosCompletados: number;
  gastoTotal: number;
  reservasActivas: SkiProReservaActiva[];
  historial: SkiProHistorialReserva[];
  preferencias: string[];
}

export interface SkiProReservaActiva {
  id: string;
  tipo: 'Curso' | 'Actividad' | 'Material';
  nombre: string;
  descripcion: string;
  estado: 'Confirmado' | 'Pendiente';
  fechas: string;
  precio: number;
}

export interface SkiProHistorialReserva {
  id: string;
  tipo: 'Curso' | 'Actividad' | 'Material';
  nombre: string;
  descripcion: string;
  fechas: string;
  precio: number;
  estado: 'Completado' | 'Cancelado';
}

export interface SkiProTipoReserva {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string;
  color: string;
  isSelected?: boolean;
}

export interface SkiProCurso {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: string;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  precio: number;
  imagen?: string;
  detalles: string[];
}

export interface SkiProConfiguracionReserva {
  participantes: number;
  fechasSeleccionadas: Date[];
  puntoEncuentro: string;
  notasAdicionales?: string;
}

export interface SkiProResumenReserva {
  cliente: SkiProCliente;
  tipo: string;
  elemento: string;
  participantes: number;
  fechas: string;
  puntoEncuentro: string;
  precioBase: number;
  total: number;
}

export interface SkiProWizardState {
  paso: number;
  cliente?: SkiProCliente | null;
  crearNuevoCliente?: boolean;
  nuevoClienteData?: Partial<SkiProCliente>;
  tipoReserva?: SkiProTipoReserva;
  cursoSeleccionado?: SkiProCurso;
  configuracion?: SkiProConfiguracionReserva;
  resumen?: SkiProResumenReserva;
}

// Estados y filtros
export type SkiProFiltroTipo = 'Todas' | 'Cursos' | 'Actividades' | 'Material';
export type SkiProEstadoReserva = 'Confirmado' | 'Pendiente' | 'Pagado' | 'Cancelado';