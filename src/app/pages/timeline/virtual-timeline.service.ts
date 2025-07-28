import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VirtualTimelineService {
  private itemHeight = 100; // Altura fija por monitor/fila
  private containerHeight = 0;
  private scrollTop = 0;
  private totalItems = 0;
  
  // Subjects para comunicar cambios
  private visibleRangeSubject = new BehaviorSubject<{ start: number; end: number }>({ start: 0, end: 0 });
  public visibleRange$ = this.visibleRangeSubject.asObservable();
  
  private scrollPositionSubject = new Subject<number>();
  public scrollPosition$ = this.scrollPositionSubject.asObservable();

  constructor() {}

  /**
   * Configura los parámetros del virtual scrolling
   * @param totalItems Total de items (monitores)
   * @param containerHeight Altura del contenedor visible
   * @param itemHeight Altura de cada item
   */
  configure(totalItems: number, containerHeight: number, itemHeight: number = 100): void {
    this.totalItems = totalItems;
    this.containerHeight = containerHeight;
    this.itemHeight = itemHeight;
    this.updateVisibleRange();
  }

  /**
   * Actualiza la posición del scroll
   * @param scrollTop Posición actual del scroll
   */
  updateScrollPosition(scrollTop: number): void {
    this.scrollTop = scrollTop;
    this.scrollPositionSubject.next(scrollTop);
    this.updateVisibleRange();
  }

  /**
   * Calcula el rango visible de items
   */
  private updateVisibleRange(): void {
    if (this.containerHeight === 0 || this.itemHeight === 0) {
      return;
    }

    // Calculamos con un buffer extra para smooth scrolling
    const buffer = Math.ceil(this.containerHeight / this.itemHeight);
    const visibleStart = Math.floor(this.scrollTop / this.itemHeight);
    const visibleEnd = Math.min(
      this.totalItems,
      visibleStart + Math.ceil(this.containerHeight / this.itemHeight) + buffer
    );

    const start = Math.max(0, visibleStart - buffer);
    const end = Math.min(this.totalItems, visibleEnd + buffer);

    this.visibleRangeSubject.next({ start, end });
  }

  /**
   * Obtiene la altura total del scroll container
   */
  getTotalHeight(): number {
    return this.totalItems * this.itemHeight;
  }

  /**
   * Obtiene el offset superior para el contenido visible
   */
  getTopOffset(): number {
    const range = this.visibleRangeSubject.value;
    return range.start * this.itemHeight;
  }

  /**
   * Obtiene los índices actualmente visibles
   */
  getVisibleRange(): { start: number; end: number } {
    return this.visibleRangeSubject.value;
  }

  /**
   * Scroll hacia un item específico
   * @param index Índice del item
   */
  scrollToItem(index: number): void {
    const targetScrollTop = index * this.itemHeight;
    this.updateScrollPosition(targetScrollTop);
  }

  /**
   * Verifica si un item está visible
   * @param index Índice del item
   */
  isItemVisible(index: number): boolean {
    const range = this.visibleRangeSubject.value;
    return index >= range.start && index < range.end;
  }
}