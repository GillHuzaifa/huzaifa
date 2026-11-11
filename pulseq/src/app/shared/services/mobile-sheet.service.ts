import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface SheetEntry {
  id: string;
  onClose: () => void;
  previousFocus: HTMLElement | null;
}

@Injectable({
  providedIn: 'root'
})
export class MobileSheetService {
  private platformId = inject(PLATFORM_ID);
  private stack: SheetEntry[] = [];
  private savedScrollY = 0;
  private isLocked = false;
  private initialized = false;

  private ensureInit(): void {
    if (this.initialized || !isPlatformBrowser(this.platformId)) return;
    this.initialized = true;

    window.addEventListener('popstate', () => {
      if (this.stack.length > 0) {
        const top = this.stack[this.stack.length - 1];
        this.stack.pop();
        this.restoreFocus(top);
        if (this.stack.length === 0) {
          this.unlockScroll();
        }
        top.onClose();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (this.stack.length === 0) return;
      const top = this.stack[this.stack.length - 1];
      const dialog = top.id === 'ai'
        ? document.querySelector<HTMLElement>('.botpanel[role="dialog"]')
        : top.id === 'booking'
          ? document.querySelector<HTMLElement>('.modal [role="dialog"]')
          : document.querySelector<HTMLElement>('.more-sheet-backdrop[role="dialog"]');
      if (!dialog) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        if (window.history.state?.pulseqSheet === top.id) {
          window.history.back();
        } else {
          this.stack.pop();
          if (this.stack.length === 0) this.unlockScroll();
          this.restoreFocus(top);
          top.onClose();
        }
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(element => element.getClientRects().length > 0);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    });

    const vv = window.visualViewport;
    if (vv) {
      const updateViewport = () => {
        const kb = Math.max(0, Math.round(window.innerHeight - (vv.height + vv.offsetTop)));
        const landscape = window.innerWidth > window.innerHeight;
        const sheetRatio = landscape ? 0.92 : 0.72;
        const bookingRatio = landscape ? 0.92 : 0.88;
        const root = document.documentElement;
        root.style.setProperty('--vv-kb', `${kb}px`);
        root.style.setProperty('--vv-height', `${Math.round(vv.height)}px`);
        root.style.setProperty('--vv-sheet-height', `${Math.round(vv.height * sheetRatio)}px`);
        root.style.setProperty('--vv-booking-height', `${Math.round(vv.height * bookingRatio)}px`);
        if (kb > 90) {
          root.classList.add('kb-open');
        } else {
          root.classList.remove('kb-open');
        }
      };
      vv.addEventListener('resize', updateViewport, { passive: true });
      vv.addEventListener('scroll', updateViewport, { passive: true });
      updateViewport();
    }

    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') &&
          target.closest('.panel, .kyp, .more-sheet-panel')) {
        setTimeout(() => {
          target.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 180);
      }
    });
  }

  open(id: string, onClose: () => void): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.ensureInit();

    if (this.stack.some(s => s.id === id)) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    try {
      window.history.pushState({ pulseqSheet: id }, '');
    } catch {
      // Ignore history errors in restricted contexts
    }
    if (this.stack.length === 0) {
      this.lockScroll();
    }

    this.stack.push({ id, onClose, previousFocus });
    const dialogSelector = id === 'ai'
      ? '.botpanel[role="dialog"]'
      : id === 'booking'
        ? '.modal [role="dialog"]'
        : '.more-sheet-backdrop[role="dialog"]';
    setTimeout(() => {
      document.querySelector<HTMLElement>(dialogSelector)?.focus({ preventScroll: true });
    }, 0);
  }

  close(id: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const idx = this.stack.findIndex(s => s.id === id);
    if (idx === -1) return;

    const [entry] = this.stack.splice(idx, 1);
    if (this.stack.length === 0) {
      this.unlockScroll();
    }
    this.restoreFocus(entry);

    if (window.history.state && window.history.state.pulseqSheet === id) {
      try {
        window.history.back();
      } catch {
        // Ignore history errors
      }
    }
  }

  private lockScroll(): void {
    if (this.isLocked) return;
    this.savedScrollY = window.scrollY || window.pageYOffset || 0;
    const body = document.body;
    body.style.position = 'fixed';
    body.style.top = `-${this.savedScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    document.documentElement.classList.add('sheet-scroll-locked');
    this.isLocked = true;
  }

  private unlockScroll(): void {
    if (!this.isLocked) return;
    const targetY = this.savedScrollY;
    const body = document.body;
    const html = document.documentElement;
    const prevScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.width = '';
    html.classList.remove('sheet-scroll-locked');
    window.scrollTo(0, targetY);
    requestAnimationFrame(() => window.scrollTo(0, targetY));
    setTimeout(() => {
      window.scrollTo(0, targetY);
      html.style.scrollBehavior = prevScrollBehavior;
    }, 50);
    this.isLocked = false;
  }

  private restoreFocus(entry: SheetEntry): void {
    if (entry.previousFocus && document.contains(entry.previousFocus)) {
      setTimeout(() => {
        try {
          entry.previousFocus?.focus({ preventScroll: true });
        } catch {
          // Ignore focus errors
        }
      }, 30);
    }
  }
}
