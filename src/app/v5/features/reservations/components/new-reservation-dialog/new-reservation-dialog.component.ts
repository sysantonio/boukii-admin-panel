import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

interface Client {
  id: string;
  name: string;
  initials: string;
  age: number;
  level: string;
  location: string;
  email: string;
}

interface ServiceType {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconClass: string;
}

@Component({
  selector: 'app-new-reservation-dialog',
  templateUrl: './new-reservation-dialog.component.html',
  styleUrls: ['./new-reservation-dialog.component.scss']
})
export class NewReservationDialogComponent implements OnInit {
  currentStep = 1;
  totalSteps = 4;

  clientForm!: FormGroup;
  typeForm!: FormGroup;
  detailsForm!: FormGroup;

  selectedClient: Client | null = null;
  selectedServiceType: string = '';

  filteredClients: Client[] = [];
  clients: Client[] = [
    {
      id: '1',
      name: 'María García',
      initials: 'MG',
      age: 28,
      level: 'Intermedio',
      location: 'Español',
      email: 'maria@gmail.com'
    },
    {
      id: '2',
      name: 'Ana García',
      initials: 'AG',
      age: 32,
      level: 'Principiante',
      location: 'Español',
      email: 'ana@gmail.com'
    },
    {
      id: '3',
      name: 'Carlos García',
      initials: 'CG',
      age: 35,
      level: 'Avanzado',
      location: 'Español',
      email: 'carlos@gmail.com'
    },
    {
      id: '4',
      name: 'John Smith',
      initials: 'JS',
      age: 29,
      level: 'Avanzado',
      location: 'English',
      email: 'john@gmail.com'
    }
  ];

  serviceTypes: ServiceType[] = [
    {
      id: 'curso',
      name: 'Curso Colectivo',
      description: 'Clases en grupo por niveles',
      icon: 'groups',
      iconClass: 'course-icon'
    },
    {
      id: 'curso-privado',
      name: 'Curso Privado',
      description: 'Clases personalizadas 1:1',
      icon: 'person',
      iconClass: 'private-icon'
    },
    {
      id: 'actividad',
      name: 'Actividad',
      description: 'Raquetas, excursiones, etc.',
      icon: 'hiking',
      iconClass: 'activity-icon'
    },
    {
      id: 'material',
      name: 'Alquiler de Material',
      description: 'Esquís, botas, bastones, etc.',
      icon: 'inventory',
      iconClass: 'material-icon'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NewReservationDialogComponent>
  ) {
    this.filteredClients = this.clients;
  }

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    this.clientForm = this.fb.group({
      clientSearch: ['', Validators.required]
    });

    this.typeForm = this.fb.group({
      serviceType: ['', Validators.required]
    });

    this.detailsForm = this.fb.group({
      courseId: [''],
      activityId: [''],
      materialPack: [''],
      date: [''],
      startDate: [''],
      endDate: [''],
      level: [''],
      participants: [1]
    });

    // Subscribe to client search changes
    this.clientForm.get('clientSearch')?.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.filterClients(value);
      } else if (value && typeof value === 'object') {
        this.selectedClient = value;
      }
    });

    // Subscribe to service type changes
    this.typeForm.get('serviceType')?.valueChanges.subscribe(value => {
      this.selectedServiceType = value;
      this.updateDetailsFormValidation();
    });
  }

  private filterClients(searchTerm: string): void {
    const filterValue = searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(client =>
      client.name.toLowerCase().includes(filterValue) ||
      client.email.toLowerCase().includes(filterValue)
    );
  }

  private updateDetailsFormValidation(): void {
    const detailsForm = this.detailsForm;
    
    // Reset all validators
    Object.keys(detailsForm.controls).forEach(key => {
      detailsForm.get(key)?.clearValidators();
      detailsForm.get(key)?.updateValueAndValidity();
    });

    // Add validators based on service type
    switch (this.selectedServiceType) {
      case 'curso':
      case 'curso-privado':
        detailsForm.get('courseId')?.setValidators([Validators.required]);
        detailsForm.get('date')?.setValidators([Validators.required]);
        detailsForm.get('level')?.setValidators([Validators.required]);
        break;
      case 'actividad':
        detailsForm.get('activityId')?.setValidators([Validators.required]);
        detailsForm.get('date')?.setValidators([Validators.required]);
        detailsForm.get('participants')?.setValidators([Validators.required, Validators.min(1)]);
        break;
      case 'material':
        detailsForm.get('materialPack')?.setValidators([Validators.required]);
        detailsForm.get('startDate')?.setValidators([Validators.required]);
        detailsForm.get('endDate')?.setValidators([Validators.required]);
        break;
    }

    Object.keys(detailsForm.controls).forEach(key => {
      detailsForm.get(key)?.updateValueAndValidity();
    });
  }

  displayClientFn(client: Client): string {
    return client ? client.name : '';
  }

  clearClient(): void {
    this.selectedClient = null;
    this.clientForm.get('clientSearch')?.setValue('');
  }

  getSelectedServiceName(): string {
    const service = this.serviceTypes.find(s => s.id === this.selectedServiceType);
    return service ? service.name : '';
  }

  getServiceSummary(): string {
    const formValues = this.detailsForm.value;
    
    switch (this.selectedServiceType) {
      case 'curso':
      case 'curso-privado':
        return `${formValues.courseId} - ${formValues.level} - ${formValues.date}`;
      case 'actividad':
        return `${formValues.activityId} - ${formValues.participants} participantes - ${formValues.date}`;
      case 'material':
        return `${formValues.materialPack} - ${formValues.startDate} a ${formValues.endDate}`;
      default:
        return '';
    }
  }

  calculateTotalPrice(): number {
    switch (this.selectedServiceType) {
      case 'curso':
        return 285;
      case 'curso-privado':
        return 450;
      case 'actividad':
        const participants = this.detailsForm.get('participants')?.value || 1;
        return 45 * participants;
      case 'material':
        return 75;
      default:
        return 0;
    }
  }

  confirmReservation(): void {
    const reservationData = {
      client: this.selectedClient,
      serviceType: this.selectedServiceType,
      details: this.detailsForm.value,
      totalPrice: this.calculateTotalPrice()
    };

    console.log('Creating reservation:', reservationData);
    this.dialogRef.close(reservationData);
  }
}