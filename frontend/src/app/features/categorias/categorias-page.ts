import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconComponent } from '../../core/icon.component';
import { IconPickerComponent } from '../../shared/icon-picker.component';
import { ModalComponent } from '../../shared/modal.component';
import { Categoria, TipoCategoria } from './categoria.model';
import { CategoriasService } from './categorias.service';

@Component({
  selector: 'app-categorias-page',
  imports: [ReactiveFormsModule, IconComponent, IconPickerComponent, ModalComponent],
  templateUrl: './categorias-page.html',
})
export class CategoriasPage {
  private readonly api = inject(CategoriasService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly tipos: TipoCategoria[] = ['Gasto', 'Ingreso'];

  protected readonly tipoActivo = signal<TipoCategoria>('Gasto');
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly incluirArchivadas = signal(false);
  protected readonly error = signal('');
  protected readonly formularioAbierto = signal(false);
  protected readonly editandoId = signal<string | null>(null);

  protected readonly titulo = computed(() =>
    this.editandoId() ? 'Editar categoría' : `Nueva categoría de ${this.tipoActivo().toLowerCase()}`,
  );

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    color: ['#6b7280', [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
    icono: ['other', Validators.required],
    comentario: ['', Validators.maxLength(300)],
  });

  constructor() {
    this.cargar();
  }

  protected cambiarTipo(tipo: TipoCategoria): void {
    this.tipoActivo.set(tipo);
    this.formularioAbierto.set(false);
    this.cargar();
  }

  protected alternarArchivadas(): void {
    this.incluirArchivadas.update((v) => !v);
    this.cargar();
  }

  protected nueva(): void {
    this.editandoId.set(null);
    this.error.set('');
    this.form.reset({ nombre: '', color: '#6b7280', icono: 'other', comentario: '' });
    this.formularioAbierto.set(true);
  }

  protected editar(c: Categoria): void {
    this.editandoId.set(c.id);
    this.error.set('');
    this.form.reset({ nombre: c.nombre, color: c.color, icono: c.icono, comentario: c.comentario ?? '' });
    this.formularioAbierto.set(true);
  }

  protected cancelar(): void {
    this.formularioAbierto.set(false);
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set('');
    const datos = { ...this.form.getRawValue(), tipo: this.tipoActivo() };
    const id = this.editandoId();
    const peticion = id ? this.api.editar(id, datos) : this.api.crear(datos);

    peticion.subscribe({
      next: () => {
        this.formularioAbierto.set(false);
        this.cargar();
      },
      error: (e) => this.error.set(this.mensaje(e, 'No se pudo guardar la categoría.')),
    });
  }

  protected alternarArchivo(c: Categoria): void {
    const accion = c.archivada ? this.api.restaurar(c.id) : this.api.archivar(c.id);
    accion.subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(this.mensaje(e, 'No se pudo actualizar la categoría.')),
    });
  }

  private cargar(): void {
    this.error.set('');
    this.api.listar(this.tipoActivo(), this.incluirArchivadas()).subscribe({
      next: (lista) => this.categorias.set(lista),
      error: () => this.error.set('No se pudieron cargar las categorías. ¿Está corriendo la API?'),
    });
  }

  private mensaje(e: unknown, porDefecto: string): string {
    return e instanceof HttpErrorResponse && e.status === 409 && e.error?.detail
      ? e.error.detail
      : porDefecto;
  }
}
