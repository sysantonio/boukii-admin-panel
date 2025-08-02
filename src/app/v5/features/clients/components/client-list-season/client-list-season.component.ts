import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, startWith, map, tap, finalize, catchError } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';

// V5 Core Services
import { SeasonContextService } from '../../../../core/services/season-context.service';
import { LoggingService } from '../../../../core/services/logging.service';
import { NotificationService } from '../../../../core/services/notification.service';

// V5 Client Services
import { ClientService } from '../../services/client.service';

// Interfaces
import { Season } from '../../../../core/models/season.interface';
import {
  Client,
  ClientSearchCriteria,
  ClientStats,
  ClientSortField,
  ClientStatus,
  ClientType,
  LoyaltyLevel
} from '../../models/client.interface';

// Components
import { ClientFormComponent } from '../client-form/client-form.component';

export interface ClientListResponse {
  data: Client[];
  meta: {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  filters: {
    cities: string[];
    provinces: string[];
    countries: string[];
    loyalty_levels: LoyaltyLevel[];
    client_types: ClientType[];
    statuses: ClientStatus[];
  };
  stats: ClientStats;
}

@Component({
  selector: 'app-client-list-season',
  templateUrl: './client-list-season.component.html',
  styleUrls: ['./client-list-season.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ClientListSeasonComponent implements OnInit, OnDestroy {

  // ==================== VIEW CHILD ELEMENTS ====================

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // ==================== COMPONENT STATE ====================

  // Data Sources
  public dataSource = new MatTableDataSource<Client>([]);
  public currentSeason$: Observable<Season | null>;
  public clients$ = new BehaviorSubject<Client[]>([]);
  public loading$ = new BehaviorSubject<boolean>(false);
  public stats$ = new BehaviorSubject<ClientStats | null>(null);

  // Filter Form
  public filterForm!: FormGroup;
  public showAdvancedFilters = false;
  public availableFilters: any = {};

  // Table Configuration
  public displayedColumns: string[] = [
    'select',
    'avatar',
    'name',
    'email',
    'phone',
    'city',
    'status',
    'client_type',
    'loyalty_level',
    'total_bookings',
    'total_spent',
    'last_booking',
    'created_at',
    'actions'
  ];

  // Pagination
  public pageSize = 25;
  public pageSizeOptions = [10, 25, 50, 100];
  public totalItems = 0;
  public currentPage = 0;

  // Sorting
  public sortBy: ClientSortField = 'created_at';
  public sortOrder: 'asc' | 'desc' = 'desc';

  // Selection
  public selectedClients = new Set<number>();
  public selectAll = false;

  // Search
  private searchSubject = new Subject<string>();
  public searchQuery = '';

  // Filter Options
  public statusOptions: { value: ClientStatus; label: string }[] = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'suspended', label: 'Suspendido' },
    { value: 'blacklisted', label: 'Lista Negra' },
    { value: 'pending_verification', label: 'Pendiente Verificación' }
  ];

  public clientTypeOptions: { value: ClientType; label: string }[] = [
    { value: 'individual', label: 'Individual' },
    { value: 'family', label: 'Familia' },
    { value: 'group', label: 'Grupo' },
    { value: 'corporate', label: 'Corporativo' },
    { value: 'school', label: 'Escuela' },
    { value: 'club', label: 'Club' }
  ];

  public loyaltyLevelOptions: { value: LoyaltyLevel; label: string }[] = [
    { value: 'bronze', label: 'Bronce' },
    { value: 'silver', label: 'Plata' },
    { value: 'gold', label: 'Oro' },
    { value: 'platinum', label: 'Platino' },
    { value: 'diamond', label: 'Diamante' }
  ];

  private destroy$ = new Subject<void>();

  // ==================== CONSTRUCTOR & LIFECYCLE ====================

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private seasonContext: SeasonContextService,
    private clientService: ClientService,
    private logger: LoggingService,
    private notification: NotificationService
  ) {
    this.initializeFilterForm();
    this.initializeObservables();
  }

