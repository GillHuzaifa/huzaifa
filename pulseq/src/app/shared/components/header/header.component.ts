import { Component, inject, signal, computed, OnInit, OnDestroy, PLATFORM_ID, Signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { BookingsService } from '../../services/bookings.service';
import { DoctorsService } from '../../services/doctors.service';
import { HospitalsService } from '../../services/hospitals.service';
import { ModalService } from '../../services/modal.service';
import { PulseAiService } from '../../services/pulse-ai.service';
import { Doctor, Booking } from '../../models';
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
    <!-- Top Appointment Bar -->
    <div *ngIf="nextAppt() as appt" class="apptbar" id="apptBar">
      <div class="wrap apptbar-in">
        <span class="live"></span>
        <span>Your appointment: <b>{{ appt.when }}</b> with {{ appt.doctor }} · {{ appt.code }}</span>
        <a class="apptbtn" target="_blank" rel="noopener" [href]="getWaLink(appt)">Get number on WhatsApp</a>
      </div>
    </div>

    <!-- Header Container per PulseQ (9).html -->
    <header class="wrap">
      <div class="nav">
        <!-- Brand Logo on Top Left -->
        <a class="logo" routerLink="/" (click)="closeMobileMenu()" aria-label="PulseQ home">
          <img src="/assets/logo.png" alt="PulseQ logo" class="logo-mark" loading="eager" width="46" height="46">
          <span>PulseQ</span>
        </a>

        <!-- Middle Navigation with Dropdowns (Desktop >= 900px) -->
        <nav class="nav-links" aria-label="Main">
          <div class="nav-item-dropdown" (mouseenter)="showDocDrop = true" (mouseleave)="showDocDrop = false">
            <a routerLink="/find-doctors" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link-with-arrow">
              <span>Find doctors</span>
              <button type="button" class="chevron" (click)="toggleDocDrop($event)" aria-label="Toggle specialties dropdown">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 6l4 4 4-4"/>
                </svg>
              </button>
            </a>
            <div class="nav-dropdown" [class.show]="showDocDrop">
              <span class="dd-title">Top Specialties</span>
              <a routerLink="/find-doctors" [queryParams]="{spec: 'heart'}" (click)="showDocDrop = false">Cardiologists</a>
              <a routerLink="/find-doctors" [queryParams]="{spec: 'skin'}" (click)="showDocDrop = false">Dermatologists</a>
              <a routerLink="/find-doctors" [queryParams]="{spec: 'child'}" (click)="showDocDrop = false">Paediatricians</a>
              <a routerLink="/find-doctors" [queryParams]="{spec: 'general'}" (click)="showDocDrop = false">General physicians</a>
              <a routerLink="/find-doctors" [queryParams]="{spec: 'bones'}" (click)="showDocDrop = false">Orthopaedic surgeons</a>
              <a routerLink="/find-doctors" [queryParams]="{spec: 'neuro'}" (click)="showDocDrop = false">Neurologists</a>
              <a routerLink="/find-doctors" [queryParams]="{spec: 'eye'}" (click)="showDocDrop = false">Eye specialists</a>
              <div class="dd-sep"></div>
              <a routerLink="/find-doctors" class="dd-all" (click)="showDocDrop = false">Browse all doctors →</a>
            </div>
          </div>

          <div class="nav-item-dropdown" (mouseenter)="showHospDrop = true" (mouseleave)="showHospDrop = false">
            <a routerLink="/hospitals" routerLinkActive="active" class="nav-link-with-arrow">
              <span>Hospitals</span>
              <button type="button" class="chevron" (click)="toggleHospDrop($event)" aria-label="Toggle hospitals dropdown">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 6l4 4 4-4"/>
                </svg>
              </button>
            </a>
            <div class="nav-dropdown" [class.show]="showHospDrop">
              <span class="dd-title">By City</span>
              <a routerLink="/hospitals" [queryParams]="{city: 'lahore'}" (click)="showHospDrop = false">Lahore Hospitals</a>
              <a routerLink="/hospitals" [queryParams]="{city: 'karachi'}" (click)="showHospDrop = false">Karachi Hospitals</a>
              <a routerLink="/hospitals" [queryParams]="{city: 'islamabad'}" (click)="showHospDrop = false">Islamabad Hospitals</a>
              <a routerLink="/hospitals" [queryParams]="{city: 'rawalpindi'}" (click)="showHospDrop = false">Rawalpindi Hospitals</a>
              <div class="dd-sep"></div>
              <a routerLink="/hospitals" class="dd-all" (click)="showHospDrop = false">Browse all hospitals →</a>
            </div>
          </div>

          <a routerLink="/" fragment="conditions">Conditions</a>
          <a routerLink="/surgery" routerLinkActive="active">Surgery</a>
          <a routerLink="/medicine" routerLinkActive="active">Medicine</a>
          <a routerLink="/clinics" routerLinkActive="active">For clinics</a>
        </nav>

        <!-- Right Action Button & Mobile Hamburger -->
        <div class="nav-cta">
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

      <!-- Mobile Navigation Drawer (< 900px) -->
      <nav class="mobile-nav-drawer" *ngIf="mobileMenuOpen" aria-label="Mobile Navigation">
        <!-- Find Doctors Accordion -->
        <div class="mob-item">
          <div class="mob-item-head">
            <a routerLink="/find-doctors" (click)="closeMobileMenu()" class="mob-link">Find doctors</a>
            <button type="button" class="mob-chevron-btn" (click)="toggleMobileDoc($event)" [attr.aria-expanded]="mobileDocOpen" aria-label="Toggle specialties">
              <svg [class.rot]="mobileDocOpen" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
          <div class="mob-sub" *ngIf="mobileDocOpen">
            <span class="mob-sub-title">Top Specialties</span>
            <a routerLink="/find-doctors" [queryParams]="{spec: 'heart'}" (click)="closeMobileMenu()">Cardiologists</a>
            <a routerLink="/find-doctors" [queryParams]="{spec: 'skin'}" (click)="closeMobileMenu()">Dermatologists</a>
            <a routerLink="/find-doctors" [queryParams]="{spec: 'child'}" (click)="closeMobileMenu()">Paediatricians</a>
            <a routerLink="/find-doctors" [queryParams]="{spec: 'general'}" (click)="closeMobileMenu()">General physicians</a>
            <a routerLink="/find-doctors" [queryParams]="{spec: 'bones'}" (click)="closeMobileMenu()">Orthopaedic surgeons</a>
            <a routerLink="/find-doctors" [queryParams]="{spec: 'neuro'}" (click)="closeMobileMenu()">Neurologists</a>
            <a routerLink="/find-doctors" [queryParams]="{spec: 'eye'}" (click)="closeMobileMenu()">Eye specialists</a>
            <a routerLink="/find-doctors" (click)="closeMobileMenu()" class="mob-all">Browse all doctors →</a>
          </div>
        </div>

        <!-- Hospitals Accordion -->
        <div class="mob-item">
          <div class="mob-item-head">
            <a routerLink="/hospitals" (click)="closeMobileMenu()" class="mob-link">Hospitals</a>
            <button type="button" class="mob-chevron-btn" (click)="toggleMobileHosp($event)" [attr.aria-expanded]="mobileHospOpen" aria-label="Toggle cities">
              <svg [class.rot]="mobileHospOpen" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
          <div class="mob-sub" *ngIf="mobileHospOpen">
            <span class="mob-sub-title">By City</span>
            <a routerLink="/hospitals" [queryParams]="{city: 'lahore'}" (click)="closeMobileMenu()">Lahore Hospitals</a>
            <a routerLink="/hospitals" [queryParams]="{city: 'karachi'}" (click)="closeMobileMenu()">Karachi Hospitals</a>
            <a routerLink="/hospitals" [queryParams]="{city: 'islamabad'}" (click)="closeMobileMenu()">Islamabad Hospitals</a>
            <a routerLink="/hospitals" [queryParams]="{city: 'rawalpindi'}" (click)="closeMobileMenu()">Rawalpindi Hospitals</a>
            <a routerLink="/hospitals" (click)="closeMobileMenu()" class="mob-all">Browse all hospitals →</a>
          </div>
        </div>

        <a routerLink="/" fragment="conditions" (click)="closeMobileMenu()" class="mob-link-flat">Conditions</a>
        <a routerLink="/surgery" routerLinkActive="active" (click)="closeMobileMenu()" class="mob-link-flat">Surgery</a>
        <a routerLink="/medicine" routerLinkActive="active" (click)="closeMobileMenu()" class="mob-link-flat">Medicine</a>
        <a routerLink="/clinics" routerLinkActive="active" (click)="closeMobileMenu()" class="mob-link-flat">For clinics</a>
        <a routerLink="/about" routerLinkActive="active" (click)="closeMobileMenu()" class="mob-link-flat">About us</a>
        <a routerLink="/contact" routerLinkActive="active" (click)="closeMobileMenu()" class="mob-link-flat">Contact us</a>

        <div class="mob-cta">
          <a class="btn btn-ink" style="width:100%;min-height:48px;justify-content:center" routerLink="/find-doctors" (click)="closeMobileMenu()">Book appointment</a>
        </div>
      </nav>

      <!-- HERO AND TRUST (Home Route Only) -->
      <ng-container *ngIf="isHome()">
        <div class="hero home">
          <div class="hero-l">
            <span class="eyebrow">Online appointments · Doctors · Hospitals</span>
            <h1>Your health, <span class="mk">one tap away.</span></h1>
            <p class="ur ur-hero" lang="ur" dir="rtl" (click)="openAiUrdu()" style="cursor:pointer" title="اردو میں چیٹ کریں">آپ کی صحت، بس ایک ٹیپ کی دوری پر۔</p>
            <div class="hero-ecg-wrap">
              <svg width="220" height="38" viewBox="0 0 230 44" aria-hidden="true" style="max-width:100%">
                <path d="M2 24h62l12-18 16 34 14-16h124" fill="none" stroke="#1D6FE0" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </div>
            <p class="hero-desc">Search a doctor, hospital or symptom, or just tell Pulse.</p>

            <div class="search">
              <div class="tabs" role="group" aria-label="Search type">
                <button class="tab" [class.on]="activeTab === 'doctors'" (click)="setTab('doctors')">Doctors</button>
                <button class="tab" [class.on]="activeTab === 'hospitals'" (click)="setTab('hospitals')">Hospitals</button>
                <button class="tab" [class.on]="activeTab === 'conditions'" (click)="setTab('conditions')">Conditions</button>
              </div>
              <div class="fields">
                <div class="field wide">
                  <label for="q">{{ tabConfigs[activeTab].label }}</label>
                  <input id="q" type="text" [placeholder]="tabConfigs[activeTab].placeholder" [(ngModel)]="searchQuery" (keydown.enter)="goSearch()" autocomplete="off">
                </div>
                <div class="field">
                  <label for="city">City</label>
                  <select id="city" [(ngModel)]="selectedCity">
                    <option value="all">All cities</option>
                    <option *ngFor="let c of cities" [value]="c">{{ c }}</option>
                  </select>
                </div>
                <button class="btn btn-coral" id="goBtn" (click)="goSearch()">
                  {{ tabConfigs[activeTab].btnText }}
                </button>
              </div>
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
              <span class="muted sm">Try:</span>
              <button class="chip" (click)="trySearch('fever')">Fever</button>
              <button class="chip" (click)="trySearch('skin rash')">Skin rash</button>
              <button class="chip" (click)="trySearch('back pain')">Back pain</button>
              <button class="chip" (click)="trySearch('child check-up')">Child check-up</button>
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
  `,
  styles: [`
    :host {
      display: block;
      margin: 0;
      padding: 0;
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
  bookingsService = inject(BookingsService);
  doctorsService = inject(DoctorsService);
  hospitalsService = inject(HospitalsService);
  modalService = inject(ModalService);
  pulseAi = inject(PulseAiService);

  nextAppt: Signal<Booking | null> = this.bookingsService.nextAppointment;
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
    hospitals: { label: 'Hospital or clinic', placeholder: 'Hospital name, e.g. Lakeview', btnText: 'Find hospital' },
    conditions: { label: 'Condition or symptom', placeholder: 'e.g. chest pain, fever, back pain', btnText: 'Find care' }
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
    }
  }

  ngOnDestroy() {
    this.stopCarousel();
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
        queryParams: { q: q || null, city: this.selectedCity !== 'all' ? this.selectedCity : null }
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

  getWaLink(appt: Booking): string {
    const text = `Hello PulseQ, please send my appointment number.\nCode: ${appt.code}\nDoctor: ${appt.doctor}, ${appt.hospital}\nWhen: ${appt.when}\nPatient: ${appt.name}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  openAiUrdu(): void {
    if (typeof window !== 'undefined') {
      const el = document.getElementById('ai');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.dispatchEvent(new CustomEvent('pulseq:set-urdu-ai'));
        return;
      }
    }
    this.pulseAi.open();
  }
}
