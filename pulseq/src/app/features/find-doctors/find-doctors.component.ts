import { Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
              placeholder="Name or specialty"
              [(ngModel)]="searchQuery"
              (ngModelChange)="resetDoctorPage()"
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
                (click)="selectedCity = 'all'; resetDoctorPage()">
                Any city
              </button>
              @for (c of cities; track c) {
                <button
                  class="chip"
                  [class.on]="selectedCity === c"
                  type="button"
                  (click)="selectedCity = c; resetDoctorPage()">
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
                (click)="selectedMode = 'all'; resetDoctorPage()">
                Any
              </button>
              <button
                class="chip"
                [class.on]="selectedMode === 'clinic'"
                type="button"
                (click)="selectedMode = 'clinic'; resetDoctorPage()">
                In clinic
              </button>
              <button
                class="chip"
                [class.on]="selectedMode === 'video'"
                type="button"
                (click)="selectedMode = 'video'; resetDoctorPage()">
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
                (click)="onlyToday = false; resetDoctorPage()">
                Any day
              </button>
              <button
                class="chip"
                [class.on]="onlyToday"
                type="button"
                (click)="onlyToday = true; resetDoctorPage()">
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
                (click)="maxFee = 0; resetDoctorPage()">
                Any
              </button>
              <button
                class="chip"
                [class.on]="maxFee === 2000"
                type="button"
                (click)="maxFee = 2000; resetDoctorPage()">
                Up to Rs 2,000
              </button>
              <button
                class="chip"
                [class.on]="maxFee === 3000"
                type="button"
                (click)="maxFee = 3000; resetDoctorPage()">
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
          @let docs = filteredDoctors();
          <div class="fdbar">
            <button
              class="btn btn-line fdtoggle"
              type="button"
              (click)="sidebarOpen = !sidebarOpen">
              Filters
            </button>
            <div class="cnt" aria-live="polite">
              @if (docs.length > doctorVisibleLimit) {
                Showing <b>{{ doctorVisibleLimit }}</b> of <b>{{ docs.length }}</b> doctors
              } @else {
                <b>{{ docs.length }}</b>
                {{ docs.length === 1 ? 'doctor' : 'doctors' }}
              }
              @if (filterDescription()) {
                <span class="muted">· {{ filterDescription() }}</span>
              }
            </div>
            <span class="muted sm fd-sort-label" id="fdSortLabel">Sort by</span>
            <div class="fd-sort">
              <button
                #sortTrigger
                class="fd-sort-trigger"
                type="button"
                aria-haspopup="listbox"
                aria-labelledby="fdSortLabel fdSortValue"
                [attr.aria-expanded]="sortMenuOpen"
                aria-controls="fdSortOptions"
                (click)="toggleSortMenu()"
                (keydown)="onSortTriggerKeydown($event)">
                <span id="fdSortValue">{{ sortOptionLabel() }}</span>
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5"/></svg>
              </button>
              @if (sortMenuOpen) {
                <div class="fd-sort-menu" id="fdSortOptions" role="listbox" aria-labelledby="fdSortLabel">
                  @for (option of sortOptions; track option.value) {
                    <button
                      class="fd-sort-option"
                      type="button"
                      role="option"
                      [attr.aria-selected]="sortOption === option.value"
                      [class.selected]="sortOption === option.value"
                      (click)="selectSort(option.value)"
                      (keydown)="onSortOptionKeydown($event, option.value)">
                      <span>{{ option.label }}</span>
                      @if (sortOption === option.value) {
                        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg>
                      }
                    </button>
                  }
                </div>
              }
            </div>
          </div>

          <div class="fdactive" aria-label="Active filters">
            @if (activeFilters().length > 0) {
              <span class="fdactive-label">Active filters</span>
            }
            @for (filter of activeFilters(); track filter.key) {
              <button class="fdx" type="button" (click)="removeFilter(filter.key)" [attr.aria-label]="'Remove ' + filter.label + ' filter'">
                <span>{{ filter.label }}</span><span class="fdx-x" aria-hidden="true">×</span>
              </button>
            }
            @if (activeFilters().length > 0) {
              <button class="fdx clr" type="button" (click)="resetFilters()">
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 5h12M8 5V3.5h4V5m2 0-.7 11H6.7L6 5m2.5 3v5m3-5v5"/></svg>
                <span>Clear all</span>
              </button>
            }
          </div>

          <div class="fdlist" id="fdList">
            @if (docs.length > 0) {
              @for (d of docs.slice(0, doctorVisibleLimit); track d.id) {
                @let P = doctorsService.selectedPlace(d);
                @let h = hospitalsService.getHospitalById(P.h);
                @let ns = getAvailableSlots(P);
                @let today = ns.length > 0 && ns[0].o === 0;
                @let places = doctorsService.placesOf(d);

                <article class="fdcard">
                  <a class="fd-doc" [routerLink]="['/doctor', d.id]">
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
                    <span class="fd-doc-copy">
                      <b class="fd-doc-name">{{ d.name }}</b>
                      <span class="fd-doc-sub">
                        {{ specMap[d.spec] }} · {{ h?.name || 'Clinic' }}{{ h?.city ? ', ' + h?.city : '' }}{{ places.length > 1 ? ' · +' + (places.length - 1) + ' more place' + (places.length > 2 ? 's' : '') : '' }}
                      </span>
                    </span>
                  </a>

                  <div class="fd-meta">
                    <a class="rt" [routerLink]="['/doctor', d.id]" fragment="reviews" (click)="$event.stopPropagation()">
                      <svg class="pulse" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2381FF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                      </svg>
                      <b>{{ getDocRating(d.id).avg.toFixed(1) }}</b>
                      <span>· {{ getDocRating(d.id).n }} reviews</span>
                    </a>
                    <span class="tag">{{ P.mode }}</span>
                  </div>

                  <div class="fd-slots">
                    @if (ns.length) {
                      @for (s of expandedSlots.has(d.id) ? ns : ns.slice(0, 2); track s.o + s.t) {
                        <button
                          class="slot"
                          type="button"
                          (click)="modalService.openBooking(P.id, s.o, s.t)">
                          {{ s.o === 0 ? 'Today' : doctorsService.shortDay(s.o) }} {{ doctorsService.formatTime(s.t) }}
                        </button>
                      }
                      @if (ns.length > 2) {
                        <button
                          class="fd-all-slots"
                          type="button"
                          [attr.aria-expanded]="expandedSlots.has(d.id)"
                          (click)="toggleSlots(d.id)">
                          {{ expandedSlots.has(d.id) ? 'Show fewer' : 'All ' + ns.length + ' times' }}
                          <span aria-hidden="true">{{ expandedSlots.has(d.id) ? '▴' : '▾' }}</span>
                        </button>
                      }
                    } @else {
                      <span class="muted sm">No free slots this week</span>
                    }
                  </div>

                  <div class="fd-actions">
                    <b class="dc-fee">Rs {{ P.fee.toLocaleString('en-US') }}</b>
                    <button
                      class="btn btn-ink"
                      type="button"
                      [disabled]="!ns.length"
                      (click)="ns.length && modalService.openBooking(P.id, ns[0].o, ns[0].t)">
                      Book
                    </button>
                  </div>
                </article>
              }
              @if (docs.length > doctorVisibleLimit) {
                <div class="load-more-wrap">
                  <button class="load-more-btn" type="button" (click)="loadMoreDoctors()">Load more doctors <span>{{ docs.length - doctorVisibleLimit }} remaining</span></button>
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
export class FindDoctorsComponent implements OnInit {
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  expandedSlots = new Set<number>();
  doctorVisibleLimit = 10;
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
  sortMenuOpen = false;
  sortOptions = [
    { value: 'soon', label: 'Earliest available' },
    { value: 'low', label: 'Fee: low to high' },
    { value: 'high', label: 'Fee: high to low' },
    { value: 'score', label: 'Patient score' },
    { value: 'name', label: 'Name' }
  ];
  sidebarOpen = false;

  sortOptionLabel(): string {
    return this.sortOptions.find(option => option.value === this.sortOption)?.label ?? 'Earliest available';
  }

  toggleSortMenu(): void {
    this.sortMenuOpen = !this.sortMenuOpen;
    if (this.sortMenuOpen) {
      setTimeout(() => this.host.nativeElement.querySelector<HTMLButtonElement>('.fd-sort-option[aria-selected="true"]')?.focus());
    }
  }

  selectSort(value: string): void {
    this.sortOption = value;
    this.sortMenuOpen = false;
    this.resetDoctorPage();
    setTimeout(() => this.host.nativeElement.querySelector<HTMLButtonElement>('.fd-sort-trigger')?.focus());
  }

  onSortTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.sortMenuOpen) {
        this.sortMenuOpen = true;
      }
      setTimeout(() => this.host.nativeElement.querySelector<HTMLButtonElement>('.fd-sort-option[aria-selected="true"]')?.focus());
    }
  }

  onSortOptionKeydown(event: KeyboardEvent, value: string): void {
    const options = Array.from(this.host.nativeElement.querySelectorAll<HTMLButtonElement>('.fd-sort-option'));
    const index = options.findIndex(option => option.getAttribute('aria-selected') === 'true');
    let targetIndex = index;
    if (event.key === 'ArrowDown') targetIndex = (index + 1) % options.length;
    else if (event.key === 'ArrowUp') targetIndex = (index - 1 + options.length) % options.length;
    else if (event.key === 'Home') targetIndex = 0;
    else if (event.key === 'End') targetIndex = options.length - 1;
    else if (event.key === 'Escape') {
      event.preventDefault();
      this.sortMenuOpen = false;
      setTimeout(() => this.host.nativeElement.querySelector<HTMLButtonElement>('.fd-sort-trigger')?.focus());
      return;
    } else {
      return;
    }
    event.preventDefault();
    options[targetIndex]?.focus();
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const option = this.sortOptions[targetIndex];
      if (option) this.sortOption = option.value;
    }
  }

  @HostListener('document:click', ['$event'])
  closeSortMenuOnOutsideClick(event: MouseEvent): void {
    if (this.sortMenuOpen && event.target instanceof Node && !this.host.nativeElement.contains(event.target)) {
      this.sortMenuOpen = false;
    }
  }

  getDocRating(id: number) {
    return this.reviewsService.getDocStats(id);
  }

  ngOnInit(): void {
    this.seo.setPage('Find Doctors');
    this.route.queryParams.subscribe(params => {
      this.selectedSpec = params['spec'] && SPEC[params['spec']] ? params['spec'] : 'all';
      this.selectedCity = this.cities.includes(params['city']) ? params['city'] : 'all';
      this.searchQuery = typeof params['q'] === 'string' ? params['q'] : '';
      this.selectedMode = 'all';
      this.onlyToday = false;
      this.maxFee = 0;
      this.resetDoctorPage();
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
    this.resetDoctorPage();
  }

  resetDoctorPage(): void {
    this.doctorVisibleLimit = 10;
  }

  loadMoreDoctors(): void {
    this.doctorVisibleLimit += 10;
  }

  onSearch(e: Event): void {
    e.preventDefault();
    const ds = this.doctorsService.detectSpecialty(this.searchQuery);
    if (ds) {
      this.selectedSpec = ds;
      this.searchQuery = '';
    }
    this.resetDoctorPage();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedSpec = 'all';
    this.selectedCity = 'all';
    this.selectedMode = 'all';
    this.onlyToday = false;
    this.maxFee = 0;
    this.resetDoctorPage();
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
    this.resetDoctorPage();
  }

  getInitials(name: string): string {
    return name.replace('Dr. ', '').split(' ').map(w => w[0]).slice(0, 2).join('');
  }

  getAvailableSlots(place: Place): Slot[] {
    const available: Slot[] = [];
    for (let offset = 0; offset < 5; offset++) {
      for (const time of this.doctorsService.slots(place, offset)) {
        available.push({ o: offset, t: time });
      }
    }
    return available;
  }

  toggleSlots(doctorId: number): void {
    if (this.expandedSlots.has(doctorId)) {
      this.expandedSlots.delete(doctorId);
    } else {
      this.expandedSlots.add(doctorId);
    }
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
