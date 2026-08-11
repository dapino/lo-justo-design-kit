import type { ReactNode, ComponentPropsWithoutRef } from 'react';

/** Los tokens del sistema, resueltos a su valor final. */
export declare const tokens: Record<string, string>;

/** El CSS completo del kit, como cadena. */
export declare const css: string;

/** Inyecta el CSS una sola vez. Los componentes la llaman solos. */
export declare function ponerEstilos(): void;

// ---------------------------------------------------------------------------
// Dinero
// ---------------------------------------------------------------------------

/**
 * Formato exacto de la app: `$ 300.000`, `$ 16.531,59`.
 * Nunca abrevia — no existe `$300K` en este sistema.
 */
export declare function formatearPesos(valor: number | string): string;

export interface PropsCifra extends Omit<ComponentPropsWithoutRef<'p'>, 'children'> {
  valor: number | string;
  /** grande 40px · media 32px · chica 22px. Ninguna baja del mínimo de dinero. */
  tamano?: 'grande' | 'media' | 'chica';
}
export declare function Cifra(props: PropsCifra): JSX.Element;

// ---------------------------------------------------------------------------
// Contenedor
// ---------------------------------------------------------------------------

export interface PropsPantalla extends ComponentPropsWithoutRef<'div'> {
  /** `lo-justo` activa la baja densidad. `marca` usa la escala normal. */
  modo?: 'lo-justo' | 'marca';
}
export declare function Pantalla(props: PropsPantalla): JSX.Element;

// ---------------------------------------------------------------------------
// Botones
// ---------------------------------------------------------------------------

export interface PropsBoton extends ComponentPropsWithoutRef<'button'> {
  /** Un solo `primario` por pantalla: el amarillo señala LA acción. */
  variante?: 'primario' | 'secundario' | 'texto';
  /** El texto se mantiene, nunca se vacía el botón. */
  cargando?: boolean;
}
export declare function Boton(props: PropsBoton): JSX.Element;
export declare function Volver(props: ComponentPropsWithoutRef<'button'>): JSX.Element;

// ---------------------------------------------------------------------------
// Tarjetas
// ---------------------------------------------------------------------------

export interface PropsTarjeta extends ComponentPropsWithoutRef<'div'> {
  variante?: 'normal' | 'destacada' | 'saldo';
  etiqueta?: ReactNode;
  monto?: number | string;
  tamanoMonto?: 'grande' | 'media' | 'chica';
  nota?: ReactNode;
}
export declare function Tarjeta(props: PropsTarjeta): JSX.Element;

export interface PropsAccion extends ComponentPropsWithoutRef<'button'> {
  icono?: ReactNode;
}
export declare function Accion(props: PropsAccion): JSX.Element;

// ---------------------------------------------------------------------------
// El agente
// ---------------------------------------------------------------------------

export interface PropsAgente extends ComponentPropsWithoutRef<'div'> {
  /** anticipa (neutro) · explica (algo falló) · exito (confirma) */
  variante?: 'anticipa' | 'explica' | 'exito';
  /** Obligatorio de hecho: cada mensaje es una entrada del registro. */
  cuando: string;
  movio?: boolean;
  monto?: number | string;
}
export declare function Agente(props: PropsAgente): JSX.Element;
export declare function AgenteTexto(props: ComponentPropsWithoutRef<'p'>): JSX.Element;

export interface PropsFallo extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** Qué pasó. */
  quePaso: ReactNode;
  /** De quién fue. Si fue del banco, se dice. */
  deQuienFue: ReactNode;
  /** Qué sigue. Ningún error sin siguiente paso. */
  queSigue: ReactNode;
  cuando: string;
  movio?: boolean;
  monto?: number | string;
}
export declare function Fallo(props: PropsFallo): JSX.Element;

export interface PropsCerteza extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** true = la plata salió · false = no salió. Nunca ambiguo. */
  salio: boolean;
  titulo: ReactNode;
  monto: number | string;
  nota?: ReactNode;
}
export declare function Certeza(props: PropsCerteza): JSX.Element;

// ---------------------------------------------------------------------------
// Registro
// ---------------------------------------------------------------------------

export declare function Registro(props: ComponentPropsWithoutRef<'ul'>): JSX.Element;

export interface PropsEntradaRegistro extends ComponentPropsWithoutRef<'li'> {
  hora: string;
  movio?: boolean;
  monto?: number | string;
}
export declare function EntradaRegistro(props: PropsEntradaRegistro): JSX.Element;
export declare function Dia(props: ComponentPropsWithoutRef<'p'>): JSX.Element;

