import { Doctor, Place } from '../shared/models';
import { HOSP } from './hospitals.data';

export const DEGS: Record<string, string[]> = {
  general: ["MBBS", "MCPS (Family Medicine)"],
  heart: ["MBBS", "FCPS (Cardiology)"],
  skin: ["MBBS", "FCPS (Dermatology)"],
  child: ["MBBS", "FCPS (Paediatrics)"],
  eye: ["MBBS", "FCPS (Ophthalmology)"],
  bones: ["MBBS", "FCPS (Orthopaedic Surgery)"],
  neuro: ["MBBS", "FCPS (Neurology)"],
  dental: ["BDS", "RDS"]
};

export const FOCUS: Record<string, string[]> = {
  general: ["Fever", "Stomach ache", "Cough and flu", "Tiredness"],
  heart: ["Chest pain", "Palpitations", "Blood pressure", "Breathlessness"],
  skin: ["Rash", "Acne", "Hair fall", "Allergy"],
  child: ["Fever", "Vaccination", "Growth", "Cough"],
  eye: ["Blurry vision", "Red eyes", "Eye pain", "Cataract"],
  bones: ["Back pain", "Knee pain", "Joint swelling", "Sports injury"],
  neuro: ["Migraine", "Dizziness", "Numbness", "Memory"],
  dental: ["Toothache", "Bleeding gums", "Braces", "Sensitivity"]
};

export const DAYSETS: number[][] = [
  [1, 2, 3, 4, 5, 6],
  [1, 2, 3, 4, 5],
  [2, 3, 4, 5, 6]
];

export const RAW_DOCS: Doctor[] = [
  { id: 1, name: "Dr. Ayesha Rahman", spec: "heart", h: "crescent", fee: 3000, mode: "In clinic", t: 1, times: ["09:00", "10:00", "11:30", "16:30", "18:00", "19:00"] },
  { id: 2, name: "Dr. Hamza Qureshi", spec: "general", h: "riverside", fee: 1500, mode: "In clinic or video", t: 2, times: ["10:00", "12:00", "17:30", "18:30", "19:00", "20:00"] },
  { id: 3, name: "Dr. Sana Malik", spec: "skin", h: "meridian", fee: 2500, mode: "In clinic", t: 3, times: ["11:00", "13:30", "17:00", "18:00", "19:00", "20:30"] },
  { id: 4, name: "Dr. Bilal Chaudhry", spec: "child", h: "lakeview", fee: 2000, mode: "Video available", t: 4, times: ["09:30", "11:00", "17:00", "18:00", "19:30"] },
  { id: 5, name: "Dr. Mariam Siddiqui", spec: "eye", h: "sunrise", fee: 2200, mode: "In clinic", t: 5, times: ["10:30", "12:00", "16:00", "17:30", "18:30"] },
  { id: 6, name: "Dr. Usman Farooq", spec: "bones", h: "northgate", fee: 3500, mode: "In clinic", t: 1, times: ["10:00", "11:30", "16:30", "18:00", "20:00"] },
  { id: 7, name: "Dr. Hina Tariq", spec: "skin", h: "riverside", fee: 2000, mode: "In clinic or video", t: 2, times: ["09:00", "15:30", "17:00", "18:30", "19:30"] },
  { id: 8, name: "Dr. Kamran Ali", spec: "heart", h: "northgate", fee: 3200, mode: "In clinic", t: 3, times: ["09:00", "14:00", "17:00", "18:30", "20:00"] },
  { id: 9, name: "Dr. Imran Sheikh", spec: "neuro", h: "northgate", fee: 3000, mode: "In clinic", t: 4, times: ["10:00", "12:30", "17:00", "18:00", "19:00"] },
  { id: 10, name: "Dr. Zoya Anwar", spec: "dental", h: "meridian", fee: 1800, mode: "In clinic", t: 5, times: ["10:00", "11:30", "16:00", "17:30", "19:00"] },
  { id: 11, name: "Dr. Nadia Zafar", spec: "general", h: "riverside", fee: 1500, mode: "In clinic", t: 1, times: ["09:30", "11:00", "15:00", "16:30", "18:00", "21:00"] },
  { id: 101, name: "Dr. Hamza Ahmed", spec: "general", h: "cfc", fee: 1500, mode: "In clinic", t: 2, times: ["16:30", "17:30", "18:00", "19:00", "20:00"] },
  { id: 102, name: "Dr. Sana Khalid", spec: "skin", h: "cfc", fee: 2000, mode: "In clinic", t: 3, times: ["17:00", "18:00", "19:30", "20:30"] },
  { id: 103, name: "Dr. Bilal Raza", spec: "child", h: "cfc", fee: 1800, mode: "In clinic", t: 4, times: ["16:00", "18:30", "19:00", "20:00"] },
  { id: 104, name: "Dr. Mariam Noor", spec: "eye", h: "cfc", fee: 2200, mode: "In clinic", t: 5, times: ["17:00", "18:00", "19:00"] }
];

export function enrichDoctor(d: Doctor): Doctor {
  if (d.deg) return d;
  const f = FOCUS[d.spec];
  d.deg = DEGS[d.spec] || ["MBBS"];
  d.exp = d.exp || (7 + (d.id * 5) % 17);
  d.lang = d.lang || (d.id % 3 === 0 ? ["Urdu", "English", "Punjabi"] : d.id % 3 === 1 ? ["Urdu", "English"] : ["Urdu", "English", "Pashto"]);
  d.focus = d.focus || (f ? [...f] : []);
  d.about = d.about || `${d.name} is a ${d.spec} with ${d.exp} years of experience. Patients usually see the doctor for ${f ? f.slice(0, 3).join(", ").toLowerCase() : "routine care"} and follow-up visits.`;
  d.days = d.days || DAYSETS[d.id % 3];
  return d;
}

export function buildLocations(docs: Doctor[]): Place[] {
  const locs: Place[] = [];
  const hMap = new Map(HOSP.map(h => [h.id, h]));
  docs.forEach(d => {
    enrichDoctor(d);
    if (d.id < 200 && d.id % 3 === 1) {
      const currentHosp = hMap.get(d.h);
      if (currentHosp) {
        const o = HOSP.find(x => x.city === currentHosp.city && x.id !== d.h);
        if (o) {
          locs.push({
            id: d.id * 100 + 1,
            base: d.id,
            name: d.name,
            spec: d.spec,
            h: o.id,
            fee: Math.max(800, d.fee - (d.id % 2 ? 200 : 0) + (d.id % 2 ? 0 : 300)),
            mode: "In clinic",
            t: d.t,
            times: ["10:00", "11:00", "12:00", "13:00"],
            days: [2, 4]
          });
        }
      }
    }
  });
  return locs;
}

export const INITIAL_DOCS: Doctor[] = RAW_DOCS.map(d => enrichDoctor({ ...d }));
export const INITIAL_LOCS: Place[] = buildLocations(INITIAL_DOCS);
