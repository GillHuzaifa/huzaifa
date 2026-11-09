export const SPEC: Record<string, string> = {
  general: "General Physician",
  heart: "Cardiologist",
  skin: "Dermatologist",
  child: "Paediatrician",
  eye: "Ophthalmologist",
  bones: "Orthopaedic Surgeon",
  neuro: "Neurologist",
  dental: "Dentist"
};

export const SPEC_PLURAL: Record<string, string> = {
  general: "General physicians",
  heart: "Cardiologists",
  skin: "Dermatologists",
  child: "Paediatricians",
  eye: "Ophthalmologists",
  bones: "Orthopaedic surgeons",
  neuro: "Neurologists",
  dental: "Dentists"
};

export const CITIES: string[] = ["Lahore", "Karachi", "Islamabad", "Rawalpindi"];

export const KW: [string, string[]][] = [
  ["child", ["child", "bacch", "bacha", "bache", "bachay", "bachi", "baby", "kid", "infant", "toddler", "newborn", "paediatric", "pediatric", "بچ", "بچہ", "بچے", "بچی", "اطفال"]],
  ["heart", ["heart", "cardio", "chest", "dil ", "dil$", "bp", "blood pressure", "palpitation", "seena", "دل", "سینے میں درد", "بلڈ پریشر"]],
  ["skin", ["skin", "dermat", "jild", "rash", "acne", "pimple", "hair fall", "itch", "khujli", "daane", "جلد", "خارش", "الرجی", "دانے"]],
  ["eye", ["eye", "ophthal", "aankh", "ankh", "vision", "nazar", "آنکھ", "آنکھوں", "نظر"]],
  ["bones", ["bone", "ortho", "haddi", "joint", "knee", "back pain", "backache", "kamar", "kamr", "shoulder", "fracture", "کمر", "گھٹن", "ہڈی", "جوڑ", "جوڑوں"]],
  ["neuro", ["migraine", "headache", "head ache", "sir dard", "sar dard", "numb", "seizure", "neuro", "سر درد", "سر میں درد", "دماغ"]],
  ["dental", ["tooth", "teeth", "dant", "gum", "dental", "dentist", "braces", "دانت", "دانتوں", "مسوڑھ"]],
  ["general", ["fever", "bukhar", "flu", "cough", "cold", "khansi", "body pain", "weakness", "sore throat", "general", "physician", "check-up", "checkup", "بخار", "کھانسی", "نزلہ", "زکام", "پیٹ میں درد"]]
];
