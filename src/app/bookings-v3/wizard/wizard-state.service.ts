import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface WizardState {
  currentStep: number;
  totalSteps: number;
  data: {
    client?: any;
    activity?: any;
    schedule?: any;
    participants?: any;
    pricing?: any;
  };
}

@Injectable({ providedIn: 'root' })
export class WizardStateService {
  private state$ = new BehaviorSubject<WizardState>({ currentStep: 1, totalSteps: 6, data: {} });

  readonly stateChanges = this.state$.asObservable();

  get currentStep() { return this.state$.value.currentStep; }

  nextStep() {
    const step = Math.min(this.state$.value.totalSteps, this.state$.value.currentStep + 1);
    this.state$.next({ ...this.state$.value, currentStep: step });
  }

  prevStep() {
    const step = Math.max(1, this.state$.value.currentStep - 1);
    this.state$.next({ ...this.state$.value, currentStep: step });
  }

  setStepData(step: keyof WizardState['data'], value: any) {
    this.state$.next({ ...this.state$.value, data: { ...this.state$.value.data, [step]: value } });
  }

  getState(): WizardState {
    return this.state$.value;
  }

  reset() {
    this.state$.next({ currentStep: 1, totalSteps: this.state$.value.totalSteps, data: {} });
  }
}
