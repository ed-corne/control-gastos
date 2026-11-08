import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  Archive,
  ArchiveRestore,
  ArrowLeftRight,
  Banknote,
  Bell,
  Briefcase,
  Bus,
  Car,
  ChartColumn,
  ChartLine,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clapperboard,
  Copy,
  CreditCard,
  Download,
  FileText,
  Gem,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Info,
  Landmark,
  Laptop,
  LayoutDashboard,
  Lightbulb,
  LifeBuoy,
  ListFilter,
  Menu,
  Moon,
  OctagonX,
  Package,
  Pencil,
  PiggyBank,
  Plane,
  Plus,
  Repeat,
  Settings,
  Shirt,
  Sun,
  Tags,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Upload,
  Utensils,
  Wallet,
  X,
} from 'lucide';

type NodoIcono = [string, Record<string, string | number>];

/**
 * Nombres de íconos de la app. Las claves de cuentas, categorías y metas son las que se guardan en la base
 * de datos (por eso se llaman 'food', 'bank'…); el resto son íconos de interfaz.
 */
const ICONOS: Record<string, NodoIcono[]> = {
  // Navegación e interfaz
  resumen: LayoutDashboard as NodoIcono[],
  movimientos: ArrowLeftRight as NodoIcono[],
  presupuestos: ChartLine as NodoIcono[],
  reportes: ChartColumn as NodoIcono[],
  importar: Upload as NodoIcono[],
  exportar: Download as NodoIcono[],
  ajustes: Settings as NodoIcono[],
  sol: Sun as NodoIcono[],
  luna: Moon as NodoIcono[],
  campana: Bell as NodoIcono[],
  menu: Menu as NodoIcono[],
  cerrar: X as NodoIcono[],
  agregar: Plus as NodoIcono[],
  editar: Pencil as NodoIcono[],
  eliminar: Trash2 as NodoIcono[],
  duplicar: Copy as NodoIcono[],
  archivar: Archive as NodoIcono[],
  restaurar: ArchiveRestore as NodoIcono[],
  filtro: ListFilter as NodoIcono[],
  atras: ChevronLeft as NodoIcono[],
  adelante: ChevronRight as NodoIcono[],
  check: Check as NodoIcono[],
  exito: CircleCheck as NodoIcono[],
  alerta: TriangleAlert as NodoIcono[],
  bloqueo: OctagonX as NodoIcono[],
  info: Info as NodoIcono[],
  sube: TrendingUp as NodoIcono[],
  baja: TrendingDown as NodoIcono[],
  transferencia: Repeat as NodoIcono[],
  archivo: FileText as NodoIcono[],

  // Cuentas
  wallet: Wallet as NodoIcono[],
  cash: Banknote as NodoIcono[],
  bank: Landmark as NodoIcono[],
  card: CreditCard as NodoIcono[],
  savings: PiggyBank as NodoIcono[],
  chart: ChartLine as NodoIcono[],

  // Categorías
  food: Utensils as NodoIcono[],
  transport: Bus as NodoIcono[],
  home: House as NodoIcono[],
  services: Lightbulb as NodoIcono[],
  health: HeartPulse as NodoIcono[],
  entertainment: Clapperboard as NodoIcono[],
  clothes: Shirt as NodoIcono[],
  education: GraduationCap as NodoIcono[],
  salary: Briefcase as NodoIcono[],
  freelance: Laptop as NodoIcono[],
  other: Package as NodoIcono[],

  // Metas
  target: Target as NodoIcono[],
  travel: Plane as NodoIcono[],
  car: Car as NodoIcono[],
  wedding: Gem as NodoIcono[],
  emergency: LifeBuoy as NodoIcono[],
  gift: Gift as NodoIcono[],
};

/** Íconos que se ofrecen al elegir uno al crear cuentas, categorías o metas. */
export const ICONOS_CUENTA_CLAVES = ['wallet', 'cash', 'bank', 'card', 'savings', 'chart'];
export const ICONOS_CATEGORIA_CLAVES = [
  'food', 'transport', 'home', 'services', 'health', 'entertainment',
  'clothes', 'education', 'salary', 'freelance', 'other',
];
export const ICONOS_META_CLAVES = ['target', 'travel', 'home', 'car', 'education', 'wedding', 'emergency', 'gift'];

/**
 * Ícono SVG (Lucide). Uso: <app-icon name="food" [size]="20" />.
 * El contenido sale de un diccionario fijo de la librería, nunca de texto del usuario.
 */
@Component({
  selector: 'app-icon',
  template: `<svg
    xmlns="http://www.w3.org/2000/svg"
    [attr.width]="size()"
    [attr.height]="size()"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    [innerHTML]="contenido()"
  ></svg>`,
  host: { class: 'inline-flex shrink-0 items-center justify-center' },
})
export class IconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input.required<string>();
  readonly size = input(20);

  protected readonly contenido = computed(() => {
    const nodos = ICONOS[this.name()] ?? ICONOS['other'];
    const html = nodos
      .map(([etiqueta, atributos]) => {
        const attrs = Object.entries(atributos)
          .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`)
          .join(' ');
        return `<${etiqueta} ${attrs}/>`;
      })
      .join('');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });
}
