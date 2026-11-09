import { Component, inject, signal, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DoctorsService } from '../../shared/services/doctors.service';
import { HospitalsService } from '../../shared/services/hospitals.service';
import { BookingsService } from '../../shared/services/bookings.service';
import { ModalService } from '../../shared/services/modal.service';
import { PulseAiService } from '../../shared/services/pulse-ai.service';
import { ToastService } from '../../shared/services/toast.service';
import { SeoService } from '../../shared/services/seo.service';
import { DoctorCardComponent } from '../../shared/components/doctor-card/doctor-card.component';
import { ClinicDashboardComponent } from '../../shared/components/clinic-dashboard/clinic-dashboard.component';
import { SPEC, SPEC_PLURAL, CITIES } from '../../data/specialties.data';
import { SHOPS } from '../../data/pharmacies.data';
import { SITE } from '../../data/site.data';
import { BM_AREAS, BM_CHILD } from '../../data/body-map.data';
import { Doctor, Hospital, Slot } from '../../shared/models';
import { init3DBody, Body3DController } from '../../shared/utils/body-map-3d';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    FormsModule,
    RouterLink,
    DoctorCardComponent,
    ClinicDashboardComponent
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

    <!-- CONDITIONS & SYMPTOMS SECTION -->
    <section class="sec tint home" id="conditions" style="padding-top:64px">
      <div class="wrap">
        <div class="sec-head">
          <div style="display:flex;flex-direction:column;gap:14px">
            <span class="eyebrow">Search by condition <span class="ur" lang="ur">· علامات سے ڈھونڈیں</span></span>
            <h2>Not sure who to see? Start with <span class="mk">how you feel.</span></h2>
          </div>
          <p class="muted" style="max-width:380px">Pick a concern and we show the right specialists. Or describe it to Pulse and it will point you to the right one.</p>
        </div>
        <div class="symbox">
          <div class="field wide">
            <label for="sym">Search by symptoms</label>
            <input id="sym" type="text" placeholder="e.g. headache and blurry vision, skin rash, back pain" [(ngModel)]="symptomQuery" (keydown.enter)="searchSymptoms()" autocomplete="off">
          </div>
          <button class="btn btn-ink" id="symBtn" style="flex:1 1 220px;min-height:62px" (click)="searchSymptoms()">Find the right specialist</button>
        </div>
        <p class="muted sm" id="symNote" aria-live="polite" style="min-height:22px;margin-bottom:20px">{{ symptomNote }}</p>

        <!-- 8 EXACT CONDITION TILES WITH ORIGINAL SVGS -->
        <div class="cond-grid">
          <button class="cond" (click)="filterBySpecialty('heart')">
            <span class="ic t2"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"></path></svg></span>
            <span><b>Heart and blood pressure</b><small>Chest pain, palpitations</small></span>
          </button>
          <button class="cond" (click)="filterBySpecialty('skin')">
            <span class="ic t3"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.2 12 3 12 3z"></path></svg></span>
            <span><b>Skin and hair</b><small>Acne, rash, hair fall</small></span>
          </button>
          <button class="cond" (click)="filterBySpecialty('bones')">
            <span class="ic t4"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 15l6-6"></path><circle cx="6.5" cy="17.5" r="2.5"></circle><circle cx="17.5" cy="6.5" r="2.5"></circle></svg></span>
            <span><b>Bones and joints</b><small>Back pain, knee pain</small></span>
          </button>
          <button class="cond" (click)="filterBySpecialty('child')">
            <span class="ic t1"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M9 10h.01M15 10h.01M8.5 14a4.5 4.5 0 0 0 7 0"></path></svg></span>
            <span><b>Children</b><small>Fever, growth, vaccines</small></span>
          </button>
          <button class="cond" (click)="filterBySpecialty('eye')">
            <span class="ic t5"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle></svg></span>
            <span><b>Eyes</b><small>Blurry vision, eye pain</small></span>
          </button>
          <button class="cond" (click)="filterBySpecialty('neuro')">
            <span class="ic t2"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z"></path></svg></span>
            <span><b>Head and nerves</b><small>Migraine, numbness</small></span>
          </button>
          <button class="cond" (click)="filterBySpecialty('general')">
            <span class="ic t3"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9h11a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3M3 19h7"></path></svg></span>
            <span><b>Fever, cough and flu</b><small>General physician</small></span>
          </button>
          <button class="cond" (click)="filterBySpecialty('dental')">
            <span class="ic t4"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 4C5 4 4 6 4 8c0 3 1.5 4 2 8 .3 2 1.2 4 2.5 4s1.5-2.5 2-4c.5 1.5.7 4 2 4s2.2-2 2.5-4c.5-4 2-5 2-8 0-2-1-4-3.5-4-1.8 0-2.4 1-4.5 1-1.5 0-2-1-3-1z"></path></svg></span>
            <span><b>Teeth and gums</b><small>Toothache, braces</small></span>
          </button>
        </div>
      </div>
    </section>

    <!-- DOCTORS SECTION -->
    <section class="sec home" id="doctors">
      <div class="wrap">
        <div class="sec-head">
          <div style="display:flex;flex-direction:column;gap:14px">
            <span class="eyebrow">Doctors <span class="ur" lang="ur">· ڈاکٹر</span></span>
            <h2>Free slots, <span class="mk">right now.</span></h2>
            <p class="hand hnote" aria-hidden="true">
              slots are live, no phone calls needed
              <svg width="34" height="26" viewBox="0 0 34 26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4c10-3 22 2 26 16M28 20l-8-2M28 20l1-8"/></svg>
            </p>
          </div>
          <div class="chips" role="group" aria-label="Filter by specialty">
            <button class="chip" [class.on]="docFilterSpec === 'all'" (click)="docFilterSpec = 'all'">All</button>
            <button *ngFor="let k of docSpecKeys" class="chip" [class.on]="docFilterSpec === k" (click)="docFilterSpec = k">{{ specMap[k] }}</button>
          </div>
        </div>
        <div class="filterbar" aria-live="polite">
          <span class="muted sm">Showing {{ filteredDoctors().length }} doctors with free slots</span>
        </div>
        <div class="doc-grid">
          <app-doctor-card *ngFor="let d of visibleDoctors()" [doctor]="d"></app-doctor-card>
        </div>
        <div *ngIf="filteredDoctors().length > docLimit" style="display:flex;justify-content:center;margin-top:28px">
          <button class="btn btn-ink" (click)="docLimit = docLimit + 6">Show more doctors</button>
        </div>

        <!-- My Bookings List (if any) -->
        <div *ngIf="myBookings().length > 0" style="margin-top:56px">
          <div class="sec-head" style="margin-bottom:20px">
            <h2 style="font-size:clamp(26px,3.0vw,30px)">Your appointments</h2>
          </div>
          <div class="mine">
            <div *ngFor="let b of myBookings()" class="bk">
              <code>{{ b.code }}</code>
              <b>{{ b.doctor }}</b>
              <span class="muted sm">{{ b.hospital }} · {{ b.when }}</span>
              <button class="btn btn-line sm" style="align-self:flex-start;min-height:36px;margin-top:8px" (click)="cancelMyBooking(b.code)">Cancel booking</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PULSE AI SECTION -->
    <section class="sec dk home" id="ai">
      <div class="wrap dk-two">
        <div style="flex:1 1 400px;min-width:0;display:flex;flex-direction:column;gap:24px">
          <span class="eyebrow">
            PulseQ AI assistant 
            <button type="button" class="ur" lang="ur" (click)="setUrduAiBlock()" style="background:none;border:0;color:var(--mint);font-size:inherit;font-family:inherit;font-weight:700;cursor:pointer;text-decoration:underline;text-underline-offset:4px">· اردو میں لکھ کر بک کریں</button>
          </span>
          <h2 style="font-size:clamp(29px,4.3vw,55px);color:#fff">Ask PulseQ. PulseQ books it.</h2>
          <p class="muted" style="font-size:19px;max-width:480px">Type in your own words. PulseQ finds a doctor, checks real free slots and holds your visit in one conversation.</p>
          <div style="display:flex;flex-direction:column;gap:14px;max-width:480px">
            <div style="display:flex;gap:14px;cursor:pointer" (click)="setUrduAiBlock()"><i class="dot" style="margin-top:8px;background:var(--mint)"></i><p><b style="color:#fff">Urdu or English text.</b> <span class="muted">Type in Urdu, English or a mix of both. <span style="color:var(--mint);font-weight:600">(اردو میں کھولیں)</span></span></p></div>
            <div style="display:flex;gap:14px"><i class="dot" style="margin-top:8px;background:var(--mint)"></i><p><b style="color:#fff">Suggests, never diagnoses.</b> <span class="muted">PulseQ points you to the right kind of specialist. The doctor does the rest.</span></p></div>
            <div style="display:flex;gap:14px"><i class="dot" style="margin-top:8px;background:var(--mint)"></i><p><b style="color:#fff">You stay in control.</b> <span class="muted">Nothing is booked until you confirm.</span></p></div>
          </div>
          <p class="muted sm" style="max-width:480px">For a severe emergency, call <a href="tel:1122" style="color:var(--mint);font-weight:700;text-decoration:underline">1122</a> immediately instead of using the app.</p>
        </div>

        <div style="flex:1 1 460px;min-width:0">
          <div class="chat" id="homeAiBlock" style="border-radius:28px;padding:20px;box-shadow:0 0 0 1px var(--dk-line), 0 24px 60px -20px rgba(7,24,42,.65)">
            <div class="chat-head" style="padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08)">
              <span style="width:38px;height:38px;border-radius:12px;background:var(--dk-bg);display:flex;align-items:center;justify-content:center;flex:none">
                <svg width="22" height="22" viewBox="0 0 36 36" aria-hidden="true"><path d="M5 19h7l3-8 5 15 3-7h8" fill="none" stroke="#5FA3FF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>
              </span>
              <div class="grow">
                <span class="eyebrow" style="color:var(--mint);font-size:11px;letter-spacing:.12em;display:block">PULSEQ AI</span>
                <p class="xs muted" style="margin:0">Answers, support and booking</p>
              </div>
              <label class="sr" for="homeAiLang">Language</label>
              <select class="lang" id="homeAiLang" [(ngModel)]="aiLang" (change)="onAiLangChange()">
                <option value="en-US">English</option>
                <option value="ur-PK">اردو</option>
              </select>
            </div>

            <div class="log" role="log" aria-live="polite" style="max-height:430px;padding:10px 2px">
              @for (m of inlineAiMessages; track $index) {
                <div class="bub {{ m.from === 'bot' ? 'bot' : 'me' }}" [attr.dir]="isUrduText(m.text) ? 'rtl' : 'ltr'">
                  @if (m.from === 'bot') {
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                      <svg width="18" height="18" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3"><use href="#robotIcon"/></svg>
                      <span class="xs" style="color:var(--mint);font-weight:700">PulseQ</span>
                    </div>
                  }
                  @if (m.isHtml) {
                    <div [innerHTML]="m.text"></div>
                  } @else {
                    <div>{{ m.text }}</div>
                  }

                  @if (m.doctorOptions && m.doctorOptions.length > 0) {
                    <div class="ai-opts" style="display:flex;flex-direction:column;gap:10px;margin-top:12px" dir="ltr">
                      @for (opt of m.doctorOptions; track opt.doctor.id + opt.slot.t) {
                        <div class="opt" style="background:#fff;color:#102A43;border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,0.18)">
                          <div style="display:flex;align-items:center;gap:12px">
                            <div class="avatar t{{ opt.doctor.t }}" style="width:44px;height:44px;border-radius:14px;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;background:#EFF6FF;color:#1558B8">
                              {{ getInitials(opt.doctor.name) }}
                            </div>
                            <div class="min0" style="flex:1">
                              <b style="font-size:16px;color:#102A43;display:block">{{ opt.doctor.name }}</b>
                              <p class="muted sm" style="font-size:13px;color:#526477;margin:0">{{ getHospitalName(opt.doctor.h) }} · {{ getHospitalCity(opt.doctor.h) }}</p>
                            </div>
                          </div>
                          <div style="display:flex;flex-wrap:wrap;gap:8px">
                            <span class="tag" style="background:#DBEAFE;color:#1558B8;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600">
                              {{ doctorsService.dayLabel(opt.slot.o) }}
                            </span>
                            <span class="tag" style="background:#DBEAFE;color:#1558B8;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600">
                              {{ doctorsService.formatTime(opt.slot.t) }}
                            </span>
                            <span class="tag" style="background:#DCFCE7;color:#166534;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600">
                              Rs {{ opt.doctor.fee.toLocaleString('en-US') }}
                            </span>
                          </div>
                          <button
                            type="button"
                            class="btn btn-ink"
                            style="width:100%;padding:10px;border-radius:12px;font-weight:600;font-size:14px;cursor:pointer"
                            (click)="bookAiDoctor(opt.doctor.id, opt.slot.o, opt.slot.t)">
                            {{ aiLang === 'ur-PK' ? 'وقت بک کریں (Book this slot)' : 'Book this slot' }}
                          </button>
                        </div>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Suggestion Chips (Photo 4) -->
              @if (inlineAiMessages.length <= 2) {
                <div class="sugs" [attr.dir]="aiLang === 'ur-PK' ? 'rtl' : 'ltr'" style="margin-top:10px;gap:8px">
                  @for (s of currentAiSuggestions(); track s) {
                    <button class="sug" type="button" (click)="pickAiSuggestion(s)">{{ s }}</button>
                  }
                </div>
              }
            </div>

            <!-- Urdu Writing Assistance Options -->
            @if (aiLang === 'ur-PK') {
              <div class="urdu-quick-wrap" dir="rtl">
                <div style="display:flex;align-items:center;justify-content:space-between;width:100%;margin-bottom:4px">
                  <span class="xs muted" style="color:var(--mint);font-weight:600">اردو میں فوری انتخاب:</span>
                  <button type="button" class="urdu-kb-toggle-btn" [class.active]="showInlineUrduKeyboard" (click)="showInlineUrduKeyboard = !showInlineUrduKeyboard">
                    ⌨️ {{ showInlineUrduKeyboard ? 'کی بورڈ چھپائیں' : 'آن اسکرین کی بورڈ' }}
                  </button>
                </div>
                @for (phrase of urduQuickPhrases; track phrase) {
                  <button type="button" class="urdu-chip" (click)="insertInlineUrdu(phrase)">{{ phrase }}</button>
                }
              </div>

              @if (showInlineUrduKeyboard) {
                <div class="urdu-keyboard" dir="rtl">
                  <div class="urdu-row">
                    @for (char of urduKeysRow1; track char) {
                      <button type="button" class="urdu-key" (click)="addInlineUrduChar(char)">{{ char }}</button>
                    }
                  </div>
                  <div class="urdu-row">
                    @for (char of urduKeysRow2; track char) {
                      <button type="button" class="urdu-key" (click)="addInlineUrduChar(char)">{{ char }}</button>
                    }
                  </div>
                  <div class="urdu-row">
                    @for (char of urduKeysRow3; track char) {
                      <button type="button" class="urdu-key" (click)="addInlineUrduChar(char)">{{ char }}</button>
                    }
                  </div>
                  <div class="urdu-row">
                    @for (char of urduKeysRow4; track char) {
                      <button type="button" class="urdu-key" (click)="addInlineUrduChar(char)">{{ char }}</button>
                    }
                    <button type="button" class="urdu-key urdu-key-fn" (click)="clearInlineUrdu()">صاف</button>
                    <button type="button" class="urdu-key urdu-key-space" (click)="addInlineUrduChar(' ')">اسپیس (Space)</button>
                    <button type="button" class="urdu-key urdu-key-fn" (click)="backspaceInlineUrdu()">⌫ مٹائیں</button>
                  </div>
                </div>
              }
            }

            <p class="xs muted" style="text-align:center;margin-top:2px">
              {{ aiLang === 'ur-PK' ? 'اپنا سوال یا علامت نیچے لکھیں' : 'Type your question or symptom below' }}
            </p>
            <div class="composer">
              <label class="sr" for="homeAiMsg">Message PulseQ</label>
              @if (aiLang === 'ur-PK') {
                <button type="button" class="urdu-kb-toggle-btn" [class.active]="showInlineUrduKeyboard" (click)="showInlineUrduKeyboard = !showInlineUrduKeyboard" title="آن اسکرین اردو کی بورڈ">
                  ⌨️ اردو
                </button>
              }
              <input
                id="homeAiMsg"
                type="text"
                [attr.dir]="aiLang === 'ur-PK' ? 'rtl' : 'ltr'"
                [placeholder]="aiLang === 'ur-PK' ? 'اپنی بات یا علامت یہاں لکھیں…' : 'Tell PulseQ what you need...'"
                [(ngModel)]="aiInput"
                (keydown.enter)="sendInlineAi()"
                autocomplete="off">
              <button class="send" aria-label="Send message" (click)="sendInlineAi()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12l16-8-6 16-3-7z"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- HOSPITALS SECTION -->
    <section class="sec tint home" id="hospitals">
      <div class="wrap">
        <div class="sec-head">
          <div style="display:flex;flex-direction:column;gap:14px">
            <span class="eyebrow">Hospitals and clinics <span class="ur" lang="ur">· ہسپتال اور کلینک</span></span>
            <h2>Book the hospital, not just the doctor.</h2>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;align-items:flex-start">
            <div class="chips" role="group" aria-label="Show hospitals by city">
              <button class="chip" [class.on]="hospCity === 'all'" (click)="hospCity = 'all'">All cities</button>
              <button *ngFor="let c of cities" class="chip" [class.on]="hospCity === c" (click)="hospCity = c">{{ c }}</button>
            </div>
            <p class="muted sm" aria-live="polite">{{ filteredHospitals().length }} hospitals and clinics in {{ hospCity === 'all' ? 'Pakistan' : hospCity }}</p>
          </div>
        </div>
        <div class="hosp-grid">
          <article *ngFor="let h of filteredHospitals()" class="hosp">
            <div class="hosp-top t{{ h.t }}">{{ h.name[0] }}</div>
            <div class="hosp-body">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
                <div>
                  <h3><a class="dlink" [routerLink]="['/hospital', h.id]">{{ h.name }}</a></h3>
                  <p class="muted sm">{{ h.city }}</p>
                </div>
                <span *ngIf="h.badge" class="tag">{{ h.badge }}</span>
              </div>
              <p class="muted sm" style="margin-top:6px">{{ h.depts }}</p>
              <div style="margin-top:auto;padding-top:14px">
                <a class="btn btn-line full" [routerLink]="['/hospital', h.id]">View doctors</a>
              </div>
            </div>
          </article>
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
          <div class="step"><span class="n">1</span><h3 style="font-size:26px">Search or ask PulseQ</h3><p class="muted">Type a doctor, a hospital or a symptom, or chat with PulseQ in Urdu or English.</p></div>
          <div class="step"><span class="n">2</span><h3 style="font-size:26px">Pick a time that’s free</h3><p class="muted">Every slot you see is live. Confirm and the doctor’s diary closes it instantly.</p></div>
          <div class="step"><span class="n">3</span><h3 style="font-size:26px">Show your code, walk in</h3><p class="muted">Your booking code arrives right away. Show it at the desk and skip the queue.</p></div>
        </div>
      </div>
    </section>

    <!-- CLINIC DASHBOARD SECTION -->
    <section class="sec dk home" id="clinics">
      <div class="wrap">
        <div style="display:flex;flex-wrap:wrap;gap:24px 56px;align-items:flex-end;justify-content:space-between;margin-bottom:44px">
          <div style="display:flex;flex-direction:column;gap:18px;max-width:640px">
            <span class="eyebrow">For hospitals and clinics <span class="ur" lang="ur">· کلینک کے لیے</span></span>
            <h2 style="font-size:clamp(29px,4.3vw,55px);color:var(--mint)">Fill the empty hours.</h2>
            <p class="muted" style="font-size:19px">List your hospital or clinic on PulseQ. Patients book your free slots, and your whole day sits on one dashboard.</p>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
            <a class="btn btn-mint" routerLink="/contact">List your clinic</a>
            <a routerLink="/contact" style="color:#fff;font-weight:700;text-decoration:none;padding:12px 8px">or talk to our team</a>
          </div>
        </div>
        <p class="muted" style="margin-bottom:18px;max-width:700px">This is a working demo. Check in a patient, add a walk-in, block a doctor, or list a new doctor in the Doctors tab. New doctors appear under Find doctors, and patient bookings land here.</p>
        <app-clinic-dashboard></app-clinic-dashboard>
        <div class="feat">
          <div><span class="k">Live diary</span><h3>Your diary updates itself</h3><p class="muted">A slot booked online closes everywhere at once.</p></div>
          <div><span class="k">Arrivals</span><h3>Know who’s coming</h3><p class="muted">Names and times for the day, and who has checked in.</p></div>
          <div><span class="k">Walk-ins</span><h3>Add them in two taps</h3><p class="muted">Keep every doctor’s day in order, even on a busy evening.</p></div>
          <div><span class="k">Trust</span><h3>Listed after verification</h3><p class="muted">Every doctor and facility is checked before it goes live.</p></div>
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
          <details><summary>Does PulseQ AI give medical advice?</summary><p>No. PulseQ helps you find the right kind of doctor and book a time. It does not diagnose. For a severe emergency, call 1122 immediately.</p></details>
          <details><summary>Can I chat with PulseQ in Urdu?</summary><p>Yes. You can write in Urdu, English or a mix of both, and use our built-in on-screen Urdu writing tools.</p></details>
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
          <a class="btn btn-line" (click)="scrollToAi()" style="color:#FFFFFF;box-shadow:inset 0 0 0 1.5px #FFFFFF;cursor:pointer">Try PulseQ AI</a>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  doctorsService = inject(DoctorsService);
  hospitalsService = inject(HospitalsService);
  bookingsService = inject(BookingsService);
  modalService = inject(ModalService);
  pulseAi = inject(PulseAiService);
  toast = inject(ToastService);
  seo = inject(SeoService);

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

  // My Bookings
  myBookings = this.bookingsService.bookings;

  // Inline AI Assistant in section
  aiLang = 'en-US';
  aiInput = '';
  showInlineUrduKeyboard = false;
  inlineAiMessages: {
    from: 'bot' | 'user';
    text: string;
    isHtml?: boolean;
    doctorOptions?: { doctor: Doctor; slot: Slot }[];
  }[] = [
    {
      from: 'bot',
      text: 'Hi, I’m PulseQ. I can answer questions, help with support and book your visit. Tell me what’s wrong or who you’d like to see. You can type in English or Urdu.'
    },
    {
      from: 'user',
      text: '<span class="xs" style="opacity:.8;display:block;margin-bottom:2px">Example</span>Mujhe do din se bukhar hai, kal shaam ko appointment chahiye.',
      isHtml: true
    }
  ];

  aiSuggestionsEn = [
    'Fever since two days',
    'Skin rash, tomorrow evening',
    'Child check-up on Friday',
    'Dil mein dard, kal subah',
    'How do I order medicine?',
    'How do I book a surgery?'
  ];

  aiSuggestionsUr = [
    'مجھے دو دن سے بخار ہے',
    'جلد کی الرجی یا دانوں کا معائنہ',
    'دل کے معائنے کے لیے ڈاکٹر',
    'بچوں کا ڈاکٹر کل کے لیے',
    'دوائی آرڈر کیسے کروں؟',
    'سرجری کی معلومات'
  ];

  currentAiSuggestions(): string[] {
    return this.aiLang === 'ur-PK' ? this.aiSuggestionsUr : this.aiSuggestionsEn;
  }

  pickAiSuggestion(s: string): void {
    this.aiInput = s;
    this.sendInlineAi();
  }

  setUrduAiBlock(): void {
    this.aiLang = 'ur-PK';
    this.onAiLangChange();
    if (typeof document !== 'undefined') {
      const el = document.getElementById('ai');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const inp = document.getElementById('homeAiMsg');
        if (inp) inp.focus();
      }, 350);
    }
  }

  urduQuickPhrases = [
    'سر میں درد',
    'بخار اور کھانسی',
    'دل کا ڈاکٹر',
    'جلد کی الرجی',
    'بچوں کا معائنہ',
    'دانت کا درد',
    'ہڈیوں اور جوڑوں کا درد',
    'کل شام'
  ];

  urduKeysRow1 = ['آ', 'ا', 'ب', 'پ', 'ت', 'ٹ', 'ث', 'ج', 'چ', 'ح', 'خ'];
  urduKeysRow2 = ['د', 'ڈ', 'ذ', 'ر', 'ڑ', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض'];
  urduKeysRow3 = ['ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'ں'];
  urduKeysRow4 = ['و', 'ہ', 'ھ', 'ء', 'ی', 'ے', '،', '؟'];

  constructor() {
    this.seo.setPage('PulseQ — Your health, one tap away.');
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('pulseq:set-urdu-ai', () => this.setUrduAiBlock());
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
  specPluralMap = SPEC_PLURAL;

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const tryInit3D = () => {
        const st = document.getElementById('bmStage');
        if (st && (window as any).THREE) {
          this.body3D = init3DBody(
            st,
            () => this.selectedBmArea,
            (k) => this.selectBmArea(k),
            (k) => this.currentBmAreaObj()?.label || ''
          );
        } else {
          setTimeout(tryInit3D, 200);
        }
      };
      setTimeout(tryInit3D, 100);
    }
  }

  ngOnDestroy() {
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
      this.symptomNote = `No exact specialty match for "${q}". Search all doctors or ask PulseQ AI.`;
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

  cancelMyBooking(code: string) {
    this.bookingsService.cancelBooking(code);
    this.toast.show('Booking cancelled.');
  }

  // Hospitals section
  filteredHospitals(): Hospital[] {
    const c = this.hospCity;
    const list = this.hospitalsService.hospitals();
    if (c === 'all') return list;
    return list.filter(h => h.city.toLowerCase() === c.toLowerCase());
  }

  // AI
  openPulseAi() {
    this.pulseAi.open();
  }

  scrollToAi() {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('ai');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onAiLangChange(): void {
    if (this.aiLang === 'ur-PK') {
      this.showInlineUrduKeyboard = true;
      if (this.inlineAiMessages.length <= 2) {
        this.inlineAiMessages = [
          {
            from: 'bot',
            text: 'سلام! میں PulseQ ہوں۔ میں اردو یا انگریزی میں آپ کے سوالات کا جواب، ڈاکٹر کی تلاش اور اپائنٹمنٹ بکنگ میں مدد کر سکتا ہوں۔ آپ اپنی ضرورت یا علامت لکھ سکتے ہیں۔'
          },
          {
            from: 'user',
            text: '<span class="xs" style="opacity:.8;display:block;margin-bottom:2px">مثال</span>مجھے دو دن سے بخار ہے، کل شام کو اپائنٹمنٹ چاہیے',
            isHtml: true
          }
        ];
      }
    } else {
      this.showInlineUrduKeyboard = false;
      if (this.inlineAiMessages.length <= 2) {
        this.inlineAiMessages = [
          {
            from: 'bot',
            text: 'Hi, I’m PulseQ. I can answer questions, help with support and book your visit. Tell me what’s wrong or who you’d like to see. You can type in English or Urdu.'
          },
          {
            from: 'user',
            text: '<span class="xs" style="opacity:.8;display:block;margin-bottom:2px">Example</span>Mujhe do din se bukhar hai, kal shaam ko appointment chahiye.',
            isHtml: true
          }
        ];
      }
    }
  }

  insertInlineUrdu(phrase: string): void {
    this.aiInput = phrase;
    this.sendInlineAi();
  }

  addInlineUrduChar(char: string): void {
    this.aiInput += char;
  }

  backspaceInlineUrdu(): void {
    if (this.aiInput.length > 0) {
      this.aiInput = this.aiInput.slice(0, -1);
    }
  }

  clearInlineUrdu(): void {
    this.aiInput = '';
  }

  isUrduText(text: string): boolean {
    return /[\u0600-\u06FF]/.test(text);
  }

  bookAiDoctor(docId: number, o: number, t: string) {
    this.modalService.openBooking(docId, o, t);
  }

  sendInlineAi() {
    const text = this.aiInput.trim();
    if (!text) return;
    this.inlineAiMessages.push({ from: 'user', text });
    this.aiInput = '';

    const res = this.pulseAi.getSmartReplyDetailed(text);
    setTimeout(() => {
      this.inlineAiMessages.push({
        from: 'bot',
        text: res.text,
        isHtml: res.isHtml,
        doctorOptions: res.doctorOptions
      });
    }, 400);
  }
}
