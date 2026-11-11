import { Injectable, signal, inject } from '@angular/core';
import { Doctor, Slot } from '../models';
import { DoctorsService } from './doctors.service';
import { SPEC } from '../../data/specialties.data';
import { HOSP } from '../../data/hospitals.data';
import { MobileSheetService } from './mobile-sheet.service';

export interface ChatMessage {
  role: 'bot' | 'me';
  text: string;
  isHtml?: boolean;
  doctorOptions?: { doctor: Doctor; slot: Slot }[];
}

export interface SmartReplyResult {
  text: string;
  isHtml?: boolean;
  doctorOptions?: { doctor: Doctor; slot: Slot }[];
}

export interface ConversationContext {
  spec: string | null;
  day: number | null;
  part: 'morning' | 'afternoon' | 'evening' | 'night' | null;
  city: string | null;
}

const PART_HOURS: Record<string, [number, number]> = {
  morning: [6, 12],
  afternoon: [12, 17],
  evening: [17, 21],
  night: [19, 24]
};

@Injectable({
  providedIn: 'root'
})
export class PulseAiService {
  private doctorsService = inject(DoctorsService);
  private mobileSheet = inject(MobileSheetService);

  isOpen = signal<boolean>(false);
  language = signal<string>('en-PK');
  messages = signal<ChatMessage[]>([]);
  isListening = signal<boolean>(false);
  context = signal<ConversationContext>({
    spec: null,
    day: null,
    part: null,
    city: null
  });

  constructor() {
    this.initDefaultMessages();
  }

  private initDefaultMessages(): void {
    this.messages.set([
      {
        role: 'bot',
        text: 'Hi, I’m PulseQ. I can answer questions, help with support and book your visit. Tell me what’s wrong or who you’d like to see. You can type in English or Urdu.'
      },
      {
        role: 'me',
        text: '<span class="xs" style="opacity:.8">Example</span><br>Mujhe do din se bukhar hai, kal shaam ko appointment chahiye.',
        isHtml: true
      }
    ]);
  }

  open(): void {
    this.isOpen.set(true);
    this.mobileSheet.open('ai', () => this.isOpen.set(false));
  }

  setLanguage(lang: string): void {
    this.language.set(lang);
  }

