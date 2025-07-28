import { Component, Input } from '@angular/core';
import { WeatherData } from '../../interfaces/dashboard.interfaces';

@Component({
  selector: 'app-weather-widget',
  template: `
    <div class="weather-widget">
      <div class="weather-header">
        <h3 class="weather-title">Condiciones Meteorológicas</h3>
        <div class="weather-time" *ngIf="data?.time">
          Hoy, {{ data.time }}
        </div>
      </div>

      <div class="weather-grid">
        <!-- Temperatura -->
        <div class="weather-card temperature">
          <div class="weather-card-header">
            <mat-icon class="weather-icon">thermostat</mat-icon>
            <span class="weather-label">Temperatura</span>
          </div>
          <div class="weather-value">{{ data?.temperature }}°C</div>
          <div class="weather-sub">Sensación: {{ data?.sensation }}°C</div>
        </div>

        <!-- Viento -->
        <div class="weather-card wind">
          <div class="weather-card-header">
            <mat-icon class="weather-icon">air</mat-icon>
            <span class="weather-label">Viento</span>
          </div>
          <div class="weather-value">{{ data?.wind?.speed }} km/h</div>
          <div class="weather-sub">{{ data?.wind?.direction }}</div>
        </div>

        <!-- Visibilidad -->
        <div class="weather-card visibility">
          <div class="weather-card-header">
            <mat-icon class="weather-icon">visibility</mat-icon>
            <span class="weather-label">Visibilidad</span>
          </div>
          <div class="weather-value">{{ data?.visibility?.distance }} km</div>
          <div class="weather-sub">{{ data?.visibility?.quality }}</div>
        </div>

        <!-- Nieve -->
        <div class="weather-card snow">
          <div class="weather-card-header">
            <mat-icon class="weather-icon">ac_unit</mat-icon>
            <span class="weather-label">Nieve</span>
          </div>
          <div class="weather-value">{{ data?.snow?.depth }} cm</div>
          <div class="weather-sub">{{ data?.snow?.quality }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .weather-widget {
      background: var(--boukii-gradient-primary);
      border-radius: var(--boukii-radius-xl);
      padding: 1.5rem;
      color: white;
      box-shadow: var(--boukii-shadow-lg);
    }

    .weather-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .weather-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      color: white;
    }

    .weather-time {
      font-size: 0.875rem;
      opacity: 0.8;
      color: white;
    }

    .weather-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
    }

    .weather-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--boukii-radius-lg);
      padding: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      transition: all 0.2s ease;
    }

    .weather-card:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }

    .weather-card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .weather-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
      opacity: 0.9;
    }

    .weather-label {
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.9;
    }

    .weather-value {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.25rem;
      color: white;
    }

    .weather-sub {
      font-size: 0.75rem;
      opacity: 0.8;
      color: white;
    }

    /* Iconos específicos con colores */
    .temperature .weather-icon {
      color: #fbbf24; /* Amarillo para temperatura */
    }

    .wind .weather-icon {
      color: #60a5fa; /* Azul claro para viento */
    }

    .visibility .weather-icon {
      color: #34d399; /* Verde para visibilidad */
    }

    .snow .weather-icon {
      color: #e0e7ff; /* Blanco azulado para nieve */
    }

    /* Estados de temperatura */
    .weather-card.temperature .weather-value {
      color: #fbbf24;
    }

    .weather-card.wind .weather-value {
      color: #60a5fa;
    }

    .weather-card.visibility .weather-value {
      color: #34d399;
    }

    .weather-card.snow .weather-value {
      color: #e0e7ff;
    }

    /* Responsivo */
    @media (max-width: 768px) {
      .weather-widget {
        padding: 1rem;
      }

      .weather-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }

      .weather-card {
        padding: 0.75rem;
      }

      .weather-value {
        font-size: 1.25rem;
      }

      .weather-title {
        font-size: 1.125rem;
      }
    }

    @media (max-width: 480px) {
      .weather-grid {
        grid-template-columns: 1fr;
      }

      .weather-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
        margin-bottom: 1rem;
      }
    }

    /* Animaciones sutiles */
    @keyframes shimmer {
      0% {
        background-position: -200px 0;
      }
      100% {
        background-position: calc(200px + 100%) 0;
      }
    }

    .weather-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
      );
      transition: left 0.5s;
    }

    .weather-card:hover::before {
      left: 100%;
    }
  `]
})
export class WeatherWidgetComponent {
  @Input() data?: WeatherData;
}