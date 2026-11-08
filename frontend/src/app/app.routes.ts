import { Routes } from '@angular/router';
import { CategoriasPage } from './features/categorias/categorias-page';
import { CuentasPage } from './features/cuentas/cuentas-page';
import { MovimientosPage } from './features/movimientos/movimientos-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'movimientos' },
  { path: 'movimientos', component: MovimientosPage },
  { path: 'cuentas', component: CuentasPage },
  { path: 'categorias', component: CategoriasPage },
];
