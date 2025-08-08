import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthV5Service, SeasonInfo } from '../../../core/services/auth-v5.service';
import { SeasonService, CreateSeasonRequest } from '../../../features/seasons/services/season.service';
import { Season } from '../../../core/models/season.interface';

@Component({
  selector: 'vex-season-selector',
  templateUrl: './season-selector.component.html',
  styleUrls: ['./season-selector.component.scss']
})
export class SeasonSelectorComponent implements OnInit, OnDestroy {
  @Input() availableSeasons: SeasonInfo[] = [];
  @Input() showAsModal = true;
  @Output() seasonSelected = new EventEmitter<SeasonInfo>();
  @Output() newSeasonCreated = new EventEmitter<SeasonInfo>();
  @Output() cancelled = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  
  isLoading = false;
  showCreateForm = false;
  newSeasonForm: FormGroup;
  recommendedSeason: SeasonInfo | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthV5Service,
    private seasonService: SeasonService,
    private snackBar: MatSnackBar
  ) {
    this.newSeasonForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.findRecommendedSeason();
    this.setDefaultSeasonName();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private findRecommendedSeason(): void {
    const today = new Date();
    this.recommendedSeason = this.availableSeasons.find(season => {
      const startDate = new Date(season.start_date);
      const endDate = new Date(season.end_date);
      return today >= startDate && today <= endDate;
    }) || null;
  }

  private setDefaultSeasonName(): void {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    this.newSeasonForm.patchValue({
      name: `Temporada ${currentYear}-${nextYear}`,
      start_date: `${currentYear}-12-01`,
      end_date: `${nextYear}-04-30`
    });
  }

  selectSeason(season: SeasonInfo): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    console.log('🔄 Selecting season:', season.name);

    this.authService.selectSeason({ season_id: season.id })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Season selected successfully:', response);
          this.snackBar.open(`Temporada "${season.name}" seleccionada`, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.seasonSelected.emit(season);
        },
        error: (error) => {
          console.error('❌ Error selecting season:', error);
          this.isLoading = false;
          
          const errorMessage = error.message || 'Error al seleccionar la temporada';
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  selectRecommendedSeason(): void {
    if (this.recommendedSeason) {
      this.selectSeason(this.recommendedSeason);
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }

  createNewSeason(): void {
    if (this.newSeasonForm.invalid || this.isLoading) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.newSeasonForm.value;
    
    console.log('🔄 Creating new season:', formValue);

    // ✅ Use SeasonService for creation, then AuthV5Service for selection
    const createSeasonRequest: CreateSeasonRequest = {
      name: formValue.name,
      start_date: formValue.start_date,
      end_date: formValue.end_date
    };

    this.seasonService.createSeason(createSeasonRequest)
      .pipe(
        // After creating season, automatically select it
        switchMap((createdSeason: Season) => {
          console.log('✅ Season created successfully:', createdSeason);
          
          // Now use AuthV5Service to select the newly created season
          return this.authService.selectSeason({
            season_id: createdSeason.id
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          console.log('✅ New season created and selected successfully:', response);
          
          this.snackBar.open(`Temporada "${formValue.name}" creada y seleccionada`, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          const newSeason: SeasonInfo = {
            id: response.season?.id || 0,
            name: formValue.name,
            start_date: formValue.start_date,
            end_date: formValue.end_date,
            is_active: true,
            is_current: true
          };

          this.newSeasonCreated.emit(newSeason);
        },
        error: (error) => {
          console.error('❌ Error creating or selecting season:', error);
          this.isLoading = false;
          
          const errorMessage = error.message || 'Error al crear la temporada';
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  cancel(): void {
    this.cancelled.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.newSeasonForm.controls).forEach(key => {
      const control = this.newSeasonForm.get(key);
      control?.markAsTouched();
    });
  }

  getFormFieldError(fieldName: string): string {
    const control = this.newSeasonForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName} es requerido`;
    }
    if (control?.hasError('minlength')) {
      return `${fieldName} debe tener al menos 3 caracteres`;
    }
    return '';
  }
}
