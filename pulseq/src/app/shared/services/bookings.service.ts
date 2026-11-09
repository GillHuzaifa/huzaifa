import { Injectable, signal, computed, inject, Signal } from '@angular/core';
import { Booking } from '../models';
import { StorageService } from './storage.service';

const KEY = 'pulseq.bookings';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private storage = inject(StorageService);

  bookings = signal<Booking[]>([]);

  nextAppointment: Signal<Booking | null> = computed<Booking | null>(() => {
    const list = this.bookings();
    const now = Date.now();
    let next: Booking | null = null;
    for (const b of list) {
      if (b.at && b.at + 45 * 60000 > now) {
        if (!next || (b.at < (next.at || 0))) {
          next = b;
        }
      }
    }
    return next;
  });

  constructor() {
    const loaded = this.storage.getItem<Booking[]>(KEY, []);
    this.bookings.set(Array.isArray(loaded) ? loaded : []);
  }

  isTaken(did: number, isoDate: string, time: string): boolean {
    const k = `${did}|${isoDate}|${time}`;
    return this.bookings().some(b => b.key === k);
  }

  addBooking(booking: Booking): void {
    const updated = [booking, ...this.bookings()];
    this.bookings.set(updated);
    this.storage.setItem(KEY, updated);
  }

  cancelBooking(code: string): boolean {
    const updated = this.bookings().filter(b => b.code !== code);
    this.bookings.set(updated);
    this.storage.setItem(KEY, updated);
    return true;
  }
}
