import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FilaImportacion {
  numero: number;
  fecha: string | null;
  monto: number | null;
  tipo: string | null;
  categoria: string | null;
  cuenta: string | null;
  descripcion: string | null;
}

export interface ImportarRequest {
  cuentaPredeterminadaId: string | null;
  positivosSonGastos: boolean;
  soloValidar: boolean;
  omitirDuplicados: boolean;
  filas: FilaImportacion[];
}

export interface ResultadoFila {
  numero: number;
  estado: 'Valida' | 'Duplicada' | 'Error';
  mensaje: string | null;
}

export interface ResultadoImportacion {
  total: number;
  validas: number;
  duplicadas: number;
  conError: number;
  importadas: number;
  filas: ResultadoFila[];
}

@Injectable({ providedIn: 'root' })
export class ImportacionService {
  private readonly http = inject(HttpClient);

  importar(request: ImportarRequest): Observable<ResultadoImportacion> {
    return this.http.post<ResultadoImportacion>(`${environment.apiUrl}/importacion/movimientos`, request);
  }
}
