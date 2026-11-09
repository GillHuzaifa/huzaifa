import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);

  setPage(titleText: string, descriptionText?: string): void {
    this.updateTitle(titleText);
    const desc = descriptionText || "PulseQ: book doctors, hospitals, surgery consultations and medicine online in Pakistan, by search, voice or message.";
    this.updateMeta(desc);
  }

  updateTitle(titleText: string): void {
    const fullTitle = titleText.includes('PulseQ') ? titleText : `${titleText} · PulseQ`;
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
  }

  updateMeta(descriptionText: string): void {
    this.meta.updateTag({ name: 'description', content: descriptionText });
    this.meta.updateTag({ property: 'og:description', content: descriptionText });
  }
}
