import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Season } from '../../../../core/models/season.interface';
import { SeasonService } from '../../services/season.service';
import { SeasonContextService } from '../../../../core/services/season-context.service';
import { LoadingService } from '../../../../core/services/loading.service';

@Component({
  selector: 'vex-season-list',
  templateUrl: './season-list.component.html',
  styleUrls: ['./season-list.component.scss']
})
export class SeasonListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private seasonService = inject(SeasonService);
  private seasonContext = inject(SeasonContextService);
  private loadingService = inject(LoadingService);
  private dialog = inject(MatDialog);

  dataSource = new MatTableDataSource<Season>([]);
  displayedColumns = ['name', 'start_date', 'end_date', 'status', 'actions'];
  
  stats$ = this.seasonService.getSeasonsStats();
  loading$ = this.loadingService.loading$;
  currentSeasonId$ = this.seasonContext.currentSeason$.pipe(
    map(season => season?.id || null)
  );

  searchTerm = '';
  statusFilter = 'all'; // all, active, closed, historical

  ngOnInit(): void {
    this.loadSeasons();
    this.setupDataSourceFiltering();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSeasons(): void {
    this.seasonService.getSeasons()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (seasons) => {
          this.dataSource.data = seasons;
        },
        error: (error) => {
          console.error('Error loading seasons:', error);
        }
      });
  }

  private setupDataSourceFiltering(): void {
    this.dataSource.filterPredicate = (season: Season, filter: string) => {
      const searchData = `${season.name} ${season.start_date} ${season.end_date}`.toLowerCase();
      const matchesSearch = searchData.includes(this.searchTerm.toLowerCase());
      
      let matchesStatus = true;
      switch (this.statusFilter) {
        case 'active':
          matchesStatus = season.is_active && !season.is_closed;
          break;
        case 'closed':
          matchesStatus = season.is_closed;
          break;
        case 'historical':
          matchesStatus = season.is_historical;
          break;
        default:
          matchesStatus = true;
      }
      
      return matchesSearch && matchesStatus;
    };
  }

  applyFilter(): void {
    this.dataSource.filter = Math.random().toString(); // Trigger filter
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilter();
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.applyFilter();
  }

  openCreateSeasonDialog(): void {
    // TODO: Implement create season dialog
    console.log('Open create season dialog');
  }

  openEditSeasonDialog(season: Season): void {
    // TODO: Implement edit season dialog
    console.log('Edit season:', season);
  }

  openCloneSeasonDialog(season: Season): void {
    // TODO: Implement clone season dialog
    console.log('Clone season:', season);
  }

  closeSeason(season: Season): void {
    if (confirm(`¿Estás seguro de que quieres cerrar la temporada "${season.name}"?`)) {
      this.seasonService.closeSeason(season.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
  }

  deleteSeason(season: Season): void {
    if (confirm(`¿Estás seguro de que quieres eliminar la temporada "${season.name}"?`)) {
      this.seasonService.deleteSeason(season.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
  }

  setCurrentSeason(season: Season): void {
    this.seasonContext.setCurrentSeason(season.id);
  }

  getStatusLabel(season: Season): string {
    if (season.is_historical) return 'Histórica';
    if (season.is_closed) return 'Cerrada';
    if (season.is_active) return 'Activa';
    return 'Inactiva';
  }

  getStatusClass(season: Season): string {
    if (season.is_historical) return 'status-historical';
    if (season.is_closed) return 'status-closed';
    if (season.is_active) return 'status-active';
    return 'status-inactive';
  }
}
