import { Pharmacy } from '../shared/models';

export const SHOPS: Pharmacy[] = [
  { id: 1, n: "Shifa Care Pharmacy", a: "PWD", c: "Islamabad", h: "9 AM – 1 AM", fee: 100, wa: "" },
  { id: 2, n: "Green Cross Medico", a: "PWD", c: "Islamabad", h: "Open 24 hours", fee: 150, wa: "" },
  { id: 3, n: "MediPoint Pharmacy", a: "G-11", c: "Islamabad", h: "9 AM – 12 AM", fee: 120, wa: "" },
  { id: 4, n: "Wellness Corner Pharmacy", a: "F-10", c: "Islamabad", h: "Open 24 hours", fee: 150, wa: "" },
  { id: 5, n: "Al-Noor Pharmacy", a: "Bahria Town", c: "Rawalpindi", h: "10 AM – 12 AM", fee: 150, wa: "" },
  { id: 6, n: "City Health Pharmacy", a: "Saddar", c: "Rawalpindi", h: "9 AM – 11 PM", fee: 100, wa: "" },
  { id: 7, n: "Gulberg Care Pharmacy", a: "Gulberg", c: "Lahore", h: "Open 24 hours", fee: 150, wa: "" },
  { id: 8, n: "Johar Town Medico", a: "Johar Town", c: "Lahore", h: "9 AM – 1 AM", fee: 120, wa: "" }
];

export const AREAS: Record<string, [number, number]> = {
  "PWD": [33.5665, 73.1380],
  "G-11": [33.6690, 72.9980],
  "F-10": [33.6938, 73.0100],
  "Bahria Town": [33.5136, 73.1086],
  "Saddar": [33.5973, 73.0479],
  "Gulberg": [31.5204, 74.3587],
  "Johar Town": [31.4697, 74.2728]
};
