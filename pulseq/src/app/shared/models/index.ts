export type SpecialtyKey =
  | 'general'
  | 'heart'
  | 'skin'
  | 'child'
  | 'eye'
  | 'bones'
  | 'neuro'
  | 'dental';

export interface Doctor {
  id: number;
  name: string;
  spec: SpecialtyKey | string;
  h: string;
  fee: number;
  mode: string;
  t: number;
  times: string[];
  deg?: string[];
  exp?: number;
  lang?: string[];
  focus?: string[];
  about?: string;
  days?: number[];
  photo?: string;
  off?: boolean;
  reg?: string;
}

export interface Place {
  id: number;
  base?: number;
  name: string;
  spec: string;
  h: string;
  fee: number;
  mode: string;
  t: number;
  times: string[];
  days?: number[];
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  depts: string;
  badge: string;
  t: number;
  photo?: string;
}

export interface Slot {
  o: number; // Day offset (0 = Today, 1 = Tomorrow, ...)
  t: string; // Time (e.g. "10:00")
}

export interface Booking {
  code: string;
  key: string; // "did|iso|time"
  doctor: string;
  hospital: string;
  when: string;
  name: string;
  phone: string;
  at?: number; // timestamp
}

export interface Medicine {
  id: number;
  n: string; // Name
  f: string; // Form: Tablet, Capsule, Syrup, Cream, Sachet, Lozenge, Inhaler
  c: string; // Category key (pain, cold, stomach, antibiotic, skin, vitamin)
  g: string; // Generic / Active ingredient
  u: string; // Usage description
  w: string; // Warning / Good to know
  rx: number; // 1 if prescription required, 0 if OTC
  s: string[]; // Side effects
  p: string[]; // Precautions
}

export interface NeedCategory {
  k: string;
  t: string;
  s: string;
  cls: string;
  spec: string;
  flag: string;
}

export interface Pharmacy {
  id: number;
  n: string;
  a: string; // Area
  c: string; // City
  h: string; // Hours
  fee: number; // Delivery fee
  wa: string;
}

export interface MedicineOrder {
  code: string;
  shop: string;
  items: string;
  phone: string;
}

export interface SurgeryCategory {
  k: string;
  t: string;
  s: string;
  cls: string;
}

export interface Procedure {
  id: number;
  c: string;
  n: string;
  d: string;
  stay: string;
  rec: string;
  lo: number;
  hi: number;
}

export interface Surgeon {
  id: number;
  n: string;
  t: string;
  h: string;
  x: number;
  p: number[];
  fee: number;
  c: string;
  tint: number;
}

export interface SurgeryRequest {
  code: string;
  doctor: string;
  hospital: string;
  proc: string;
  when: string;
  name: string;
  phone: string;
  stage: number;
}

export interface BodyMapArea {
  k: string;
  label: string;
  x?: number;
  y?: number;
  why: string[];
}

export interface AboutDirector {
  role: string;
  short: string;
  name: string;
  ini: string;
  bio: string;
  photo?: string;
}

export interface AboutCrewMember {
  name: string;
  role: string;
  ini?: string;
  photo?: string;
}

export interface AboutCrewGroup {
  dept?: string;
  people: AboutCrewMember[];
}

export interface AboutData {
  story: [string, string][];
  values: [string, string, string][];
  team: AboutDirector[];
  crew?: AboutCrewGroup[];
}

export interface PrivacySection {
  title: string;
  content: string[];
}

export interface PrivacyData {
  updated: string;
  contact: string;
  sum: [string, string][];
  secs: [string, string[]][];
}

export interface TermsData {
  updated: string;
  secs: [string, string[]][];
}

export interface ContactConfig {
  wa: string;
  email: string;
  phone: string;
  hours: string;
}

export interface ClinicAppt {
  id: string;
  time: string;
  doc: number;
  patient: string;
  note: string;
  src: 'seed' | 'walkin' | 'online';
  date?: string;
  phone?: string;
  code?: string;
}

export interface ClinicState {
  tab: string;
  q: string;
  walk: boolean;
  add: boolean;
  err: string;
  n: number;
  done: Record<string, string>;
  blocked: Record<number, boolean>;
  appts: ClinicAppt[];
}

export interface SiteNews {
  tag: string;
  tint: number;
  h: string;
  s: string;
  d: string;
}

export interface SiteReview {
  q: string;
  n: string;
  c: string;
  photo?: string;
}

export interface SiteData {
  patientsServed: number | null;
  reviews: SiteReview[];
  news: SiteNews[];
}
