import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

// Mock Services
import { MockDataService } from '../services/mock/mock-data.service';
import { SmartBookingServiceMock } from '../services/mock/smart-booking.service.mock';
import { SmartClientServiceMock } from '../services/mock/smart-client.service.mock';

// Interfaces
import { BookingWizardState } from '../interfaces/booking-wizard.interfaces';

@Component({
  selector: 'app-booking-wizard-demo',
  template: `
    <vex-page-layout>
      <vex-page-layout-header class="pb-16 flex flex-col items-start justify-center">
        <div class="w-full flex flex-col sm:flex-row justify-between">
          <div>
            <h1 class="title mt-0 mb-1">🚀 Sistema de Reservas V3</h1>
            <div class="body-2 text-secondary">
              Wizard inteligente con IA, pricing dinámico y validaciones en tiempo real
            </div>
          </div>
          <div class="flex gap-4 mt-4 sm:mt-0">
            <button mat-raised-button color="primary" (click)="startWizard('create')">
              <mat-icon>add</mat-icon>
              Nueva Reserva
            </button>
            <button mat-raised-button color="accent" (click)="startWizard('edit')">
              <mat-icon>edit</mat-icon>
              Editar Reserva
            </button>
          </div>
        </div>
      </vex-page-layout-header>

      <vex-page-layout-content class="-mt-6">
        <div class="card overflow-hidden">
          <div class="bg-app-bar px-6 h-16 border-b sticky top-0 flex items-center">
            <h2 class="title my-0 ltr:pr-4 rtl:pl-4 ltr:mr-4 rtl:ml-4 ltr:border-r rtl:border-l border-divider flex-none">
              <mat-icon class="icon-sm ltr:mr-4 rtl:ml-4">science</mat-icon>
              Demo del Sistema V3
            </h2>
          </div>

          <div class="px-6 py-6">
            <!-- Estado Actual -->
            <div class="mb-8">
              <h3 class="title mb-4">📊 Estado del Sistema</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <mat-card class="p-4">
                  <div class="flex items-center">
                    <mat-icon class="text-green-500 mr-3">check_circle</mat-icon>
                    <div>
                      <div class="text-sm text-secondary">Interfaces</div>
                      <div class="text-lg font-medium">150+ Completas</div>
                    </div>
                  </div>
                </mat-card>
                
                <mat-card class="p-4">
                  <div class="flex items-center">
                    <mat-icon class="text-blue-500 mr-3">api</mat-icon>
                    <div>
                      <div class="text-sm text-secondary">Mock Services</div>
                      <div class="text-lg font-medium">8 Servicios</div>
                    </div>
                  </div>
                </mat-card>
                
                <mat-card class="p-4">
                  <div class="flex items-center">
                    <mat-icon class="text-purple-500 mr-3">psychology</mat-icon>
                    <div>
                      <div class="text-sm text-secondary">IA Features</div>
                      <div class="text-lg font-medium">Activo</div>
                    </div>
                  </div>
                </mat-card>
                
                <mat-card class="p-4">
                  <div class="flex items-center">
                    <mat-icon class="text-orange-500 mr-3">trending_up</mat-icon>
                    <div>
                      <div class="text-sm text-secondary">Pricing Dinámico</div>
                      <div class="text-lg font-medium">Operativo</div>
                    </div>
                  </div>
                </mat-card>
              </div>
            </div>

            <!-- Funcionalidades Disponibles -->
            <div class="mb-8">
              <h3 class="title mb-4">⚡ Funcionalidades Disponibles</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <mat-card class="p-6">
                  <h4 class="text-lg font-medium mb-4 flex items-center">
                    <mat-icon class="text-primary mr-2">auto_awesome</mat-icon>
                    Wizard Inteligente (6 Pasos)
                  </h4>
                  <div class="space-y-2">
                    <div class="flex items-center">
                      <mat-icon class="text-green-500 text-sm mr-2">check</mat-icon>
                      <span class="text-sm">1. Selección de Cliente + IA</span>
                    </div>
                    <div class="flex items-center">
                      <mat-icon class="text-green-500 text-sm mr-2">check</mat-icon>
                      <span class="text-sm">2. Actividad + Disponibilidad</span>
                    </div>
                    <div class="flex items-center">
                      <mat-icon class="text-green-500 text-sm mr-2">check</mat-icon>
                      <span class="text-sm">3. Calendario Inteligente</span>
                    </div>
                    <div class="flex items-center">
                      <mat-icon class="text-yellow-500 text-sm mr-2">build</mat-icon>
                      <span class="text-sm">4. Monitor + Auto-asignación</span>
                    </div>
                    <div class="flex items-center">
                      <mat-icon class="text-yellow-500 text-sm mr-2">build</mat-icon>
                      <span class="text-sm">5. Participantes + Validación</span>
                    </div>
                    <div class="flex items-center">
                      <mat-icon class="text-yellow-500 text-sm mr-2">build</mat-icon>
                      <span class="text-sm">6. Pricing + Confirmación</span>
                    </div>
                  </div>
                </mat-card>

                <mat-card class="p-6">
                  <h4 class="text-lg font-medium mb-4 flex items-center">
                    <mat-icon class="text-accent mr-2">science</mat-icon>
                    Servicios Mock Listos
                  </h4>
                  <div class="space-y-2">
                    <div class="flex items-center">
                      <mat-icon class="text-green-500 text-sm mr-2">check</mat-icon>
                      <span class="text-sm">MockDataService - Datos centralizados</span>
                    </div>
                    <div class="flex items-center">
                      <mat-icon class="text-green-500 text-sm mr-2">check</mat-icon>
                      <span class="text-sm">SmartClientService - Búsqueda IA</span>
                    </div>
                    <div class="flex items-center">
                      <mat-icon class="text-green-500 text-sm mr-2">check</mat-icon>
                      <span class="text-sm">SmartBookingService - Lógica wizard</span>
                    </div>
                    <div class="flex items-center">
                      <mat-icon class="text-green-500 text-sm mr-2">check</mat-icon>
                      <span class="text-sm">Servicios por cada paso del wizard</span>
                    </div>
                  </div>
                </mat-card>
              </div>
            </div>

            <!-- Datos de Prueba -->
            <div class="mb-8">
              <h3 class="title mb-4">🎮 Datos de Prueba Disponibles</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <mat-card class="p-4">
                  <h5 class="font-medium mb-3">👥 Clientes Mock</h5>
                  <div class="text-sm space-y-1">
                    <div>• Ana García (Intermedio)</div>
                    <div>• Carlos López (Principiante)</div>
                    <div>• María Rodríguez (Avanzado)</div>
                    <div>• + 7 clientes más</div>
                  </div>
                </mat-card>

                <mat-card class="p-4">
                  <h5 class="font-medium mb-3">🎿 Cursos Mock</h5>
                  <div class="text-sm space-y-1">
                    <div>• Esquí Alpino - Principiante</div>
                    <div>• Snowboard Avanzado</div>
                    <div>• Curso Privado Premium</div>
                    <div>• + 3 cursos más</div>
                  </div>
                </mat-card>

                <mat-card class="p-4">
                  <h5 class="font-medium mb-3">👨‍🏫 Monitores Mock</h5>
                  <div class="text-sm space-y-1">
                    <div>• Carlos R. (8 años exp.)</div>
                    <div>• Ana M. (12 años exp.)</div>
                    <div>• Luis P. (5 años exp.)</div>
                    <div>• + 1 monitor más</div>
                  </div>
                </mat-card>
              </div>
            </div>

            <!-- Nuevo: Sistema SkiPro -->
            <div class="mb-8">
              <h3 class="title mb-4">🎿 Nuevo: Sistema SkiPro Completo</h3>
              <mat-card class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h4 class="text-lg font-medium mb-2">Sistema de Gestión SkiPro</h4>
                    <p class="text-secondary">Réplica exacta del diseño SkiPro con funcionalidad completa</p>
                  </div>
                  <button mat-raised-button color="primary" (click)="abrirSkiPro()">
                    <mat-icon>launch</mat-icon>
                    Abrir SkiPro
                  </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 class="font-medium mb-3 text-green-500">✅ Completamente Funcional</h5>
                    <div class="text-sm space-y-1">
                      <div>• Lista de reservas con KPIs</div>
                      <div>• Wizard de 4 pasos</div>
                      <div>• Perfil de cliente detallado</div>
                      <div>• Datos mock realistas</div>
                      <div>• Filtros y búsqueda</div>
                    </div>
                  </div>
                  <div>
                    <h5 class="font-medium mb-3 text-blue-500">🎨 Basado en Diseño Real</h5>
                    <div class="text-sm space-y-1">
                      <div>• KPIs: Cursos, Actividades, Material</div>
                      <div>• Estados: Confirmado, Pendiente, Pagado</div>
                      <div>• Wizard: Cliente → Tipo → Config → Resumen</div>
                      <div>• Perfil: Métricas + Reservas + Historial</div>
                    </div>
                  </div>
                </div>

                <div class="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div class="flex items-center">
                    <mat-icon class="text-blue-500 mr-2">info</mat-icon>
                    <div>
                      <div class="font-medium text-blue-800">Ruta de acceso:</div>
                      <div class="text-blue-600 font-mono text-sm">http://localhost:4200/skipro</div>
                    </div>
                  </div>
                </div>
              </mat-card>
            </div>

            <!-- Próximos Pasos -->
            <div class="mb-8">
              <h3 class="title mb-4">🎯 Próximos Pasos para Desarrollo</h3>
              <mat-card class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 class="font-medium mb-3 text-orange-500">📅 Inmediato (Esta Semana)</h5>
                    <div class="text-sm space-y-2">
                      <div>• Implementar pasos 4-6 del wizard</div>
                      <div>• Conectar servicios reales de API</div>
                      <div>• Testing completo del flujo</div>
                    </div>
                  </div>
                  <div>
                    <h5 class="font-medium mb-3 text-blue-500">🚀 Mediano Plazo (2-3 Semanas)</h5>
                    <div class="text-sm space-y-2">
                      <div>• Implementar funciones de IA</div>
                      <div>• Sistema de pricing dinámico real</div>
                      <div>• Validaciones avanzadas</div>
                    </div>
                  </div>
                </div>
              </mat-card>
            </div>

            <!-- Acciones de Demo -->
            <div>
              <h3 class="title mb-4">🔧 Acciones de Demo</h3>
              <div class="flex flex-wrap gap-4">
                <button mat-raised-button color="primary" (click)="testClientSearch()">
                  <mat-icon>search</mat-icon>
                  Probar Búsqueda de Clientes
                </button>
                <button mat-raised-button color="accent" (click)="testSmartSuggestions()">
                  <mat-icon>psychology</mat-icon>
                  Probar Sugerencias IA
                </button>
                <button mat-raised-button color="warn" (click)="testConflictDetection()">
                  <mat-icon>warning</mat-icon>
                  Probar Detección Conflictos
                </button>
                <button mat-raised-button (click)="testPricingCalculation()">
                  <mat-icon>calculate</mat-icon>
                  Probar Pricing Dinámico
                </button>
              </div>
            </div>

            <!-- Resultados de Demo -->
            <div class="mt-8" *ngIf="demoResults().length > 0">
              <h3 class="title mb-4">📋 Resultados de Demo</h3>
              <mat-card class="p-4">
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium">Última prueba realizada:</span>
                    <button mat-icon-button (click)="clearResults()" matTooltip="Limpiar resultados">
                      <mat-icon>clear</mat-icon>
                    </button>
                  </div>
                  <div class="text-green-600 font-medium">✅ {{ demoResults()[0].test }}</div>
                </div>
                <mat-divider class="mb-4"></mat-divider>
                <details class="cursor-pointer">
                  <summary class="font-medium mb-2 hover:text-primary">Ver detalles JSON</summary>
                  <pre class="text-xs overflow-auto bg-gray-50 p-3 rounded border max-h-64">{{ demoResults()[0] | json }}</pre>
                </details>
              </mat-card>
            </div>
          </div>
        </div>
      </vex-page-layout-content>
    </vex-page-layout>
  `,
  styles: [`
    .card {
      @apply shadow-lg rounded-lg;
    }
    
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 300px;
    }
  `]
})
export class BookingWizardDemoComponent implements OnInit {
  
