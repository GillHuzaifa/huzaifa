import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/services/seo.service';

type SexFilter = 'all' | 'f' | 'm';
type ScreeningTest = [string, string, SexFilter?];

interface LifeStage {
  id?: string;
  n: string;
  a: string;
  k: string;
  d?: string;
  t?: ScreeningTest[];
  r?: string[];
  f?: string[];
  v?: string[];
}

const STAGES: LifeStage[] = [
  { id: 'all', n: 'All ages', a: 'Whole-body care', k: 'All' },
  { id: 'baby', n: 'Infants', a: '0–2 yrs', k: '0–2' },
  {
    n: 'Children', a: '3–12 yrs', k: '3–12',
    d: 'Growing fast. Most problems are simple to fix when found early.',
    t: [['Height, weight and BMI', 'Every year'], ['Vision check', 'Every 1–2 years'], ['Dental check', 'Every 6 months'], ['Hearing check', 'If speech is late'], ['Haemoglobin (anaemia)', 'If pale or tired'], ['Vaccine card review', 'Every year']],
    r: ['Pneumonia and diarrhoea', 'Typhoid and other infections', 'Drowning, burns and road injuries', 'Undernutrition and anaemia'],
    f: ['Missed vaccines', 'Unsafe drinking water', 'Poor nutrition', 'Second-hand smoke', 'Over 2 hours of screen time'],
    v: ['Complete the routine schedule, including measles-rubella dose 2', 'HPV vaccine for girls aged 9–14: ask your doctor']
  },
  {
    n: 'Teens', a: '13–19 yrs', k: '13–19',
    d: 'Bodies, moods and habits all change. Build good ones now.',
    t: [['Blood pressure and BMI', 'Every year'], ['Vision check', 'Every 1–2 years'], ['Haemoglobin (girls)', 'Every year'], ['Mental health check-in', 'Every year'], ['Dental check', 'Every 6 months']],
    r: ['Road injuries', 'Anxiety and depression', 'Anaemia in girls', 'Starting tobacco, vaping or naswar', 'Obesity or undernutrition'],
    f: ['Skipping meals', 'Low sleep', 'Tobacco use', 'Bullying or exam stress', 'Little exercise'],
    v: ['Td or Tdap booster', 'HPV vaccine if not yet given', 'Complete hepatitis B and typhoid']
  },
  {
    n: 'Adults', a: '20–39 yrs', k: '20–39',
    d: 'Feeling fine is not a test result. Set your baseline early.',
    t: [['Blood pressure', 'Every 2 years'], ['Weight, waist and BMI', 'Every year'], ['Blood sugar (HbA1c)', 'From 35, earlier if at risk'], ['Cholesterol', 'From 35, earlier if at risk'], ['Hepatitis B and C', 'Once'], ['HIV', 'Once'], ['Cervical screening (Pap or HPV)', 'From 25, every 3–5 years', 'f'], ['Clinical breast exam', 'Every 1–3 years', 'f'], ['Mental health check-in', 'Every year']],
    r: ['Injuries and accidents', 'Pregnancy and childbirth complications', 'Tuberculosis', 'Hepatitis B and C', 'Early diabetes and high blood pressure'],
    f: ['Tobacco, paan, gutka', 'Family heart disease or diabetes', 'Desk job, little exercise', 'Weight gain', 'Chronic stress'],
    v: ['Td booster every 10 years', 'Hepatitis B if not immune', 'Flu vaccine each year', 'HPV vaccine up to age 26']
  },
  {
    n: 'Midlife', a: '40–59 yrs', k: '40–59',
    d: 'The years when silent conditions show up. Screening matters most here.',
    t: [['Blood pressure', 'Every year'], ['Blood sugar (HbA1c)', 'Every year'], ['Cholesterol', 'Every 1–2 years'], ['ECG and heart risk review', 'From 40'], ['Mammogram', 'Every 1–2 years', 'f'], ['Cervical screening', 'Every 3–5 years', 'f'], ['Colorectal screening', 'From 45–50'], ['PSA prostate talk', 'At 50 (45 if family history)', 'm'], ['Liver and kidney tests', 'If diabetic, high BP or hepatitis'], ['Eye exam', 'Every 1–2 years']],
    r: ['Heart attack and stroke', 'Diabetes', 'High blood pressure', 'Breast, cervical, oral, colon and prostate cancer', 'Liver disease'],
    f: ['Smoking or chewing tobacco', 'Family history of heart disease', 'High BP or sugar', 'Obesity, large waist', 'Menopause (bone and heart changes)'],
    v: ['Flu vaccine each year', 'Td every 10 years', 'Shingles vaccine from 50', 'Hepatitis B if at risk']
  },
  {
    n: 'Seniors', a: '60+ yrs', k: '60+',
    d: 'Stay strong, steady and independent with regular check-ups.',
    t: [['Blood pressure, sugar, cholesterol', 'Every year'], ['Kidney function', 'Every year'], ['Bone density', 'Women 65, men 70'], ['Mammogram', 'Every 2 years to 74', 'f'], ['Colorectal screening', 'To age 75'], ['Prostate discussion', 'Ask your doctor', 'm'], ['Hearing and vision', 'Every year'], ['Memory and falls review', 'Every year'], ['Aortic ultrasound (ex-smokers)', 'Once, 65–75', 'm'], ['Medicine review', 'Every year']],
    r: ['Heart disease and stroke', 'Lung disease and chest infections', 'Cancer', 'Falls and fractures', 'Dementia', 'Kidney disease'],
    f: ['Several medicines at once', 'Low vitamin D, weak bones', 'Loneliness', 'Poor vision or hearing', 'Long-term smoking'],
    v: ['Flu vaccine each year', 'Pneumococcal vaccine', 'Shingles vaccine', 'Td booster', 'COVID-19 as advised']
  }
];

