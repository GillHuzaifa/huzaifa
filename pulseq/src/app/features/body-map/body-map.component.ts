import { Component, inject, signal, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { BM_AREAS, BM_CHILD } from '../../data/body-map.data';
import { SPEC, SPEC_PLURAL } from '../../data/specialties.data';
import { DoctorsService } from '../../shared/services/doctors.service';
import { HospitalsService } from '../../shared/services/hospitals.service';
import { ModalService } from '../../shared/services/modal.service';
import { SeoService } from '../../shared/services/seo.service';
import { Doctor } from '../../shared/models';
import { observeLazy3DBody, Body3DController } from '../../shared/utils/body-map-3d';

@Component({
  selector: 'app-body-map',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="sec bm" id="bodymap" style="min-height:75vh;padding-top:40px">
      <div class="wrap">
        <div class="bm-top">
          <span class="bm-new"><b>NEW</b>Pulse Body Map</span>
          <h2>Tap where it hurts. We find who to see.</h2>
          <p>Tap a spot on the body to see who to visit, with free slots.</p>
        </div>

        <div class="bm-grid">
          <!-- Body stage -->
          <div class="bm-fig">
            <p class="hand hnote" aria-hidden="true">
              tap where it hurts
              <svg width="34" height="26" viewBox="0 0 34 26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 4c10-3 22 2 26 16M28 20l-8-2M28 20l1-8"/>
              </svg>
            </p>
            <div class="bm-stage" id="bmStage" role="group" aria-label="Body map. Choose an area">
              <svg viewBox="0 0 200 440" aria-hidden="true">
                <defs>
                  <linearGradient id="bmg_bm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#fff" stop-opacity=".26"/>
                    <stop offset="1" stop-color="#fff" stop-opacity=".07"/>
                  </linearGradient>
                </defs>
                <g fill="url(#bmg_bm)" stroke="rgba(255,255,255,.55)" stroke-width="1.5">
                  <circle cx="100" cy="40" r="27"/>
                  <rect x="91" y="64" width="18" height="16" rx="6"/>
                  <path d="M58 84 Q100 70 142 84 L150 196 Q151 232 138 242 L62 242 Q49 232 50 196 Z"/>
                  <rect x="24" y="90" width="26" height="132" rx="13" transform="rotate(6 37 90)"/>
                  <rect x="150" y="90" width="26" height="132" rx="13" transform="rotate(-6 163 90)"/>
                  <rect x="62" y="236" width="35" height="188" rx="17"/>
                  <rect x="103" y="236" width="35" height="188" rx="17"/>
                </g>
                <g stroke="rgba(255,255,255,.55)" stroke-width="1.2" stroke-dasharray="3 3" fill="none">
                  <path d="M118 38L152 42"/>
                  <path d="M82 46L48 56"/>
                </g>
              </svg>

              @for (a of areas; track a.k) {
                <button
                  class="bm-dot"
                  type="button"
                  [class.on]="selectedKey() === a.k"
                  [attr.aria-label]="a.label"
                  [attr.aria-pressed]="selectedKey() === a.k"
                  [style.left.%]="a.x! / 2"
                  [style.top.%]="a.y! / 4.4"
                  (click)="selectArea(a.k)">
                  <i></i>
                </button>
              }

              <span class="bm-lbl" id="bmLbl" hidden></span>
            </div>
          </div>

          <!-- Recommendation Panel -->
          <div class="bm-panel" id="bmPanel" aria-live="polite">
            <div class="bm-chips" role="group" aria-label="Body area">
              @for (x of allOptions; track x.k) {
                <button
                  class="chip"
                  [class.on]="selectedKey() === x.k"
                  type="button"
                  [attr.aria-pressed]="selectedKey() === x.k"
                  (click)="selectArea(x.k)">
                  {{ x.label }}
                </button>
              }
            </div>

            @if (currentArea(); as a) {
              <div>
                <span class="eyebrow" style="color:#1558B8">YOU MAY WANT TO SEE</span>
                <h3 style="font-size:28px">{{ specMap[a.k] || a.label }}</h3>
              </div>

              <div class="why" aria-label="Common reasons">
                @for (w of a.why; track w) {
                  <span>{{ w }}</span>
                }
              </div>

              @let docs = matchingDoctors();
              @if (docs.length > 0) {
                <div class="bm-docs">
                  @for (d of docs; track d.id) {
                    @let n = nextSlot(d);
                    @let h = getHospital(d.h);
                    <div class="bm-doc">
                      <div class="dc-ava t{{ d.t }}">
                        @if (d.photo) {
                          <img [src]="d.photo" alt="">
                        } @else {
                          <span>{{ getInitials(d.name) }}</span>
                        }
                      </div>
                      <div class="who">
                        <b><a class="dlink" [routerLink]="['/doctor', d.id]">{{ d.name }}</a></b>
                        <span>{{ h?.name }} · {{ h?.city }} · Rs {{ d.fee.toLocaleString('en-US') }}</span>
                      </div>
                      @if (n) {
                        <button class="btn btn-ink" type="button" (click)="bookSlot(d, n.o, n.t)">
                          {{ formatSlot(n.o, n.t) }}
                        </button>
                      }
                    </div>
                  }
                </div>
              } @else {
                <p class="muted">No free slots right now. Ask Pulse to find the next opening.</p>
              }

              <div class="bm-foot" style="margin-top:16px">
                <small>Pulse suggests the kind of doctor. It does not diagnose.</small>
                <button class="btn btn-line" type="button" (click)="seeAllDoctors(a.k)">
                  See all {{ (specPluralMap[a.k] || 'doctors').toLowerCase() }}
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class BodyMapComponent implements OnInit, AfterViewInit, OnDestroy {
  doctorsService = inject(DoctorsService);
  hospitalsService = inject(HospitalsService);
  modalService = inject(ModalService);
  seo = inject(SeoService);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);

  areas = BM_AREAS;
  childArea = BM_CHILD;
  allOptions = [...BM_AREAS, BM_CHILD];

  selectedKey = signal<string>('heart');
  specMap = SPEC;
  specPluralMap = SPEC_PLURAL;

  body3D: Body3DController | null = null;
  private cancelLazy3D: (() => void) | null = null;

  ngOnInit(): void {
    this.seo.setPage('Pulse Body Map');
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const st = document.getElementById('bmStage');
      this.cancelLazy3D = observeLazy3DBody(
        st,
        () => this.selectedKey(),
        (k) => this.selectArea(k),
        (k) => this.currentArea()?.label || '',
        (ctrl) => { this.body3D = ctrl; }
      );
    }
  }

  ngOnDestroy(): void {
    this.cancelLazy3D?.();
    if (this.body3D) {
      this.body3D.destroy();
      this.body3D = null;
    }
  }

  currentArea() {
    const k = this.selectedKey();
    if (k === 'child') return this.childArea;
    return this.areas.find(a => a.k === k);
  }

  selectArea(k: string): void {
    this.selectedKey.set(k);
    if (this.body3D) {
      this.body3D.sync(k);
    }
  }

  matchingDoctors(): Doctor[] {
    const k = this.selectedKey();
    return this.doctorsService.doctors()
      .filter(d => !d.off && d.spec === k && this.doctorsService.nextSlots(d, 1).length > 0)
      .slice(0, 3);
  }

  nextSlot(d: Doctor) {
    const slots = this.doctorsService.nextSlots(d, 1);
    return slots.length > 0 ? slots[0] : null;
  }

  getHospital(hid: string) {
    return this.hospitalsService.getHospitalById(hid);
  }

  getInitials(name: string): string {
    return name.replace('Dr. ', '').split(' ').map(w => w[0]).slice(0, 2).join('');
  }

  formatSlot(offset: number, timeStr: string): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const day = offset === 0 ? 'Today' : offset === 1 ? 'Tmrw' : days[d.getDay()];
    return `${day} ${this.doctorsService.formatTime(timeStr)}`;
  }

  bookSlot(doc: Doctor, offset: number, time: string): void {
    this.modalService.openBooking(doc.id, offset, time);
  }

  seeAllDoctors(spec: string): void {
    this.router.navigate(['/find-doctors'], { queryParams: { spec } });
  }
}
