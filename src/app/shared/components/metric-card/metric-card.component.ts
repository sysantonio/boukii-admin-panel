import { Component, Input } from '@angular/core';
import { MetricCardConfig } from '../../interfaces/dashboard.interfaces';

@Component({
  selector: 'app-metric-card',
  template: `
    <div class="metric-card" [class]="getCardClass()">
      <div class="metric-card-header">
        <div class="metric-icon" [class]="getIconClass()">
          <mat-icon>{{ config.icon }}</mat-icon>
        </div>
        <div class="metric-change" *ngIf="config.change" [class]="getChangeClass()">
          <mat-icon class="change-icon">{{ getChangeIcon() }}</mat-icon>
          {{ config.change }}
        </div>
      </div>
      
      <div class="metric-content">
        <div class="metric-value">{{ config.value }}</div>
        <div class="metric-title">{{ config.title }}</div>
        <div class="metric-subtitle" *ngIf="config.subtitle">{{ config.subtitle }}</div>
      </div>
    </div>
  `,
  styles: [`
    .metric-card {
      background: white;
      border-radius: var(--boukii-radius-lg);
      box-shadow: var(--boukii-shadow);
      border: 1px solid var(--boukii-gray-200);
      transition: all 0.2s ease-in-out;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-height: 140px;
      position: relative;
      overflow: hidden;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--boukii-shadow-lg);
    }

    .metric-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--boukii-radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      
      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .metric-icon.primary {
      background: rgba(99, 102, 241, 0.1);
      color: var(--boukii-primary);
    }

    .metric-icon.secondary {
      background: rgba(59, 130, 246, 0.1);
      color: var(--boukii-secondary);
    }

    .metric-icon.success {
      background: rgba(16, 185, 129, 0.1);
      color: var(--boukii-success);
    }

    .metric-icon.warning {
      background: rgba(245, 158, 11, 0.1);
      color: var(--boukii-warning);
    }

    .metric-icon.danger {
      background: rgba(239, 68, 68, 0.1);
      color: var(--boukii-danger);
    }

    .metric-icon.info {
      background: rgba(6, 182, 212, 0.1);
      color: var(--boukii-info);
    }

    .metric-change {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: var(--boukii-radius);
      font-size: 0.75rem;
      font-weight: 500;
      
      .change-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .metric-change.positive {
      background: rgba(16, 185, 129, 0.1);
      color: var(--boukii-success);
    }

    .metric-change.negative {
      background: rgba(239, 68, 68, 0.1);
      color: var(--boukii-danger);
    }

    .metric-change.neutral {
      background: rgba(107, 114, 128, 0.1);
      color: var(--boukii-gray-600);
    }

    .metric-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      color: var(--boukii-gray-900);
    }

    .metric-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--boukii-gray-600);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-subtitle {
      font-size: 0.75rem;
      color: var(--boukii-gray-500);
    }

    /* Variantes de color para las cards */
    .metric-card.primary {
      border-left: 4px solid var(--boukii-primary);
    }

    .metric-card.secondary {
      border-left: 4px solid var(--boukii-secondary);
    }

    .metric-card.success {
      border-left: 4px solid var(--boukii-success);
    }

    .metric-card.warning {
      border-left: 4px solid var(--boukii-warning);
    }

    .metric-card.danger {
      border-left: 4px solid var(--boukii-danger);
    }

    .metric-card.info {
      border-left: 4px solid var(--boukii-info);
    }

    /* Responsivo */
    @media (max-width: 640px) {
      .metric-card {
        padding: 1rem;
        min-height: 120px;
      }
      
      .metric-value {
        font-size: 1.75rem;
      }
      
      .metric-icon {
        width: 40px;
        height: 40px;
        
        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
    }
  `]
})
export class MetricCardComponent {
  @Input() config!: MetricCardConfig;

  getCardClass(): string {
    return `metric-card ${this.config.color}`;
  }

  getIconClass(): string {
    return `metric-icon ${this.config.color}`;
  }

  getChangeClass(): string {
    if (!this.config.changeType) return '';
    return `metric-change ${this.config.changeType}`;
  }

  getChangeIcon(): string {
    switch (this.config.changeType) {
      case 'positive':
        return 'trending_up';
      case 'negative':
        return 'trending_down';
      case 'neutral':
      default:
        return 'trending_flat';
    }
  }
}