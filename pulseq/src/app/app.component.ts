import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { PulseAiComponent } from './shared/components/pulse-ai/pulse-ai.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HeaderComponent,
    FooterComponent,
    ToastComponent,
    ModalComponent,
    PulseAiComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private router = inject(Router);
  currentView = signal<string>('home');
  showMoreSheet = false;

  toggleMoreSheet(): void {
    this.showMoreSheet = !this.showMoreSheet;
  }

  closeMoreSheet(): void {
    this.showMoreSheet = false;
  }

  isMoreActive(): boolean {
    const v = this.currentView();
    return ['surgery', 'clinics', 'about', 'privacy', 'terms', 'contact'].includes(v);
  }

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.closeMoreSheet();
      const url = e.urlAfterRedirects.split('?')[0].split('#')[0];
      if (url === '/' || url === '') {
        this.currentView.set('home');
      } else if (url.startsWith('/find-doctors')) {
        this.currentView.set('find');
      } else if (url.startsWith('/doctor/')) {
        this.currentView.set('doctor');
      } else if (url.startsWith('/hospitals') || url.startsWith('/hospital/')) {
        this.currentView.set('hosps');
      } else if (url.startsWith('/surgery')) {
        this.currentView.set('surgery');
      } else if (url.startsWith('/medicine')) {
        this.currentView.set('medicine');
      } else if (url.startsWith('/clinics')) {
        this.currentView.set('clinics');
      } else if (url.startsWith('/about')) {
        this.currentView.set('about');
      } else if (url.startsWith('/privacy')) {
        this.currentView.set('privacy');
      } else if (url.startsWith('/terms')) {
        this.currentView.set('terms');
      } else if (url.startsWith('/contact')) {
        this.currentView.set('contact');
      } else {
        this.currentView.set('home');
      }
    });
  }
}
