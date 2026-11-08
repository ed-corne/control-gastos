import { NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ConfiguracionStore } from './core/configuracion.store';
import { HealthService } from './core/health.service';
import { IconComponent } from './core/icon.component';
import { NotificacionesService } from './core/notificaciones.service';
import { ThemeService } from './core/theme.service';
import { MovimientoForm } from './features/movimientos/movimiento-form';
import { MovimientosEstado } from './features/movimientos/movimientos-estado';
import { IdiomaService } from './core/idioma.service';

interface ItemMenu {
  ruta: string;
  etiqueta: string;
  icono: string;
}

@Component({
  selector: 'app-root',
  imports: [TranslatePipe, RouterOutlet, RouterLink, RouterLinkActive, NgTemplateOutlet, MovimientoForm, IconComponent],
  templateUrl: './app.html',
})
export class App {
  private readonly health = inject(HealthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly estado = inject(MovimientosEstado);
  protected readonly config = inject(ConfiguracionStore);
  protected readonly notificaciones = inject(NotificacionesService);
  protected readonly tema = inject(ThemeService);
  protected readonly idioma = inject(IdiomaService);

  protected readonly apiStatus = signal<'cargando' | 'conectada' | 'sin conexión'>('cargando');
  protected readonly panelAbierto = signal(false);
  protected readonly menuAbierto = signal(false);

  protected readonly principal: ItemMenu[] = [
    { ruta: '/resumen', etiqueta: 'Resumen', icono: 'resumen' },
    { ruta: '/movimientos', etiqueta: 'Movimientos', icono: 'movimientos' },
    { ruta: '/presupuestos', etiqueta: 'Presupuestos', icono: 'presupuestos' },
    { ruta: '/metas', etiqueta: 'Metas', icono: 'savings' },
    { ruta: '/reportes', etiqueta: 'Reportes', icono: 'reportes' },
  ];

  protected readonly secundario: ItemMenu[] = [
    { ruta: '/cuentas', etiqueta: 'Cuentas', icono: 'wallet' },
    { ruta: '/categorias', etiqueta: 'Categorías', icono: 'food' },
    { ruta: '/importar', etiqueta: 'Importar', icono: 'importar' },
    { ruta: '/ajustes', etiqueta: 'Ajustes', icono: 'ajustes' },
  ];

  constructor() {
    this.config.cargar();

    // Los avisos se recalculan al guardar movimientos o cambiar la configuración,
    // y cada minuto para que el recordatorio aparezca a su hora.
    effect(() => {
      this.estado.cambios();
      this.config.config();
      untracked(() => this.notificaciones.actualizar());
    });
    const reloj = setInterval(() => this.notificaciones.actualizar(), 60_000);
    this.destroyRef.onDestroy(() => clearInterval(reloj));

    this.health.check().subscribe({
      next: () => this.apiStatus.set('conectada'),
      error: () => this.apiStatus.set('sin conexión'),
    });

    // Al navegar se cierran el menú móvil y el panel de avisos.
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.menuAbierto.set(false);
        this.panelAbierto.set(false);
      });
  }

  protected alternarPanel(): void {
    this.panelAbierto.update((v) => !v);
  }

  protected cerrarPanel(): void {
    this.panelAbierto.set(false);
  }

  protected abrirMenu(): void {
    this.menuAbierto.set(true);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }
}
