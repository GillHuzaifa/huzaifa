import { ClinicState } from '../shared/models';

export const INITIAL_CLINIC_STATE: ClinicState = {
  tab: "today",
  q: "",
  walk: false,
  add: false,
  err: "",
  n: 0,
  done: { s1: "16:27", s2: "16:57" },
  blocked: { 104: true },
  appts: [
    { id: "s1", time: "16:30", doc: 101, patient: "Demo patient 01", note: "Check-up", src: "seed" },
    { id: "s2", time: "17:00", doc: 102, patient: "Demo patient 02", note: "Skin follow-up", src: "seed" },
    { id: "s3", time: "18:00", doc: 101, patient: "Demo patient 03", note: "Follow-up", src: "seed" },
    { id: "s4", time: "18:00", doc: 102, patient: "Demo patient 04", note: "New patient", src: "seed" },
    { id: "s5", time: "19:00", doc: 101, patient: "Demo patient 05", note: "Check-up", src: "seed" },
    { id: "s6", time: "19:30", doc: 102, patient: "Demo patient 06", note: "New patient", src: "seed" },
    { id: "s7", time: "20:00", doc: 101, patient: "Demo patient 07", note: "Walk-in", src: "walkin" }
  ]
};

export const CLINIC_RAIL: [string, string, string][] = [
  ["today", "Today", '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path></svg>'],
  ["schedule", "Schedule", '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg>'],
  ["patients", "Patients", '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"></circle><path d="M2.5 20a6.5 6.5 0 0 1 13 0"></path></svg>'],
  ["doctors", "Doctors", '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v3a4 4 0 0 0 8 0v-2"></path><circle cx="18" cy="12" r="2"></circle></svg>'],
  ["billing", "Billing", '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="3"></rect><path d="M3 10h18"></path></svg>']
];
