import { Medicine, NeedCategory } from '../shared/models';

export const EXTRA: Record<number, { s: string[]; p: string[] }> = {
  1: { s: ["Rare at normal amounts", "Skin rash or allergic reaction in a few people", "Too much can seriously damage the liver"], p: ["Never go over the amount on the label", "Check cold and flu products, many also contain paracetamol", "Ask a doctor first if you have liver disease or drink alcohol regularly", "Ask a doctor in pregnancy"] },
  2: { s: ["Rare at the right amount", "Allergic rash in a few children", "Too much can damage the liver"], p: ["Give by your child’s weight or age as the label says", "Use the measure supplied, not a kitchen spoon", "Do not give with other paracetamol products", "Ask a doctor first for babies under 3 months"] },
  3: { s: ["Stomach upset, heartburn, nausea", "Dizziness or headache", "Rarely stomach bleeding, higher blood pressure or kidney problems"], p: ["Take with food and use for the shortest time", "Avoid with stomach ulcers, kidney or heart disease, or asthma that flares with painkillers", "Do not combine with other anti-inflammatory painkillers", "Ask a doctor if you take blood thinners, and avoid in late pregnancy"] },
  4: { s: ["Drowsiness and tiredness", "Dry mouth", "Headache"], p: ["Avoid alcohol and be careful when driving", "Ask a doctor first if you have kidney disease", "Ask a doctor in pregnancy or breastfeeding", "Children: use only the amount for their age on the label"] },
  5: { s: ["Mild mouth irritation or tingling", "Rarely an allergic reaction"], p: ["Check the age limit on the pack", "Do not use more often than the label says", "Some contain sugar, so check if you have diabetes", "See a doctor if a sore throat lasts more than a few days, comes with fever or makes swallowing hard"] },
  6: { s: ["Shaky hands", "Fast or pounding heartbeat", "Headache and muscle cramps"], p: ["Prescription only", "Tell your doctor if you have heart disease, high blood pressure, thyroid problems or diabetes", "Needing it more often means your asthma is not controlled, see your doctor", "Severe breathing trouble is an emergency, call for help"] },
  7: { s: ["Usually well tolerated", "Occasional bloating, wind, constipation or loose motions"], p: ["Contains sodium, so ask a doctor if you have heart or kidney disease or a low-salt diet", "Leave a gap from other medicines as the label advises", "Ask a doctor in pregnancy", "See a doctor if heartburn keeps coming back"] },
  8: { s: ["Headache, nausea, stomach pain", "Loose motions or constipation, wind", "Long use may lower magnesium and vitamin B12 and affect bones"], p: ["Prescription only, use as your doctor advises", "Do not use long term without a doctor’s review", "Tell your doctor about liver disease and all other medicines you take", "Black stools, weight loss or trouble swallowing need a doctor, not more tablets"] },
  9: { s: ["Bloating, wind and cramps", "Loose motions if you take too much"], p: ["Do not use if your bowel may be blocked, or with severe stomach pain", "Contains sugars, so check with a doctor if you have diabetes", "Drink plenty of water", "See a doctor if constipation lasts, or there is blood or severe pain"] },
  10: { s: ["Nausea or vomiting if drunk too fast", "Wrongly mixed ORS can be too salty or too weak"], p: ["Mix only with the amount of clean water on the pack", "Sip small amounts often", "Ask a doctor if you have kidney or heart disease", "Get medical help if fluids will not stay down, there is blood in stool, or the person is very sleepy"] },
  11: { s: ["Loose motions, nausea, vomiting", "Skin rash, thrush", "Rarely severe allergy, severe diarrhoea or yellow skin or eyes"], p: ["Prescription only", "Tell your doctor about any penicillin allergy, liver or kidney problems, or pregnancy", "Take with food and finish the full course", "Stop and get urgent help for face swelling or trouble breathing"] },
  12: { s: ["Metallic taste, nausea, headache", "Dark urine", "Rarely numbness or tingling, or seizures"], p: ["Prescription only", "No alcohol during the course and for at least 2 days after, or as your doctor says", "Tell your doctor about liver disease, nerve problems or pregnancy", "Stop and call your doctor if you get numbness, tingling or a severe rash"] },
  13: { s: ["Mild burning, itching or redness where applied"], p: ["For the skin only, keep away from eyes and mouth", "Wash hands before and after", "Keep using for the time on the pack even if it clears", "See a doctor if it is not better in the time stated, or gets worse"] },
  14: { s: ["Skin irritation or itching", "Rash where applied"], p: ["Prescription only", "Use only for the days your doctor advised, long use can make germs resistant", "Keep away from eyes", "Stop and see a doctor if the rash worsens"] },
  15: { s: ["Usually none at the right amount", "Too much can raise calcium: nausea, constipation, thirst, weakness, kidney problems"], p: ["Take only the amount your doctor advises, ideally after a blood test", "Ask a doctor first if you have kidney stones or high calcium", "Do not add other vitamin D products without asking", "Ask a doctor in pregnancy"] },
  16: { s: ["Nausea or upset stomach", "Constipation", "Dark stools if it contains iron"], p: ["Keep out of children’s reach, iron overdose is dangerous", "Do not double up with other vitamin products", "Ask a doctor in pregnancy or if you take other medicines", "Do not use if you are allergic to any ingredient"] }
};

