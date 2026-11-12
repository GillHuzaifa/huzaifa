import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="dk foot">
      <div class="wrap">
        <div class="foot-verify">
          <div class="foot-verify-icon" aria-hidden="true">
            <svg viewBox="0 0 32 36" fill="none">
              <path d="M16 2 29 7v9.5c0 8.2-5.3 14.3-13 17.5C8.3 30.8 3 24.7 3 16.5V7L16 2Z" fill="currentColor"/>
              <path d="m9.5 17.5 4.2 4.2 8.8-9" stroke="#0A3850" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <strong>PMDC Verified</strong>
            <span>Real doctors. Real licenses.</span>
            <small>PAKISTAN MEDICAL &amp; DENTAL COUNCIL</small>
          </div>
        </div>
        <div class="foot-cols">
          <div class="foot-brand">
            <div class="foot-brand-mark">
              <img class="logo-mark" src="/Pulseq_logo.png" alt="" aria-hidden="true" width="40" height="40">
              <p>PulseQ</p>
            </div>
            <p class="foot-description">Book trusted doctors and hospitals online, by search in Urdu and English.</p>
            <p class="hand foot-signoff">made with care in Pakistan</p>
            <div class="foot-socials" aria-label="Social links">
              <a href="https://www.facebook.com" target="_blank" rel="noopener" aria-label="Facebook">f</a>
              <a href="https://wa.me/923201122000" target="_blank" rel="noopener" aria-label="WhatsApp">wa</a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener" aria-label="Instagram">ig</a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">in</a>
            </div>
          </div>
          <div class="foot-group">
            <p class="eyebrow">Patients</p>
            <a routerLink="/find-doctors">Find a doctor</a>
            <a routerLink="/hospitals">Hospitals</a>
            <a routerLink="/" fragment="conditions">Conditions</a>
            <a routerLink="/surgery">Surgery</a>
            <a routerLink="/medicine">Medicine</a>
            <a routerLink="/life-map">Lifemap</a>
          </div>
          <div class="foot-group">
            <p class="eyebrow">Clinics</p>
            <a routerLink="/contact">List your clinic</a>
            <a routerLink="/clinics">Clinic dashboard</a>
          </div>
          <div class="foot-group">
            <p class="eyebrow">Company</p>
            <a routerLink="/about">About us</a>
            <a routerLink="/about" fragment="about-team">Our directors</a>
            <a routerLink="/privacy">Privacy policy</a>
          </div>
          <div class="foot-group">
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
          <a class="foot-emergency" href="tel:1122" aria-label="Call emergency services at 1122">Emergency: call 1122.</a>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
}
