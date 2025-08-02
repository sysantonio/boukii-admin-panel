import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// Angular Material básico
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

import { CoursesRoutingModule } from './courses-routing.module';
// Componentes comentados temporalmente hasta implementar
// import { CourseListSeasonComponent } from './pages/course-list-season/course-list-season.component';
// import { CourseFormSeasonComponent } from './pages/course-form-season/course-form-season.component';
// import { CourseCalendarSeasonComponent } from './pages/course-calendar-season/course-calendar-season.component';
// import { CoursePricingSeasonComponent } from './pages/course-pricing-season/course-pricing-season.component';
// import { CourseAvailabilityComponent } from './pages/course-availability/course-availability.component';
// import { CourseCardSeasonComponent } from './components/course-card-season/course-card-season.component';
// import { PricingCalculatorComponent } from './components/pricing-calculator/pricing-calculator.component';
// import { AvailabilityCalendarComponent } from './components/availability-calendar/availability-calendar.component';

@NgModule({
  declarations: [
    // Componentes comentados temporalmente hasta implementar
    // CourseListSeasonComponent,
    // CourseFormSeasonComponent,
    // CourseCalendarSeasonComponent,
    // CoursePricingSeasonComponent,
    // CourseAvailabilityComponent,
    // CourseCardSeasonComponent,
    // PricingCalculatorComponent,
    // AvailabilityCalendarComponent
  ],
  imports: [
    CommonModule,
    CoursesRoutingModule,
    ReactiveFormsModule,
    TranslateModule,
    
    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule
  ]
})
export class CoursesModule { 

  constructor() {
    console.log('🎓 Courses Module V5 loaded (simplified)');
  }
}
