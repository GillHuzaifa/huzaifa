import { Component, inject, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HospitalsService } from '../../shared/services/hospitals.service';
import { DoctorsService } from '../../shared/services/doctors.service';
import { ReviewsService } from '../../shared/services/reviews.service';
import { SeoService } from '../../shared/services/seo.service';
import { CITIES } from '../../data/specialties.data';
import { Hospital } from '../../shared/models';

@Component({
  selector: 'app-hospitals',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="sec pg-hosps" id="page-hosps">
      <div class="wrap" id="hpRoot">
        <div class="pghead">
        <div class="pgh-txt">
          <span class="eyebrow" style="color:#BFD9FF">Hospitals and clinics</span>
          <h2>Find a hospital, then pick its doctor.</h2>
          <p>Browse hospitals by city or department, then book a doctor there.</p>
        </div>

        <form class="pgsearch" (submit)="onSearch($event)">
          <label class="sr" for="hpQ">Search hospitals</label>
          <input
            class="inp"
            id="hpQ"
            type="search"
            enterkeyhint="search"
            placeholder="Hospital, city or department"
            [(ngModel)]="searchQuery"
            name="q"
            autocomplete="off">
          <button class="btn btn-mint" type="submit">Search</button>
        </form>
      </div>

      <div class="pgstats">
        <div class="pgstat">
          <b>{{ hospitalsService.hospitals().length }}</b>
          <span>Hospitals and clinics</span>
        </div>
        <div class="pgstat">
          <b>{{ cities.length }}</b>
          <span>Cities</span>
        </div>
        <div class="pgstat">
          <b>{{ activeDoctorsCount() }}</b>
          <span>Doctors bookable</span>
        </div>
        <div class="pgstat">
          <b>{{ emergencyCount() }}</b>
          <span>With 24/7 emergency</span>
        </div>
      </div>

      <div class="hpfilters">
        <div class="chips" role="group" aria-label="City">
          <button
            class="chip"
            [class.on]="selectedCity === 'all'"
            type="button"
            (click)="selectedCity = 'all'">
            All cities
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
          <button
            class="chip"
            [class.on]="emergencyOnly"
            type="button"
            (click)="emergencyOnly = !emergencyOnly">
            Emergency 24/7
          </button>
        </div>

        <div class="chips" role="group" aria-label="Department">
          <button
            class="chip"
            [class.on]="selectedDept === 'all'"
            type="button"
            (click)="selectedDept = 'all'">
            All departments
          </button>
          @for (d of hospitalsService.depts; track d[0]) {
            <button
              class="chip"
              [class.on]="selectedDept === d[0]"
              type="button"
              (click)="selectedDept = d[0]">
              {{ d[0] }}
            </button>
          }
        </div>
      </div>

      @let list = visibleHospitals();
      <p class="muted" id="hpCount" aria-live="polite" style="margin-top:6px">
        @if (filteredHospitals().length > list.length) {
          Showing <b style="color:var(--fg)">{{ list.length }}</b> of <b style="color:var(--fg)">{{ filteredHospitals().length }}</b> hospitals
        } @else {
          <b style="color:var(--fg)">{{ filteredHospitals().length }}</b>
          {{ filteredHospitals().length === 1 ? 'hospital' : 'hospitals' }}
        }
      </p>

      <div class="hdir" id="hdir">
        @if (list.length > 0) {
          @for (group of hospitalGroups(list); track group.city) {
            @if (selectedCity === 'all') {
              <h3 class="hgroup">{{ group.city }} <span>{{ group.hospitals.length }} {{ group.hospitals.length === 1 ? 'hospital' : 'hospitals' }}</span></h3>
            }
            @for (h of group.hospitals; track h.id) {
              @let n = hospitalsService.getDoctorsAtHospital(h.id).length;
              @let free = hospitalsService.getFreeTodayCount(h.id);
              <a class="hrow" [routerLink]="['/hospital', h.id]">
                <span class="hr-l">{{ h.name[0] }}</span>
                <span class="min0">
                  <b class="hr-n">{{ h.name }} @if (h.badge) { <em class="hr-e">{{ h.badge }}</em> }</b>
                  <span class="hr-s">{{ h.city }} · {{ h.depts.split(' · ').slice(0, 3).join(' · ') }}</span>
                  <span class="hr-c"><b>{{ n }}</b> {{ n === 1 ? 'doctor' : 'doctors' }} · <b>{{ free }}</b> free today</span>
                </span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>
              </a>
            }
          }
          @if (filteredHospitals().length > list.length) {
            <div #loadMoreHosp class="lz-sent">
              <button class="btn btn-line" type="button" (click)="showMore()">Load more hospitals ({{ filteredHospitals().length - list.length }} more)</button>
            </div>
          }
        } @else {
          <div class="empty" style="grid-column:1/-1">
            <h3 style="font-size:26px">No hospitals match</h3>
            <p class="muted">Try a different name, city or department.</p>
            <button class="btn btn-ink" type="button" (click)="resetFilters()">Reset filters</button>
          </div>
        }
      </div>
    </div>
  </section>
  `,
  styles: [`
    :host { display: block; }
    .pg-hosps { display: block !important; }
    .hdir { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; margin-top: 10px; }
    .hgroup { grid-column: 1 / -1; display: flex; align-items: baseline; gap: 10px; margin: 20px 0 2px; font-size: 22px; }
    .hgroup:first-child { margin-top: 4px; }
    .hgroup span { color: var(--muted); font-size: 14px; font-weight: 500; }
    .hrow { display: flex; align-items: center; gap: 14px; min-width: 0; padding: 14px 18px; border-radius: 20px; background: #fff; box-shadow: inset 0 0 0 1.5px #D6E6FB; color: var(--fg); text-decoration: none; }
    .hrow:hover { box-shadow: inset 0 0 0 2px #2381FF; }
    .hrow > svg { flex: none; margin-left: auto; color: #2381FF; }
    .hr-l { display: flex; flex: none; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 14px; background: #2381FF; color: #fff; font-size: 22px; }
    .hr-n { display: block; font-size: 18px; line-height: 1.25; }
    .hr-s, .hr-c { display: block; margin-top: 2px; color: var(--muted); font-size: 14px; line-height: 1.4; }
    .hr-c b { color: #1558B8; }
    .hr-e { padding: 1px 8px; border-radius: 6px; background: #FEE2E2; color: #B91C1C; font-size: 12px; font-style: normal; }
    .lz-sent { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 18px 0 6px; text-align: center; }
    @media (max-width: 1000px) { .hdir { grid-template-columns: 1fr; } }
  `]
})
export class HospitalsComponent implements OnInit, AfterViewInit, OnDestroy {
  router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  @ViewChild('loadMoreHosp') loadMoreHosp?: ElementRef<HTMLElement>;
  visibleLimit = 20;
  private io?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && typeof IntersectionObserver !== 'undefined') {
      this.io = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) this.showMore();
      }, { rootMargin: '200px' });
      if (this.loadMoreHosp?.nativeElement) this.io.observe(this.loadMoreHosp.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }

  showMore(): void {
    this.visibleLimit += 20;
  }
  hospitalsService = inject(HospitalsService);
  doctorsService = inject(DoctorsService);
  reviewsService = inject(ReviewsService);
  seo = inject(SeoService);
  route = inject(ActivatedRoute);

  cities = CITIES;
  searchQuery = '';
  selectedCity = 'all';
  selectedDept = 'all';
  emergencyOnly = false;

  getHospRating(id: string) {
    return this.reviewsService.getHospStats(id);
  }

  openHospital(id: string, e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.closest('a, button')) {
      return;
    }
    this.router.navigate(['/hospital', id]);
  }

  ngOnInit(): void {
    this.seo.setPage('Hospitals and Clinics');
    this.route.queryParams.subscribe(params => {
      if (params['q']) this.searchQuery = params['q'];
      if (params['city']) this.selectedCity = params['city'];
      if (params['dept']) this.selectedDept = params['dept'];
    });
  }

  activeDoctorsCount(): number {
    return this.doctorsService.doctors().filter(d => !d.off).length;
  }

  emergencyCount(): number {
    return this.hospitalsService.hospitals().filter(h => !!h.badge).length;
  }

  onSearch(e: Event): void {
    e.preventDefault();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCity = 'all';
    this.selectedDept = 'all';
    this.emergencyOnly = false;
  }

  filteredHospitals(): Hospital[] {
    const q = this.searchQuery.toLowerCase();
    return this.hospitalsService.hospitals().filter(h => {
      if (this.selectedCity !== 'all' && h.city !== this.selectedCity) return false;
      if (this.emergencyOnly && !h.badge) return false;
      if (this.selectedDept !== 'all') {
        const deptObj = this.hospitalsService.depts.find(d => d[0] === this.selectedDept);
        if (deptObj && !new RegExp(deptObj[1], 'i').test(h.depts)) {
          return false;
        }
      }
      if (q && !`${h.name} ${h.city} ${h.depts}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }

  visibleHospitals(): Hospital[] {
    return this.filteredHospitals()
      .sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name))
      .slice(0, this.visibleLimit);
  }

  hospitalGroups(hospitals: Hospital[]): { city: string; hospitals: Hospital[] }[] {
    const groups = new Map<string, Hospital[]>();
    hospitals.forEach(hospital => {
      const group = groups.get(hospital.city) || [];
      group.push(hospital);
      groups.set(hospital.city, group);
    });
    return [...groups].map(([city, items]) => ({ city, hospitals: items }));
  }
}
