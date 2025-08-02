import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Interfaces
import { Monitor } from '../models/monitor.interface';

@Injectable({
  providedIn: 'root'
})
export class MonitorService {

  getMonitors(): Observable<Monitor[]> {
    // Simplified mock data with all required fields
    const mockMonitors: Monitor[] = [
      {
        id: 1,
        season_id: 1,
        first_name: 'Carlos',
        last_name: 'Ruiz',
        full_name: 'Carlos Ruiz',
        email: 'carlos@example.com',
        phone: '+34123456789',
        birth_date: new Date('1990-05-15'),
        age: 34,
        document_type: 'dni',
        document_number: '12345678A',
        nationality: 'Spanish',
        employee_id: 'EMP001',
        hire_date: new Date('2020-01-15'),
        contract_type: 'full_time',
        employment_status: 'active',
        department: 'Surf',
        position: 'Senior Instructor',
        certifications: [],
        languages: [],
        qualifications: [],
        skills: [],
        specializations: [],
        experience_level: 'senior',
        years_of_experience: 8,
        availability: {} as any,
        time_slots: [],
        preferred_courses: [],
        blacklisted_courses: [],
        performance_stats: {} as any,
        compensation: {} as any,
        address: {} as any,
        emergency_contact: {} as any,
        work_authorization: {} as any,
        background_check: {} as any,
        insurance_info: {} as any,
        status: 'available',
        created_at: new Date(),
        updated_at: new Date()
      } as Monitor,
      {
        id: 2,
        season_id: 1,
        first_name: 'Ana',
        last_name: 'Martín',
        full_name: 'Ana Martín',
        email: 'ana@example.com',
        phone: '+34987654321',
        birth_date: new Date('1985-08-22'),
        age: 39,
        document_type: 'dni',
        document_number: '87654321B',
        nationality: 'Spanish',
        employee_id: 'EMP002',
        hire_date: new Date('2019-03-10'),
        contract_type: 'part_time',
        employment_status: 'active',
        department: 'Windsurf',
        position: 'Instructor',
        certifications: [],
        languages: [],
        qualifications: [],
        skills: [],
        specializations: [],
        experience_level: 'mid',
        years_of_experience: 5,
        availability: {} as any,
        time_slots: [],
        preferred_courses: [],
        blacklisted_courses: [],
        performance_stats: {} as any,
        compensation: {} as any,
        address: {} as any,
        emergency_contact: {} as any,
        work_authorization: {} as any,
        background_check: {} as any,
        insurance_info: {} as any,
        status: 'available',
        created_at: new Date(),
        updated_at: new Date()
      } as Monitor
    ];

    return of(mockMonitors).pipe(delay(300));
  }
}