import { Component, input } from '@angular/core';

/**
 * Bandera del país del idioma (los emojis de banderas no se ven en Windows, por eso son SVG).
 * 'es' → México, 'en' → Estados Unidos.
 */
@Component({
  selector: 'app-flag',
  host: { class: 'inline-flex shrink-0' },
  template: `
    @if (idioma() === 'es') {
      <svg viewBox="0 0 24 16" [attr.width]="width()" [attr.height]="width() * 2 / 3" class="rounded-[3px] ring-1 ring-black/15" aria-hidden="true">
        <rect width="8" height="16" fill="#006847" />
        <rect x="8" width="8" height="16" fill="#ffffff" />
        <rect x="16" width="8" height="16" fill="#ce1126" />
        <circle cx="12" cy="8" r="2.4" fill="#8c5a2b" />
        <path d="M9.9 9.6c.9 1.5 3.3 1.5 4.2 0" fill="none" stroke="#3a8a3a" stroke-width=".7" stroke-linecap="round" />
      </svg>
    } @else {
      <svg viewBox="0 0 24 16" [attr.width]="width()" [attr.height]="width() * 2 / 3" class="rounded-[3px] ring-1 ring-black/15" aria-hidden="true">
        <rect width="24" height="16" fill="#ffffff" />
        @for (i of franjas; track i) {
          <rect [attr.y]="i * 2.46" width="24" height="1.23" fill="#b22234" />
        }
        <rect width="10.5" height="8.6" fill="#3c3b6e" />
        @for (e of estrellas; track $index) {
          <circle [attr.cx]="e[0]" [attr.cy]="e[1]" r=".55" fill="#ffffff" />
        }
      </svg>
    }
  `,
})
export class FlagComponent {
  readonly idioma = input.required<string>();
  readonly width = input(24);

  protected readonly franjas = [0, 1, 2, 3, 4, 5, 6];
  protected readonly estrellas = [1.6, 3.4, 5.2, 7, 8.8].flatMap((x, i) =>
    [1.6, 3.5, 5.4, 7.3].map((y) => [i % 2 ? x + 0.9 : x, y]),
  );
}
