import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClinicDashboardComponent } from '../../shared/components/clinic-dashboard/clinic-dashboard.component';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-clinics',
  standalone: true,
  imports: [RouterLink, ClinicDashboardComponent],
  template: `
    <section class="sec dk" id="clinics" style="padding-top:40px;min-height:75vh">
      <div class="wrap">
        <div style="display:flex;flex-wrap:wrap;gap:24px 56px;align-items:flex-end;justify-content:space-between;margin-bottom:44px">
          <div style="display:flex;flex-direction:column;gap:18px;max-width:640px">
            <span class="eyebrow">For hospitals and clinics <span class="ur" lang="ur">· کلینک کے لیے</span></span>
            <h2 style="font-size:clamp(29px,4.3vw,55px);color:var(--mint)">Fill the empty hours.</h2>
            <p class="muted" style="font-size:19px">List your hospital or clinic on PulseQ. Patients book your free slots, and your whole day sits on one dashboard.</p>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
            <a class="btn btn-mint" routerLink="/contact">List your clinic</a>
            <a routerLink="/contact" style="color:#fff;font-weight:700;text-decoration:none;padding:12px 8px">or talk to our team</a>
          </div>
        </div>
        <p class="muted" style="margin-bottom:18px;max-width:700px">
          This is a working demo. Check in a patient, add a walk-in, block a doctor, or list a new doctor in the Doctors tab. New doctors appear under Find doctors, and patient bookings land here.
        </p>

        <!-- Laptop Mockup with Working Clinic OS -->
        <app-clinic-dashboard></app-clinic-dashboard>

        <div class="feat">
          <div><span class="k">Live diary</span><h3>Your diary updates itself</h3><p class="muted">A slot booked online closes everywhere at once.</p></div>
          <div><span class="k">Arrivals</span><h3>Know who’s coming</h3><p class="muted">Names and times for the day, and who has checked in.</p></div>
          <div><span class="k">Walk-ins</span><h3>Add them in two taps</h3><p class="muted">Keep every doctor’s day in order, even on a busy evening.</p></div>
          <div><span class="k">Trust</span><h3>Listed after verification</h3><p class="muted">Every doctor and facility is checked before it goes live.</p></div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ClinicsComponent implements OnInit {
  seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setPage('For Hospitals & Clinics · PulseQ');
  }
}
