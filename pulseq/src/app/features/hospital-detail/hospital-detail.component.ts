import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HospitalsService } from '../../shared/services/hospitals.service';
import { DoctorsService } from '../../shared/services/doctors.service';
import { ReviewsService } from '../../shared/services/reviews.service';
import { ToastService } from '../../shared/services/toast.service';
import { SeoService } from '../../shared/services/seo.service';
import { DoctorCardComponent } from '../../shared/components/doctor-card/doctor-card.component';
import { Hospital, Doctor } from '../../shared/models';
import { SPEC } from '../../data/specialties.data';

@Component({
  selector: 'app-hospital-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DoctorCardComponent],
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
          <div class="dp-card hrv" id="hreviews" *ngIf="stats() as s" style="margin-top:48px">
            <h3 style="font-size:24px;margin-bottom:16px">Patient reviews</h3>
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
                  <span style="font-size:14px;color:#526477;min-width:90px">Cleanliness</span>
                  <div style="flex:1;height:8px;background:#E2E8F0;border-radius:999px;overflow:hidden">
                    <div [style.width.%]="(s.w / 5) * 100" style="height:100%;background:#2381FF;border-radius:999px"></div>
                  </div>
                  <b>{{ s.w.toFixed(1) }}</b>
                </div>
                <div class="rv-asp" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
                  <span style="font-size:14px;color:#526477;min-width:90px">Staff care</span>
                  <div style="flex:1;height:8px;background:#E2E8F0;border-radius:999px;overflow:hidden">
                    <div [style.width.%]="(s.l / 5) * 100" style="height:100%;background:#2381FF;border-radius:999px"></div>
                  </div>
                  <b>{{ s.l.toFixed(1) }}</b>
                </div>
                <div class="rv-asp" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
                  <span style="font-size:14px;color:#526477;min-width:90px">Facilities</span>
                  <div style="flex:1;height:8px;background:#E2E8F0;border-radius:999px;overflow:hidden">
                    <div [style.width.%]="(s.c / 5) * 100" style="height:100%;background:#2381FF;border-radius:999px"></div>
                  </div>
                  <b>{{ s.c.toFixed(1) }}</b>
                </div>
              </div>
            </div>

            <!-- Review list -->
            <ul class="rv-list" style="list-style:none;padding:0;margin:24px 0 0;display:flex;flex-direction:column;gap:16px">
              @for (r of s.list; track $index) {
                <li class="rv" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:8px">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
                    <div style="display:flex;align-items:center;gap:10px">
                      <div style="width:36px;height:36px;border-radius:12px;background:#EFF6FF;color:#1558B8;font-weight:700;display:flex;align-items:center;justify-content:center">
                        {{ r.n[0] || 'P' }}
                      </div>
                      <div>
                        <b style="font-size:15px;color:#102A43;display:block">{{ r.n }}</b>
                        <span class="xs" style="color:#166534;font-weight:600">✓ Verified visit</span>
                      </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:4px;color:#1558B8;font-weight:700;font-size:14px">
                      ★ {{ ((r.w + r.l + r.c) / 3).toFixed(1) }}
                    </div>
                  </div>
                  <p style="margin:0;font-size:15px;color:#33475B;line-height:1.45">{{ r.t }}</p>
                </li>
              }
            </ul>

            <!-- Add your review form (matching Photo 4) -->
            <form class="rv-form" (submit)="submitReview($event)" style="margin-top:24px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:16px">
              <h4 style="margin:0;font-size:18px;color:#102A43">Add your review</h4>
              <div>
                <label class="lbl" for="newHospRevName">Your name (optional)</label>
                <input class="inp" id="newHospRevName" type="text" [(ngModel)]="revName" name="revName" placeholder="Your name (optional)">
              </div>

              <div>
                <span class="lbl">Cleanliness</span>
                <div style="display:flex;gap:8px;margin-top:6px">
                  @for (star of [1,2,3,4,5]; track star) {
                    <button type="button" class="btn" [class.btn-ink]="revClean === star" [class.btn-line]="revClean !== star" (click)="revClean = star" style="flex:1;min-height:44px;font-weight:700">
                      {{ star }}
                    </button>
                  }
                </div>
              </div>

              <div>
                <span class="lbl">Staff care</span>
                <div style="display:flex;gap:8px;margin-top:6px">
                  @for (star of [1,2,3,4,5]; track star) {
                    <button type="button" class="btn" [class.btn-ink]="revStaff === star" [class.btn-line]="revStaff !== star" (click)="revStaff = star" style="flex:1;min-height:44px;font-weight:700">
                      {{ star }}
                    </button>
                  }
                </div>
              </div>

              <div>
                <span class="lbl">Facilities</span>
                <div style="display:flex;gap:8px;margin-top:6px">
                  @for (star of [1,2,3,4,5]; track star) {
                    <button type="button" class="btn" [class.btn-ink]="revFac === star" [class.btn-line]="revFac !== star" (click)="revFac = star" style="flex:1;min-height:44px;font-weight:700">
                      {{ star }}
                    </button>
                  }
                </div>
              </div>

              <div>
                <label class="lbl" for="newHospRevText">Your review</label>
                <textarea class="inp" id="newHospRevText" [(ngModel)]="revComment" name="revComment" rows="3" placeholder="How was your visit? Please do not share medical details."></textarea>
              </div>

              <button class="btn btn-coral full" type="submit" style="min-height:48px">Post review</button>
            </form>
          </div>
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
    .dp-card { background: #fff; border-radius: 28px; padding: clamp(18px, 3vw, 28px); box-shadow: inset 0 0 0 1.5px #E2E8F0; }
    .pbs { display: flex; flex-wrap: wrap; gap: 24px 32px; align-items: center; margin-bottom: 20px; }
    .pbs-l { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; }
    .pbs-mood { font-family: var(--disp); font-size: 17px; font-weight: 700; color: #102A43; }
    .pbs-r { flex: 1 1 280px; }
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

  // Review Form state
  revClean = 5;
  revStaff = 5;
  revFac = 5;
  revName = '';
  revComment = '';

  stats = computed(() => {
    return this.hospital ? this.reviewsService.getHospStats(this.hospital.id) : null;
  });

  submitReview(e: Event): void {
    e.preventDefault();
    if (!this.hospital) return;
    this.reviewsService.addHospReview(this.hospital.id, {
      w: this.revClean,
      l: this.revStaff,
      c: this.revFac,
      t: this.revComment.trim() || 'Clean facility and helpful staff.',
      n: this.revName.trim() || 'Patient'
    });
    this.toastService.show('Thank you! Your hospital review has been added.');
    this.revComment = '';
    this.revName = '';
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
