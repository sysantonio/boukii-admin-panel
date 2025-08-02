import { Component, Input, Output, EventEmitter, HostBinding, TemplateRef, ContentChild } from '@angular/core';

export type CardVariant = 'elevated' | 'outlined' | 'flat';
export type CardSize = 'compact' | 'medium' | 'large';
export type CardState = 'default' | 'loading' | 'error' | 'success' | 'warning' | 'info';
export type CardLayout = 'vertical' | 'horizontal';

@Component({
  selector: 'boukii-card',
  template: `
    <div [class]="cardClasses" 
         [attr.role]="interactive ? 'button' : null"
         [attr.tabindex]="interactive ? 0 : null"
         [attr.aria-label]="ariaLabel"
         [attr.aria-describedby]="ariaDescribedBy"
         (click)="onCardClick($event)"
         (keydown)="onCardKeydown($event)">
      
      <!-- Loading Spinner -->
      <div *ngIf="state === 'loading'" class="boukii-card-loading-spinner" 
           [attr.aria-label]="'common.loading' | translate" role="status">
      </div>
      
      <!-- Card Media (if provided) -->
      <div *ngIf="hasMedia" class="boukii-card-media" [class]="mediaClasses">
        <ng-content select="[slot=media]"></ng-content>
        
        <!-- Media Overlay -->
        <div *ngIf="mediaOverlay" class="boukii-card-media-overlay">
          <div class="boukii-card-media-actions">
            <ng-content select="[slot=media-overlay]"></ng-content>
          </div>
        </div>
      </div>
      
      <!-- Card Header -->
      <div *ngIf="hasHeader" class="boukii-card-header" [class]="headerClasses">
        <div class="boukii-card-header-content">
          
          <!-- Avatar (if provided) -->
          <div *ngIf="avatarSrc || hasAvatarSlot" class="boukii-card-avatar" [class]="avatarClasses">
            <img *ngIf="avatarSrc" [src]="avatarSrc" [alt]="avatarAlt || ''">
            <ng-content select="[slot=avatar]"></ng-content>
          </div>
          
          <!-- Header Text -->
          <div class="boukii-card-header-text">
            <h3 *ngIf="title" class="boukii-card-title" [class]="titleClasses">
              {{ title }}
            </h3>
            <ng-content select="[slot=title]"></ng-content>
            
            <p *ngIf="subtitle" class="boukii-card-subtitle">
              {{ subtitle }}
            </p>
            <ng-content select="[slot=subtitle]"></ng-content>
          </div>
          
          <!-- Header Actions -->
          <div *ngIf="hasHeaderActions" class="boukii-card-header-actions">
            <ng-content select="[slot=header-actions]"></ng-content>
          </div>
        </div>
      </div>
      
      <!-- Card Body/Content -->
      <div class="boukii-card-body" *ngIf="layout === 'horizontal'">
        <div class="boukii-card-content" [class]="contentClasses">
          <ng-content></ng-content>
        </div>
        
        <!-- Card Actions (for horizontal layout) -->
        <div *ngIf="hasActions" class="boukii-card-actions" [class]="actionsClasses">
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      </div>
      
      <!-- Card Content (for vertical layout) -->
      <div *ngIf="layout === 'vertical'" class="boukii-card-content" [class]="contentClasses">
        <ng-content></ng-content>
      </div>
      
      <!-- Card Actions (for vertical layout) -->
      <div *ngIf="hasActions && layout === 'vertical'" class="boukii-card-actions" [class]="actionsClasses">
        <ng-content select="[slot=actions]"></ng-content>
      </div>
      
      <!-- Screen Reader Content for Loading State -->
      <span *ngIf="state === 'loading'" class="boukii-sr-only">
        {{ 'common.loading' | translate }}
      </span>
    </div>
  `,
  styleUrls: ['./card.component.scss']
})
export class BoukiiCardComponent {
  
  // ==================== INPUT PROPERTIES ====================
  
  @Input() variant: CardVariant = 'elevated';
  @Input() size: CardSize = 'medium';
  @Input() state: CardState = 'default';
  @Input() layout: CardLayout = 'vertical';
  @Input() interactive = false;
  
  // Content Properties
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() avatarSrc?: string;
  @Input() avatarAlt?: string;
  @Input() avatarSize: 'small' | 'medium' | 'large' = 'medium';
  
  // Media Properties
  @Input() mediaAspectRatio?: '16-9' | '4-3' | '1-1';
  @Input() mediaOverlay = false;
  
  // Layout Properties
  @Input() noPadding = false;
  @Input() compactHeader = false;
  @Input() noBorder = false;
  @Input() scrollableContent = false;
  @Input() maxContentHeight?: string;
  
  // Action Properties
  @Input() actionsAlignment: 'start' | 'center' | 'end' | 'between' = 'end';
  @Input() responsiveActions = true;
  
  // Accessibility Properties
  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;
  
  // ==================== OUTPUT EVENTS ====================
  
  @Output() cardClick = new EventEmitter<MouseEvent>();
  @Output() cardKeydown = new EventEmitter<KeyboardEvent>();
  
  // ==================== CONTENT CHILDREN ====================
  
