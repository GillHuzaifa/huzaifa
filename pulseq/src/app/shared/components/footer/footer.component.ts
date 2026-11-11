import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PulseAiService } from '../../services/pulse-ai.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="dk foot">
      <div class="wrap">
        <div class="foot-cols">
          <div style="max-width:320px;flex:1 1 260px">
            <div style="display:flex;align-items:center;gap:12px">
              <svg class="logo-mark" viewBox="0 0 48 48" aria-hidden="true" width="40" height="40" style="flex:none">
                <rect width="48" height="48" rx="14" fill="#2381FF"/>
                <path d="M6 26h7l3-9 4.500 17 5-22 4.500 15 2-1h10" fill="none" stroke="#fff" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="15" cy="11" r="1.700" fill="#fff"/>
                <circle cx="31" cy="38" r="1.700" fill="#fff"/>
                <circle cx="38" cy="12" r="1.700" fill="#fff"/>
              </svg>
              <p style="font-family:var(--disp);font-weight:800;font-size:30px;color:#fff;margin:0">PulseQ</p>
            </div>
            <p class="muted" style="margin-top:10px">Book doctors and hospitals online, by search or chat in Urdu and English.</p>
            <p class="hand" style="font-size:26px;color:#93C5FD;margin-top:8px">made with care in Pakistan</p>
          </div>
          <div>
            <p class="eyebrow">Patients</p>
            <a routerLink="/find-doctors">Find a doctor</a>
            <a routerLink="/hospitals">Hospitals</a>
            <a routerLink="/" fragment="conditions">Conditions</a>
            <a href="javascript:void(0)" (click)="openAi()">PulseQ AI</a>
            <a routerLink="/surgery">Surgery</a>
            <a routerLink="/medicine">Medicine</a>
          </div>
          <div>
            <p class="eyebrow">Clinics</p>
            <a routerLink="/contact">List your clinic</a>
            <a routerLink="/clinics">Clinic dashboard</a>
          </div>
          <div>
            <p class="eyebrow">Company</p>
            <a routerLink="/about">About us</a>
            <a routerLink="/about" fragment="about-team">Our directors</a>
            <a routerLink="/privacy">Privacy policy</a>
          </div>
          <div>
            <p class="eyebrow">Help</p>
            <a routerLink="/" fragment="faq">Questions</a>
            <a routerLink="/contact">Contact us</a>
            <a routerLink="/contact" [queryParams]="{tab: 'collab'}">Collaborate with us</a>
            <a routerLink="/terms">Terms of use</a>
          </div>
        </div>
        <div class="foot-legal">
          <span class="foot-copy">Copyright © 2026 PulseQ. All rights reserved.</span>
          <span class="foot-links">
            <a routerLink="/privacy">Privacy policy</a>
            <span aria-hidden="true">·</span>
            <a routerLink="/terms">Terms of use</a>
          </span>
          <span class="foot-note">PulseQ does not provide medical advice.</span>
          <span class="foot-emergency">Emergency: call 1122.</span>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  private aiService = inject(PulseAiService);

  openAi(): void {
    this.aiService.open();
  }
}
