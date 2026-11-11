import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HospitalsService } from '../../shared/services/hospitals.service';
import { DoctorsService } from '../../shared/services/doctors.service';
import { ReviewsService, ReviewStats, HOSP_ASPECTS } from '../../shared/services/reviews.service';
import { ToastService } from '../../shared/services/toast.service';
import { SeoService } from '../../shared/services/seo.service';
import { DoctorCardComponent } from '../../shared/components/doctor-card/doctor-card.component';
import { PatientReviewsComponent, SubmittedReview } from '../../shared/components/patient-reviews/patient-reviews.component';
import { Hospital, Doctor } from '../../shared/models';
import { SPEC } from '../../data/specialties.data';

@Component({
  selector: 'app-hospital-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DoctorCardComponent, PatientReviewsComponent],
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

          <!-- Doctor Grid -->
          <div class="doc-grid">
            @let docs = filteredDoctors();
            @if (docs.length > 0) {
              @for (d of docs; track d.id) {
                <app-doctor-card [doctor]="d"></app-doctor-card>
              }
            } @else {
              <div class="empty" style="grid-column:1/-1">
                <h3 style="font-size:26px">No doctors listed yet</h3>
                <p class="muted">This hospital is joining PulseQ. Ask Pulse to find a similar doctor nearby.</p>
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

  hPh(h: Hospital): string | null {
    return h.photo ? `background-image:linear-gradient(180deg,rgba(12,45,94,.12),rgba(12,45,94,.6)),url(${h.photo});background-size:cover;background-position:center` : null;
  }
}
