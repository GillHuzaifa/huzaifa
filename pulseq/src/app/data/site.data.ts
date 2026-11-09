import { SiteData } from '../shared/models';

export const SITE: SiteData = {
  patientsServed: null,
  reviews: [],
  news: [
    { tag: "Product", tint: 3, h: "PulseQ AI assists in Urdu and English", s: "Describe what is wrong in Urdu or English, see real free slots and confirm. PulseQ suggests a specialist and never diagnoses.", d: "Now live" },
    { tag: "Medicine", tint: 1, h: "Order medicine from partner pharmacies near you", s: "Pick your area, choose a single strip or a full pack, read side effects and precautions, and the pharmacy contacts you to deliver.", d: "Now live" },
    { tag: "Surgery", tint: 4, h: "Plan surgery with a price range up front", s: "Compare hospitals, meet your surgeon in a consultation first, and track every stage from request to follow-up.", d: "Now live" }
  ]
};
