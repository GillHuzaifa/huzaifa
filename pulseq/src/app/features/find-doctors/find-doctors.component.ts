import { Component, inject, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DoctorsService } from '../../shared/services/doctors.service';
import { HospitalsService } from '../../shared/services/hospitals.service';
import { ReviewsService } from '../../shared/services/reviews.service';
import { ModalService } from '../../shared/services/modal.service';
import { SeoService } from '../../shared/services/seo.service';
import { SPEC, SPEC_PLURAL, CITIES } from '../../data/specialties.data';
import { Doctor, Place, Slot } from '../../shared/models';

@Component({
  selector: 'app-find-doctors',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="sec pg-find" id="page-find">
      <div class="wrap">
        <!-- Header Banner -->
        <div class="pghead">
          <div class="pgh-txt">
            <span class="eyebrow">Find doctors</span>
            <h2>The right doctor, at a time that suits you.</h2>
            <p>Search by name, specialty or symptom, then pick a free slot.</p>
          </div>

          <form class="pgsearch" id="fdForm" role="search" (submit)="onSearch($event)">
            <label class="sr" for="fdQ">Search doctors</label>
            <input
              class="inp"
              id="fdQ"
              type="search"
              enterkeyhint="search"
              placeholder="Doctor, specialty or symptom, e.g. migraine"
              [(ngModel)]="searchQuery"
              name="q"
              autocomplete="off">
            <button class="btn btn-mint" type="submit">Search</button>
          </form>
        </div>

      <!-- Specialty Tiles -->
      <div class="spectiles">
        <button
          class="stile"
          [class.on]="selectedSpec === 'all'"
          type="button"
          (click)="selectSpec('all')">
          <i class="t1">All</i>
          <span>
            All doctors
            <small>{{ activeDoctors().length }} doctors</small>
          </span>
        </button>
        @for (k of specKeys; track k; let i = $index) {
          @let count = countForSpec(k);
          <button
            class="stile"
            [class.on]="selectedSpec === k"
            type="button"
            (click)="selectSpec(k)">
            <i [class]="'t' + ((i % 5) + 1)">{{ specMap[k].slice(0, 2) }}</i>
            <span>
              {{ specMap[k] }}
              <small>{{ count }} {{ count === 1 ? 'doctor' : 'doctors' }}</small>
            </span>
          </button>
        }
      </div>

      <!-- Main Layout: Sidebar & List -->
      <div class="fdlayout">
        <!-- Sidebar Filters -->
        <aside class="fdside" [class.open]="sidebarOpen">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <h3 style="margin:0">Filters</h3>
            <button class="icon-btn" type="button" (click)="sidebarOpen = false" aria-label="Close filters" style="width:36px;height:36px">✕</button>
          </div>

          <div>
            <span class="lbl">City</span>
            <div class="chips">
              <button
                class="chip"
                [class.on]="selectedCity === 'all'"
                type="button"
                (click)="selectedCity = 'all'">
                Any city
              </button>
              @for (c of cities; track c) {
                <button
                  class="chip"
                  [class.on]="selectedCity === c"
                  type="button"
                  (click)="selectedCity = c">
                  {{ c }}
                </button>
              }
            </div>
          </div>

          <div>
            <span class="lbl">Consultation</span>
            <div class="chips">
              <button
                class="chip"
                [class.on]="selectedMode === 'all'"
                type="button"
                (click)="selectedMode = 'all'">
                Any
              </button>
              <button
                class="chip"
                [class.on]="selectedMode === 'clinic'"
                type="button"
                (click)="selectedMode = 'clinic'">
                In clinic
              </button>
              <button
                class="chip"
                [class.on]="selectedMode === 'video'"
                type="button"
                (click)="selectedMode = 'video'">
                Video
              </button>
            </div>
          </div>

          <div>
            <span class="lbl">Availability</span>
            <div class="chips">
              <button
                class="chip"
                [class.on]="!onlyToday"
                type="button"
                (click)="onlyToday = false">
                Any day
              </button>
              <button
                class="chip"
                [class.on]="onlyToday"
                type="button"
                (click)="onlyToday = true">
                Free today
              </button>
            </div>
          </div>

          <div>
            <span class="lbl">Fee</span>
            <div class="chips">
              <button
                class="chip"
                [class.on]="maxFee === 0"
                type="button"
                (click)="maxFee = 0">
                Any
              </button>
              <button
                class="chip"
                [class.on]="maxFee === 2000"
                type="button"
                (click)="maxFee = 2000">
                Up to Rs 2,000
              </button>
              <button
                class="chip"
                [class.on]="maxFee === 3000"
                type="button"
                (click)="maxFee = 3000">
                Up to Rs 3,000
              </button>
            </div>
          </div>

          <div style="display:flex;gap:10px;margin-top:8px">
            <button class="btn btn-ink" style="flex:1" type="button" (click)="sidebarOpen = false">Apply filters</button>
            <button class="btn btn-line" type="button" (click)="resetFilters()">Reset</button>
          </div>
        </aside>

        <!-- Main Doctor Results List -->
        <div class="fdmain">
          <div class="fdbar">
            <button
              class="btn btn-line fdtoggle"
              type="button"
              (click)="sidebarOpen = !sidebarOpen">
              Filters
            </button>
            <div class="cnt" aria-live="polite">
              @if (filteredDoctors().length > visibleLimit) {
                Showing <b>{{ visibleLimit }}</b> of <b>{{ filteredDoctors().length }}</b> doctors
              } @else {
                <b>{{ filteredDoctors().length }}</b>
                {{ filteredDoctors().length === 1 ? 'doctor' : 'doctors' }}
              }
              @if (filterDescription()) {
                <span class="muted">· {{ filterDescription() }}</span>
              }
            </div>
            <select [(ngModel)]="sortOption" aria-label="Sort doctors">
              <option value="soon">Earliest available</option>
              <option value="low">Fee: low to high</option>
              <option value="high">Fee: high to low</option>
              <option value="score">Patient score</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div class="fdactive" aria-label="Active filters">
            @for (filter of activeFilters(); track filter.key) {
              <button class="fdx" type="button" (click)="removeFilter(filter.key)">
                {{ filter.label }} <span aria-hidden="true">×</span>
              </button>
            }
            @if (activeFilters().length > 0) {
              <button class="fdx clr" type="button" (click)="resetFilters()">Clear all</button>
            }
          </div>

          <div class="fdlist" id="fdList">
            @let docs = filteredDoctors();
            @if (docs.length > 0) {
              @for (d of docs.slice(0, visibleLimit); track d.id) {
                @let P = doctorsService.selectedPlace(d);
                @let h = hospitalsService.getHospitalById(P.h);
                @let ns = doctorsService.nextSlots(P, 4);
                @let today = ns.length > 0 && ns[0].o === 0;
                @let places = doctorsService.placesOf(d);

                <article class="frow" (click)="openDoctor(d.id, $event)" style="cursor:pointer">
                  <div class="fr-id">
                    <div class="dc-ava t{{ d.t }}">
                      @if (d.photo) {
                        <img [src]="d.photo" [alt]="d.name">
                      } @else {
                        <span>{{ getInitials(d.name) }}</span>
                      }
                      @if (today) {
                        <i class="dc-on" title="Free today"></i>
                      }
                    </div>
                    <div class="min0">
                      <h3><a class="dlink" [routerLink]="['/doctor', d.id]">{{ d.name }}</a></h3>
                      <p class="dc-spec">{{ specMap[d.spec] }}</p>
                      <p class="dc-deg">
                        {{ (d.deg || []).join(', ') }}{{ d.exp ? ' · ' + d.exp + ' yrs' : '' }}
                      </p>
                      @if (places.length <= 1 && h) {
                        <a class="linkbtn" [routerLink]="['/hospital', h.id]" (click)="$event.stopPropagation()">
                          {{ h.name }} · {{ h.city }}
                        </a>
                      }
                    </div>
                  </div>

                  <div class="fr-meta">
                    <a class="rt" [routerLink]="['/doctor', d.id]" fragment="reviews" (click)="$event.stopPropagation()">
                      <svg class="pulse" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2381FF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                      </svg>
                      <b>{{ getDocRating(d.id).avg.toFixed(1) }}</b>
                      <span>· {{ getDocRating(d.id).n }} reviews</span>
                    </a>
                    <span class="tag">{{ P.mode }}</span>
                    <span class="dc-avail" [class.on]="today">
                      {{ today ? 'Free today' : (ns.length ? 'Free this week' : 'Fully booked') }}
                    </span>
                    <b class="dc-fee">Rs {{ P.fee.toLocaleString('en-US') }}</b>
                  </div>

                  <div class="fr-slots">
                    @if (places.length > 1) {
                      <div class="dc-places" role="radiogroup">
                        <span class="dc-pl-tag">Sits at {{ places.length }} places · choose one</span>
                        @for (p of places; track p.id; let idx = $index) {
                          @let ph = hospitalsService.getHospitalById(p.h);
                          <button
                            type="button"
                            class="dc-pl"
                            [class.on]="p.id === P.id"
                            (click)="doctorsService.selectPlace(d.id, idx)">
                            <b>{{ ph ? ph.name : p.h }} · {{ ph ? ph.city : '' }}</b>
                            <span>Rs {{ p.fee.toLocaleString('en-US') }}</span>
                          </button>
                        }
                      </div>
                    }

                    <p class="muted xs" style="margin-top:12px">Next free{{ places.length > 1 && h ? ' at ' + h.name : '' }}</p>
                    <div class="slots">
                      @if (ns.length) {
                        @for (s of ns; track s.o + s.t) {
                          <button
                            class="slot"
                            (click)="modalService.openBooking(P.id, s.o, s.t)">
                            {{ s.o === 0 ? 'Today' : doctorsService.shortDay(s.o) }} {{ doctorsService.formatTime(s.t) }}
                          </button>
                        }
                      } @else {
                        <span class="muted sm">No free slots this week</span>
                      }
                    </div>
                  </div>

                  <button
                    class="btn btn-ink"
                    [disabled]="!ns.length"
                    (click)="modalService.openBooking(P.id, ns[0].o, ns[0].t)">
                    Book appointment
                  </button>
                </article>
              }
              @if (docs.length > visibleLimit) {
                <div #loadMoreTrigger style="padding:12px 0;text-align:center">
                  <button class="btn btn-line" type="button" (click)="showMore()">Load more doctors ({{ docs.length - visibleLimit }} more)</button>
                </div>
              }
            } @else {
              <div class="empty">
                <h3 style="font-size:26px">No doctors match yet</h3>
                <p class="muted">Try another city, remove a filter, or ask Pulse to find one for you.</p>
                <button class="btn btn-ink" type="button" (click)="resetFilters()">Reset filters</button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  </section>
  `,
  styles: [`
    :host { display: block; }
    .pg-find { display: block !important; }
  `]
})
export class FindDoctorsComponent implements OnInit, AfterViewInit, OnDestroy {
  router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  @ViewChild('loadMoreTrigger') loadMoreTrigger?: ElementRef<HTMLElement>;
  visibleLimit = 10;
  private io?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && typeof IntersectionObserver !== 'undefined') {
      this.io = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
          this.showMore();
        }
      }, { rootMargin: '200px' });
      if (this.loadMoreTrigger?.nativeElement) {
        this.io.observe(this.loadMoreTrigger.nativeElement);
      }
    }
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }

  showMore(): void {
    this.visibleLimit += 10;
  }
  doctorsService = inject(DoctorsService);
  hospitalsService = inject(HospitalsService);
  reviewsService = inject(ReviewsService);
  modalService = inject(ModalService);
  seo = inject(SeoService);
  route = inject(ActivatedRoute);

  cities = CITIES;
  specMap = SPEC;
  specPlural = SPEC_PLURAL;
  specKeys = Object.keys(SPEC);

  searchQuery = '';
  selectedSpec = 'all';
  selectedCity = 'all';
  selectedMode = 'all';
  onlyToday = false;
  maxFee = 0;
  sortOption = 'soon';
  sidebarOpen = false;

  getDocRating(id: number) {
    return this.reviewsService.getDocStats(id);
  }

  openDoctor(id: number, e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, label, summary, details, .slot, .dc-pl, .btn')) {
      return;
    }
    this.router.navigate(['/doctor', id]);
  }

  ngOnInit(): void {
    this.seo.setPage('Find Doctors');
    this.route.queryParams.subscribe(params => {
      if (params['spec']) this.selectedSpec = params['spec'];
      if (params['city']) this.selectedCity = params['city'];
      if (params['q']) this.searchQuery = params['q'];
    });
  }

  activeDoctors(): Doctor[] {
    return this.doctorsService.doctors().filter(d => !d.off);
  }

  countFreeToday(): number {
    return this.activeDoctors().filter(d => {
      const next = this.doctorsService.nextSlots(d, 1);
      return next.length > 0 && next[0].o === 0;
    }).length;
  }

  countForSpec(k: string): number {
    return this.activeDoctors().filter(d => d.spec === k).length;
  }

  selectSpec(k: string): void {
    this.selectedSpec = k;
  }

  onSearch(e: Event): void {
    e.preventDefault();
    const ds = this.doctorsService.detectSpecialty(this.searchQuery);
    if (ds) {
      this.selectedSpec = ds;
      this.searchQuery = '';
    }
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedSpec = 'all';
    this.selectedCity = 'all';
    this.selectedMode = 'all';
    this.onlyToday = false;
    this.maxFee = 0;
  }

  filterDescription(): string {
    const bits: string[] = [];
    if (this.selectedSpec !== 'all') bits.push(this.specPlural[this.selectedSpec] || this.selectedSpec);
    if (this.selectedCity !== 'all') bits.push(this.selectedCity);
    if (this.searchQuery) bits.push(`“${this.searchQuery}”`);
    return bits.join(' · ');
  }

  activeFilters(): { key: string; label: string }[] {
    const active: { key: string; label: string }[] = [];
    if (this.searchQuery) active.push({ key: 'query', label: `“${this.searchQuery}”` });
    if (this.selectedSpec !== 'all') active.push({ key: 'spec', label: this.specPlural[this.selectedSpec] || this.specMap[this.selectedSpec] || this.selectedSpec });
    if (this.selectedCity !== 'all') active.push({ key: 'city', label: this.selectedCity });
    if (this.selectedMode !== 'all') active.push({ key: 'mode', label: this.selectedMode === 'video' ? 'Video' : 'In clinic' });
    if (this.onlyToday) active.push({ key: 'today', label: 'Free today' });
    if (this.maxFee > 0) active.push({ key: 'fee', label: `Up to Rs ${this.maxFee.toLocaleString('en-US')}` });
    return active;
  }

  removeFilter(key: string): void {
    switch (key) {
      case 'query': this.searchQuery = ''; break;
      case 'spec': this.selectedSpec = 'all'; break;
      case 'city': this.selectedCity = 'all'; break;
      case 'mode': this.selectedMode = 'all'; break;
      case 'today': this.onlyToday = false; break;
      case 'fee': this.maxFee = 0; break;
    }
  }

  getInitials(name: string): string {
    return name.replace('Dr. ', '').split(' ').map(w => w[0]).slice(0, 2).join('');
  }

  filteredDoctors(): Doctor[] {
    const q = this.searchQuery.toLowerCase();
    const ds = this.doctorsService.detectSpecialty(q);
    const list = this.activeDoctors().filter(d => {
      const h = this.hospitalsService.getHospitalById(d.h);
      if (this.selectedSpec !== 'all' && d.spec !== this.selectedSpec) return false;
      if (this.selectedCity !== 'all' && h && h.city !== this.selectedCity) return false;
      if (this.selectedMode === 'video' && !/video/i.test(d.mode)) return false;
      if (this.selectedMode === 'clinic' && !/clinic/i.test(d.mode)) return false;
      if (this.maxFee > 0 && d.fee > this.maxFee) return false;
      if (this.onlyToday) {
        const next = this.doctorsService.nextSlots(d, 1);
        if (!next.length || next[0].o !== 0) return false;
      }
      if (q) {
        const hay = `${d.name} ${SPEC[d.spec]} ${h ? h.name : ''} ${h ? h.city : ''}`.toLowerCase();
        if (!hay.includes(q) && !(ds && ds === d.spec)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (this.sortOption === 'low') return a.fee - b.fee;
      if (this.sortOption === 'high') return b.fee - a.fee;
      if (this.sortOption === 'name') return a.name.localeCompare(b.name);
      if (this.sortOption === 'score') return this.getDocRating(b.id).avg - this.getDocRating(a.id).avg;
      // soon
      const na = this.doctorsService.nextSlots(a, 1)[0];
      const nb = this.doctorsService.nextSlots(b, 1)[0];
      const ka = na ? na.o * 1440 + this.timeToMins(na.t) : 1e9;
      const kb = nb ? nb.o * 1440 + this.timeToMins(nb.t) : 1e9;
      return ka - kb;
    });

    return list;
  }

  private timeToMins(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }
}