  // Services
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mockData = inject(MockDataService);
  private smartBooking = inject(SmartBookingServiceMock);
  private smartClient = inject(SmartClientServiceMock);

  // Signals
  public demoResults = signal<any>([]);

  ngOnInit() {
    console.log('🚀 Booking Wizard V3 Demo loaded!');
    console.log('📊 Available mock data:', {
      clients: this.mockData.getMockClients().length,
      courses: this.mockData.getMockCourses().length,
      monitors: this.mockData.getMockMonitors().length
    });
  }

  startWizard(mode: 'create' | 'edit') {
    const id = mode === 'edit' ? '123' : undefined;
    const route = id ? `/bookings-v3/wizard/${mode}/${id}` : `/bookings-v3/wizard/${mode}`;
    this.router.navigate([route]);
  }

  async testClientSearch() {
    console.log('🔍 Testing client search...');
    try {
      const results = await this.smartClient.searchClients('ana').toPromise();
      this.demoResults.set([{
        test: 'Client Search',
        query: 'ana',
        results: results,
        timestamp: new Date()
      }]);
      console.log('✅ Client search results:', results);
    } catch (error) {
      console.error('❌ Client search error:', error);
    }
  }

  async testSmartSuggestions() {
    console.log('🤖 Testing smart suggestions...');
    try {
      const suggestions = await this.smartBooking.getSmartSuggestions({
        clientId: 1,
        date: new Date(),
        courseType: 'beginner'
      }).toPromise();
      this.demoResults.set([{
        test: 'Smart Suggestions',
        context: { clientId: 1, courseType: 'beginner' },
        suggestions: suggestions,
        timestamp: new Date()
      }]);
      console.log('✅ Smart suggestions:', suggestions);
    } catch (error) {
      console.error('❌ Smart suggestions error:', error);
    }
  }

