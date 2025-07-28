import { Component, Input } from '@angular/core';
import { WelcomeBannerData } from '../../interfaces/dashboard.interfaces';

@Component({
  selector: 'app-welcome-banner',
  template: `
    <div class="welcome-banner">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">
            <mat-icon class="welcome-emoji">waving_hand</mat-icon>
            ¡Bienvenido de vuelta, {{ data?.userName }}!
          </h1>
          <p class="welcome-subtitle">
            Tienes {{ data?.newBookingsToday }} nuevas reservas hoy y {{ data?.scheduledCourses }} cursos programados para esta semana.
            El rendimiento de tu escuela ha mejorado un {{ data?.performanceImprovement }}% este mes.
          </p>
        </div>

        <div class="welcome-actions">
          <button mat-raised-button color="primary" class="action-button primary">
            <mat-icon>visibility</mat-icon>
            Ver Reservas
          </button>
          <button mat-raised-button class="action-button secondary">
            <mat-icon>add</mat-icon>
            Nueva Reserva
          </button>
          <button mat-outlined-button class="action-button outline">
            <mat-icon>schedule</mat-icon>
            Planificar
          </button>
        </div>

        <div class="welcome-stats">
          <div class="stat-item">
            <mat-icon class="stat-icon">people</mat-icon>
            <div class="stat-content">
              <span class="stat-value">{{ data?.activeInstructors }}</span>
              <span class="stat-label">monitores activos</span>
            </div>
          </div>
          <div class="stat-item">
            <mat-icon class="stat-icon">person_add</mat-icon>
            <div class="stat-content">
              <span class="stat-value">{{ data?.availableInstructors }}</span>
              <span class="stat-label">disponibles</span>
            </div>
          </div>
          <div class="stat-item">
            <mat-icon class="stat-icon">schedule</mat-icon>
            <div class="stat-content">
              <span class="stat-value">{{ data?.availableHours }}h</span>
              <span class="stat-label">disponibles</span>
            </div>
          </div>
        </div>
      </div>

      <div class="welcome-illustration">
        <div class="illustration-container">
          <mat-icon class="mountain-icon">terrain</mat-icon>
          <div class="ski-trails">
            <div class="trail trail-1"></div>
            <div class="trail trail-2"></div>
            <div class="trail trail-3"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-banner {
      background: var(--boukii-gradient-primary);
      border-radius: var(--boukii-radius-xl);
      padding: 2rem;
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 200px;
      position: relative;
      overflow: hidden;
      box-shadow: var(--boukii-shadow-lg);
    }

    .welcome-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      z-index: 2;
    }

    .welcome-text {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .welcome-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      line-height: 1.2;
    }

    .welcome-emoji {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
      color: #fbbf24;
    }

    .welcome-subtitle {
      font-size: 1rem;
      line-height: 1.5;
      opacity: 0.9;
      margin: 0;
      max-width: 600px;
    }

    .welcome-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .action-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: var(--boukii-radius);
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .action-button.primary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .action-button.primary:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }

    .action-button.secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .action-button.secondary:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .action-button.outline {
      background: transparent;
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.4);
    }

    .action-button.outline:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .welcome-stats {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--boukii-radius);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .stat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
      opacity: 0.8;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .stat-value {
      font-size: 1.125rem;
      font-weight: 600;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.75rem;
      opacity: 0.8;
      line-height: 1;
    }

    .welcome-illustration {
      flex-shrink: 0;
      width: 200px;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .illustration-container {
      position: relative;
      width: 150px;
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mountain-icon {
      font-size: 6rem;
      width: 6rem;
      height: 6rem;
      opacity: 0.3;
      color: white;
    }

    .ski-trails {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }

    .trail {
      position: absolute;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }

    .trail-1 {
      width: 3px;
      height: 60px;
      top: 30px;
      left: 40px;
      transform: rotate(-15deg);
      animation: sparkle 3s infinite ease-in-out;
    }

    .trail-2 {
      width: 3px;
      height: 50px;
      top: 40px;
      right: 35px;
      transform: rotate(20deg);
      animation: sparkle 3s infinite ease-in-out 1s;
    }

    .trail-3 {
      width: 3px;
      height: 45px;
      bottom: 25px;
      left: 50%;
      transform: translateX(-50%) rotate(-5deg);
      animation: sparkle 3s infinite ease-in-out 2s;
    }

    @keyframes sparkle {
      0%, 100% {
        opacity: 0.2;
        transform: scale(1);
      }
      50% {
        opacity: 0.6;
        transform: scale(1.1);
      }
    }

    // Responsivo
    @media (max-width: 768px) {
      .welcome-banner {
        flex-direction: column;
        text-align: center;
        padding: 1.5rem;
        gap: 1.5rem;
      }

      .welcome-title {
        font-size: 1.5rem;
        justify-content: center;
      }

      .welcome-actions {
        justify-content: center;
      }

      .welcome-stats {
        justify-content: center;
        gap: 1rem;
      }

      .welcome-illustration {
        width: 120px;
        height: 120px;
      }

      .illustration-container {
        width: 100px;
        height: 100px;
      }

      .mountain-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
      }
    }

    @media (max-width: 640px) {
      .welcome-banner {
        padding: 1rem;
      }

      .welcome-title {
        font-size: 1.25rem;
      }

      .welcome-subtitle {
        font-size: 0.875rem;
      }

      .action-button {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      }

      .stat-item {
        padding: 0.5rem 0.75rem;
      }

      .stat-value {
        font-size: 1rem;
      }

      .stat-label {
        font-size: 0.625rem;
      }
    }
  `]
})
export class WelcomeBannerComponent {
  @Input() data?: WelcomeBannerData;
}