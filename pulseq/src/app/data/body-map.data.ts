import { BodyMapArea } from '../shared/models';

export const BM_AREAS: BodyMapArea[] = [
  { k: "neuro", label: "Head & nerves", x: 100, y: 26, why: ["Migraine", "Dizziness", "Numbness", "Memory"] },
  { k: "eye", label: "Eyes", x: 152, y: 42, why: ["Blurry vision", "Red eyes", "Eye pain", "Cataract"] },
  { k: "dental", label: "Teeth & gums", x: 48, y: 56, why: ["Toothache", "Bleeding gums", "Braces", "Sensitivity"] },
  { k: "heart", label: "Heart & chest", x: 116, y: 122, why: ["Chest pain", "Palpitations", "Blood pressure", "Breathlessness"] },
  { k: "general", label: "Stomach & fever", x: 100, y: 192, why: ["Fever", "Stomach ache", "Cough and flu", "Tiredness"] },
  { k: "skin", label: "Skin & hair", x: 32, y: 160, why: ["Rash", "Acne", "Hair fall", "Allergy"] },
  { k: "bones", label: "Bones & joints", x: 121, y: 334, why: ["Back pain", "Knee pain", "Joint swelling", "Sports injury"] }
];

export const BM_CHILD: BodyMapArea = {
  k: "child",
  label: "For a child",
  why: ["Fever", "Vaccination", "Growth", "Cough"]
};
