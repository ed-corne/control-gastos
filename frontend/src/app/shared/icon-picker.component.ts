import { Component, computed, model, signal } from '@angular/core';
import { CATALOGO_ICONOS, IconComponent } from '../core/icon.component';
import { TranslatePipe } from '@ngx-translate/core';

const sinAcentos = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Selector de ícono con buscador. Uso: <app-icon-picker [(valor)]="icono" /> */
@Component({
  selector: 'app-icon-picker',
  imports: [IconComponent, TranslatePipe],
  template: `
    <div class="grid gap-2">
      <input class="input" type="search" [placeholder]="'Buscar ícono (ej. gasolina, mascota, café)…' | translate"
             [attr.aria-label]="'Buscar ícono' | translate" [value]="busqueda()" (input)="busqueda.set($any($event.target).value)" />
      <div class="flex max-h-44 flex-wrap gap-2 overflow-y-auto p-0.5" role="radiogroup" [attr.aria-label]="'Ícono' | translate">
        @for (i of filtrados(); track i.clave) {
          <button type="button" role="radio" [attr.aria-checked]="valor() === i.clave" [attr.aria-label]="i.texto.split(' ')[0]"
                  [title]="i.texto.split(' ')[0]" (click)="valor.set(i.clave)"
                  class="inline-flex size-11 items-center justify-center rounded-xl border-2 bg-surface-2 text-ink"
                  [class.border-primary]="valor() === i.clave" [class.border-transparent]="valor() !== i.clave">
            <app-icon [name]="i.clave" />
          </button>
        } @empty {
          <p class="py-3 text-sm text-muted">{{ 'icono.sin_resultados' | translate: { q: busqueda() } }}</p>
        }
      </div>
    </div>
  `,
})
export class IconPickerComponent {
  readonly valor = model.required<string>();
  protected readonly busqueda = signal('');

  protected readonly filtrados = computed(() => {
    const q = sinAcentos(this.busqueda().trim());
    return q ? CATALOGO_ICONOS.filter((i) => sinAcentos(i.texto + ' ' + i.clave).includes(q)) : CATALOGO_ICONOS;
  });
}
