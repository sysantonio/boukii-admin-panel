import { Component, OnInit, inject, signal, Output, EventEmitter } from '@angular/core';
import { SkiProMockDataService } from '../../services/mock/skipro-mock-data.service';
import { MockDataService } from '../../services/mock/mock-data.service';
import {
  SkiProWizardState,
  SkiProCliente,
  SkiProTipoReserva,
  SkiProCurso,
  SkiProConfiguracionReserva,
  SkiProBooking
} from '../../interfaces/skipro.interfaces';
import {
  Client,
  Course,
  Monitor,
  OptimalSlot,
  WeatherInfo,
  PriceBreakdown
} from '../../interfaces/shared.interfaces';

@Component({
  selector: 'app-skipro-wizard-inline',
  template: `
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-100">

      <!-- Header -->
      <div class="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <mat-icon class="text-white text-xl">{{ getStepIcon() }}</mat-icon>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Nueva Reserva</h2>
              <p class="text-sm text-gray-600 mt-1">{{ getStepDescription() }}</p>
            </div>
          </div>
          <button mat-icon-button (click)="cerrarWizard()" class="hover:bg-white/50 rounded-full">
            <mat-icon class="text-gray-400">close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Progress Steps -->
      <div class="px-8 py-6 border-b border-gray-100 bg-white">
        <div class="flex items-center justify-center gap-1">
          <div *ngFor="let step of stepLabels; let i = index"
               class="flex items-center">
            <div class="flex flex-col items-center min-w-[70px]">
              <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-200"
                   [class.bg-primary]="wizardState().paso > i + 1"
                   [class.text-white]="wizardState().paso > i + 1"
                   [class.border-primary]="wizardState().paso > i + 1"
                   [class.bg-primary]="wizardState().paso === i + 1"
                   [class.text-white]="wizardState().paso === i + 1"
                   [class.border-primary]="wizardState().paso === i + 1"
                   [class.border-gray-300]="wizardState().paso < i + 1"
                   [class.text-gray-400]="wizardState().paso < i + 1"
                   [class.bg-gray-50]="wizardState().paso < i + 1">
                <mat-icon *ngIf="wizardState().paso > i + 1" class="text-sm">check</mat-icon>
                <span *ngIf="wizardState().paso <= i + 1">{{ i + 1 }}</span>
              </div>
              <span class="text-xs mt-2 text-center font-medium transition-all duration-200"
                    [class.text-primary]="wizardState().paso >= i + 1"
                    [class.text-gray-400]="wizardState().paso < i + 1">
                {{ step }}
              </span>
            </div>
            <div *ngIf="i < stepLabels.length - 1" class="w-12 h-1 bg-gray-200 mx-2 rounded-full mt-[-15px] transition-all duration-200"
                 [class.bg-primary]="wizardState().paso > i + 1"></div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-8 py-6 overflow-y-auto max-h-[400px]">

        <!-- PASO 1: Selección de Cliente con funcionalidades V3 -->
        <div *ngIf="wizardState().paso === 1">
          <h3 class="text-lg font-semibold mb-4">Seleccionar Cliente</h3>

          <!-- Búsqueda inteligente -->
          <div class="mb-6">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Buscar cliente</mat-label>
              <input matInput
                     [(ngModel)]="busquedaCliente"
                     (ngModelChange)="buscarClientes()"
                     placeholder="Buscar por nombre, email o teléfono...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <!-- Clientes sugeridos -->
          <div *ngIf="clientesSugeridos().length > 0" class="mb-6">
            <h4 class="font-medium mb-3">Clientes sugeridos</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div *ngFor="let cliente of clientesSugeridos()"
                   class="p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md"
                   [class.border-primary]="wizardState().cliente?.id === cliente.id"
                   [class.bg-primary-50]="wizardState().cliente?.id === cliente.id"
                   (click)="seleccionarCliente(cliente)">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                    {{ cliente.iniciales }}
                  </div>
                  <div class="flex-1">
                    <div class="font-medium">{{ cliente.nombre }} {{ cliente.apellido }}</div>
                    <div class="text-sm text-secondary">{{ cliente.email }}</div>
                    <div class="text-sm text-secondary">{{ cliente.telefono }}</div>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs px-2 py-1 bg-gray-100 rounded-full">{{ cliente.nivel }}</span>
                      <span class="text-xs text-secondary">{{ cliente.totalReservas }} reservas</span>
                    </div>
                  </div>
                  <mat-icon *ngIf="wizardState().cliente?.id === cliente.id"
                           class="text-primary">check_circle</mat-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- Clientes recientes/favoritos -->
          <div class="mb-6">
            <div class="flex gap-4 mb-3">
              <button mat-button
                      [class.bg-primary]="vistaClientes === 'recientes'"
                      [class.text-primary-contrast]="vistaClientes === 'recientes'"
                      (click)="cambiarVistaClientes('recientes')">
                Recientes
              </button>
              <button mat-button
                      [class.bg-primary]="vistaClientes === 'favoritos'"
                      [class.text-primary-contrast]="vistaClientes === 'favoritos'"
                      (click)="cambiarVistaClientes('favoritos')">
                Favoritos
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div *ngFor="let cliente of clientesDisponibles()"
                   class="p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md"
                   [class.border-primary]="wizardState().cliente?.id === cliente.id"
                   [class.bg-primary-50]="wizardState().cliente?.id === cliente.id"
                   (click)="seleccionarCliente(cliente)">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                    {{ cliente.iniciales }}
                  </div>
                  <div class="flex-1">
                    <div class="font-medium">{{ cliente.nombre }} {{ cliente.apellido }}</div>
                    <div class="text-sm text-secondary">{{ cliente.email }}</div>
                    <div class="text-sm text-secondary">{{ cliente.telefono }}</div>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs px-2 py-1 bg-gray-100 rounded-full">{{ cliente.nivel }}</span>
                      <span class="text-xs text-green-600">{{ cliente.gastoTotal }}€ total</span>
                    </div>
                  </div>
                  <mat-icon *ngIf="wizardState().cliente?.id === cliente.id"
                           class="text-primary">check_circle</mat-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- Crear nuevo cliente -->
          <div class="border-t pt-4">
            <h4 class="font-medium mb-3">O crear nuevo cliente</h4>
            <button mat-stroked-button
                    class="w-full"
                    [class.border-primary]="wizardState().crearNuevoCliente"
                    [class.text-primary]="wizardState().crearNuevoCliente"
                    (click)="toggleCrearNuevoCliente()">
              <mat-icon>add</mat-icon>
              Añadir nuevo cliente
            </button>

            <!-- Formulario nuevo cliente -->
            <div *ngIf="wizardState().crearNuevoCliente" class="mt-4 p-4 bg-gray-50 rounded-lg">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field appearance="outline">
                  <mat-label>Nombre</mat-label>
                  <input matInput [(ngModel)]="nuevoClienteForm.nombre">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Apellido</mat-label>
                  <input matInput [(ngModel)]="nuevoClienteForm.apellido">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" [(ngModel)]="nuevoClienteForm.email">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Teléfono</mat-label>
                  <input matInput [(ngModel)]="nuevoClienteForm.telefono">
                </mat-form-field>
                <mat-form-field appearance="outline" class="md:col-span-2">
                  <mat-label>Nivel</mat-label>
                  <mat-select [(ngModel)]="nuevoClienteForm.nivel">
                    <mat-option value="Principiante">Principiante</mat-option>
                    <mat-option value="Intermedio">Intermedio</mat-option>
                    <mat-option value="Avanzado">Avanzado</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>
          </div>
        </div>

        <!-- PASO 2: Utilizadores (como en bookings-v2) -->
        <div *ngIf="wizardState().paso === 2">
          <h3 class="text-lg font-semibold mb-6">Seleccionar Utilizadores</h3>

          <!-- Cliente principal seleccionado -->
          <div class="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-semibold">
                {{ getClienteSeleccionado()?.iniciales }}
              </div>
              <div>
                <div class="font-semibold text-blue-900">Cliente Principal</div>
                <div class="text-blue-700">{{ getClienteSeleccionado()?.nombre }} {{ getClienteSeleccionado()?.apellido }}</div>
                <div class="text-sm text-blue-600">{{ getClienteSeleccionado()?.email }}</div>
              </div>
              <mat-icon class="text-blue-500 ml-auto">verified_user</mat-icon>
            </div>
          </div>

          <!-- Utilizadores adicionales -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium">Utilizadores que participarán</h4>
              <button mat-stroked-button (click)="anadirUtilizador()">
                <mat-icon>add</mat-icon>
                Anadir utilizador
              </button>
            </div>

            <div class="space-y-3">
              <div *ngFor="let utilizador of utilizadores(); let i = index"
                   class="p-4 border rounded-lg">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium">
                      {{ utilizador.iniciales || (utilizador.nombre?.charAt(0) + utilizador.apellido?.charAt(0)) }}
                    </div>
                    <div>
                      <div class="font-medium">{{ utilizador.nombre }} {{ utilizador.apellido }}</div>
                      <div class="text-sm text-secondary">{{ utilizador.email }}</div>
                      <div class="text-xs text-secondary">Nivel: {{ utilizador.nivel }}</div>
                    </div>
                  </div>
                  <button mat-icon-button (click)="eliminarUtilizador(i)" class="text-red-500">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>

              <!-- Formulario para nuevo utilizador -->
              <div *ngIf="mostrarFormUtilizador" class="p-4 bg-gray-50 rounded-lg border-2 border-dashed">
                <h5 class="font-medium mb-3">Nuevo Utilizador</h5>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <mat-form-field appearance="outline">
                    <mat-label>Nombre</mat-label>
                    <input matInput [(ngModel)]="nuevoUtilizadorForm.nombre">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Apellido</mat-label>
                    <input matInput [(ngModel)]="nuevoUtilizadorForm.apellido">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" [(ngModel)]="nuevoUtilizadorForm.email">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Teléfono</mat-label>
                    <input matInput [(ngModel)]="nuevoUtilizadorForm.telefono">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Nivel deportivo</mat-label>
                    <mat-select [(ngModel)]="nuevoUtilizadorForm.nivel">
                      <mat-option value="Principiante">Principiante</mat-option>
                      <mat-option value="Intermedio">Intermedio</mat-option>
                      <mat-option value="Avanzado">Avanzado</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Fecha de nacimiento</mat-label>
                    <input matInput type="date" [(ngModel)]="nuevoUtilizadorForm.fechaNacimiento">
                  </mat-form-field>
                </div>
                <div class="flex gap-2 mt-4">
                  <button mat-raised-button color="primary" (click)="guardarNuevoUtilizador()">
                    Guardar
                  </button>
                  <button mat-button (click)="cancelarNuevoUtilizador()">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <div class="text-sm">
              <strong>Total participantes:</strong> {{ 1 + utilizadores().length }}
              (1 cliente principal + {{ utilizadores().length }} utilizador{{ utilizadores().length !== 1 ? 'es' : '' }})
            </div>
          </div>
        </div>

        <!-- PASO 3: Deporte y Nivel (como en bookings-v2) -->
        <div *ngIf="wizardState().paso === 3">
          <h3 class="text-lg font-semibold mb-6">Deporte y Nivel</h3>

          <!-- Selector de deporte -->
          <div class="mb-6">
            <h4 class="font-medium mb-3">Seleccionar Deporte</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div *ngFor="let deporte of deportes()"
                   class="p-4 border-2 rounded-lg cursor-pointer text-center transition-all hover:shadow-md"
                   [class.border-primary]="deporteSeleccionado?.id === deporte.id"
                   [class.bg-primary-50]="deporteSeleccionado?.id === deporte.id"
                   (click)="seleccionarDeporte(deporte)">
                <div class="text-3xl mb-2">{{ deporte.icon }}</div>
                <div class="font-medium">{{ deporte.nombre }}</div>
              </div>
            </div>
          </div>

          <!-- Selector de nivel deportivo -->
          <div *ngIf="deporteSeleccionado" class="mb-6">
            <h4 class="font-medium mb-3">Nivel Deportivo para {{ deporteSeleccionado.nombre }}</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div *ngFor="let nivel of nivelesDisponibles()"
                   class="p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md"
                   [class.border-primary]="nivelSeleccionado?.id === nivel.id"
                   [class.bg-primary-50]="nivelSeleccionado?.id === nivel.id"
                   (click)="seleccionarNivel(nivel)">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-3 h-3 rounded-full" [style.background-color]="nivel.color"></div>
                  <span class="font-medium">{{ nivel.nombre }}</span>
                </div>
                <div class="text-sm text-secondary">{{ nivel.descripcion }}</div>
                <div class="text-xs text-secondary mt-2">
                  Duración típica: {{ nivel.duracionTipica }}
                </div>
              </div>
            </div>
          </div>

          <!-- Recomendación basada en utilizadores -->
          <div *ngIf="deporteSeleccionado && nivelSeleccionado" class="p-4 bg-blue-50 rounded-lg">
            <div class="flex items-start gap-3">
              <mat-icon class="text-blue-500">info</mat-icon>
              <div>
                <div class="font-medium text-blue-900">Recomendación</div>
                <div class="text-sm text-blue-700">
                  Basado en el nivel de los {{ 1 + utilizadores().length }} participantes,
                  se recomienda {{ nivelSeleccionado.nombre }} para {{ deporteSeleccionado.nombre }}.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PASO 4: Curso y Fecha (fusión con diseño SkiPro) -->
        <div *ngIf="wizardState().paso === 4">
          <h3 class="text-lg font-semibold mb-4">Seleccionar Actividad</h3>

          <!-- Sugerencias IA basadas en cliente -->
          <div *ngIf="sugerenciasIA().length > 0" class="mb-6">
            <h4 class="font-medium mb-3 flex items-center">
              <mat-icon class="text-primary mr-2">psychology</mat-icon>
              Sugerencias para {{ getClienteSeleccionado()?.nombre }}
            </h4>
            <div class="bg-blue-50 p-4 rounded-lg border">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div *ngFor="let sugerencia of sugerenciasIA()"
                     class="p-3 bg-white rounded-lg cursor-pointer border-2 transition-all"
                     [class.border-primary]="cursoRecomendadoSeleccionado?.id === sugerencia.curso.id"
                     (click)="seleccionarSugerencia(sugerencia)">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium">{{ sugerencia.curso.name }}</span>
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {{ sugerencia.matchScore }}% match
                    </span>
                  </div>
                  <div class="text-sm text-secondary mb-2">{{ sugerencia.razon }}</div>
                  <div class="text-lg font-bold text-primary">{{ sugerencia.curso.basePrice }}€</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tipo de Reserva -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div *ngFor="let tipo of tiposReserva()"
                 class="p-6 border-2 rounded-lg cursor-pointer text-center transition-all hover:shadow-md"
                 [class.border-primary]="wizardState().tipoReserva?.id === tipo.id"
                 [class.bg-primary-50]="wizardState().tipoReserva?.id === tipo.id"
                 (click)="seleccionarTipoReserva(tipo)">
              <div class="text-4xl mb-3" [style.color]="tipo.color">{{ tipo.icon }}</div>
              <div class="font-semibold mb-2">{{ tipo.nombre }}</div>
              <div class="text-sm text-secondary">{{ tipo.descripcion }}</div>
            </div>
          </div>

          <!-- Cursos disponibles con filtros avanzados -->
          <div *ngIf="wizardState().tipoReserva?.id === 'cursos'">
            <h4 class="font-semibold mb-4">Cursos Disponibles</h4>

            <!-- Filtros -->
            <div class="flex gap-4 mb-4">
              <mat-form-field appearance="outline">
                <mat-label>Nivel</mat-label>
                <mat-select [(ngModel)]="filtroNivel" (ngModelChange)="aplicarFiltros()">
                  <mat-option value="">Todos</mat-option>
                  <mat-option value="Principiante">Principiante</mat-option>
                  <mat-option value="Intermedio">Intermedio</mat-option>
                  <mat-option value="Avanzado">Avanzado</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Precio máximo</mat-label>
                <input matInput type="number" [(ngModel)]="filtroPrecionMax" (ngModelChange)="aplicarFiltros()">
              </mat-form-field>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div *ngFor="let curso of cursosFiltrados()"
                   class="p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md"
                   [class.border-primary]="wizardState().cursoSeleccionado?.id === curso.id"
                   [class.bg-primary-50]="wizardState().cursoSeleccionado?.id === curso.id"
                   (click)="seleccionarCurso(curso)">
                <div class="w-full h-32 bg-gray-200 rounded-md mb-3 flex items-center justify-center">
                  <mat-icon class="text-4xl text-gray-400">image</mat-icon>
                </div>
                <div class="font-semibold mb-2">{{ curso.nombre }}</div>
                <div class="text-sm text-secondary mb-2">{{ curso.descripcion }}</div>
                <div class="flex justify-between items-center">
                  <div>
                    <div class="text-sm text-secondary">{{ curso.duracion }}</div>
                    <div class="text-xs px-2 py-1 bg-gray-100 rounded-full inline-block">
                      {{ curso.nivel }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-lg">{{ curso.precio }}€</div>
                    <div class="text-xs text-green-600">Disponible</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PASO 5: Detalles y Configuración -->
        <div *ngIf="wizardState().paso === 5">
          <h3 class="text-lg font-semibold mb-4">Configurar Reserva</h3>

          <!-- Slots óptimos sugeridos -->
          <div *ngIf="slotsOptimos().length > 0" class="mb-6">
            <h4 class="font-medium mb-3 flex items-center">
              <mat-icon class="text-primary mr-2">auto_awesome</mat-icon>
              Horarios Recomendados
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div *ngFor="let slot of slotsOptimos()"
                   class="p-4 border-2 rounded-lg cursor-pointer transition-all"
                   [class.border-green-500]="slot.score > 90"
                   [class.border-blue-500]="slot.score > 80 && slot.score <= 90"
                   [class.bg-green-50]="slotSeleccionado?.id === slot.id"
                   (click)="seleccionarSlot(slot)">
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <div class="font-medium">{{ formatearFecha(slot.date) }}</div>
                    <div class="text-sm text-secondary">{{ slot.timeSlot.startTime }} - {{ slot.timeSlot.endTime }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-xs px-2 py-1 rounded-full text-white"
                         [class.bg-green-500]="slot.score > 90"
                         [class.bg-blue-500]="slot.score > 80 && slot.score <= 90">
                      {{ slot.score }}% optimal
                    </div>
                  </div>
                </div>

                <div class="space-y-1 text-xs">
                  <div *ngFor="let razon of slot.reasons" class="flex items-center">
                    <mat-icon class="text-xs mr-1"
                              [class.text-green-500]="razon.impact > 0.5"
                              [class.text-yellow-500]="razon.impact > 0.2 && razon.impact <= 0.5"
                              [class.text-red-500]="razon.impact <= 0.2">
                      {{ getIconoRazon(razon.factor) }}
                    </mat-icon>
                    <span>{{ razon.description }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Configuración manual -->
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <label class="font-medium">Número de participantes</label>
              <div class="flex items-center gap-3">
                <button mat-icon-button (click)="cambiarParticipantes(-1)"
                        [disabled]="configuracion().participantes <= 1">
                  <mat-icon>remove</mat-icon>
                </button>
                <span class="w-8 text-center font-semibold">{{ configuracion().participantes }}</span>
                <button mat-icon-button (click)="cambiarParticipantes(1)">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </div>

            <div>
              <label class="font-medium mb-2 block">Fecha(s)</label>
              <button mat-stroked-button class="w-full text-left" (click)="abrirCalendario()">
                <mat-icon>event</mat-icon>
                {{ configuracion().fechasSeleccionadas.length }} fecha(s) seleccionada(s)
              </button>
            </div>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Punto de encuentro</mat-label>
              <mat-select [(ngModel)]="configuracionForm.puntoEncuentro">
                <mat-option value="escuela-base">Escuela Base</mat-option>
                <mat-option value="pista-verde">Pista Verde</mat-option>
                <mat-option value="telecabina">Telecabina</mat-option>
                <mat-option value="hotel">Hotel del cliente</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Notas adicionales</mat-label>
              <textarea matInput
                        rows="3"
                        [(ngModel)]="configuracionForm.notasAdicionales"
                        placeholder="Comentarios, necesidades especiales, alergias, etc..."></textarea>
            </mat-form-field>

            <!-- Información meteorológica -->
            <div *ngIf="infoClimatica()" class="p-4 bg-blue-50 rounded-lg">
              <h5 class="font-medium mb-2 flex items-center">
                <mat-icon class="text-blue-500 mr-2">wb_sunny</mat-icon>
                Previsión Meteorológica
              </h5>
              <div class="text-sm">
                <div>{{ infoClimatica()?.conditions }} - {{ infoClimatica()?.temperature.current }}°C</div>
                <div class="text-secondary">{{ infoClimatica()?.description }}</div>
                <div class="mt-2">
                  <span class="px-2 py-1 rounded-full text-xs"
                        [class.bg-green-100]="infoClimatica()?.suitabilityScore > 0.8"
                        [class.text-green-800]="infoClimatica()?.suitabilityScore > 0.8"
                        [class.bg-yellow-100]="infoClimatica()?.suitabilityScore <= 0.8"
                        [class.text-yellow-800]="infoClimatica()?.suitabilityScore <= 0.8">
                    {{ (infoClimatica()?.suitabilityScore * 100).toFixed(0) }}% ideal para esquí
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PASO 6: Observaciones y Confirmación -->
        <div *ngIf="wizardState().paso === 6">
          <h3 class="text-lg font-semibold mb-6">Observaciones y Confirmación</h3>

          <!-- Formulario de Observaciones -->
          <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <mat-form-field appearance="outline">
              <mat-label>Observaciones del Cliente</mat-label>
              <textarea matInput rows="4"
                        [(ngModel)]="observacionesForm.cliente"
                        placeholder="Notas adicionales del cliente, preferencias especiales..."></textarea>
              <mat-hint>Información proporcionada por el cliente</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Observaciones de la Escuela</mat-label>
              <textarea matInput rows="4"
                        [(ngModel)]="observacionesForm.escuela"
                        placeholder="Notas internas, instrucciones para el monitor..."></textarea>
              <mat-hint>Notas internas para el equipo</mat-hint>
            </mat-form-field>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Cliente -->
            <div class="p-4 border rounded-lg">
              <h4 class="font-semibold mb-3">Cliente</h4>
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                  {{ getClienteSeleccionado()?.iniciales }}
                </div>
                <div>
                  <div class="font-medium">{{ getClienteSeleccionado()?.nombre }} {{ getClienteSeleccionado()?.apellido }}</div>
                  <div class="text-sm text-secondary">{{ getClienteSeleccionado()?.email }}</div>
                  <div class="text-xs text-green-600">{{ getClienteSeleccionado()?.totalReservas }} reservas previas</div>
                </div>
              </div>
            </div>

            <!-- Pricing Dinámico -->
            <div class="p-4 border rounded-lg">
              <h4 class="font-semibold mb-3">Pricing Inteligente</h4>
              <div *ngIf="pricingDinamico()" class="space-y-2">
                <div class="flex justify-between">
                  <span>Precio base:</span>
                  <span>{{ pricingDinamico()?.basePrice }}€</span>
                </div>
                <div class="flex justify-between">
                  <span>Participantes:</span>
                  <span>x{{ configuracion().participantes }}</span>
                </div>
                <div *ngFor="let descuento of pricingDinamico()?.discounts" class="flex justify-between text-green-600">
                  <span>{{ descuento.name }}:</span>
                  <span>-{{ descuento.amount }}€</span>
                </div>
                <div *ngFor="let recargo of pricingDinamico()?.surcharges" class="flex justify-between text-orange-600">
                  <span>{{ recargo.name }}:</span>
                  <span>+{{ recargo.amount }}€</span>
                </div>
                <div class="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span class="text-primary">{{ pricingDinamico()?.finalPrice }}€</span>
                </div>
                <div class="text-xs text-secondary">
                  Precio calculado {{ formatearFecha(pricingDinamico()?.lastCalculated) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Detalles de la Reserva -->
          <div class="mt-6 p-4 border rounded-lg">
            <h4 class="font-semibold mb-3">Detalles de la Reserva</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium">Tipo:</span>
                <span class="ml-2">{{ wizardState().tipoReserva?.nombre }}</span>
              </div>
              <div>
                <span class="font-medium">Actividad:</span>
                <span class="ml-2">{{ wizardState().cursoSeleccionado?.nombre || 'N/A' }}</span>
              </div>
              <div>
                <span class="font-medium">Participantes:</span>
                <span class="ml-2">{{ configuracion().participantes }}</span>
              </div>
              <div>
                <span class="font-medium">Fechas:</span>
                <span class="ml-2">{{ configuracion().fechasSeleccionadas.length }} día(s)</span>
              </div>
              <div>
                <span class="font-medium">Horario:</span>
                <span class="ml-2">{{ slotSeleccionado?.timeSlot.startTime || 'Por definir' }} - {{ slotSeleccionado?.timeSlot.endTime || '' }}</span>
              </div>
              <div>
                <span class="font-medium">Monitor:</span>
                <span class="ml-2">{{ slotSeleccionado?.monitor.firstName || 'Asignación automática' }}</span>
              </div>
              <div class="md:col-span-2">
                <span class="font-medium">Punto encuentro:</span>
                <span class="ml-2">{{ configuracionForm.puntoEncuentro || 'No especificado' }}</span>
              </div>
              <div *ngIf="configuracionForm.notasAdicionales" class="md:col-span-2">
                <span class="font-medium">Notas:</span>
                <span class="ml-2">{{ configuracionForm.notasAdicionales }}</span>
              </div>
            </div>
          </div>

          <!-- Factores de pricing -->
          <div *ngIf="pricingDinamico()?.dynamicFactors" class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h5 class="font-medium mb-2">Factores Aplicados</h5>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div *ngFor="let factor of getFactoresPricing()" class="text-center">
                <div class="font-medium">{{ factor.name }}</div>
                <div [class.text-green-600]="factor.value < 1"
                     [class.text-red-600]="factor.value > 1"
                     [class.text-gray-600]="factor.value === 1">
                  {{ (factor.value * 100).toFixed(0) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
        <button mat-button
                (click)="pasoPrevio()"
                [disabled]="wizardState().paso === 1"
                class="flex items-center gap-2 px-6 py-2 rounded-lg hover:bg-white transition-colors">
          <mat-icon>arrow_back</mat-icon>
          Anterior
        </button>

        <div class="flex gap-3">
          <button mat-button
                  (click)="cerrarWizard()"
                  class="px-6 py-2 rounded-lg hover:bg-white transition-colors">
            Cancelar
          </button>

          <button *ngIf="wizardState().paso < 6"
                  mat-raised-button
                  color="primary"
                  (click)="pasoSiguiente()"
                  [disabled]="!puedeAvanzar()"
                  class="px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all">
            Siguiente
            <mat-icon class="ml-1">arrow_forward</mat-icon>
          </button>

          <button *ngIf="wizardState().paso === 6"
                  mat-raised-button
                  color="primary"
                  (click)="confirmarReserva()"
                  [disabled]="procesandoReserva()"
                  class="px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all">
            <mat-icon *ngIf="!procesandoReserva()" class="mr-1">check</mat-icon>
            <mat-spinner *ngIf="procesandoReserva()" diameter="16" class="mr-2"></mat-spinner>
            Confirmar Reserva
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mat-mdc-form-field {
      width: 100%;
    }
  `]
})
export class SkiProWizardInlineComponent implements OnInit {

