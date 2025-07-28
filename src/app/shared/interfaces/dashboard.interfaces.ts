// ==========================================
// INTERFACES PARA EL NUEVO DASHBOARD
// ==========================================

export interface DashboardMetric {
  value: number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
  label: string;
}

export interface WelcomeBannerData {
  userName: string;
  newBookingsToday: number;
  scheduledCourses: number;
  performanceImprovement: number;
  activeInstructors: number;
  availableInstructors: number;
  availableHours: number;
}

export interface WeatherData {
  temperature: number;
  sensation: number;
  wind: {
    speed: number;
    direction: string;
  };
  visibility: {
    distance: number;
    quality: string;
  };
  snow: {
    depth: number;
    quality: string;
  };
  date: string;
  time: string;
}

export interface TodayBooking {
  id: string;
  type: 'Privado' | 'Colectivo';
  course: string;
  client: {
    name: string;
    email: string;
    avatar?: string;
    initials: string;
  };
  instructor: string;
  time: string;
  status: 'Confirmado' | 'Pendiente' | 'Cancelado';
  price: number;
}

export interface TodayBookingsData {
  bookings: TodayBooking[];
  summary: {
    confirmed: number;
    pending: number;
    total: number;
    date: string;
  };
}

export interface SalesChannelData {
  admin: number[];
  online: number[];
  objective: number[];
  months: string[];
  totals: {
    admin: number;
    online: number;
    total: number;
    adminPercentage: number;
    onlinePercentage: number;
  };
}

export interface DailySessionsData {
  sessions: number[];
  days: string[];
  currentWeek: boolean;
}

export interface DashboardData {
  welcomeBanner: WelcomeBannerData;
  metrics: {
    privateCourses: DashboardMetric;
    collectiveCourses: DashboardMetric;
    activeBookings: DashboardMetric;
    dailySales: DashboardMetric;
  };
  weather: WeatherData;
  todayBookings: TodayBookingsData;
  salesChannels: SalesChannelData;
  dailySessions: DailySessionsData;
}

// Tipos para colores y temas
export type StatusColor = 'confirmed' | 'pending' | 'cancelled' | 'info';
export type MetricColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type BookingType = 'Privado' | 'Colectivo';
export type BookingStatus = 'Confirmado' | 'Pendiente' | 'Cancelado';

// Configuraciones para componentes
export interface MetricCardConfig {
  title: string;
  value: number | string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: MetricColor;
  subtitle?: string;
}

export interface WeatherWidgetConfig {
  showTime: boolean;
  showDate: boolean;
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'kmh' | 'mph';
  visibilityUnit: 'km' | 'miles';
  snowDepthUnit: 'cm' | 'inches';
}

// Respuestas de API
export interface DashboardApiResponse {
  success: boolean;
  data: DashboardData;
  timestamp: string;
}

export interface MetricsApiResponse {
  success: boolean;
  data: {
    privateCourses: DashboardMetric;
    collectiveCourses: DashboardMetric;
    activeBookings: DashboardMetric;
    dailySales: DashboardMetric;
  };
  timestamp: string;
}

export interface WeatherApiResponse {
  success: boolean;
  data: WeatherData;
  timestamp: string;
}

export interface TodayBookingsApiResponse {
  success: boolean;
  data: TodayBookingsData;
  timestamp: string;
}

export interface SalesChannelsApiResponse {
  success: boolean;
  data: SalesChannelData;
  timestamp: string;
}

export interface DailySessionsApiResponse {
  success: boolean;
  data: DailySessionsData;
  timestamp: string;
}