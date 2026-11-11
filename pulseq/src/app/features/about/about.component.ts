import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ABOUT } from '../../data/about.data';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="sec pg-about" id="page-about">
      <div class="wrap">
        <div class="ab-hero">
          <span class="eyebrow">About PulseQ</span>
          <h2>Care should be one tap away.</h2>
          <p>PulseQ exists so that no one in Pakistan has to stand in a queue, wait on hold or travel across town just to find out whether a doctor is free.</p>
          <svg class="pulse" viewBox="0 0 800 80" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 40h250l24-30 36 62 30-44 20 12h440" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </div>

        <div class="ab-sec ab-two">
          <div>
            <span class="eyebrow">Our story</span>
            <h2 style="font-size:clamp(26px,3.3vw,40px);margin-top:12px">How PulseQ started</h2>
            <p class="muted" style="font-size:18px;margin-top:16px;max-width:44ch">Three people, one frustration, and a simple belief: booking a doctor, a surgeon or a medicine should feel as easy as sending a message.</p>
          </div>
          <div>
            <div class="ab-story" id="abStory">
              @for (ch of aboutData.story; track ch[0]) {
                <div class="ab-ch">
                  <h3>{{ ch[0] }}</h3>
                  <p>{{ ch[1] }}</p>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="ab-sec">
          <span class="eyebrow">What we believe</span>
          <h2 style="font-size:clamp(26px,3.3vw,40px);margin-top:12px">Built around the patient</h2>
          <div class="ab-vals" id="abVals">
            @for (v of aboutData.values; track v[0]) {
              <div class="ab-val">
                <i>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path [attr.d]="v[2]"></path>
                  </svg>
                </i>
                <h3>{{ v[0] }}</h3>
                <p>{{ v[1] }}</p>
              </div>
            }
          </div>
        </div>

        <div class="ab-sec" id="about-team">
          <span class="eyebrow">Leadership</span>
          <h2 style="font-size:clamp(26px,3.3vw,40px);margin-top:12px">Meet our three directors</h2>
          <p class="muted" style="font-size:18px;margin-top:12px;max-width:56ch">The people who started PulseQ and who are accountable for it, day to day.</p>
          <div class="ab-team" id="abTeam">
            @for (m of aboutData.team; track m.short) {
              <article class="ab-dir">
                <div class="ab-photo">
                  @if (m.photo) {
                    <img [src]="m.photo" [alt]="m.name" loading="lazy" width="240" height="240">
                  } @else {
                    <span>{{ m.ini }}</span>
                  }
                </div>
                <div class="body">
                  <span class="ab-role">{{ m.role }}</span>
                  <h3>{{ m.name }}</h3>
                  <p>{{ m.bio }}</p>
                </div>
              </article>
            }
          </div>
        </div>

        <div class="ab-sec" id="about-crew">
          <span class="eyebrow">Our team</span>
          <h2 style="font-size:clamp(26px,3.3vw,40px);margin-top:12px">The small team behind PulseQ</h2>
          <p class="muted" style="font-size:18px;margin-top:12px;max-width:56ch">A small team building PulseQ, one hospital at a time.</p>
          <div id="abCrew">
            @for (g of aboutData.crew; track g.dept) {
              <div class="crew-g">
                @if (g.dept) {
                  <h3>{{ g.dept }}</h3>
                }
                <div class="crew">
                  @for (m of g.people; track m.name) {
                    <div class="crew-m crew-person">
                      <span class="crew-av">
                        @if (m.photo) {
                          <img [src]="m.photo" [alt]="m.name" loading="lazy" width="48" height="48">
                        } @else {
                          {{ m.ini }}
                        }
                      </span>
                      <div>
                        <b>{{ m.name }}</b>
                        <span>{{ m.role }}</span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
            <div class="crew-m crew-join" style="margin-top:18px">
              <div>
                <b>Want to work with us?</b>
                <span>Doctors, pharmacists and engineers are welcome.</span>
              </div>
              <a routerLink="/contact">Get in touch</a>
            </div>
          </div>
        </div>

        <div class="ab-cta">
          <h2>Run a clinic, hospital or pharmacy? Partner with us.</h2>
          <div style="display:flex;flex-wrap:wrap;gap:12px">
            <a class="btn btn-ink" routerLink="/" fragment="clinics">For clinics</a>
            <a class="btn btn-line" routerLink="/find-doctors">Find a doctor</a>
          </div>
        </div>
        <p class="ab-note">PulseQ helps you book care and does not provide medical advice.</p>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .pg-about { display: block !important; }
  `]
})
export class AboutComponent implements OnInit {
  seo = inject(SeoService);
  aboutData = ABOUT;

  ngOnInit(): void {
    this.seo.setPage('About Us');
  }
}
