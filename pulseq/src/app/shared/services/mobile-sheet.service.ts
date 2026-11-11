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

    const vv = window.visualViewport;
    if (vv) {
      const updateViewport = () => {
        const kb = Math.max(0, Math.round(window.innerHeight - (vv.height + vv.offsetTop)));
        const root = document.documentElement;
        root.style.setProperty('--vv-kb', `${kb}px`);
        root.style.setProperty('--vv-height', `${Math.round(vv.height)}px`);
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
          target.closest('.panel, .kyp, .botpanel, .more-sheet-panel')) {
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
