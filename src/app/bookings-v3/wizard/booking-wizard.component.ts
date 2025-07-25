import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

// Mock Services
import { MockDataService } from '../services/mock/mock-data.service';
import { SmartBookingServiceMock } from '../services/mock/smart-booking.service.mock';

@Component({
  selector: 'app-booking-wizard',
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">🚀 Booking Wizard V3</h1>
      <p class="text-gray-600 mb-4">El wizard completo se implementará próximamente.</p>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="font-semibold text-blue-800 mb-2">Componente en Desarrollo</h3>
        <p class="text-blue-700 text-sm">
          Este es el wizard inteligente de 6 pasos con IA, pricing dinámico y validaciones en tiempo real.
          Por ahora, puedes probar las funcionalidades en la página de demo.
        </p>
        <button 
          (click)="goToDemo()" 
          class="inline-block mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Ir al Demo
        </button>
      </div>
    </div>
  `
})
export class BookingWizardComponent {
  private router = inject(Router);

  goToDemo() {
    this.router.navigate(['/bookings-v3/demo']);
  }
}