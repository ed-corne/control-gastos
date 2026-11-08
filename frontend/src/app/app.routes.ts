import { Routes } from '@angular/router';
import { CategoriasPage } from './features/categorias/categorias-page';
import { CuentasPage } from './features/cuentas/cuentas-page';
import { MetasPage } from './features/metas/metas-page';
import { PresupuestosPage } from './features/presupuestos/presupuestos-page';
import { MovimientosPage } from './features/movimientos/movimientos-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'movimientos' },
  { path: 'movimientos', component: MovimientosPage },
  { path: 'metas', component: MetasPage },
  { path: 'cuentas', component: CuentasPage },
  { path: 'presupuestos', component: PresupuestosPage },
  { path: 'categorias', component: CategoriasPage },
];
