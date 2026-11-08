import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  Coffee,
  ShoppingCart,
  ShoppingBag,
  Fuel,
  Phone,
  Wifi,
  Dumbbell,
  Baby,
  Dog,
  Cat,
  Gamepad2,
  BookOpen,
  Pizza,
  Beer,
  Pill,
  Stethoscope,
  Scissors,
  Wrench,
  Smartphone,
  Tv,
  Heart,
  Shield,
  Receipt,
  Coins,
  Percent,
  Bike,
  TrainFront,
  Droplet,
  Flame,
  Zap,
  Sprout,
  Building,
  Tag,
  Star,
  Camera,
  Palette,
  Hammer,
  Umbrella,
  Fish,
  Apple,
  CakeSlice,
  Popcorn,
  Ticket,
  Trophy,
  Sofa,
  Bed,
  PawPrint,
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

  // Más íconos (se buscan por nombre al crear una categoría)
  coffee: Coffee as NodoIcono[],
  cart: ShoppingCart as NodoIcono[],
  bag: ShoppingBag as NodoIcono[],
  fuel: Fuel as NodoIcono[],
  phone: Phone as NodoIcono[],
  wifi: Wifi as NodoIcono[],
  gym: Dumbbell as NodoIcono[],
  baby: Baby as NodoIcono[],
  dog: Dog as NodoIcono[],
  cat: Cat as NodoIcono[],
  games: Gamepad2 as NodoIcono[],
  books: BookOpen as NodoIcono[],
  pizza: Pizza as NodoIcono[],
  beer: Beer as NodoIcono[],
  pharmacy: Pill as NodoIcono[],
  doctor: Stethoscope as NodoIcono[],
  haircut: Scissors as NodoIcono[],
  repairs: Wrench as NodoIcono[],
  mobile: Smartphone as NodoIcono[],
  tv: Tv as NodoIcono[],
  heart: Heart as NodoIcono[],
  insurance: Shield as NodoIcono[],
  receipt: Receipt as NodoIcono[],
  coins: Coins as NodoIcono[],
  taxes: Percent as NodoIcono[],
  bike: Bike as NodoIcono[],
  train: TrainFront as NodoIcono[],
  water: Droplet as NodoIcono[],
  gas: Flame as NodoIcono[],
  electricity: Zap as NodoIcono[],
  garden: Sprout as NodoIcono[],
  building: Building as NodoIcono[],
  tag: Tag as NodoIcono[],
  star: Star as NodoIcono[],
  camera: Camera as NodoIcono[],
  art: Palette as NodoIcono[],
  tools: Hammer as NodoIcono[],
  umbrella: Umbrella as NodoIcono[],
  fish: Fish as NodoIcono[],
  fruit: Apple as NodoIcono[],
  cake: CakeSlice as NodoIcono[],
  cinema: Popcorn as NodoIcono[],
  tickets: Ticket as NodoIcono[],
  trophy: Trophy as NodoIcono[],
  furniture: Sofa as NodoIcono[],
  hotel: Bed as NodoIcono[],
  pets: PawPrint as NodoIcono[],
};

/** Íconos que se ofrecen al elegir uno al crear cuentas, categorías o metas. */
export const ICONOS_CUENTA_CLAVES = ['wallet', 'cash', 'bank', 'card', 'savings', 'chart'];
export const ICONOS_CATEGORIA_CLAVES = [
  'food', 'transport', 'home', 'services', 'health', 'entertainment',
  'clothes', 'education', 'salary', 'freelance', 'other',
];
export const ICONOS_META_CLAVES = ['target', 'travel', 'home', 'car', 'education', 'wedding', 'emergency', 'gift'];

