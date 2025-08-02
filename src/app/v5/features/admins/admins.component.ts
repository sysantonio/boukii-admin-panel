import { Component } from '@angular/core';

@Component({
  selector: 'app-admins',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1><mat-icon>admin_panel_settings</mat-icon>Administradores</h1>
        <p>Gestión de usuarios administradores y permisos</p>
      </div>
      <div class="coming-soon">
        <mat-icon class="icon">construction</mat-icon>
        <h2>Próximamente</h2>
        <p>👥 Gestión de usuarios • 🔐 Control de permisos • 📝 Logs de actividad</p>
        <button mat-raised-button disabled><mat-icon>build</mat-icon>En desarrollo</button>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; background: #f8fafc; min-height: 100vh; }
    .page-header h1 { display: flex; align-items: center; gap: 12px; font-size: 28px; font-weight: 600; color: #1f2937; margin: 0 0 8px; }
    .page-header h1 mat-icon { font-size: 32px; width: 32px; height: 32px; color: #dc2626; }
    .page-header p { font-size: 16px; color: #6b7280; margin: 0 0 32px; }
    .coming-soon { background: white; border-radius: 12px; padding: 48px; text-align: center; max-width: 500px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .coming-soon .icon { font-size: 64px; width: 64px; height: 64px; color: #dc2626; margin-bottom: 24px; }
    .coming-soon h2 { font-size: 24px; font-weight: 600; color: #1f2937; margin: 0 0 16px; }
    .coming-soon p { font-size: 16px; color: #6b7280; margin-bottom: 24px; }
    .coming-soon button mat-icon { margin-right: 8px; }
  `]
})
export class AdminsComponent { }