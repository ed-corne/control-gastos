import { Injectable, effect, signal } from '@angular/core';

export type Tema = 'claro' | 'oscuro';

const CLAVE = 'tema';

/**
 * Modo claro / oscuro. Se recuerda en el navegador; la primera vez sigue la preferencia del sistema.
 * El atributo data-theme de <html> lo activa (también lo fija un script en index.html para evitar parpadeos).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly tema = signal<Tema>(this.inicial());

  constructor() {
    effect(() => {
      const t = this.tema();
      document.documentElement.setAttribute('data-theme', t === 'oscuro' ? 'dark' : 'light');
      try {
        localStorage.setItem(CLAVE, t);
      } catch {
        // Sin almacenamiento (modo privado, etc.): el tema simplemente no se recuerda.
      }
    });
  }

  alternar(): void {
    this.tema.update((t) => (t === 'oscuro' ? 'claro' : 'oscuro'));
  }

  private inicial(): Tema {
    try {
      const guardado = localStorage.getItem(CLAVE);
      if (guardado === 'claro' || guardado === 'oscuro') return guardado;
    } catch {
      // se ignora
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  }
}
