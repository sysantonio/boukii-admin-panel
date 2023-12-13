export interface TableColumn<T> {
  label: string;
  property: string;
  type: 'text' | 'image' | 'badge' | 'progress' | 'checkbox' | 'button' | 'active' | 'dates' | 'client' | 'register_date'| 'duration'| 'datesCourse'
    | 'light' | 'price' | 'payment_status' | 'cancelation_status' | 'bookings' | 'level' | 'active' | 'status' | 'birth' | 'date' | 'sport' | 'flexible';
  visible?: boolean;
  cssClasses?: string[];
}
