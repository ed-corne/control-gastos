import { Routes } from '@angular/router';
import { CategoriasPage } from './features/categorias/categorias-page';
import { CuentasPage } from './features/cuentas/cuentas-page';
import { DashboardPage } from './features/dashboard/dashboard-page';
import { ReportesPage } from './features/dashboard/reportes-page';
import { ConfiguracionPage } from './features/configuracion/configuracion-page';
import { ImportarPage } from './features/importacion/importar-page';
import { MetasPage } from './features/metas/metas-page';
import { PresupuestosPage } from './features/presupuestos/presupuestos-page';
import { MovimientosPage } from './features/movimientos/movimientos-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'resumen' },
  { path: 'resumen', component: DashboardPage },
  { path: 'reportes', component: ReportesPage },
  { path: 'movimientos', component: MovimientosPage },
  { path: 'importar', component: ImportarPage },
  { path: 'metas', component: MetasPage },
  { path: 'cuentas', component: CuentasPage },
  { path: 'presupuestos', component: PresupuestosPage },
  { path: 'categorias', component: CategoriasPage },
  { path: 'ajustes', component: ConfiguracionPage },
];