/** Catálogo del buscador de íconos de categorías: clave guardada + palabras con las que se encuentra. */
export const CATALOGO_ICONOS: { clave: string; texto: string }[] = [
  { clave: 'food', texto: 'comida restaurante cubiertos comer' },
  { clave: 'coffee', texto: 'café cafetería desayuno bebida' },
  { clave: 'pizza', texto: 'pizza comida rápida antojos' },
  { clave: 'beer', texto: 'cerveza bar alcohol fiesta salidas' },
  { clave: 'fruit', texto: 'fruta manzana despensa súper mercado' },
  { clave: 'cake', texto: 'pastel postre cumpleaños dulce' },
  { clave: 'cart', texto: 'carrito súper supermercado compras mandado' },
  { clave: 'bag', texto: 'bolsa compras tienda' },
  { clave: 'transport', texto: 'transporte camión autobús bus' },
  { clave: 'car', texto: 'auto carro coche vehículo' },
  { clave: 'fuel', texto: 'gasolina combustible' },
  { clave: 'train', texto: 'tren metro' },
  { clave: 'bike', texto: 'bicicleta bici deporte' },
  { clave: 'travel', texto: 'viaje avión vuelo vacaciones' },
  { clave: 'hotel', texto: 'hotel cama hospedaje dormir' },
  { clave: 'home', texto: 'casa vivienda renta hogar alquiler' },
  { clave: 'furniture', texto: 'muebles sofá sala decoración' },
  { clave: 'tools', texto: 'herramientas martillo construcción' },
  { clave: 'repairs', texto: 'reparaciones mantenimiento llave' },
  { clave: 'garden', texto: 'jardín plantas' },
  { clave: 'services', texto: 'servicios luz foco' },
  { clave: 'electricity', texto: 'electricidad luz energía' },
  { clave: 'water', texto: 'agua gota' },
  { clave: 'gas', texto: 'gas fuego estufa' },
  { clave: 'wifi', texto: 'internet wifi red' },
  { clave: 'phone', texto: 'teléfono llamadas' },
  { clave: 'mobile', texto: 'celular móvil smartphone plan' },
  { clave: 'tv', texto: 'televisión streaming cable suscripción' },
  { clave: 'health', texto: 'salud médico corazón' },
  { clave: 'doctor', texto: 'doctor consulta estetoscopio hospital' },
  { clave: 'pharmacy', texto: 'farmacia medicinas pastillas' },
  { clave: 'gym', texto: 'gimnasio ejercicio pesas deporte' },
  { clave: 'haircut', texto: 'peluquería corte cabello belleza tijeras' },
  { clave: 'entertainment', texto: 'entretenimiento cine películas diversión' },
  { clave: 'cinema', texto: 'cine palomitas películas' },
  { clave: 'games', texto: 'videojuegos juegos consola' },
  { clave: 'tickets', texto: 'boletos conciertos eventos entradas' },
  { clave: 'art', texto: 'arte pintura hobby pasatiempo' },
  { clave: 'camera', texto: 'cámara fotos fotografía' },
  { clave: 'clothes', texto: 'ropa camisa vestir' },
  { clave: 'education', texto: 'educación escuela universidad estudio colegiatura' },
  { clave: 'books', texto: 'libros lectura cursos' },
  { clave: 'baby', texto: 'bebé hijos niños guardería' },
  { clave: 'dog', texto: 'perro mascota' },
  { clave: 'cat', texto: 'gato mascota' },
  { clave: 'pets', texto: 'mascotas huellas veterinario' },
  { clave: 'gift', texto: 'regalo obsequio donación' },
  { clave: 'heart', texto: 'amor pareja caridad' },
  { clave: 'insurance', texto: 'seguro escudo protección' },
  { clave: 'taxes', texto: 'impuestos porcentaje comisión intereses' },
  { clave: 'receipt', texto: 'recibo factura ticket' },
  { clave: 'coins', texto: 'monedas dinero cambio' },
  { clave: 'savings', texto: 'ahorro alcancía' },
  { clave: 'salary', texto: 'sueldo salario trabajo maletín nómina' },
  { clave: 'freelance', texto: 'freelance computadora laptop independiente' },
  { clave: 'building', texto: 'edificio oficina empresa negocio' },
  { clave: 'chart', texto: 'inversión gráfica rendimiento' },
  { clave: 'star', texto: 'favorito estrella' },
  { clave: 'trophy', texto: 'premio trofeo bono' },
  { clave: 'umbrella', texto: 'paraguas imprevistos' },
  { clave: 'fish', texto: 'pescado mariscos' },
  { clave: 'tag', texto: 'etiqueta oferta descuento' },
  { clave: 'other', texto: 'otros varios paquete general' },
];

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
