import { Injectable, signal } from '@angular/core';

export interface PatientReview {
  w: number; // Wait time (1-5)
  l: number; // Listening (1-5)
  c: number; // Clear advice (1-5)
  t: string; // Review comment
  n: string; // Patient name or "Patient A."
  sample?: boolean;
  ver?: boolean;
}

export interface ReviewStats {
  w: number;
  l: number;
  c: number;
  avg: number;
  n: number;
  list: PatientReview[];
}

const REVSAMPLE: [number, number, number, string][] = [
  [5, 5, 5, 'Short wait and the doctor explained everything clearly.'],
  [5, 4, 5, 'Booked in under a minute and was seen on time.'],
  [3, 5, 4, 'Listened properly and gave me enough time. Clinic was a little busy.'],
  [4, 5, 5, 'Very polite and patient with my questions.'],
  [4, 4, 4, 'Good consultation. The booking code made check-in easy.'],
  [2, 4, 4, 'Good doctor but I waited about 20 minutes.'],
  [5, 4, 5, 'Clear advice and a simple follow-up plan.'],
  [4, 5, 4, 'Helpful with my parents, who needed extra time.']
];

const HREVSAMPLE: [number, number, number, string][] = [
  [5, 5, 4, 'Clean wards and very helpful reception staff.'],
  [4, 5, 5, 'Smooth admission process and attentive nurses.'],
  [4, 4, 5, 'Good facilities, doctors were on time.'],
  [5, 4, 4, 'Clean diagnostic centre, reports delivered on WhatsApp.']
];

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private localDocReviews = signal<Record<number, PatientReview[]>>({});
  private localHospReviews = signal<Record<string, PatientReview[]>>({});

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem('pq.reviews');
      if (stored) {
        const list = JSON.parse(stored);
        const map: Record<number, PatientReview[]> = {};
        for (const r of list) {
          const docId = +r.doc;
          if (!map[docId]) map[docId] = [];
          map[docId].push({
            w: r.w,
            l: r.l,
            c: r.c,
            t: r.t,
            n: r.n || 'Patient',
            ver: r.ver !== false
          });
        }
        this.localDocReviews.set(map);
      }
    } catch (_) {}

    try {
      const storedH = localStorage.getItem('pq.hreviews');
      if (storedH) {
        const listH = JSON.parse(storedH);
        const mapH: Record<string, PatientReview[]> = {};
        for (const r of listH) {
          const hid = String(r.hosp);
          if (!mapH[hid]) mapH[hid] = [];
          mapH[hid].push({
            w: r.w,
            l: r.l,
            c: r.c,
            t: r.t,
            n: r.n || 'Patient',
            ver: r.ver !== false
          });
        }
        this.localHospReviews.set(mapH);
      }
    } catch (_) {}
  }

  getDocReviews(id: number): PatientReview[] {
    const out: PatientReview[] = [];
    const count = 3 + (id % 3);
    for (let i = 0; i < count; i++) {
      const sample = REVSAMPLE[(id * 3 + i * 5) % REVSAMPLE.length];
      out.push({
        w: sample[0],
        l: sample[1],
        c: sample[2],
        t: sample[3],
        n: 'Patient ' + String.fromCharCode(65 + ((id + i) % 26)) + '.',
        sample: true
      });
    }

    const locals = this.localDocReviews()[id] || [];
    return [...locals, ...out];
  }

  getDocStats(id: number): ReviewStats {
    const list = this.getDocReviews(id);
    let tw = 0, tl = 0, tc = 0;
    list.forEach(r => {
      tw += r.w;
      tl += r.l;
      tc += r.c;
    });
    const n = list.length || 1;
    const w = tw / n;
    const l = tl / n;
    const c = tc / n;
    const avg = (w + l + c) / 3;
    return { w, l, c, avg, n: list.length, list };
  }

  getHospReviews(id: string): PatientReview[] {
    const out: PatientReview[] = [];
    const numericId = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = 3 + (numericId % 2);
    for (let i = 0; i < count; i++) {
      const sample = HREVSAMPLE[(numericId + i) % HREVSAMPLE.length];
      out.push({
        w: sample[0],
        l: sample[1],
        c: sample[2],
        t: sample[3],
        n: 'Patient ' + String.fromCharCode(65 + ((numericId + i) % 26)) + '.',
        sample: true
      });
    }
    const locals = this.localHospReviews()[id] || [];
    return [...locals, ...out];
  }

  getHospStats(id: string): ReviewStats {
    const list = this.getHospReviews(id);
    let tw = 0, tl = 0, tc = 0;
    list.forEach(r => {
      tw += r.w;
      tl += r.l;
      tc += r.c;
    });
    const n = list.length || 1;
    const w = tw / n;
    const l = tl / n;
    const c = tc / n;
    const avg = (w + l + c) / 3;
    return { w, l, c, avg, n: list.length, list };
  }

  addDocReview(docId: number, review: { w: number; l: number; c: number; t: string; n?: string }) {
    const current = this.localDocReviews();
    const docList = current[docId] ? [...current[docId]] : [];
    const newRev: PatientReview = {
      w: review.w,
      l: review.l,
      c: review.c,
      t: review.t || 'Good consultation and professional care.',
      n: review.n || 'Patient',
      ver: true
    };
    docList.unshift(newRev);
    this.localDocReviews.set({ ...current, [docId]: docList });

    if (typeof localStorage !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('pq.reviews') || '[]');
        stored.unshift({ doc: docId, ...newRev });
        localStorage.setItem('pq.reviews', JSON.stringify(stored));
      } catch (_) {}
    }
  }

  addHospReview(hospId: string, review: { w: number; l: number; c: number; t: string; n?: string }) {
    const current = this.localHospReviews();
    const hospList = current[hospId] ? [...current[hospId]] : [];
    const newRev: PatientReview = {
      w: review.w,
      l: review.l,
      c: review.c,
      t: review.t || 'Clean facility and polite staff.',
      n: review.n || 'Patient',
      ver: true
    };
    hospList.unshift(newRev);
    this.localHospReviews.set({ ...current, [hospId]: hospList });

    if (typeof localStorage !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('pq.hreviews') || '[]');
        stored.unshift({ hosp: hospId, ...newRev });
        localStorage.setItem('pq.hreviews', JSON.stringify(stored));
      } catch (_) {}
    }
  }

  mood(avg: number): string {
    if (avg >= 4.5) return 'Exceptional care';
    if (avg >= 4.0) return 'Highly rated by patients';
    if (avg >= 3.5) return 'Well reviewed';
    return 'Reviewed by patients';
  }
}