  async testConflictDetection() {
    console.log('⚠️ Testing conflict detection...');
    try {
      const conflicts = await this.smartBooking.detectConflicts({
        courseId: 1,
        dates: [new Date()],
        participantCount: 4
      }).toPromise();
      this.demoResults.set([{
        test: 'Conflict Detection',
        bookingData: { courseId: 1, participantCount: 4 },
        conflicts: conflicts,
        timestamp: new Date()
      }]);
      console.log('✅ Conflicts detected:', conflicts);
    } catch (error) {
      console.error('❌ Conflict detection error:', error);
    }
  }

  async testPricingCalculation() {
    console.log('💰 Testing pricing calculation...');
    try {
      const pricing = await this.smartBooking.calculateDynamicPricing({
        courseId: 1,
        dates: [new Date()],
        participantCount: 2,
        clientId: 1
      }).toPromise();
      this.demoResults.set([{
        test: 'Dynamic Pricing',
        input: { courseId: 1, participantCount: 2 },
        pricing: pricing,
        timestamp: new Date()
      }]);
      console.log('✅ Dynamic pricing:', pricing);
    } catch (error) {
      console.error('❌ Pricing calculation error:', error);
    }
  }

  clearResults() {
    this.demoResults.set([]);
    console.log('🧹 Demo results cleared');
  }

  abrirSkiPro() {
    console.log('🎿 Navigating to SkiPro system');
    this.router.navigate(['/skipro']);
  }
}