  @ContentChild('media') mediaTemplate?: TemplateRef<any>;
  @ContentChild('mediaOverlay') mediaOverlayTemplate?: TemplateRef<any>;
  @ContentChild('avatar') avatarTemplate?: TemplateRef<any>;
  @ContentChild('title') titleTemplate?: TemplateRef<any>;
  @ContentChild('subtitle') subtitleTemplate?: TemplateRef<any>;
  @ContentChild('headerActions') headerActionsTemplate?: TemplateRef<any>;
  @ContentChild('actions') actionsTemplate?: TemplateRef<any>;
  
  // ==================== HOST BINDINGS ====================
  
  @HostBinding('class') 
  get hostClasses(): string {
    return 'boukii-card-host';
  }
  
  @HostBinding('attr.role') 
  get role(): string | null {
    return this.interactive ? 'button' : null;
  }
  
  @HostBinding('attr.tabindex') 
  get tabindex(): number | null {
    return this.interactive ? 0 : null;
  }
  
  // ==================== COMPUTED PROPERTIES ====================
  
  get cardClasses(): string {
    const classes = ['boukii-card'];
    
    // Variant classes
    classes.push(`boukii-card--${this.variant}`);
    
    // Size classes
    classes.push(`boukii-card--${this.size}`);
    
    // State classes
    if (this.state !== 'default') {
      classes.push(`boukii-card--${this.state}`);
    }
    
    // Layout classes
    if (this.layout === 'horizontal') {
      classes.push('boukii-card--horizontal');
    }
    
    // Interactive class
    if (this.interactive) {
      classes.push('boukii-card--interactive');
    }
    
    return classes.join(' ');
  }
  
  get headerClasses(): string {
    const classes: string[] = [];
    
    if (this.compactHeader) {
      classes.push('boukii-card-header--compact');
    }
    
    if (this.noBorder) {
      classes.push('boukii-card-header--no-border');
    }
    
    if (this.avatarSrc || this.hasAvatarSlot) {
      classes.push('boukii-card-header--with-avatar');
    }
    
    return classes.join(' ');
  }
  
  get contentClasses(): string {
    const classes: string[] = [];
    
    if (this.noPadding) {
      classes.push('boukii-card-content--no-padding');
    }
    
    if (this.size === 'compact') {
      classes.push('boukii-card-content--compact');
    }
    
    if (this.scrollableContent) {
      classes.push('boukii-card-content--scrollable');
    }
    
    return classes.join(' ');
  }
  
  get actionsClasses(): string {
    const classes: string[] = [];
    
    classes.push(`boukii-card-actions--${this.actionsAlignment}`);
    
    if (this.noBorder) {
      classes.push('boukii-card-actions--no-border');
    }
    
    if (this.responsiveActions) {
      classes.push('boukii-card-actions--responsive');
    }
    
    return classes.join(' ');
  }
  
  get mediaClasses(): string {
    const classes: string[] = [];
    
    if (this.mediaAspectRatio) {
      classes.push(`boukii-card-media--${this.mediaAspectRatio}`);
    }
    
    return classes.join(' ');
  }
  
  get avatarClasses(): string {
    const classes: string[] = [];
    
    classes.push(`boukii-card-avatar--${this.avatarSize}`);
    
    return classes.join(' ');
  }
  
  get titleClasses(): string {
    const classes: string[] = [];
    
    if (this.size === 'large') {
      classes.push('boukii-card-title--large');
    } else if (this.size === 'compact') {
      classes.push('boukii-card-title--small');
    }
    
    return classes.join(' ');
  }
  
  // ==================== CONTENT DETECTION ====================
  
  get hasMedia(): boolean {
    return !!this.mediaTemplate;
  }
  
  get hasAvatarSlot(): boolean {
    return !!this.avatarTemplate;
  }
  
  get hasHeader(): boolean {
    return !!(this.title || this.subtitle || this.titleTemplate || 
             this.subtitleTemplate || this.avatarSrc || this.hasAvatarSlot || 
             this.hasHeaderActions);
  }
  
  get hasHeaderActions(): boolean {
    return !!this.headerActionsTemplate;
  }
  
  get hasActions(): boolean {
    return !!this.actionsTemplate;
  }
  
  // ==================== EVENT HANDLERS ====================
  
  onCardClick(event: MouseEvent): void {
    if (this.interactive && this.state !== 'loading') {
      this.cardClick.emit(event);
    }
  }
  
  onCardKeydown(event: KeyboardEvent): void {
    if (this.interactive && this.state !== 'loading') {
      // Handle Enter and Space key for accessibility
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const mouseEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        this.cardClick.emit(mouseEvent);
      }
      
      this.cardKeydown.emit(event);
    }
  }
  
  // ==================== PUBLIC API METHODS ====================
  
  /**
   * Set the loading state
   */
  setLoadingState(loading: boolean): void {
    this.state = loading ? 'loading' : 'default';
  }
  
  /**
   * Set the card state
   */
  setState(state: CardState): void {
    this.state = state;
  }
  
  /**
   * Focus the card (if interactive)
   */
  focus(): void {
    if (this.interactive) {
      // Focus would be handled by the host element
    }
  }
  
  /**
   * Check if card is in loading state
   */
  isLoading(): boolean {
    return this.state === 'loading';
  }
  
  /**
   * Check if card has error state
   */
  hasError(): boolean {
    return this.state === 'error';
  }
  
  /**
   * Get the current state
   */
  getState(): CardState {
    return this.state;
  }
}