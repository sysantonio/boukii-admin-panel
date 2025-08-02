import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthV5Service } from '../../core/services/auth-v5.service';

interface User {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() menuToggle = new EventEmitter<void>();
  
  private destroy$ = new Subject<void>();

  searchTerm = '';
  darkMode = false;
  
  currentUser: User | null = null;

  notificationCount = 3;
  
  recentNotifications: Notification[] = [
    {
      id: '1',
      title: 'Nueva reserva',
      message: 'María González ha creado una nueva reserva para curso principiante',
      time: 'Hace 5 min',
      read: false,
      type: 'info'
    },
    {
      id: '2', 
      title: 'Pago pendiente',
      message: 'Carlos Ruiz tiene un pago pendiente por €75',
      time: 'Hace 15 min',
      read: false,
      type: 'warning'
    },
    {
      id: '3',
      title: 'Reserva cancelada',
      message: 'Diego López canceló su reserva de curso avanzado',
      time: 'Hace 1 hora',
      read: false,
      type: 'error'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthV5Service
  ) {}

  ngOnInit(): void {
    this.loadUserPreferences();
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          if (user) {
            this.currentUser = {
              name: user.name || `${user.first_name} ${user.last_name}`.trim() || 'Usuario',
              email: user.email || 'no-email@boukii.com',
              role: user.role?.name || user.role_name || 'Usuario',
              avatar: user.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
            };
            
          }
        },
        error: (error) => {
          console.error('Error loading user data in navbar:', error);
          this.currentUser = null;
        }
      });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    // Implement search logic
    console.log('Searching for:', this.searchTerm);
  }

  setLanguage(language: string): void {
    // Implement language switching
    console.log('Setting language to:', language);
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    // Implement dark mode toggle
    if (this.darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  goToProfile(): void {
    this.router.navigate(['/v5/profile']);
  }

  goToNotifications(): void {
    this.router.navigate(['/v5/notifications']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error during logout:', error);
        // Still navigate to login even if there's an error
        this.router.navigate(['/login']);
      }
    });
  }

  private loadUserPreferences(): void {
    // Load user preferences from storage
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      this.darkMode = JSON.parse(savedDarkMode);
      if (this.darkMode) {
        document.body.classList.add('dark-theme');
      }
    }
  }
}