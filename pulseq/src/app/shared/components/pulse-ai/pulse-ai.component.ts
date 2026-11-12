import { Component, inject, signal, OnDestroy, ViewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PulseAiService } from '../../services/pulse-ai.service';
import { ModalService } from '../../services/modal.service';
import { DoctorsService } from '../../services/doctors.service';
import { HospitalsService } from '../../services/hospitals.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-pulse-ai',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- Floating Fab and Label -->
    @if (!ai.isOpen()) {
      <button class="botlbl" type="button" (click)="ai.open()">Ask PulseQ</button>
      <button
        class="botfab"
        type="button"
        (click)="ai.open()"
        aria-label="Open PulseQ assistant"
        aria-expanded="false">
        <svg width="34" height="34" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M32 8v8" />
          <circle cx="32" cy="7" r="3" fill="currentColor"/>
          <rect x="12" y="16" width="40" height="32" rx="12" />
          <path d="M6 30v8M58 30v8" />
          <circle cx="24" cy="31" r="3.5" fill="currentColor" stroke="none"/>
          <circle cx="40" cy="31" r="3.5" fill="currentColor" stroke="none"/>
          <path d="M24 40c4 3 12 3 16 0"/>
          <path d="M22 48v6h20v-6"/>
        </svg>
      </button>
    }

    <!-- Chat Panel -->
    @if (ai.isOpen()) {
      <button class="bot-backdrop" type="button" aria-label="Close PulseQ assistant" (click)="ai.close()"></button>
      <section class="botpanel" role="dialog" aria-modal="true" aria-label="PulseQ assistant" tabindex="-1">
        <div class="bot-sheet-handle" aria-hidden="true" (touchstart)="onHeadTouchStart($event)" (touchend)="onHeadTouchEnd($event)"></div>
        <div class="chat" style="flex:1;min-height:0;border-radius:0;box-shadow:none">
          <div class="chat-head" (touchstart)="onHeadTouchStart($event)" (touchend)="onHeadTouchEnd($event)">
            <img class="pulse-ai-logo" src="/Pulseq_logo.png" alt="" aria-hidden="true" width="36" height="36">
            <div class="grow">
              <b>PulseQ</b>
              <p class="xs muted" style="margin:0">Answers, support and booking</p>
            </div>
            <div class="lang-switch" role="group" aria-label="Choose chat language">
              <button
                class="lang-option"
                [class.active]="selectedLang === 'en-PK'"
                [attr.aria-pressed]="selectedLang === 'en-PK'"
                type="button"
                (click)="selectedLang = 'en-PK'"
                aria-label="Use English">
                EN
              </button>
              <button
                class="lang-option urdu"
                [class.active]="selectedLang === 'ur-PK'"
                [attr.aria-pressed]="selectedLang === 'ur-PK'"
                type="button"
                (click)="selectedLang = 'ur-PK'"
                aria-label="اردو استعمال کریں">
                اردو
              </button>
            </div>
            <button class="botx" type="button" aria-label="Close assistant" (click)="ai.close()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18"/>
              </svg>
            </button>
          </div>

          <div class="log" #logEl style="flex:1;min-height:0;max-height:none">
            @for (msg of ai.messages(); track $index) {
              @if (msg.role === 'me') {
                <div class="bub me" [attr.dir]="isUrduText(msg.text) ? 'rtl' : 'ltr'">
                  @if (msg.isHtml) {
                    <div [innerHTML]="msg.text"></div>
                  } @else {
                    {{ msg.text }}
                  }
                </div>
              } @else {
                <div class="bub bot" [attr.dir]="isUrduText(msg.text) ? 'rtl' : 'ltr'">
                  @if (msg.isHtml) {
                    <div [innerHTML]="msg.text"></div>
                  } @else {
                    {{ msg.text }}
                  }
                </div>

                @if (msg.doctorOptions) {
                  @for (opt of msg.doctorOptions; track opt.doctor.id + opt.slot.t) {
                    <div class="opt">
                      <div style="display:flex;align-items:center;gap:12px">
                        <div class="avatar t{{ opt.doctor.t }}">
                          {{ getInitials(opt.doctor.name) }}
                        </div>
                        <div class="min0">
                          <b>{{ opt.doctor.name }}</b>
                          <p class="muted sm">{{ getHospName(opt.doctor.h) }} · {{ getHospCity(opt.doctor.h) }}</p>
                        </div>
                      </div>
                      <div style="display:flex;flex-wrap:wrap;gap:8px">
                        <span class="tag">{{ doctorsService.dayLabel(opt.slot.o) }}</span>
                        <span class="tag">{{ doctorsService.formatTime(opt.slot.t) }}</span>
                        <span class="tag">Rs {{ opt.doctor.fee.toLocaleString('en-US') }}</span>
                      </div>
                      <button
                        class="btn btn-ink"
                        (click)="bookSlot(opt.doctor.id, opt.slot.o, opt.slot.t)">
                        Book this slot
                      </button>
                    </div>
                  }
                }
              }
            }

          </div>

          @if (showSuggestions()) {
            <div class="sugs" [attr.dir]="selectedLang === 'ur-PK' ? 'rtl' : 'ltr'">
              @for (s of currentSuggestions(); track s) {
                <button class="sug" type="button" (click)="pickSuggestion(s)">{{ s }}</button>
              }
            </div>
          }

          <!-- Urdu Writing Assistance Options in popup -->
          @if (selectedLang === 'ur-PK') {
            <div class="urdu-quick-wrap" dir="rtl" style="padding:4px 10px">
              <div style="display:flex;align-items:center;justify-content:space-between;width:100%;margin-bottom:4px">
                <span class="xs muted" style="color:var(--mint);font-weight:600">اردو فوری انتخاب:</span>
                <button type="button" class="urdu-kb-toggle-btn" [class.active]="showUrduKeyboard" (click)="showUrduKeyboard = !showUrduKeyboard">
                  ⌨️ {{ showUrduKeyboard ? 'کی بورڈ چھپائیں' : 'آن اسکرین کی بورڈ' }}
                </button>
              </div>
              @for (phrase of urduQuickPhrases; track phrase) {
                <button type="button" class="urdu-chip" (click)="pickSuggestion(phrase)">{{ phrase }}</button>
              }
            </div>

            @if (showUrduKeyboard) {
              <div class="urdu-keyboard" dir="rtl" style="margin:2px 8px 6px">
                <div class="urdu-row">
                  @for (char of urduKeysRow1; track char) {
                    <button type="button" class="urdu-key" (click)="addUrduChar(char)">{{ char }}</button>
                  }
                </div>
                <div class="urdu-row">
                  @for (char of urduKeysRow2; track char) {
                    <button type="button" class="urdu-key" (click)="addUrduChar(char)">{{ char }}</button>
                  }
                </div>
                <div class="urdu-row">
                  @for (char of urduKeysRow3; track char) {
                    <button type="button" class="urdu-key" (click)="addUrduChar(char)">{{ char }}</button>
                  }
                </div>
                <div class="urdu-row">
                  @for (char of urduKeysRow4; track char) {
                    <button type="button" class="urdu-key" (click)="addUrduChar(char)">{{ char }}</button>
                  }
                  <button type="button" class="urdu-key urdu-key-fn" (click)="userInput = ''">صاف</button>
                  <button type="button" class="urdu-key urdu-key-space" (click)="addUrduChar(' ')">اسپیس (Space)</button>
                  <button type="button" class="urdu-key urdu-key-fn" (click)="backspaceUrdu()">⌫ مٹائیں</button>
                </div>
              </div>
            }
          }

          <div class="composer">
            <input
              type="text"
              enterkeyhint="send"
              [attr.aria-label]="selectedLang === 'ur-PK' ? 'PulseQ سے پوچھیں' : 'Message PulseQ assistant'"
              [attr.dir]="selectedLang === 'ur-PK' ? 'rtl' : 'ltr'"
              [placeholder]="selectedLang === 'ur-PK' ? 'PulseQ سے پوچھیں: کیا تکلیف ہے؟' : 'Tell PulseQ what you need…'"
              [(ngModel)]="userInput"
              (keydown.enter)="send()"
              autocomplete="off" />
            <button class="send" type="button" aria-label="Send message" (click)="send()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 12l16-8-6 16-3-7z"></path>
              </svg>
            </button>
          </div>
        </div>
      </section>
    }
  `
})
export class PulseAiComponent implements OnDestroy {
  ai = inject(PulseAiService);
  modal = inject(ModalService);
  doctorsService = inject(DoctorsService);
  hospitalsService = inject(HospitalsService);
  toast = inject(ToastService);

  @ViewChild('logEl') logEl?: ElementRef<HTMLElement>;

  userInput = '';
  private headTouchStartY = 0;
  private lastScrollY = 0;
  private fabObserver?: MutationObserver;
  private handleWindowScroll = () => {
    const scrollY = window.scrollY || 0;
    document.body.classList.toggle('pulse-scrolling-down', scrollY > this.lastScrollY && scrollY > 120);
    this.lastScrollY = scrollY;
    this.scheduleFabOverlapCheck();
  };
  private scheduleFabOverlapCheck = (): void => {
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => this.updateFabOverlap());
    }
  };

  private updateFabOverlap(): void {
    const fab = document.querySelector<HTMLElement>('.botfab');
    if (window.innerWidth > 1023) {
      fab?.style.removeProperty('left');
      fab?.style.removeProperty('right');
      document.body.classList.remove('pulse-fab-overlap');
      return;
    }
    if (!fab) {
      document.body.classList.remove('pulse-fab-overlap');
      return;
    }
    fab.style.removeProperty('left');
    fab.style.removeProperty('right');
    const rect = fab.getBoundingClientRect();
    const contentSelectors = 'button, a[href], input, select, textarea, [contenteditable="true"]';
    const targetRects = Array.from(document.querySelectorAll<HTMLElement>(contentSelectors))
      .filter(element =>
        !element.closest('app-pulse-ai, .public-mobile-nav, .clinic-mobile-nav') &&
        element.getClientRects().length > 0
      )
      .map(element => element.getBoundingClientRect())
      .filter(target => target.width > 0 && target.height > 0);
    const overlapsContent = targetRects.some(target =>
      rect.left < target.right && rect.right > target.left &&
      rect.top < target.bottom && rect.bottom > target.top
    );
    document.body.classList.toggle('pulse-fab-overlap', overlapsContent);
  }

  onHeadTouchStart(e: TouchEvent): void {
    this.headTouchStartY = e.touches[0]?.clientY || 0;
  }

  onHeadTouchEnd(e: TouchEvent): void {
    const endY = e.changedTouches[0]?.clientY || 0;
    if (endY - this.headTouchStartY > 55) {
      this.ai.close();
    }
  }
  get selectedLang(): string {
    return this.ai.language();
  }
  set selectedLang(v: string) {
    this.ai.setLanguage(v);
    this.onLangChange();
  }

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('focusin', this.handleFocusIn);
      document.addEventListener('focusout', this.handleFocusOut);
      this.lastScrollY = window.scrollY || 0;
      window.addEventListener('scroll', this.handleWindowScroll, { passive: true });
      window.addEventListener('resize', this.scheduleFabOverlapCheck, { passive: true });
      this.fabObserver = new MutationObserver(this.scheduleFabOverlapCheck);
      const content = document.querySelector('#content');
      if (content) this.fabObserver.observe(content, { childList: true, subtree: true, attributes: true });
      setTimeout(() => this.scheduleFabOverlapCheck(), 100);
    }
    effect(() => {
      const open = this.ai.isOpen();
      const len = this.ai.messages().length;
      if (typeof document !== 'undefined') {
        document.body.classList.toggle('ai-sheet-open', open);
      }
      if (open) {
        setTimeout(() => {
          document.querySelector<HTMLElement>('.botpanel .botx')?.focus({ preventScroll: true });
        }, 0);
      }
      if (open && len > 0) {
        setTimeout(() => this.scrollLogToBottom(), 30);
      }
    });
  }

  private scrollLogToBottom(): void {
    const el = this.logEl?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('focusin', this.handleFocusIn);
      document.removeEventListener('focusout', this.handleFocusOut);
      window.removeEventListener('scroll', this.handleWindowScroll);
      window.removeEventListener('resize', this.scheduleFabOverlapCheck);
      this.fabObserver?.disconnect();
      document.body.classList.remove('input-focused');
      document.body.classList.remove('pulse-scrolling-down');
      document.body.classList.remove('pulse-fab-overlap');
      document.body.classList.remove('ai-sheet-open');
    }
  }

  private handleFocusIn = (e: FocusEvent) => {
    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      document.body.classList.add('input-focused');
    }
  };

  private handleFocusOut = () => {
    document.body.classList.remove('input-focused');
  };
  showSuggestions = signal<boolean>(true);
  showUrduKeyboard = false;

  sampleSuggestionsEn = [
    "Fever since two days",
    "Skin rash, tomorrow evening",
    "Child check-up on Friday",
    "Dil mein dard, kal subah",
    "How do I order medicine?",
    "How do I book a surgery?"
  ];

  sampleSuggestionsUr = [
    "سر میں دو دن سے شدید درد ہے",
    "جلد پر خارش اور الرجی ہے، کل شام کا وقت چاہیے",
    "بچوں کے ماہر ڈاکٹر کو دکھانا ہے",
    "دل میں درد اور گھبراہٹ ہے",
    "ادویات کا آرڈر کیسے کریں؟",
    "سرجری کیسے بک کریں؟"
  ];

  urduQuickPhrases = [
    'سر میں درد',
    'بخار اور کھانسی',
    'دل کا ڈاکٹر',
    'جلد کی الرجی',
    'بچوں کا معائنہ',
    'دانت کا درد'
  ];

  urduKeysRow1 = ['آ', 'ا', 'ب', 'پ', 'ت', 'ٹ', 'ث', 'ج', 'چ', 'ح', 'خ'];
  urduKeysRow2 = ['د', 'ڈ', 'ذ', 'ر', 'ڑ', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض'];
  urduKeysRow3 = ['ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'ں'];
  urduKeysRow4 = ['و', 'ہ', 'ھ', 'ء', 'ی', 'ے', '،', '؟'];

  currentSuggestions(): string[] {
    return this.selectedLang === 'ur-PK' ? this.sampleSuggestionsUr : this.sampleSuggestionsEn;
  }

  onLangChange(): void {
    this.showUrduKeyboard = false;
  }

  isUrduText(text: string): boolean {
    return /[\u0600-\u06FF]/.test(text);
  }

  addUrduChar(char: string): void {
    this.userInput += char;
  }

  backspaceUrdu(): void {
    if (this.userInput.length > 0) {
      this.userInput = this.userInput.slice(0, -1);
    }
  }

  getInitials(name: string): string {
    return name.replace('Dr. ', '').split(' ').map(w => w[0]).slice(0, 2).join('');
  }

  getHospName(hospId: string): string {
    const h = this.hospitalsService.getHospitalById(hospId);
    return h ? h.name : hospId;
  }

  getHospCity(hospId: string): string {
    const h = this.hospitalsService.getHospitalById(hospId);
    return h ? h.city : '';
  }

  bookSlot(docId: number, o: number, t: string): void {
    this.modal.openBooking(docId, o, t);
  }

  pickSuggestion(text: string): void {
    this.showSuggestions.set(false);
    this.ai.handleUserMessage(text);
  }

  send(): void {
    if (!this.userInput.trim()) return;
    const text = this.userInput.trim();
    this.userInput = '';
    this.showSuggestions.set(false);
    this.ai.handleUserMessage(text);
  }
}
