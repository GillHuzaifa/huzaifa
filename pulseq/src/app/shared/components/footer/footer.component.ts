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
              <a href="https://www.facebook.com" target="_blank" rel="noopener" aria-label="Facebook">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.2 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V10H6.7v3h2.8v8h3.7Z"/></svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener" aria-label="X">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.9 1.2h3.7l-8.1 9.3L24 22.8h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9 6.1-6.9Zm-1.3 19.5h2L6.5 3.2h-2l13.1 17.5Z"/></svg>
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5.5 8.4a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM3.8 10h3.4v10H3.8zM9 10h3.2v1.4c.5-.9 1.6-1.7 3.2-1.7 3.4 0 4 2.2 4 5.1V20H16v-4.6c0-1.1 0-2.6-1.7-2.6s-1.9 1.2-1.9 2.5V20H9z"/></svg>
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                  <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="4.6"/>
                  <circle cx="12" cy="12" r="3.7"/>
                  <circle cx="17.4" cy="6.8" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com" target="_blank" rel="noopener" aria-label="TikTok">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.6 6.2a5.8 5.8 0 0 1-3.4-3.5 6.7 6.7 0 0 1-.3-1.7h-3.7v14.5a3.1 3.1 0 1 1-3.1-3.1c.4 0 .8.1 1.1.2V8.8a7.3 7.3 0 1 0 5.7 7.1V8.5a9.4 9.4 0 0 0 5.5 1.8V6.6a5.8 5.8 0 0 1-1.8-.4Z"/></svg>
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener" aria-label="YouTube">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12s0 3.3.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-2.5.5-5.8.5-5.8s0-3.3-.5-5.8Z"/><path fill="#0D2B50" d="m9.5 15.6 6.3-3.6-6.3-3.6v7.2Z"/></svg>
              </a>
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
