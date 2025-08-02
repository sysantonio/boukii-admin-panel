import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingListSeasonComponent } from './components/booking-list-season/booking-list-season.component';
import { BookingWizardSeasonComponent } from './components/booking-wizard-season/booking-wizard-season.component';

const routes: Routes = [
  {
    path: '',
    component: BookingListSeasonComponent
  },
  {
    path: 'new',
    component: BookingWizardSeasonComponent
  },
  {
    path: ':id',
    component: BookingWizardSeasonComponent // Reutilizar para edición
  },
  {
    path: ':id/edit',
    component: BookingWizardSeasonComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingsRoutingModule {}