import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HospitalsService } from '../../shared/services/hospitals.service';
import { DoctorsService } from '../../shared/services/doctors.service';
import { ReviewsService, ReviewStats, HOSP_ASPECTS } from '../../shared/services/reviews.service';
import { ToastService } from '../../shared/services/toast.service';
import { SeoService } from '../../shared/services/seo.service';
import { PatientReviewsComponent, SubmittedReview } from '../../shared/components/patient-reviews/patient-reviews.component';
import { Hospital, Doctor, Place } from '../../shared/models';
import { SPEC } from '../../data/specialties.data';

@Component({
  selector: 'app-hospital-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PatientReviewsComponent],
  template: `
    <section class="sec pg-hosps" id="page-hosps">
      <div class="wrap" id="hpRoot">
        @if (hospital) {
          <a class="pgback" routerLink="/hospitals">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7"></path>
            </svg>
            All hospitals
          </a>

          <!-- Big Hospital Banner -->
          <div class="hosp-top hdet t{{ hospital.t }}" [attr.style]="hPh(hospital)">
            <span class="big">{{ hospital.name[0] }}</span>
            <div class="hd-txt">
              <span class="eyebrow" style="color:#BFD9FF">{{ hospital.city }}</span>
              <h2>{{ hospital.name }}</h2>
              <div class="deptpills">
                @for (part of hospital.depts.split(' · '); track part) {
                  <span>{{ part }}</span>
                }
              </div>
            </div>
            @if (hospital.badge) {
              <span class="tag">{{ hospital.badge }}</span>
            }
          </div>

          <!-- Stats Bar -->
          <div class="pgstats">
            <div class="pgstat">
              <b>{{ doctors().length }}</b>
              <span>Doctors on PulseQ</span>
            </div>
            <div class="pgstat">
              <b>{{ freeTodayCount() }}</b>
              <span>Free today</span>
            </div>
            <div class="pgstat">
              <b>{{ availableSpecialties().length }}</b>
              <span>Specialties</span>
            </div>
            <div class="pgstat">
              <b>{{ hospital.badge ? '24/7' : 'Day' }}</b>
              <span>{{ hospital.badge ? 'Emergency care' : 'Clinic hours' }}</span>
            </div>
          </div>

          <!-- Doctors section -->
          <div class="sec-head" style="margin:44px 0 20px">
            <div style="display:flex;flex-direction:column;gap:10px">
              <span class="eyebrow">Doctors</span>
              <h2 style="font-size:clamp(26px,3.0vw,33px)">Book a doctor at {{ hospital.name }}</h2>
            </div>

            <div class="chips" role="group" aria-label="Filter by specialty">
              <button
                class="chip"
                [class.on]="selectedSpec === 'all'"
                type="button"
                (click)="selectedSpec = 'all'">
                All
              </button>
              @for (s of availableSpecialties(); track s) {
                <button
                  class="chip"
                  [class.on]="selectedSpec === s"
                  type="button"
                  (click)="selectedSpec = s">
                  {{ specMap[s] || s }}
                </button>
              }
            </div>
          </div>

          <!-- Doctor directory -->
          <div class="dlist">
            @let docs = filteredDoctors();
            @if (docs.length > 0) {
              @for (d of docs; track d.id) {
                @let place = placeAtHospital(d);
                @let slots = doctorsService.nextSlots(place, 2);
                @let rating = getDocRating(d.id);
                <article class="drow">
                  <a class="dr-id" [routerLink]="['/doctor', d.id]">
                    <span class="dc-ava t{{ d.t }}">
                      @if (d.photo) { <img [src]="d.photo" [alt]="d.name"> }
                      @else { {{ getInitials(d.name) }} }
                    </span>
                    <span class="min0">
                      <b class="dr-n">{{ d.name }}</b>
                      <span class="dr-s">{{ specMap[d.spec] || d.spec }} · {{ hospital.name }}{{ placesCount(d) > 1 ? ' · +' + (placesCount(d) - 1) + ' more place' + (placesCount(d) > 2 ? 's' : '') : '' }}</span>
                    </span>
                  </a>
                  <div class="dr-r">
                    <a class="rt" [routerLink]="['/doctor', d.id]" fragment="reviews">
                      <svg class="pulse" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2381FF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                      <b>{{ rating.avg.toFixed(1) }}</b><span>· {{ rating.n }} reviews</span>
                    </a>
                    <span class="tag">{{ place.mode }}</span>
                  </div>
                  <div class="dr-sl">
                    @if (slots.length > 0) {
                      @for (slot of slots; track slot.o + slot.t) {
                        <a class="slot" href="https://patient.pulseq.health">
                          {{ doctorsService.shortDay(slot.o) }} {{ doctorsService.formatTime(slot.t) }}
                        </a>
                      }
                    } @else {
                      <span class="muted sm">No free slots this week</span>
                    }
                  </div>
                  <div class="dr-act">
                    <b class="dc-fee">Rs {{ place.fee.toLocaleString('en-US') }}</b>
                    <a class="btn btn-ink" href="https://patient.pulseq.health">Book</a>
                  </div>
                </article>
              }
            } @else {
              <div class="empty" style="grid-column:1/-1">
                <h3 style="font-size:26px">No doctors listed yet</h3>
                <p class="muted">This hospital is joining PulseQ. Try searching for a similar doctor nearby.</p>
              </div>
            }
          </div>

          <!-- Hospital Reviews Section per PulseQ (16).html -->
          @if (stats(); as s) {
            <app-patient-reviews
              [stats]="s"
              [aspects]="hospAspects"
              entityType="hospital"
              sectionId="hreviews"
              (reviewSubmitted)="submitReview($event)">
            </app-patient-reviews>
          }
        } @else {
          <a class="pgback" routerLink="/hospitals">All hospitals</a>
          <div class="empty">
            <h3 style="font-size:26px">Hospital not found</h3>
            <p class="muted">We could not find the requested hospital profile.</p>
            <a class="btn btn-ink" routerLink="/hospitals">View all hospitals</a>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .pg-hosps { display: block !important; }
    .dlist { display: flex; flex-direction: column; gap: 10px; }
    .drow {
      display: grid;
      grid-template-columns: minmax(0, 1.6fr) minmax(0, .8fr) minmax(0, 1.2fr) auto;
      gap: 10px 22px;
      align-items: center;
      padding: 14px 18px;
      border-radius: 20px;
      background: #fff;
      box-shadow: inset 0 0 0 1.5px #D6E6FB;
    }
    .drow:hover { box-shadow: inset 0 0 0 2px #2381FF; }
    .drow .dc-ava { width: 52px; height: 52px; font-size: 17px; }
    .dr-id { display: flex; align-items: center; gap: 14px; min-width: 0; color: var(--fg); text-decoration: none; }
    .dr-id > .min0 { flex: 1; }
    .dr-n { display: block; font-size: 18px; line-height: 1.2; }
    .dr-s { display: block; margin-top: 2px; color: var(--muted); font-size: 14px; line-height: 1.35; }
    .dr-r { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
    .rt { display: inline-flex; align-items: center; gap: 6px; color: var(--fg); font-size: 14px; text-decoration: none; }
    .rt:hover { color: #1558B8; }
    .dr-sl { display: flex; flex-wrap: wrap; gap: 6px; }
    .dr-sl .slot { min-height: 38px; padding: 0 12px; font-size: 14px; }
    .dr-act { display: flex; align-items: center; gap: 10px; }
    .dr-act .dc-fee { white-space: nowrap; }
    .dr-act .btn { min-height: 44px; padding: 0 24px; }
    @media (max-width: 860px) {
      .drow {
        grid-template-columns: minmax(0, 1fr) auto;
        grid-template-areas: "id id" "rating action" "slots slots";
        padding: 14px;
      }
      .dr-id { grid-area: id; }
      .dr-r { grid-area: rating; flex-direction: row; align-items: center; flex-wrap: wrap; }
      .dr-act { grid-area: action; }
      .dr-sl { grid-area: slots; }
    }
    @media (max-width: 420px) {
      .drow { gap: 12px; }
      .dr-act { gap: 8px; }
      .dr-act .btn { padding-inline: 16px; }
      .dr-sl .slot { min-height: 36px; padding-inline: 10px; }
    }
  `]
})
export class HospitalDetailComponent implements OnInit {
  hospitalsService = inject(HospitalsService);
  doctorsService = inject(DoctorsService);
  reviewsService = inject(ReviewsService);
  toastService = inject(ToastService);
  seo = inject(SeoService);
  route = inject(ActivatedRoute);

  hospital: Hospital | null = null;
  selectedSpec = 'all';
  specMap = SPEC;
  hospAspects = HOSP_ASPECTS;

  stats(): ReviewStats | null {
    return this.hospital ? this.reviewsService.getHospStats(this.hospital.id) : null;
  }

  submitReview(rev: SubmittedReview): void {
    if (!this.hospital) return;
    this.reviewsService.addHospReview(this.hospital.id, rev);
    this.toastService.show('Thank you. Your review is posted.');
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.hospital = this.hospitalsService.getHospitalById(id) || null;
        if (this.hospital) {
          this.seo.setPage(`${this.hospital.name} · ${this.hospital.city}`);
        }
      }
    });
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          const el = document.getElementById(fragment);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    });
  }

  doctors(): Doctor[] {
    if (!this.hospital) return [];
    return this.hospitalsService.getDoctorsAtHospital(this.hospital.id);
  }

  freeTodayCount(): number {
    if (!this.hospital) return 0;
    return this.hospitalsService.getFreeTodayCount(this.hospital.id);
  }

  availableSpecialties(): string[] {
    const set = new Set<string>();
    this.doctors().forEach(d => set.add(d.spec));
    return Array.from(set);
  }

  filteredDoctors(): Doctor[] {
    return this.doctors().filter(d => this.selectedSpec === 'all' || d.spec === this.selectedSpec);
  }

  placeAtHospital(doctor: Doctor): Doctor | Place {
    return this.doctorsService.placesOf(doctor).find(place => place.h === this.hospital?.id) || doctor;
  }

  placesCount(doctor: Doctor): number {
    return this.doctorsService.placesOf(doctor).length;
  }

  getDocRating(id: number) {
    return this.reviewsService.getDocStats(id);
  }

  getInitials(name: string): string {
    return name.replace('Dr. ', '').split(' ').map(part => part[0]).slice(0, 2).join('');
  }

  hPh(h: Hospital): string | null {
    return h.photo ? `background-image:linear-gradient(180deg,rgba(12,45,94,.12),rgba(12,45,94,.6)),url(${h.photo});background-size:cover;background-position:center` : null;
  }
}
