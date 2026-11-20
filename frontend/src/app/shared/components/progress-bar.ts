import { Component, computed, input } from '@angular/core';

/**
 * Barre de progression réutilisable.
 * Utilisation : <app-progress-bar [value]="75" label="Algorithmique" />
 */
@Component({
  selector: 'app-progress-bar',
  template: `
    <div
      class="bar"
      [class.small]="size() === 'small'"
      role="progressbar"
      [attr.aria-valuenow]="clamped()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-label]="label() || 'Progression'"
    >
      <div class="fill" [style.width.%]="clamped()"></div>
    </div>
  `,
  styles: `
    .bar { height: 10px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
    .bar.small { height: 6px; }
    .fill { height: 100%; background: linear-gradient(90deg, #4f46e5, #818cf8); transition: width 0.3s; }
  `,
})
export class ProgressBar {
  /** Valeur entre 0 et 100 */
  readonly value = input(0);
  /** Texte lu par les lecteurs d'écran (accessibilité) */
  readonly label = input('');
  /** Taille : 'normal' ou 'small' */
  readonly size = input<'normal' | 'small'>('normal');

  /** Garde la valeur entre 0 et 100 */
  readonly clamped = computed(() => Math.min(100, Math.max(0, this.value())));
}