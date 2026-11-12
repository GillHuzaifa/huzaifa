import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PRIV } from '../../data/privacy.data';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="sec pg-privacy">
      <div class="wrap">
        <div class="pv-hero">
          <span class="eyebrow">Privacy policy</span>
          <h2>Your health details are yours.</h2>
          <p>This page explains, in plain language, what PulseQ collects when you book a doctor, a surgery consultation or medicine, who sees it, and the choices you have.</p>
          <span class="pv-date">Last updated {{ priv.updated }}</span>
        </div>

        <div class="pv-sum">
          <div *ngFor="let s of priv.sum">
            <b>{{ s[0] }}</b>
            <span>{{ s[1] }}</span>
          </div>
        </div>

        <div class="pv-layout">
          <nav class="pv-toc" aria-label="On this page">
            <p>On this page</p>
            <a *ngFor="let s of priv.secs; let i = index" href="javascript:void(0)" (click)="scrollTo('pv-' + i)">
              {{ i + 1 }}. {{ s[0] }}
            </a>
            <a href="javascript:void(0)" (click)="scrollTo('pv-' + priv.secs.length)">
              {{ priv.secs.length + 1 }}. Contact us
            </a>
          </nav>

          <div class="pv-body">
            <section *ngFor="let s of priv.secs; let i = index" [id]="'pv-' + i">
              <h3><i>{{ i + 1 }}</i>{{ s[0] }}</h3>
              <div [innerHTML]="s[1][0]"></div>
            </section>

            <section [id]="'pv-' + priv.secs.length">
              <div class="pv-contact">
                <h3><i>{{ priv.secs.length + 1 }}</i>Contact us</h3>
                <p>Questions about this policy or your information? Write to <b>{{ priv.contact }}</b>.</p>
              </div>
            </section>
          </div>
        </div>

      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .pg-privacy { display: block !important; }
  `]
})
export class PrivacyComponent {
  private seo = inject(SeoService);
  priv = PRIV;

  constructor() {
    this.seo.updateTitle('Privacy Policy — PulseQ Pakistan');
    this.seo.updateMeta('Read how PulseQ protects your personal health and booking details.');
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
