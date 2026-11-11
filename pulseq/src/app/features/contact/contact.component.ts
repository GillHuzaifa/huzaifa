import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CONTACT } from '../../data/contact.data';
import { PulseAiService } from '../../shared/services/pulse-ai.service';
import { SeoService } from '../../shared/services/seo.service';

interface CollabOption {
  icon: string;
  title: string;
  desc: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="sec pg-contact">
      <div class="wrap">
        <!-- Hero Section with Quick Contacts and Stats -->
        <div class="pv-hero">
          <div class="ct-hero-top">
            <div>
              <span class="eyebrow">Contact PulseQ</span>
              <h2>We are here when you need a hand.</h2>
              <p class="muted" style="max-width:540px">
                Patients, clinics, hospitals and pharmacies: pick the fastest way to reach us. For emergencies, call 1122.
              </p>
            </div>
            <div class="ct-quick">
              <a class="btn btn-mint" href="tel:+923251714253">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>
                </svg>
                Call 0325-1714253
              </a>
              <a class="btn ct-wa" target="_blank" rel="noopener" href="https://wa.me/923251714253?text=Hello%20PulseQ">WhatsApp us</a>
            </div>
          </div>
          <ul class="ct-stats" aria-label="Why contact PulseQ">
            <li><b>Mon – Sat</b><span>9 am to 8 pm</span></li>
            <li><b>Urdu &amp; English</b><span>support in both</span></li>
            <li><b>Same day</b><span>reply on most requests</span></li>
          </ul>
        </div>

        <!-- Contact Cards Grid -->
        <div class="ct-grid">
          <!-- Chat with PulseQ -->
          <div class="ct-card">
            <i>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 12l16-8-6 16-3-7z"></path>
              </svg>
            </i>
            <h3>Chat with PulseQ</h3>
            <p>Fastest for booking help, finding a doctor or a quick question, in Urdu or English.</p>
            <button class="btn btn-ink" type="button" (click)="openAi()">Open PulseQ</button>
          </div>

          <!-- Common questions -->
          <div class="ct-card">
            <i>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 17v.01M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path>
              </svg>
            </i>
            <h3>Common questions</h3>
            <p>Payments, cancelling a booking, medicine delivery and how doctors are verified.</p>
            <a class="btn btn-line" routerLink="/" fragment="faq">Read the answers</a>
          </div>

          <!-- Call us -->
          <div class="ct-card">
            <i>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"></path>
              </svg>
            </i>
            <h3>Call us</h3>
            <p><a class="ct-big" href="tel:+923251714253">0325-1714253</a><br>Mon – Sat, 9 am to 8 pm</p>
            <a class="btn btn-ink" href="tel:+923251714253">Call now</a>
          </div>

          <!-- WhatsApp -->
          <div class="ct-card">
            <i>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.7-5.2A8.5 8.5 0 1 1 21 12z"></path>
              </svg>
            </i>
            <h3>WhatsApp</h3>
            <p>Message us and a real person will reply, in Urdu or English.</p>
            <a class="btn btn-line" target="_blank" rel="noopener" href="https://wa.me/923251714253?text=Hello%20PulseQ">Open WhatsApp</a>
          </div>

          <!-- Email -->
          <div class="ct-card">
            <i>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 6h16v12H4zM4 7l8 6 8-6"></path>
              </svg>
            </i>
            <h3>Email</h3>
            <p><b><a [href]="'mailto:' + (contact.email || 'info@pulseq.health')" style="color:inherit;text-decoration:none">{{ contact.email || 'info@pulseq.health' }}</a></b></p>
          </div>
        </div>

        <!-- Work With Us Forms Container -->
        <div class="ct-forms" id="ctForms">
          <div class="ct-formhead">
            <span class="eyebrow">Work with us</span>
            <h3>Clinics, hospitals and partners start here.</h3>
            <p class="muted">Choose what fits you. It takes about two minutes and we call you back to finish setting up.</p>
          </div>

          <!-- Tabs -->
          <div class="ct-tabs" role="tablist" aria-label="Choose a form">
            <button class="ct-tab" [class.on]="activeTab === 'clinic'" (click)="activeTab = 'clinic'" role="tab" type="button" [attr.aria-selected]="activeTab === 'clinic'">
              List my clinic
            </button>
            <button class="ct-tab" [class.on]="activeTab === 'collab'" (click)="activeTab = 'collab'" role="tab" type="button" [attr.aria-selected]="activeTab === 'collab'">
              Collaborate with us
            </button>
          </div>

