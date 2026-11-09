import { Injectable, signal, inject } from '@angular/core';
import { Doctor, Place, Slot } from '../models';
import { INITIAL_DOCS, INITIAL_LOCS, enrichDoctor, buildLocations } from '../../data/doctors.data';
import { BookingsService } from './bookings.service';
import { HOSP } from '../../data/hospitals.data';
import { KW, SPEC } from '../../data/specialties.data';

@Injectable({
  providedIn: 'root'
})
export class DoctorsService {
  private bookingsService = inject(BookingsService);

  private doctorsSignal = signal<Doctor[]>(INITIAL_DOCS);
  private locationsSignal = signal<Place[]>(INITIAL_LOCS);
  private selectedPlaceIdx = signal<Record<number, number>>({});

  doctors = this.doctorsSignal.asReadonly();
  locations = this.locationsSignal.asReadonly();

  dayDate(offset: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d;
  }

  isoOf(offset: number): string {
    const d = this.dayDate(offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  dayLabel(offset: number): string {
    if (offset === 0) return 'Today';
    if (offset === 1) return 'Tomorrow';
    return this.dayDate(offset).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  shortDay(offset: number): string {
    if (offset === 0) return 'Today';
    if (offset === 1) return 'Tmrw';
    return this.dayDate(offset).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
  }

  formatTime(time: string): string {
    const parts = time.split(':');
    const h = +parts[0];
    const m = +parts[1];
    return `${((h + 11) % 12 + 1)}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }

  getDoctorById(id: number | string): Doctor | undefined {
    const numId = Number(id);
    return this.doctors().find(d => d.id === numId);
  }

  getAnyPlaceOrDoctorById(id: number | string): Doctor | Place | undefined {
    const numId = Number(id);
    const d = this.doctors().find(x => x.id === numId);
    if (d) return d;
    return this.locations().find(x => x.id === numId);
  }

  placesOf(doctor: Doctor): (Doctor | Place)[] {
    const extras = this.locations().filter(l => l.base === doctor.id);
    return [doctor, ...extras];
  }

  selectedPlace(doctor: Doctor): Doctor | Place {
    const places = this.placesOf(doctor);
    const idx = Math.min(this.selectedPlaceIdx()[doctor.id] || 0, places.length - 1);
    return places[idx];
  }

  selectPlace(doctorId: number, placeIndex: number): void {
    const current = { ...this.selectedPlaceIdx() };
    current[doctorId] = placeIndex;
    this.selectedPlaceIdx.set(current);
  }

  slots(docOrPlace: Doctor | Place, offset: number): string[] {
    const day = this.dayDate(offset).getDay();
    if (docOrPlace.days && docOrPlace.days.indexOf(day) < 0) {
      return [];
    }
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const iso = this.isoOf(offset);

    return docOrPlace.times.filter((t, i) => {
      if ((docOrPlace.id * 7 + offset * 3 + i) % 5 === 0) return false;
      if (this.bookingsService.isTaken(docOrPlace.id, iso, t)) return false;
      if (offset === 0) {
        const p = t.split(':');
        return (+p[0]) * 60 + (+p[1]) > nowMin + 30;
      }
      return true;
    });
  }

  nextSlots(docOrPlace: Doctor | Place, limit: number): Slot[] {
    const results: Slot[] = [];
    for (let o = 0; o < 5 && results.length < limit; o++) {
      const daySlots = this.slots(docOrPlace, o);
      for (const t of daySlots) {
        if (results.length < limit) {
          results.push({ o, t });
        }
      }
    }
    return results;
  }

  detectSpecialty(query: string): string | null {
    const t = ' ' + query.toLowerCase() + '$';
    for (const item of KW) {
      const spec = item[0];
      const words = item[1];
      const matched = words.some(w => {
        if (/[a-z]/.test(w)) {
          return new RegExp('(^|[^a-z])' + w).test(t);
        }
        return t.indexOf(w) > -1;
      });
      if (matched) return spec;
    }
    return null;
  }

  detectSpec(query: string): string | null {
    return this.detectSpecialty(query);
  }

  activeDays(d: Doctor | Place): number[] {
    const r: number[] = [];
    for (let o = 0; o < 6 && r.length < 4; o++) {
      if (this.slots(d, o).length > 0) {
        r.push(o);
      }
    }
    return r;
  }

  addDoctor(newDoc: Doctor): void {
    const enriched = enrichDoctor({ ...newDoc });
    const updatedDocs = [...this.doctors(), enriched];
    this.doctorsSignal.set(updatedDocs);
    this.locationsSignal.set(buildLocations(updatedDocs));
  }

  toggleDoctor(id: number): void {
    const updated = this.doctors().map(d => {
      if (d.id === id) {
        return { ...d, off: !d.off };
      }
      return d;
    });
    this.doctorsSignal.set(updated);
  }
}