export const RAW_MEDS = [
  { id: 1, n: "Panadol Tablet", f: "Tablet", c: "pain", g: "Paracetamol", u: "Relieves mild to moderate pain and brings down fever.", w: "Do not combine with other paracetamol products. Follow the label or your doctor’s advice.", rx: 0 },
  { id: 2, n: "Calpol Syrup", f: "Syrup", c: "pain", g: "Paracetamol", u: "Pain and fever relief for children.", w: "A child’s amount depends on weight. Use the measure in the pack and check with the doctor for infants.", rx: 0 },
  { id: 3, n: "Brufen Tablet", f: "Tablet", c: "pain", g: "Ibuprofen", u: "Pain, swelling and fever, such as headache, toothache or joint pain.", w: "Take with food. Ask a doctor first if you have stomach ulcers, asthma, kidney problems or are pregnant.", rx: 0 },
  { id: 4, n: "Zyrtec Tablet", f: "Tablet", c: "cold", g: "Cetirizine", u: "Eases sneezing, runny nose, itchy eyes and skin allergy.", w: "May cause drowsiness. Be careful when driving.", rx: 0 },
  { id: 5, n: "Strepsils Lozenges", f: "Lozenge", c: "cold", g: "Antiseptic lozenge", u: "Soothes sore throat and mouth irritation.", w: "Follow the pack directions. See a doctor if a sore throat lasts more than a few days.", rx: 0 },
  { id: 6, n: "Ventolin Inhaler", f: "Inhaler", c: "cold", g: "Salbutamol", u: "Quick relief of wheezing and breathlessness in asthma.", w: "Only on a doctor’s prescription. If relief is poor or breathing gets worse, get urgent medical help.", rx: 1 },
  { id: 7, n: "Gaviscon Syrup", f: "Syrup", c: "stomach", g: "Alginate antacid", u: "Relieves heartburn and acid reflux.", w: "Shake well before use. See a doctor if symptoms keep coming back.", rx: 0 },
  { id: 8, n: "Risek Capsule", f: "Capsule", c: "stomach", g: "Omeprazole", u: "Reduces stomach acid for reflux, gastritis and ulcers.", w: "Use the way your doctor advises. Long use needs a doctor’s review.", rx: 1 },
  { id: 9, n: "Duphalac Syrup", f: "Syrup", c: "stomach", g: "Lactulose", u: "Relieves constipation.", w: "May take a day or two to work. Drink enough water.", rx: 0 },
  { id: 10, n: "ORS Sachet", f: "Sachet", c: "stomach", g: "Oral rehydration salts", u: "Replaces fluids and salts lost with diarrhoea or vomiting.", w: "Mix only with the water amount printed on the pack. Get medical help for children with severe dehydration.", rx: 0 },
  { id: 11, n: "Augmentin Tablet", f: "Tablet", c: "antibiotic", g: "Amoxicillin + clavulanic acid", u: "Antibiotic for bacterial infections such as chest, ear, throat and urinary infections.", w: "Only on a doctor’s prescription. Finish the full course even if you feel better.", rx: 1 },
  { id: 12, n: "Flagyl Tablet", f: "Tablet", c: "antibiotic", g: "Metronidazole", u: "Treats certain bacterial and parasitic infections, including some stomach and dental infections.", w: "Only on a doctor’s prescription. Avoid alcohol during the course.", rx: 1 },
  { id: 13, n: "Canesten Cream", f: "Cream", c: "skin", g: "Clotrimazole", u: "Treats fungal skin infections such as ringworm and athlete’s foot.", w: "Apply as the label says and keep going for the full time. Not for the eyes.", rx: 0 },
  { id: 14, n: "Fucidin Cream", f: "Cream", c: "skin", g: "Fusidic acid", u: "Treats bacterial skin infections such as impetigo and infected cuts.", w: "Only on a doctor’s prescription. Use for the time advised.", rx: 1 },
  { id: 15, n: "Vitamin D3 Capsule", f: "Capsule", c: "vitamin", g: "Cholecalciferol", u: "Supports bones and treats low vitamin D.", w: "Take only as your doctor advises, ideally after a blood test.", rx: 0 },
  { id: 16, n: "Multivitamin Tablet", f: "Tablet", c: "vitamin", g: "Vitamins and minerals", u: "Daily vitamin and mineral support.", w: "Not a substitute for a balanced diet. Follow the pack directions.", rx: 0 }
];

