import { Injectable, signal } from '@angular/core';
import { BookingV3WizardState } from '../interfaces/booking-v3.interfaces';

@Injectable({
  providedIn: 'root'
})
export class WizardStateService {
  
  private initialState: BookingV3WizardState = {
    paso: 1,
    cliente: undefined,
    tipoReserva: undefined,
    cursoSeleccionado: undefined,
    configuracion: {
      participantes: 1,
      fechasSeleccionadas: [],
      puntoEncuentro: '',
      notasAdicionales: ''
    },
    detallesParticipantes: [],
    crearNuevoCliente: false
  };

  // Reactive state
  private wizardState = signal<BookingV3WizardState>(this.initialState);

  constructor() {
    console.log('🧙‍♂️ WizardStateService initialized');
  }

  // ============= STATE MANAGEMENT =============

  getState(): BookingV3WizardState {
    return this.wizardState();
  }

  updateState(updates: Partial<BookingV3WizardState>): void {
    this.wizardState.update(current => ({
      ...current,
      ...updates
    }));
    
    console.log('🔄 Wizard state updated:', updates);
  }

  resetState(): void {
    this.wizardState.set({ ...this.initialState });
    console.log('🔄 Wizard state reset');
  }

  // ============= STEP NAVIGATION =============

  setStep(step: number): void {
    this.updateState({ paso: step });
  }

  nextStep(): void {
    const current = this.wizardState();
    if (current.paso < 6) {
      this.updateState({ paso: current.paso + 1 });
    }
  }

  previousStep(): void {
    const current = this.wizardState();
    if (current.paso > 1) {
      this.updateState({ paso: current.paso - 1 });
    }
  }

  // ============= VALIDATION HELPERS =============

  canAdvanceFromStep(step: number): boolean {
    const state = this.wizardState();
    
    switch (step) {
      case 1:
        return !!(state.cliente || state.crearNuevoCliente);
      case 2:
        return !!state.tipoReserva && 
               (state.tipoReserva.requiresCourse ? !!state.cursoSeleccionado : true);
      case 3:
        return !!state.configuracion && 
               state.configuracion.participantes > 0 &&
               state.configuracion.fechasSeleccionadas.length > 0;
      case 4:
        return state.detallesParticipantes?.length === state.configuracion?.participantes;
      case 5:
        return true; // Pricing step
      default:
        return true;
    }
  }

  isStepComplete(step: number): boolean {
    return this.canAdvanceFromStep(step);
  }

  // ============= SPECIFIC STATE UPDATES =============

  setCliente(cliente: any): void {
    this.updateState({ 
      cliente, 
      crearNuevoCliente: false 
    });
  }

  setTipoReserva(tipoReserva: any): void {
    this.updateState({ 
      tipoReserva,
      cursoSeleccionado: undefined // Reset course when type changes
    });
  }

  setCurso(curso: any): void {
    this.updateState({ cursoSeleccionado: curso });
  }

  setConfiguracion(configuracion: any): void {
    this.updateState({ configuracion });
  }

  setParticipantes(participantes: any[]): void {
    this.updateState({ detallesParticipantes: participantes });
  }

  toggleNuevoCliente(): void {
    const current = this.wizardState();
    this.updateState({ 
      crearNuevoCliente: !current.crearNuevoCliente,
      cliente: current.crearNuevoCliente ? undefined : current.cliente
    });
  }

  // ============= STATE PERSISTENCE =============

  saveToLocalStorage(): void {
    try {
      const state = this.wizardState();
      localStorage.setItem('wizard-state-v3', JSON.stringify(state));
      console.log('💾 Wizard state saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving wizard state:', error);
    }
  }

  loadFromLocalStorage(): boolean {
    try {
      const saved = localStorage.getItem('wizard-state-v3');
      if (saved) {
        const state = JSON.parse(saved);
        this.wizardState.set(state);
        console.log('📂 Wizard state loaded from localStorage');
        return true;
      }
    } catch (error) {
      console.error('❌ Error loading wizard state:', error);
    }
    return false;
  }

  clearLocalStorage(): void {
    try {
      localStorage.removeItem('wizard-state-v3');
      console.log('🗑️ Wizard state cleared from localStorage');
    } catch (error) {
      console.error('❌ Error clearing wizard state:', error);
    }
  }
}