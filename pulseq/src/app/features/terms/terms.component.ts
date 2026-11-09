import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TERMS } from '../../data/terms.data';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="sec pg-terms">
      <div class="wrap">
        <div class="pv-hero">
          <span class="eyebrow">Terms of use</span>
          <h2>The rules of the road, in plain words.</h2>
          <p>What you can expect from PulseQ, and what we expect from you, when you book a doctor, a surgery consultation or medicine.</p>
          <span class="pv-date">Last updated {{ terms.updated }}</span>
        </div>

        <div class="pv-layout">
          <nav class="pv-toc" aria-label="On this page">
            <p>On this page</p>
            <a *ngFor="let s of terms.secs; let i = index" href="javascript:void(0)" (click)="scrollTo('tm-' + i)">
              {{ i + 1 }}. {{ s[0] }}
            </a>
          </nav>

          <div class="pv-body">
            <section *ngFor="let s of terms.secs; let i = index" [id]="'tm-' + i">
              <h3><i>{{ i + 1 }}</i>{{ s[0] }}</h3>
              <div [innerHTML]="s[1][0]"></div>
            </section>
          </div>
        </div>

        <p class="pv-note"><b>Draft for review.</b> Have a qualified lawyer review these terms, including governing law, refunds and liability, before launch.</p>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .pg-terms { display: block !important; }
  `]
})
export class TermsComponent {
  private seo = inject(SeoService);
  terms = TERMS;

  constructor() {
    this.seo.updateTitle('Terms of Use — PulseQ Pakistan');
    this.seo.updateMeta('Terms and conditions for booking healthcare services and ordering medicines on PulseQ.');
  }

  scrollTo(id: string) {
    if (typeof document !== 'undefined') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
}
