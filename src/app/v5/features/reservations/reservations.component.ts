import { Component, OnInit } from '@angular/core';
import { ReservationData } from './components/new-reservation-modal/new-reservation-modal.component';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface Reservation {
  id: string;
  client: Client;
  type: 'course' | 'activity' | 'equipment';
  name: string;
  description: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled' | 'completed';
  price: number;
  participants?: number;
  notes?: string;
  createdAt: string;
}

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit {
  selectedFilter = 'all';
  searchTerm = '';
  statusFilter = '';
  dateFilter = '';
  showNewReservationModal = false;

  reservations: Reservation[] = [
    {
      id: 'RES001',
      client: {
        id: 'C001',
        name: 'María González',
        email: 'maria@email.com',
        phone: '+34 666 123 456',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b55c?w=40&h=40&fit=crop&crop=face'
      },
      type: 'course',
      name: 'Curso Principiante',
      description: 'Nivel principiante • 5 días • Pista verde',
      date: '25/01/2025',
      time: '~ 2h',
      status: 'confirmed',
      price: 285,
      participants: 1,
      notes: 'Cliente con experiencia previa',
      createdAt: '2025-01-20'
    },
    {
      id: 'RES002',
      client: {
        id: 'C002',
        name: 'Carlos Ruiz',
        email: 'carlos@email.com',
        phone: '+34 666 789 012',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
      },
      type: 'equipment',
      name: 'Pack Esquí Completo',
      description: 'Esquís + Botas + Bastones + Casco',
      date: '22/01/2025',
      time: '24 h',
      status: 'pending',
      price: 75,
      createdAt: '2025-01-21'
    },
    {
      id: 'RES003',
      client: {
        id: 'C003',
        name: 'Laura Martín',
        email: 'laura@email.com',
        phone: '+34 666 345 678',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
      },
      type: 'activity',
      name: 'Excursión con Raquetas',
      description: 'Sendero del Bosque • 4 horas • Incluye guía',
      date: '26/01/2025',
      time: '~ 4h',
      status: 'paid',
      price: 45,
      participants: 2,
      notes: 'Grupo familiar',
      createdAt: '2025-01-19'
    },
    {
      id: 'RES004',
      client: {
        id: 'C004',
        name: 'Diego López',
        email: 'diego@email.com',
        phone: '+34 666 901 234',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
      },
      type: 'course',
      name: 'Curso Privado Avanzado',
      description: 'Nivel avanzado • 3 días • Instructor personal',
      date: '28/01/2025',
      time: '~ 3h',
      status: 'cancelled',
      price: 450,
      notes: 'Cancelado por mal tiempo',
      createdAt: '2025-01-18'
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    // Filter logic based on selected filter
  }

  get filteredReservations(): Reservation[] {
    return this.reservations.filter(reservation => {
      const matchesSearch = reservation.client.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           reservation.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           reservation.id.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = this.selectedFilter === 'all' || reservation.type === this.selectedFilter;
      const matchesStatus = this.statusFilter === '' || reservation.status === this.statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }

  get reservationStats() {
    return {
      total: this.reservations.length,
      pending: this.reservations.filter(r => r.status === 'pending').length,
      confirmed: this.reservations.filter(r => r.status === 'confirmed').length,
      paid: this.reservations.filter(r => r.status === 'paid').length,
      cancelled: this.reservations.filter(r => r.status === 'cancelled').length
    };
  }

  get typeStats() {
    return {
      courses: this.reservations.filter(r => r.type === 'course').length,
      activities: this.reservations.filter(r => r.type === 'activity').length,
      equipment: this.reservations.filter(r => r.type === 'equipment').length
    };
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'course': return 'school';
      case 'activity': return 'sports';
      case 'equipment': return 'inventory';
      default: return 'help';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'course': return 'Curso';
      case 'activity': return 'Actividad';
      case 'equipment': return 'Material';
      default: return 'Otro';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      case 'paid': return 'Pagado';
      default: return 'Desconocido';
    }
  }

  openNewReservationModal(): void {
    this.showNewReservationModal = true;
  }

  onNewReservationModalClosed(): void {
    this.showNewReservationModal = false;
  }

  onReservationCreated(reservationData: ReservationData): void {
    console.log('New reservation created:', reservationData);
    // Here you would typically save the reservation and refresh the list
    this.showNewReservationModal = false;
  }

  onRowClick(reservation: Reservation): void {
    console.log('Row clicked:', reservation);
  }

  viewReservation(reservation: Reservation): void {
    console.log('View reservation:', reservation);
  }

  editReservation(reservation: Reservation): void {
    console.log('Edit reservation:', reservation);
  }

  cancelReservation(reservation: Reservation): void {
    console.log('Cancel reservation:', reservation);
  }
}