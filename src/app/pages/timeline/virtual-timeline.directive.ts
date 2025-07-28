import { 
  Directive, 
  ElementRef, 
  Input, 
  OnInit, 
  OnDestroy, 
  Output, 
  EventEmitter,
  Renderer2,
  NgZone,
  AfterViewInit
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { throttleTime, takeUntil } from 'rxjs/operators';
import { VirtualTimelineService } from './virtual-timeline.service';

@Directive({
  selector: '[appVirtualTimeline]'
})
export class VirtualTimelineDirective implements OnInit, OnDestroy, AfterViewInit {
  @Input() totalItems: number = 0;
  @Input() itemHeight: number = 100;
  @Input() maintainScrollPosition: boolean = true;
  
  @Output() visibleRangeChange = new EventEmitter<{ start: number; end: number }>();
  @Output() scrollPositionChange = new EventEmitter<number>();

  private destroy$ = new Subject<void>();
  private scrollContainer: HTMLElement;
  private contentContainer: HTMLElement;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private ngZone: NgZone,
    private virtualService: VirtualTimelineService
  ) {}

  ngOnInit(): void {
    this.scrollContainer = this.elementRef.nativeElement;
    this.setupScrollContainer();
  }

  ngAfterViewInit(): void {
    this.setupVirtualScrolling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupScrollContainer(): void {
    // Ensure container has overflow scrolling
    this.renderer.setStyle(this.scrollContainer, 'overflow-y', 'auto');
    this.renderer.setStyle(this.scrollContainer, 'position', 'relative');
    
    // Create content container
    this.contentContainer = this.renderer.createElement('div');
    this.renderer.setStyle(this.contentContainer, 'position', 'relative');
    this.renderer.setStyle(this.contentContainer, 'width', '100%');
    
    // Move existing content to content container
    const children = Array.from(this.scrollContainer.children);
    children.forEach(child => {
      this.renderer.appendChild(this.contentContainer, child);
    });
    
    this.renderer.appendChild(this.scrollContainer, this.contentContainer);
  }

  private setupVirtualScrolling(): void {
    const containerHeight = this.scrollContainer.clientHeight;
    
    // Configure virtual service
    this.virtualService.configure(this.totalItems, containerHeight, this.itemHeight);
    
    // Set initial total height
    this.updateTotalHeight();
    
    // Listen to scroll events
    this.ngZone.runOutsideAngular(() => {
      fromEvent(this.scrollContainer, 'scroll')
        .pipe(
          throttleTime(16), // ~60fps
          takeUntil(this.destroy$)
        )
        .subscribe((event: Event) => {
          const target = event.target as HTMLElement;
          this.handleScroll(target.scrollTop);
        });
    });

    // Listen to visible range changes
    this.virtualService.visibleRange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(range => {
        this.ngZone.run(() => {
          this.visibleRangeChange.emit(range);
          this.updateContentPosition(range);
        });
      });

    // Listen to scroll position changes
    this.virtualService.scrollPosition$
      .pipe(takeUntil(this.destroy$))
      .subscribe(position => {
        this.ngZone.run(() => {
          this.scrollPositionChange.emit(position);
        });
      });
  }

  private handleScroll(scrollTop: number): void {
    this.virtualService.updateScrollPosition(scrollTop);
  }

  private updateTotalHeight(): void {
    const totalHeight = this.virtualService.getTotalHeight();
    this.renderer.setStyle(this.scrollContainer, 'height', `${totalHeight}px`);
  }

  private updateContentPosition(range: { start: number; end: number }): void {
    const topOffset = this.virtualService.getTopOffset();
    this.renderer.setStyle(this.contentContainer, 'transform', `translateY(${topOffset}px)`);
  }

  // Public methods for external control
  scrollToItem(index: number): void {
    this.virtualService.scrollToItem(index);
    const targetPosition = index * this.itemHeight;
    this.scrollContainer.scrollTop = targetPosition;
  }

  updateItemCount(newCount: number): void {
    this.totalItems = newCount;
    const containerHeight = this.scrollContainer.clientHeight;
    this.virtualService.configure(newCount, containerHeight, this.itemHeight);
    this.updateTotalHeight();
  }

  getCurrentVisibleRange(): { start: number; end: number } {
    return this.virtualService.getVisibleRange();
  }
}