          <!-- Panel 1: List my clinic -->
          @if (activeTab === 'clinic') {
            <div class="ct-panel" id="panelClinic" role="tabpanel">
              @if (!cfDone) {
                <form id="clinicForm" (submit)="submitClinic($event)" novalidate>
                  <div class="ct-fs">
                    <h4 class="ct-fsh">About your clinic</h4>
                    <div class="ct-row">
                      <div><label class="lbl" for="cfName">Clinic or hospital name</label><input class="inp" id="cfName" type="text" [(ngModel)]="cfName" name="cfName" autocomplete="organization"></div>
                      <div><label class="lbl" for="cfType">Type</label>
                        <select class="inp" id="cfType" [(ngModel)]="cfType" name="cfType">
                          <option>Clinic</option>
                          <option>Hospital</option>
                          <option>Diagnostic centre / lab</option>
                          <option>Pharmacy</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div class="ct-row">
                      <div><label class="lbl" for="cfCity">City</label><input class="inp" id="cfCity" type="text" [(ngModel)]="cfCity" name="cfCity" placeholder="e.g. Rawalpindi"></div>
                      <div><label class="lbl" for="cfArea">Area / address</label><input class="inp" id="cfArea" type="text" [(ngModel)]="cfArea" name="cfArea" placeholder="e.g. Saddar, Mall Road"></div>
                    </div>
                  </div>

                  <div class="ct-fs">
                    <h4 class="ct-fsh">Capacity</h4>
                    <div class="ct-row ct-row3">
                      <div><label class="lbl" for="cfDocs">Doctors at the clinic</label><input class="inp" id="cfDocs" type="number" min="1" max="500" [(ngModel)]="cfDocs" name="cfDocs" placeholder="e.g. 4"></div>
                      <div><label class="lbl" for="cfPts">Patients per day</label><input class="inp" id="cfPts" type="number" min="1" max="5000" [(ngModel)]="cfPts" name="cfPts" placeholder="e.g. 60"></div>
                      <div><label class="lbl" for="cfBeds">Beds <span class="ct-opt">(optional)</span></label><input class="inp" id="cfBeds" type="number" min="0" max="5000" [(ngModel)]="cfBeds" name="cfBeds" placeholder="e.g. 10"></div>
                    </div>
                    <p class="lbl" style="margin:18px 0 8px">Specialities you offer</p>
                    <div class="ct-chips">
                      @for (spec of availableSpecs; track spec) {
                        <button type="button" class="chip" [class.on]="selectedSpecs[spec]" (click)="toggleSpec(spec)">
                          {{ spec }}
                        </button>
                      }
                    </div>
                  </div>

                  <div class="ct-fs">
                    <h4 class="ct-fsh">Who should we call?</h4>
                    <div class="ct-row">
                      <div><label class="lbl" for="cfPerson">Contact person</label><input class="inp" id="cfPerson" type="text" [(ngModel)]="cfPerson" name="cfPerson" autocomplete="name" autocapitalize="words"></div>
                      <div><label class="lbl" for="cfPhone">Phone number</label><input class="inp" id="cfPhone" type="tel" inputmode="numeric" [(ngModel)]="cfPhone" name="cfPhone" placeholder="03XX-XXXXXXX" autocomplete="tel" enterkeyhint="next"></div>
                    </div>
                    <div><label class="lbl" for="cfNote">Anything else? <span class="ct-opt">(optional)</span></label><textarea class="inp" id="cfNote" rows="3" [(ngModel)]="cfNote" name="cfNote" placeholder="Timings, languages, services, questions"></textarea></div>
                  </div>

                  <p class="err" id="cfMsg" role="status" *ngIf="cfError">{{ cfError }}</p>
                  <div class="ct-submit">
                    <button class="btn btn-ink" type="submit">Send clinic details</button>
                    <span class="muted sm">We only use these details to set up your PulseQ listing.</span>
                  </div>
                </form>
              } @else {
                <div class="ct-done">
                  <span class="ct-tick">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
                  </span>
                  <h4>Thank you, {{ cfFirstName }}.</h4>
                  <p>We have noted <b>{{ cfName }}</b> with <b>{{ cfDocs }}</b> doctor(s) and about <b>{{ cfPts }}</b> patients a day. Our team will call you on <b>{{ cfPhone }}</b>. To be quicker, send the same details to us on WhatsApp.</p>
                  <div class="ct-done-act">
                    <a class="btn btn-ink" target="_blank" rel="noopener" [href]="cfWaLink">Send these details on WhatsApp</a>
                    <a class="btn btn-line" href="tel:+923251714253">Call 0325-1714253</a>
                    <button class="btn btn-line" type="button" (click)="resetClinicForm()">Send another</button>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Panel 2: Collaborate with us -->
          @if (activeTab === 'collab') {
            <div class="ct-panel" id="panelCollab" role="tabpanel">
              <p class="lbl" style="margin-bottom:10px">How would you like to work with us?</p>
              <div class="ct-collab">
                @for (c of collabOptions; track c.title) {
                  <button type="button" role="radio" class="ct-opt-card" [attr.aria-checked]="selectedCollab === c.title" (click)="selectedCollab = c.title">
                    <i>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path [attr.d]="c.icon"></path>
                      </svg>
                    </i>
                    <b>{{ c.title }}</b>
                    <span>{{ c.desc }}</span>
                  </button>
                }
              </div>

              @if (!cbDone) {
                <form id="collabForm" (submit)="submitCollab($event)" novalidate>
                  <div class="ct-row">
                    <div><label class="lbl" for="cbOrg">Organisation</label><input class="inp" id="cbOrg" type="text" [(ngModel)]="cbOrg" name="cbOrg" autocomplete="organization" autocapitalize="words"></div>
                    <div><label class="lbl" for="cbPerson">Your name</label><input class="inp" id="cbPerson" type="text" [(ngModel)]="cbPerson" name="cbPerson" autocomplete="name" autocapitalize="words"></div>
                  </div>
                  <div class="ct-row">
                    <div><label class="lbl" for="cbPhone">Phone number</label><input class="inp" id="cbPhone" type="tel" inputmode="numeric" [(ngModel)]="cbPhone" name="cbPhone" placeholder="03XX-XXXXXXX" autocomplete="tel"></div>
                    <div><label class="lbl" for="cbEmail">Email <span class="ct-opt">(optional)</span></label><input class="inp" id="cbEmail" type="email" [(ngModel)]="cbEmail" name="cbEmail" autocomplete="email"></div>
                  </div>
                  <div><label class="lbl" for="cbNote">Tell us your idea</label><textarea class="inp" id="cbNote" rows="4" [(ngModel)]="cbNote" name="cbNote" placeholder="What would you like us to do together?"></textarea></div>
                  <p class="err" id="cbMsg" role="status" *ngIf="cbError">{{ cbError }}</p>
                  <div class="ct-submit">
                    <button class="btn btn-ink" type="submit">Send collaboration request</button>
                    <span class="muted sm">A member of our team will call you back.</span>
                  </div>
                </form>
              } @else {
                <div class="ct-done">
                  <span class="ct-tick">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
                  </span>
                  <h4>Thanks, {{ cbFirstName }}.</h4>
                  <p>We received your <b>{{ selectedCollab }}</b> idea. A member of our team will call you on <b>{{ cbPhone }}</b>. You can also send it straight to us on WhatsApp.</p>
                  <div class="ct-done-act">
                    <a class="btn btn-ink" target="_blank" rel="noopener" [href]="cbWaLink">Send these details on WhatsApp</a>
                    <a class="btn btn-line" href="tel:+923251714253">Call 0325-1714253</a>
                    <button class="btn btn-line" type="button" (click)="resetCollabForm()">Send another</button>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <p class="ct-emg">
          <b>Severe emergency?</b> Do not wait for a reply here. Call <a href="tel:1122" style="color:inherit;font-weight:700;text-decoration:underline">1122</a> immediately or go to the nearest hospital emergency room.
        </p>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .pg-contact { display: block !important; }
  `]
})
export class ContactComponent implements OnInit {
  private pulseAi = inject(PulseAiService);
  private seo = inject(SeoService);
  private route = inject(ActivatedRoute);
  contact = CONTACT;

  activeTab: 'clinic' | 'collab' = 'clinic';

  // Clinic form state
  cfName = '';
  cfType = 'Clinic';
  cfCity = '';
  cfArea = '';
  cfDocs: number | null = null;
  cfPts: number | null = null;
  cfBeds: number | null = null;
  cfPerson = '';
  cfPhone = '';
  cfNote = '';
  cfError = '';
  cfDone = false;
  cfFirstName = '';
  cfWaLink = '';

  availableSpecs = [
    "General physician", "Paediatrics", "Gynaecology", "Dentistry",
    "Dermatology", "ENT", "Eye", "Cardiology",
    "Orthopaedics", "Neurology", "Psychiatry", "Urology",
    "Surgery", "Lab / diagnostics"
  ];
  selectedSpecs: Record<string, boolean> = {};

  // Collab form state
  selectedCollab = 'Clinic or hospital partner';
  collabOptions: CollabOption[] = [
    {
      icon: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6",
      title: "Clinic or hospital partner",
      desc: "Bring your doctors and open slots to patients."
    },
    {
      icon: "M10.5 20.5 3.5 13.5a4.9 4.9 0 0 1 7-7l7 7a4.9 4.9 0 0 1-7 7zM8 8l8 8",
      title: "Pharmacy or lab",
      desc: "Take medicine orders and test bookings."
    },
    {
      icon: "M16 11a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0",
      title: "Doctor or specialist",
      desc: "Join as a consultant and fill your empty hours."
    },
    {
      icon: "M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z",
      title: "NGO or health campaign",
      desc: "Health camps, screenings and awareness drives."
    },
    {
      icon: "M3 7h18v13H3zM8 7V4h8v3M3 13h18",
      title: "Company or insurance",
      desc: "Employee health plans and corporate programmes."
    },
    {
      icon: "M8 9l-4 3 4 3M16 9l4 3-4 3M14 5l-4 14",
      title: "Tech, media or other",
      desc: "Integrations, sponsorships and new ideas."
    }
  ];

  cbOrg = '';
  cbPerson = '';
  cbPhone = '';
  cbEmail = '';
  cbNote = '';
  cbError = '';
  cbDone = false;
  cbFirstName = '';
  cbWaLink = '';

  constructor() {
    this.seo.updateTitle('Contact Us — PulseQ Pakistan');
    this.seo.updateMeta('Get in touch with PulseQ. Chat with PulseQ or list your clinic or collaborate with us.');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'collab') {
        this.activeTab = 'collab';
        if (typeof document !== 'undefined') {
          setTimeout(() => {
            document.getElementById('ctForms')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      }
    });
  }

  openAi() {
    this.pulseAi.open();
  }

  toggleSpec(spec: string): void {
    this.selectedSpecs[spec] = !this.selectedSpecs[spec];
  }

  private okPhone(p: string): boolean {
    const digits = p.replace(/[^0-9]/g, '');
    return digits.length >= 10 && digits.length <= 13;
  }

  submitClinic(e: Event): void {
    e.preventDefault();
    if (this.cfName.trim().length < 2 || this.cfCity.trim().length < 2) {
      this.cfError = 'Enter the clinic name and city.';
      return;
    }
    if (!(Number(this.cfDocs) >= 1)) {
      this.cfError = 'Enter how many doctors work at the clinic.';
      return;
    }
    if (!(Number(this.cfPts) >= 1)) {
      this.cfError = 'Enter roughly how many patients you see each day.';
      return;
    }
    if (this.cfPerson.trim().length < 2) {
      this.cfError = 'Enter the name of the person we should call.';
      return;
    }
    if (!this.okPhone(this.cfPhone)) {
      this.cfError = 'Enter a phone number with 10 to 13 digits.';
      return;
    }
    this.cfError = '';
    const sp = Object.keys(this.selectedSpecs).filter(k => this.selectedSpecs[k]).join(', ') || 'not listed';
    const msg = `PulseQ clinic listing request\n${this.cfType}: ${this.cfName}\nCity: ${this.cfCity}${this.cfArea ? ' (' + this.cfArea + ')' : ''}\nDoctors: ${this.cfDocs}\nPatients per day: ${this.cfPts}${this.cfBeds ? '\nBeds: ' + this.cfBeds : ''}\nSpecialities: ${sp}\nContact: ${this.cfPerson}, ${this.cfPhone}${this.cfNote ? '\nNote: ' + this.cfNote : ''}`;

    this.cfFirstName = this.cfPerson.trim().split(' ')[0];
    this.cfWaLink = `https://wa.me/923251714253?text=${encodeURIComponent(msg)}`;
    this.cfDone = true;
  }

  resetClinicForm(): void {
    this.cfDone = false;
    this.cfName = '';
    this.cfCity = '';
    this.cfArea = '';
    this.cfDocs = null;
    this.cfPts = null;
    this.cfBeds = null;
    this.cfPerson = '';
    this.cfPhone = '';
    this.cfNote = '';
    this.selectedSpecs = {};
  }

  submitCollab(e: Event): void {
    e.preventDefault();
    if (this.cbOrg.trim().length < 2 || this.cbPerson.trim().length < 2) {
      this.cbError = 'Enter your organisation and your name.';
      return;
    }
    if (!this.okPhone(this.cbPhone)) {
      this.cbError = 'Enter a phone number with 10 to 13 digits.';
      return;
    }
    if (this.cbNote.trim().length < 10) {
      this.cbError = 'Tell us a little about your idea.';
      return;
    }
    this.cbError = '';
    const msg = `PulseQ collaboration request\nType: ${this.selectedCollab}\nOrganisation: ${this.cbOrg}\nName: ${this.cbPerson}\nPhone: ${this.cbPhone}${this.cbEmail ? '\nEmail: ' + this.cbEmail : ''}\nIdea: ${this.cbNote}`;

    this.cbFirstName = this.cbPerson.trim().split(' ')[0];
    this.cbWaLink = `https://wa.me/923251714253?text=${encodeURIComponent(msg)}`;
    this.cbDone = true;
  }

  resetCollabForm(): void {
    this.cbDone = false;
    this.cbOrg = '';
    this.cbPerson = '';
    this.cbPhone = '';
    this.cbEmail = '';
    this.cbNote = '';
  }
}
