import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DoctorsService } from '../../shared/services/doctors.service';
import { HospitalsService } from '../../shared/services/hospitals.service';
import { ModalService } from '../../shared/services/modal.service';
import { SeoService } from '../../shared/services/seo.service';
import { ReviewsService, ReviewStats, DOC_ASPECTS } from '../../shared/services/reviews.service';
import { ToastService } from '../../shared/services/toast.service';
import { PatientReviewsComponent, SubmittedReview } from '../../shared/components/patient-reviews/patient-reviews.component';
import { Doctor, Place } from '../../shared/models';
import { SPEC } from '../../data/specialties.data';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, PatientReviewsComponent],
  template: `
    <section class="sec pg-doctor" id="page-doctor">
      <div class="wrap" id="dpRoot">
      @if (doctor) {
        <a class="pgback" routerLink="/find-doctors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7"></path>
          </svg>
          All doctors
        </a>

        <!-- Doctor Header -->
        <div class="dp-head">
          <div class="dp-ava t{{ doctor.t }}">
            @if (doctor.photo) {
              <img [src]="doctor.photo" [alt]="doctor.name">
            } @else {
              <span>{{ getInitials(doctor.name) }}</span>
            }
          </div>
          <div class="dp-id">
            <span class="sp">{{ specMap[doctor.spec] }}</span>
            <h2>{{ doctor.name }}</h2>
            <div class="dp-rating" *ngIf="stats() as s">
              <span class="rt">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#2381FF"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <b>{{ s.avg.toFixed(1) }}</b>
                <span class="muted sm">({{ s.n }} {{ s.n === 1 ? 'review' : 'reviews' }})</span>
              </span>
            </div>
            <div class="dp-pills">
              <span>{{ (doctor.deg || []).join(' · ') }}</span>
              @if (doctor.exp) {
                <span>{{ doctor.exp }} years experience</span>
              }
              <span>{{ (doctor.lang || []).join(', ') }}</span>
              @if (doctor.reg) {
                <span>PMDC {{ doctor.reg }}</span>
              }
            </div>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="dp-grid">
          <div class="dp-main">
            <div class="dp-card">
              <h3>About</h3>
              <p>{{ doctor.about }}</p>
            </div>

            <div class="dp-card">
              <h3>Qualifications</h3>
              <ul class="dp-list">
                @for (d of doctor.deg; track d) {
                  <li><i>✓</i><span>{{ d }}</span></li>
                }
                @if (doctor.exp) {
                  <li><i>✓</i><span>{{ doctor.exp }} years of clinical experience</span></li>
                }
                @if (doctor.lang) {
                  <li><i>✓</i><span>Speaks {{ doctor.lang.join(', ') }}</span></li>
                }
              </ul>
            </div>

            @if (doctor.focus && doctor.focus.length) {
              <div class="dp-card">
                <h3>Treats</h3>
                <div class="dp-tags">
                  @for (f of doctor.focus; track f) {
                    <span>{{ f }}</span>
                  }
                </div>
              </div>
            }

            <!-- Patient Reviews Section per PulseQ (16).html -->
            @if (stats(); as s) {
              <app-patient-reviews
                [stats]="s"
                [aspects]="docAspects"
                entityType="doctor"
                sectionId="reviews"
                (reviewSubmitted)="submitReview($event)">
              </app-patient-reviews>
            }

            <p class="dp-sample" style="margin-top:20px">
              <b>Verified profile.</b> Degrees, experience and timings come from the doctor and are checked before a profile goes live.
            </p>
          </div>

          <!-- Locations Sidebar -->
          <aside class="dp-side" aria-label="Where and when">
            <div class="dp-card">
              <h3>{{ places().length > 1 ? 'Practice locations' : 'Timings and booking' }}</h3>
              <p class="muted sm">
                From Rs {{ minFee().toLocaleString('en-US') }}
                @if (places().length > 1) {
                  · sees patients at {{ places().length }} places
                }
              </p>

              @for (p of places(); track p.id; let i = $index) {
                @let h = hospitalsService.getHospitalById(p.h);
                @let ns = doctorsService.nextSlots(p, 4);

                <div class="dp-loc">
                  <div>
                    <h4>{{ h ? h.name : p.h }}</h4>
                    <p class="muted sm">
                      {{ h ? h.city : '' }} {{ i === 0 ? '· main practice' : '· also practises here' }}
                    </p>
                  </div>

                  <div class="dp-week" aria-label="Days available">
                    @for (w of [1,2,3,4,5,6,0]; track w) {
                      <span
                        [class.on]="(p.days || []).includes(w)"
                        [title]="weekDays[w]">
                        {{ weekDays[w][0] }}
                      </span>
                    }
                  </div>

                  <div class="row">
                    <span><b>{{ hoursOf(p.times) }}</b></span>
                    <span class="dp-fee-mode">
                      <b>Rs {{ p.fee.toLocaleString('en-US') }}</b>
                      <span class="doctor-mode" [class.video]="p.mode.toLowerCase().includes('video')">
                        @if (p.mode.toLowerCase().includes('video')) {
                          <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="5" width="10" height="10" rx="2"/><path d="m13 8 4-2v8l-4-2"/></svg>
                        } @else {
                          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v14M3 10h14"/></svg>
                        }
                        <span>{{ p.mode }}</span>
                      </span>
                    </span>
                  </div>

                  @if (ns.length) {
                    <div>
                      <p class="muted xs">Next free</p>
                      <div class="slots">
                        @for (s of ns; track s.o + s.t) {
                          <button
                            class="slot"
                            type="button"
                            (click)="bookSlot(p.id, s.o, s.t)">
                            {{ doctorsService.shortDay(s.o) }} {{ doctorsService.formatTime(s.t) }}
                          </button>
                        }
                      </div>
                    </div>
                  } @else {
                    <p class="muted sm">No free slots this week at this place.</p>
                  }

                  <button
                    class="btn"
                    [class.btn-ink]="i === 0"
                    [class.btn-line]="i > 0"
                    type="button"
                    [disabled]="!ns.length"
                    (click)="bookSlot(p.id, ns[0].o, ns[0].t)">
                    Book at {{ h ? h.name : p.h }}
                  </button>
                </div>
              }
            </div>
          </aside>
        </div>

        <!-- Sticky Bottom Booking Bar on Mobile (< 900px) -->
        <div class="dp-mobile-sticky-bar">
          <div>
            <span class="xs muted" style="display:block">Consultation</span>
            <b style="font-size:16px;color:#102A43">Rs {{ minFee().toLocaleString('en-US') }}</b>
          </div>
          <button class="btn btn-ink" type="button" (click)="bookSlot(doctor.id)">Book appointment</button>
        </div>
      } @else {
        <a class="pgback" routerLink="/find-doctors">All doctors</a>
        <div class="empty">
          <h3 style="font-size:26px">We could not find that doctor</h3>
          <p class="muted">They may no longer be listed.</p>
          <a class="btn btn-ink" routerLink="/find-doctors">Find doctors</a>
        </div>
      }
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .pg-doctor { display: block !important; }
    .dp-fee-mode { display: inline-flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 8px; min-width: 0; text-align: right; }
    .dp-fee-mode .doctor-mode { max-width: min(100%, 210px); }
    .dp-mobile-sticky-bar { display: none; }
    @media (max-width: 899px) {
      .dp-mobile-sticky-bar {
        display: flex !important;
        position: fixed !important;
        left: 0 !important;
        right: 0 !important;
        bottom: calc(56px + env(safe-area-inset-bottom, 0px)) !important;
        background: #ffffff !important;
        border-top: 1px solid #E2E8F0 !important;
        padding: 10px 16px !important;
        z-index: 980 !important;
        align-items: center !important;
        justify-content: space-between !important;
        box-shadow: 0 -4px 14px rgba(16, 42, 67, 0.08) !important;
      }
      .dp-mobile-sticky-bar .btn {
        min-height: 44px !important;
        padding: 0 20px !important;
      }
    }
  `]
})
export class DoctorProfileComponent implements OnInit {
  doctorsService = inject(DoctorsService);
  hospitalsService = inject(HospitalsService);
  reviewsService = inject(ReviewsService);
  modalService = inject(ModalService);
  toast = inject(ToastService);
  seo = inject(SeoService);
  route = inject(ActivatedRoute);

  doctor: Doctor | null = null;
  specMap = SPEC;
  weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  docAspects = DOC_ASPECTS;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const found = this.doctorsService.getDoctorById(id);
        this.doctor = found || null;
        if (this.doctor) {
          this.seo.setPage(`${this.doctor.name} · ${SPEC[this.doctor.spec] || ''}`);
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

  stats(): ReviewStats | null {
    if (!this.doctor) return null;
    return this.reviewsService.getDocStats(this.doctor.id);
  }

  submitReview(rev: SubmittedReview) {
    if (!this.doctor) return;
    this.reviewsService.addDocReview(this.doctor.id, rev);
    this.toast.show('Thank you. Your review is posted.');
  }

  places(): (Doctor | Place)[] {
    if (!this.doctor) return [];
    return this.doctorsService.placesOf(this.doctor);
  }

  minFee(): number {
    const p = this.places();
    if (!p.length) return 0;
    return Math.min(...p.map(x => x.fee));
  }

  getInitials(name: string): string {
    return name.replace('Dr. ', '').split(' ').map(w => w[0]).slice(0, 2).join('');
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