  close(): void {
    this.isOpen.set(false);
    this.mobileSheet.close('ai');
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  private hasWord(text: string, list: string[]): boolean {
    return list.some(w => {
      if (/[a-z]/.test(w)) {
        return new RegExp('(^|[^a-z])' + w).test(text);
      }
      return text.includes(w);
    });
  }

  isEmergency(text: string): boolean {
    return this.hasWord(text.toLowerCase(), [
      'emergency',
      "can't breathe",
      'cannot breathe',
      'cant breathe',
      'unconscious',
      'heart attack',
      'heavy bleeding',
      'saans nahi',
      'behosh',
      'بے ہوش'
    ]);
  }

  faq(text: string): string | null {
    const q = text.toLowerCase();
    const link = (href: string, label: string) => `<a href="${href}">${label}</a>`;

    if (/^(hi|hello|hey|salam|assalam|help|what can you do|السلام|سلام|مدد)\b/.test(q)) {
      return "Hi, I’m PulseQ. I can book a doctor visit, answer questions about fees, hospitals, medicine and surgery, and point you to the right page. Tell me what you need. (آپ مجھ سے اردو میں بھی بات کر سکتے ہیں)";
    }
    if (/\b(شکریہ|مہربانی|تھینک یو)\b/.test(q)) {
      return "آپ کا خیر مقدم ہے! کیا میں کسی اور چیز میں آپ کی مدد کر سکتا ہوں؟";
    }
    if (/\b(کینسل|منسوخ|تبدیل)\b/.test(q)) {
      return `آپ ${link('/find-doctors', 'ڈاکٹرز تلاش کریں')} کے صفحے پر 'آپ کے اپائنٹمنٹس' میں جا کر بکنگ منسوخ یا وقت تبدیل کر سکتے ہیں۔`;
    }
    if (/\b(cancel|reschedule)\b|change (my )?(appointment|booking)/.test(q)) {
      return `You can cancel a booking from <b>Your appointments</b> in the ${link('/find-doctors', 'Find doctors')} section. To change the time, cancel it there and book a new slot.`;
    }
    if (/\b(pay|payment|fees?|price|cost|charges?|how much|فیس|پیسے|قیمت)\b/.test(q)) {
      return "The consultation fee is shown on each doctor’s card and when you pick a time. You can pay online or at the clinic. ہر ڈاکٹر کی فیس اس کے کارڈ پر واضح طور پر درج ہے۔";
    }
    if (/\b(medicine|medicines|pharmacy|pharmacies|tablets?|syrup|delivery|prescription|دوائی|ادویات|نسخہ|فارمیسی)\b/.test(q)) {
      return `For medicine, open ${link('/medicine', 'Medicine')}, choose a partner pharmacy in your area, build your pack and place the order. The pharmacy then contacts you to confirm and arrange delivery. You can upload a prescription there too.`;
    }
    if (/\b(surgery|surgeries|operation|surgeon|surgeons|سرجری|آپریشن|سرجن)\b/.test(q)) {
      return `For surgery, open ${link('/surgery', 'Surgery')}, choose the procedure and a hospital, and send your request. The hospital’s patient coordinator contacts you to confirm.`;
    }
    if (/\b(hospitals?|clinics?|opd|timings?|opening|hours|address|insurance|ہسپتال|کلینک)\b/.test(q)) {
      return `Every hospital and clinic is listed under ${link('/hospitals', 'Hospitals')}, with its city, departments and details. Doctor slots show real free times on each doctor’s card.`;
    }
    if (/\b(support|human|agent|contact|complain|phone number|call you|رابطہ|نمبر)\b/.test(q)) {
      return "I’m PulseQ, an automated assistant. For a booking, contact the clinic or hospital on its card. For a severe emergency, call 1122 immediately.";
    }
    if (/^(thanks|thank you|shukria|ok thanks)\b/.test(q)) {
      return "You’re welcome. Anything else I can help with?";
    }
    return null;
  }

  parseMessage(text: string): Partial<ConversationContext> {
    const t = text.toLowerCase();
    const result: Partial<ConversationContext> = {
      spec: this.doctorsService.detectSpecialty(t),
      day: null,
      part: null,
      city: null
    };

    if (this.hasWord(t, ['today', 'aaj', 'آج'])) result.day = 0;
    else if (this.hasWord(t, ['tomorrow', 'tmrw', 'kal ', 'kal$', 'کل'])) result.day = 1;
    else if (this.hasWord(t, ['day after', 'parson', 'پرسوں'])) result.day = 2;
    else {
      const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const today = new Date().getDay();
      for (let i = 0; i < 7; i++) {
        if (new RegExp('(^|[^a-z])' + days[i]).test(t)) {
          const off = (i - today + 7) % 7;
          if (off < 5) result.day = off;
          break;
        }
      }
    }

    if (this.hasWord(t, ['morning', 'subah', 'subha', 'صبح'])) result.part = 'morning';
    else if (this.hasWord(t, ['afternoon', 'dopahar', 'dopehar', 'دوپہر'])) result.part = 'afternoon';
    else if (this.hasWord(t, ['evening', 'shaam', 'sham', 'شام'])) result.part = 'evening';
    else if (this.hasWord(t, ['night', 'raat', 'رات'])) result.part = 'night';

    ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi'].forEach(c => {
      if (t.includes(c.toLowerCase())) result.city = c;
    });

