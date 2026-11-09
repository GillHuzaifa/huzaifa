import { Injectable, signal, inject } from '@angular/core';
import { Doctor, Place, Booking } from '../models';
import { DoctorsService } from './doctors.service';
import { BookingsService } from './bookings.service';
import { ToastService } from './toast.service';
import { HospitalsService } from './hospitals.service';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private doctorsService = inject(DoctorsService);
  private bookingsService = inject(BookingsService);
  private hospitalsService = inject(HospitalsService);
  private toastService = inject(ToastService);

  isOpen = signal<boolean>(false);
  isDone = signal<boolean>(false);
  selectedDocOrPlace = signal<Doctor | Place | null>(null);
  selectedDayOffset = signal<number>(0);
  selectedTime = signal<string>('');
  errorMessage = signal<string>('');
  lastConfirmed = signal<Booking | null>(null);

  openBooking(id: number | string, dayOffset?: number | null, time?: string): void {
    const d = this.doctorsService.getAnyPlaceOrDoctorById(id);
    if (!d) return;

    let day = (dayOffset != null && this.doctorsService.slots(d, dayOffset).length > 0) ? dayOffset : -1;
    if (day < 0) {
      for (let i = 0; i < 5; i++) {
        if (this.doctorsService.slots(d, i).length > 0) {
          day = i;
          break;
        }
      }
    }

    if (day < 0) {
      this.toastService.show("No free slots for this doctor this week");
      return;
    }

    const availableSlots = this.doctorsService.slots(d, day);
    const chosenTime = (time && availableSlots.includes(time)) ? time : availableSlots[0] || '';

    this.selectedDocOrPlace.set(d);
    this.selectedDayOffset.set(day);
    this.selectedTime.set(chosenTime);
    this.errorMessage.set('');
    this.isDone.set(false);
    this.isOpen.set(true);
  }

  selectDay(offset: number): void {
    const d = this.selectedDocOrPlace();
    if (!d) return;
    this.selectedDayOffset.set(offset);
    const available = this.doctorsService.slots(d, offset);
    if (!available.includes(this.selectedTime())) {
      this.selectedTime.set(available[0] || '');
    }
  }

  selectTime(time: string): void {
    this.selectedTime.set(time);
  }

  confirm(name: string, phone: string): boolean {
    const trimmedName = name.trim();
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (trimmedName.length < 2) {
      this.errorMessage.set("Enter the patient’s name.");
      return false;
    }
    if (cleanPhone.length < 10 || cleanPhone.length > 13) {
      this.errorMessage.set("Enter a mobile number with 10 to 13 digits.");
      return false;
    }
    const t = this.selectedTime();
    if (!t) {
      this.errorMessage.set("Choose a time.");
      return false;
    }

    const d = this.selectedDocOrPlace();
    if (!d) return false;

    const o = this.selectedDayOffset();
    const ch = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "PQ-";
    for (let i = 0; i < 5; i++) {
      code += ch[Math.floor(Math.random() * ch.length)];
    }

    const when = `${this.doctorsService.dayLabel(o)}, ${this.doctorsService.formatTime(t)}`;
    const at = this.doctorsService.dayDate(o);
    const [h, m] = t.split(':').map(Number);
    at.setHours(h, m, 0, 0);

    const hospital = this.hospitalsService.getHospitalById(d.h);
    const hospitalName = hospital ? hospital.name : d.h;

    const booking: Booking = {
      code,
      key: `${d.id}|${this.doctorsService.isoOf(o)}|${t}`,
      doctor: d.name,
      hospital: hospitalName,
      when,
      name: trimmedName,
      phone: cleanPhone,
      at: at.getTime()
    };

    this.bookingsService.addBooking(booking);
    this.lastConfirmed.set(booking);
    this.isDone.set(true);
    return true;
  }

  close(): void {
    this.isOpen.set(false);
    this.isDone.set(false);
    this.selectedDocOrPlace.set(null);
  }
}