const SEX_STAGE: Record<number, { w: string[]; m: string[] }> = {
  1: {
    w: ['Talk about periods before age 9–10; they can start between 9 and 15', 'Iron-rich food and a haemoglobin check', 'HPV vaccine at 9–14: ask your doctor'],
    m: ['Doctor checks that both testicles are descended', 'Teach hygiene and body safety', 'Ask about very early or late puberty']
  },
  2: {
    w: ['See a doctor if no period by 15, or periods are very heavy, painful or irregular (may be PCOS)', 'Iron and folate for energy and growth', 'HPV vaccine if not yet given'],
    m: ['From puberty, check testicles monthly: a lump, swelling or pain needs a doctor', 'Acne and puberty changes can be treated', 'Avoid steroids and muscle supplements']
  },
  3: {
    w: ['Folic acid before and in early pregnancy', 'Antenatal visits: at least 4, ideally 8', 'PCOS, thyroid and anaemia checks if periods are irregular or you feel tired', 'Check for postnatal depression after birth'],
    m: ['Monthly testicular self-check', 'Fertility check if no pregnancy after 12 months of trying', 'Heart risk starts earlier in men: check BP and cholesterol', 'See a doctor for pain, discharge or trouble passing urine']
  },
  4: {
    w: ['Perimenopause (irregular periods, hot flushes, poor sleep, low mood) often starts in the mid-40s', 'Heart risk rises after menopause', 'Calcium, vitamin D and weight-bearing exercise protect bones'],
    m: ['Weak stream or getting up at night to pass urine: ask about the prostate', 'Men tend to develop heart disease 7–10 years earlier than women', 'Low energy, mood or drive can be treated: see a doctor']
  },
  5: {
    w: ['Bone density test at 65, earlier with risk', 'Urine leakage is common and treatable', 'Continue mammograms to 74'],
    m: ['Prostate enlargement and the PSA talk', 'Osteoporosis affects men too: review falls', 'One aortic ultrasound if you ever smoked']
  }
};

const MENTAL_TOPICS = [
  { n: 'Anxiety', s: ['Constant worry that is hard to switch off', 'Restless, tense muscles, headaches', 'Racing heart, upset stomach, poor sleep', 'Avoiding places, people or tasks'], h: ['Slow breathing for 5 minutes, twice a day', 'Cut back on caffeine and energy drinks', 'Daily walk and regular sleep times', 'Write worries down and set a short worry time', 'Talking therapy (CBT) works very well'], d: 'See a doctor if worry lasts weeks or affects work, study or sleep.' },
  { n: 'Panic attack', s: ['Sudden wave of fear, peaking in about 10 minutes', 'Pounding heart, tight chest, short breath', 'Shaking, sweating, dizzy, tingling hands', 'Feeling unreal, or afraid of dying or losing control'], h: ['Tell yourself: this is a panic attack, it will pass', 'Breathe out slowly with the guide', 'Ground yourself with 5-4-3-2-1', 'Stay where you are until it eases'], d: 'If it is your first time, or chest pain spreads to the arm or jaw, go to emergency, since a heart attack can feel similar. Repeated attacks need a doctor.' },
  { n: 'Low mood', s: ['Sad, empty or numb on most days for 2 weeks', 'Lost interest in things you enjoyed', 'Tired, with sleep or appetite changes', 'Feeling hopeless or guilty'], h: ['A tiny routine: wake, wash, walk', 'Talk to someone you trust', 'Morning light and movement', 'Avoid alcohol and sleeping tablets'], d: 'See a doctor if it lasts 2 weeks. If you have thoughts of harming yourself, tell someone now and call 1122 or go to the nearest emergency room.' },
  { n: 'Stress and burnout', s: ['Exhausted even after rest', 'Short temper, cannot focus', 'Headaches, tight neck, stomach pain', 'Dreading work or study'], h: ['Protect one fixed break each day', 'Say no to one extra task', 'Move your body 30 minutes', 'Share the load with family or colleagues'], d: 'See a doctor if symptoms last more than a few weeks or you cannot cope.' },
  { n: 'Sleep', s: ['Takes over 30 minutes to fall asleep', 'Wakes often or very early', 'Tired and low in the day', 'Loud snoring with pauses in breathing'], h: ['Same bed and wake time daily', 'No screens for 1 hour before bed', 'No caffeine after mid-afternoon', 'Cool, dark, quiet room'], d: 'See a doctor if poor sleep lasts over a month, or if you stop breathing in your sleep.' }
];

interface CancerGuide {
  id: string;
  n: string;
  g?: SexFilter;
  c: string[];
  s: string[];
  p: string[];
}

const CANCER_GUIDES: CancerGuide[] = [
  { id: 'breast', n: 'Breast', g: 'f', c: ['Age over 40', 'Breast or ovarian cancer in the family (BRCA gene)', 'Overweight after menopause', 'Alcohol and little exercise', 'Long-term hormone therapy'], s: ['New lump in the breast or armpit', 'Dimpling, redness or skin change', 'Nipple turning inward or discharge', 'Change in size or shape'], p: ['Monthly self-exam', 'Mammogram from 40, every 1–2 years', 'Healthy weight and regular activity', 'Breastfeeding, if possible'] },
  { id: 'cervical', n: 'Cervical', g: 'f', c: ['Long-lasting HPV infection (the main cause)', 'Smoking', 'Weak immunity', 'Many pregnancies, or never screened'], s: ['Bleeding between periods or after sex', 'Bleeding after menopause', 'Unusual or smelly discharge', 'Pelvic pain'], p: ['HPV vaccine', 'Pap or HPV test every 3–5 years from 25', 'Do not smoke'] },
  { id: 'oral', n: 'Mouth', c: ['Paan, gutka, naswar and chewing tobacco', 'Smoking and alcohol', 'Poor oral hygiene, sharp teeth'], s: ['Mouth ulcer that does not heal in 2 weeks', 'White or red patch', 'Lump, or pain when swallowing', 'Numbness, loose teeth'], p: ['Quit tobacco and betel quid', 'Look inside your mouth monthly', 'Dental check every 6 months'] },
  { id: 'lung', n: 'Lung', c: ['Smoking (the main cause)', 'Second-hand smoke', 'Air pollution and dust', 'Asbestos or workplace fumes'], s: ['Cough for over 3 weeks', 'Coughing blood', 'Breathlessness, chest pain', 'Weight loss'], p: ['Quit smoking: risk falls with every year', 'Avoid smoke and wear a mask in dusty work', 'Heavy smokers 50–80: ask about a low-dose CT scan'] },
  { id: 'colon', n: 'Colon and rectum', c: ['Age over 45', 'Red and processed meat, low fibre', 'Obesity and inactivity', 'Smoking and alcohol', 'Family history or bowel inflammation'], s: ['Blood in stool', 'Bowel habit change for over 3 weeks', 'Unexplained anaemia or weight loss', 'Lasting belly pain'], p: ['Screening from 45–50', 'More vegetables, fruit and fibre', 'Move 30 minutes daily'] },
  { id: 'liver', n: 'Liver', c: ['Hepatitis B and C', 'Alcohol', 'Fatty liver, obesity and diabetes', 'Mouldy stored grain and nuts (aflatoxin)'], s: ['Yellow eyes or skin', 'Swollen belly', 'Pain in the upper right belly', 'Weight loss, tiredness'], p: ['Hepatitis B vaccine', 'Test once for hepatitis B and C and treat if positive', 'Healthy weight, no alcohol', 'Never share needles or razors'] },
  { id: 'prostate', n: 'Prostate', g: 'm', c: ['Age over 50', 'Family history', 'Obesity'], s: ['Weak stream, or getting up often at night', 'Blood in urine', 'Pain in the hip, back or bones', 'Often no signs early'], p: ['Talk to a doctor about a PSA test at 50 (45 if family history)', 'Healthy weight and activity'] },
  { id: 'testis', n: 'Testicular', g: 'm', c: ['Age 15–40', 'Testicle that did not descend in childhood', 'Family history'], s: ['Painless lump or swelling', 'Heavy or aching feeling', 'Change in size'], p: ['Monthly self-check after a warm bath', 'See a doctor within 2 weeks of any lump (it is very treatable when found early)'] }
];

