import { TestBed } from '@angular/core/testing';
import { WizardStateService } from './wizard-state.service';

describe('WizardStateService', () => {
  let service: WizardStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WizardStateService);
  });

  it('should start on step 1', () => {
    expect(service.currentStep).toBe(1);
  });

  it('should navigate between steps', () => {
    service.nextStep();
    expect(service.currentStep).toBe(2);
    service.prevStep();
    expect(service.currentStep).toBe(1);
    service.prevStep();
    expect(service.currentStep).toBe(1);
  });

  it('should reset to first step', () => {
    service.nextStep();
    service.nextStep();
    service.reset();
    expect(service.currentStep).toBe(1);
  });
});
