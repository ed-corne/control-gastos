import { Component, HostListener, input, output } from '@angular/core';
import { IconComponent } from '../core/icon.component';

/**
 * Ventana modal para crear o editar: en móvil sube desde abajo, en escritorio queda centrada.
 * Uso: <app-modal titulo="Nueva cuenta" (cerrar)="cancelar()"> …formulario… </app-modal>
 */
@Component({
  selector: 'app-modal',
  imports: [IconComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true"
         [attr.aria-label]="titulo()">
      <button type="button" class="absolute inset-0 bg-black/50" (click)="cerrar.emit()" aria-label="Cerrar ventana"></button>
      <div class="relative grid max-h-[92dvh] w-full max-w-lg content-start gap-4 overflow-y-auto rounded-t-3xl border border-line bg-surface p-4 shadow-2xl sm:rounded-3xl sm:p-6">
        <header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-ink">{{ titulo() }}</h2>
          <button type="button" class="btn-icon" (click)="cerrar.emit()" aria-label="Cerrar"><app-icon name="cerrar" /></button>
        </header>
        <ng-content />
      </div>
    </div>
  `,
})
export class ModalComponent {
  readonly titulo = input.required<string>();
  readonly cerrar = output<void>();

  @HostListener('document:keydown.escape')
  protected alEscape(): void {
    this.cerrar.emit();
  }
}
