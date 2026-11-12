import { Component, inject, signal, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DoctorsService } from '../../shared/services/doctors.service';
import { HospitalsService } from '../../shared/services/hospitals.service';
import { SeoService } from '../../shared/services/seo.service';
import { DoctorCardComponent } from '../../shared/components/doctor-card/doctor-card.component';
import { ClinicDashboardComponent } from '../../shared/components/clinic-dashboard/clinic-dashboard.component';
import { SPEC, SPEC_PLURAL, CITIES } from '../../data/specialties.data';
import { SHOPS } from '../../data/pharmacies.data';
import { SITE } from '../../data/site.data';
import { BM_AREAS, BM_CHILD } from '../../data/body-map.data';
import { ABOUT } from '../../data/about.data';
import { Doctor, Hospital } from '../../shared/models';
import { observeLazy3DBody, Body3DController } from '../../shared/utils/body-map-3d';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    FormsModule,
    RouterLink,
    DoctorCardComponent,
    ClinicDashboardComponent,
  ],
  template: `
    <!-- PARTNERS STRIP WITH MARQUEE -->
    <section class="home pstrip" aria-label="Our partners">
      <div class="wrap"><p class="pstrip-h">Hospitals, clinics and pharmacies on PulseQ</p></div>
      <div class="marq-box">
        <div class="marq" id="marq">
          <!-- Repeat twice for infinite scroll loop -->
          <ng-container *ngFor="let rep of [0, 1]">
            <span *ngFor="let item of marqueeItems" class="pchip" [class.dup]="rep === 1" [attr.aria-hidden]="rep === 1">
              <i class="t{{ item.t }}">{{ item.n[0] }}</i>
              <span>{{ item.n }}<small>{{ item.s }}</small></span>
            </span>
          </ng-container>
        </div>
      </div>
    </section>

    <!-- PULSE BODY MAP -->
    <section class="sec bm home" id="bodymap">
      <div class="wrap">
        <div class="bm-top">
          <span class="bm-new"><b>NEW</b>Pulse Body Map</span>
          <h2>Tap where it hurts. We find who to see.</h2>
          <p>Tap a spot on the body to see who to visit, with free slots.</p>
        </div>
        <div class="bm-grid">
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
                  <linearGradient id="bmg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#fff" stop-opacity=".26"/>
                    <stop offset="1" stop-color="#fff" stop-opacity=".07"/>
                  </linearGradient>
                </defs>
                <g fill="url(#bmg)" stroke="rgba(255,255,255,.55)" stroke-width="1.5">
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

              <!-- Interactive Dot Overlays -->
              <button
                *ngFor="let a of bmAreas"
                class="bm-dot"
                [class.on]="selectedBmArea === a.k"
                (click)="selectBmArea(a.k)"
                [attr.aria-label]="a.label"
                [style.left.%]="a.x! / 2"
                [style.top.%]="a.y! / 4.4"
                type="button">
                <i></i>
              </button>
              <span *ngIf="currentBmAreaObj() as cur" class="bm-lbl" [style.left.%]="cur.x! / 2" [style.top.%]="cur.y! / 4.4">
                {{ cur.label }}
              </span>
            </div>
          </div>

          <!-- Body Map Side Panel -->
          <div class="bm-panel" id="bmPanel" aria-live="polite">
            <div class="bm-chips" role="group" aria-label="Body area">
              <button
                *ngFor="let x of allBmChips"
                class="chip"
                [class.on]="selectedBmArea === x.k"
                [attr.aria-pressed]="selectedBmArea === x.k"
                (click)="selectBmArea(x.k)"
                type="button">
                {{ x.label }}
              </button>
            </div>
            <div>
              <span class="eyebrow" style="color:#1558B8">YOU MAY WANT TO SEE</span>
              <h3 style="font-size:28px">{{ specMap[selectedBmArea] || selectedBmArea }}</h3>
            </div>
            <div class="why" aria-label="Common reasons">
              <span *ngFor="let w of (currentBmAreaObj()?.why || [])">{{ w }}</span>
            </div>
            <div class="bm-docs">
              <div *ngFor="let d of matchingBmDoctors()" class="bm-doc">
                <div class="dc-ava t{{ d.t }}">{{ getInitials(d.name) }}</div>
                <div class="who">
                  <b><a class="dlink" [routerLink]="['/doctor', d.id]">{{ d.name }}</a></b>
                  <span>{{ getHospitalName(d.h) }} · {{ getHospitalCity(d.h) }} · Rs {{ d.fee.toLocaleString('en-US') }}</span>
                </div>
                <a class="btn btn-ink" [attr.aria-label]="'Book an appointment with ' + d.name" href="https://patient.pulseq.health">
                  {{ getNextSlotText(d) }}
                </a>
              </div>
            </div>
            <div class="bm-foot" style="margin-top:16px">
              <a class="btn btn-line" routerLink="/find-doctors" [queryParams]="{ spec: selectedBmArea }">
                See all {{ (specPluralMap[selectedBmArea] || 'doctors').toLowerCase() }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS (3 STEPS) -->
    <section class="sec home">
      <div class="wrap">
        <div class="sec-head">
          <div style="display:flex;flex-direction:column;gap:14px">
            <span class="eyebrow">How it works</span>
            <h2>Three steps from symptom to seat.</h2>
          </div>
        </div>
        <div class="steps">
          <div class="step"><span class="n">1</span><h3 style="font-size:26px">Search for care</h3><p class="muted">Type a doctor, a hospital or a symptom in Urdu or English.</p></div>
          <div class="step"><span class="n">2</span><h3 style="font-size:26px">Pick a time that’s free</h3><p class="muted">Every slot you see is live. Confirm and the doctor’s diary closes it instantly.</p></div>
          <div class="step"><span class="n">3</span><h3 style="font-size:26px">Show your code, walk in</h3><p class="muted">Your booking code arrives right away. Show it at the desk and skip the queue.</p></div>
        </div>
      </div>
    </section>

    <!-- CLINIC DASHBOARD PREVIEW -->
    <section class="sec dk home" id="clinics">
      <div class="wrap">
        <div style="display:flex;flex-wrap:wrap;gap:24px 56px;align-items:flex-end;justify-content:space-between;margin-bottom:44px">
          <div style="display:flex;flex-direction:column;gap:18px;max-width:640px">
            <span class="eyebrow">For hospitals and clinics <span class="ur" lang="ur">· کلینک کے لیے</span></span>
            <h2 style="font-size:clamp(29px,4.3vw,55px);color:#fff">Fill the empty hours.</h2>
            <p class="muted" style="font-size:19px">List your hospital or clinic on PulseQ. Patients book your free slots, and your whole day sits on one dashboard.</p>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
            <a class="btn btn-mint" routerLink="/contact">List your clinic</a>
            <a routerLink="/clinics" style="color:#fff;font-weight:700;text-decoration:none;padding:12px 8px">Open dashboard</a>
          </div>
        </div>
        <app-clinic-dashboard></app-clinic-dashboard>
      </div>
    </section>

    <!-- ABOUT ON HOME (from PulseQ 14.html) -->
    <section class="sec tint home" id="hm-about">
      <div class="wrap">
        <div class="sec-head">
          <div style="display:flex;flex-direction:column;gap:14px">
            <span class="eyebrow">About PulseQ</span>
            <h2>Built because patients should not lose a day to waiting.</h2>
          </div>
          <a class="btn btn-line" routerLink="/about">Read our full story</a>
        </div>
        <div class="hm-story">
          @for (c of aboutData.story; track c[0]; let i = $index) {
            <div class="hm-ch">
              <span class="hm-n">{{ i + 1 }}</span>
              <h3>{{ c[0] }}</h3>
              <p>{{ getFirstSentence(c[1]) }}</p>
            </div>
          }
        </div>
        <div class="hm-team">
          <p class="eyebrow">Led by</p>
          <div class="hm-people">
            @for (m of aboutData.team; track m.name) {
              <a class="hm-p" routerLink="/about">
                <span class="hm-av">
                  @if (m.photo) {
                    <img [src]="m.photo" [alt]="m.name" loading="lazy" width="44" height="44">
                  } @else {
                    <span>{{ m.short }}</span>
                  }
                </span>
                <div>
                  <b>{{ m.name }}</b>
                  <small>{{ m.role }}</small>
                </div>
              </a>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- PULSEQ IN NUMBERS & NEWS -->
    <section class="sec home" id="impact">
      <div class="wrap">
        <div class="sec-head">
          <div style="display:flex;flex-direction:column;gap:14px">
            <span class="eyebrow">PulseQ in numbers</span>
            <h2>A growing network of care.</h2>
          </div>
          <svg width="220" height="44" viewBox="0 0 230 44" aria-hidden="true" style="max-width:100%">
            <path class="beat" d="M2 24h62l12-18 16 34 14-16h124" fill="none" stroke="#1D6FE0" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </div>
        <div class="stats" id="stats">
          <div *ngFor="let s of siteStats" class="stat {{ s.c }}">
            <b>{{ s.n | number }}{{ s.p || '' }}</b>
            <span>{{ s.l }}</span>
          </div>
        </div>
        <p class="muted xs" style="margin-top:12px">Counts reflect the doctors, hospitals, clinics, pharmacies and surgeons currently listed on this site.</p>

        <div class="sec-head" style="margin-top:72px">
          <div style="display:flex;flex-direction:column;gap:14px">
            <span class="eyebrow">News and updates</span>
            <h2>Latest from PulseQ</h2>
          </div>
        </div>
        <div class="news" id="news">
          <article *ngFor="let item of siteNews" class="st" style="gap:10px">
            <span class="tag" style="align-self:flex-start">{{ item.tag }}</span>
            <h3 style="font-size:20px">{{ item.h }}</h3>
            <p class="muted sm">{{ item.s }}</p>
            <span class="xs muted" style="margin-top:auto">{{ item.d }}</span>
          </article>
        </div>
      </div>
    </section>

    <!-- FAQ SECTION -->
    <section class="sec tint home" id="faq">
      <div class="wrap" style="display:flex;flex-wrap:wrap;gap:44px">
        <div style="flex:1 1 280px;min-width:0;display:flex;flex-direction:column;gap:16px;align-self:flex-start">
          <span class="eyebrow">Questions</span>
          <h2 style="font-size:clamp(26px,3.8vw,43px)">The fine print, in big print.</h2>
          <div class="faq-contact-card">
            <strong>Still stuck?</strong>
            <p>A real person will reply.</p>
            <a class="faq-contact-link" routerLink="/contact">Contact our team <span aria-hidden="true">&rarr;</span></a>
          </div>
        </div>
        <div style="flex:2 1 500px;display:flex;flex-direction:column;gap:12px;min-width:0">
          <details><summary>Do I pay online?</summary><p>You choose. Pay online when you book, or pay at the clinic when you arrive, depending on what the doctor offers.</p></details>
          <details><summary>Can I change or cancel a booking?</summary><p>Yes. Cancel from your appointments list, or reschedule within the time limit the clinic sets. You see the limit before you confirm.</p></details>
          <details><summary>How are doctors verified?</summary><p>Every doctor and facility is checked before their profile goes live on PulseQ.</p></details>
        </div>
      </div>
    </section>

    <!-- CTA BANNER -->
    <section class="wrap home" style="margin-bottom:48px">
      <div class="cta">
        <h2>Your next appointment is one sentence away.</h2>
        <div style="display:flex;flex-wrap:wrap;gap:12px">
          <a class="btn btn-ink" routerLink="/find-doctors" style="background:#0C2D5E;color:#fff">Find a doctor</a>
        </div>
      </div>
    </section>

  `
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  doctorsService = inject(DoctorsService);
  hospitalsService = inject(HospitalsService);
  seo = inject(SeoService);

  specMap = SPEC;
  cities = CITIES;
  docSpecKeys = Object.keys(SPEC);

  // Marquee
  marqueeItems = [
    ...this.hospitalsService.hospitals().map(h => ({ n: h.name, s: `${h.city} · Hospital or clinic`, t: h.t })),
    ...SHOPS.map((s, i) => ({ n: s.n, s: `${s.a} · Pharmacy`, t: (i % 5) + 1 }))
  ];

  // Body Map
  bmAreas = BM_AREAS;
  allBmChips = [...BM_AREAS, BM_CHILD];
  selectedBmArea = 'heart';

  // Condition search
  symptomQuery = '';
  symptomNote = '';

  // Doctor section filter
  docFilterSpec = 'all';
  docLimit = 6;

  // Hospitals filter
  hospCity = 'all';

  // Stats
  siteStats = [
    ...(SITE.patientsServed ? [{ n: SITE.patientsServed, l: 'Patients served', c: 't1', p: '+' }] : []),
    { n: this.doctorsService.doctors().filter(d => !d.off).length, l: 'Doctors listed', c: 't2', p: '' },
    { n: this.hospitalsService.hospitals().length, l: 'Hospitals and clinics', c: 't3', p: '' },
    { n: SHOPS.length, l: 'Partner pharmacies', c: 't4', p: '' },
    { n: 8, l: 'Surgeons', c: 't5', p: '' },
    { n: 24, l: 'Surgical procedures', c: 't1', p: '' }
  ];
  siteNews = SITE.news;

  // Home About Data from PulseQ (14).html
  aboutData = ABOUT;

  getFirstSentence(text: string): string {
    const parts = text.split(/(?<=[.!?])\s/);
    return parts[0] || text;
  }

  constructor() {
    this.seo.setPage('PulseQ — Your health, one tap away.');
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      if (window.location.hash) {
        setTimeout(() => {
          const id = window.location.hash.slice(1);
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }

  body3D: Body3DController | null = null;
  private cancelLazy3D: (() => void) | null = null;
  specPluralMap = SPEC_PLURAL;

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const st = document.getElementById('bmStage');
      this.cancelLazy3D = observeLazy3DBody(
        st,
        () => this.selectedBmArea,
        (k) => this.selectBmArea(k),
        (k) => this.currentBmAreaObj()?.label || '',
        (ctrl) => { this.body3D = ctrl; }
      );
    }
  }

  ngOnDestroy() {
    this.cancelLazy3D?.();
    if (this.body3D) {
      this.body3D.destroy();
      this.body3D = null;
    }
  }

  // Body Map
  currentBmAreaObj() {
    return this.bmAreas.find(a => a.k === this.selectedBmArea) || (this.selectedBmArea === 'child' ? BM_CHILD : this.bmAreas[0]);
  }

  selectBmArea(k: string) {
    this.selectedBmArea = k;
    if (this.body3D) {
      this.body3D.sync(k);
    }
  }

  matchingBmDoctors(): Doctor[] {
    return this.doctorsService.doctors()
      .filter(d => !d.off && d.spec === this.selectedBmArea && this.doctorsService.nextSlots(d, 1).length > 0)
      .slice(0, 3);
  }

  getHospitalName(id: string): string {
    const h = this.hospitalsService.getHospitalById(id);
    return h ? h.name : id;
  }

  getHospitalCity(id: string): string {
    const h = this.hospitalsService.getHospitalById(id);
    return h ? h.city : 'Pakistan';
  }

  getInitials(name: string): string {
    return name.replace('Dr. ', '').split(' ').map(w => w[0]).slice(0, 2).join('');
  }

  getNextSlotText(d: Doctor): string {
    const sl = this.doctorsService.nextSlots(d, 1);
    if (sl.length) {
      const s = sl[0];
      const day = s.o === 0 ? 'Today' : s.o === 1 ? 'Tmrw' : this.doctorsService.shortDay(s.o);
      return `${day} ${this.doctorsService.formatTime(s.t)}`;
    }
    return 'View slots';
  }

  // Condition Search
  searchSymptoms() {
    const q = this.symptomQuery.trim();
    if (!q) {
      this.symptomNote = 'Please describe what you are feeling.';
      return;
    }
    const detected = this.doctorsService.detectSpec(q);
    if (detected) {
      this.symptomNote = `Suggested specialist: ${SPEC[detected]}`;
      this.router.navigate(['/find-doctors'], { queryParams: { spec: detected, q } });
    } else {
      this.symptomNote = `No exact specialty match for "${q}". Search all doctors or try another symptom.`;
    }
  }

  filterBySpecialty(specKey: string) {
    this.router.navigate(['/find-doctors'], { queryParams: { spec: specKey } });
  }

  // Doctor section
  filteredDoctors(): Doctor[] {
    const spec = this.docFilterSpec;
    const docs = this.doctorsService.doctors().filter(d => !d.off);
    if (spec === 'all') return docs;
    return docs.filter(d => d.spec === spec);
  }

  visibleDoctors(): Doctor[] {
    return this.filteredDoctors().slice(0, this.docLimit);
  }


  // Hospitals section
  filteredHospitals(): Hospital[] {
    const c = this.hospCity;
    const list = this.hospitalsService.hospitals();
    if (c === 'all') return list;
    return list.filter(h => h.city.toLowerCase() === c.toLowerCase());
  }

}
