import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorsService } from '../../shared/services/doctors.service';
import { HospitalsService } from '../../shared/services/hospitals.service';
import { ModalService } from '../../shared/services/modal.service';
import { SeoService } from '../../shared/services/seo.service';
import { ReviewsService, ReviewStats } from '../../shared/services/reviews.service';
import { ToastService } from '../../shared/services/toast.service';
import { Doctor, Place } from '../../shared/models';
import { SPEC } from '../../data/specialties.data';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

            <!-- Patient Reviews Section per user prompt & 16.html -->
            <div class="dp-card" id="reviews" *ngIf="stats() as s">
              <h3>Patient reviews</h3>
              <div class="rv-sum pbs">
                <div class="pbs-l">
                  <div class="pb-ring" style="width:84px;height:84px;border-radius:50%;background:#EFF6FF;border:4px solid #2381FF;display:flex;align-items:center;justify-content:center">
                    <b style="font-size:26px;color:#102A43">{{ s.avg.toFixed(1) }}</b>
                  </div>
                  <b class="pbs-mood">{{ reviewsService.mood(s.avg) }}</b>
                  <span class="muted xs">PulseQ patient score from {{ s.n }} reviews</span>
                </div>
                <div class="pbs-r" style="display:flex;flex-direction:column;gap:12px">
                  <div class="rv-asp" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
                    <span style="font-size:14px;color:#526477">Wait time</span>
                    <div style="flex:1;height:8px;background:#E2E8F0;border-radius:999px;overflow:hidden">
                      <div [style.width.%]="(s.w / 5) * 100" style="height:100%;background:#2381FF;border-radius:999px"></div>
                    </div>
                    <b>{{ s.w.toFixed(1) }}</b>
                  </div>
                  <div class="rv-asp" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
                    <span style="font-size:14px;color:#526477">Listening</span>
                    <div style="flex:1;height:8px;background:#E2E8F0;border-radius:999px;overflow:hidden">
                      <div [style.width.%]="(s.l / 5) * 100" style="height:100%;background:#2381FF;border-radius:999px"></div>
                    </div>
                    <b>{{ s.l.toFixed(1) }}</b>
                  </div>
                  <div class="rv-asp" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
                    <span style="font-size:14px;color:#526477">Clear advice</span>
                    <div style="flex:1;height:8px;background:#E2E8F0;border-radius:999px;overflow:hidden">
                      <div [style.width.%]="(s.c / 5) * 100" style="height:100%;background:#2381FF;border-radius:999px"></div>
                    </div>
                    <b>{{ s.c.toFixed(1) }}</b>
                  </div>
                </div>
              </div>

              <!-- Reviews List -->
              <ul class="rv-list" style="margin-top:20px;list-style:none;padding:0;display:flex;flex-direction:column;gap:14px">
                @for (r of s.list; track r.n + r.t) {
                  <li class="rv" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:18px;padding:16px;display:flex;gap:14px">
                    <span class="rv-av" style="width:40px;height:40px;border-radius:12px;background:#DBEAFE;color:#1558B8;font-weight:700;display:flex;align-items:center;justify-content:center;flex:none">
                      {{ r.n[0] || 'P' }}
                    </span>
                    <div style="flex:1;min-width:0">
                      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                        <b>{{ r.n }}</b>
                        <span class="tag" style="background:#DCFCE7;color:#166534;font-size:11px" *ngIf="r.ver">Verified patient</span>
                        <span class="tag" style="background:#FEF3C7;color:#78350F;font-size:11px" *ngIf="r.sample">Sample review</span>
                      </div>
                      <p style="margin:6px 0 0;font-size:14.5px;color:#102A43">“{{ r.t }}”</p>
                    </div>
                  </li>
                }
              </ul>

              <!-- Add Your Review Form with 5 large rating buttons per question -->
              <form class="rv-form" (submit)="submitReview($event)" style="margin-top:24px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:16px">
                <h4 style="margin:0;font-size:18px;color:#102A43">Add your review</h4>
                <div>
                  <label class="lbl" for="newRevName">Your name (optional)</label>
                  <input class="inp" id="newRevName" type="text" [(ngModel)]="revName" name="revName" placeholder="e.g. Ali K.">
                </div>

                <div>
                  <span class="lbl">Wait time (1 to 5)</span>
                  <div style="display:flex;gap:8px;margin-top:6px">
                    @for (star of [1,2,3,4,5]; track star) {
                      <button type="button" class="btn" [class.btn-ink]="revWait === star" [class.btn-line]="revWait !== star" (click)="revWait = star" style="flex:1;min-height:44px;font-weight:700">
                        {{ star }}★
                      </button>
                    }
                  </div>
                </div>

                <div>
                  <span class="lbl">Listening (1 to 5)</span>
                  <div style="display:flex;gap:8px;margin-top:6px">
                    @for (star of [1,2,3,4,5]; track star) {
                      <button type="button" class="btn" [class.btn-ink]="revListen === star" [class.btn-line]="revListen !== star" (click)="revListen = star" style="flex:1;min-height:44px;font-weight:700">
                        {{ star }}★
                      </button>
                    }
                  </div>
                </div>

                <div>
                  <span class="lbl">Clear advice (1 to 5)</span>
                  <div style="display:flex;gap:8px;margin-top:6px">
                    @for (star of [1,2,3,4,5]; track star) {
                      <button type="button" class="btn" [class.btn-ink]="revAdvice === star" [class.btn-line]="revAdvice !== star" (click)="revAdvice = star" style="flex:1;min-height:44px;font-weight:700">
                        {{ star }}★
                      </button>
                    }
                  </div>
                </div>

                <div>
                  <label class="lbl" for="newRevText">Your experience</label>
                  <textarea class="inp" id="newRevText" [(ngModel)]="revComment" name="revComment" rows="3" placeholder="How was your visit? (timings, doctor's response)"></textarea>
                </div>

                <button class="btn btn-coral full" type="submit" style="min-height:48px">Post review</button>
              </form>
            </div>

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
                    <span>Rs {{ p.fee.toLocaleString('en-US') }} · {{ p.mode }}</span>
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

  // Review Form
  revName = '';
  revWait = 5;
  revListen = 5;
  revAdvice = 5;
  revComment = '';

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

  submitReview(e: Event) {
    e.preventDefault();
    if (!this.doctor) return;
    this.reviewsService.addDocReview(this.doctor.id, {
      w: this.revWait,
      l: this.revListen,
      c: this.revAdvice,
      t: this.revComment.trim(),
      n: this.revName.trim() || 'Patient'
    });
    this.revComment = '';
    this.toast.show('Thank you! Your review has been posted.');
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