  @Output() cerrar = new EventEmitter<void>();
  @Output() reservaCreada = new EventEmitter<SkiProBooking>();

  private skipro = inject(SkiProMockDataService);
  private mockDataV3 = inject(MockDataService);

  // Signals
  public wizardState = signal<SkiProWizardState>({ paso: 1 });
  public clientesDisponibles = signal<SkiProCliente[]>([]);
  public clientesSugeridos = signal<SkiProCliente[]>([]);
  public tiposReserva = signal<SkiProTipoReserva[]>([]);
  public cursosDisponibles = signal<SkiProCurso[]>([]);
  public cursosFiltrados = signal<SkiProCurso[]>([]);
  public configuracion = signal<SkiProConfiguracionReserva>({
    participantes: 2,
    fechasSeleccionadas: [new Date()],
    puntoEncuentro: ''
  });
  public procesandoReserva = signal(false);
  public sugerenciasIA = signal<any[]>([]);
  public slotsOptimos = signal<OptimalSlot[]>([]);
  public infoClimatica = signal<WeatherInfo | null>(null);
  public pricingDinamico = signal<any>(null);

  // Propiedades
  public busquedaCliente = '';
  public vistaClientes: 'recientes' | 'favoritos' = 'recientes';
  public filtroNivel = '';
  public filtroPrecionMax = 0;
  public cursoRecomendadoSeleccionado: any = null;
  public slotSeleccionado: OptimalSlot | null = null;

