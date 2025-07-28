// ============= CORE BOOKING INTERFACES =============

export interface BookingV3 {
  id: string;
  cliente: ClientV3;
  tipo: string;
  tipoIcon: string;
  tipoColor: string;
  reserva: {
    nombre: string;
    descripcion: string;
    detalles?: string;
  };
  fechas: {
    inicio: Date;
    fin?: Date;
    display: string;
    horario?: string;
    puntoEncuentro?: string;
  };
  estado: BookingV3Status;
  estadoColor: string;
  precio: number;
  moneda: string;
  fechaCreacion: Date;
  fechaModificacion?: Date;
  participantes?: ParticipantV3[];
  notas?: string;
  pagos?: {
    anticipo?: number;
    pendiente?: number;
    metodoPago?: string;
  };
}

export type BookingV3Status = 
  | 'Pendiente' 
  | 'Confirmado' 
  | 'Pagado' 
  | 'Completado' 
  | 'Cancelado' 
  | 'No Show';

export interface BookingV3KPIs {
  cursos: number;
  actividades: number;
  material: number;
  confirmadas: number;
  pagadas: number;
  canceladas: number;
}

export interface BookingV3Filter {
  tipo: 'Todas' | 'Cursos' | 'Actividades' | 'Material';
  estado: string;
  busqueda: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

// ============= CLIENT INTERFACES =============

export interface ClientV3 {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  iniciales: string;
  nivel: ClientV3Level;
  fechaRegistro: Date;
  preferencias?: string[];
  notas?: string;
  isNew?: boolean; // For wizard new client creation
}

export type ClientV3Level = 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto';

export interface ClientV3Details extends ClientV3 {
  reservasActivas: BookingV3[];
  historialReservas: BookingV3[];
  estadisticas: ClientV3Statistics;
}

export interface ClientV3Statistics {
  totalReservas: number;
  reservasCompletadas: number;
  reservasActivas: number;
  gastoTotal: number;
  ultimaActividad?: Date;
  cursosCompletados: number;
  nivelProgreso: number;
}

// ============= BOOKING TYPES & COURSES =============

export interface BookingV3Type {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string;
  color: string;
  precioBase: number;
  requiresCourse: boolean;
  configuracionEspecial?: any;
}

export interface CourseV3 {
  id: number;
  nombre: string;
  descripcion: string;
  nivel: ClientV3Level;
  duracion: string;
  precio: number;
  maxParticipantes: number;
  instructor?: string;
  equipoIncluido?: boolean;
}

// ============= WIZARD INTERFACES =============

export interface BookingV3WizardState {
  paso: number;
  cliente?: ClientV3;
  tipoReserva?: BookingV3Type;
  cursoSeleccionado?: CourseV3;
  configuracion?: BookingV3Configuration;
  detallesParticipantes?: ParticipantV3[];
  crearNuevoCliente: boolean;
  nuevoClienteData?: Partial<ClientV3>;
}

export interface BookingV3Configuration {
  participantes: number;
  fechasSeleccionadas: Date[];
  puntoEncuentro: string;
  notasAdicionales: string;
  horarioPreferido?: 'manana' | 'tarde' | 'completo';
}

export interface ParticipantV3 {
  nombre: string;
  apellido: string;
  edad: number;
  nivel: ClientV3Level;
  equipoRequerido: boolean;
  tallasEquipo?: {
    esquis: string;
    botas: string;
    bastones: string;
  };
  observaciones: string;
}

export interface BookingV3Summary {
  cliente: ClientV3;
  tipoReserva: BookingV3Type;
  curso?: CourseV3;
  configuracion: BookingV3Configuration;
  participantes: ParticipantV3[];
  precioBase: number;
  precioTotal: number;
  fechas: Date[];
}

// ============= API RESPONSE INTERFACES =============

export interface BookingV3ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface BookingV3CreateRequest {
  clienteId?: number;
  nuevoCliente?: Partial<ClientV3>;
  tipoReservaId: string;
  cursoId?: number;
  configuracion: BookingV3Configuration;
  participantes: ParticipantV3[];
  precioTotal: number;
  notas?: string;
}

export interface BookingV3UpdateRequest extends Partial<BookingV3CreateRequest> {
  estado?: BookingV3Status;
  motivoCambio?: string;
}

export interface BookingV3CancelRequest {
  bookingId: string;
  reason: string;
  comments?: string;
  refundOption: 'full' | 'partial' | 'voucher' | 'none';
  notifications: {
    client: boolean;
    instructor: boolean;
  };
}

// ============= DASHBOARD & REPORTING INTERFACES =============

export interface BookingV3DashboardData {
  kpis: BookingV3KPIs;
  recentBookings: BookingV3[];
  upcomingActivities: BookingV3[];
  revenueData: {
    today: number;
    week: number;
    month: number;
  };
}

export interface BookingV3Report {
  id: string;
  tipo: 'daily' | 'weekly' | 'monthly' | 'custom';
  fechaInicio: Date;
  fechaFin: Date;
  datos: {
    totalReservas: number;
    ingresos: number;
    cancelaciones: number;
    noShows: number;
  };
  desglosePorTipo: Record<string, number>;
}

// ============= NOTIFICATION INTERFACES =============

export interface BookingV3Notification {
  id: string;
  tipo: 'booking_created' | 'booking_cancelled' | 'reminder' | 'payment_received';
  destinatario: {
    tipo: 'client' | 'instructor' | 'admin';
    email: string;
    nombre: string;
  };
  contenido: {
    asunto: string;
    mensaje: string;
    datos: any;
  };
  estado: 'pending' | 'sent' | 'failed';
  fechaCreacion: Date;
  fechaEnvio?: Date;
}

// ============= EQUIPMENT & INVENTORY INTERFACES =============

export interface EquipmentV3 {
  id: string;
  tipo: 'esquis' | 'botas' | 'bastones' | 'casco' | 'gafas';
  marca: string;
  modelo: string;
  talla: string;
  estado: 'disponible' | 'alquilado' | 'mantenimiento' | 'dañado';
  precioAlquiler: number;
  notas?: string;
}

export interface EquipmentRentalV3 {
  participantId: string;
  equipos: EquipmentV3[];
  fechaInicio: Date;
  fechaFin: Date;
  costoTotal: number;
  deposito?: number;
  estadoDevolucion?: 'pendiente' | 'completa' | 'dañado';
}

// ============= INSTRUCTOR INTERFACES =============

export interface InstructorV3 {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  especialidades: ClientV3Level[];
  idiomas: string[];
  disponibilidad: {
    dias: string[];
    horarios: string[];
  };
  tarifa: number;
  activo: boolean;
}

export interface InstructorAssignmentV3 {
  bookingId: string;
  instructorId: number;
  fechaAsignacion: Date;
  notas?: string;
}

// ============= PAYMENT INTERFACES =============

export interface PaymentV3 {
  id: string;
  bookingId: string;
  cantidad: number;
  moneda: string;
  metodo: 'card' | 'cash' | 'transfer' | 'voucher';
  estado: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  fechaCreacion: Date;
  fechaProcesamiento?: Date;
  notas?: string;
}

export interface RefundV3 {
  id: string;
  paymentId: string;
  cantidad: number;
  motivo: string;
  estado: 'pending' | 'completed' | 'failed';
  fechaCreacion: Date;
  fechaProcesamiento?: Date;
}

// ============= UTILITY TYPES =============

export type BookingV3SortField = 
  | 'fechaCreacion' 
  | 'fechaInicio' 
  | 'cliente' 
  | 'precio' 
  | 'estado';

export type BookingV3SortDirection = 'asc' | 'desc';

export interface BookingV3SortOptions {
  field: BookingV3SortField;
  direction: BookingV3SortDirection;
}

export interface BookingV3PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

// ============= FORM INTERFACES =============

export interface NewClientForm {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  nivel: ClientV3Level;
}

export interface BookingSearchForm {
  query: string;
  filters: BookingV3Filter;
  sortBy: BookingV3SortOptions;
  pagination: BookingV3PaginationOptions;
}

// ============= VALIDATION INTERFACES =============

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============= CONSTANTS =============

export const BOOKING_V3_CONSTANTS = {
  DEFAULT_CURRENCY: 'EUR',
  DEFAULT_LANGUAGE: 'es',
  MAX_PARTICIPANTS: 20,
  MIN_ADVANCE_BOOKING_HOURS: 24,
  CANCELLATION_POLICY_HOURS: 48,
  EQUIPMENT_RENTAL_RATE: 15, // per person per day
  
  STATUS_COLORS: {
    'Pendiente': '#ea580c',
    'Confirmado': '#059669',
    'Pagado': '#2563eb',
    'Completado': '#16a34a',
    'Cancelado': '#dc2626',
    'No Show': '#9333ea'
  } as Record<BookingV3Status, string>,
  
  TYPE_COLORS: {
    'Cursos': '#7c3aed',
    'Actividades': '#2563eb',
    'Material': '#059669'
  },
  
  TYPE_ICONS: {
    'Cursos': 'school',
    'Actividades': 'sports',
    'Material': 'inventory'
  }
} as const;