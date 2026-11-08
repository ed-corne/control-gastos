import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cuenta, GuardarCuenta, ResumenCuentas } from './cuenta.model';

@Injectable({ providedIn: 'root' })
export class CuentasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/cuentas`;

  listar(incluirArchivadas: boolean): Observable<Cuenta[]> {
    const params = new HttpParams().set('incluirArchivadas', incluirArchivadas);
    return this.http.get<Cuenta[]>(this.url, { params });
  }

  resumen(): Observable<ResumenCuentas> {
    return this.http.get<ResumenCuentas>(`${this.url}/resumen`);
  }

  crear(cuenta: GuardarCuenta): Observable<Cuenta> {
    return this.http.post<Cuenta>(this.url, cuenta);
  }

  editar(id: string, cuenta: GuardarCuenta): Observable<Cuenta> {
    return this.http.put<Cuenta>(`${this.url}/${id}`, cuenta);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  archivar(id: string): Observable<Cuenta> {
    return this.http.patch<Cuenta>(`${this.url}/${id}/archivar`, {});
  }

  restaurar(id: string): Observable<Cuenta> {
    return this.http.patch<Cuenta>(`${this.url}/${id}/restaurar`, {});
  }
}
