import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SurgeryService } from '../../shared/services/surgery.service';
import { HospitalsService } from '../../shared/services/hospitals.service';
import { SeoService } from '../../shared/services/seo.service';
import { Procedure, Surgeon, Hospital } from '../../shared/models';

@Component({
  selector: 'app-surgery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    @if (viewMode === 'procedures') {
      <section class="sec pg-scat">
        <div class="wrap catalog-page">
          <a class="pgback" routerLink="/surgery">Back to surgery</a>
          <div class="sec-head">
            <div><span class="eyebrow">PulseQ procedure catalog</span><h2>Find a procedure</h2></div>
            <p class="muted" style="max-width:380px">Browse estimated costs, hospital stays and recovery times. A hospital confirms the final quote after consultation.</p>
          </div>
          <div class="procedure-filters">
            <label class="sr" for="procedureSearch">Search procedures</label>
            <input id="procedureSearch" class="inp" type="search" [(ngModel)]="procedureQuery" (ngModelChange)="resetProcedurePage()" placeholder="Procedure, e.g. knee, cataract or hernia" autocomplete="off">
            <div class="chips" role="group" aria-label="Procedure category">
              <button class="chip" [class.on]="procedureCategory === 'all'" [attr.aria-pressed]="procedureCategory === 'all'" type="button" (click)="procedureCategory = 'all'; resetProcedurePage()">All areas</button>
              @for (cat of surgeryService.categories(); track cat.k) {
                <button class="chip" [class.on]="procedureCategory === cat.k" [attr.aria-pressed]="procedureCategory === cat.k" type="button" (click)="procedureCategory = cat.k; resetProcedurePage()">{{ cat.t }}</button>
              }
            </div>
          </div>
          @let procedures = filteredProcedures();
          <p class="muted" aria-live="polite">Showing {{ Math.min(procedureVisibleLimit, procedures.length) }} of {{ procedures.length }} procedures</p>
          <div class="procedure-grid" aria-live="polite">
            @for (pr of procedures.slice(0, procedureVisibleLimit); track pr.id) {
              <a class="procedure-card" [routerLink]="['/surgery/procedures', pr.id]">
                <span class="eyebrow">{{ procedureCategoryName(pr.c) }}</span>
                <h3>{{ pr.n }}</h3>
                <p class="muted">{{ pr.d }}</p>
                <div class="procedure-stats">
                  <span><small>Estimated price</small><b>{{ surgeryService.formatRange([pr.lo, pr.hi]) }}</b></span>
                  <span><small>Typical stay</small><b>{{ pr.stay }}</b></span>
                  <span><small>Recovery</small><b>{{ pr.rec }}</b></span>
                </div>
                <span class="procedure-more">View details <span aria-hidden="true">→</span></span>
              </a>
            }
            @if (procedures.length === 0) {
              <div class="empty" style="grid-column:1/-1"><h3>No procedures match</h3><p class="muted">Try another search or choose a different surgery area.</p></div>
            }
          </div>
          @if (procedures.length > procedureVisibleLimit) {
            <div class="load-more-wrap">
              <button class="load-more-btn" type="button" (click)="loadMoreProcedures()">Load more procedures <span>{{ procedures.length - procedureVisibleLimit }} remaining</span></button>
            </div>
          }
          <p class="muted xs catalog-disclaimer">Prices, stays and recovery times are sample estimates for this demo, not a medical quote or advice.</p>
        </div>
      </section>
    } @else if (viewMode === 'procedure-detail') {
      <section class="sec pg-scat">
        <div class="wrap catalog-page">
          <a class="pgback" routerLink="/surgery/procedures">‹ &nbsp; All procedures</a>
          @if (getRouteProcedure(); as pr) {
            <article class="procedure-detail">
              <h2>{{ pr.n }}</h2>
              <p class="muted">{{ pr.d }}</p>
              <div class="surgery-detail-stats">
                <span><small>Typical hospital stay</small><b>{{ pr.stay }}</b></span>
                <span><small>Typical recovery</small><b>{{ pr.rec }}</b></span>
                <span><small>Estimated cost</small><b>{{ surgeryService.formatRange([pr.lo, pr.hi]) }}</b></span>
              </div>
              <div class="procedure-detail-note">
                <b>Usually included in your quote</b>
                <ul class="sinc">@for (inc of surgeryService.inclusions; track inc) { <li>{{ inc }}</li> }</ul>
              </div>
              <div class="procedure-detail-actions">
                <button class="btn btn-line" type="button" (click)="browseSurgeonsForProc(pr.id)">See all surgeons for this</button>
              </div>
              <p class="muted xs catalog-disclaimer">Sample estimates for this demo. Your surgeon gives a written quote after the consultation, and it lists exactly what is included.</p>
            </article>

            <section class="procedure-hospitals" aria-labelledby="procedureHospitalsTitle">
              <span class="eyebrow">Step 2</span>
              <h3 id="procedureHospitalsTitle">Choose a hospital and surgeon</h3>
              <p class="muted sm" style="margin-bottom:14px">
                {{ currentHosps().length }} {{ currentHosps().length === 1 ? 'hospital offers ' : 'hospitals offer ' }}{{ pr.n.toLowerCase() }}. Tap Compare on two to see them side by side.
              </p>

              @if (availableSurgeryCities().length > 1) {
                <div class="chips" role="group" aria-label="Hospital city" style="margin-bottom:12px">
                  <button class="chip" [class.on]="selectedCity === 'all'" [attr.aria-pressed]="selectedCity === 'all'" type="button" (click)="selectedCity = 'all'">All cities</button>
                  @for (city of availableSurgeryCities(); track city) {
                    <button class="chip" [class.on]="selectedCity === city" [attr.aria-pressed]="selectedCity === city" type="button" (click)="selectedCity = city">{{ city }}</button>
                  }
                </div>
              }

              <div class="sgrid">
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
                      <button class="chip" [class.on]="on" [attr.aria-pressed]="on" type="button" (click)="toggleCompare(h.id)">
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
                @if (currentHosps().length === 0) {
                  <div class="empty" style="grid-column:1/-1">
                    <h3>No hospitals listed for this procedure yet</h3>
                    <p class="muted">Browse all surgeons to see available consultation options.</p>
                    <button class="btn btn-ink" type="button" (click)="browseSurgeonsForProc(pr.id)">See all surgeons</button>
                  </div>
                }
              </div>

              <div aria-live="polite">
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
            </section>
          } @else {
            <div class="empty"><h2>Procedure not found</h2><p class="muted">Choose a procedure from the catalog.</p></div>
          }
        </div>
      </section>
    } @else if (viewMode === 'surgery') {
      <section class="sec pg-surgery" id="page-surgery">
        <div class="wrap">
          <div class="mhero">
            <div style="flex:1 1 420px;min-width:0;display:flex;flex-direction:column;gap:16px">
              <span class="eyebrow">PulseQ surgery</span>
              <h2 style="font-size:clamp(27px,4.3vw,55px)">Surgery, planned properly.</h2>
              <p class="muted" style="font-size:18px;max-width:540px">See a price range first, compare hospitals, meet your surgeon in a consultation, then decide. Nothing is booked until you have a written quote.</p>
              <div class="surgery-entry-row">
                <a class="surgery-entry surgery-entry-primary" routerLink="/surgery/procedures">
                  <span class="surgery-entry-icon" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="3"/><path d="M9 4V3h6v1M8 14h2l1.5-3 2 6 1.5-3H16"/></svg>
                  </span>
                  <span><b>Procedure catalog</b><small>{{ surgeryService.procedures().length }} procedures · price, stay and recovery</small></span>
                  <span class="surgery-entry-go" aria-hidden="true">→</span>
                </a>
                <a class="surgery-entry" routerLink="/surgery/surgeons">
                  <span class="surgery-entry-icon" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="8" r="3.5"/><path d="M3.5 20c.6-3.6 3-5.5 6.5-5.5M17 14v6m-3-3h6"/></svg>
                  </span>
                  <span><b>Our surgeons</b><small>Experience, hospitals and consultation fees</small></span>
                  <span class="surgery-entry-go" aria-hidden="true">→</span>
                </a>
              </div>
              <button class="btn btn-line" type="button" (click)="scrollToJourney()">See how it works</button>
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

          <div class="symbox" style="margin:18px 0 10px">
            <div class="field wide">
              <label for="sPq">Find a procedure</label>
              <input id="sPq" type="search" [(ngModel)]="procedureQuery" placeholder="e.g. knee, cataract, hernia" autocomplete="off">
            </div>
          </div>
          <div class="proclist" id="sProcs" role="list" aria-label="Procedures">
            @for (pr of filteredPlannerProcedures(); track pr.id) {
              <button class="prow" [class.on]="selectedProcId === pr.id" [attr.aria-pressed]="selectedProcId === pr.id" type="button" (click)="selectProc(pr.id)">
                <span class="pr-t"><b>{{ pr.n }}</b><small>{{ pr.d }}</small></span>
                <span class="pr-p">{{ surgeryService.formatRange([pr.lo, pr.hi]) }}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>
              </button>
            }
            @if (filteredPlannerProcedures().length === 0) {
              <p class="muted sm" style="padding:14px">No procedure matches. Try another word.</p>
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

            @if (availableSurgeryCities().length > 1) {
              <div class="chips" id="sCity" role="group" aria-label="Hospital city" style="margin-bottom:12px">
                <button class="chip" [class.on]="selectedCity === 'all'" [attr.aria-pressed]="selectedCity === 'all'" type="button" (click)="selectedCity = 'all'">All cities</button>
                @for (city of availableSurgeryCities(); track city) {
                  <button class="chip" [class.on]="selectedCity === city" [attr.aria-pressed]="selectedCity === city" type="button" (click)="selectedCity = city">{{ city }}</button>
                }
              </div>
            }

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
              <input id="fq" type="search" enterkeyhint="search" [(ngModel)]="fQuery" (ngModelChange)="resetSurgeonPage()" placeholder="Name, hospital or procedure, e.g. knee replacement" autocomplete="off">
            </div>
          </div>

          <div class="chips" id="fSpec" role="group" aria-label="Surgery area" style="margin-bottom:10px">
            @for (sp of fSpecs; track sp[0]) {
              <button class="chip" [class.on]="fSpec === sp[0]" [attr.aria-pressed]="fSpec === sp[0]" type="button" (click)="fSpec = sp[0]; resetSurgeonPage()">
                {{ sp[1] }}
              </button>
            }
          </div>

          <div class="chips" id="fCity" role="group" aria-label="City" style="margin-bottom:12px">
            @for (c of fCities; track c) {
              <button class="chip" [class.on]="fCity === c" [attr.aria-pressed]="fCity === c" type="button" (click)="fCity = c; resetSurgeonPage()">
                {{ c === 'all' ? 'All cities' : c }}
              </button>
            }
          </div>

          @let surgeons = filteredSurgeons();
          <div class="filterbar" id="fNote" aria-live="polite">
            @if (surgeons.length > surgeonVisibleLimit) {
              <b>Showing {{ surgeonVisibleLimit }} of {{ surgeons.length }} surgeons</b>
            } @else {
              <b>{{ surgeons.length }} {{ surgeons.length === 1 ? 'surgeon' : 'surgeons' }}</b>
            }
            @if (fProc) {
              <span class="muted">· for {{ getProcName(fProc) }}</span>
            }
            @if (fProc || fSpec !== 'all' || fCity !== 'all' || fQuery) {
              <button class="chip" type="button" (click)="clearFilters()">Clear filters</button>
            }
          </div>

          <div class="sgrid" id="fGrid">
            @for (s of surgeons.slice(0, surgeonVisibleLimit); track s.id) {
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
            @if (surgeons.length === 0) {
              <div class="empty" style="grid-column:1/-1">
                <h3 style="font-size:26px">No surgeons match yet</h3>
                <p class="muted">Try another city or area, or clear the filters.</p>
                <button class="btn btn-ink" type="button" (click)="clearFilters()">Clear filters</button>
              </div>
            }
          </div>
          @if (surgeons.length > surgeonVisibleLimit) {
            <div class="load-more-wrap">
              <button class="load-more-btn" type="button" (click)="loadMoreSurgeons()">Load more surgeons <span>{{ surgeons.length - surgeonVisibleLimit }} remaining</span></button>
            </div>
          }

          <div style="margin-top:28px">
            <a class="btn btn-line" routerLink="/surgery">← Back to surgery planner</a>
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
    .catalog-page { max-width: 1080px; }
    .procedure-filters { display: grid; gap: 14px; margin: 20px 0; }
    .procedure-filters > .inp { width: min(100%, 620px); }
    .procedure-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 310px), 1fr)); gap: 14px; }
    .proclist { display: grid; gap: 10px; }
    .prow {
      width: 100%;
      border: 0;
      font: inherit;
      text-align: left;
      cursor: pointer;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      gap: 6px 16px;
      align-items: center;
      padding: 14px 18px;
      border-radius: 18px;
      background: #fff;
      box-shadow: inset 0 0 0 1.5px #D6E6FB;
      color: var(--fg);
      text-decoration: none;
    }
    .prow:hover { box-shadow: inset 0 0 0 2px #2381FF; }
    .prow.on { box-shadow: inset 0 0 0 2px #2381FF; background: #F7FAFF; }
    .prow:focus-visible { outline: 3px solid #2381FF; outline-offset: 2px; }
    .pr-t { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .pr-t small {
      display: -webkit-box;
      overflow: hidden;
      color: var(--muted);
      font-size: 14px;
      font-weight: 400;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
    }
    .pr-p { color: #1558B8; font-size: 14px; font-weight: 700; white-space: nowrap; }
    .prow > svg { color: #2381FF; }
    .procedure-card { display: flex; flex-direction: column; gap: 10px; padding: 20px; border-radius: 20px; background: #fff; box-shadow: inset 0 0 0 1px #DCE8F8; color: var(--fg); text-decoration: none; }
    .procedure-card:hover { box-shadow: inset 0 0 0 2px #2381FF; }
    .procedure-card h3 { font-size: 22px; }
    .procedure-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-top: 12px; }
    .procedure-stats span { display: flex; flex-direction: column; gap: 4px; }
    .procedure-stats small { color: var(--muted); }
    .procedure-stats b { font-size: 14px; }
    .procedure-more { display: flex; justify-content: space-between; margin-top: auto; padding-top: 8px; color: #1558B8; font-weight: 800; }
    .procedure-detail { padding: clamp(20px, 4vw, 36px); border-radius: 24px; background: #fff; box-shadow: inset 0 0 0 1px #DCE8F8; }
    .procedure-detail h2 { margin: 10px 0; font-size: clamp(28px, 4vw, 44px); }
    .procedure-detail > .muted { margin: 0; font-size: 15px; }
    .surgery-detail-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
    .surgery-detail-stats span { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .surgery-detail-stats small { color: var(--muted); }
    .surgery-detail-stats b { font-size: 14px; }
    .procedure-detail-note { margin-top: 20px; padding: 16px; border-radius: 18px; background: #F5F9FF; }
    .procedure-detail-note .sinc { margin-top: 4px; }
    .procedure-detail-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
    .procedure-hospitals { margin-top: 32px; }
    .procedure-hospitals > h3 { margin: 6px 0; font-size: clamp(23px, 3vw, 28px); }
    .catalog-disclaimer { margin-top: 18px; max-width: 700px; }
    .surgery-entry-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 12px; max-width: 640px; }
    .surgery-entry { display: flex; align-items: center; gap: 14px; min-height: 78px; padding: 14px 16px; border-radius: 20px; background: #fff; box-shadow: inset 0 0 0 1.5px #DCE8F8, 0 1px 2px rgba(16,42,67,.04); color: #102A43; text-decoration: none; transition: transform .18s, box-shadow .18s; }
    .surgery-entry:hover { transform: translateY(-2px); box-shadow: inset 0 0 0 1.5px #2381FF, 0 14px 30px -16px rgba(35,129,255,.6); }
    .surgery-entry-primary { color: #fff; background: linear-gradient(135deg,#2381FF,#1558B8); }
    .surgery-entry-icon { display: grid; place-items: center; flex: none; width: 46px; height: 46px; border-radius: 14px; color: #1558B8; background: #EAF3FF; font-weight: 800; font-size: 22px; }
    .surgery-entry-primary .surgery-entry-icon, .surgery-entry-primary .surgery-entry-go { color: #fff; background: rgba(255,255,255,.18); }
    .surgery-entry b, .surgery-entry small { display: block; }
    .surgery-entry small { margin-top: 3px; color: #526477; font-size: 13px; }
    .surgery-entry-primary small { color: rgba(255,255,255,.88); }
    .surgery-entry-go { display: grid; place-items: center; flex: none; width: 32px; height: 32px; border-radius: 50%; color: #1558B8; background: #EAF3FF; }
    @media (max-width: 760px) {
      .surgery-detail-stats { grid-template-columns: 1fr; gap: 8px; }
      .prow { grid-template-columns: minmax(0, 1fr) auto; gap: 6px 12px; }
      .pr-p { white-space: normal; }
      .prow > svg { grid-column: 2; grid-row: 1 / 3; }
    }
    @media (prefers-reduced-motion: reduce) { .surgery-entry { transition: none; } }
  `]
})
export class SurgeryComponent implements OnInit {
  Math = Math;
  surgeryService = inject(SurgeryService);
  hospitalsService = inject(HospitalsService);
  seo = inject(SeoService);
  router = inject(Router);

  viewMode: 'surgery' | 'surgeons' | 'procedures' | 'procedure-detail' = 'surgery';
  procedureQuery = '';
  procedureCategory = 'all';
  procedureVisibleLimit = 12;
  routeProcedureId: number | null = null;
  selectedCity = 'all';

  selectedCat = 'general';
  selectedProcId: number | null = null;
  comparedHosps: string[] = [];

  // Surgeons filters
  fQuery = '';
  fSpec = 'all';
  fCity = 'all';
  fHosp = 'all';
  fProc: number | null = null;
  surgeonVisibleLimit = 10;
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
    const [path, query = ''] = this.router.url.split('?');
    if (path === '/surgery/procedures') {
      this.viewMode = 'procedures';
      this.seo.setPage('Procedure Catalog');
    } else if (path.startsWith('/surgery/procedures/')) {
      this.viewMode = 'procedure-detail';
      this.routeProcedureId = Number(path.split('/').pop());
      const procedure = this.surgeryService.getProcedureById(this.routeProcedureId);
      if (procedure) {
        this.selectedProcId = procedure.id;
        this.selectedCat = procedure.c;
      }
      this.selectedCity = 'all';
      this.comparedHosps = [];
      this.seo.setPage('Procedure Details');
    } else if (path === '/surgery/surgeons') {
      this.viewMode = 'surgeons';
      const params = new URLSearchParams(query);
      this.fProc = Number(params.get('procedure')) || null;
      this.fHosp = params.get('hospital') || 'all';
      this.seo.setPage('Surgeons');
    } else {
      this.seo.setPage('Surgery & Procedures');
    }
    this.buildDays();
  }

  resetProcedurePage(): void {
    this.procedureVisibleLimit = 12;
  }

  loadMoreProcedures(): void {
    this.procedureVisibleLimit += 12;
  }

  resetSurgeonPage(): void {
    this.surgeonVisibleLimit = 10;
  }

  loadMoreSurgeons(): void {
    this.surgeonVisibleLimit += 10;
  }

  filteredProcedures(): Procedure[] {
    const q = this.procedureQuery.trim().toLowerCase();
    return this.surgeryService.procedures().filter(pr =>
      (this.procedureCategory === 'all' || pr.c === this.procedureCategory) &&
      (!q || `${pr.n} ${pr.d} ${this.procedureCategoryName(pr.c)}`.toLowerCase().includes(q))
    );
  }

  getRouteProcedure(): Procedure | undefined {
    return this.routeProcedureId ? this.surgeryService.getProcedureById(this.routeProcedureId) : undefined;
  }

  procedureCategoryName(key: string): string {
    return this.surgeryService.categories().find(category => category.k === key)?.t || 'Procedure';
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

  filteredPlannerProcedures(): Procedure[] {
    const q = this.procedureQuery.trim().toLowerCase();
    return this.surgeryService.procedures().filter(p =>
      q
        ? `${p.n} ${p.d} ${this.procedureCategoryName(p.c)}`.toLowerCase().includes(q)
        : p.c === this.selectedCat
    );
  }

  currentProc(): Procedure | undefined {
    return this.selectedProcId === null
      ? undefined
      : this.surgeryService.getProcedureById(this.selectedProcId);
  }

  currentHosps(): Hospital[] {
    return this.allCurrentHosps().filter(h => this.selectedCity === 'all' || h.city === this.selectedCity);
  }

  private allCurrentHosps(): Hospital[] {
    const pr = this.currentProc();
    if (!pr || this.selectedProcId === null) return [];
    return this.surgeryService.hospsFor(this.selectedProcId).sort((a, b) =>
      this.surgeryService.hrange(pr, a.id)[0] - this.surgeryService.hrange(pr, b.id)[0]
    );
  }

  availableSurgeryCities(): string[] {
    return [...new Set(this.allCurrentHosps().map(h => h.city))];
  }

  selectCategory(cat: string): void {
    this.selectedCat = cat;
    this.procedureQuery = '';
    this.selectedCity = 'all';
    this.selectedProcId = null;
    this.comparedHosps = [];
  }

  selectProc(id: number): void {
    this.selectedProcId = id;
    this.selectedCat = this.currentProc()?.c || this.selectedCat;
    this.selectedCity = 'all';
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
    f: 'from ' + this.surgeryService.formatMoney(ss.length ? Math.min(...ss.map(x => x.fee)) : 0)
    };
  }

  requests() {
    return this.surgeryService.requests();
  }

  cancelRequest(code: string): void {
    this.surgeryService.cancelRequest(code);
  }

  browseSurgeonsForProc(procId: number): void {
    this.router.navigate(['/surgery/surgeons'], { queryParams: { procedure: procId } });
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
      if (this.fHosp !== 'all' && s.h !== this.fHosp) return false;
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
    this.fHosp = 'all';
    this.fProc = null;
    this.resetSurgeonPage();
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
