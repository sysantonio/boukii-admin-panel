import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface Group {
  id: string;
  name: string;
  schedule: string;
  level: string;
}

export interface ReservationDetails {
  startDate?: string;
  startTime?: string;
  endDate?: string;
  participants?: string;
  notes?: string;
}

export interface ReservationData {
  client?: Client;
  serviceType?: string;
  group?: Group;
  details?: ReservationDetails;
}

@Component({
  selector: 'app-new-reservation-modal',
  templateUrl: './new-reservation-modal.component.html',
  styleUrls: ['./new-reservation-modal.component.scss']
})
export class NewReservationModalComponent {
  @Input() isOpen = false;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() reservationCreated = new EventEmitter<ReservationData>();

  currentStep = 1; // Starting at step 1
  totalSteps = 5;

  // Step 1: Client Selection
  clientSearchTerm = '';
  selectedClient: Client | null = null;
  filteredClients: Client[] = [];

  // Step 2: Service Type
  selectedServiceType: string | null = null;
  selectedClientName : string | null = null;
  selectedGroup: Group | null = null;

  // Step 3: Details
  reservationDetails: ReservationDetails = {};

  // Step 5: Confirmation
  generatedReservationId = '';

  reservationData: ReservationData = {};

  // Mock client data
  allClients: Client[] = [
    {
      id: '1',
      name: 'Ana García',
      email: 'ana.garcia@email.com',
      phone: '+34 666 123 456',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b55c?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Carlos Ruiz',
      email: 'carlos.ruiz@email.com',
      phone: '+34 666 789 012',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'Laura Martín',
      email: 'laura.martin@email.com',
      phone: '+34 666 345 678',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: '4',
      name: 'Diego López',
      email: 'diego.lopez@email.com',
      phone: '+34 666 901 234'
    }
  ];

  // Available groups for collective courses
  availableGroups: Group[] = [
    {
      id: '1',
      name: 'Principiante Kids (6-10 años)',
      schedule: 'Lun-Vie 10:00-12:00',
      level: 'principiante'
    },
    {
      id: '2',
      name: 'Intermedio Teens (11-16 años)',
      schedule: 'Lun-Vie 10:00-12:00',
      level: 'intermedio'
    },
    {
      id: '3',
      name: 'Avanzado Adultos',
      schedule: 'Lun-Vie 10:00-12:00',
      level: 'avanzado'
    }
  ];

  get progressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  selectServiceType(type: string): void {
    this.selectedServiceType = type;
    this.reservationData.serviceType = type;

    // Clear group selection when changing service type
    if (type !== 'colectivo') {
      this.selectedGroup = null;
      this.reservationData.group = undefined;
    }
  }

  selectGroup(group: Group): void {
    this.selectedGroup = group;
    this.reservationData.group = group;
  }

  // Step 1: Client Selection Methods
  onClientSearch(): void {
    if (!this.clientSearchTerm) {
      this.filteredClients = [];
      return;
    }

    const searchTerm = this.clientSearchTerm.toLowerCase();
    this.filteredClients = this.allClients.filter(client =>
      client.name.toLowerCase().includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm) ||
      client.phone.includes(searchTerm)
    );
  }

  selectClient(client: Client): void {
    this.selectedClient = client;
    this.reservationData.client = client;
  }

  getClientInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  createNewClient(): void {
    // In a real app, this would open a client creation form
    console.log('Create new client');
  }

  // Step 2: Service Type Methods
  getServiceTypeLabel(type: string | null): string {
    switch (type) {
      case 'colectivo': return 'Curso Colectivo';
      case 'privado': return 'Curso Privado';
      case 'actividad': return 'Actividad';
      case 'alquiler': return 'Alquiler de Material';
      default: return '';
    }
  }

  // Step 4: Summary Methods
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  calculateBasePrice(): number {
    switch (this.selectedServiceType) {
      case 'colectivo': return 285;
      case 'privado': return 450;
      case 'actividad': return 45;
      case 'alquiler': return 75;
      default: return 0;
    }
  }

  calculateAdditionalParticipantsPrice(): number {
    const additionalParticipants = parseInt(this.reservationDetails.participants || '1') - 1;
    return additionalParticipants * 50; // 50€ per additional participant
  }

  calculateTotalPrice(): number {
    return this.calculateBasePrice() + this.calculateAdditionalParticipantsPrice();
  }

  parseInt(value: string): number {
    return parseInt(value, 10);
  }

  // Step 5: Confirmation Methods
  copyReservationId(): void {
    navigator.clipboard.writeText(this.generatedReservationId);
    // In a real app, show a toast notification
  }

  viewReservationList(): void {
    this.closeModal();
    // Navigate to reservations list
  }

  createAnotherReservation(): void {
    this.resetModal();
    this.currentStep = 1;
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!this.selectedClient;
      case 2:
        if (this.selectedServiceType === 'colectivo') {
          return !!this.selectedGroup;
        }
        return !!this.selectedServiceType;
      case 3:
        return !!this.reservationDetails.startDate && !!this.reservationDetails.startTime;
      case 4:
        return true; // Summary step
      case 5:
        return true; // Confirmation step
      default:
        return false;
    }
  }

  nextStep(): void {
    if (this.canProceed() && this.currentStep < this.totalSteps) {
      this.currentStep++;

      if (this.currentStep === this.totalSteps) {
        // Generate reservation ID and create reservation
        this.generatedReservationId = 'RES' + Date.now().toString().slice(-6);
        this.createReservation();
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  createReservation(): void {
    this.reservationCreated.emit(this.reservationData);
    this.closeModal();
  }

  closeModal(): void {
    this.isOpen = false;
    this.modalClosed.emit();
    this.resetModal();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  private resetModal(): void {
    this.currentStep = 1;
    this.clientSearchTerm = '';
    this.selectedClient = null;
    this.filteredClients = [];
    this.selectedServiceType = null;
    this.selectedGroup = null;
    this.reservationDetails = {};
    this.generatedReservationId = '';
    this.reservationData = {};
  }
}
