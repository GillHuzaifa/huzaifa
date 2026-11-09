import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @if (toast.visible()) {
      <div class="toast" role="status" aria-live="polite">
        {{ toast.message() }}
      </div>
    }
  `
})
export class ToastComponent {
  toast = inject(ToastService);
}
