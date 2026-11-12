import { Procedure, Surgeon, SurgeryCategory } from '../shared/models';

export const SCATS: SurgeryCategory[] = [
  { k: "general", t: "General surgery", s: "Hernia, gallbladder, appendix", cls: "t2" },
  { k: "bones", t: "Bones and joints", s: "Knee, hip, ligament", cls: "t3" },
  { k: "heart", t: "Heart", s: "Bypass, valve replacement", cls: "t4" },
  { k: "eye", t: "Eyes", s: "Cataract, LASIK", cls: "t5" },
  { k: "women", t: "Women’s health", s: "Hysterectomy, caesarean", cls: "t1" },
  { k: "other", t: "ENT, kidney and dental", s: "Tonsils, stones, wisdom teeth", cls: "t2" }
];
export const PROCS: Procedure[] = [
  { id: 1, c: "heart", n: "Coronary bypass (CABG)", d: "Reroutes blood around blocked heart arteries.", stay: "7 to 10 days", rec: "6 to 12 weeks", lo: 900000, hi: 1600000 },
  { id: 2, c: "heart", n: "Heart valve replacement", d: "Replaces a damaged heart valve with a new one.", stay: "7 to 10 days", rec: "6 to 12 weeks", lo: 1100000, hi: 2000000 },
  { id: 3, c: "eye", n: "Cataract surgery (per eye)", d: "Replaces the clouded lens of the eye with a clear one.", stay: "Same day", rec: "1 to 2 weeks", lo: 60000, hi: 150000 },
  { id: 4, c: "eye", n: "LASIK laser eye surgery", d: "Reshapes the cornea to reduce the need for glasses.", stay: "Same day", rec: "1 to 3 days", lo: 120000, hi: 250000 },
  { id: 5, c: "bones", n: "Knee replacement", d: "Replaces a worn knee joint with an artificial one.", stay: "3 to 5 days", rec: "6 to 12 weeks", lo: 500000, hi: 1100000 },
  { id: 6, c: "bones", n: "Hip replacement", d: "Replaces a damaged hip joint with an artificial one.", stay: "3 to 5 days", rec: "6 to 12 weeks", lo: 600000, hi: 1300000 },
  { id: 7, c: "bones", n: "ACL ligament reconstruction", d: "Repairs a torn knee ligament, often after a sports injury.", stay: "1 to 2 days", rec: "4 to 6 months for sport", lo: 300000, hi: 600000 },
  { id: 8, c: "general", n: "Hernia repair", d: "Repairs a bulge where tissue pushes through a weak spot.", stay: "Same day to 1 day", rec: "1 to 3 weeks", lo: 120000, hi: 260000 },
  { id: 9, c: "general", n: "Gallbladder removal (keyhole)", d: "Removes the gallbladder through small cuts.", stay: "1 to 2 days", rec: "1 to 2 weeks", lo: 180000, hi: 350000 },
  { id: 10, c: "general", n: "Appendix removal", d: "Removes an inflamed appendix.", stay: "1 to 2 days", rec: "1 to 3 weeks", lo: 150000, hi: 300000 },
  { id: 11, c: "women", n: "Hysterectomy", d: "Removes the womb for a medical reason.", stay: "2 to 4 days", rec: "4 to 6 weeks", lo: 250000, hi: 550000 },
  { id: 12, c: "women", n: "Planned caesarean birth", d: "A scheduled surgical delivery.", stay: "2 to 4 days", rec: "4 to 6 weeks", lo: 150000, hi: 350000 },
  { id: 13, c: "other", n: "Tonsil removal", d: "Removes the tonsils after repeated infection.", stay: "Same day to 1 day", rec: "1 to 2 weeks", lo: 80000, hi: 180000 },
  { id: 14, c: "other", n: "Kidney stone removal", d: "Removes or breaks up stones in the kidney or ureter.", stay: "1 to 2 days", rec: "1 to 2 weeks", lo: 150000, hi: 400000 },
  { id: 15, c: "other", n: "Wisdom tooth removal", d: "Removes impacted wisdom teeth.", stay: "Same day", rec: "3 to 7 days", lo: 15000, hi: 45000 }
];

export const SINC = [
  "Surgeon’s fee",
  "Hospital stay and operating theatre",
  "Anaesthesia",
  "Standard tests before surgery",
  "Follow-up visits after surgery"
];

export const HF: Record<string, number> = {
  crescent: 1.1,
  riverside: 1,
  lakeview: 0.95,
  meridian: 0.9,
  northgate: 1.05,
  sunrise: 1
};

export const SURGS: Surgeon[] = [
  { id: 1, n: "Dr. Tariq Mehmood", t: "Cardiac Surgeon", h: "crescent", x: 21, p: [1, 2], fee: 4000, c: "heart", tint: 1 },
  { id: 2, n: "Dr. Usman Farooq", t: "Orthopaedic Surgeon", h: "northgate", x: 16, p: [5, 6, 7], fee: 3500, c: "bones", tint: 3 },
  { id: 3, n: "Dr. Salman Raza", t: "General and Keyhole Surgeon", h: "northgate", x: 13, p: [8, 9, 10], fee: 2500, c: "general", tint: 2 },
  { id: 4, n: "Dr. Adeel Hussain", t: "General Surgeon", h: "riverside", x: 18, p: [8, 9, 10], fee: 2500, c: "general", tint: 4 },
  { id: 5, n: "Dr. Rabia Naseem", t: "Urologist", h: "riverside", x: 11, p: [14], fee: 3000, c: "other", tint: 5 },
  { id: 6, n: "Dr. Saima Javed", t: "Gynaecologist and Surgeon", h: "riverside", x: 15, p: [11, 12], fee: 3000, c: "women", tint: 2 },
  { id: 7, n: "Dr. Mariam Siddiqui", t: "Eye Surgeon", h: "sunrise", x: 14, p: [3, 4], fee: 2200, c: "eye", tint: 5 },
  { id: 8, n: "Dr. Faisal Qadir", t: "Cataract and Laser Eye Surgeon", h: "sunrise", x: 19, p: [3, 4], fee: 2800, c: "eye", tint: 1 },
  { id: 9, n: "Dr. Hira Latif", t: "ENT Surgeon", h: "lakeview", x: 10, p: [13], fee: 2000, c: "other", tint: 4 },
  { id: 10, n: "Dr. Anum Rauf", t: "Oral and Maxillofacial Surgeon", h: "meridian", x: 9, p: [15], fee: 1800, c: "other", tint: 3 }
];
