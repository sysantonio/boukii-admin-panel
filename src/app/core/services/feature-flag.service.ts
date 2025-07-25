import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService {
  get intelligentBooking(): boolean {
    return environment.features.intelligentBooking;
  }

  get realTimePricing(): boolean {
    return environment.features.realTimePricing;
  }

  get conflictDetection(): boolean {
    return environment.features.conflictDetection;
  }

  get aiRecommendations(): boolean {
    return environment.features.aiRecommendations;
  }
}
