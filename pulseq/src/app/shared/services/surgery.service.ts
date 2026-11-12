import { Injectable, signal } from '@angular/core';
import { Procedure, Surgeon, SurgeryCategory, Hospital } from '../models';
import { SCATS, PROCS, SURGS, SINC, HF } from '../../data/surgery.data';
import { HOSP } from '../../data/hospitals.data';

@Injectable({
  providedIn: 'root'
})
export class SurgeryService {
  categories = signal<SurgeryCategory[]>(SCATS);
  procedures = signal<Procedure[]>(PROCS);
  surgeons = signal<Surgeon[]>(SURGS);
  inclusions = SINC;

  selectedCategory = signal<string>('general');
  selectedProcedureId = signal<number>(8);
  comparisonHospitalIds = signal<string[]>([]);

  getProcedureById(id: number | string): Procedure | undefined {
    const numId = Number(id);
    return this.procedures().find(p => p.id === numId);
  }

  getSurgeonById(id: number | string): Surgeon | undefined {
    const numId = Number(id);
    return this.surgeons().find(s => s.id === numId);
  }

  hrange(procedure: Procedure, hospitalId: string): [number, number] {
    const f = HF[hospitalId] || 1;
    return [
      Math.round((procedure.lo * f) / 1000) * 1000,
      Math.round((procedure.hi * f) / 1000) * 1000
    ];
  }

  formatMoney(num: number): string {
    return 'Rs ' + num.toLocaleString('en-US');
  }

  formatRange(range: [number, number]): string {
    return `${this.formatMoney(range[0])} to ${this.formatMoney(range[1])}`;
  }

  hospitalsFor(procedureId: number): Hospital[] {
    const ids: Record<string, boolean> = {};
    this.surgeons().forEach(s => {
      if (s.p.includes(procedureId)) {
        ids[s.h] = true;
      }
    });
    return HOSP.filter(h => ids[h.id]);
  }

  surgeonsAt(hospitalId: string, procedureId: number): Surgeon[] {
    return this.surgeons().filter(s => s.h === hospitalId && s.p.includes(procedureId));
  }

  surgsAt(hospitalId: string, procedureId: number): Surgeon[] {
    return this.surgeonsAt(hospitalId, procedureId);
  }

  toggleComparison(hospitalId: string): void {
    const current = [...this.comparisonHospitalIds()];
    const idx = current.indexOf(hospitalId);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(hospitalId);
      if (current.length > 2) {
        current.shift();
      }
    }
    this.comparisonHospitalIds.set(current);
  }

  hospsFor(procedureId: number): Hospital[] {
    return this.hospitalsFor(procedureId);
  }

}
