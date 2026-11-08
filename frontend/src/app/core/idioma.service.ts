import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Idioma = 'es' | 'en';

const CLAVE = 'idioma';

/** Idioma guardado por el usuario; si no hay, el del navegador (inglés si empieza con "en", si no español). */
export function idiomaInicial(): Idioma {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado === 'es' || guardado === 'en') return guardado;
  } catch {
    // sin almacenamiento: se usa el del navegador
  }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es';
}

@Injectable({ providedIn: 'root' })
export class IdiomaService {
  private readonly traductor = inject(TranslateService);

  readonly disponibles: { codigo: Idioma; nombre: string }[] = [
    { codigo: 'es', nombre: 'Español' },
    { codigo: 'en', nombre: 'English' },
  ];

  readonly lang = signal<Idioma>(idiomaInicial());

  /** Configuración regional para fechas y monedas. */
  readonly locale = computed(() => (this.lang() === 'en' ? 'en-US' : 'es-MX'));

  constructor() {
    document.documentElement.lang = this.lang();
  }

  elegir(idioma: Idioma): void {
    if (idioma === this.lang()) return;
    // Se cambia la señal cuando el archivo de textos ya cargó, para que todo se repinte de una vez.
    this.traductor.use(idioma).subscribe(() => {
      this.lang.set(idioma);
      document.documentElement.lang = idioma;
      try {
        localStorage.setItem(CLAVE, idioma);
      } catch {
        // sin almacenamiento: el cambio vale solo para esta sesión
      }
    });
  }

  alternar(): void {
    this.elegir(this.lang() === 'es' ? 'en' : 'es');
  }
}
