import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  message = signal<string>('');
  visible = signal<boolean>(false);
  private timer: any = null;

  show(msg: string, durationMs: number = 3200): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.message.set(msg);
    this.visible.set(true);

    this.timer = setTimeout(() => {
      this.visible.set(false);
    }, durationMs);
  }

  hide(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.visible.set(false);
  }
}