  ngOnInit(): void {
    this.logger.info('ClientListSeasonComponent initialized');

    this.setupSearchSubscription();
    this.setupFilterSubscriptions();
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALIZATION ====================

  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      status: [[]],
      client_type: [[]],
      loyalty_level: [[]],
      city: [''],
      province: [''],
      country: [''],
      age_from: [''],
      age_to: [''],
      total_spent_from: [''],
      total_spent_to: [''],
      registration_from: [''],
      registration_to: [''],
      last_booking_from: [''],
      last_booking_to: [''],
      has_upcoming_bookings: [false],
      has_outstanding_balance: [false],
      vip_only: [false],
      with_email: [false],
      with_phone: [false],
      with_emergency_contact: [false]
    });
  }

  private initializeObservables(): void {
    this.currentSeason$ = this.seasonContext.currentSeason$;
  }

  private setupSearchSubscription(): void {
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.filterForm.patchValue({ search: query });
      this.loadClients();
    });
  }

  private setupFilterSubscriptions(): void {
    this.filterForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadClients();
    });
  }

  // ==================== DATA LOADING ====================

  public loadClients(): void {
    this.loading$.next(true);

    const params = this.buildSearchParams();

    this.logger.debug('Loading clients with params', params);

    this.clientService.getClients(params).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading$.next(false)),
      catchError(error => {
        this.logger.error('Error loading clients', error);
        this.notification.showError('Error al cargar los clientes');
        throw error;
      })
    ).subscribe((response: any) => {
      this.handleClientsResponse(response);
    });
  }

  private buildSearchParams(): any {
    const formValue = this.filterForm.value;

    return {
      page: this.currentPage + 1,
      page_size: this.pageSize,
      sort_by: this.sortBy,
      sort_order: this.sortOrder,
      ...formValue,
      // Convert arrays to proper format
      status: Array.isArray(formValue.status) ? formValue.status : [],
      client_type: Array.isArray(formValue.client_type) ? formValue.client_type : [],
      loyalty_level: Array.isArray(formValue.loyalty_level) ? formValue.loyalty_level : []
    };
  }

  private handleClientsResponse(response: ClientListResponse): void {
    this.dataSource.data = response.data;
    this.clients$.next(response.data);
    this.totalItems = response.meta.total_items;
    this.availableFilters = response.filters;
    this.stats$.next(response.stats);

    this.logger.info('Clients loaded successfully', {
      count: response.data.length,
      total: response.meta.total_items,
      page: response.meta.current_page
    });
  }

  // ==================== SEARCH & FILTERS ====================

  public onSearchChange(query: any): void {
    this.searchSubject.next(query.value);
  }

  public clearSearch(): void {
    this.searchQuery = '';
    this.filterForm.patchValue({ search: '' });
    this.searchSubject.next('');
  }

  public toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  public clearFilters(): void {
    this.filterForm.reset({
      search: '',
      status: [],
      client_type: [],
      loyalty_level: [],
      city: '',
      province: '',
      country: '',
      age_from: '',
      age_to: '',
      total_spent_from: '',
      total_spent_to: '',
      registration_from: '',
      registration_to: '',
      last_booking_from: '',
      last_booking_to: '',
      has_upcoming_bookings: false,
      has_outstanding_balance: false,
      vip_only: false,
      with_email: false,
      with_phone: false,
      with_emergency_contact: false
    });
    this.searchQuery = '';
    this.currentPage = 0;
    this.loadClients();
  }

  public applyQuickFilter(filterType: string, value: any): void {
    switch (filterType) {
      case 'status':
        this.filterForm.patchValue({ status: [value] });
        break;
      case 'vip':
        this.filterForm.patchValue({ vip_only: true });
        break;
      case 'new_clients':
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        this.filterForm.patchValue({ registration_from: oneMonthAgo.toISOString().split('T')[0] });
        break;
      case 'with_bookings':
        this.filterForm.patchValue({ has_upcoming_bookings: true });
        break;
    }
  }

  // ==================== TABLE OPERATIONS ====================

  public onSortChange(sort: Sort): void {
    this.sortBy = (sort.active as ClientSortField) || 'created_at';
    this.sortOrder = sort.direction as 'asc' | 'desc' || 'desc';
    this.loadClients();
  }

  public onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadClients();
  }

  // ==================== SELECTION ====================

  public toggleSelectAll(): void {
    if (this.selectAll) {
      this.selectedClients.clear();
    } else {
      this.dataSource.data.forEach(client => {
        this.selectedClients.add(client.id);
      });
    }
    this.selectAll = !this.selectAll;
  }

  public toggleClientSelection(clientId: number): void {
    if (this.selectedClients.has(clientId)) {
      this.selectedClients.delete(clientId);
    } else {
      this.selectedClients.add(clientId);
    }
    this.selectAll = this.selectedClients.size === this.dataSource.data.length;
  }

  public isClientSelected(clientId: number): boolean {
    return this.selectedClients.has(clientId);
  }

  public getSelectedCount(): number {
    return this.selectedClients.size;
  }

  public clearSelection(): void {
    this.selectedClients.clear();
    this.selectAll = false;
  }

  // ==================== CLIENT ACTIONS ====================

  public createClient(): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '1200px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { mode: 'create' },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClients();
        this.notification.showSuccess('Cliente creado exitosamente');
      }
    });
  }

  public viewClient(client: Client): void {
    this.router.navigate(['/v5/clients', client.id]);
  }

  public editClient(client: Client): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '1200px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        mode: 'edit',
        clientId: client.id,
        client: client
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClients();
        this.notification.showSuccess('Cliente actualizado exitosamente');
      }
    });
  }

  public deleteClient(client: Client): void {
    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar al cliente ${client.first_name} ${client.last_name}?`);

    if (confirmDelete) {
      this.clientService.deleteClient(client.id).pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.logger.error('Error deleting client', error);
          this.notification.showError('Error al eliminar el cliente');
          throw error;
        })
      ).subscribe(() => {
        this.loadClients();
        this.notification.showSuccess('Cliente eliminado exitosamente');
      });
    }
  }

  public viewClientBookings(client: Client): void {
    this.router.navigate(['/v5/bookings'], {
      queryParams: { client_id: client.id }
    });
  }

  // ==================== BULK ACTIONS ====================

  public bulkDeleteSelected(): void {
    if (this.selectedClients.size === 0) {
      this.notification.showWarning('Selecciona al menos un cliente');
      return;
    }

    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar ${this.selectedClients.size} cliente(s)?`);

    if (confirmDelete) {
      // Implementation for bulk delete would go here
      this.notification.showInfo('Funcionalidad de eliminación masiva pendiente de implementación');
    }
  }

  public bulkExportSelected(): void {
    if (this.selectedClients.size === 0) {
      this.notification.showWarning('Selecciona al menos un cliente');
      return;
    }

    const selectedIds = Array.from(this.selectedClients);

    this.clientService.exportClients(selectedIds).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.logger.error('Error exporting clients', error);
        this.notification.showError('Error al exportar los clientes');
        throw error;
      })
    ).subscribe(blob => {
      // Handle file download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      this.notification.showSuccess('Clientes exportados exitosamente');
    });
  }

  // ==================== UTILITY METHODS ====================

  public getClientFullName(client: Client): string {
    return `${client.first_name} ${client.last_name}`;
  }

  public getClientStatusLabel(status: ClientStatus): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option?.label || status;
  }

  public getClientTypeLabel(type: ClientType): string {
    const option = this.clientTypeOptions.find(opt => opt.value === type);
    return option?.label || type;
  }

  public getLoyaltyLevelLabel(level: LoyaltyLevel): string {
    const option = this.loyaltyLevelOptions.find(opt => opt.value === level);
    return option?.label || level;
  }

  public formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  public formatDate(date: Date | string): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES');
  }

  public getStatusColor(status: any): string {
    const colors = {
      active: 'success',
      inactive: 'warn',
      suspended: 'accent',
      blacklisted: 'error',
      pending_verification: 'info'
    };
    return colors[status] || 'default';
  }

  public getLoyaltyColor(level: LoyaltyLevel): string {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF'
    };
    return colors[level] || '#666';
  }

  public refreshData(): void {
    this.loadClients();
  }

  public trackByClientId(index: number, client: Client): number {
    return client.id;
  }
}