const POSTURE_GUIDES = [
  { n: 'Neck and head', c: ['Looking down at the phone for hours', 'Screen set too low', 'Weak deep neck muscles'], e: [['Chin tucks', '10 reps, hold 5 sec, twice a day'], ['Upper neck stretch', '30 sec each side'], ['Wall angels', '10 slow reps']] },
  { n: 'Rounded shoulders', c: ['Hunching at a desk', 'Tight chest muscles', 'Weak upper back'], e: [['Doorway chest stretch', '30 sec, 3 times'], ['Band rows or pull-aparts', '12 reps, 3 sets'], ['Wall angels', '10 slow reps']] },
  { n: 'Lower back', c: ['Sitting for long hours', 'Weak core and buttock muscles', 'Tight hip muscles', 'Lifting with a rounded back'], e: [['Cat-cow', '10 slow reps'], ['Glute bridge', '12 reps, 3 sets'], ['Bird-dog', '8 each side'], ['Kneeling hip stretch', '30 sec each side']] },
  { n: 'Desk and sitting', c: ['Chair, screen and keyboard out of line', 'No breaks', 'Laptop used without a stand'], e: [['Seated back extension over chair', '10 reps'], ['Stand, walk or stretch', '2 min every 30–45 min'], ['Standing hip stretch', '30 sec each side']] }
];

const DAILY_POSTURE_HABITS = ['Screen at eye level, an arm’s length away', 'Feet flat, knees bent at about 90°', 'Support the curve of your lower back', 'Children’s school bag: under 10–15% of body weight'];
const VACCINE_JOURNEY: [string, string, number][] = [
  ['Birth', 'BCG · OPV 0', 0],
  ['6 weeks', 'Pentavalent 1 · PCV 1 · OPV 1 · Rota 1', 42],
  ['10 weeks', 'Pentavalent 2 · PCV 2 · OPV 2 · Rota 2', 70],
  ['14 weeks', 'Pentavalent 3 · PCV 3 · OPV 3 · IPV 1', 98],
  ['9 months', 'Measles-rubella 1 · IPV 2 · Typhoid conjugate', 274],
  ['15 months', 'Measles-rubella 2', 456]
];
const BABY_MILESTONES: [string, string[], string][] = [
  ['0–3 mo', ['Smiles at faces by 2 months', 'Follows you with their eyes', 'Lifts head during tummy time', 'Coos and makes sounds'], 'Breast milk only. No water, honey or gripe water. Weigh at every visit.'],
  ['4–6 mo', ['Rolls over', 'Laughs and squeals', 'Reaches for and grabs toys', 'Starts to sit with support'], 'Begin soft, iron-rich foods at 6 months while continuing breast milk.'],
  ['7–12 mo', ['Sits alone and crawls', 'Says “mama” or “baba”', 'Pincer grip, picks up small items', 'Pulls up to stand'], 'Check haemoglobin if pale. Brush the first tooth with a smear of paste.'],
  ['1–2 yrs', ['Walks alone by 18 months', 'Around 10 words by 18 months', 'Two-word phrases by 2 years', 'Points and imitates'], 'Development check at 18 and 24 months. Tell the doctor if speech or walking is late.']
];
const RISK_FACTORS: [string, string, string][] = [
  ['tob', 'I use tobacco (cigarettes, paan, gutka, naswar)', 'Ask about quitting support and an oral and lung check.'],
  ['fh', 'Heart attack or stroke in a close relative before 60', 'Get blood pressure, cholesterol and a heart-risk review.'],
  ['fd', 'Diabetes in my family', 'Check blood sugar (HbA1c) every year.'],
  ['bp', 'I have been told my blood pressure is high', 'Check blood pressure at least every 6 months.'],
  ['wt', 'I am overweight or have a large waist', 'Test blood sugar and cholesterol, and plan gradual weight loss.'],
  ['mv', 'Less than 30 minutes of activity on most days', 'Aim for 150 minutes a week of brisk walking or similar.'],
  ['ca', 'Breast, ovarian, colon or prostate cancer in my family', 'Ask about starting screening earlier than usual.'],
  ['hep', 'I have never been tested for hepatitis B or C', 'One simple blood test, once.']
];

