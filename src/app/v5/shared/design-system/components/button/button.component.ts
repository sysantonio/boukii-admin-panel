import { Component, Input, Output, EventEmitter, OnInit, HostBinding, ElementRef, Renderer2 } from '@angular/core';

export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonColor = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
export type ButtonVariant = 'filled' | 'outlined' | 'text' | 'ghost';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'boukii-button',
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [attr.aria-label]="ariaLabel"
      [attr.aria-describedby]="ariaDescribedBy"
      [attr.aria-pressed]="ariaPressed"
      [attr.aria-expanded]="ariaExpanded"
      [class]="buttonClasses"
      (click)="onClick($event)"
      (focus)="onFocus($event)"
      (blur)="onBlur($event)">
      
      <!-- Leading Icon -->
      <span 
        *ngIf="iconLeading" 
        class="boukii-button-icon boukii-button-icon--leading"
        [attr.aria-hidden]="true">
        <mat-icon [svgIcon]="iconLeading" *ngIf="isSvgIcon(iconLeading); else materialIcon">
        </mat-icon>
        <ng-template #materialIcon>
          <mat-icon>{{ iconLeading }}</mat-icon>
        </ng-template>
      </span>
      
      <!-- Button Content -->
      <span class="boukii-button-text" *ngIf="!iconOnly">
        <ng-content></ng-content>
      </span>
      
      <!-- Trailing Icon -->
      <span 
        *ngIf="iconTrailing" 
        class="boukii-button-icon boukii-button-icon--trailing"
        [attr.aria-hidden]="true">
        <mat-icon [svgIcon]="iconTrailing" *ngIf="isSvgIcon(iconTrailing); else materialIconTrailing">
        </mat-icon>
        <ng-template #materialIconTrailing>
          <mat-icon>{{ iconTrailing }}</mat-icon>
        </ng-template>
      </span>
      
      <!-- Loading Spinner -->
      <span 
        *ngIf="loading" 
        class="boukii-button-spinner"
        [attr.aria-label]="'common.loading' | translate"
        role="status">
      </span>
      
      <!-- Screen Reader Loading Text -->
      <span 
        *ngIf="loading" 
        class="boukii-sr-only">
        {{ 'common.loading' | translate }}
      </span>
    </button>
  `,
  styleUrls: ['./button.component.scss']
})
export class BoukiiButtonComponent implements OnInit {
  
  // ==================== INPUT PROPERTIES ====================
  
  @Input() size: ButtonSize = 'medium';
  @Input() color: ButtonColor = 'primary';
  @Input() variant: ButtonVariant = 'filled';
  @Input() type: ButtonType = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() iconOnly = false;
  @Input() iconLeading?: string;
  @Input() iconTrailing?: string;
  
  // Accessibility Properties
  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;
  @Input() ariaPressed?: boolean;
  @Input() ariaExpanded?: boolean;
  
  // Floating Action Button
  @Input() fab = false;
  
  // ==================== OUTPUT EVENTS ====================
  
  @Output() buttonClick = new EventEmitter<MouseEvent>();
  @Output() buttonFocus = new EventEmitter<FocusEvent>();
  @Output() buttonBlur = new EventEmitter<FocusEvent>();
  
  // ==================== HOST BINDINGS ====================
  
  @HostBinding('class') 
  get hostClasses(): string {
    return this.buttonClasses;
  }
  
  @HostBinding('attr.role') 
  get role(): string {
    return 'button';
  }
  
  // ==================== COMPUTED PROPERTIES ====================
  
  get buttonClasses(): string {
    const classes = ['boukii-button'];
    
    // Size classes
    classes.push(`boukii-button--${this.size}`);
    
    // Color classes
    classes.push(`boukii-button--${this.color}`);
    
    // Variant classes
    classes.push(`boukii-button--${this.variant}`);
    
    // State classes
    if (this.disabled) {
      classes.push('boukii-button--disabled');
    }
    
    if (this.loading) {
      classes.push('boukii-button--loading');
    }
    
    // Layout classes
    if (this.fullWidth) {
      classes.push('boukii-button--full-width');
    }
    
    if (this.iconOnly) {
      classes.push('boukii-button--icon-only');
    }
    
    if (this.fab) {
      classes.push('boukii-button--fab');
    }
    
    return classes.join(' ');
  }
  
  // ==================== LIFECYCLE HOOKS ====================
  
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}
  
  ngOnInit(): void {
    this.validateInputs();
    this.setupAccessibility();
  }
  
  // ==================== EVENT HANDLERS ====================
  
  onClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    
    this.createRippleEffect(event);
    this.buttonClick.emit(event);
  }
  
  onFocus(event: FocusEvent): void {
    this.buttonFocus.emit(event);
  }
  
  onBlur(event: FocusEvent): void {
    this.buttonBlur.emit(event);
  }
  
  // ==================== UTILITY METHODS ====================
  
  private validateInputs(): void {
    // Validate size
    const validSizes: ButtonSize[] = ['small', 'medium', 'large'];
    if (!validSizes.includes(this.size)) {
      console.warn(`BoukiiButton: Invalid size "${this.size}". Using "medium" as default.`);
      this.size = 'medium';
    }
    
    // Validate color
    const validColors: ButtonColor[] = ['primary', 'secondary', 'accent', 'success', 'warning', 'error'];
    if (!validColors.includes(this.color)) {
      console.warn(`BoukiiButton: Invalid color "${this.color}". Using "primary" as default.`);
      this.color = 'primary';
    }
    
    // Validate variant
    const validVariants: ButtonVariant[] = ['filled', 'outlined', 'text', 'ghost'];
    if (!validVariants.includes(this.variant)) {
      console.warn(`BoukiiButton: Invalid variant "${this.variant}". Using "filled" as default.`);
      this.variant = 'filled';
    }
    
    // Validate type
    const validTypes: ButtonType[] = ['button', 'submit', 'reset'];
    if (!validTypes.includes(this.type)) {
      console.warn(`BoukiiButton: Invalid type "${this.type}". Using "button" as default.`);
      this.type = 'button';
    }
    
    // Icon-only button validation
    if (this.iconOnly && !this.iconLeading && !this.iconTrailing) {
      console.warn('BoukiiButton: Icon-only button requires either iconLeading or iconTrailing.');
    }
    
    // Icon-only button should have aria-label
    if (this.iconOnly && !this.ariaLabel) {
      console.warn('BoukiiButton: Icon-only button should have an aria-label for accessibility.');
    }
  }
  
  private setupAccessibility(): void {
    const buttonElement = this.elementRef.nativeElement.querySelector('button');
    
    if (!buttonElement) {
      return;
    }
    
    // Ensure minimum touch target size for mobile accessibility
    const computedStyle = getComputedStyle(buttonElement);
    const height = parseInt(computedStyle.height, 10);
    const width = parseInt(computedStyle.width, 10);
    
    if (height < 44 || width < 44) {
      // Add padding to reach minimum touch target
      const paddingNeeded = Math.max(0, (44 - Math.min(height, width)) / 2);
      this.renderer.setStyle(buttonElement, 'padding', `${paddingNeeded}px`);
    }
    
    // Add role and ARIA attributes for better screen reader support
    if (this.loading) {
      this.renderer.setAttribute(buttonElement, 'aria-busy', 'true');
    } else {
      this.renderer.removeAttribute(buttonElement, 'aria-busy');
    }
  }
  
  private createRippleEffect(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    // Create ripple element
    const ripple = this.renderer.createElement('span');
    this.renderer.addClass(ripple, 'boukii-button-ripple');
    
    // Position ripple at click location
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    this.renderer.setStyle(ripple, 'width', `${size}px`);
    this.renderer.setStyle(ripple, 'height', `${size}px`);
    this.renderer.setStyle(ripple, 'left', `${x}px`);
    this.renderer.setStyle(ripple, 'top', `${y}px`);
    
    // Add ripple to button
    this.renderer.appendChild(button, ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      try {
        this.renderer.removeChild(button, ripple);
      } catch (e) {
        // Element might have been removed already
      }
    }, 600);
  }
  
  isSvgIcon(icon: string): boolean {
    // Check if icon string contains SVG identifiers or custom icon prefixes
    return icon && (icon.includes(':') || icon.includes('_') || icon.startsWith('custom-'));
  }
  
  // ==================== PUBLIC API METHODS ====================
  
  /**
   * Programmatically focus the button
   */
  focus(): void {
    const buttonElement = this.elementRef.nativeElement.querySelector('button');
    if (buttonElement) {
      buttonElement.focus();
    }
  }
  
  /**
   * Programmatically blur the button
   */
  blur(): void {
    const buttonElement = this.elementRef.nativeElement.querySelector('button');
    if (buttonElement) {
      buttonElement.blur();
    }
  }
  
  /**
   * Get the native button element
   */
  getButtonElement(): HTMLButtonElement | null {
    return this.elementRef.nativeElement.querySelector('button');
  }
  
  /**
   * Check if button is currently focused
   */
  isFocused(): boolean {
    const buttonElement = this.getButtonElement();
    return buttonElement === document.activeElement;
  }
  
  /**
   * Trigger click programmatically
   */
  click(): void {
    if (!this.disabled && !this.loading) {
      const buttonElement = this.getButtonElement();
      if (buttonElement) {
        buttonElement.click();
      }
    }
  }
}