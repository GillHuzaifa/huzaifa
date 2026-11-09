import { Injectable, signal, inject } from '@angular/core';
import { Hospital, Doctor } from '../models';
import { HOSP, DEPTS } from '../../data/hospitals.data';
import { DoctorsService } from './doctors.service';

@Injectable({
  providedIn: 'root'
})
export class HospitalsService {
  private doctorsService = inject(DoctorsService);

  private hospitalsSignal = signal<Hospital[]>(HOSP);
  hospitals = this.hospitalsSignal.asReadonly();
  depts = DEPTS;

  getHospitalById(id: string): Hospital | undefined {
    return this.hospitals().find(h => h.id === id);
  }

  getDoctorsAtHospital(hospitalId: string): Doctor[] {
    return this.doctorsService.doctors().filter(d => d.h === hospitalId && !d.off);
  }

  getFreeTodayCount(hospitalId: string): number {
    return this.getDoctorsAtHospital(hospitalId).filter(d => {
      const next = this.doctorsService.nextSlots(d, 1);
      return next.length > 0 && next[0].o === 0;
    }).length;
  }
}