@Component({
  selector: 'app-life-map',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="sec life-map">
      <div class="wrap" id="lifeMapRoot" [attr.data-sex]="sexFilter()">
        <div class="lm-hero">
          <span class="eyebrow">PulseQ Lifemap</span>
          <h1>Your health, mapped age by age.</h1>
          <p>Pick your stage of life to see which tests you need, what to watch for, and what puts your health at risk.</p>
          <svg viewBox="0 0 800 64" preserveAspectRatio="none" aria-hidden="true"><path d="M0 34h230l22-26 32 54 28-38 18 10h470"/></svg>
        </div>

        <div class="lm-who" role="group" aria-label="Show health guide for">
          @for (option of sexOptions; track option.value) {
            <button type="button" [class.on]="sexFilter() === option.value" [attr.aria-pressed]="sexFilter() === option.value" (click)="setSex(option.value)">{{ option.label }}</button>
          }
        </div>

        <div class="lm-rail" role="group" aria-label="Choose an age stage">
          @for (stage of stages; track $index; let i = $index) {
            <button type="button" class="lm-stop" [class.on]="selectedStage() === i" [attr.aria-pressed]="selectedStage() === i" (click)="selectStage(i)">
              <i>{{ stage.k }}</i><b>{{ stage.n }}</b><small>{{ stage.a }}</small>
            </button>
          }
        </div>

        @let stage = stages[selectedStage()];
        @if (selectedStage() === 1) {
          <div class="tp">
            <div class="tp-top">
              <div><p class="hand">tiny pulse</p><h2>Little hearts, big checks.</h2><p class="intro">Vaccines, milestones and warning signs for your baby’s first two years.</p></div>
              <div class="tp-dob">
                <label for="babyDob">Baby’s date of birth</label>
                <input id="babyDob" type="date" [value]="dateOfBirth()" [max]="today" (change)="setDateOfBirth($event)">
                @if (babyAgeDays() >= 0 && babyAgeDays() < 1100) { <span class="tp-age">{{ formatBabyAge(babyAgeDays()) }} old</span> }
                @else { <span class="muted sm">Add a date to see your due dates.</span> }
              </div>
            </div>
            <div class="tp-grid">
              <div class="tp-card">
                <h3>Vaccine journey</h3>
                <ol class="tp-tl">
                  @for (vaccine of vaccines; track vaccine[0]; let i = $index) {
                    @let dueDate = vaccineDate(vaccine[2]);
                    @let passed = babyAgeValid() && babyAgeDays() >= vaccine[2];
                    <li [class.past]="passed" [class.next]="!passed && nextVaccineIndex() === i && babyAgeDays() >= 0">
                      <span class="nd">{{ passed ? '✓' : i + 1 }}</span>
                      <div><b>{{ vaccine[0] }} @if (dueDate) { <span>· {{ dueDate }}</span> } @if (!passed && nextVaccineIndex() === i && babyAgeValid()) { <em>Next, in {{ vaccine[2] - babyAgeDays() }} days</em> }</b><span>{{ vaccine[1] }}</span></div>
                    </li>
                  }
                </ol>
                <p class="tp-note">Based on Pakistan’s routine EPI schedule. Your doctor or EPI centre may adjust it, so always bring the vaccine card.</p>
              </div>
              <div class="tp-card">
                <h3>Milestones and care</h3>
                <div class="tp-tabs" role="group" aria-label="Baby age">
                  @for (milestone of milestones; track milestone[0]; let i = $index) {
                    <button class="chip" type="button" [class.on]="selectedMilestone() === i" [attr.aria-pressed]="selectedMilestone() === i" (click)="selectedMilestone.set(i)">{{ milestone[0] }}</button>
                  }
                </div>
                <ul class="plain-list">@for (item of milestones[selectedMilestone()][1]; track item) { <li>{{ item }}</li> }</ul>
                <p class="tp-note care-tip"><b>Care tip:</b> {{ milestones[selectedMilestone()][2] }}</p>
              </div>
              <div class="tp-warn">
                <h3>See a doctor or go to emergency now if your baby has</h3>
                <ul><li>Fever of 38°C or more, under 3 months</li><li>Fast or difficult breathing, or blue lips</li><li>Refuses feeds or is very sleepy</li><li>Fits or stiff, floppy body</li><li>Repeated or green vomiting</li><li>No wet nappy for 8 hours</li><li>Yellow skin reaching the legs, or after 2 weeks</li><li>Sunken soft spot on the head</li></ul>
              </div>
            </div>
          </div>
        } @else if (selectedStage() !== 0) {
          <div class="lm-body">
            <aside class="lm-lead">
              <span class="big">{{ stage.k }}</span><h2>{{ stage.n }}</h2><p>{{ stage.d }}</p><p class="hand">tests, risks, vaccines</p>
              <a class="btn btn-coral" routerLink="/find-doctors">Book a check-up</a>
            </aside>
            <div class="lm-cards">
              <div class="lm-card wide">
                <h3>Tests you need</h3>
                <ul>@for (test of filteredTests(stage); track test[0]) { <li><span>{{ test[0] }}</span><span class="lm-pill">{{ test[1] }}</span></li> }</ul>
              </div>
              <div class="lm-card"><h3>Most common serious risks</h3><ul>@for (risk of stage.r || []; track risk) { <li>{{ risk }}</li> }</ul></div>
              <div class="lm-card"><h3>Risk factors to watch</h3><div class="lm-chips">@for (factor of stage.f || []; track factor) { <span>{{ factor }}</span> }</div></div>
              @if (sexGuidance(); as guidance) {
                @for (sex of visibleSexGuidance(guidance); track sex.key) {
                  <div class="lm-card" [class.wide]="visibleSexGuidance(guidance).length === 1" [class.sx-w]="sex.key === 'w'" [class.sx-m]="sex.key === 'm'">
                    <h3>{{ sex.key === 'w' ? 'Women’s health' : 'Men’s health' }}</h3>
                    <ul>@for (item of sex.items; track item) { <li>{{ item }}</li> }</ul>
                  </div>
                }
              }
              <div class="lm-card wide"><h3>Vaccines</h3><ul>@for (vaccine of stage.v || []; track vaccine) { <li>{{ vaccine }}</li> }</ul></div>
            </div>
          </div>
        }

        @if (selectedStage() === 0) {
        <section class="lm-sec">
          <span class="eyebrow">Cancer awareness</span><h2>Cancer: causes, risks and early signs.</h2>
          <p class="section-copy">Many cancers are linked to tobacco, infections, diet and inactivity, and most are far easier to treat when found early. Choose Women or Men above to filter.</p>
          <div class="md cn">
            <div class="md-tabs" role="group" aria-label="Cancer type">
              @for (guide of visibleCancerGuides(); track guide.id) { <button type="button" class="chip" [class.on]="selectedCancer() === guide.id" [attr.aria-pressed]="selectedCancer() === guide.id" (click)="selectedCancer.set(guide.id)">{{ guide.n }}</button> }
            </div>
            @if (currentCancer(); as cancer) {
              <div class="md-grid">
                <div class="lm-card"><h3>Causes and risk factors</h3><ul>@for (item of cancer.c; track item) { <li>{{ item }}</li> }</ul></div>
                <div class="lm-card"><h3>Early warning signs</h3><ul>@for (item of cancer.s; track item) { <li>{{ item }}</li> }</ul></div>
                <div class="lm-card"><h3>Lower your risk</h3><ul>@for (item of cancer.p; track item) { <li>{{ item }}</li> }</ul></div>
              </div>
            }
            <p class="tp-note">Having a risk factor does not mean you will get cancer. See a doctor for any sign that lasts more than 2 weeks.</p>
          </div>
        </section>

        <section class="lm-sec">
          <span class="eyebrow">Posture and back</span><h2>Fix your posture, one move at a time.</h2>
          <p class="section-copy">Long hours at a desk or on a phone strain the neck, shoulders and back. These gentle exercises help most people.</p>
          <div class="md ps">
            <div class="md-tabs" role="group" aria-label="Problem area">
              @for (guide of postureGuides; track guide.n; let i = $index) { <button type="button" class="chip" [class.on]="selectedPosture() === i" [attr.aria-pressed]="selectedPosture() === i" (click)="selectedPosture.set(i)">{{ guide.n }}</button> }
            </div>
            @let posture = postureGuides[selectedPosture()];
            <div class="md-grid">
              <div class="lm-card"><h3>Why it happens</h3><ul>@for (item of posture.c; track item) { <li>{{ item }}</li> }</ul></div>
              <div class="lm-card"><h3>Exercises</h3><ul class="exercise-list">@for (exercise of posture.e; track exercise[0]; let i = $index) { <li><span class="exercise-number">{{ i + 1 }}</span><b>{{ exercise[0] }}</b><span class="lm-pill">{{ exercise[1] }}</span></li> }</ul></div>
              <div class="lm-card"><h3>Daily habits</h3><ul>@for (habit of postureHabits; track habit) { <li>{{ habit }}</li> }</ul></div>
              <div class="lm-card wide"><h3>Go slowly, and see a doctor if</h3><p class="safety-copy">An exercise causes sharp pain, or you have numbness or tingling in an arm or leg, weakness, pain at night or with fever, or trouble controlling urine or bowels. Do these daily for 4–6 weeks for the best results.</p></div>
            </div>
          </div>
        </section>

        <section class="lm-sec">
          <span class="eyebrow">Mind and mood</span><h2>Anxiety, panic and stress: you are not alone.</h2>
          <p class="section-copy">Mental health is health. These problems are common, treatable and nothing to be ashamed of.</p>
          <div class="md">
            <div class="md-tabs" role="group" aria-label="Mental health topic">
              @for (topic of mentalTopics; track topic.n; let i = $index) { <button type="button" class="chip" [class.on]="selectedMindTopic() === i" [attr.aria-pressed]="selectedMindTopic() === i" (click)="selectedMindTopic.set(i)">{{ topic.n }}</button> }
            </div>
            @let mind = mentalTopics[selectedMindTopic()];
            <div class="md-grid">
              <div class="lm-card"><h3>Signs</h3><ul>@for (item of mind.s; track item) { <li>{{ item }}</li> }</ul></div>
              <div class="lm-card"><h3>What helps</h3><ul>@for (item of mind.h; track item) { <li>{{ item }}</li> }</ul></div>
              <div class="md-orb"><div class="orb"><span class="in">Breathe in</span><span class="out">Breathe out</span></div><p>In for 4 seconds, out for 6. Repeat for 2 minutes.</p><b>5-4-3-2-1 grounding</b><p>Name 5 things you see, 4 you feel, 3 you hear, 2 you smell and 1 you taste.</p></div>
              <div class="lm-card wide"><h3>When to get help</h3><p class="safety-copy">{{ mind.d }}</p><a class="btn btn-ink" routerLink="/find-doctors">Talk to a doctor</a></div>
            </div>
          </div>
        </section>

        <section class="lm-sec">
          <span class="eyebrow">Risk snapshot</span><h2>What puts you at risk?</h2>
          <div class="lm-risk">
            <div class="lm-card">
              @for (factor of riskFactors; track factor[0]) {
                <label class="lm-toggle"><input type="checkbox" [checked]="!!riskSelection()[factor[0]]" (change)="toggleRisk(factor[0], $event)">{{ factor[1] }}</label>
              }
            </div>
            <div class="lm-res">
              <span class="eyebrow">Your watch-list</span><span class="num">{{ riskCount() }}</span>
              <p>{{ riskMessage() }}</p>
              @if (riskAdvice().length) { <ul>@for (advice of riskAdvice(); track advice) { <li>{{ advice }}</li> }</ul> }
              <a class="btn btn-mint" routerLink="/find-doctors">Find a doctor</a>
              <p class="xs">General guide only, not a diagnosis.</p>
            </div>
          </div>
        </section>

        <section class="lm-sec">
          <span class="eyebrow">Know your signs</span><h2>Two quick checks that can save a life.</h2>
          <p class="section-copy">Heart disease is the world’s leading cause of death, and breast cancer is the most common cancer in women. Both are far easier to treat when caught early.</p>
          <div class="lm-two">
            <details class="lm-sign heart">
              <summary><span class="sign-icon">♥</span><span class="sign-title"><b>Heart attack check</b><span>Warning signs and your risk</span></span><span class="sign-time">2 min →</span></summary>
              <div class="sign-body"><b>Warning signs</b><ul><li>Pressure, squeezing or heaviness in the chest</li><li>Pain spreading to the left arm, jaw, neck or back</li><li>Shortness of breath, cold sweat, nausea or dizziness</li><li>In women, signs can be milder: unusual tiredness, back or jaw pain, indigestion</li></ul><div class="sign-action">Do not wait and do not drive yourself. Call your emergency number now (Rescue 1122 or Edhi 115) and sit down and stay calm.</div></div>
            </details>
            <details class="lm-sign breast">
              <summary><span class="sign-icon">♡</span><span class="sign-title"><b>Breast health check</b><span>Self-exam guide and warning signs</span></span><span class="sign-time">2 min →</span></summary>
              <div class="sign-body"><b>Once a month, a few days after your period ends</b><ul><li>Look in a mirror for changes in size, shape or skin</li><li>Feel each breast and armpit with flat fingers, in small circles</li><li>Warning signs: a new lump, dimpling, nipple turning inward, discharge, redness or swelling</li></ul><div class="sign-action">Most lumps are not cancer, but see a doctor within 2 weeks of finding any change. Women 40 and over should ask about a mammogram.</div></div>
            </details>
          </div>
        </section>
        }
        <p class="disclaimer">Lifemap gives general guidance based on common screening and vaccination advice. It is not a diagnosis. Your doctor may change the timing for your health, family history or local schedule. In an emergency call 1122 or 115.</p>
      </div>
    </section>
  `,
  styles: [`
    :host{display:block;color:#102A43}
    .life-map{display:block!important;min-height:70vh;padding-top:28px;background:radial-gradient(640px 420px at 95% 0,#DBEAFE,transparent 70%),radial-gradient(560px 420px at 0 38%,rgba(224,231,255,.9),transparent 70%)}
    .life-map h1,.life-map h2,.life-map h3{font-family:var(--disp,'Bricolage Grotesque',sans-serif);font-weight:800;letter-spacing:-.02em;line-height:1.08}
    .lm-hero{position:relative;overflow:hidden;border-radius:40px;padding:clamp(26px,4.6vw,58px) clamp(26px,4.6vw,58px) 92px;background:linear-gradient(135deg,#2381FF 0,#1558B8 62%,#0F3F86);color:#fff;box-shadow:0 30px 60px -36px rgba(12,45,94,.8)}
    .lm-hero:before{content:"";position:absolute;right:-110px;top:-130px;width:440px;height:440px;border-radius:50%;background:radial-gradient(circle,rgba(147,197,253,.5),rgba(147,197,253,0) 68%)}
    .eyebrow{display:block;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#1558B8}
    .lm-hero .eyebrow{color:#BFDBFE}.lm-hero h1{font-size:clamp(36px,6.4vw,72px);max-width:11ch;margin-top:12px;position:relative}.lm-hero p{max-width:520px;color:#F0F6FF;margin-top:14px;font-size:18px;position:relative}
    .lm-hero svg{position:absolute;left:0;bottom:16px;width:100%;height:64px;opacity:.55}.lm-hero path{fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1400}
    @media(prefers-reduced-motion:no-preference){.lm-hero path{animation:lmdraw 6s ease-in-out infinite}}@keyframes lmdraw{0%{stroke-dashoffset:1400}60%,100%{stroke-dashoffset:0}}
    .lm-who{display:inline-flex;gap:4px;padding:5px;margin-top:22px;border-radius:999px;background:#fff;box-shadow:0 0 0 1.5px #E2E8F0,0 18px 36px -24px rgba(16,42,67,.5)}
    .lm-who button,.chip{min-height:44px;padding:0 18px;border:1.5px solid #E2E8F0;border-radius:999px;background:#fff;color:#526477;font:inherit;font-weight:700;font-size:15px;cursor:pointer}
    .lm-who button{border:0}.lm-who button.on,.chip.on{background:#2381FF;color:#fff;border-color:#2381FF}
    .lm-rail{display:flex;overflow-x:auto;margin-top:26px;padding:10px 2px 16px;scrollbar-width:none}.lm-rail::-webkit-scrollbar{display:none}
    .lm-stop{flex:1 0 104px;position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;border:0;background:none;color:#526477;cursor:pointer;padding:0 4px;font:inherit}
    .lm-stop:before{content:"";position:absolute;top:34px;left:0;right:0;height:3px;background:#DBEAFE}.lm-stop:first-child:before{left:50%}.lm-stop:last-child:before{right:50%}
    .lm-stop i{position:relative;z-index:1;width:60px;height:60px;border-radius:50%;background:#fff;box-shadow:0 0 0 2px #E2E8F0;display:grid;place-items:center;font:800 15px var(--disp,'sans-serif');font-style:normal;color:#102A43;transition:transform .2s,background .2s}
    .lm-stop b{font-size:15px;color:#102A43}.lm-stop small{font-size:12px}.lm-stop.on i{background:#2381FF;color:#fff;box-shadow:0 0 0 6px #DBEAFE;transform:scale(1.08)}
    .lm-body{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:18px;margin-top:6px}.lm-lead{background:#DBEAFE;border-radius:32px;padding:28px;display:flex;flex-direction:column;gap:12px;align-self:start;position:sticky;top:16px}
    .lm-lead .big{font:800 clamp(46px,7vw,72px)/1 var(--disp,'sans-serif');color:#1558B8;letter-spacing:-.03em}.lm-lead h2{font-size:26px}.hand{font-size:24px;color:#1558B8}
    .btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 24px;border:0;border-radius:999px;font-weight:700;text-decoration:none;cursor:pointer}.btn-coral,.btn-ink{background:#2381FF;color:#fff}.btn-mint{background:#5FA3FF;color:#102A43}
    .lm-cards,.md-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:16px}.lm-card{min-width:0;background:#fff;border-radius:28px;padding:22px;box-shadow:0 0 0 1.5px #E2E8F0,0 14px 30px -26px rgba(16,42,67,.4);transition:transform .25s,box-shadow .25s}
    @media(hover:hover){.lm-card:hover{transform:translateY(-3px);box-shadow:0 22px 40px -28px rgba(16,42,67,.55)}}
    .lm-card.wide{grid-column:1/-1}.lm-card h3{font:800 18px var(--disp,'sans-serif');margin:0 0 12px;display:flex;align-items:center;gap:8px}.lm-card h3:before{content:"";width:10px;height:10px;border-radius:50%;background:#2381FF;flex:none}
    .lm-card ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}.lm-card li{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:9px 0;border-top:1px solid #E2E8F0;font-size:15px}.lm-card li:first-child{border-top:0}
    .lm-pill{flex:none;max-width:48%;text-align:right;font-size:12px;font-weight:700;background:#DBEAFE;color:#1558B8;border-radius:999px;padding:4px 10px}
    .lm-chips{display:flex;flex-wrap:wrap;gap:8px}.lm-chips span{background:#EFF6FF;border-radius:999px;padding:7px 14px;font-size:14px;font-weight:500}
    .sx-w{background:linear-gradient(160deg,#fff,#FDF2F8);box-shadow:0 0 0 1.5px #F9C6E3}.sx-w h3:before{background:#B0176F}.sx-m{background:linear-gradient(160deg,#fff,#ECFAFD);box-shadow:0 0 0 1.5px #A5E3F2}.sx-m h3:before{background:#0E6E8C}
    .lm-sec{margin-top:44px}.lm-sec>h2{font-size:clamp(26px,4vw,40px);margin:6px 0 16px}.section-copy{max-width:620px;margin:-6px 0 18px;color:#526477}
    .lm-risk{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:18px}.lm-toggle{display:flex;gap:12px;align-items:center;min-height:48px;padding:8px 0;cursor:pointer;font-size:15px}.lm-toggle input{width:22px;height:22px;accent-color:#2381FF;flex:none}
    .lm-res{background:#1558B8;color:#fff;border-radius:28px;padding:24px;display:flex;flex-direction:column;gap:12px}.lm-res .eyebrow{color:#BFDBFE}.lm-res .num{font:800 54px/1 var(--disp,'sans-serif')}.lm-res ul{margin:0;padding-left:18px;font-size:15px;color:#F0F6FF}.lm-res .xs{font-size:13px;color:#DBEAFE}
    .lm-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:16px}.lm-sign{border-radius:28px;overflow:hidden}.lm-sign.heart{background:#FDE8E6;color:#9A1B0F}.lm-sign.breast{background:#F9E6F2;color:#9B1B68}
    .lm-sign summary{list-style:none;display:flex;align-items:center;gap:16px;padding:22px;cursor:pointer;min-height:96px}.lm-sign summary::-webkit-details-marker{display:none}.sign-icon{width:58px;height:58px;border-radius:18px;background:#fff;display:grid;place-items:center;flex:none;font-size:34px}
    .sign-title{flex:1;min-width:0}.sign-title b{display:block;font:800 21px var(--disp,'sans-serif')}.sign-title span{font-size:15px;opacity:.85}.sign-time{font-weight:700;font-size:14px;white-space:nowrap}.lm-sign[open] .sign-time{display:none}
    .sign-body{padding:0 22px 22px;font-size:15px;color:#102A43}.sign-body ul{margin:6px 0 12px;padding-left:20px}.sign-action{background:#fff;border-radius:18px;padding:14px;font-weight:700}
    .tp{position:relative;overflow:hidden;border-radius:40px;padding:clamp(20px,4vw,44px);background:linear-gradient(160deg,#FEF3C7 0,#E0F2FE 55%,#DCFCE7 100%);margin-top:8px}
    .tp-top{display:flex;flex-wrap:wrap;gap:22px;align-items:center;justify-content:space-between}.tp-top h2{font-size:clamp(32px,5vw,54px)}.tp .hand{font-size:28px}.tp .intro{max-width:460px;margin-top:8px;color:#526477}
    .tp-dob{background:#fff;border-radius:28px;padding:18px 20px;display:flex;flex-direction:column;gap:6px;min-width:min(240px,100%);box-shadow:0 20px 40px -28px rgba(16,42,67,.5)}.tp-dob label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#526477}.tp-dob input{border:0;background:#EFF6FF;border-radius:14px;padding:10px 12px;min-height:44px}.tp-age{font:800 26px var(--disp,'sans-serif');color:#1558B8}
    .tp-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:18px;margin-top:24px}.tp-card{min-width:0;background:#fff;border-radius:30px;padding:22px}.tp-card h3{font:800 20px var(--disp,'sans-serif');margin:0 0 14px}
    .tp-tl{list-style:none;margin:0;padding:0 0 0 6px;display:flex;flex-direction:column}.tp-tl li{position:relative;display:flex;gap:14px;padding:0 0 18px}.tp-tl li:before{content:"";position:absolute;left:13px;top:28px;bottom:0;width:3px;background:#DBEAFE}.tp-tl li:last-child:before{display:none}.nd{width:30px;height:30px;border-radius:50%;background:#DBEAFE;color:#1558B8;font-weight:800;font-size:13px;display:grid;place-items:center;flex:none;z-index:1}.tp-tl li.past .nd{background:#DCFCE7;color:#166534}.tp-tl li.next .nd{background:#2381FF;color:#fff;box-shadow:0 0 0 5px #DBEAFE}.tp-tl b{display:block;font-size:16px}.tp-tl li div>span{font-size:14px;color:#526477}.tp-tl em{font-style:normal;font-size:12px;font-weight:700;background:#FEF3C7;color:#92400E;border-radius:999px;padding:2px 10px;margin-left:6px}
    .tp-tabs,.md-tabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}.tp-tabs .chip,.md-tabs .chip{min-height:40px;padding:0 14px;font-size:14px}
    .plain-list{margin:0;padding-left:20px}.care-tip{color:#102A43!important}.tp-note{font-size:13px;color:#526477;margin-top:12px}.tp-warn{background:#FDE8E6;color:#9A1B0F;border-radius:30px;padding:22px;grid-column:1/-1}.tp-warn h3{font:800 20px var(--disp,'sans-serif');margin:0 0 10px}.tp-warn ul{margin:0;padding-left:20px;columns:2 260px;font-size:15px}
    .md{background:linear-gradient(150deg,#E0E7FF,#DBEAFE 55%,#E0F2FE);border-radius:40px;padding:clamp(18px,3.5vw,38px)}.md.cn{background:linear-gradient(150deg,#FCE7F3,#EEF2FF 60%,#DBEAFE)}.md.ps{background:linear-gradient(150deg,#DCFCE7,#E0F2FE 60%,#FEF3C7)}
    .md-orb{background:#102A43;color:#fff;border-radius:28px;padding:22px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px}.md-orb p{font-size:14px;color:#DBEAFE}.md-orb b{margin-top:8px;font:800 17px var(--disp,'sans-serif')}
    .orb{position:relative;width:132px;height:132px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#BFDBFE,#2381FF 70%);display:flex;align-items:center;justify-content:center;margin:8px 0;font-weight:700;color:#0c2d5e}.orb span{position:absolute;font-size:15px}.orb .out{opacity:0}
    @media(prefers-reduced-motion:no-preference){.orb{animation:lmb 10s ease-in-out infinite}.orb .in{animation:lmi 10s infinite}.orb .out{animation:lmo 10s infinite}}
    @keyframes lmb{0%,100%{transform:scale(.72)}40%{transform:scale(1.08)}}@keyframes lmi{0%,38%{opacity:1}44%,100%{opacity:0}}@keyframes lmo{0%,38%{opacity:0}44%,96%{opacity:1}100%{opacity:0}}
    @media(prefers-reduced-motion:reduce){.orb .out{opacity:1;position:static;margin-left:4px}.orb .in{position:static}.orb{flex-direction:column}}
    .exercise-list li{align-items:flex-start}.exercise-list li b{display:block;font-weight:700}.exercise-number{flex:none;width:28px;height:28px;border-radius:50%;background:#DBEAFE;color:#1558B8;font-weight:800;font-size:13px;display:grid;place-items:center}.safety-copy{margin:0 0 14px;font-size:15px}.disclaimer{margin-top:36px;padding:18px 22px;background:linear-gradient(135deg,#2381FF 0,#1558B8 62%,#0F3F86);border-left:5px solid #BFDBFE;border-radius:16px;color:#fff;font-size:16px;font-weight:600;line-height:1.6}
    @media(max-width:860px){.lm-body,.tp-grid{grid-template-columns:1fr}.lm-lead{position:static}}
    @media(max-width:600px){.lm-hero{border-radius:28px;padding-bottom:80px}.lm-who{max-width:100%;display:flex}.lm-who button{padding-inline:16px;flex:1}.lm-card{padding:18px}.lm-card.wide{grid-column:auto}.tp-warn{grid-column:auto}.tp-warn ul{columns:1}.sign-title b{font-size:18px}.sign-time{font-size:12px}}
  `]
})
export class LifeMapComponent implements OnInit {
  private seo = inject(SeoService);
  stages = STAGES;
  mentalTopics = MENTAL_TOPICS;
  cancerGuides = CANCER_GUIDES;
  postureGuides = POSTURE_GUIDES;
  postureHabits = DAILY_POSTURE_HABITS;
  vaccines = VACCINE_JOURNEY;
  milestones = BABY_MILESTONES;
  riskFactors = RISK_FACTORS;
  sexOptions: { value: SexFilter; label: string }[] = [{ value: 'all', label: 'Everyone' }, { value: 'f', label: 'Women' }, { value: 'm', label: 'Men' }];

  selectedStage = signal(0);
  sexFilter = signal<SexFilter>('all');
  selectedMindTopic = signal(0);
  selectedCancer = signal('breast');
  selectedPosture = signal(0);
  selectedMilestone = signal(0);
  dateOfBirth = signal('');
  riskSelection = signal<Record<string, boolean>>({});

  today = new Date().toISOString().slice(0, 10);
  private readonly sexGuides = SEX_STAGE;

  ngOnInit(): void {
    this.seo.updateTitle('Lifemap — PulseQ Pakistan');
    this.seo.updateMeta('Age-by-age health screening, vaccination and wellness guidance from PulseQ.');
  }

  selectStage(index: number): void {
    this.selectedStage.set(index);
    this.sexFilter.set('all');
  }

  setSex(value: SexFilter): void {
    this.sexFilter.set(value);
    const available = this.visibleCancerGuides();
    if (!available.some(guide => guide.id === this.selectedCancer())) {
      this.selectedCancer.set(available[0]?.id || 'oral');
    }
  }

  filteredTests(stage: LifeStage): ScreeningTest[] {
    return (stage.t || []).filter(test => !test[2] || this.sexFilter() === 'all' || test[2] === this.sexFilter());
  }

  sexGuidance(): { w: string[]; m: string[] } | undefined {
    return this.sexGuides[this.selectedStage() - 1];
  }

  visibleSexGuidance(guidance: { w: string[]; m: string[] }): { key: 'w' | 'm'; items: string[] }[] {
    if (this.sexFilter() === 'f') return [{ key: 'w', items: guidance.w }];
    if (this.sexFilter() === 'm') return [{ key: 'm', items: guidance.m }];
    return [{ key: 'w', items: guidance.w }, { key: 'm', items: guidance.m }];
  }

  visibleCancerGuides(): CancerGuide[] {
    return this.cancerGuides.filter(guide => !guide.g || this.sexFilter() === 'all' || guide.g === this.sexFilter());
  }

  currentCancer(): CancerGuide | undefined {
    return this.visibleCancerGuides().find(guide => guide.id === this.selectedCancer()) || this.visibleCancerGuides()[0];
  }

  setDateOfBirth(event: Event): void {
    this.dateOfBirth.set((event.target as HTMLInputElement).value);
  }

  babyAgeDays(): number {
    if (!this.dateOfBirth()) return -1;
    const dob = new Date(this.dateOfBirth() + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((today.getTime() - dob.getTime()) / 86400000);
  }

  nextVaccineIndex(): number {
    return this.vaccines.findIndex(vaccine => vaccine[2] > this.babyAgeDays());
  }

  babyAgeValid(): boolean {
    return this.babyAgeDays() >= 0 && this.babyAgeDays() < 1100;
  }

  vaccineDate(days: number): string {
    if (!this.babyAgeValid()) return '';
    const dob = new Date(this.dateOfBirth() + 'T00:00:00');
    dob.setDate(dob.getDate() + days);
    return dob.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatBabyAge(days: number): string {
    if (days < 14) return `${days} days`;
    if (days < 120) return `${Math.floor(days / 7)} weeks`;
    return `${Math.floor(days / 30.4)} months`;
  }

  toggleRisk(key: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.riskSelection.update(selection => ({ ...selection, [key]: checked }));
  }

  riskCount(): number {
    return Object.values(this.riskSelection()).filter(Boolean).length;
  }

  riskMessage(): string {
    const count = this.riskCount();
    return count === 0 ? 'No factors ticked. Keep up the routine tests for your age.' : count < 3 ? 'A few things worth checking.' : 'Worth booking a check-up soon.';
  }

  riskAdvice(): string[] {
    return this.riskFactors.filter(factor => this.riskSelection()[factor[0]]).map(factor => factor[2]);
  }
}
