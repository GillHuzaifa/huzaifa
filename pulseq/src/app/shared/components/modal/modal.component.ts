import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../services/modal.service';
import { DoctorsService } from '../../services/doctors.service';
import { HospitalsService } from '../../services/hospitals.service';
import { SPEC } from '../../../data/specialties.data';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (modal.isOpen()) {
      <div class="modal" (click)="onBackdrop($event)">
        <div class="panel" role="dialog" aria-modal="true" aria-labelledby="mTitle" tabindex="-1">
          @if (!modal.isDone()) {
            @if (modal.selectedDocOrPlace(); as d) {
              <div style="display:flex;flex-direction:column;gap:18px">
                <div class="panel-head">
                  <div class="avatar t{{ d.t }}">{{ getInitials(d.name) }}</div>
                  <div class="min0">
                    <h3 id="mTitle" style="font-size:24px">Book</h3>
                    <p class="muted sm">
                      {{ getSpec(d.spec) }} · {{ getHospName(d.h) }} · Rs {{ d.fee.toLocaleString('en-US') }}
                    </p>
                  </div>
                  <button class="icon-btn x" (click)="modal.close()" aria-label="Close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18"></path>
                    </svg>
                  </button>
                </div>

                <div>
                  <span class="lbl">Day</span>
                  <div class="chips">
                    @for (o of [0, 1, 2, 3, 4]; track o) {
                      @let n = doctorsService.slots(d, o).length;
                      <button
                        class="chip"
                        [class.on]="modal.selectedDayOffset() === o"
                        [disabled]="n === 0"
                        [attr.aria-pressed]="modal.selectedDayOffset() === o"
                        (click)="modal.selectDay(o)">
                        {{ doctorsService.dayLabel(o) }}
                      </button>
                    }
                  </div>
                </div>

                <div>
                  <span class="lbl">Time</span>
                  <div class="chips">
                    @for (t of doctorsService.slots(d, modal.selectedDayOffset()); track t) {
                      <button
                        class="chip"
                        [class.on]="modal.selectedTime() === t"
                        [attr.aria-pressed]="modal.selectedTime() === t"
                        (click)="modal.selectTime(t)">
                        {{ doctorsService.formatTime(t) }}
                      </button>
                    }
                  </div>
                </div>

                <div>
                  <label class="lbl" for="pName">Patient name</label>
                  <input class="inp" id="pName" type="text" [(ngModel)]="patientName" autocomplete="name">
                </div>

                <div>
                  <label class="lbl" for="pPhone">Mobile number</label>
                  <input class="inp" id="pPhone" type="tel" inputmode="tel" placeholder="03xx xxxxxxx" [(ngModel)]="patientPhone" autocomplete="tel">
                </div>

                <p class="err" role="alert">{{ modal.errorMessage() }}</p>

                <button class="btn btn-coral full" (click)="submit()">Confirm appointment</button>
              </div>
            }
          } @else {
            @if (modal.lastConfirmed(); as b) {
              <div style="display:flex;flex-direction:column;gap:16px">
                <div style="display:flex;align-items:center;gap:12px">
                  <span style="width:48px;height:48px;border-radius:50%;background:var(--mint);display:flex;align-items:center;justify-content:center;flex:none">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#102A43" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5"></path>
                    </svg>
                  </span>
                  <h3 style="font-size:28px">You’re booked</h3>
                </div>

                <div class="bk">
                  <span class="muted xs">Booking code</span>
                  <code>{{ b.code }}</code>
                  <p style="font-weight:700">{{ b.when }} with {{ b.doctor }}</p>
                  <p class="sm">{{ b.hospital }} · for {{ b.name }}</p>
                </div>

                <p class="muted sm">Get your appointment number on WhatsApp, and show your code at the desk when you arrive. Demo note: appointments here are saved in this browser only.</p>

                <a class="btn btn-coral full" target="_blank" rel="noopener" [href]="getWaLink(b)">Get your appointment number on WhatsApp</a>
                <button class="btn btn-ink full" (click)="modal.close()">Done</button>
              </div>
            }
          }
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  modal = inject(ModalService);
  doctorsService = inject(DoctorsService);
  hospitalsService = inject(HospitalsService);

  patientName = '';
  patientPhone = '';

  getInitials(name: string): string {
    return name.replace('Dr. ', '').split(' ').map(w => w[0]).slice(0, 2).join('');
  }

  getSpec(specKey: string): string {
    return SPEC[specKey] || specKey;
  }

  getHospName(hospId: string): string {
    const h = this.hospitalsService.getHospitalById(hospId);
    return h ? h.name : hospId;
  }

  getWaLink(b: any): string {
    const text = `Hello PulseQ, please send my appointment number.\nCode: ${b.code}\nDoctor: ${b.doctor}, ${b.hospital}\nWhen: ${b.when}\nPatient: ${b.name} (${b.phone})`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  onBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.modal.close();
    }
  }

  submit(): void {
    const success = this.modal.confirm(this.patientName, this.patientPhone);
    if (success) {
      this.patientName = '';
      this.patientPhone = '';
    }
  }
}
