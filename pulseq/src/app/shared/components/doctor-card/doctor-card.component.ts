import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Doctor, Place, Slot } from '../../models';
import { DoctorsService } from '../../services/doctors.service';
import { HospitalsService } from '../../services/hospitals.service';
import { ReviewsService } from '../../services/reviews.service';
import { ModalService } from '../../services/modal.service';
import { SPEC } from '../../../data/specialties.data';

@Component({
  selector: 'app-doctor-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (doctor) {
      @let P = selectedPlace();
      @let h = getHospital(P.h);
      @let ns = nextSlots();
      @let today = isFreeToday();
      @let places = allPlaces();

      <article class="doc dcard" (click)="onCardClick($event)" style="cursor:pointer">
        <div class="dc-head">
          <div class="dc-ava t{{ doctor.t }}">
            @if (doctor.photo) {
              <img [src]="doctor.photo" [alt]="doctor.name">
            } @else {
              <span>{{ getInitials(doctor.name) }}</span>
            }
            @if (today) {
              <i class="dc-on" title="Free today"></i>
            }
          </div>

          <div class="min0 dc-id">
            <h3><a class="dlink" [routerLink]="['/doctor', doctor.id]">{{ doctor.name }}</a></h3>
            <p class="dc-spec">{{ getSpec(doctor.spec) }}</p>
            <p class="dc-deg">
              {{ (doctor.deg || []).join(', ') }}{{ doctor.exp ? ' · ' + doctor.exp + ' yrs' : '' }}
            </p>
            @if (places.length <= 1 && h) {
              <p class="muted sm">{{ h.name }} · {{ h.city }}</p>
            }
          </div>
        </div>

        <div class="dc-meta">
          <a class="rt" [routerLink]="['/doctor', doctor.id]" fragment="reviews" (click)="$event.stopPropagation()">
            <svg class="pulse" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2381FF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <b>{{ getDocRating(doctor.id).avg.toFixed(1) }}</b>
            <span>· {{ getDocRating(doctor.id).n }} reviews</span>
          </a>
          <span class="doctor-mode" [class.video]="P.mode.toLowerCase().includes('video')">
            @if (P.mode.toLowerCase().includes('video')) {
              <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="5" width="10" height="10" rx="2"/><path d="m13 8 4-2v8l-4-2"/></svg>
            } @else {
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v14M3 10h14"/></svg>
            }
            <span>{{ P.mode }}</span>
          </span>
          <span class="dc-avail" [class.on]="today">
            {{ today ? 'Free today' : (ns.length ? 'Free this week' : 'Fully booked') }}
          </span>
          <b class="dc-fee">Rs {{ P.fee.toLocaleString('en-US') }}</b>
        </div>

        @if (places.length > 1) {
          <div class="dc-places" role="radiogroup" [attr.aria-label]="'Choose where to see ' + doctor.name">
            <span class="dc-pl-tag">Sits at {{ places.length }} places · choose one</span>
            @for (p of places; track p.id; let i = $index) {
              @let ph = getHospital(p.h);
              <button
                type="button"
                class="dc-pl"
                [class.on]="selectedPlaceIndex === i"
                role="radio"
                [attr.aria-checked]="selectedPlaceIndex === i"
                (click)="onSelectPlace(i)">
                <b>{{ ph ? ph.name : p.h }} · {{ ph ? ph.city : '' }}</b>
                <span>{{ dayRange(p.days || [1,2,3,4,5,6]) }} · {{ hoursOf(p.times) }} · Rs {{ p.fee.toLocaleString('en-US') }}</span>
              </button>
            }
          </div>
        } @else {
          <p class="dc-time">
            <span><b>{{ dayRange(doctor.days || [1,2,3,4,5,6]) }}</b></span>
            <span>{{ hoursOf(doctor.times) }}</span>
          </p>
        }

        <div>
          <p class="muted xs">Next free{{ places.length > 1 && h ? ' at ' + h.name : '' }}</p>
          <div class="slots">
            @if (ns.length) {
              @for (s of ns; track s.o + s.t) {
                <button
                  class="slot"
                  (click)="bookSlot(P.id, s.o, s.t)">
                  {{ s.o === 0 ? 'Today' : doctorsService.shortDay(s.o) }} {{ doctorsService.formatTime(s.t) }}
                </button>
              }
            } @else {
              <span class="muted sm">No free slots this week</span>
            }
          </div>
        </div>

        <button
          class="btn btn-ink full"
          [disabled]="!ns.length"
          (click)="bookSlot(P.id, ns[0].o, ns[0].t)">
          Book appointment
        </button>
      </article>
    }
  `
})
export class DoctorCardComponent {
  @Input({ required: true }) doctor!: Doctor;

  router = inject(Router);
  doctorsService = inject(DoctorsService);
  hospitalsService = inject(HospitalsService);
  reviewsService = inject(ReviewsService);
  modalService = inject(ModalService);

  getDocRating(id: number) {
    return this.reviewsService.getDocStats(id);
  }

  onCardClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, label, summary, details, .slot, .dc-pl, .btn')) {
      return;
    }
    if (this.doctor) {
      this.router.navigate(['/doctor', this.doctor.id]);
    }
  }

  selectedPlaceIndex = 0;

  WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  allPlaces(): (Doctor | Place)[] {
    return this.doctorsService.placesOf(this.doctor);
  }

  selectedPlace(): Doctor | Place {
    const places = this.allPlaces();
    return places[this.selectedPlaceIndex] || this.doctor;
  }

  onSelectPlace(idx: number): void {
    this.selectedPlaceIndex = idx;
    this.doctorsService.selectPlace(this.doctor.id, idx);
  }

  nextSlots(): Slot[] {
    return this.doctorsService.nextSlots(this.selectedPlace(), 3);
  }

  isFreeToday(): boolean {
    const ns = this.nextSlots();
    return ns.length > 0 && ns[0].o === 0;
  }

  getHospital(hId: string) {
    return this.hospitalsService.getHospitalById(hId);
  }

  getInitials(name: string): string {
    return name.replace('Dr. ', '').split(' ').map(w => w[0]).slice(0, 2).join('');
  }

  getSpec(specKey: string): string {
    return SPEC[specKey] || specKey;
  }

  dayRange(days: number[]): string {
    const s = [...days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
    const runs: number[][] = [];
    let cur = [s[0]];
    for (let i = 1; i < s.length; i++) {
      if (((s[i] + 6) % 7) === ((s[i - 1] + 6) % 7) + 1) {
        cur.push(s[i]);
      } else {
        runs.push(cur);
        cur = [s[i]];
      }
    }
    runs.push(cur);
    return runs.map(r => r.length > 2 ? `${this.WD[r[0]]}–${this.WD[r[r.length - 1]]}` : r.map(x => this.WD[x]).join(', ')).join(', ');
  }

  hoursOf(times?: string[]): string {
    if (!times || !times.length) return '';
    const a = times[0];
    const b = times[times.length - 1].split(':');
    const e = `${(+b[0]) + 1}:${b[1]}`;
    return `${this.doctorsService.formatTime(a)} – ${this.doctorsService.formatTime(e)}`;
  }

  bookSlot(id: number, o?: number, t?: string): void {
    this.modalService.openBooking(id, o, t);
  }
}
