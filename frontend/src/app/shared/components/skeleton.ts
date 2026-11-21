import { Component, input } from '@angular/core';

/**
 * Squelette de chargement réutilisable.
 * Utilisation : <app-skeleton height="96px" />
 */
@Component({
  selector: 'app-skeleton',
  template: `<div class="skeleton" [style.height]="height()" aria-hidden="true"></div>`,
  styles: `
    :host { display: block; }
    .skeleton {
      border-radius: 14px;
      background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
      background-size: 200% 100%;
      animation: shimmer 1.2s infinite;
    }
    @keyframes shimmer { to { background-position: -200% 0; } }
  `,
})
export class Skeleton {
  readonly height = input('100px');
}