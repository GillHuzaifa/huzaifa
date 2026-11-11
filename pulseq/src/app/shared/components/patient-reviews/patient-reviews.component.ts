import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ReviewStats,
  PatientReview,
  ReviewAspect,
  ReviewAspectKey,
  ReviewsService
} from '../../services/reviews.service';

export interface SubmittedReview {
  w: number;
  l: number;
  c: number;
  t: string;
  n: string;
}

@Component({
  selector: 'app-patient-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="entityType === 'hospital' ? 'dp-card hrv' : 'dp-card'" [id]="sectionId">
      <h3>Patient reviews</h3>

      <div class="rv-sum pbs">
        <div class="pbs-l">
          <span class="pb-ring" [style.--p]="ringDeg()" style="--z:104px">
            <b>{{ stats.avg.toFixed(1) }}</b>
          </span>
          <b class="pbs-mood">{{ reviewsService.mood(stats.avg, entityType) }}</b>
          <span class="muted xs">PulseQ patient score from {{ stats.n }} reviews</span>
        </div>

        <div class="pbs-r">
          <div class="pb">
            <svg class="pb-ecg" viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true">
              <polyline class="b" [attr.points]="ecgPoints()" />
              <polyline class="g" pathLength="100" [attr.points]="ecgPoints()" />
            </svg>
            <div class="pb-lbl">
              @for (a of aspects; track a.key) {
                <span>{{ a.label }}<b>{{ statScore(a.key).toFixed(1) }}</b></span>
              }
            </div>
            <div class="pb-chips">
              @for (chip of chips(); track chip) {
                <span>{{ chip }}</span>
              }
            </div>
          </div>
        </div>
      </div>

      <ul class="rv-list">
        @for (r of stats.list; track $index) {
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
                @for (a of aspects; track a.key) {
                  <span [class]="tagClass(reviewScore(r, a.key))">
                    {{ a.label }} {{ reviewScore(r, a.key) }}/5
                  </span>
                }
              </div>
            </div>
          </li>
        }
      </ul>

      <p class="muted xs">
        Reviews marked Sample are placeholders until real patient reviews arrive. Reviews describe the visit and are not medical advice.
      </p>

      <form class="rv-form" (submit)="onSubmit($event)">
        <p><b>{{ formTitle }}</b></p>
        <label class="sr" [for]="formPrefix + 'Name'">Your name</label>
        <input
          class="inp"
          [id]="formPrefix + 'Name'"
          type="text"
          maxlength="40"
          placeholder="Your name (optional)"
          autocomplete="name"
          [(ngModel)]="revName"
          name="revName">

        @for (a of aspects; track a.key) {
          <div class="rv-row">
            <span>{{ a.label }}</span>
            <div class="rv-pick" role="radiogroup" [attr.aria-label]="a.label">
              @for (k of [1, 2, 3, 4, 5]; track k) {
                <button
                  type="button"
                  class="rv-s"
                  [class.on]="scores[a.key] === k"
                  [attr.aria-checked]="scores[a.key] === k"
                  role="radio"
                  (click)="scores[a.key] = k">
                  {{ k }}
                </button>
              }
            </div>
          </div>
        }

        <label class="sr" [for]="formPrefix + 'Text'">Your review</label>
        <textarea
          class="inp"
          [id]="formPrefix + 'Text'"
          rows="3"
          maxlength="400"
          [placeholder]="textareaPlaceholder"
          [(ngModel)]="revComment"
          name="revComment"></textarea>

        @if (errMsg) {
          <p class="err" role="alert">{{ errMsg }}</p>
        }

        <button type="submit" class="btn btn-coral">Post review</button>
      </form>
    </div>
  `
})
export class PatientReviewsComponent {
  reviewsService = inject(ReviewsService);

  @Input({ required: true }) stats!: ReviewStats;
  @Input({ required: true }) aspects: ReviewAspect[] = [];
  @Input() entityType: 'doctor' | 'hospital' = 'doctor';
  @Input() sectionId = 'reviews';
  @Input() formTitle = 'Add your review';
  @Output() reviewSubmitted = new EventEmitter<SubmittedReview>();

  revName = '';
  revComment = '';
  errMsg = '';
  scores: Record<ReviewAspectKey, number> = { w: 0, l: 0, c: 0 };

  get formPrefix(): string {
    return this.entityType === 'hospital' ? 'hrv' : 'rv';
  }

  get textareaPlaceholder(): string {
    return this.entityType === 'hospital'
      ? 'How was your visit?'
      : 'How was your visit? Please do not share medical details.';
  }

  ringDeg(): string {
    return `${((this.stats.avg / 5) * 360).toFixed(0)}deg`;
  }

  statScore(key: ReviewAspectKey): number {
    return this.stats[key];
  }

  reviewScore(r: PatientReview, key: ReviewAspectKey): number {
    return r[key];
  }

  ecgPoints(): string {
    const ks: ReviewAspectKey[] = ['w', 'l', 'c'];
    const cx = [50, 150, 250];
    let pts = '0,52 ';
    ks.forEach((k, i) => {
      const a = 6 + (this.stats[k] / 5) * 34;
      const c = cx[i];
      pts += `${c - 26},52 ${c - 18},52 ${c - 14},47 ${c - 10},52 ${c - 5},52 ${c - 3},57 ${c},${(52 - a).toFixed(1)} ${c + 4},60 ${c + 7},52 `;
    });
    return pts + '300,52';
  }

  chips(): string[] {
    const out: string[] = [];
    for (const a of this.aspects) {
      if (this.stats[a.key] >= 4.2) {
        out.push(a.chip);
      }
    }
    const happy = this.stats.list.filter(r => (r.w + r.l + r.c) / 3 >= 4).length;
    out.push(`${happy} of ${this.stats.n} would visit again`);
    return out;
  }

  initial(name: string): string {
    const stripped = String(name || 'P').replace(/^Patient\s*/, '').charAt(0) || 'P';
    return stripped.toUpperCase();
  }

  tagClass(val: number): string {
    if (val >= 4) return 'vhi';
    if (val === 3) return 'vmid';
    return 'vlo';
  }

  onSubmit(e: Event): void {
    e.preventDefault();
    if (!this.scores.w || !this.scores.l || !this.scores.c) {
      this.errMsg = this.entityType === 'hospital'
        ? 'Give a score for cleanliness, staff care and facilities.'
        : 'Give a score for wait time, listening and advice.';
      return;
    }
    const text = this.revComment.trim();
    if (text.length < 5) {
      this.errMsg = 'Write a few words about your visit.';
      return;
    }
    this.errMsg = '';
    this.reviewSubmitted.emit({
      w: this.scores.w,
      l: this.scores.l,
      c: this.scores.c,
      t: text,
      n: this.revName.trim().slice(0, 40) || 'Patient'
    });
    this.scores = { w: 0, l: 0, c: 0 };
    this.revComment = '';
    this.revName = '';
  }
}
