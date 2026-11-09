import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  isDark = signal<boolean>(false);

  constructor() {
    if (this.isBrowser) {
      const saved = localStorage.getItem('pulseq.theme');
      if (saved === 'dark') {
        this.setDark(true);
      }
    }
  }

  toggle(): void {
    this.setDark(!this.isDark());
  }

  setDark(dark: boolean): void {
    this.isDark.set(dark);
    if (this.isBrowser) {
      try {
        localStorage.setItem('pulseq.theme', dark ? 'dark' : 'light');
        if (dark) {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
      } catch {
        // Ignored
      }
    }
  }
}
