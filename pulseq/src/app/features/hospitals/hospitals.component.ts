import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HospitalsService } from '../../shared/services/hospitals.service';
import { DoctorsService } from '../../shared/services/doctors.service';
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
          <h2>Book the hospital, not just the doctor.</h2>
          <p>Browse hospitals by city or department, then book a doctor there.</p>
        </div>

        <form class="pgsearch" (submit)="onSearch($event)">
          <label class="sr" for="hpQ">Search hospitals</label>
          <input
            class="inp"
            id="hpQ"
            type="search"
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

      <p class="muted" aria-live="polite" style="margin-top:6px">
        <b style="color:var(--fg)">{{ filteredHospitals().length }}</b>
        {{ filteredHospitals().length === 1 ? 'hospital' : 'hospitals' }} shown
      </p>

      <div class="hpgrid">
        @let list = filteredHospitals();
        @if (list.length > 0) {
          @for (h of list; track h.id) {
            @let n = hospitalsService.getDoctorsAtHospital(h.id).length;
            @let free = hospitalsService.getFreeTodayCount(h.id);

            <article class="hosp hpc">
              <div class="hosp-top t{{ h.t }}">
                <span class="big">{{ h.name[0] }}</span>
                @if (h.badge) {
                  <span class="tag">{{ h.badge }}</span>
                }
              </div>
              <div class="hosp-body">
                <h3 style="font-size:22px">{{ h.name }}</h3>
                <p class="muted sm">{{ h.city }}</p>
                <div class="deptpills">
                  @for (part of h.depts.split(' · '); track part) {
                    <span>{{ part }}</span>
                  }
                </div>
                <div class="hp-stats">
                  <span><b>{{ n }}</b> {{ n === 1 ? 'doctor' : 'doctors' }}</span>
                  <span><b>{{ free }}</b> free today</span>
                </div>
                <a class="btn btn-line full" [routerLink]="['/hospital', h.id]">
                  View doctors and book
                </a>
              </div>
            </article>
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
  `]
})
export class HospitalsComponent implements OnInit {
  hospitalsService = inject(HospitalsService);
  doctorsService = inject(DoctorsService);
  seo = inject(SeoService);
  route = inject(ActivatedRoute);

  cities = CITIES;
  searchQuery = '';
  selectedCity = 'all';
  selectedDept = 'all';
  emergencyOnly = false;

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
}
