import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-insufficient-permissions',
  templateUrl: './insufficient-permissions.component.html',
  styleUrls: ['./insufficient-permissions.component.scss']
})
export class InsufficientPermissionsComponent {
  @Input() title = 'Permisos Insuficientes';  
  @Input() message = 'No tienes permisos para acceder a esta sección.';
  @Input() suggestion = 'Contacta con tu administrador para obtener los permisos necesarios.';
  @Input() showBackButton = true;
  @Input() backRoute = '/v5/welcome';
  @Input() showContactSupport = true;

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate([this.backRoute]);
  }

  contactSupport(): void {
    // Implement support contact functionality
    console.log('Contacting support...');
    // Could open email client, support modal, or navigate to support page
    window.open('mailto:support@boukii.com?subject=Solicitud de Permisos&body=Necesito acceso a funcionalidades adicionales.', '_blank');
  }
}