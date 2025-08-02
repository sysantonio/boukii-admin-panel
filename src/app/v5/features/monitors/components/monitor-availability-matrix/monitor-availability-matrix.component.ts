import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, BehaviorSubject, Subject, combineLatest } from 'rxjs';
import {
  map,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  startWith,
  switchMap
} from 'rxjs/operators';

// V5 Core Services
import { SeasonContextService } from '../../../../core/services/season-context.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { LoggingService } from '../../../../core/services/logging.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

// Monitor Services
import { MonitorSeasonService } from '../../services/monitor-season.service';
import {MonitorAvailabilityService, RealTimeMonitorStatus} from '../../services/monitor-availability.service';

// Interfaces
import {
  Monitor,
  AvailableTimeSlot,
  MonitorAvailability,
  TimeSlotStatus,
  // RealTimeMonitorStatus, // Commented out until implemented
  WeeklySchedule,
  DailySchedule
} from '../../models/monitor.interface';
import { Season } from '../../../../core/models/season.interface';

export interface AvailabilityMatrixCell {
  monitor_id: number;
  monitor_name: string;
  date: Date;
  time_slot: string;
  status: TimeSlotStatus;
  booking_id?: number;
  course_name?: string;
  participant_count?: number;
  location_name?: string;
  hourly_rate?: number;
  is_preferred_time: boolean;
  has_conflict: boolean;
  travel_time_minutes?: number;
}

export interface MatrixTimeSlot {
  start_time: string;
  end_time: string;
  display_time: string;
}

export interface MatrixViewOptions {
  date_range_days: number;
  start_date: Date;
  time_slot_duration_minutes: number;
  start_hour: number;
  end_hour: number;
  show_unavailable: boolean;
  show_travel_time: boolean;
  show_hourly_rates: boolean;
  group_by_location: boolean;
  highlight_conflicts: boolean;
}

@Component({
  selector: 'app-monitor-availability-matrix',
  templateUrl: './monitor-availability-matrix.component.html',
  styleUrls: ['./monitor-availability-matrix.component.scss']
})
export class MonitorAvailabilityMatrixComponent implements OnInit, OnDestroy {
  @Input() selectedMonitors: Monitor[] = [];
  @Input() selectedDate: Date = new Date();
  @Input() selectedCourseGroupId?: number;
  @Input() selectedLocationId?: number;
  @Input() autoRefresh: boolean = true;
  @Input() editable: boolean = true;

  @Output() slotClick = new EventEmitter<AvailabilityMatrixCell>();
  @Output() slotDoubleClick = new EventEmitter<AvailabilityMatrixCell>();
  @Output() monitorScheduled = new EventEmitter<{ monitor_id: number; slot: AvailableTimeSlot }>();
  @Output() conflictDetected = new EventEmitter<AvailabilityMatrixCell[]>();

  // Observables
  public currentSeason$: Observable<Season | null>;
  public realTimeStatus$: Observable<Map<number, RealTimeMonitorStatus>>;

  // Form and UI State
  public filtersForm!: FormGroup;
  public viewOptionsForm!: FormGroup;

  private destroy$ = new Subject<void>();
  private refreshSubject = new BehaviorSubject<void>(undefined);

  // Matrix Data
  public now: Date = new Date();
  public availabilityMatrix: AvailabilityMatrixCell[][] = [];
  public timeSlots: MatrixTimeSlot[] = [];
  public dateHeaders: Date[] = [];
  public monitors: Monitor[] = [];
  public isLoading = false;
  public hasConflicts = false;

  // View Configuration
  public defaultViewOptions: MatrixViewOptions = {
    date_range_days: 7,
    start_date: new Date(),
    time_slot_duration_minutes: 60,
    start_hour: 8,
    end_hour: 20,
    show_unavailable: true,
    show_travel_time: true,
    show_hourly_rates: false,
    group_by_location: false,
    highlight_conflicts: true
  };

  public currentViewOptions: MatrixViewOptions = { ...this.defaultViewOptions };

