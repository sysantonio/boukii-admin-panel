import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'memoize',
  pure: true // Importante: pipe puro para optimización
})
export class MemoizePipe implements PipeTransform {
  private cache = new Map<string, any>();

  transform(fn: Function, ...args: any[]): any {
    const key = this.createKey(fn.name, args);
    
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const result = fn.apply(null, args);
    this.cache.set(key, result);
    
    return result;
  }

  private createKey(fnName: string, args: any[]): string {
    return `${fnName}_${JSON.stringify(args)}`;
  }

  // Método para limpiar cache si es necesario
  clearCache(): void {
    this.cache.clear();
  }
}

@Pipe({
  name: 'timeToPixels',
  pure: true
})
export class TimeToPixelsPipe implements PipeTransform {
  private cache = new Map<string, number>();

  transform(timeStr: string, pixelsPerMinute: number, startTime: string): number {
    const key = `${timeStr}-${pixelsPerMinute}-${startTime}`;
    
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const [hours, minutes] = timeStr.split(':').map(Number);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    
    const totalMinutes = (hours * 60 + minutes) - (startHours * 60 + startMinutes);
    const pixels = totalMinutes * pixelsPerMinute;
    
    this.cache.set(key, pixels);
    return pixels;
  }
}

@Pipe({
  name: 'durationToPixels',
  pure: true
})
export class DurationToPixelsPipe implements PipeTransform {
  private cache = new Map<string, number>();

  transform(startTime: string, endTime: string, pixelsPerMinute: number): number {
    const key = `${startTime}-${endTime}-${pixelsPerMinute}`;
    
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    const pixels = durationMinutes * pixelsPerMinute;
    
    this.cache.set(key, pixels);
    return pixels;
  }
}