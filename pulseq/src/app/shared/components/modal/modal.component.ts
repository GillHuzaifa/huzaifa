import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { DoctorsService } from '../../services/doctors.service';
import { HospitalsService } from '../../services/hospitals.service';
import {
  ReviewsService,
  ReviewStats,
  DOC_ASPECTS,
  buildEcgPoints,
  buildReviewChips,
  reviewInitial,
  scoreTagClass
} from '../../services/reviews.service';
import { Doctor, Place } from '../../models';
import { SPEC } from '../../../data/specialties.data';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (modal.isOpen()) {
      <div class="modal" (click)="onBackdrop($event)">
        <div class="panel" role="dialog" aria-modal="true" aria-labelledby="mTitle" tabindex="-1">
          @if (!modal.isDone()) {
            @if (modal.selectedDocOrPlace(); as d) {
              <div style="display:flex;flex-direction:column;gap:18px">
                <div class="panel-head">
                  <div class="avatar t{{ d.t }}">{{ getInitials(d.name) }}</div>
                  <div class="min0">
                    <h3 id="mTitle" style="font-size:24px">{{ d.name }}</h3>
                    <p class="muted sm">
                      {{ getSpec(d.spec) }} · {{ getHospName(d.h) }} · Rs {{ d.fee.toLocaleString('en-US') }}
                    </p>
                  </div>
                  <button class="icon-btn x" (click)="modal.close()" aria-label="Close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18"></path>
                    </svg>
                  </button>
                </div>

                @if (docStats(d); as s) {
                  <details class="mrev" id="mRev">
                    <summary class="mr-sum">
                      <span class="pb-ring" [style.--p]="ringDeg(s)" style="--z:52px"><b>{{ s.avg.toFixed(1) }}</b></span>
                      <span class="mr-mid">
                        <b>{{ reviewsService.mood(s.avg, 'doctor') }}</b>
                        <span>{{ s.avg.toFixed(1) }} · {{ s.n }} patient reviews</span>
                      </span>
                      <span class="rv-more">Read</span>
                    </summary>
                    <div class="pb">
                      <svg class="pb-ecg" viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true">
                        <polyline class="b" [attr.points]="ecgPoints(s)" />
                        <polyline class="g" pathLength="100" [attr.points]="ecgPoints(s)" />
                      </svg>
                      <div class="pb-lbl">
                        @for (a of docAspects; track a.key) {
                          <span>{{ a.label }}<b>{{ s[a.key].toFixed(1) }}</b></span>
                        }
                      </div>
                      <div class="pb-chips">
                        @for (chip of reviewChips(s); track chip) {
                          <span>{{ chip }}</span>
                        }
                      </div>
                    </div>
                    <ul class="rv-list">
                      @for (r of s.list.slice(0, 2); track $index) {
                        <li class="rv">
                          <span class="rv-av" aria-hidden="true">{{ initial(r.n) }}</span>
                          <div class="rv-bd">
                            <div class="rv-top">
                              <b>{{ r.n }}</b>
                              @if (r.ver) {
                                <em class="rv-ver">Booked on PulseQ</em>
                              } @else if (r.sample) {
                                <em class="rv-smp">Sample</em>
                              } @else {
                                <em class="rv-smp">Patient review</em>
                              }
                            </div>
                            <p>“{{ r.t }}”</p>
                            <div class="rv-tags">
                              @for (a of docAspects; track a.key) {
                                <span [class]="tagClass(r[a.key])">{{ a.label }} {{ r[a.key] }}/5</span>
                              }
                            </div>
                          </div>
                        </li>
                      }
                    </ul>
                    <a class="rv-all" href="javascript:void(0)" (click)="goToAllReviews(d)">See all reviews on profile</a>
                  </details>
                }

                <div>
                  <span class="lbl">Day</span>
                  <div class="chips">
                    @for (o of [0, 1, 2, 3, 4]; track o) {
                      @let n = doctorsService.slots(d, o).length;
                      <button
                        class="chip"
                        [class.on]="modal.selectedDayOffset() === o"
                        [disabled]="n === 0"
                        [attr.aria-pressed]="modal.selectedDayOffset() === o"
                        (click)="modal.selectDay(o)">
                        {{ doctorsService.dayLabel(o) }}
                      </button>
                    }
                  </div>
                </div>

                <div>
                  <span class="lbl">Time</span>
                  <div class="chips">
                    @for (t of doctorsService.slots(d, modal.selectedDayOffset()); track t) {
                      <button
                        class="chip"
                        [class.on]="modal.selectedTime() === t"
                        [attr.aria-pressed]="modal.selectedTime() === t"
                        (click)="modal.selectTime(t)">
                        {{ doctorsService.formatTime(t) }}
                      </button>
                    }
                  </div>
                </div>

                <div>
                  <label class="lbl" for="pName">Patient name</label>
                  <input class="inp" id="pName" type="text" [(ngModel)]="patientName" autocomplete="name">
                </div>

                <div>
                  <label class="lbl" for="pPhone">Mobile number</label>
                  <input class="inp" id="pPhone" type="tel" inputmode="tel" placeholder="03xx xxxxxxx" [(ngModel)]="patientPhone" autocomplete="tel">
                </div>

                <p class="err" role="alert">{{ modal.errorMessage() }}</p>

                <button class="btn btn-coral full" (click)="submit()">Confirm appointment</button>
              </div>
            }
          } @else {
            @if (modal.lastConfirmed(); as b) {
              <div style="display:flex;flex-direction:column;gap:16px">
                <div style="display:flex;align-items:center;gap:12px">
                  <span style="width:48px;height:48px;border-radius:50%;background:var(--mint);display:flex;align-items:center;justify-content:center;flex:none">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#102A43" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5"></path>
                    </svg>
                  </span>
                  <h3 style="font-size:28px">You’re booked</h3>
                </div>

                <div class="bk">
                  <span class="muted xs">Booking code</span>
                  <code>{{ b.code }}</code>
                  <p style="font-weight:700">{{ b.when }} with {{ b.doctor }}</p>
                  <p class="sm">{{ b.hospital }} · for {{ b.name }}</p>
                </div>

                <p class="muted sm">Get your appointment number on WhatsApp, and show your code at the desk when you arrive. Demo note: appointments here are saved in this browser only.</p>

                <a class="btn btn-coral full" target="_blank" rel="noopener" [href]="getWaLink(b)">Get your appointment number on WhatsApp</a>
                <button class="btn btn-ink full" (click)="modal.close()">Done</button>
              </div>
            }
          }
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  modal = inject(ModalService);
  doctorsService = inject(DoctorsService);
  hospitalsService = inject(HospitalsService);
  reviewsService = inject(ReviewsService);
  router = inject(Router);

  docAspects = DOC_ASPECTS;
  patientName = '';
  patientPhone = '';

  baseDocId(d: Doctor | Place): number {
    return ('base' in d && d.base) ? d.base : Number(d.id);
  }

  docStats(d: Doctor | Place): ReviewStats {
    return this.reviewsService.getDocStats(this.baseDocId(d));
  }

  ringDeg(s: ReviewStats): string {
    return `${((s.avg / 5) * 360).toFixed(0)}deg`;
  }

  ecgPoints(s: ReviewStats): string {
    return buildEcgPoints(s);
  }

  reviewChips(s: ReviewStats): string[] {
    return buildReviewChips(s, this.docAspects);
  }

  initial(name: string): string {
    return reviewInitial(name);
  }

  tagClass(val: number): string {
    return scoreTagClass(val);
  }

  goToAllReviews(d: Doctor | Place): void {
    const id = this.baseDocId(d);
    this.modal.close();
    this.router.navigate(['/doctor', id], { fragment: 'reviews' });
  }

  getInitials(name: string): string {
    return name.replace('Dr. ', '').split(' ').map(w => w[0]).slice(0, 2).join('');
  }

  getSpec(specKey: string): string {
    return SPEC[specKey] || specKey;
  }

  getHospName(hospId: string): string {
    const h = this.hospitalsService.getHospitalById(hospId);
    return h ? h.name : hospId;
  }

  getWaLink(b: any): string {
    const text = `Hello PulseQ, please send my appointment number.\nCode: ${b.code}\nDoctor: ${b.doctor}, ${b.hospital}\nWhen: ${b.when}\nPatient: ${b.name} (${b.phone})`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  onBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.modal.close();
    }
  }

  submit(): void {
    const success = this.modal.confirm(this.patientName, this.patientPhone);
    if (success) {
      this.patientName = '';
      this.patientPhone = '';
    }
  }
}
