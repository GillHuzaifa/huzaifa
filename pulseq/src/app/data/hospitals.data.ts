import { Hospital } from '../shared/models';

export const HOSP: Hospital[] = [
  { id: "crescent", name: "Crescent Heart Institute", city: "Lahore", depts: "Cardiology · Cardiac surgery · Rehab", badge: "Emergency 24/7", t: 1 },
  { id: "riverside", name: "Riverside Medical Centre", city: "Lahore", depts: "General medicine · Skin · Family care", badge: "", t: 2 },
  { id: "lakeview", name: "Lakeview Children’s Hospital", city: "Islamabad", depts: "Paediatrics · Newborn care · Vaccination", badge: "", t: 4 },
  { id: "meridian", name: "Meridian Skin and Laser Clinic", city: "Islamabad", depts: "Dermatology · Laser · Dental", badge: "", t: 3 },
  { id: "northgate", name: "Northgate General Hospital", city: "Karachi", depts: "Orthopaedics · Neurology · Cardiology", badge: "Emergency 24/7", t: 3 },
  { id: "sunrise", name: "Sunrise Eye Care", city: "Rawalpindi", depts: "Cataract · Retina · Laser vision", badge: "", t: 5 },
  { id: "cfc", name: "Crescent Family Clinic", city: "Lahore", depts: "Family medicine · Skin · Children · Eye", badge: "", t: 2 }
];

export const DEPTS: [string, string][] = [
  ["Cardiology", "cardio"],
  ["Paediatrics", "paed|child|newborn"],
  ["Dermatology", "skin|derm|laser"],
  ["Orthopaedics", "orthop|bone"],
  ["Neurology", "neuro"],
  ["Eye care", "eye|cataract|retina"],
  ["Dental", "dental"],
  ["Family medicine", "family|general"]
];
