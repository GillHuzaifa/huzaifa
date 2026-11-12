import { Component, inject, signal, computed, OnInit, OnDestroy, PLATFORM_ID, Signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { DoctorsService } from '../../services/doctors.service';
import { HospitalsService } from '../../services/hospitals.service';
import { MedicineService } from '../../services/medicine.service';
import { ModalService } from '../../services/modal.service';
import { PulseAiService } from '../../services/pulse-ai.service';
import { Doctor, MedicineOrder } from '../../models';
import { SPEC, CITIES } from '../../../data/specialties.data';

const HIDS = [1, 2, 3, 4, 5, 6, 9, 10];
const SAY: Record<string, string> = {
  heart: "a heart specialist",
  skin: "a skin doctor",
  child: "a child specialist",
  eye: "an eye specialist",
  bones: "a bone specialist",
  neuro: "a neurologist",
  dental: "a dentist",
  general: "a general physician"
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Medicine order notification -->
    <button *ngIf="orderNotification() as order" class="apptbar order-notification" type="button" (click)="openOrderSummary(order)" [attr.aria-label]="'View order ' + order.code + ' summary'">
      <div class="wrap apptbar-in">
        <span class="live"></span>
        <span>Medicine order: <b>{{ order.code }}</b> · {{ orderStatusLabel(order) }}</span>
        <span class="apptbtn">View order summary</span>
      </div>
    </button>

    <!-- Header Container per PulseQ (14).html -->
    <header class="wrap">
      <div class="nav">
        <!-- Brand Logo on Top Left -->
        <a class="logo" routerLink="/" (click)="closeMobileMenu()" aria-label="PulseQ home">
          <img class="logo-mark" src="assets/Pulseq_logo.png" alt="" aria-hidden="true" width="46" height="46">
          <span>PulseQ</span>
        </a>

        <!-- Middle Navigation (Desktop >= 900px) - Exact match to PulseQ (14).html -->
        <nav class="nav-links" aria-label="Main">
          <a routerLink="/find-doctors" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Find doctors</a>
          <a routerLink="/hospitals" routerLinkActive="active">Hospitals</a>
          <a routerLink="/surgery" routerLinkActive="active">Surgery</a>
          <a routerLink="/medicine" routerLinkActive="active">Medicine</a>
          <a routerLink="/clinics" routerLinkActive="active">For clinics</a>
        </nav>

        <!-- Right Action Button & Mobile Hamburger -->
        <div class="nav-cta">
          <button class="ask-pulse-nav" type="button" (click)="pulseAi.open()" aria-label="Ask PulseQ">
            Ask Pulse
          </button>
          <a class="btn btn-ink desk-book" routerLink="/find-doctors">Book now</a>
          <button
            class="hamburger-btn"
            type="button"
            (click)="toggleMobileMenu()"
            [attr.aria-expanded]="mobileMenuOpen"
            aria-label="Toggle navigation menu">
            <svg *ngIf="!mobileMenuOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            <svg *ngIf="mobileMenuOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer (< 900px) - Exact Clean Links matching PulseQ (14).html -->
      <nav class="mobile-nav-drawer" *ngIf="mobileMenuOpen" aria-label="Mobile Navigation">
        <a routerLink="/find-doctors" routerLinkActive="active" (click)="closeMobileMenu()" class="mob-link-flat">Find doctors</a>
        <a routerLink="/hospitals" routerLinkActive="active" (click)="closeMobileMenu()" class="mob-link-flat">Hospitals</a>
        <a routerLink="/surgery" routerLinkActive="active" (click)="closeMobileMenu()" class="mob-link-flat">Surgery</a>
        <a routerLink="/medicine" routerLinkActive="active" (click)="closeMobileMenu()" class="mob-link-flat">Medicine</a>
        <a routerLink="/clinics" routerLinkActive="active" (click)="closeMobileMenu()" class="mob-link-flat">For clinics</a>
        <a routerLink="/about" routerLinkActive="active" (click)="closeMobileMenu()" class="mob-link-flat">About us</a>
        <a routerLink="/contact" routerLinkActive="active" (click)="closeMobileMenu()" class="mob-link-flat">Contact us</a>

        <div class="mob-cta">
          <a class="btn btn-ink" style="width:100%;min-height:48px;justify-content:center" routerLink="/find-doctors" (click)="closeMobileMenu()">Book now</a>
        </div>
      </nav>

      <!-- HERO AND TRUST (Home Route Only) -->
      <ng-container *ngIf="isHome()">
        <div class="hero home">
          <div class="hero-l">
            <span class="eyebrow">Online appointments · Doctors · Hospitals</span>
            <h1>Your health, <span class="mk">one tap away.</span></h1>
            <div class="hero-ecg-wrap">
              <svg class="ecg-live" width="230" height="44" viewBox="0 0 230 44" aria-hidden="true" style="margin-top:-6px;max-width:100%;overflow:visible">
                <path class="ecg-tr" d="M2 24h40l10-16 14 30 12-14h36l10-16 14 30 12-14h66" fill="none" stroke="#DBEAFE" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path class="ecg-ln" pathLength="100" d="M2 24h40l10-16 14 30 12-14h36l10-16 14 30 12-14h66" fill="none" stroke="#2381FF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <circle class="ecg-dot" r="5.500" fill="#2381FF" style="offset-path:path('M2 24h40l10-16 14 30 12-14h36l10-16 14 30 12-14h66')"/>
              </svg>
            </div>
            <p class="hero-desc">Search a doctor, hospital or symptom, or just tell Pulse.</p>

            <form class="search" role="search" (ngSubmit)="goSearch()">
              <div class="tabs" role="group" aria-label="Search type">
                <button class="tab" type="button" [class.on]="activeTab === 'doctors'" (click)="setTab('doctors')">Doctors</button>
                <button class="tab" type="button" [class.on]="activeTab === 'hospitals'" (click)="setTab('hospitals')">Hospitals</button>
                <button class="tab" type="button" [class.on]="activeTab === 'conditions'" (click)="setTab('conditions')">Conditions</button>
              </div>
              <div class="fields">
                <div class="field wide">
                  <label for="q">{{ tabConfigs[activeTab].label }}</label>
                  <input id="q" name="q" type="search" enterkeyhint="search" [placeholder]="tabConfigs[activeTab].placeholder" [(ngModel)]="searchQuery" autocomplete="off">
                </div>
                <div class="field">
                  <label for="city">City</label>
                  <select id="city" name="city" [(ngModel)]="selectedCity">
                    <option value="all">All cities</option>
                    <option *ngFor="let c of cities" [value]="c">{{ c }}</option>
                  </select>
                </div>
                <button class="btn btn-coral" id="goBtn" type="submit">
                  {{ tabConfigs[activeTab].btnText }}
                </button>
              </div>
            </form>

            <!-- How do you feel today row from PulseQ (14).html -->
            <div class="feel">
              <p class="feel-h">How do you feel today?</p>
              <div class="feel-g">
                <button type="button" class="feel-t" (click)="trySearch('fever')">
                  <i><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0zM12 9v7"/></svg></i>
                  <span>Fever</span>
                </button>
                <button type="button" class="feel-t" (click)="trySearch('skin rash')">
                  <i><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c3 4 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 3-6 6-10z"/></svg></i>
                  <span>Skin</span>
                </button>
                <button type="button" class="feel-t" (click)="trySearch('back pain')">
                  <i><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18M9 6h6M8 10h8M9 14h6M10 18h4"/></svg></i>
                  <span>Back pain</span>
                </button>
                <button type="button" class="feel-t" (click)="trySearch('child check-up')">
                  <i><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21a7 7 0 0 1 14 0"/></svg></i>
                  <span>Child</span>
                </button>
                <button type="button" class="feel-t" (click)="trySearch('chest pain')">
                  <i><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/></svg></i>
                  <span>Heart</span>
                </button>
                <button type="button" class="feel-t" (click)="trySearch('tooth pain')">
                  <i><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4c-2 0-3 2-3 4 0 3 1 4 1.5 7 .4 2.4 1.2 5 2.5 5s1-3 2-3h4c1 0 .7 3 2 3s2.1-2.600 2.500-5C19 12 20 11 20 8c0-2-1-4-3-4-2 0-2.500 1-5 1S9 4 7 4z"/></svg></i>
                  <span>Dental</span>
                </button>
              </div>
            </div>
          </div>

          <div class="hero-r" id="heroCard" (mouseenter)="pauseCarousel()" (mouseleave)="resumeCarousel()">
            <div class="bubble" id="hBubble">
              <i>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
                  <rect x="9" y="3" width="6" height="11" rx="3"></rect>
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path>
                </svg>
              </i>
              <span id="hSay">{{ heroSayText() }}</span>
            </div>

            <div class="hcard-wrap">
              <div id="hSlide" aria-live="polite">
                <div *ngIf="currentHeroDoctor() as d" class="hslide" [class.noanim]="!animating">
                  <div class="hcard">
                    <div class="doc-top">
                      <div class="avatar t{{ d.t }}">{{ getInitials(d.name) }}</div>
                      <div class="min0">
                        <h3 style="font-size:22px">{{ d.name }}</h3>
                        <p class="muted sm">{{ specMap[d.spec] }} · {{ getHospitalName(d.h) }}</p>
                      </div>
                    </div>

                    <div class="chips" role="group" aria-label="Choose a day">
                      <button *ngFor="let o of heroDays" class="chip" [class.on]="heroDayOffset === o" (click)="selectHeroDay(o)" style="flex-direction:column;justify-content:center;min-height:56px;padding:0 14px;font-size:13px;gap:0">
                        <span>{{ o === 0 ? 'Today' : (getDayDate(o) | date:'EEE') }}</span>
                        <b>{{ getDayDate(o).getDate() }}</b>
                      </button>
                    </div>

                    <div class="chips" role="group" aria-label="Choose a time">
                      <button *ngFor="let s of heroSlots" class="slot" [class.on]="heroTime === s" (click)="heroTime = s">
                        {{ doctorsService.formatTime(s) }}
                      </button>
                    </div>

                    <div class="row-between">
                      <div>
                        <p class="muted xs">Consultation</p>
                        <p style="font-weight:700;font-size:20px">Rs {{ d.fee.toLocaleString('en-US') }}</p>
                      </div>
                      <button class="btn btn-ink" style="flex:1 1 170px" (click)="bookHeroDoctor(d)">
                        Book {{ heroTime ? doctorsService.formatTime(heroTime) : '' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="confirmed">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#102A43" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5"></path>
                </svg>
                Confirmed in seconds
              </div>
            </div>

            <!-- Queue Token Tracker from PulseQ (14).html -->
            <div class="qt" aria-label="Example of your live queue token">
              <div class="qt-l"><small>Your token</small><b>A-12</b></div>
              <div class="qt-m">
                <div class="qt-dots">
                  <i [class.on]="qtAhead >= 1"></i>
                  <i [class.on]="qtAhead >= 2"></i>
                  <i [class.on]="qtAhead >= 3"></i>
                  <i class="you" [class.go]="qtAhead === 0"></i>
                </div>
                <p>{{ qtAhead === 0 ? 'Your turn. Walk in.' : qtAhead === 1 ? '1 person ahead of you' : qtAhead + ' people ahead of you' }}</p>
              </div>
            </div>

            <div class="hctl" id="hCtl">
              <div class="hdots" role="group" aria-label="Choose a doctor">
                <button *ngFor="let d of heroDoctors(); let i = index" class="hdot" [class.on]="heroIndex === i" (click)="setHeroIndex(i)" [attr.aria-label]="'Show ' + d.name">
                  <i></i>
                </button>
              </div>
              <div style="display:flex;gap:8px">
                <button class="icon-btn" aria-label="Previous doctor" (click)="prevHero()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M15 5l-7 7 7 7"></path>
                  </svg>
                </button>
                <button class="icon-btn" aria-label="Next doctor" (click)="nextHero()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
              <div class="hbar" aria-hidden="true"><i></i></div>
            </div>
          </div>
        </div>

        <div class="trust home">
          <span>Verified doctors</span>
          <span>Live, real time slots</span>
          <span>PulseQ AI assists in Urdu and English</span>
          <span>Pay online or at the clinic</span>
        </div>
      </ng-container>
    </header>

    <div *ngIf="orderSummary() as order" class="order-modal" role="presentation" (click)="closeOrderSummaryOnBackdrop($event)">
      <section class="order-panel" role="dialog" aria-modal="true" aria-labelledby="orderSummaryTitle">
        <div class="order-panel-head">
          <div>
            <span class="eyebrow">Medicine order</span>
            <h2 id="orderSummaryTitle">{{ order.code }}</h2>
          </div>
          <button class="icon-btn" type="button" aria-label="Close order summary" (click)="closeOrderSummary()">×</button>
        </div>
        <div class="order-status"><span class="live"></span>{{ orderStatusLabel(order) }}</div>
        <div class="order-summary-row"><span>Pharmacy</span><b>{{ order.shop }}</b></div>
        <div class="order-summary-row"><span>Items</span><b>{{ order.items }}</b></div>
        <div class="order-summary-row"><span>Contact number</span><b>{{ order.phone }}</b></div>
        <button class="btn btn-ink full" type="button" (click)="closeOrderSummary()">Done</button>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin: 0;
      padding: 0;
    }
    .order-notification {
      display: block;
      width: 100%;
      border: 0;
      padding: 0;
      text-align: left;
      cursor: pointer;
    }
    .order-notification .apptbar-in {
      width: 100%;
    }
    .order-notification:hover .apptbtn {
      background: #fff;
      color: #0c2d5e;
    }
    .order-modal {
      position: fixed;
      inset: 0;
      z-index: 1200;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(7, 24, 42, .62);
    }
    .order-panel {
      width: min(100%, 520px);
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding: 26px;
      border-radius: 28px;
      background: #fff;
      color: #102a43;
      box-shadow: 0 24px 70px rgba(7, 24, 42, .3);
    }
    .order-panel-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }
    .order-panel h2 {
      margin-top: 4px;
      font-size: 30px;
    }
    .order-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      border-radius: 14px;
      background: #eaf3ff;
      color: #1558b8;
      font-weight: 700;
    }
    .order-status .live {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #2381ff;
    }
    .order-summary-row {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .order-summary-row span {
      color: #526477;
    }
    .order-summary-row b {
      overflow-wrap: anywhere;
    }
    .nav-links a.active {
      text-decoration: underline;
      text-underline-offset: 6px;
      text-decoration-thickness: 2px;
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  readonly logoDataUri = 'data:image/png;base64,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';
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  doctorsService = inject(DoctorsService);
  hospitalsService = inject(HospitalsService);
  medicineService = inject(MedicineService);
  modalService = inject(ModalService);
  pulseAi = inject(PulseAiService);

  orderNotification: Signal<MedicineOrder | null> = this.medicineService.activeOrder;
  orderSummary = signal<MedicineOrder | null>(null);
  isHome = signal<boolean>(true);
  showDocDrop = false;
  showHospDrop = false;

  mobileMenuOpen = false;
  mobileDocOpen = false;
  mobileHospOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.mobileDocOpen = false;
    this.mobileHospOpen = false;
  }

  toggleDocDrop(e?: Event): void {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    this.showDocDrop = !this.showDocDrop;
    if (this.showDocDrop) this.showHospDrop = false;
  }

  toggleHospDrop(e?: Event): void {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    this.showHospDrop = !this.showHospDrop;
    if (this.showHospDrop) this.showDocDrop = false;
  }

  toggleMobileDoc(e?: Event): void {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    this.mobileDocOpen = !this.mobileDocOpen;
  }

  toggleMobileHosp(e?: Event): void {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    this.mobileHospOpen = !this.mobileHospOpen;
  }

  // Search Tabs
  activeTab: 'doctors' | 'hospitals' | 'conditions' = 'doctors';
  searchQuery = '';
  selectedCity = 'all';
  cities = CITIES;
  specMap = SPEC;

  tabConfigs = {
    doctors: { label: 'Doctor or specialty', placeholder: 'Doctor name or specialty', btnText: 'Find doctors' },
    hospitals: { label: 'Hospital or clinic', placeholder: 'Hospital or clinic name, e.g. Crescent', btnText: 'Find hospitals' },
    conditions: { label: 'Symptom or condition', placeholder: 'Symptom, e.g. fever, headache', btnText: 'Find a specialist' }
  };

  // Carousel
  heroDoctors = computed(() => {
    return HIDS.map(id => this.doctorsService.getDoctorById(id)).filter((d): d is Doctor => !!d);
  });
  heroIndex = 0;
  heroDayOffset = 0;
  heroTime = '10:00';
  heroDays: number[] = [0, 1, 2, 3];
  heroSlots: string[] = ['09:00', '10:00', '11:00', '12:00'];
  animating = true;
  private timer: any;

  // Queue token animation
  qtAhead = 3;
  private qtTimer: any;

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url = e.urlAfterRedirects.split('?')[0].split('#')[0];
      this.isHome.set(url === '/' || url === '');
      this.closeMobileMenu();
    });
  }

  ngOnInit() {
    const url = this.router.url.split('?')[0].split('#')[0];
    this.isHome.set(url === '/' || url === '');
    this.updateHeroSlots();
    if (isPlatformBrowser(this.platformId)) {
      this.startCarousel();
      this.startQtTimer();
    }
  }

  ngOnDestroy() {
    this.stopCarousel();
    this.stopQtTimer();
  }

  startQtTimer() {
    this.stopQtTimer();
    this.qtTimer = setInterval(() => {
      this.qtAhead = this.qtAhead === 0 ? 3 : this.qtAhead - 1;
    }, 2200);
  }

  stopQtTimer() {
    if (this.qtTimer) {
      clearInterval(this.qtTimer);
      this.qtTimer = null;
    }
  }

  currentHeroDoctor(): Doctor | undefined {
    const list = this.heroDoctors();
    return list[this.heroIndex] || list[0];
  }

  getHospitalName(id: string): string {
    const h = this.hospitalsService.getHospitalById(id);
    return h ? h.name : id;
  }

  getInitials(name: string): string {
    return name.replace('Dr. ', '').split(' ').map(w => w[0]).slice(0, 2).join('');
  }

  getDayDate(offset: number): Date {
    return this.doctorsService.dayDate(offset);
  }

  heroSayText(): string {
    const d = this.currentHeroDoctor();
    if (!d) return '“Book me a specialist for today.”';
    const specPhrase = SAY[d.spec] || 'a specialist';
    const dayName = this.heroDayOffset === 0 ? 'today' : this.heroDayOffset === 1 ? 'tomorrow' : this.getDayDate(this.heroDayOffset).toLocaleDateString('en-GB', { weekday: 'long' });
    const hr = parseInt(this.heroTime.split(':')[0], 10) || 10;
    const part = hr < 12 ? 'morning' : hr < 17 ? 'afternoon' : 'evening';
    return `“Book me ${specPhrase} for ${dayName} ${part}.”`;
  }

  updateHeroSlots() {
    const d = this.currentHeroDoctor();
    if (!d) return;
    this.heroDays = this.doctorsService.activeDays(d).slice(0, 4);
    if (!this.heroDays.includes(this.heroDayOffset)) {
      this.heroDayOffset = this.heroDays[0] ?? 0;
    }
    const sl = this.doctorsService.slots(d, this.heroDayOffset).slice(0, 4);
    this.heroSlots = sl;
    if (!this.heroSlots.includes(this.heroTime)) {
      this.heroTime = this.heroSlots[0] || '10:00';
    }
  }

  selectHeroDay(o: number) {
    this.heroDayOffset = o;
    this.animating = false;
    this.updateHeroSlots();
  }

  startCarousel() {
    this.stopCarousel();
    this.timer = setInterval(() => {
      this.nextHero();
    }, 4500);
  }

  stopCarousel() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  pauseCarousel() {
    this.stopCarousel();
  }

  resumeCarousel() {
    if (isPlatformBrowser(this.platformId)) {
      this.startCarousel();
    }
  }

  nextHero() {
    const list = this.heroDoctors();
    if (!list.length) return;
    this.animating = true;
    this.heroIndex = (this.heroIndex + 1) % list.length;
    this.updateHeroSlots();
  }

  prevHero() {
    const list = this.heroDoctors();
    if (!list.length) return;
    this.animating = true;
    this.heroIndex = (this.heroIndex - 1 + list.length) % list.length;
    this.updateHeroSlots();
  }

  setHeroIndex(i: number) {
    this.animating = true;
    this.heroIndex = i;
    this.updateHeroSlots();
    this.resumeCarousel();
  }

  bookHeroDoctor(d: Doctor) {
    this.modalService.openBooking(d.id, this.heroDayOffset, this.heroTime);
  }

  setTab(tab: 'doctors' | 'hospitals' | 'conditions') {
    this.activeTab = tab;
  }

  trySearch(query: string) {
    this.router.navigate(['/find-doctors'], { queryParams: { q: query } });
  }

  goSearch() {
    const q = this.searchQuery.trim();
    if (this.activeTab === 'doctors') {
      this.router.navigate(['/find-doctors'], {
        queryParams: { q: q || null, spec: 'all', city: this.selectedCity !== 'all' ? this.selectedCity : null }
      });
    } else if (this.activeTab === 'hospitals') {
      this.router.navigate(['/hospitals'], {
        queryParams: { q: q || null, city: this.selectedCity !== 'all' ? this.selectedCity : null }
      });
    } else {
      this.router.navigate(['/find-doctors'], {
        queryParams: { q: q || null, spec: 'all' }
      });
    }
  }

  openOrderSummary(order: MedicineOrder): void {
    this.orderSummary.set(order);
  }

  closeOrderSummary(): void {
    this.orderSummary.set(null);
  }

  closeOrderSummaryOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeOrderSummary();
    }
  }

  orderStatusLabel(order: MedicineOrder): string {
    switch (order.status) {
      case 'confirmed': return 'Order confirmed';
      case 'out-for-delivery': return 'Out for delivery';
      case 'delivered': return 'Delivered';
      default: return 'Order placed';
    }
  }

  openAiUrdu(): void {
    this.pulseAi.setLanguage('ur-PK');
    this.pulseAi.open();
  }
}
