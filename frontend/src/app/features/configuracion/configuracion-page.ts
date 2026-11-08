import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfiguracionStore } from '../../core/configuracion.store';
import { IconComponent } from '../../core/icon.component';
import { Tema, ThemeService } from '../../core/theme.service';
import { FlagComponent } from '../../core/flag.component';
import { IdiomaService } from '../../core/idioma.service';

@Component({
  selector: 'app-configuracion-page',
  imports: [TranslatePipe, FlagComponent, ReactiveFormsModule, IconComponent],
  templateUrl: './configuracion-page.html',
})
export class ConfiguracionPage {
  private readonly store = inject(ConfiguracionStore);
  protected readonly tema = inject(ThemeService);
  protected readonly idioma = inject(IdiomaService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly guardado = signal(false);
  protected readonly error = signal('');

  protected readonly monedas = ['MXN', 'USD', 'EUR', 'CAD', 'GBP'];
  protected readonly zonas = [
    'America/Mexico_City',
    'America/Cancun',
    'America/Monterrey',
    'America/Tijuana',
    'America/Hermosillo',
    'America/Bogota',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/Madrid',
  ];
  protected readonly dias = Array.from({ length: 28 }, (_, i) => i + 1);

  protected readonly form = this.fb.group({
    nombre: ['', Validators.maxLength(100)],
    moneda: ['MXN', [Validators.required, Validators.pattern(/^[A-Za-z]{3}$/)]],
    zonaHoraria: ['America/Mexico_City', Validators.required],
    diaInicioMes: [1, [Validators.required, Validators.min(1), Validators.max(28)]],
    recordatorioActivo: [false],
    recordatorioHora: ['20:00', Validators.required],
  });

  constructor() {
    // Carga el valor guardado cuando llega del servidor.
    effect(() => {
      const c = this.store.config();
      this.form.reset(c, { emitEvent: false });
    });
  }

  protected elegirTema(t: Tema): void {
    this.tema.tema.set(t);
  }

  protected guardar(): void {
    this.guardado.set(false);
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.store.guardar(this.form.getRawValue()).subscribe({
      next: () => this.guardado.set(true),
      error: (e) => this.error.set(this.mensaje(e)),
    });
  }

  private mensaje(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 409 && e.error?.detail) return e.error.detail;
      if (e.status === 400 && e.error?.errors) {
        const primero = Object.values<string[]>(e.error.errors)[0]?.[0];
        if (primero) return primero;
      }
    }
    return 'No se pudo guardar la configuración.';
  }
}