// ---------------------------------------------------------------------------
// Formularios
// ---------------------------------------------------------------------------

export interface PropsCampo extends ComponentPropsWithoutRef<'input'> {
  id: string;
  label: ReactNode;
  /** Va antes de escribir, no después de fallar. */
  ayuda?: ReactNode;
  error?: ReactNode;
}
export declare function Campo(props: PropsCampo): JSX.Element;
export declare function Casilla(props: ComponentPropsWithoutRef<'input'>): JSX.Element;

// ---------------------------------------------------------------------------
// Resumen y comprobante
// ---------------------------------------------------------------------------

export interface PropsResumen extends ComponentPropsWithoutRef<'div'> {
  pegado?: boolean;
}
export declare function Resumen(props: PropsResumen): JSX.Element;

export interface PropsFilaResumen extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  etiqueta: ReactNode;
  valor?: ReactNode;
  /** Si viene, se formatea como dinero y se muestra en grande. */
  monto?: number | string;
  secundario?: ReactNode;
}
export declare function FilaResumen(props: PropsFilaResumen): JSX.Element;

export interface PropsComprobante extends ComponentPropsWithoutRef<'div'> {
  numero?: ReactNode;
}
export declare function Comprobante(props: PropsComprobante): JSX.Element;

// ---------------------------------------------------------------------------
// Navegación
// ---------------------------------------------------------------------------

export interface Destino {
  id: string;
  /** Obligatoria: ningún ícono solo. */
  etiqueta: ReactNode;
  icono?: ReactNode;
}
export interface PropsNav extends Omit<ComponentPropsWithoutRef<'nav'>, 'onChange'> {
  /** Máximo 3 en el modo simplificado. */
  destinos: Destino[];
  activo?: string;
  onCambiar?: (id: string) => void;
}
export declare function Nav(props: PropsNav): JSX.Element;

export interface PropsEncabezado extends ComponentPropsWithoutRef<'div'> {
  negro?: boolean;
}
export declare function Encabezado(props: PropsEncabezado): JSX.Element;

export interface PropsMigaja extends ComponentPropsWithoutRef<'p'> {
  claro?: boolean;
}
export declare function Migaja(props: PropsMigaja): JSX.Element;

// ---------------------------------------------------------------------------
// Seguridad
// ---------------------------------------------------------------------------

export declare function Sello(props: ComponentPropsWithoutRef<'p'>): JSX.Element;

export interface PropsPalabra extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  valor: ReactNode;
  etiqueta?: ReactNode;
  nota?: ReactNode;
}
export declare function Palabra(props: PropsPalabra): JSX.Element;
export declare function AlertaFraude(props: ComponentPropsWithoutRef<'div'>): JSX.Element;

export interface PropsLimites extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'title'> {
  /** solo = "Lo hago solo" · pregunto = "Siempre te pregunto" */
  tipo?: 'solo' | 'pregunto';
  /** Obligatorio: la distinción no puede depender solo del color. */
  titulo: ReactNode;
  items: ReactNode[];
}
export declare function Limites(props: PropsLimites): JSX.Element;

// ---------------------------------------------------------------------------
// Esperas
// ---------------------------------------------------------------------------

export interface PropsEspera extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  etiqueta?: ReactNode;
  /** Qué se está esperando. Nada de giros infinitos. */
  que: ReactNode;
  nota?: ReactNode;
  progreso?: number;
}
export declare function Espera(props: PropsEspera): JSX.Element;

export interface PropsClaveDinamica extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  codigo: string;
  etiqueta?: ReactNode;
  restante?: ReactNode;
  porcentaje?: number;
}
export declare function ClaveDinamica(props: PropsClaveDinamica): JSX.Element;

// ---------------------------------------------------------------------------
// Marca y tipografía
// ---------------------------------------------------------------------------

export declare function Arcos(props: ComponentPropsWithoutRef<'svg'>): JSX.Element;
export declare function Saludo(props: ComponentPropsWithoutRef<'h1'>): JSX.Element;
export declare function Antetitulo(props: ComponentPropsWithoutRef<'p'>): JSX.Element;
export declare function Nota(props: ComponentPropsWithoutRef<'p'>): JSX.Element;
export declare function Etiqueta(props: ComponentPropsWithoutRef<'p'>): JSX.Element;
