import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DoctorsService } from '../../shared/services/doctors.service';
import { HospitalsService } from '../../shared/services/hospitals.service';
import { ModalService } from '../../shared/services/modal.service';
import { SeoService } from '../../shared/services/seo.service';
import { Doctor, Place } from '../../shared/models';
import { SPEC } from '../../data/specialties.data';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [RouterLink],
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

            <p class="dp-sample">
              <b>Sample profile.</b> Degrees, experience and timings come from the doctor and are checked before a profile goes live.
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
  `]
})
export class DoctorProfileComponent implements OnInit {
  doctorsService = inject(DoctorsService);
  hospitalsService = inject(HospitalsService);
  modalService = inject(ModalService);
  seo = inject(SeoService);
  route = inject(ActivatedRoute);

  doctor: Doctor | null = null;
  specMap = SPEC;
  weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
