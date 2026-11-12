import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DoctorsService } from '../../services/doctors.service';
import { BookingsService } from '../../services/bookings.service';
import { ToastService } from '../../services/toast.service';
import { INITIAL_CLINIC_STATE, CLINIC_RAIL } from '../../../data/clinic.data';
import { Doctor } from '../../models';
import { SPEC } from '../../../data/specialties.data';

@Component({
  selector: 'app-clinic-dashboard',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="clinic-preview" id="clinic-dashboard" aria-labelledby="clinic-preview-title">
      <div class="clinic-preview-heading">
        <div>
          <span class="clinic-sample-label">Sample data</span>
          <h2 id="clinic-preview-title">Clinic dashboard preview</h2>
        </div>
      </div>
      <div class="clinic-preview-chips" aria-label="Clinic">
        <span class="clinic-preview-chip">Crescent Family Clinic</span>
        <span class="clinic-preview-chip">Lahore</span>
      </div>

      <div class="clinic-mobile-dashboard" aria-label="Mobile clinic dashboard preview">
        <div class="clinic-mobile-topbar">
          <button type="button" aria-label="Open dashboard menu" [attr.aria-expanded]="mobileNavOpen" (click)="toggleMobileNav()">☰</button>
          <span class="clinic-mobile-brand">
            <span class="clinic-mobile-brand-icon" aria-hidden="true">⌁</span>
            <span><b>Crescent</b><small>Family Clinic</small></span>
          </span>
          <button type="button" aria-label="Search dashboard" [attr.aria-expanded]="mobileSearchOpen" (click)="toggleMobileSearch()">⌕</button>
        </div>
        @if (mobileSearchOpen) {
          <div class="clinic-mobile-search">
            <input type="search" placeholder="Search patient, doctor or time" [(ngModel)]="state.q" aria-label="Search patient, doctor or time">
          </div>
        }
        @if (mobileNavOpen) {
          <nav class="clinic-mobile-drawer" aria-label="Dashboard sections">
            @for (r of railItems; track r[0]) {
              <button type="button" [class.active]="state.tab === r[0]" (click)="selectTab(r[0])">
                <span [innerHTML]="r[2]"></span>
                {{ r[1] }}
              </button>
            }
          </nav>
        }
        @if (state.tab === 'today') {
        <div class="clinic-mobile-welcome">
          <div>
            <span class="clinic-mobile-date">MONDAY, 12 AUGUST</span>
            <h3>Good evening</h3>
            <p><i></i> Lahore clinic</p>
          </div>
          <button type="button" (click)="openWalkin()">+ Walk-in</button>
        </div>
        <div class="clinic-mobile-metrics">
          <div><strong>{{ clToday().length }}</strong><span>Appointments</span></div>
          <div><strong>{{ countDone() }}</strong><span>Checked in</span></div>
          <div><strong>Rs {{ totalCash().toLocaleString('en-US') }}</strong><span>Collected</span></div>
        </div>
        @let mobileUpNext = getUpNextGroup();
        <section class="clinic-mobile-upnext">
          <div class="clinic-mobile-section-label">UP NEXT · IN 20 MIN</div>
          <div class="clinic-mobile-upnext-head">
            <strong>{{ mobileUpNext.length ? doctorsService.formatTime(mobileUpNext[0].time) : 'No more' }}</strong>
            <span>{{ mobileUpNext.length }} waiting</span>
          </div>
          @for (a of mobileUpNext.slice(0, 2); track a.id) {
            <div class="clinic-mobile-patient">
              <span class="clinic-mobile-initials">{{ getInitials(a.patient) }}</span>
              <div><b>{{ a.patient }}</b><small>{{ dShort(a.doc) }} · {{ a.note }}</small></div>
              <button type="button" (click)="checkIn(a.id)">Check in</button>
            </div>
          }
        </section>
        <section class="clinic-mobile-live">
          <div class="clinic-mobile-section-head"><div><span class="clinic-mobile-section-label">LIVE STATUS</span><h3>Doctors now</h3></div><a href="#clinic-full-demo">View all ›</a></div>
          <div class="clinic-mobile-doctors">
            @for (d of cfcDocs().slice(0, 2); track d.id) {
              @let s = clStatus(d);
              <article><span class="clinic-mobile-doctor-icon">⚕</span><b>{{ dShort(d.id) }}</b><small [style.color]="s.c">{{ s.t }}</small><button type="button" (click)="toggleBlock(d.id)">{{ state.blocked[d.id] ? 'Unblock today' : 'Block today' }}</button></article>
            }
          </div>
        </section>
        <section class="clinic-mobile-schedule">
          <div class="clinic-mobile-section-head"><div><span class="clinic-mobile-section-label">SCHEDULE</span><h3>Rest of today</h3></div><a href="#clinic-full-demo">Full day ›</a></div>
          @for (a of clToday().slice(0, 4); track a.id) {
            <div class="clinic-mobile-schedule-row"><strong>{{ doctorsService.formatTime(a.time) }}</strong><div><b>{{ a.patient }}</b><small>{{ dShort(a.doc) }}</small></div><span>{{ state.done[a.id] ? 'Here' : 'Expected' }} ›</span></div>
          }
        </section>
        } @else {
          <section class="clinic-mobile-tab-page">
            @if (state.tab === 'schedule') {
              <span class="clinic-mobile-section-label">SCHEDULE</span>
              <h3>Full day</h3>
              @for (a of getScheduleAppointments(); track a.id) {
                <div class="clinic-mobile-schedule-row"><strong>{{ doctorsService.formatTime(a.time) }}</strong><div><b>{{ a.patient }}</b><small>{{ dShort(a.doc) }}</small></div><span>{{ state.done[a.id] ? 'Here' : 'Expected' }} ›</span></div>
              }
            } @else if (state.tab === 'patients') {
              <span class="clinic-mobile-section-label">PATIENTS</span>
              <h3>All patients</h3>
              @for (a of getFilteredPatients(); track a.id) {
                <div class="clinic-mobile-tab-row"><span class="clinic-mobile-initials">{{ getInitials(a.patient) }}</span><div><b>{{ a.patient }}</b><small>{{ dShort(a.doc) }} · {{ doctorsService.formatTime(a.time) }}</small></div><button type="button" (click)="checkIn(a.id)">{{ state.done[a.id] ? 'Here' : 'Check in' }}</button></div>
              }
            } @else if (state.tab === 'doctors') {
              <span class="clinic-mobile-section-label">DOCTORS</span>
              <h3>Doctors today</h3>
              @for (d of cfcDocs(); track d.id) {
                @let s = clStatus(d);
                <div class="clinic-mobile-tab-row"><span class="clinic-mobile-doctor-icon">⚕</span><div><b>{{ dShort(d.id) }}</b><small [style.color]="s.c">{{ s.t }}</small></div><button type="button" (click)="toggleBlock(d.id)">{{ state.blocked[d.id] ? 'Unblock' : 'Block' }}</button></div>
              }
            } @else {
              <span class="clinic-mobile-section-label">BILLING</span>
              <h3>Today's billing</h3>
              <div class="clinic-mobile-billing"><strong>Rs {{ totalCash().toLocaleString('en-US') }}</strong><span>Collected from {{ countDone() }} checked-in patients</span></div>
              @for (a of getCheckedInAppointments(); track a.id) {
                <div class="clinic-mobile-tab-row"><div><b>{{ a.patient }}</b><small>{{ doctorsService.formatTime(a.time) }}</small></div><strong>Paid</strong></div>
              }
            }
          </section>
        }
        <nav class="clinic-mobile-preview-nav" aria-label="Preview navigation">
          @for (r of railItems; track r[0]) {
            <button type="button" [class.active]="state.tab === r[0]" (click)="selectTab(r[0])">
              <span [innerHTML]="r[2]"></span>
              <small>{{ r[1] }}</small>
            </button>
          }
        </nav>
      </div>

      <div class="clinic-preview-stats">
        <article><span>Appointments today</span><strong>{{ clToday().length }}</strong></article>
        <article><span>Checked in</span><strong>{{ countDone() }}</strong></article>
        <article><span>Collected</span><strong>Rs {{ totalCash().toLocaleString('en-US') }}</strong></article>
        <article><span>Clinic time</span><strong>{{ doctorsService.formatTime('17:40') }}</strong></article>
      </div>

      @let previewUpNext = getUpNextGroup();
      <article class="clinic-preview-next">
        <div>
          <span class="clinic-preview-kicker">Up next</span>
          @if (previewUpNext.length > 0) {
            <h3>{{ doctorsService.formatTime(previewUpNext[0].time) }} · {{ dShort(previewUpNext[0].doc) }}</h3>
            <p>{{ previewUpNext[0].patient }} · {{ previewUpNext.length }} {{ previewUpNext.length === 1 ? 'patient' : 'patients' }} waiting</p>
          } @else {
            <h3>No one else waiting</h3>
            <p>Everyone booked for today has checked in.</p>
          }
        </div>
      </article>

      <div class="clinic-preview-list">
        <h3>Appointments</h3>
        @for (a of clToday().slice(0, 3); track a.id) {
          <div class="clinic-preview-row">
            <time>{{ doctorsService.formatTime(a.time) }}</time>
            <span class="clinic-preview-doctor">{{ dShort(a.doc) }}</span>
            <span class="clinic-preview-patient">{{ a.patient }}</span>
            <span class="clinic-preview-status">{{ state.done[a.id] ? 'Checked in' : (a.src === 'online' ? 'Online' : 'Upcoming') }}</span>
          </div>
        }
      </div>

      <a class="clinic-preview-link" href="/clinics#clinic-full-demo">See full demo</a>
    </section>

    <div class="laptop-box" id="clinic-full-demo">
      <div class="laptop">
        <div class="lid">
          <div class="screen">
            <!-- Left Rail -->
            <div class="rail" id="clRail">
              <svg width="34" height="34" viewBox="0 0 36 36" aria-hidden="true" style="margin-bottom:8px">
                <rect width="36" height="36" rx="12" fill="#1A4A92"></rect>
                <path d="M6 19h6l3-8 5 15 3-7h7" fill="none" stroke="#5FA3FF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
              @for (r of railItems; track r[0]) {
                <button
                  [class.on]="state.tab === r[0]"
                  (click)="selectTab(r[0])"
                  [attr.aria-current]="state.tab === r[0] ? 'page' : 'false'">
                  <span style="display:inline-flex;align-items:center;line-height:1" [innerHTML]="r[2]"></span>
                  {{ r[1] }}
                </button>
              }
            </div>

            <!-- Main Screen Area -->
            <div class="dmain">
              <div class="dtop">
                <span class="dpill dkp">Crescent Family Clinic</span>
                <span class="dpill">Lahore</span>
                <div class="dsearch">
                  <input
                    class="dsearch"
                    type="search"
                    placeholder="Search patient, phone or code…"
                    [(ngModel)]="state.q"
                    aria-label="Search dashboard">
                </div>
                <button class="sm-btn" (click)="openWalkin()">+ Walk-in</button>
              </div>

              <!-- Body Area -->
              <div id="clBody">
                @if (state.tab === 'today') {
                  <p class="muted" style="font-size:12px">
                    {{ clToday().length }} appointments today · {{ countDone() }} checked in · Rs {{ totalCash().toLocaleString('en-US') }} collected · clinic time {{ doctorsService.formatTime('17:40') }} (demo)
                  </p>

                  @if (state.walk) {
                    <div class="dform">
                      <input type="text" placeholder="Patient name" [(ngModel)]="walkName" aria-label="Patient name">
                      <select [(ngModel)]="walkDocId" aria-label="Doctor">
                        @for (d of availableCfcDocs(); track d.id) {
                          <option [value]="d.id">{{ d.name }}</option>
                        }
                      </select>
                      <button class="sm-btn" (click)="submitWalkin()">Add and check in</button>
                      <button class="sm-btn" style="background:#E2E8F0" (click)="state.walk = false">Cancel</button>
                      <span class="derr" role="alert">{{ state.err }}</span>
                    </div>
                  }

                  <div class="dcols">
                    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:12px">
                      <!-- UP NEXT BANNER -->
                      @let upNextList = getUpNextGroup();
                      @if (upNextList.length > 0) {
                        @let first = upNextList[0];
                        <div class="dnext">
                          <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:6px">
                            <div>
                              <span style="font-size:11px;letter-spacing:.12em;color:#5FA3FF;font-weight:700">
                                UP NEXT · IN {{ timeToMins(first.time) - nowMinutes }} MIN
                              </span>
                              <div class="big">{{ doctorsService.formatTime(first.time) }}</div>
                            </div>
                            <span style="font-size:12px;color:#B6C6D8">
                              {{ upNextList.length }} {{ upNextList.length === 1 ? 'patient' : 'patients' }} waiting
                            </span>
                          </div>
                          <div style="display:flex;gap:10px;flex-wrap:wrap">
                            @for (a of upNextList; track a.id) {
                              <div class="pt">
                                <div>
                                  <b>{{ a.patient }}</b>
                                  <p style="font-size:11px;color:#B6C6D8">
                                    with {{ dShort(a.doc) }} · {{ a.note }}
                                  </p>
                                </div>
                                <button class="sm-btn" (click)="checkIn(a.id)">Check in</button>
                              </div>
                            }
                          </div>
                        </div>
                      } @else {
                        <div class="dnext">
                          <b>No one else waiting</b>
                          <span style="font-size:12px;color:#B6C6D8">Everyone booked for today has checked in.</span>
                        </div>
                      }

                      <!-- REST OF TODAY LIST -->
                      <div class="dlist">
                        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                          <b style="font-size:14px">Rest of today</b>
                          <button class="st out" (click)="setTab('schedule')">Open schedule</button>
                        </div>
                        @let rest = getRestToday();
                        @if (rest.length > 0) {
                          @for (a of rest; track a.id) {
                            <div class="row">
                              <span class="t">{{ doctorsService.formatTime(a.time) }}</span>
                              <span class="d">{{ dShort(a.doc) }}</span>
                              <span class="p">
                                {{ a.patient }}
                                @if (a.src === 'online') {
                                  <span class="st">Online</span>
                                } @else if (a.src === 'walkin') {
                                  <span class="st out">Walk-in</span>
                                }
                              </span>
                              @if (state.done[a.id]) {
                                <span class="st">Here {{ doctorsService.formatTime(state.done[a.id]) }}</span>
                              } @else {
                                <button class="st out" (click)="checkIn(a.id)">Check in</button>
                              }
                            </div>
                          }
                        } @else {
                          <p class="muted" style="font-size:12px;padding:8px 0">No patients match.</p>
                        }
                      </div>
                    </div>

                    <!-- RIGHT DOCTOR STATUS COLUMN -->
                    <div class="drs">
                      <b style="font-size:14px;display:flex;justify-content:space-between">
                        Doctors now <span style="color:#1558B8;font-size:11px;letter-spacing:.1em">LIVE</span>
                      </b>
                      @for (d of cfcDocs(); track d.id) {
                        @let s = clStatus(d);
                        <div class="dr">
                          <b>{{ dShort(d.id) }}</b>
                          <span [style.color]="s.c" [style.font-weight]="s.w" style="font-size:12px">
                            {{ s.t }}
                          </span>
                          <button class="sm-btn" style="background:#E2E8F0;color:#102A43" (click)="toggleBlock(d.id)">
                            {{ state.blocked[d.id] ? 'Unblock' : 'Block today' }}
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                } @else if (state.tab === 'schedule') {
                  <div class="dsec">
                    <b style="font-size:14px">Schedule</b>
                    @for (item of getScheduleGrouped(); track item.date) {
                      <p style="font-weight:700;margin-top:12px">{{ getDayHeading(item.date) }}</p>
                      @for (a of item.appts; track a.id) {
                        <div class="row">
                          <span class="t">{{ doctorsService.formatTime(a.time) }}</span>
                          <span class="d">{{ dShort(a.doc) }}</span>
                          <span class="p">
                            {{ a.patient }}
                            @if (a.src === 'online') {
                              <span class="st">Online</span>
                            } @else if (a.src === 'walkin') {
                              <span class="st out">Walk-in</span>
                            }
                          </span>
                          @if (state.done[a.id]) {
                            <span class="st">Here {{ doctorsService.formatTime(state.done[a.id]) }}</span>
                          } @else {
                            <button class="st out" (click)="checkIn(a.id)">Check in</button>
                          }
                        </div>
                      }
                    }
                    <p class="muted" style="font-size:12px;margin-top:10px">Bookings made on the public site for your doctors show up here.</p>
                  </div>
                } @else if (state.tab === 'patients') {
                  <div class="dsec">
                    <b style="font-size:14px">Patients</b>
                    @let seen = getFilteredPatients();
                    @if (seen.length > 0) {
                      @for (a of seen; track a.id) {
                        <div class="row">
                          <span class="t">{{ doctorsService.formatTime(a.time) }}</span>
                          <span class="d">{{ dShort(a.doc) }}</span>
                          <span class="p">
                            {{ a.patient }}
                            @if (a.src === 'online') {
                              <span class="st">Online</span>
                            } @else if (a.src === 'walkin') {
                              <span class="st out">Walk-in</span>
                            }
                            @if (a.date) {
                              <span class="xs muted">· {{ getDayHeading(a.date) }}</span>
                            }
                          </span>
                          @if (state.done[a.id]) {
                            <span class="st">Here {{ doctorsService.formatTime(state.done[a.id]) }}</span>
                          } @else {
                            <button class="st out" (click)="checkIn(a.id)">Check in</button>
                          }
                        </div>
                      }
                    } @else {
                      <p class="muted" style="font-size:12px;padding:8px 0">No patients match.</p>
                    }
                  </div>
                } @else if (state.tab === 'doctors') {
                  <div class="dsec">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
                      <b style="font-size:14px">Doctors listed on PulseQ</b>
                      <button class="sm-btn" style="background:#1D6FE0;color:#fff" (click)="state.add = !state.add">
                        {{ state.add ? 'Close' : '+ Add doctor' }}
                      </button>
                    </div>

                    @if (state.add) {
                      <div class="dform" style="background:#EFF6FF;margin-top:10px">
                        <input type="text" placeholder="Doctor name" [(ngModel)]="addDocName" aria-label="Doctor name">
                        <select [(ngModel)]="addDocSpec" aria-label="Specialty">
                          @for (k of specKeys; track k) {
                            <option [value]="k">{{ specNames[k] }}</option>
                          }
                        </select>
                        <input type="number" min="0" placeholder="Fee (Rs)" [(ngModel)]="addDocFee" style="width:110px" aria-label="Consultation fee">
                        <select [(ngModel)]="addDocHrs" aria-label="Hours">
                          <option value="evening">Evening 5 to 9 PM</option>
                          <option value="morning">Morning 9 AM to 1 PM</option>
                          <option value="full">Full day</option>
                        </select>
                        <button class="sm-btn" (click)="submitAddDoc()">List doctor</button>
                        <span class="derr" role="alert">{{ state.err }}</span>
                      </div>
                    }

                    @for (d of cfcDocs(); track d.id) {
                      <div class="drow">
                        <span class="av t{{ d.t }}">{{ getInitials(d.name) }}</span>
                        <div style="flex:1 1 160px;min-width:0">
                          <b>{{ d.name }}</b>
                          <span class="xs muted" style="display:block">{{ specNames[d.spec] || d.spec }} · Rs {{ d.fee.toLocaleString('en-US') }}</span>
                        </div>
                        <span class="st" [class.out]="d.off">{{ d.off ? 'Hidden' : 'Listed' }}</span>
                        <button class="sm-btn" style="background:#E2E8F0;color:#102A43" (click)="doctorsService.toggleDoctor(d.id)">
                          {{ d.off ? 'List again' : 'Hide' }}
                        </button>
                      </div>
                    }
                    <p class="muted" style="font-size:12px;margin-top:10px">Listed doctors can be booked by patients on PulseQ right now.</p>
                  </div>
                } @else {
                  <div class="dsec">
                    <b style="font-size:14px">Collected at the desk today</b>
                    @for (d of cfcDocs(); track d.id) {
                      @let n = countDoneForDoctor(d.id);
                      @let c = n * d.fee;
                      <div class="row">
                        <span class="p"><b>{{ d.name }}</b></span>
                        <span class="d" style="width:110px">{{ n }} {{ n === 1 ? 'patient' : 'patients' }}</span>
                        <b>Rs {{ c.toLocaleString('en-US') }}</b>
                      </div>
                    }
                    <div class="row">
                      <span class="p"><b>Total</b></span>
                      <b>Rs {{ totalCash().toLocaleString('en-US') }}</b>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
        <div class="base"></div>
      </div>
    </div>

    <!-- Fixed Mobile Bottom Tab Bar for Clinic OS (< 900px) -->
    <nav class="clinic-mobile-nav" aria-label="Clinic OS Navigation">
      @for (r of railItems; track r[0]) {
        <button
          class="clinic-mob-tab"
          [class.active]="state.tab === r[0]"
          (click)="selectTab(r[0])"
          type="button"
          [attr.aria-current]="state.tab === r[0] ? 'page' : 'false'">
          <span class="mob-tab-icon" [innerHTML]="r[2]"></span>
          <span class="mob-tab-lbl">{{ r[1] }}</span>
        </button>
      }
    </nav>
  `
})
export class ClinicDashboardComponent {
  doctorsService = inject(DoctorsService);
  bookingsService = inject(BookingsService);
  toast = inject(ToastService);

  state = { ...INITIAL_CLINIC_STATE };
  railItems = CLINIC_RAIL;
  mobileNavOpen = false;
  mobileSearchOpen = false;
  nowMinutes = 17 * 60 + 40; // 17:40
  currentTime = '17:40';

  walkName = '';
  walkDocId = 101;

  addDocName = '';
  addDocSpec = 'general';
  addDocFee = 1500;
  addDocHrs = 'evening';

  specNames = SPEC;
  specKeys = Object.keys(SPEC);

  cfcDocs(): Doctor[] {
    return this.doctorsService.doctors().filter(d => d.h === 'cfc');
  }

  availableCfcDocs(): Doctor[] {
    return this.cfcDocs().filter(d => !d.off && !this.state.blocked[d.id]);
  }

  timeToMins(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  dShort(id: number): string {
    const d = this.doctorsService.getDoctorById(id);
    return d ? d.name.split(' ').slice(0, 2).join(' ') : 'Doctor';
  }

  getInitials(name: string): string {
    return name.replace('Dr. ', '').split(' ').map(w => w[0]).slice(0, 2).join('');
  }

  setTab(tab: string): void {
    this.state.tab = tab;
    this.state.walk = false;
    this.state.add = false;
    this.state.err = '';
  }

  toggleMobileNav(): void {
    this.mobileNavOpen = !this.mobileNavOpen;
    if (this.mobileNavOpen) this.mobileSearchOpen = false;
  }

  toggleMobileSearch(): void {
    this.mobileSearchOpen = !this.mobileSearchOpen;
    if (this.mobileSearchOpen) {
      this.mobileNavOpen = false;
      setTimeout(() => document.querySelector<HTMLInputElement>('.clinic-mobile-search input')?.focus(), 0);
    }
  }

  selectTab(tab: string): void {
    this.setTab(tab);
    this.mobileNavOpen = false;
  }

  focusDashboardSearch(): void {
    this.toggleMobileSearch();
  }

  openWalkin(): void {
    this.state.tab = 'today';
    this.state.walk = true;
    this.state.err = '';
    const free = this.availableCfcDocs();
    if (free.length) {
      this.walkDocId = free[0].id;
    }
  }

  clOnline(): any[] {
    const ids = this.cfcDocs().map(d => d.id);
    return this.bookingsService.bookings()
      .filter(b => b.key)
      .map(b => {
        const k = b.key.split('|');
        return {
          id: b.code,
          time: k[2],
          date: k[1],
          doc: +k[0],
          patient: b.name,
          note: 'Booked on PulseQ',
          src: 'online',
          phone: b.phone || '',
          code: b.code
        };
      })
      .filter(a => ids.includes(a.doc));
  }

  clToday(): any[] {
    const todayIso = this.doctorsService.isoOf(0);
    const seed = this.state.appts.map(a => ({ ...a, date: todayIso }));
    const online = this.clOnline().filter(a => a.date === todayIso);
    return [...seed, ...online].sort((a, b) => this.timeToMins(a.time) - this.timeToMins(b.time));
  }

  countDone(): number {
    return this.clToday().filter(a => !!this.state.done[a.id]).length;
  }

  countDoneForDoctor(docId: number): number {
    return this.clToday().filter(a => a.doc === docId && !!this.state.done[a.id]).length;
  }

  totalCash(): number {
    return this.cfcDocs().reduce((sum, d) => sum + this.countDoneForDoctor(d.id) * d.fee, 0);
  }

  getUpNextGroup(): any[] {
    const up = this.clToday().filter(a => this.timeToMins(a.time) >= this.nowMinutes && !this.state.done[a.id] && this.matchesSearch(a));
    if (!up.length) return [];
    const firstTime = up[0].time;
    return up.filter(a => a.time === firstTime);
  }

  getRestToday(): any[] {
    const upNext = this.getUpNextGroup();
    return this.clToday().filter(a => {
      if (upNext.some(u => u.id === a.id)) return false;
      return this.matchesSearch(a);
    });
  }

  private matchesSearch(appointment: any): boolean {
    const q = this.state.q.trim().toLowerCase();
    if (!q) return true;
    const doctor = this.dShort(appointment.doc).toLowerCase();
    const time = this.doctorsService.formatTime(appointment.time).toLowerCase();
    return `${appointment.patient} ${doctor} ${appointment.time} ${time} ${appointment.phone || ''} ${appointment.code || ''}`
      .toLowerCase()
      .includes(q);
  }

  clStatus(d: Doctor): { t: string; c: string; w: number } {
    if (this.state.blocked[d.id]) {
      return { t: "Blocked today", c: "#B42318", w: 700 };
    }
    const ap = this.clToday().filter(a => a.doc === d.id);
    const cur = ap.find(a => this.state.done[a.id] && this.timeToMins(a.time) <= this.nowMinutes && this.timeToMins(a.time) >= this.nowMinutes - 45);
    if (cur) {
      return { t: `With patient · ${this.timeToMins(cur.time) + 45 - this.nowMinutes} min left`, c: "#526477", w: 400 };
    }
    const nx = ap.find(a => this.timeToMins(a.time) >= this.nowMinutes && !this.state.done[a.id]);
    return {
      t: nx ? `Free till ${this.doctorsService.formatTime(nx.time)}` : "Free for the rest of today",
      c: "#1558B8",
      w: 700
    };
  }

  toggleBlock(docId: number): void {
    this.state.blocked[docId] = !this.state.blocked[docId];
  }

  checkIn(apptId: string): void {
    this.state.done[apptId] = this.currentTime;
  }

  submitWalkin(): void {
    if (this.walkName.trim().length < 2) {
      this.state.err = "Enter the patient’s name.";
      return;
    }
    this.state.n++;
    const nid = 'w' + this.state.n;
    this.state.appts.push({
      id: nid,
      time: this.currentTime,
      doc: +this.walkDocId,
      patient: this.walkName.trim(),
      note: 'Walk-in',
      src: 'walkin'
    });
    this.state.done[nid] = this.currentTime;
    this.toast.show(`${this.walkName.trim()} added and checked in`);
    this.walkName = '';
    this.state.walk = false;
    this.state.err = '';
  }

  submitAddDoc(): void {
    const name = this.addDocName.trim();
    if (name.length < 3) {
      this.state.err = "Enter the doctor’s name.";
      return;
    }
    if (!(this.addDocFee > 0)) {
      this.state.err = "Enter the consultation fee.";
      return;
    }
    const timesMap: Record<string, string[]> = {
      morning: ["09:00", "10:00", "11:00", "12:00"],
      evening: ["17:00", "18:00", "19:00", "20:00"],
      full: ["09:00", "11:00", "14:00", "16:00", "18:00", "20:00"]
    };
    this.state.n++;
    const newDoc: Doctor = {
      id: 200 + this.state.n,
      name: /^dr\.?\s/i.test(name) ? name : `Dr. ${name}`,
      spec: this.addDocSpec,
      h: 'cfc',
      fee: this.addDocFee,
      mode: 'In clinic',
      t: (this.state.n % 5) + 1,
      times: timesMap[this.addDocHrs] || timesMap['evening']
    };
    this.doctorsService.addDoctor(newDoc);
    this.toast.show(`${newDoc.name} is now listed on PulseQ`);
    this.addDocName = '';
    this.state.add = false;
    this.state.err = '';
  }

  getDayHeading(isoDate: string): string {
    const todayIso = this.doctorsService.isoOf(0);
    const diff = Math.round((new Date(isoDate + 'T00:00:00').getTime() - new Date(todayIso + 'T00:00:00').getTime()) / 864e5);
    return this.doctorsService.dayLabel(diff);
  }

  getScheduleGrouped(): { date: string; appts: any[] }[] {
    const map: Record<string, any[]> = {};
    const todayIso = this.doctorsService.isoOf(0);
    this.state.appts.filter(a => this.matchesSearch(a)).forEach(a => {
      (map[todayIso] = map[todayIso] || []).push(a);
    });
    this.clOnline().filter(a => this.matchesSearch(a)).forEach(a => {
      (map[a.date] = map[a.date] || []).push(a);
    });
    return Object.keys(map).sort().map(d => ({
      date: d,
      appts: map[d].sort((a, b) => this.timeToMins(a.time) - this.timeToMins(b.time))
    }));
  }

  getFilteredPatients(): any[] {
    const all = [...this.clToday(), ...this.clOnline().filter(a => a.date !== this.doctorsService.isoOf(0))];
    return all.filter(a => this.matchesSearch(a));
  }

  getScheduleAppointments(): any[] {
    return [...this.clToday(), ...this.clOnline()]
      .filter(a => this.matchesSearch(a))
      .sort((a, b) => this.timeToMins(a.time) - this.timeToMins(b.time));
  }

  getCheckedInAppointments(): any[] {
    return this.clToday().filter(a => !!this.state.done[a.id] && this.matchesSearch(a));
  }
}