  // Status Colors and Icons
  public statusConfig = {
    available: { color: '#4CAF50', icon: 'check_circle', label: 'Available' },
    booked: { color: '#2196F3', icon: 'event', label: 'Booked' },
    blocked: { color: '#FF9800', icon: 'block', label: 'Blocked' },
    maintenance: { color: '#9E9E9E', icon: 'build', label: 'Maintenance' },
    travel_time: { color: '#673AB7', icon: 'directions_car', label: 'Travel Time' }
  };

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private monitorSeasonService: MonitorSeasonService,
    private monitorAvailabilityService: MonitorAvailabilityService,
    private seasonContext: SeasonContextService,
    private i18n: I18nService,
    private logger: LoggingService,
    private errorHandler: ErrorHandlerService
  ) {
    this.initializeObservables();
    this.initializeForms();
  }

  ngOnInit(): void {
    this.logger.info('Monitor availability matrix component initialized');
    this.setupAutoRefresh();
    this.setupFormSubscriptions();
    this.loadAvailabilityMatrix();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== INITIALIZATION ====================

  private initializeObservables(): void {
    this.currentSeason$ = this.seasonContext.currentSeason$;
    this.realTimeStatus$ = this.monitorAvailabilityService.realTimeStatus$;
  }

  private initializeForms(): void {
    this.filtersForm = this.fb.group({
      date_from: [this.selectedDate],
      date_to: [this.addDays(this.selectedDate, this.defaultViewOptions.date_range_days - 1)],
      course_group_id: [this.selectedCourseGroupId],
      location_id: [this.selectedLocationId],
      min_rating: [''],
      show_only_available: [false]
    });

    this.viewOptionsForm = this.fb.group({
      date_range_days: [this.defaultViewOptions.date_range_days],
      time_slot_duration_minutes: [this.defaultViewOptions.time_slot_duration_minutes],
      start_hour: [this.defaultViewOptions.start_hour],
      end_hour: [this.defaultViewOptions.end_hour],
      show_unavailable: [this.defaultViewOptions.show_unavailable],
      show_travel_time: [this.defaultViewOptions.show_travel_time],
      show_hourly_rates: [this.defaultViewOptions.show_hourly_rates],
      group_by_location: [this.defaultViewOptions.group_by_location],
      highlight_conflicts: [this.defaultViewOptions.highlight_conflicts]
    });
  }

  private setupAutoRefresh(): void {
    if (this.autoRefresh) {
      // Start monitoring selected monitors for real-time updates
      this.selectedMonitors.forEach(monitor => {
        this.monitorAvailabilityService.startMonitoringMonitor(monitor.id);
      });

      // Refresh matrix when real-time status changes
      this.realTimeStatus$.pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.updateMatrixWithRealTimeData();
      });
    }
  }

  private setupFormSubscriptions(): void {
    // React to filter changes
    this.filtersForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadAvailabilityMatrix();
    });

    // React to view option changes
    this.viewOptionsForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((options) => {
      this.currentViewOptions = { ...this.currentViewOptions, ...options };
      this.regenerateMatrix();
    });
  }

  // ==================== DATA LOADING ====================

  private async loadAvailabilityMatrix(): Promise<void> {
    if (this.selectedMonitors.length === 0) {
      this.availabilityMatrix = [];
      return;
    }

    this.isLoading = true;

    try {
      const filters = this.filtersForm.value;
      const dateFrom = filters.date_from || this.selectedDate;
      const dateTo = filters.date_to || this.addDays(this.selectedDate, this.currentViewOptions.date_range_days - 1);

      // Get bulk availability for all selected monitors
      const monitorIds = this.selectedMonitors.map(m => m.id);
      const availabilityMap = await this.monitorAvailabilityService.getBulkAvailability(
        monitorIds,
        dateFrom,
        dateTo
      );

      // Generate time slots based on view options
      this.generateTimeSlots();
      this.generateDateHeaders(dateFrom, dateTo);

      // Build the matrix
      this.buildAvailabilityMatrix(availabilityMap);

      // Check for conflicts
      this.detectConflicts();

      this.logger.info('Availability matrix loaded', {
        monitorCount: this.selectedMonitors.length,
        dateRange: { from: dateFrom, to: dateTo },
        matrixSize: this.availabilityMatrix.length
      });

    } catch (error) {
      this.logger.error('Failed to load availability matrix', { error });
      this.errorHandler.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private generateTimeSlots(): void {
    this.timeSlots = [];
    const { start_hour, end_hour, time_slot_duration_minutes } = this.currentViewOptions;

    for (let hour = start_hour; hour < end_hour; hour += time_slot_duration_minutes / 60) {
      const startTime = this.formatHour(hour);
      const endTime = this.formatHour(hour + time_slot_duration_minutes / 60);

      this.timeSlots.push({
        start_time: startTime,
        end_time: endTime,
        display_time: `${startTime}-${endTime}`
      });
    }
  }

  private generateDateHeaders(dateFrom: Date, dateTo: Date): void {
    this.dateHeaders = [];
    const currentDate = new Date(dateFrom);

    while (currentDate <= dateTo) {
      this.dateHeaders.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  private buildAvailabilityMatrix(availabilityMap: Map<number, AvailableTimeSlot[]>): void {
    this.availabilityMatrix = [];

    for (const monitor of this.selectedMonitors) {
      const monitorSlots = availabilityMap.get(monitor.id) || [];
      const monitorRow: AvailabilityMatrixCell[] = [];

      for (const date of this.dateHeaders) {
        for (const timeSlot of this.timeSlots) {
          const cell = this.createMatrixCell(monitor, date, timeSlot, monitorSlots);
          monitorRow.push(cell);
        }
      }

      this.availabilityMatrix.push(monitorRow);
    }
  }

  private createMatrixCell(
    monitor: Monitor,
    date: Date,
    timeSlot: MatrixTimeSlot,
    availableSlots: AvailableTimeSlot[]
  ): AvailabilityMatrixCell {
    // Find matching slot for this date and time
    const matchingSlot = availableSlots.find(slot =>
      this.isSameDate(new Date(slot.date), date) &&
      slot.start_time === timeSlot.start_time &&
      slot.end_time === timeSlot.end_time
    );

    const cell: AvailabilityMatrixCell = {
      monitor_id: monitor.id,
      monitor_name: monitor.full_name,
      date,
      time_slot: timeSlot.display_time,
      status: matchingSlot ? matchingSlot.status : 'available',
      booking_id: matchingSlot?.booking_id,
      course_name: matchingSlot?.course_id ? 'Course Name' : undefined, // Would be populated from booking data
      participant_count: matchingSlot?.participants_count,
      location_name: matchingSlot?.location_id ? 'Location Name' : undefined, // Would be populated from location data
      hourly_rate: this.calculateHourlyRate(monitor, timeSlot, date),
      is_preferred_time: this.isPreferredTime(monitor, timeSlot, date),
      has_conflict: false, // Will be set in detectConflicts()
      travel_time_minutes: matchingSlot?.travel_time_minutes
    };

    return cell;
  }

  private updateMatrixWithRealTimeData(): void {
    // const statusMap = this.monitorAvailabilityService.realTimeStatus$.value; // Commented out until implemented
    const statusMap = new Map(); // Temporary placeholder

    for (let row = 0; row < this.availabilityMatrix.length; row++) {
      const monitor = this.selectedMonitors[row];
      const realTimeStatus = statusMap.get(monitor.id);

      if (realTimeStatus) {
        // Update current status for relevant cells
        for (let col = 0; col < this.availabilityMatrix[row].length; col++) {
          const cell = this.availabilityMatrix[row][col];

          // Update status if this is the current time slot
          if (this.isCurrentTimeSlot(cell.date, cell.time_slot)) {
            cell.status = realTimeStatus.current_status;
            cell.booking_id = realTimeStatus.current_booking_id;
          }
        }
      }
    }

    // Re-detect conflicts after real-time update
    this.detectConflicts();
  }

  // ==================== CONFLICT DETECTION ====================

  private detectConflicts(): void {
    const conflictCells: AvailabilityMatrixCell[] = [];

    for (const row of this.availabilityMatrix) {
      for (const cell of row) {
        cell.has_conflict = false;

        // Check for double bookings
        if (this.hasDoubleBooking(cell)) {
          cell.has_conflict = true;
          conflictCells.push(cell);
        }

        // Check for travel time conflicts
        if (this.hasTravelTimeConflict(cell)) {
          cell.has_conflict = true;
          conflictCells.push(cell);
        }

        // Check for maximum hours exceeded
        if (this.exceedsMaxHours(cell)) {
          cell.has_conflict = true;
          conflictCells.push(cell);
        }
      }
    }

    this.hasConflicts = conflictCells.length > 0;

    if (this.hasConflicts) {
      this.conflictDetected.emit(conflictCells);
      this.logger.warn('Scheduling conflicts detected', { conflictCount: conflictCells.length });
    }
  }

  private hasDoubleBooking(cell: AvailabilityMatrixCell): boolean {
    // Check if monitor has multiple bookings at the same time
    const sameTimeSlots = this.availabilityMatrix
      .flat()
      .filter(c =>
        c.monitor_id === cell.monitor_id &&
        this.isSameDate(c.date, cell.date) &&
        c.time_slot === cell.time_slot &&
        c.status === 'booked'
      );

    return sameTimeSlots.length > 1;
  }

  private hasTravelTimeConflict(cell: AvailabilityMatrixCell): boolean {
    if (!cell.travel_time_minutes || cell.status !== 'booked') {
      return false;
    }

    // Check if previous or next slot allows enough travel time
    // Implementation would check adjacent bookings and locations
    return false; // Simplified for now
  }

  private exceedsMaxHours(cell: AvailabilityMatrixCell): boolean {
    if (cell.status !== 'booked') {
      return false;
    }

    // Check if monitor exceeds daily/weekly hour limits
    const monitor = this.selectedMonitors.find(m => m.id === cell.monitor_id);
    if (!monitor?.availability) {
      return false;
    }

    // Count booked hours for the day
    const dayBookings = this.availabilityMatrix
      .flat()
      .filter(c =>
        c.monitor_id === cell.monitor_id &&
        this.isSameDate(c.date, cell.date) &&
        c.status === 'booked'
      );

    const totalHours = dayBookings.length * (this.currentViewOptions.time_slot_duration_minutes / 60);
    return totalHours > monitor.availability.max_hours_per_day;
  }

  // ==================== USER INTERACTIONS ====================

  onCellClick(cell: AvailabilityMatrixCell): void {
    this.slotClick.emit(cell);
    this.logger.debug('Matrix cell clicked', { cell });
  }

  onCellDoubleClick(cell: AvailabilityMatrixCell): void {
    this.slotDoubleClick.emit(cell);

    if (this.editable && cell.status === 'available') {
      this.openSchedulingDialog(cell);
    }
  }

  async onBlockTimeSlot(cell: AvailabilityMatrixCell): Promise<void> {
    if (!this.editable || cell.status !== 'available') {
      return;
    }

    try {
      const timeRange = this.parseTimeSlot(cell.time_slot);
      await this.monitorAvailabilityService.blockTimeSlot(
        cell.monitor_id,
        cell.date,
        timeRange.start_time,
        timeRange.end_time,
        'Manually blocked via availability matrix'
      );

      this.snackBar.open(
        this.i18n.translateSync('monitor.time_slot_blocked'),
        'Close',
        { duration: 3000 }
      );

      this.loadAvailabilityMatrix();

    } catch (error) {
      this.logger.error('Failed to block time slot', { cell, error });
    }
  }

  async onUnblockTimeSlot(cell: AvailabilityMatrixCell): Promise<void> {
    if (!this.editable || cell.status !== 'blocked') {
      return;
    }

    // Implementation would require time slot ID
    // For now, just refresh the matrix
    this.loadAvailabilityMatrix();
  }

  onRefreshMatrix(): void {
    this.loadAvailabilityMatrix();
  }

  onExportMatrix(): void {
    const exportData = this.prepareExportData();
    this.downloadCSV(exportData, `monitor-availability-${new Date().toISOString().split('T')[0]}.csv`);
  }

  // ==================== VIEW CONFIGURATION ====================

  onViewModeChange(mode: 'daily' | 'weekly' | 'monthly'): void {
    switch (mode) {
      case 'daily':
        this.currentViewOptions.date_range_days = 1;
        break;
      case 'weekly':
        this.currentViewOptions.date_range_days = 7;
        break;
      case 'monthly':
        this.currentViewOptions.date_range_days = 30;
        break;
    }

    this.viewOptionsForm.patchValue({ date_range_days: this.currentViewOptions.date_range_days });
    this.regenerateMatrix();
  }

  onZoomChange(zoom: 'hours' | 'half-hours' | 'quarter-hours'): void {
    switch (zoom) {
      case 'hours':
        this.currentViewOptions.time_slot_duration_minutes = 60;
        break;
      case 'half-hours':
        this.currentViewOptions.time_slot_duration_minutes = 30;
        break;
      case 'quarter-hours':
        this.currentViewOptions.time_slot_duration_minutes = 15;
        break;
    }

    this.viewOptionsForm.patchValue({
      time_slot_duration_minutes: this.currentViewOptions.time_slot_duration_minutes
    });
    this.regenerateMatrix();
  }

  private regenerateMatrix(): void {
    // Update date headers and time slots based on new options
    const dateFrom = this.filtersForm.get('date_from')?.value || this.selectedDate;
    const dateTo = this.addDays(dateFrom, this.currentViewOptions.date_range_days - 1);

    this.generateTimeSlots();
    this.generateDateHeaders(dateFrom, dateTo);

    // Reload data
    this.loadAvailabilityMatrix();
  }

  // ==================== UTILITY METHODS ====================

  getCellClass(cell: AvailabilityMatrixCell): string {
    const classes = [`status-${cell.status}`];

    if (cell.has_conflict && this.currentViewOptions.highlight_conflicts) {
      classes.push('has-conflict');
    }

    if (cell.is_preferred_time) {
      classes.push('preferred-time');
    }

    if (this.isCurrentTimeSlot(cell.date, cell.time_slot)) {
      classes.push('current-time');
    }

    return classes.join(' ');
  }

  getCellTooltip(cell: AvailabilityMatrixCell): string {
    const parts = [
      `${cell.monitor_name}`,
      `${this.formatDate(cell.date)} ${cell.time_slot}`,
      `Status: ${this.statusConfig[cell.status]?.label || cell.status}`
    ];

    if (cell.course_name) {
      parts.push(`Course: ${cell.course_name}`);
    }

    if (cell.participant_count) {
      parts.push(`Participants: ${cell.participant_count}`);
    }

    if (cell.hourly_rate && this.currentViewOptions.show_hourly_rates) {
      parts.push(`Rate: ${cell.hourly_rate}€/hr`);
    }

    if (cell.travel_time_minutes && this.currentViewOptions.show_travel_time) {
      parts.push(`Travel: ${cell.travel_time_minutes}min`);
    }

    return parts.join('\n');
  }

  private openSchedulingDialog(cell: AvailabilityMatrixCell): void {
    // Implementation would open a dialog for scheduling
    this.logger.info('Opening scheduling dialog for cell', { cell });
  }

  private calculateHourlyRate(monitor: Monitor, timeSlot: MatrixTimeSlot, date: Date): number {
    // Base rate from monitor compensation
    let rate = monitor.compensation?.base_hourly_rate || 0;

    // Apply weekend multiplier
    if (this.isWeekend(date)) {
      rate *= monitor.compensation?.weekend_rate_multiplier || 1;
    }

    // Apply time-specific modifiers
    // Implementation would check monitor's preferred times and rates

    return rate;
  }

  private isPreferredTime(monitor: Monitor, timeSlot: MatrixTimeSlot, date: Date): boolean {
    // Check if this time slot is in monitor's preferred times
    // Implementation would check monitor's availability preferences
    return false; // Simplified for now
  }

  protected isCurrentTimeSlot(date: Date, timeSlot: string): boolean {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cellDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (!this.isSameDate(today, cellDate)) {
      return false;
    }

    const timeRange = this.parseTimeSlot(timeSlot);
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinutes;

    const [startHour, startMin] = timeRange.start_time.split(':').map(Number);
    const [endHour, endMin] = timeRange.end_time.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    return currentTime >= startTime && currentTime < endTime;
  }

  private parseTimeSlot(timeSlot: string): { start_time: string; end_time: string } {
    const [start_time, end_time] = timeSlot.split('-');
    return { start_time: start_time.trim(), end_time: end_time.trim() };
  }

  protected isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  protected isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private formatHour(hour: number): string {
    const wholeHour = Math.floor(hour);
    const minutes = Math.round((hour - wholeHour) * 60);
    return `${wholeHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  protected formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  private prepareExportData(): string {
    const headers = ['Monitor', 'Date', 'Time Slot', 'Status', 'Course', 'Participants', 'Location', 'Rate'];
    const rows = [headers.join(',')];

    for (const row of this.availabilityMatrix) {
      for (const cell of row) {
        const csvRow = [
          cell.monitor_name,
          cell.date.toISOString().split('T')[0],
          cell.time_slot,
          cell.status,
          cell.course_name || '',
          cell.participant_count?.toString() || '',
          cell.location_name || '',
          cell.hourly_rate?.toString() || ''
        ].join(',');

        rows.push(csvRow);
      }
    }

    return rows.join('\n');
  }

  private downloadCSV(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