  // Labels para los pasos del wizard (estilo bookings-v2)
  public stepLabels = ['Cliente', 'Utilizadores', 'Deporte', 'Curso', 'Detalles', 'Observaciones'];

  // Nuevos signals para el flujo extendido
  public utilizadores = signal<any[]>([]);
  public deportes = signal<any[]>([]);
  public deporteSeleccionado: any = null;
  public nivelSeleccionado: any = null;
  public mostrarFormUtilizador = false;

  // Forms
  public nuevoClienteForm = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    nivel: 'Principiante' as 'Principiante' | 'Intermedio' | 'Avanzado'
  };

  public nuevoUtilizadorForm = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    nivel: 'Principiante' as 'Principiante' | 'Intermedio' | 'Avanzado',
    fechaNacimiento: ''
  };

  public configuracionForm = {
    puntoEncuentro: '',
    notasAdicionales: ''
  };

  public observacionesForm = {
    cliente: '',
    escuela: ''
  };

  ngOnInit() {
    this.cargarDatos();
    this.inicializarDatosExtendidos();
  }

  private async cargarDatos() {
    try {
      const [clientes, tipos, cursos] = await Promise.all([
        this.skipro.getClientesParaWizard().toPromise(),
        this.skipro.getTiposReserva().toPromise(),
        this.skipro.getCursos().toPromise()
      ]);

      this.clientesDisponibles.set(clientes || []);
      this.tiposReserva.set(tipos || []);
      this.cursosDisponibles.set(cursos || []);
      this.cursosFiltrados.set(cursos || []);

      // Cargar datos V3 adicionales
      await this.cargarDatosV3();

      console.log('🧙‍♂️ SkiPro Wizard Inline loaded');
    } catch (error) {
      console.error('❌ Error loading wizard data:', error);
    }
  }

  private async cargarDatosV3() {
    try {
      // Cargar funcionalidades avanzadas de V3
      const [slots, weather] = await Promise.all([
        this.mockDataV3.getOptimalSlots().toPromise(),
        this.mockDataV3.getMockWeatherInfo()
      ]);

      this.slotsOptimos.set(slots || []);
      this.infoClimatica.set(weather);
    } catch (error) {
      console.error('❌ Error loading V3 data:', error);
    }
  }

  // Métodos del wizard...
  pasoSiguiente() {
    if (this.puedeAvanzar()) {
      const currentState = this.wizardState();
      this.wizardState.set({ ...currentState, paso: currentState.paso + 1 });

      // Cargar datos específicos del paso
      if (currentState.paso + 1 === 2) {
        this.cargarSugerenciasIA();
      } else if (currentState.paso + 1 === 4) {
        this.calcularPricingDinamico();
      }
    }
  }

  pasoPrevio() {
    const currentState = this.wizardState();
    if (currentState.paso > 1) {
      this.wizardState.set({ ...currentState, paso: currentState.paso - 1 });
    }
  }


  // Paso 1: Cliente
  async buscarClientes() {
    if (this.busquedaCliente.length > 2) {
      try {
        const resultados = await this.skipro.buscarClientes(this.busquedaCliente).toPromise();
        this.clientesSugeridos.set(resultados || []);
      } catch (error) {
        console.error('❌ Error searching clients:', error);
      }
    } else {
      this.clientesSugeridos.set([]);
    }
  }

  cambiarVistaClientes(vista: 'recientes' | 'favoritos') {
    this.vistaClientes = vista;
    // TODO: Cargar clientes según vista
  }

  seleccionarCliente(cliente: SkiProCliente) {
    const currentState = this.wizardState();
    this.wizardState.set({
      ...currentState,
      cliente,
      crearNuevoCliente: false
    });
  }

  toggleCrearNuevoCliente() {
    const currentState = this.wizardState();
    this.wizardState.set({
      ...currentState,
      crearNuevoCliente: !currentState.crearNuevoCliente,
      cliente: currentState.crearNuevoCliente ? undefined : currentState.cliente
    });
  }

  // Paso 2: Actividad
  async cargarSugerenciasIA() {
    const cliente = this.getClienteSeleccionado();
    if (cliente) {
      try {
        // Simular sugerencias IA basadas en V3
        const cursos = await this.mockDataV3.getAvailableCourses().toPromise();
        const sugerencias = cursos?.map(curso => ({
          curso,
          matchScore: Math.floor(Math.random() * 20) + 80, // 80-100%
          razon: `Ideal para nivel ${cliente.nivel}`,
          confidence: 0.85
        })) || [];

        this.sugerenciasIA.set(sugerencias.slice(0, 3));
      } catch (error) {
        console.error('❌ Error loading AI suggestions:', error);
      }
    }
  }

  seleccionarSugerencia(sugerencia: any) {
    this.cursoRecomendadoSeleccionado = sugerencia;
    // Convertir a formato SkiPro
    const cursoSkiPro: SkiProCurso = {
      id: sugerencia.curso.id,
      nombre: sugerencia.curso.name,
      descripcion: sugerencia.curso.shortDescription,
      duracion: `${sugerencia.curso.duration} horas`,
      nivel: sugerencia.curso.level.name as any,
      precio: sugerencia.curso.basePrice,
      detalles: sugerencia.curso.features
    };

    const currentState = this.wizardState();
    this.wizardState.set({ ...currentState, cursoSeleccionado: cursoSkiPro });
  }

  seleccionarTipoReserva(tipo: SkiProTipoReserva) {
    const currentState = this.wizardState();
    this.wizardState.set({
      ...currentState,
      tipoReserva: tipo,
      cursoSeleccionado: undefined
    });
  }

  seleccionarCurso(curso: SkiProCurso) {
    const currentState = this.wizardState();
    this.wizardState.set({ ...currentState, cursoSeleccionado: curso });
  }

  aplicarFiltros() {
    let cursos = this.cursosDisponibles();

    if (this.filtroNivel) {
      cursos = cursos.filter(c => c.nivel === this.filtroNivel);
    }

    if (this.filtroPrecionMax > 0) {
      cursos = cursos.filter(c => c.precio <= this.filtroPrecionMax);
    }

    this.cursosFiltrados.set(cursos);
  }

  // Paso 3: Configuración
  seleccionarSlot(slot: OptimalSlot) {
    this.slotSeleccionado = slot;
  }

  cambiarParticipantes(delta: number) {
    const currentConfig = this.configuracion();
    const nuevosParticipantes = Math.max(1, currentConfig.participantes + delta);
    this.configuracion.set({ ...currentConfig, participantes: nuevosParticipantes });
  }

  abrirCalendario() {
    // TODO: Implementar selector de calendario
    console.log('📅 Opening calendar...');
  }

  // Paso 4: Confirmación
  async calcularPricingDinamico() {
    try {
      const pricingData = {
        courseId: this.wizardState().cursoSeleccionado?.id || 1,
        participantCount: this.configuracion().participantes,
        dates: this.configuracion().fechasSeleccionadas,
        clientId: this.getClienteSeleccionado()?.id || 1
      };

      const pricing = await this.mockDataV3.calculateDynamicPricing(pricingData).toPromise();
      this.pricingDinamico.set(pricing);
    } catch (error) {
      console.error('❌ Error calculating pricing:', error);
    }
  }

  getClienteSeleccionado(): SkiProCliente | null {
    if (this.wizardState().cliente) {
      return this.wizardState().cliente!;
    }
    if (this.wizardState().crearNuevoCliente) {
      return {
        id: 0,
        nombre: this.nuevoClienteForm.nombre,
        apellido: this.nuevoClienteForm.apellido,
        iniciales: (this.nuevoClienteForm.nombre[0] + this.nuevoClienteForm.apellido[0]).toUpperCase(),
        email: this.nuevoClienteForm.email,
        telefono: this.nuevoClienteForm.telefono,
        nivel: this.nuevoClienteForm.nivel,
        fechaRegistro: new Date(),
        totalReservas: 0,
        cursosCompletados: 0,
        gastoTotal: 0,
        reservasActivas: [],
        historial: [],
        preferencias: []
      };
    }
    return null;
  }

  getFactoresPricing() {
    const factors = this.pricingDinamico()?.dynamicFactors;
    if (!factors) return [];

    return [
      { name: 'Demanda', value: factors.demandMultiplier },
      { name: 'Temporada', value: factors.seasonalAdjustment },
      { name: 'Clima', value: factors.weatherImpact },
      { name: 'Fidelidad', value: factors.loyaltyDiscount }
    ];
  }

  async confirmarReserva() {
    this.procesandoReserva.set(true);

    try {
      const reservaData = {
        cliente: this.getClienteSeleccionado(),
        tipo: this.wizardState().tipoReserva?.nombre,
        tipoIcon: this.wizardState().tipoReserva?.icon,
        tipoColor: this.wizardState().tipoReserva?.color,
        reserva: {
          nombre: this.wizardState().cursoSeleccionado?.nombre || this.wizardState().tipoReserva?.nombre,
          descripcion: this.wizardState().cursoSeleccionado?.descripcion || this.wizardState().tipoReserva?.descripcion,
          detalles: new Date().toLocaleDateString()
        },
        fechas: {
          inicio: new Date(),
          display: new Date().toLocaleDateString()
        },
        precio: this.pricingDinamico()?.finalPrice || this.wizardState().cursoSeleccionado?.precio || 0
      };

      const result = await this.skipro.crearReserva(reservaData).toPromise();

      if (result?.success) {
        this.reservaCreada.emit(result.reserva);
      }
    } catch (error) {
      console.error('❌ Error creating reserva:', error);
    } finally {
      this.procesandoReserva.set(false);
    }
  }

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '';
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }

  getIconoRazon(factor: string): string {
    const iconos: { [key: string]: string } = {
      'weather': 'wb_sunny',
      'price': 'euro',
      'monitor': 'person',
      'crowd': 'groups',
      'availability': 'event_available'
    };
    return iconos[factor] || 'info';
  }

  // NUEVAS FUNCIONES PARA LOS PASOS EXTENDIDOS

  // Inicializar datos del wizard extendido
  private inicializarDatosExtendidos() {
    // Datos mock para deportes
    this.deportes.set([
      { id: 'esqui', nombre: 'Esquí', icon: '🎿' },
      { id: 'snowboard', nombre: 'Snowboard', icon: '🏂' },
      { id: 'esqui-fondo', nombre: 'Esquí de Fondo', icon: '⛷️' },
      { id: 'raquetas', nombre: 'Raquetas de Nieve', icon: '🥾' }
    ]);
  }

  // Paso 2: Utilizadores
  anadirUtilizador() {
    this.mostrarFormUtilizador = true;
  }

  eliminarUtilizador(index: number) {
    const utilizadoresActuales = this.utilizadores();
    utilizadoresActuales.splice(index, 1);
    this.utilizadores.set([...utilizadoresActuales]);
  }

  guardarNuevoUtilizador() {
    if (this.nuevoUtilizadorForm.nombre && this.nuevoUtilizadorForm.apellido) {
      const nuevoUtilizador = {
        ...this.nuevoUtilizadorForm,
        iniciales: this.nuevoUtilizadorForm.nombre.charAt(0) + this.nuevoUtilizadorForm.apellido.charAt(0),
        id: 'user_' + Date.now()
      };

      this.utilizadores.set([...this.utilizadores(), nuevoUtilizador]);
      this.limpiarFormUtilizador();
      this.mostrarFormUtilizador = false;
    }
  }

  cancelarNuevoUtilizador() {
    this.limpiarFormUtilizador();
    this.mostrarFormUtilizador = false;
  }

  private limpiarFormUtilizador() {
    this.nuevoUtilizadorForm = {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      nivel: 'Principiante',
      fechaNacimiento: ''
    };
  }

  // Paso 3: Deportes y Nivel
  seleccionarDeporte(deporte: any) {
    this.deporteSeleccionado = deporte;
    this.nivelSeleccionado = null; // Reset nivel cuando cambia deporte
  }

  seleccionarNivel(nivel: any) {
    this.nivelSeleccionado = nivel;
  }

  nivelesDisponibles() {
    if (!this.deporteSeleccionado) return [];

    // Niveles mock basados en deporte
    return [
      {
        id: 'principiante',
        nombre: 'Principiante',
        descripcion: 'Para personas que nunca han practicado el deporte',
        color: '#22c55e',
        duracionTipica: '2-3 horas'
      },
      {
        id: 'intermedio',
        nombre: 'Intermedio',
        descripcion: 'Tiene experiencia básica y domina los fundamentos',
        color: '#f59e0b',
        duracionTipica: '3-4 horas'
      },
      {
        id: 'avanzado',
        nombre: 'Avanzado',
        descripcion: 'Domina la técnica y busca perfeccionamiento',
        color: '#ef4444',
        duracionTipica: '4-5 horas'
      }
    ];
  }

  // Actualizar validaciones para los nuevos pasos
  puedeAvanzarPaso(): boolean {
    const state = this.wizardState();

    switch (state.paso) {
      case 1:
        return !!(state.cliente || state.crearNuevoCliente);
      case 2:
        return true; // Utilizadores es opcional
      case 3:
        return !!(this.deporteSeleccionado && this.nivelSeleccionado);
      case 4:
        return !!state.tipoReserva && (state.tipoReserva.id !== 'cursos' || !!state.cursoSeleccionado);
      case 5:
        return this.configuracion().participantes > 0;
      case 6:
        return true; // Observaciones son opcionales
      default:
        return true;
    }
  }

  // Actualizar método puedeAvanzar original
  puedeAvanzar(): boolean {
    return this.puedeAvanzarPaso();
  }

  // Actualizar step descriptions para 6 pasos
  getStepDescription(): string {
    const descriptions = [
      'Paso 1 de 6: Seleccionar Cliente',
      'Paso 2 de 6: Utilizadores',
      'Paso 3 de 6: Deporte y Nivel',
      'Paso 4 de 6: Curso y Fecha',
      'Paso 5 de 6: Detalles y Configuración',
      'Paso 6 de 6: Observaciones y Confirmación'
    ];
    return descriptions[this.wizardState().paso - 1] || '';
  }

  // Actualizar iconos para 6 pasos
  getStepIcon(): string {
    const icons = ['person', 'group', 'sports', 'event', 'settings', 'check'];
    return icons[this.wizardState().paso - 1] || 'help';
  }

  cerrarWizard() {
    this.cerrar.emit();
  }
}
