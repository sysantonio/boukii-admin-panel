import { 
  Directive, 
  ElementRef, 
  OnInit, 
  OnDestroy, 
  Output, 
  EventEmitter,
  Input,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appLazyRender]'
})
export class LazyRenderDirective implements OnInit, OnDestroy {
  @Input() lazyRenderMargin: string = '100px';
  @Input() lazyRenderThreshold: number = 0.1;
  @Output() elementVisible = new EventEmitter<boolean>();
  @Output() elementIntersecting = new EventEmitter<IntersectionObserverEntry>();

  private observer: IntersectionObserver;
  private isVisible = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupIntersectionObserver(): void {
    const options: IntersectionObserverInit = {
      root: null, // viewport
      rootMargin: this.lazyRenderMargin,
      threshold: this.lazyRenderThreshold
    };

    this.observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
          const wasVisible = this.isVisible;
          this.isVisible = entry.isIntersecting;

          // Emit events
          this.elementIntersecting.emit(entry);
          
          if (wasVisible !== this.isVisible) {
            this.elementVisible.emit(this.isVisible);
            
            // Add/remove visibility classes for styling
            if (this.isVisible) {
              this.renderer.addClass(this.elementRef.nativeElement, 'lazy-visible');
              this.renderer.removeClass(this.elementRef.nativeElement, 'lazy-hidden');
            } else {
              this.renderer.addClass(this.elementRef.nativeElement, 'lazy-hidden');
              this.renderer.removeClass(this.elementRef.nativeElement, 'lazy-visible');
            }
          }
        });
      },
      options
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  // Public method to check current visibility
  getVisibility(): boolean {
    return this.isVisible;
  }

  // Public method to force re-observation
  refresh(): void {
    if (this.observer) {
      this.observer.unobserve(this.elementRef.nativeElement);
      this.observer.observe(this.elementRef.nativeElement);
    }
  }
}