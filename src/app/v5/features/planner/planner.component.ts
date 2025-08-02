import { Component } from '@angular/core';

@Component({
  selector: 'app-planner',
  template: `
    <div class="planner-container">
      <div class="page-header">
        <h1 class="page-title">
          <mat-icon>calendar_today</mat-icon>
          Planificador
        </h1>
        <p class="page-subtitle">Gestiona horarios, disponibilidad y asignaciones</p>
      </div>
      
      <div class="coming-soon-card">
        <div class="coming-soon-content">
          <mat-icon class="coming-soon-icon">schedule</mat-icon>
          <h2>Próximamente</h2>
          <p>El módulo de planificador estará disponible pronto con las siguientes funcionalidades:</p>
          
          <ul class="features-list">
            <li>📅 Vista de calendario semanal y mensual</li>
            <li>👥 Asignación de monitores a cursos</li>
            <li>🏂 Gestión de disponibilidad de pistas</li>
            <li>⚡ Drag & drop para reorganizar horarios</li>
            <li>🔔 Notificaciones de conflictos</li>
            <li>📊 Vista de ocupación en tiempo real</li>
          </ul>
          
          <button mat-raised-button color="primary" disabled>
            <mat-icon>construction</mat-icon>
            En desarrollo
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./planner.component.scss']
})
export class PlannerComponent { }