import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurgeryService } from '../../shared/services/surgery.service';
import { HospitalsService } from '../../shared/services/hospitals.service';
import { SeoService } from '../../shared/services/seo.service';
import { Procedure, Surgeon, Hospital } from '../../shared/models';

@Component({
  selector: 'app-surgery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (viewMode === 'surgery') {
      <section class="sec pg-surgery" id="page-surgery">
        <div class="wrap">
          <div class="mhero">
            <div style="flex:1 1 420px;min-width:0;display:flex;flex-direction:column;gap:16px">
              <span class="eyebrow">PulseQ surgery</span>
              <h2 style="font-size:clamp(27px,4.3vw,55px)">Surgery, planned properly.</h2>
              <p class="muted" style="font-size:18px;max-width:540px">See a price range first, compare hospitals, meet your surgeon in a consultation, then decide. Nothing is booked until you have a written quote.</p>
              <div style="display:flex;flex-wrap:wrap;gap:12px">
                <button class="btn btn-ink" type="button" (click)="viewMode = 'surgeons'">Browse all surgeons</button>
                <button class="btn btn-line" type="button" (click)="scrollToJourney()">See how it works</button>
              </div>
            </div>
            <div class="rxcard">
              <span class="pillart" aria-hidden="true"><i></i><i class="r"></i><i></i></span>
              <h3 style="font-size:26px">What makes this different</h3>
              <ul style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:8px">
                <li><b>Price range up front.</b> No “call for a price”.</li>
                <li><b>Consultation first.</b> You meet the surgeon before you commit.</li>
                <li><b>Compare two hospitals</b> side by side.</li>
                <li><b>Track every stage</b> from request to follow-up.</li>
              </ul>
            </div>
          </div>

          <span class="eyebrow" style="display:block">Step 1</span>
          <h3 style="font-size:28px;margin:6px 0 14px">What kind of surgery?</h3>
          <div class="needs" id="sCats" role="group" aria-label="Choose a surgery area">
            @for (cat of surgeryService.categories(); track cat.k) {
              @let on = selectedCat === cat.k;
              @let cnt = getProcsCount(cat.k);
              <button
                class="need {{ cat.cls }}"
                [class.on]="on"
                [attr.aria-pressed]="on"
                type="button"
                (click)="selectCategory(cat.k)">
                <span class="pillart" aria-hidden="true"><i></i><i class="r"></i></span>
                <b>{{ cat.t }}</b>
                <small>{{ cat.s }}</small>
                <small><b style="font-family:var(--body);font-size:13px">{{ cnt }} procedures</b></small>
              </button>
            }
          </div>

          <div class="chips" id="sProcs" role="group" aria-label="Choose a procedure" style="margin:16px 0">
            @for (x of currentProcedures(); track x.id) {
              <button
                class="chip"
                [class.on]="selectedProcId === x.id"
                [attr.aria-pressed]="selectedProcId === x.id"
                type="button"
                (click)="selectProc(x.id)">
                {{ x.n }}
              </button>
            }
          </div>

          @if (currentProc(); as pr) {
            <div id="sDetail">
              <div class="sdetail">
                <div>
                  <h3 style="font-size:30px">{{ pr.n }}</h3>
                  <p class="muted" style="font-size:17px;margin-top:6px">{{ pr.d }}</p>
                </div>
                <div class="sstats">
                  <div><span class="xs muted">Typical hospital stay</span><b>{{ pr.stay }}</b></div>
                  <div><span class="xs muted">Typical recovery</span><b>{{ pr.rec }}</b></div>
                  <div><span class="xs muted">Estimated cost</span><b>{{ surgeryService.formatRange([pr.lo, pr.hi]) }}</b></div>
                </div>
                <div>
                  <b>Usually included in your quote</b>
                  <ul class="sinc">
                    @for (inc of surgeryService.inclusions; track inc) {
                      <li>{{ inc }}</li>
                    }
                  </ul>
                </div>
                <div>
                  <button class="btn btn-line" type="button" (click)="browseSurgeonsForProc(pr.id)">See all surgeons for this</button>
                </div>
                <p class="muted xs">Sample estimates for this demo. Your surgeon gives a written quote after the consultation, and it lists exactly what is included.</p>
              </div>
            </div>

            <span class="eyebrow" style="display:block;margin-top:36px">Step 2</span>
            <h3 style="font-size:28px;margin:6px 0 6px">Choose a hospital and surgeon</h3>
            <p class="muted sm" id="sHospNote" style="margin-bottom:14px">
              {{ currentHosps().length }} {{ currentHosps().length === 1 ? 'hospital offers ' : 'hospitals offer ' }}{{ pr.n.toLowerCase() }}. Tap Compare on two to see them side by side.
            </p>

            <div class="sgrid" id="sHosp">
              @for (h of currentHosps(); track h.id) {
                @let on = isComparing(h.id);
                @let r = surgeryService.hrange(pr, h.id);
                @let ss = surgeryService.surgsAt(h.id, pr.id);
                <article class="shosp" [class.on]="on">
                  <div class="row-between">
                    <div>
                      <h4>{{ h.name }}</h4>
                      <p class="muted sm">{{ h.city }}</p>
                    </div>
                    <button
                      class="chip"
                      [class.on]="on"
                      [attr.aria-pressed]="on"
                      type="button"
                      (click)="toggleCompare(h.id)">
                      {{ on ? 'Comparing' : 'Compare' }}
                    </button>
                  </div>
                  <p>
                    <span class="xs muted">Estimated cost here</span><br>
                    <b style="font-size:18px">{{ surgeryService.formatRange(r) }}</b>
                  </p>
                  @for (s of ss; track s.id) {
                    <div class="srow">
                      <span class="avatar t{{ s.tint }}">{{ getInitials(s.n) }}</span>
                      <div class="min0" style="flex:1 1 140px">
                        <b>{{ s.n }}</b>
                        <span class="xs muted" style="display:block">{{ s.t }} · {{ s.x }} years · consultation {{ surgeryService.formatMoney(s.fee) }}</span>
                      </div>
                      <button class="btn btn-ink" type="button" (click)="openBooking(s, pr.id)">Book consultation</button>
                    </div>
                  }
                </article>
              }
            </div>

            <div id="sCmp" aria-live="polite">
              @if (comparedHosps.length === 2) {
                @let A = getHospital(comparedHosps[0]);
                @let B = getHospital(comparedHosps[1]);
                @if (A && B) {
                  @let ca = getHospitalCol(A, pr);
                  @let cb = getHospitalCol(B, pr);
                  <div class="cmpwrap" tabindex="0" role="group" aria-label="Hospital comparison">
                    <table class="cmp">
                      <thead>
                        <tr>
                          <th scope="col"><span class="xs muted">{{ pr.n }}</span></th>
                          <th scope="col">{{ A.name }}</th>
                          <th scope="col">{{ B.name }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><th scope="row">City</th><td>{{ A.city }}</td><td>{{ B.city }}</td></tr>
                        <tr><th scope="row">Estimated cost</th><td>{{ ca.r }}</td><td>{{ cb.r }}</td></tr>
                        <tr><th scope="row">Surgeons</th><td>{{ ca.s }}</td><td>{{ cb.s }}</td></tr>
                        <tr><th scope="row">Most experienced</th><td>{{ ca.x }}</td><td>{{ cb.x }}</td></tr>
                        <tr><th scope="row">Consultation fee</th><td>{{ ca.f }}</td><td>{{ cb.f }}</td></tr>
                      </tbody>
                    </table>
                  </div>
                }
              } @else if (comparedHosps.length === 1) {
                <p class="muted sm" style="margin-top:12px">Pick one more hospital to compare.</p>
              }
            </div>
          }

          @if (requests().length > 0) {
            <div id="sReqWrap" style="margin-top:44px">
              <h3 style="font-size:28px;margin-bottom:14px">Your surgery requests</h3>
              <div class="mine" id="sReq">
                @for (r of requests(); track r.code) {
                  <div class="bk">
                    <span class="muted xs">{{ r.hospital }}</span>
                    <code>{{ r.code }}</code>
                    <b>{{ r.proc }}</b>
                    <p class="sm">{{ r.doctor }} · {{ r.when }}</p>
                    <div class="track" aria-hidden="true">
                      @for (st of surgeryService.stages; track st; let i = $index) {
                        <i [class.on]="i <= r.stage"></i>
                      }
                    </div>
                    <p class="xs muted">Stage {{ r.stage + 1 }} of 6 · {{ surgeryService.stages[r.stage] }}. The hospital will contact you on {{ r.phone }}.</p>
                    <button class="btn btn-line" type="button" (click)="cancelRequest(r.code)" style="margin-top:8px">Cancel request</button>
                  </div>
                }
              </div>
            </div>
          }

          <div id="sJourney" style="margin-top:56px">
            <span class="eyebrow">How it works</span>
            <h3 style="font-size:clamp(26px,3.0vw,30px);margin:6px 0 16px">Your surgery journey, stage by stage</h3>
            <div class="jsteps">
              <div class="jstep"><span class="n">1</span><b>Request</b><p class="muted sm">Pick a surgeon and a preferred day. The hospital’s coordinator contacts you.</p></div>
              <div class="jstep"><span class="n">2</span><b>Consultation</b><p class="muted sm">Meet the surgeon, go through options, risks and recovery.</p></div>
              <div class="jstep"><span class="n">3</span><b>Written quote</b><p class="muted sm">You get a written price that lists what is included. No pressure to accept.</p></div>
              <div class="jstep"><span class="n">4</span><b>Date and pre-op</b><p class="muted sm">Choose a surgery date and complete the tests and checklist.</p></div>
              <div class="jstep"><span class="n">5</span><b>Surgery</b><p class="muted sm">The hospital team looks after you through the procedure and stay.</p></div>
              <div class="jstep"><span class="n">6</span><b>Follow-up</b><p class="muted sm">Check-ups after surgery are tracked in the same place.</p></div>
            </div>
            <p class="muted xs" style="margin-top:16px;max-width:680px">Prices, stays and recovery times here are sample estimates for the demo. Real figures come from each hospital’s written quote. This page is not medical advice.</p>
          </div>
        </div>
      </section>
    } @else {
      <!-- Surgeons View (page-surgeons) -->
      <section class="sec pg-surgeons" id="page-surgeons">
        <div class="wrap">
          <div class="sec-head">
            <div style="display:flex;flex-direction:column;gap:14px">
              <span class="eyebrow">Surgeons</span>
              <h2>Every surgeon, by hospital.</h2>
            </div>
            <p class="muted" style="max-width:380px">Each hospital on PulseQ lists its own surgeons. Pick one and book a consultation before you decide on surgery. Sample profiles for this demo.</p>
          </div>

          <div class="symbox">
            <div class="field wide">
              <label for="fq">Search surgeons</label>
              <input id="fq" type="search" enterkeyhint="search" [(ngModel)]="fQuery" placeholder="Name, hospital or procedure, e.g. knee replacement" autocomplete="off">
            </div>
          </div>

          <div class="chips" id="fSpec" role="group" aria-label="Surgery area" style="margin-bottom:10px">
            @for (sp of fSpecs; track sp[0]) {
              <button class="chip" [class.on]="fSpec === sp[0]" [attr.aria-pressed]="fSpec === sp[0]" type="button" (click)="fSpec = sp[0]">
                {{ sp[1] }}
              </button>
            }
          </div>

          <div class="chips" id="fCity" role="group" aria-label="City" style="margin-bottom:12px">
            @for (c of fCities; track c) {
              <button class="chip" [class.on]="fCity === c" [attr.aria-pressed]="fCity === c" type="button" (click)="fCity = c">
                {{ c === 'all' ? 'All cities' : c }}
              </button>
            }
          </div>

          <div class="filterbar" id="fNote" aria-live="polite">
            <b>{{ filteredSurgeons().length }} {{ filteredSurgeons().length === 1 ? 'surgeon' : 'surgeons' }}</b>
            @if (fProc) {
              <span class="muted">· for {{ getProcName(fProc) }}</span>
            }
            @if (fProc || fSpec !== 'all' || fCity !== 'all' || fQuery) {
              <button class="chip" type="button" (click)="clearFilters()">Clear filters</button>
            }
          </div>

          <div class="sgrid" id="fGrid">
            @for (s of filteredSurgeons(); track s.id) {
              @let h = getHospital(s.h);
              @let pid = (fProc && s.p.indexOf(fProc) > -1) ? fProc : s.p[0];
              <article class="doc">
                <div class="doc-top">
                  <div class="avatar t{{ s.tint }}">{{ getInitials(s.n) }}</div>
                  <div class="min0">
                    <h3>{{ s.n }}</h3>
                    <p class="muted">{{ s.t }}</p>
                    <p class="muted sm">{{ h?.name }} · {{ h?.city }}</p>
                  </div>
                </div>
                <div class="row-between">
                  <span class="tag">{{ s.x }} years experience</span>
                  <b class="fee">Consultation {{ surgeryService.formatMoney(s.fee) }}</b>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:6px">
                  @for (i of s.p; track i) {
                    <span class="chip" style="min-height:32px;padding:0 12px;font-size:13px;cursor:default">{{ getProcName(i) }}</span>
                  }
                </div>
                <button class="btn btn-ink full" type="button" (click)="openBooking(s, pid)">Book consultation</button>
              </article>
            }
            @if (filteredSurgeons().length === 0) {
              <div class="empty" style="grid-column:1/-1">
                <h3 style="font-size:26px">No surgeons match yet</h3>
                <p class="muted">Try another city or area, or clear the filters.</p>
                <button class="btn btn-ink" type="button" (click)="clearFilters()">Clear filters</button>
              </div>
            }
          </div>

          <div style="margin-top:28px">
            <button class="btn btn-line" type="button" (click)="viewMode = 'surgery'">← Back to surgery planner</button>
          </div>
        </div>
      </section>
    }

    <!-- Consultation Modal (smodal) -->
    @if (modalOpen) {
      <div class="modal" id="smodal" (click)="onBackdrop($event)">
        <div class="panel" role="dialog" aria-modal="true" aria-labelledby="sTitle" tabindex="-1" id="spanel">
          @if (!modalDone) {
            <div id="sForm" style="display:flex;flex-direction:column;gap:18px">
              <div class="panel-head">
                <div class="avatar t{{ activeSurgeon?.tint }}" id="sAv">{{ getInitials(activeSurgeon?.n || '') }}</div>
                <div class="min0">
                  <h3 id="sTitle" style="font-size:24px">Consultation with {{ activeSurgeon?.n }}</h3>
                  <p class="muted sm" id="sSub">{{ activeSurgeon?.t }} · {{ getHospital(activeSurgeon?.h || '')?.name }} · {{ surgeryService.formatMoney(activeSurgeon?.fee || 0) }}</p>
                </div>
                <button class="icon-btn x" id="sClose" aria-label="Close" (click)="closeBooking()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18"></path>
                  </svg>
                </button>
              </div>
              <div>
                <label class="lbl" for="sProc">Procedure</label>
                <select class="inp" id="sProc" [(ngModel)]="modalProcId">
                  @for (pid of activeSurgeon?.p || []; track pid) {
                    <option [value]="pid">{{ getProcName(pid) }}</option>
                  }
                </select>
              </div>
              <div>
                <span class="lbl">Preferred day</span>
                <div class="chips" id="sDays">
                  @for (d of dayOffsets; track d.offset) {
                    <button class="chip" [class.on]="selectedOffset === d.offset" [attr.aria-pressed]="selectedOffset === d.offset" type="button" (click)="selectedOffset = d.offset">
                      {{ d.label }}
                    </button>
                  }
                </div>
              </div>
              <div>
                <span class="lbl">Preferred time</span>
                <div class="chips" id="sParts">
                  @for (p of timeParts; track p[0]) {
                    <button class="chip" [class.on]="selectedPart === p[0]" [attr.aria-pressed]="selectedPart === p[0]" type="button" (click)="selectedPart = p[0]">
                      {{ p[1] }}
                    </button>
                  }
                </div>
              </div>
              <div>
                <label class="lbl" for="sName">Patient name</label>
                <input class="inp" id="sName" type="text" [(ngModel)]="patientName" autocomplete="name" autocapitalize="words" enterkeyhint="next">
              </div>
              <div>
                <label class="lbl" for="sPhone">Mobile number</label>
                <input class="inp" id="sPhone" type="tel" inputmode="numeric" placeholder="03xx xxxxxxx" [(ngModel)]="patientPhone" autocomplete="tel" enterkeyhint="next">
              </div>
              <div>
                <label class="lbl" for="sNote">Anything the surgeon should know? (optional)</label>
                <textarea class="inp" id="sNote" style="min-height:80px" placeholder="e.g. pain for 6 months, previous surgery" [(ngModel)]="patientNote"></textarea>
              </div>
              <p class="err" id="sErr" role="alert" *ngIf="modalError">{{ modalError }}</p>
              <button class="btn btn-coral full" id="sGo" type="button" (click)="submitBooking()">Request consultation</button>
            </div>
          } @else {
            <div id="sDone" style="display:flex;flex-direction:column;gap:16px">
              <div style="display:flex;align-items:center;gap:12px">
                <span style="width:48px;height:48px;border-radius:50%;background:var(--mint);display:flex;align-items:center;justify-content:center;flex:none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#102A43" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5"></path>
                  </svg>
                </span>
                <h3 style="font-size:28px">Request sent</h3>
              </div>
              <p id="sMsg" style="font-size:18px">We have sent your consultation request to {{ activeSurgeon?.n }} at {{ getHospital(activeSurgeon?.h || '')?.name }}.</p>
              <div class="bk">
                <span class="muted xs">Request code</span>
                <code id="sCode">{{ lastCreatedRequest?.code }}</code>
                <p class="sm" id="sWhat">{{ lastCreatedRequest?.proc }} · {{ lastCreatedRequest?.doctor }} · {{ lastCreatedRequest?.when }}</p>
                <div class="track" aria-hidden="true"><i class="on"></i><i></i><i></i><i></i><i></i><i></i></div>
                <p class="xs muted">Stage 1 of 6 · After the consultation you receive a written quote.</p>
              </div>
              <p class="muted sm">Demo note: requests here are saved in this browser only.</p>
              <button class="btn btn-ink full" id="sCloseDone" type="button" (click)="closeBooking()">Done</button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .pg-surgery, .pg-surgeons { display: block !important; }
  `]
})
export class SurgeryComponent implements OnInit {
  surgeryService = inject(SurgeryService);
  hospitalsService = inject(HospitalsService);
  seo = inject(SeoService);

  viewMode: 'surgery' | 'surgeons' = 'surgery';

  selectedCat = 'general';
  selectedProcId = 8;
  comparedHosps: string[] = [];

  // Surgeons filters
  fQuery = '';
  fSpec = 'all';
  fCity = 'all';
  fProc: number | null = null;
  fSpecs = [
    ['all', 'All'],
    ['heart', 'Heart'],
    ['bones', 'Bones and joints'],
    ['general', 'General'],
    ['eye', 'Eyes'],
    ['women', 'Women’s health'],
    ['other', 'ENT, kidney, dental']
  ];
  fCities = ['all', 'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi'];

  // Modal state
  modalOpen = false;
  modalDone = false;
  modalError = '';
  activeSurgeon: Surgeon | null = null;
  modalProcId = 8;
  selectedOffset = 1;
  selectedPart = 'morning';
  patientName = '';
  patientPhone = '';
  patientNote = '';
  lastCreatedRequest: any = null;

  timeParts = [
    ['morning', 'Morning'],
    ['afternoon', 'Afternoon'],
    ['evening', 'Evening']
  ];

  dayOffsets: { offset: number; label: string }[] = [];

  ngOnInit(): void {
    this.seo.setPage('Surgery & Procedures');
    this.buildDays();
  }

  buildDays(): void {
    const arr: { offset: number; label: string }[] = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let o = 1; o <= 7; o++) {
      const d = new Date();
      d.setDate(d.getDate() + o);
      arr.push({ offset: o, label: `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}` });
    }
    this.dayOffsets = arr;
  }

  getProcsCount(cat: string): number {
    return this.surgeryService.procedures().filter(p => p.c === cat).length;
  }

  currentProcedures(): Procedure[] {
    return this.surgeryService.procedures().filter(p => p.c === this.selectedCat);
  }

  currentProc(): Procedure | undefined {
    return this.surgeryService.getProcedureById(this.selectedProcId);
  }

  currentHosps(): Hospital[] {
    return this.surgeryService.hospsFor(this.selectedProcId);
  }

  selectCategory(cat: string): void {
    this.selectedCat = cat;
    const procs = this.currentProcedures();
    if (procs.length > 0) {
      this.selectedProcId = procs[0].id;
    }
    this.comparedHosps = [];
  }

  selectProc(id: number): void {
    this.selectedProcId = id;
    this.comparedHosps = [];
  }

  toggleCompare(hospId: string): void {
    const idx = this.comparedHosps.indexOf(hospId);
    if (idx > -1) {
      this.comparedHosps.splice(idx, 1);
    } else {
      if (this.comparedHosps.length >= 2) {
        this.comparedHosps.shift();
      }
      this.comparedHosps.push(hospId);
    }
  }

  isComparing(hospId: string): boolean {
    return this.comparedHosps.includes(hospId);
  }

  getHospital(id: string): Hospital | undefined {
    return this.hospitalsService.getHospitalById(id);
  }

  getHospitalCol(h: Hospital, pr: Procedure) {
    const ss = this.surgeryService.surgsAt(h.id, pr.id);
    const r = this.surgeryService.hrange(pr, h.id);
    return {
      r: this.surgeryService.formatRange(r),
      s: ss.map(x => x.n).join(', '),
      x: Math.max(...ss.map(x => x.x), 0) + ' years',
      f: 'from ' + this.surgeryService.formatMoney(Math.min(...ss.map(x => x.fee), 0))
    };
  }

  requests() {
    return this.surgeryService.requests();
  }

  cancelRequest(code: string): void {
    this.surgeryService.cancelRequest(code);
  }

  browseSurgeonsForProc(procId: number): void {
    this.fProc = procId;
    this.viewMode = 'surgeons';
  }

  scrollToJourney(): void {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('sJourney');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  filteredSurgeons(): Surgeon[] {
    const q = this.fQuery.toLowerCase();
    return this.surgeryService.surgeons().filter(s => {
      const h = this.getHospital(s.h);
      if (this.fSpec !== 'all' && s.c !== this.fSpec) return false;
      if (this.fCity !== 'all' && h?.city !== this.fCity) return false;
      if (this.fProc && s.p.indexOf(this.fProc) < 0) return false;
      if (q) {
        const hay = (s.n + ' ' + s.t + ' ' + (h?.name || '') + ' ' + s.p.map(i => this.getProcName(i)).join(' ')).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  clearFilters(): void {
    this.fQuery = '';
    this.fSpec = 'all';
    this.fCity = 'all';
    this.fProc = null;
  }

  getProcName(id: number): string {
    return this.surgeryService.getProcedureById(id)?.n || '';
  }

  getInitials(name: string): string {
    return name.replace('Dr. ', '').split(' ').map(w => w[0]).slice(0, 2).join('');
  }

  openBooking(s: Surgeon, pid: number): void {
    this.activeSurgeon = s;
    this.modalProcId = pid;
    this.selectedOffset = 1;
    this.selectedPart = 'morning';
    this.patientName = '';
    this.patientPhone = '';
    this.patientNote = '';
    this.modalError = '';
    this.modalDone = false;
    this.modalOpen = true;
  }

  closeBooking(): void {
    this.modalOpen = false;
    this.activeSurgeon = null;
  }

  onBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal')) {
      this.closeBooking();
    }
  }

  submitBooking(): void {
    const name = this.patientName.trim();
    const ph = this.patientPhone.replace(/[^0-9]/g, '');
    if (name.length < 2) {
      this.modalError = 'Enter the patient’s name.';
      return;
    }
    if (ph.length < 10 || ph.length > 13) {
      this.modalError = 'Enter a mobile number with 10 to 13 digits.';
      return;
    }

    const s = this.activeSurgeon!;
    const h = this.getHospital(s.h);
    const pr = this.surgeryService.getProcedureById(Number(this.modalProcId))!;
    const dObj = this.dayOffsets.find(d => d.offset === this.selectedOffset);
    const when = `${dObj?.label || 'Tomorrow'}, ${this.selectedPart}`;

    const code = this.surgeryService.createRequest({
      doctor: s.n,
      hospital: h?.name || '',
      proc: pr?.n || '',
      when: when,
      name: name,
      phone: this.patientPhone.trim()
    });

    this.lastCreatedRequest = {
      code,
      doctor: s.n,
      proc: pr?.n,
      when
    };
    this.modalDone = true;
  }
}