    return result;
  }

  private inPart(time: string, part: 'morning' | 'afternoon' | 'evening' | 'night' | null): boolean {
    if (!part) return true;
    const h = +time.split(':')[0];
    const range = PART_HOURS[part];
    return h >= range[0] && h < range[1];
  }

  findOptions(ctx: ConversationContext): { opts: { doctor: Doctor; slot: Slot }[]; relaxed: boolean } {
    const run = (day: number | null, part: ConversationContext['part']) => {
      const days = day != null ? [day] : [0, 1, 2, 3, 4];
      const res: { doctor: Doctor; slot: Slot }[] = [];
      const hMap = new Map(HOSP.map(h => [h.id, h]));

      this.doctorsService.doctors().forEach(d => {
        if (d.spec !== ctx.spec || d.off) return;
        const hosp = hMap.get(d.h);
        if (ctx.city && hosp && hosp.city !== ctx.city) return;

        outer: for (const o of days) {
          const sl = this.doctorsService.slots(d, o);
          for (const t of sl) {
            if (this.inPart(t, part)) {
              res.push({ doctor: d, slot: { o, t } });
              break outer;
            }
          }
        }
      });
      res.sort((a, b) => a.slot.o - b.slot.o || a.slot.t.localeCompare(b.slot.t));
      return res.slice(0, 3);
    };

    let r = run(ctx.day, ctx.part);
    if (r.length) return { opts: r, relaxed: false };

    r = run(ctx.day, null);
    if (r.length) return { opts: r, relaxed: true };

    r = run(null, null);
    return { opts: r, relaxed: true };
  }

  handleUserMessage(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;

    this.messages.update(m => [...m, { role: 'me', text: trimmed }]);

    if (this.isEmergency(trimmed)) {
      this.messages.update(m => [
        ...m,
        {
          role: 'bot',
          text: 'This sounds urgent. For a severe emergency, please call 1122 immediately or go to the nearest emergency department now. I can book routine visits once you are safe.'
        }
      ]);
      return;
    }

    const faqAnswer = this.faq(trimmed);
    if (faqAnswer) {
      this.messages.update(m => [...m, { role: 'bot', text: faqAnswer, isHtml: true }]);
      return;
    }

    const parsed = this.parseMessage(trimmed);
    const updatedCtx: ConversationContext = {
      spec: parsed.spec || this.context().spec,
      day: parsed.day != null ? parsed.day : this.context().day,
      part: parsed.part || this.context().part,
      city: parsed.city || this.context().city
    };
    this.context.set(updatedCtx);

    if (!updatedCtx.spec) {
      this.messages.update(m => [
        ...m,
        {
          role: 'bot',
          text: 'I can help with that. Tell me what’s bothering you, or which kind of doctor you need, for example skin, heart, child or eye.'
        }
      ]);
      return;
    }

    const match = this.findOptions(updatedCtx);
    const specName = SPEC[updatedCtx.spec] || updatedCtx.spec;

    if (!match.opts.length) {
      this.messages.update(m => [
        ...m,
        {
          role: 'bot',
          text: `I couldn’t find a free ${specName.toLowerCase()} slot this week. Try another city, or browse all doctors below.`
        }
      ]);
      return;
    }

    let intro = `That sounds like a visit for a ${specName.toLowerCase()}. `;
    if (match.relaxed) {
      intro += 'Nothing is free at that time, so here are the nearest slots.';
    } else {
      const dayText =
        updatedCtx.day != null
          ? updatedCtx.day === 0
            ? ' today'
            : updatedCtx.day === 1
            ? ' tomorrow'
            : ' on ' + this.doctorsService.dayLabel(updatedCtx.day)
          : '';
      const partText = updatedCtx.part ? ` in the ${updatedCtx.part}` : '';
      intro += `Here are the earliest free slots${dayText}${partText}.`;
    }
    intro += ' I suggest a type of doctor and can’t diagnose.';

    this.messages.update(m => [
      ...m,
      {
        role: 'bot',
        text: intro,
        doctorOptions: match.opts
      }
    ]);
  }

  getSmartReplyDetailed(text: string): SmartReplyResult {
    const isUrdu = /[\u0600-\u06FF]/.test(text);

    if (this.isEmergency(text)) {
      if (isUrdu || this.hasWord(text.toLowerCase(), ['saans', 'behosh', 'dil ka daura'])) {
        return {
          text: 'یہ شدید ہنگامی نوعیت کا معاملہ ہے۔ برائے مہربانی فوری طور پر 1122 پر کال کریں یا قریبی ہسپتال کے شعبہ حادثات میں تشریف لے جائیں۔'
        };
      }
      return {
        text: 'This sounds urgent. For a severe emergency, call 1122 immediately or visit the nearest hospital emergency room right away.'
      };
    }

    const f = this.faq(text);
    if (f) return { text: f, isHtml: true };

    const p = this.parseMessage(text);
    if (p.spec && SPEC[p.spec]) {
      const match = this.findOptions({
        spec: p.spec ?? null,
        day: p.day ?? null,
        part: p.part ?? null,
        city: p.city ?? null
      });
      const specName = SPEC[p.spec];

      let intro = '';
      if (isUrdu) {
        intro = match.opts.length
          ? `یہ ${specName} (ماہر امراض) کے معائنے سے متعلق ہے۔ نیچے دستیاب ڈاکٹر اور وقت منتخب کریں:`
          : `یہ ${specName} سے متعلق لگتا ہے، لیکن اس وقت کوئی سلاٹ خالی نہیں ملا۔`;
      } else {
        intro = match.opts.length
          ? `That sounds like you may need to see a ${specName}. Here are the available doctors and slots this week:`
          : `That sounds like a ${specName}, but no free slots match right now.`;
      }

      return {
        text: intro,
        doctorOptions: match.opts
      };
    }

    if (isUrdu) {
      return {
        text: "میں PulseQ ہوں، آپ کو ڈاکٹر، ہسپتال یا ادویات تلاش کرنے میں مدد کر سکتا ہوں۔ بتائیں آپ کو کیا تکلیف ہے یا کس ڈاکٹر کی ضرورت ہے؟"
      };
    }
    return {
      text: "I can help you find a doctor, hospital, or medicine. Tell me what symptoms you have or what kind of care you need."
    };
  }

  getSmartReply(text: string): string {
    return this.getSmartReplyDetailed(text).text;
  }
}
