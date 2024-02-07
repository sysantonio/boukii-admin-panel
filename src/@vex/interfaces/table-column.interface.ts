export interface TableColumn<T> {
  label: string;
  property: string;
  type: 'text' | 'image' | 'badge' | 'progress' | 'checkbox' | 'button' | 'active' | 'dates' | 'client' | 'register_date'| 'duration'| 'datesCourse'| 'count'| 'light_school'| 'sports_monitor'| 'booking_users_image'
    | 'light' | 'price' | 'payment_status' | 'cancelation_status' | 'bookings' | 'level' | 'active' | 'status' | 'birth' | 'date' | 'sport' | 'flexible' | 'sports' | 'booking_users' | 'client_image' | 'booking_dates'
    | 'course_type_data' | 'light_data' | 'light_data' | 'payment_status_data' | 'course_image' | 'payment_method_id' | 'coronita' | 'qr' | 'light_monitors_schools' | 'monitor' | 'client_2';
  visible?: boolean;
  cssClasses?: string[];
}
