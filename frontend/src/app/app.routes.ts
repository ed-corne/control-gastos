import { Routes } from '@angular/router';
import { CuentasPage } from './features/cuentas/cuentas-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'cuentas' },
  { path: 'cuentas', component: CuentasPage },
];
