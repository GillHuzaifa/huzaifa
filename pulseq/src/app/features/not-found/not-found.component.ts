import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="sec" style="min-height: 65vh; padding-top: 48px; padding-bottom: 64px;">
      <div class="wrap">
        <div class="pv-hero" style="text-align: center; max-width: 720px; margin: 0 auto;">
          <span class="eyebrow">404 &middot; Not Found</span>
          <h2 style="margin-top: 10px;">We couldn't find that page.</h2>
          <p style="margin: 14px auto 24px; max-width: 480px; font-size: 17px; line-height: 1.55;">
            The link you followed may be broken or the page may have moved. We are here to help you find the care you need.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a class="btn btn-ink" routerLink="/" style="background: #fff; color: var(--navy);">Back to home</a>
            <a class="btn btn-line" routerLink="/find-doctors" style="color: #fff; border-color: rgba(255,255,255,0.4);">Find doctors</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class NotFoundComponent {
  private seo = inject(SeoService);

  constructor() {
    this.seo.updateTitle('Page Not Found — PulseQ Pakistan');
    this.seo.updateMeta('The page you requested could not be found. Return to PulseQ to book doctors and find hospitals.');
  }

}
