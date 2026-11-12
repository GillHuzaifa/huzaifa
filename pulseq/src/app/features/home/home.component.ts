import { Component, inject, signal, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DoctorsService } from '../../shared/services/doctors.service';
import { HospitalsService } from '../../shared/services/hospitals.service';
import { ModalService } from '../../shared/services/modal.service';
import { SeoService } from '../../shared/services/seo.service';
import { DoctorCardComponent } from '../../shared/components/doctor-card/doctor-card.component';
import { SPEC, SPEC_PLURAL, CITIES } from '../../data/specialties.data';
import { SHOPS } from '../../data/pharmacies.data';
import { SITE } from '../../data/site.data';
import { BM_AREAS, BM_CHILD } from '../../data/body-map.data';
import { ABOUT } from '../../data/about.data';
import { Doctor, Hospital } from '../../shared/models';
import { observeLazy3DBody, Body3DController } from '../../shared/utils/body-map-3d';
import { MobileSheetService } from '../../shared/services/mobile-sheet.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    FormsModule,
    RouterLink,
    DoctorCardComponent,
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

    <!-- KNOW YOUR SIGNS (from PulseQ 14.html) -->
    <section class="ky home" id="knowsigns" aria-label="Heart and breast self-checks">
      <div class="wrap">
        <div class="ky-in">
          <div class="ky-lead">
            <span class="eyebrow">Know your signs</span>
            <h2>Two quick checks that can save a life.</h2>
            <p>Heart disease is the world’s leading cause of death, and breast cancer is the most common cancer in women. Both are far easier to treat when caught early.</p>
          </div>
          <button class="ky-t ky-h" type="button" (click)="openKy('heart')">
            <span class="ky-ic">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 20.5C5 15.5 3 12 3 8.8A4.8 4.8 0 0 1 12 6.5a4.8 4.8 0 0 1 9 2.3c0 3.200-2 6.700-9 11.700z" fill="#FEECEC"/>
                <path class="ky-ecg" d="M5 12h3.500l1.500-3 2.500 6 1.500-3H19"/>
              </svg>
            </span>
            <span>
              <b>Heart attack check</b>
              <small>Warning signs and your risk</small>
            </span>
            <span class="ky-go">2 min →</span>
          </button>
          <button class="ky-t ky-b" type="button" (click)="openKy('breast')">
            <span class="ky-ic">
              <svg class="ky-rib" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.500c2.600 0 4.200 1.800 4.200 4 0 2.200-1.700 3.700-3.200 5.200l3.800 6.800c.5.900 1.300 1.500 2.400 1.700l-.4 1.600c-1.700-.2-3-1-3.900-2.400L12 14.200l-2.900 4.700c-.9 1.400-2.200 2.200-3.900 2.400l-.4-1.600c1.100-.2 1.900-.8 2.400-1.700L11 11.700C9.500 10.200 7.800 8.700 7.800 6.500c0-2.200 1.600-4 4.200-4z"/>
              </svg>
            </span>
            <span>
              <b>Breast health check</b>
              <small>Self-exam guide and warning signs</small>
            </span>
            <span class="ky-go">2 min →</span>
          </button>
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
                <button class="btn btn-ink" type="button" (click)="bookBmDoctor(d)">
                  {{ getNextSlotText(d) }}
                </button>
              </div>
            </div>
            <div class="bm-foot" style="margin-top:16px">
              <small>Pulse suggests the kind of doctor. It does not diagnose.</small>
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
          <p class="muted">Still stuck? <a routerLink="/contact" style="color:var(--link);font-weight:700">Contact our team</a> and a real person will reply.</p>
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

    <!-- KY MODAL (from PulseQ 14.html) -->
    <div class="kym" [hidden]="!kyModalOpen" (click)="closeKyOnBackdrop($event)">
      <div class="kyp" role="dialog" aria-modal="true" aria-labelledby="kyTitle" tabindex="-1">
        <div class="sheet-handle" (touchstart)="onKyTouchStart($event)" (touchend)="onKyTouchEnd($event)" aria-hidden="true"></div>
        <div class="kyp-top">
          <div>
            <h3 id="kyTitle">{{ kyCurData.t }}</h3>
            <p class="muted sm" style="margin-top:4px">{{ kyCurData.s }}</p>
          </div>
          <button class="kyp-x" type="button" (click)="closeKy()" aria-label="Close">×</button>
        </div>
        <div id="kyBody">
          @for (group of kyCurData.g; track group.title; let gi = $index) {
            <h4>{{ group.title }}</h4>
            <div class="kyl" [class.kyl-rows]="gi === 0">
              @for (item of group.items; track item; let ii = $index) {
                <label>
                  <input type="checkbox" [checked]="kyChecked[gi + '_' + ii]" (change)="toggleKyItem(gi, ii)">
                  <span>{{ item }}</span>
                </label>
              }
            </div>
          }
          @if (kyResultHtml) {
            <div [innerHTML]="kyResultHtml" (click)="handleKyResultClick($event)"></div>
          }
        </div>
        <p class="kyn">This is an awareness tool, not a diagnosis. Nothing you tick is saved or sent anywhere.</p>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  doctorsService = inject(DoctorsService);
  hospitalsService = inject(HospitalsService);
  modalService = inject(ModalService);
  seo = inject(SeoService);
  private mobileSheet = inject(MobileSheetService);

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

  // Know your signs logic from PulseQ (14).html
  kyModalOpen = false;
  kyCur: 'heart' | 'breast' = 'heart';
  kyChecked: Record<string, boolean> = {};

  KY_CONFIG: Record<'heart' | 'breast', {
    t: string;
    s: string;
    spec: string;
    g: { title: string; items: string[]; type: string }[];
  }> = {
    heart: {
      t: "Heart attack check",
      s: "Tick anything that applies. The result updates as you go.",
      spec: "heart",
      g: [
        {
          title: "Happening right now",
          items: [
            "Chest pain, pressure or tightness",
            "Pain spreading to the left arm, jaw, neck or back",
            "Short of breath, even when resting",
            "Cold sweat, nausea or feeling faint"
          ],
          type: "u"
        },
        {
          title: "Your risk factors",
          items: [
            "Age 40 or over",
            "Smoker",
            "High blood pressure",
            "Diabetes",
            "High cholesterol",
            "Heart disease in the family",
            "Little exercise"
          ],
          type: "r"
        }
      ]
    },
    breast: {
      t: "Breast health check",
      s: "Tick any change you have noticed. A few minutes each month is enough.",
      spec: "general",
      g: [
        {
          title: "Changes you have noticed",
          items: [
            "A new lump or thickened area",
            "Lump or swelling in the underarm",
            "Change in size or shape",
            "Dimpling, redness or skin like an orange peel",
            "Nipple turned inward, rash or scaling",
            "Nipple discharge, especially bloody",
            "Pain in one spot that does not go away"
          ],
          type: "u"
        },
        {
          title: "About you",
          items: [
            "Age 40 or over",
            "Breast or ovarian cancer in the family",
            "Have never had a breast check"
          ],
          type: "r"
        }
      ]
    }
  };

  get kyCurData() {
    return this.KY_CONFIG[this.kyCur];
  }

  private kyTouchStartY = 0;

  onKyTouchStart(e: TouchEvent) {
    this.kyTouchStartY = e.touches[0]?.clientY || 0;
  }

  onKyTouchEnd(e: TouchEvent) {
    const endY = e.changedTouches[0]?.clientY || 0;
    if (endY - this.kyTouchStartY > 55) this.closeKy();
  }

  openKy(type: 'heart' | 'breast') {
    this.kyCur = type;
    this.kyChecked = {};
    this.kyModalOpen = true;
    this.mobileSheet.open('ky', () => { this.kyModalOpen = false; });
  }

  closeKy() {
    this.kyModalOpen = false;
    this.mobileSheet.close('ky');
  }

  closeKyOnBackdrop(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('kym')) {
      this.closeKy();
    }
  }

  toggleKyItem(gi: number, ii: number) {
    const key = gi + '_' + ii;
    this.kyChecked[key] = !this.kyChecked[key];
  }

  get kyResultHtml(): string {
    const cur = this.kyCurData;
    let uCount = 0;
    let rCount = 0;
    cur.g[0].items.forEach((_, ii: number) => { if (this.kyChecked['0_' + ii]) uCount++; });
    cur.g[1].items.forEach((_, ii: number) => { if (this.kyChecked['1_' + ii]) rCount++; });

    const isHeart = this.kyCur === 'heart';
    if (isHeart && uCount > 0) {
      return `<div class="kyr kyr-u">
        <b>Call 1122 now.</b>
        <p>These can be signs of a heart attack. Do not wait and do not drive yourself.</p>
        <ol>
          <li>Call 1122 (or your local emergency number).</li>
          <li>Sit down, stay calm and loosen tight clothing.</li>
          <li>Ask someone to stay with you and unlock the door.</li>
        </ol>
        <a class="btn" href="tel:1122" style="margin-top:12px">Call 1122</a>
      </div>`;
    }
    if (!isHeart && uCount > 0) {
      return `<div class="kyr kyr-a">
        <b>Please get this checked within a few days.</b>
        <p>Most breast changes are not cancer, but only an exam can tell, and early checking gives the best outcome.</p>
        ${rCount > 0 ? '<p>Because of your background, mention it to the doctor.</p>' : ''}
        <button class="btn btn-coral" type="button" style="margin-top:12px" data-action="book">Book a doctor now</button>
      </div>`;
    }
    if (isHeart && rCount >= 2) {
      return `<div class="kyr kyr-a">
        <b>Worth a heart check-up.</b>
        <p>You have ${rCount} risk factors. A blood pressure, sugar and cholesterol check can show where you stand. Learn the warning signs above: if any appear, call 1122.</p>
        <button class="btn btn-coral" type="button" style="margin-top:12px" data-action="book">Book a cardiologist now</button>
      </div>`;
    }
    if (isHeart) {
      return `<div class="kyr kyr-g">
        <b>${rCount > 0 ? 'Low risk for now.' : 'Nothing ticked.'}</b>
        <p>Keep it that way: walk 30 minutes most days, avoid tobacco, eat less salt and check your blood pressure every year. Women, older adults and people with diabetes can have milder signs such as unusual tiredness, nausea or back or jaw pain.</p>
      </div>`;
    }
    return `<div class="kyr kyr-g">
      <b>No changes ticked. Keep checking monthly.</b>
      <ol>
        <li><b style="display:inline;font-size:inherit">Look:</b> in a mirror with arms down, then raised, for changes in shape, skin or nipples.</li>
        <li><b style="display:inline;font-size:inherit">Feel:</b> with flat finger pads in small circles, covering the whole breast and underarm. Lying down helps.</li>
        <li><b style="display:inline;font-size:inherit">When:</b> about a week after your period ends, or on the same date each month.</li>
      </ol>
      ${rCount > 0 ? '<p>Ask a doctor about screening, such as a mammogram, since you ticked a risk factor.</p>' : ''}
      <button class="btn btn-coral" type="button" style="margin-top:12px" data-action="book">Book a doctor now</button>
    </div>`;
  }

  handleKyResultClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target && target.getAttribute('data-action') === 'book') {
      const spec = this.kyCur === 'heart' ? 'heart' : 'general';
      this.closeKy();
      this.router.navigate(['/find-doctors'], { queryParams: { spec } });
    }
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

  bookBmDoctor(d: Doctor) {
    const sl = this.doctorsService.nextSlots(d, 1);
    const s = sl[0] || { o: 0, t: '10:00' };
    this.modalService.openBooking(d.id, s.o, s.t);
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
