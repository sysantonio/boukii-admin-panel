import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// Interfaces
import { ClientV3, ClientV3Statistics } from '../interfaces/booking-v3.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClientV3Service {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/v3`;

  constructor() {
    console.log('👥 ClientV3Service initialized with API:', this.apiUrl);
  }

  // ============= CLIENTS CRUD =============

  getClients(): Observable<ClientV3[]> {
    if (!environment.useRealServices) {
      return this.getMockClients();
    }
    return this.http.get<ClientV3[]>(`${this.apiUrl}/clients`);
  }

  getClientById(id: number): Observable<ClientV3 | null> {
    if (!environment.useRealServices) {
      return this.getMockClientById(id);
    }
    return this.http.get<ClientV3>(`${this.apiUrl}/clients/${id}`);
  }

  getClientStatistics(id: number): Observable<ClientV3Statistics | null> {
    if (!environment.useRealServices) {
      return this.getMockClientStatistics(id);
    }
    return this.http.get<ClientV3Statistics>(`${this.apiUrl}/clients/${id}/statistics`);
  }

  createClient(clientData: Partial<ClientV3>): Observable<{ success: boolean; client?: ClientV3; message?: string }> {
    if (!environment.useRealServices) {
      return this.createMockClient(clientData);
    }
    return this.http.post<{ success: boolean; client?: ClientV3; message?: string }>(`${this.apiUrl}/clients`, clientData);
  }

  updateClient(id: number, clientData: Partial<ClientV3>): Observable<{ success: boolean; client?: ClientV3; message?: string }> {
    if (!environment.useRealServices) {
      return this.updateMockClient(id, clientData);
    }
    return this.http.put<{ success: boolean; client?: ClientV3; message?: string }>(`${this.apiUrl}/clients/${id}`, clientData);
  }

  searchClients(query: string): Observable<ClientV3[]> {
    if (!environment.useRealServices) {
      return this.searchMockClients(query);
    }
    return this.http.get<ClientV3[]>(`${this.apiUrl}/clients/search?q=${encodeURIComponent(query)}`);
  }

  // ============= MOCK DATA METHODS =============

  private getMockClients(): Observable<ClientV3[]> {
    const mockClients: ClientV3[] = [
      {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@email.com',
        telefono: '+34 666 123 456',
        iniciales: 'JP',
        nivel: 'Intermedio',
        fechaRegistro: new Date('2024-01-15'),
        preferencias: ['Esquí alpino', 'Clases matutinas'],
        notas: 'Cliente habitual, muy puntual'
      },
      {
        id: 2,
        nombre: 'María',
        apellido: 'González',
        email: 'maria.gonzalez@email.com',
        telefono: '+34 666 789 012',
        iniciales: 'MG',
        nivel: 'Principiante',
        fechaRegistro: new Date('2024-02-10'),
        preferencias: ['Clases en grupo', 'Actividades familiares'],
        notas: 'Primera vez esquiando, muy entusiasta'
      },
      {
        id: 3,
        nombre: 'Carlos',
        apellido: 'Ruiz',
        email: 'carlos.ruiz@email.com',
        telefono: '+34 666 345 678',
        iniciales: 'CR',
        nivel: 'Avanzado',
        fechaRegistro: new Date('2023-12-05'),
        preferencias: ['Fuera pista', 'Esquí de competición'],
        notas: 'Ex-competidor, busca desafíos técnicos'
      },
      {
        id: 4,
        nombre: 'Ana',
        apellido: 'Martín',
        email: 'ana.martin@email.com',
        telefono: '+34 666 456 789',
        iniciales: 'AM',
        nivel: 'Intermedio',
        fechaRegistro: new Date('2024-03-20'),
        preferencias: ['Snowboard', 'Clases privadas'],
        notas: 'Prefiere snowboard a esquí'
      },
      {
        id: 5,
        nombre: 'David',
        apellido: 'López',
        email: 'david.lopez@email.com',
        telefono: '+34 666 567 890',
        iniciales: 'DL',
        nivel: 'Principiante',
        fechaRegistro: new Date('2024-04-12'),
        preferencias: ['Clases familiares', 'Horarios flexibles'],
        notas: 'Viene con familia, niños pequeños'
      },
      {
        id: 6,
        nombre: 'Laura',
        apellido: 'Fernández',
        email: 'laura.fernandez@email.com',
        telefono: '+34 666 678 901',
        iniciales: 'LF',
        nivel: 'Experto',
        fechaRegistro: new Date('2023-11-08'),
        preferencias: ['Freeride', 'Esquí de travesía'],
        notas: 'Instructora certificada, busca perfeccionamiento'
      }
    ];

    console.log('👥 Mock clients loaded:', mockClients.length);
    return of(mockClients);
  }

  private getMockClientById(id: number): Observable<ClientV3 | null> {
    return new Observable(observer => {
      this.getMockClients().subscribe(clients => {
        const client = clients.find(c => c.id === id);
        observer.next(client || null);
        observer.complete();
      });
    });
  }

  private getMockClientStatistics(id: number): Observable<ClientV3Statistics | null> {
    const mockStats: ClientV3Statistics = {
      totalReservas: Math.floor(Math.random() * 20) + 5,
      reservasCompletadas: Math.floor(Math.random() * 15) + 3,
      reservasActivas: Math.floor(Math.random() * 3) + 1,
      gastoTotal: Math.floor(Math.random() * 1000) + 200,
      ultimaActividad: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      cursosCompletados: Math.floor(Math.random() * 10) + 1,
      nivelProgreso: Math.floor(Math.random() * 100) + 20
    };

    console.log('📊 Mock client statistics for ID', id, ':', mockStats);
    return of(mockStats);
  }

  private searchMockClients(query: string): Observable<ClientV3[]> {
    return new Observable(observer => {
      this.getMockClients().subscribe(clients => {
        const searchTerm = query.toLowerCase();
        const filtered = clients.filter(client => 
          client.nombre.toLowerCase().includes(searchTerm) ||
          client.apellido.toLowerCase().includes(searchTerm) ||
          client.email.toLowerCase().includes(searchTerm) ||
          client.telefono?.toLowerCase().includes(searchTerm)
        );
        observer.next(filtered);
        observer.complete();
      });
    });
  }

  private createMockClient(clientData: Partial<ClientV3>): Observable<{ success: boolean; client?: ClientV3; message?: string }> {
    console.log('🔨 Creating mock client:', clientData);
    
    return new Observable(observer => {
      setTimeout(() => {
        const newClient: ClientV3 = {
          id: Date.now(),
          nombre: clientData.nombre || '',
          apellido: clientData.apellido || '',
          email: clientData.email || '',
          telefono: clientData.telefono || '',
          nivel: clientData.nivel || 'Principiante',
          iniciales: ((clientData.nombre?.[0] || '') + (clientData.apellido?.[0] || '')).toUpperCase(),
          fechaRegistro: new Date(),
          preferencias: clientData.preferencias || [],
          notas: clientData.notas || ''
        };

        observer.next({ success: true, client: newClient });
        observer.complete();
      }, 1000);
    });
  }

  private updateMockClient(id: number, clientData: Partial<ClientV3>): Observable<{ success: boolean; client?: ClientV3; message?: string }> {
    console.log('🔄 Updating mock client:', id, clientData);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Cliente actualizado correctamente' });
        observer.complete();
      }, 800);
    });
  }
}