export const MEDS: Medicine[] = RAW_MEDS.map(m => {
  const e = EXTRA[m.id] || { s: [], p: [] };
  return {
    ...m,
    s: e.s,
    p: e.p
  };
});

export const NEEDS: NeedCategory[] = [
  { k: "pain", t: "Pain and fever", s: "Headache, body ache, high temperature", cls: "t2", spec: "general", flag: "Fever lasting more than 3 days, severe pain, or any fever in a baby under 3 months needs a doctor." },
  { k: "cold", t: "Cold, cough and allergy", s: "Sneezing, sore throat, wheeze", cls: "t3", spec: "general", flag: "Trouble breathing, chest pain, or a cough lasting more than 2 weeks needs a doctor." },
  { k: "stomach", t: "Stomach trouble", s: "Acidity, constipation, loose motions", cls: "t4", spec: "general", flag: "Blood or black colour in stool, severe pain, or signs of dehydration need a doctor." },
  { k: "antibiotic", t: "Infection", s: "Antibiotics prescribed by your doctor", cls: "t5", spec: "general", flag: "Antibiotics work only on bacterial infections and only on prescription. Not sure? See a doctor first." },
  { k: "skin", t: "Skin problems", s: "Fungal rash, infected cuts", cls: "t1", spec: "skin", flag: "Spreading redness, pus, a rash with fever, or any rash on a baby needs a doctor." },
  { k: "vitamin", t: "Vitamins and wellness", s: "Daily support, low vitamin D", cls: "t4", spec: "general", flag: "Feeling tired all the time? A blood test shows what you really need." }
];

export const SHAPE: Record<string, string> = {
  Tablet: "tablet",
  Capsule: "capsule",
  Syrup: "syrup",
  Cream: "cream",
  Sachet: "sachet",
  Lozenge: "lozenge",
  Inhaler: "inhaler"
};

export const CELLC = ["#1D6FE0", "#5FA3FF", "#FEF3C7", "#DBEAFE", "#E0E7FF", "#DCFCE7", "#E0F2FE", "#FCE7F3"];
