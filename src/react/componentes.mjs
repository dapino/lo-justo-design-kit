/**
 * Componentes React del kit.
 *
 * Escritos con createElement en vez de JSX a propósito: así el paquete sigue
 * sin necesitar ni una sola dependencia de compilación. React es peerDependency,
 * que es otra cosa — la pone quien lo usa.
 *
 * Los estilos se inyectan solos al importar cualquier componente. No hay que
 * acordarse de enlazar ningún CSS, que es justo donde se rompen estos kits.
 */

import { createElement as h } from 'react';
import { ponerEstilos } from './estilos.mjs';

const clases = (...xs) => xs.filter(Boolean).join(' ');

/**
 * En el navegador `process` no existe, así que preguntar solo por él apagaba
 * los avisos justo donde más sirven: dentro de un sandbox como Figma Make.
 * Sin señal de entorno se asume desarrollo — esto es un kit de prototipado, y
 * que el componente avise cuando rompes una regla es media gracia del asunto.
 * En un empaquetado de producción NODE_ENV viene definido y los apaga.
 */
const enDesarrollo = (() => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
      return process.env.NODE_ENV !== 'production';
    }
  } catch (_) { /* algunos sandboxes lanzan al tocar process */ }
  return true;
})();

/** Avisa en consola cuando se rompe una regla del sistema. Solo en desarrollo. */
function regla(condicion, mensaje) {
  if (enDesarrollo && !condicion) {
    console.warn('[lo-justo] ' + mensaje);
  }
}

// ---------------------------------------------------------------------------
// Dinero
// ---------------------------------------------------------------------------

/**
 * Formatea un número como pesos colombianos, con el formato exacto de la app:
 * signo peso, espacio, punto de miles, coma para decimales.
 *
 *   formatearPesos(300000)    →  "$ 300.000"
 *   formatearPesos(16531.59)  →  "$ 16.531,59"
 *
 * Nunca abrevia. No existe "$300K" en este sistema.
 */
export function formatearPesos(valor) {
  if (typeof valor === 'string') return valor;

  const signo = valor < 0 ? '-' : '';
  const abs = Math.abs(valor);
  const entero = Math.trunc(abs);
  const centavos = Math.round((abs - entero) * 100);

  const miles = entero.toLocaleString('es-CO', { useGrouping: true });
  return signo + '$ ' + miles + (centavos ? ',' + String(centavos).padStart(2, '0') : '');
}

function partirPesos(valor) {
  const texto = formatearPesos(valor);
  const coma = texto.lastIndexOf(',');
  return coma === -1
    ? { pesos: texto, centavos: null }
    : { pesos: texto.slice(0, coma), centavos: texto.slice(coma) };
}

/**
 * Cifra de dinero. Los centavos van en tamaño reducido, como en la app real.
 * Nunca baja de 32px: es el mínimo del sistema.
 */
export function Cifra({ valor, tamano = 'grande', className, ...resto }) {
  ponerEstilos();
  const { pesos, centavos } = partirPesos(valor);
  return h(
    'p',
    {
      ...resto,
      className: clases(
        'lj-cifra',
        tamano === 'media' && 'lj-cifra--media',
        tamano === 'chica' && 'lj-cifra--chica',
        className
      ),
    },
    pesos,
    centavos ? h('span', { className: 'lj-cifra__centavos' }, centavos) : null
  );
}

// ---------------------------------------------------------------------------
// Contenedor
// ---------------------------------------------------------------------------

/**
 * Envuelve una pantalla. `.lj` activa los componentes y `.lo-justo` activa el
 * modo de baja densidad: texto más grande, área táctil de 56px, y el texto
 * secundario sube a carbón.
 */
export function Pantalla({ modo = 'lo-justo', children, className, ...resto }) {
  ponerEstilos();
  return h(
    'div',
    { ...resto, className: clases('lj', modo === 'lo-justo' && 'lo-justo', 'lj-pantalla', className) },
    children
  );
}

// ---------------------------------------------------------------------------
// Botones
// ---------------------------------------------------------------------------

/**
 * Un solo botón `primario` por pantalla. El amarillo señala LA acción, no UNA.
 * Todo botón lleva texto: no existe la variante de solo ícono.
 */
export function Boton({ variante = 'primario', cargando = false, children, className, ...resto }) {
  ponerEstilos();
  regla(
    children !== undefined && children !== null && children !== '',
    'Boton sin texto. Todo botón lleva texto: ningún ícono solo.'
  );
  return h(
    'button',
    {
      type: 'button',
      ...resto,
      className: clases('lj-boton', 'lj-boton--' + variante, className),
      'data-cargando': cargando ? '' : undefined,
      'aria-busy': cargando || undefined,
    },
    children
  );
}

export function Volver({ children = 'Volver', className, ...resto }) {
  ponerEstilos();
  return h(
    'button',
    { type: 'button', ...resto, className: clases('lj-volver', className) },
    h(
      'svg',
      { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor',
        strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
      h('path', { d: 'm15 18-6-6 6-6' })
    ),
    children
  );
}

// ---------------------------------------------------------------------------
// Tarjetas
// ---------------------------------------------------------------------------

export function Tarjeta({ variante = 'normal', etiqueta, monto, tamanoMonto, nota, children, className, ...resto }) {
  ponerEstilos();
  return h(
    'div',
    {
      ...resto,
      className: clases(
        'lj-tarjeta',
        variante === 'destacada' && 'lj-tarjeta--destacada',
        variante === 'saldo' && 'lj-tarjeta--saldo',
        className
      ),
    },
    etiqueta ? h('p', { className: 'lj-etiqueta' }, etiqueta) : null,
    monto !== undefined
      ? h(Cifra, { valor: monto, tamano: tamanoMonto || (variante === 'saldo' ? 'grande' : 'media') })
      : null,
    nota ? h('p', { className: 'lj-nota' }, nota) : null,
    children
  );
}

/** Fila de acción. Una por fila, nunca en cuadrícula, máximo tres por pantalla. */
export function Accion({ icono, children, className, ...resto }) {
  ponerEstilos();
  return h(
    'button',
    { type: 'button', ...resto, className: clases('lj-accion', className) },
    icono ? h('span', { className: 'lj-accion__icono', 'aria-hidden': true }, icono) : null,
    h('span', null, children),
    h(
      'svg',
      { className: 'lj-accion__flecha', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
      h('path', { d: 'm9 18 6-6-6-6' })
    )
  );
}

// ---------------------------------------------------------------------------
// El agente
// ---------------------------------------------------------------------------

const GLIFO = h(
  'svg',
  { viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--bc-carbon)', strokeWidth: 2.4,
    strokeLinecap: 'round', 'aria-hidden': true },
  h('path', { d: 'M2 8c3-3 5 3 8 0s5 3 8 0' }),
  h('path', { d: 'M2 15c3-3 5 3 8 0s5 3 8 0' })
);

/**
 * El bloque del agente. No es una burbuja de chat: vive dentro del flujo.
 *
 * `cuando` y `movio` no son opcionales por gusto. Cada cosa que dice el agente
 * es una entrada auditable del registro, y eso es lo que lo separa de un
 * chatbot: un chatbot no tiene bitácora de acciones autónomas porque no toma
 * ninguna.
 *
 * Variantes: 'anticipa' (neutro), 'explica' (algo falló), 'exito' (confirma).
 *
 * El texto va en pasado y en primera persona, sobre cosas que ya hizo. Si una
 * frase se puede reemplazar por "¿en qué te puedo ayudar?", está mal escrita.
 */
export function Agente({ variante = 'anticipa', cuando, movio = false, monto, children, className, ...resto }) {
  ponerEstilos();
  regla(
    cuando,
    'Agente sin `cuando`. Cada mensaje del agente es una entrada del registro y lleva su hora.'
  );
  return h(
    'div',
    { ...resto, className: clases('lj-agente', 'lj-agente--' + variante, className) },
    h('span', { className: 'lj-agente__marca', 'aria-hidden': true }, GLIFO),
    h(
      'div',
      null,
      children,
      cuando
        ? h(
            'p',
            { className: 'lj-agente__bitacora' },
            h('span', { className: 'lj-agente__cuando' }, cuando),
            movio ? h('strong', null, 'Moví ' + formatearPesos(monto)) : 'No moví plata'
          )
        : null
    )
  );
}

/** Párrafo dentro del bloque del agente. */
export function AgenteTexto({ children, className, ...resto }) {
  return h('p', { ...resto, className: clases('lj-agente__texto', className) }, children);
}

/**
 * El fallo, con sus tres partes visibles y siempre en el mismo orden.
 *
 * Ningún error sin causa, responsable y siguiente paso. Que las etiquetas sean
 * siempre las mismas es la gracia: se aprende dónde mirar. El hallazgo que
 * originó el sistema es una persona que nunca supo qué había pasado.
 */
export function Fallo({ quePaso, deQuienFue, queSigue, cuando, movio = false, monto, className, ...resto }) {
  ponerEstilos();
  regla(quePaso, 'Fallo sin `quePaso`. Ningún error sin causa.');
  regla(deQuienFue, 'Fallo sin `deQuienFue`. Si fue del banco, hay que decirlo.');
  regla(queSigue, 'Fallo sin `queSigue`. Ningún error sin siguiente paso.');

  return h(
    Agente,
    { variante: 'explica', cuando, movio, monto, className, ...resto },
    h(
      'dl',
      { className: 'lj-tres-partes' },
      h('dt', null, 'Qué pasó'),
      h('dd', null, quePaso),
      h('dt', null, 'De quién fue'),
      h('dd', null, deQuienFue),
      h('dt', null, 'Qué sigue'),
      h('dd', null, queSigue)
    )
  );
}

/**
 * Cuando algo se cae a mitad de una transferencia, lo único que importa es
 * decir con certeza si la plata se movió o no. Nunca "estamos verificando".
 */
export function Certeza({ salio, titulo, monto, nota, className, ...resto }) {
  ponerEstilos();
  return h(
    'div',
    {
      ...resto,
      className: clases('lj-certeza', salio ? 'lj-certeza--si-salio' : 'lj-certeza--no-salio', className),
    },
    h('p', { className: 'lj-certeza__t' }, titulo),
    h(Cifra, { valor: monto, className: 'lj-certeza__cifra' }),
    nota ? h('p', { className: 'lj-nota' }, nota) : null
  );
}

// ---------------------------------------------------------------------------
// Registro
// ---------------------------------------------------------------------------

export function Registro({ children, className, ...resto }) {
  ponerEstilos();
  return h('ul', { ...resto, className: clases('lj-registro', className) }, children);
}

export function EntradaRegistro({ hora, children, movio = false, monto, className, ...resto }) {
  ponerEstilos();
  return h(
    'li',
    { ...resto, className },
    h('p', { className: 'lj-registro__hora' }, hora),
    h('p', { className: 'lj-registro__que' }, children),
    h(
      'span',
      { className: clases('lj-marbete', movio && 'lj-marbete--plata') },
      movio ? 'Moví ' + formatearPesos(monto) : 'No moví plata'
    )
  );
}

export function Dia({ children, className, ...resto }) {
  ponerEstilos();
  return h('p', { ...resto, className: clases('lj-dia', className) }, children);
}

// ---------------------------------------------------------------------------
// Formularios
// ---------------------------------------------------------------------------

/**
 * Campo con label fijo arriba, nunca flotante: el label flotante desaparece al
 * escribir y obliga a recordar qué se estaba llenando.
 *
 * `ayuda` va ANTES de escribir, no después de fallar.
 */
export function Campo({ id, label, ayuda, error, className, ...resto }) {
  ponerEstilos();
  regla(id, 'Campo sin `id`: el label no queda asociado al input.');
  return h(
    'div',
    { className: clases('lj-campo', error && 'lj-campo--error', className) },
    h('label', { htmlFor: id }, label),
    ayuda ? h('p', { className: 'lj-campo__ayuda', id: id + '-ayuda' }, ayuda) : null,
    h('input', { id, 'aria-describedby': ayuda ? id + '-ayuda' : undefined, ...resto }),
    error ? h('p', { className: 'lj-campo__error', role: 'alert' }, error) : null
  );
}

/** El área táctil es la etiqueta entera, no el cuadrito. */
export function Casilla({ children, className, ...resto }) {
  ponerEstilos();
  return h(
    'label',
    { className: clases('lj-casilla', className) },
    h('input', { type: 'checkbox', ...resto }),
    h('span', null, children)
  );
}

// ---------------------------------------------------------------------------
// Resumen y comprobante
// ---------------------------------------------------------------------------

export function Resumen({ children, pegado = false, className, ...resto }) {
  ponerEstilos();
  return h(
    'div',
    { ...resto, className: clases('lj-resumen', pegado && 'lj-resumen--pegado', className) },
    children
  );
}

export function FilaResumen({ etiqueta, valor, monto, secundario, className, ...resto }) {
  ponerEstilos();
  return h(
    'div',
    { ...resto, className: clases('lj-resumen__fila', className) },
    h('p', { className: 'lj-resumen__et' }, etiqueta),
    h(
      'p',
      { className: clases('lj-resumen__va', monto !== undefined && 'lj-resumen__va--cifra') },
      monto !== undefined ? formatearPesos(monto) : valor,
      secundario ? h('span', { className: 'lj-resumen__sec' }, secundario) : null
    )
  );
}

/**
 * Comprobante. Sale de una frase textual de la investigación: alguien va a la
 * sucursal porque "queda uno más tranquilo de tener como la copia de lo que uno
 * hizo". El borde dentado imita el papel.
 */
export function Comprobante({ numero, children, className, ...resto }) {
  ponerEstilos();
  return h(
    'div',
    { ...resto, className: clases('lj-comprobante', className) },
    numero ? h('p', { className: 'lj-comprobante__num' }, numero) : null,
    children,
    h('div', { className: 'lj-dentado', 'aria-hidden': true })
  );
}

// ---------------------------------------------------------------------------
// Navegación
// ---------------------------------------------------------------------------

/**
 * Barra inferior de 3 destinos. El activo se marca con un bloque amarillo
 * completo detrás, ocupando todo el alto: es una decisión inusual y muy
 * reconocible de la app real, y se conserva tal cual.
 *
 * Cada destino lleva ícono Y etiqueta de texto. Nunca ícono solo.
 */
export function Nav({ destinos = [], activo, onCambiar, className, ...resto }) {
  ponerEstilos();
  regla(destinos.length <= 3, 'Nav con más de 3 destinos. El modo simplificado usa 3.');
  regla(
    destinos.every((d) => d.etiqueta),
    'Nav con un destino sin etiqueta de texto. Ningún ícono solo.'
  );
  return h(
    'nav',
    { 'aria-label': 'Principal', ...resto, className: clases('lj-nav', className) },
    destinos.map((d) =>
      h(
        'button',
        {
          key: d.id,
          type: 'button',
          'aria-current': d.id === activo ? 'page' : undefined,
          onClick: onCambiar ? () => onCambiar(d.id) : undefined,
        },
        d.icono,
        d.etiqueta
      )
    )
  );
}

export function Encabezado({ negro = false, children, className, ...resto }) {
  ponerEstilos();
  return h(
    'div',
    { ...resto, className: clases('lj-enc', negro && 'lj-enc--negro', className) },
    children
  );
}

export function Migaja({ children, claro = false, className, ...resto }) {
  return h('p', { ...resto, className: clases('lj-migaja', claro && 'lj-migaja--claro', className) }, children);
}

// ---------------------------------------------------------------------------
// Seguridad
// ---------------------------------------------------------------------------

const ESCUDO = h(
  'svg',
  { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, 'aria-hidden': true },
  h('path', { d: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z' })
);

/** Sello de identidad. Sin esto, nada de lo demás sirve. */
export function Sello({ children = 'Nunca te vamos a pedir tus claves.', className, ...resto }) {
  ponerEstilos();
  return h('p', { ...resto, className: clases('lj-sello', className) }, ESCUDO, h('span', null, children));
}

/**
 * La palabra. El estafador ya sabe el nombre de la persona, así que el nombre
 * no prueba nada. Una palabra que solo ella y el banco conocen, sí.
 */
export function Palabra({ valor, etiqueta = 'Tu palabra', nota, className, ...resto }) {
  ponerEstilos();
  return h(
    'div',
    { ...resto, className: clases('lj-palabra', className) },
    h('p', { className: 'lj-palabra__et' }, etiqueta),
    h('p', { className: 'lj-palabra__val' }, valor),
    nota ? h('p', { className: 'lj-nota' }, nota) : null
  );
}

/** Único sitio donde el amarillo señala un peligro y no una acción. Nunca rojo. */
export function AlertaFraude({ children, className, ...resto }) {
  ponerEstilos();
  return h(
    'div',
    { ...resto, className: clases('lj-alerta-fraude', className) },
    ESCUDO,
    h('div', null, children)
  );
}

/**
 * Lo hago solo / Siempre te pregunto.
 * La información nunca depende solo del color: cada lista lleva su encabezado.
 */
export function Limites({ tipo = 'solo', titulo, items = [], className, ...resto }) {
  ponerEstilos();
  regla(titulo, 'Limites sin `titulo`. La distinción no puede depender solo del color del borde.');
  return h(
    'div',
    { ...resto, className },
    titulo ? h('div', { className: 'lj-titulo-lista' }, h('h2', null, titulo)) : null,
    h(
      'ul',
      { className: clases('lj-limites', 'lj-limites--' + (tipo === 'solo' ? 'solo' : 'pregunto')) },
      items.map((t, i) => h('li', { key: i }, t))
    )
  );
}

// ---------------------------------------------------------------------------
// Esperas
// ---------------------------------------------------------------------------

/** Ninguna espera sin nombre: qué se espera, cuánto lleva, qué pasa si cierra. */
export function Espera({ etiqueta = 'Qué estoy esperando', que, nota, progreso, className, ...resto }) {
  ponerEstilos();
  regla(que, 'Espera sin `que`. Nada de giros infinitos: hay que decir qué se está esperando.');
  return h(
    'div',
    { ...resto, className: clases('lj-espera', className) },
    h('p', { className: 'lj-espera__et' }, etiqueta),
    h('p', { className: 'lj-espera__que' }, que),
    nota ? h('p', { className: 'lj-nota' }, nota) : null,
    progreso !== undefined
      ? h(
          'div',
          { className: 'lj-barra', role: 'progressbar', 'aria-valuenow': progreso,
            'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': que },
          h('span', { style: { width: progreso + '%' } })
        )
      : null
  );
}

/** Tarjeta de Clave Dinámica. Se conserva íntegra de la app real. */
export function ClaveDinamica({ codigo, etiqueta = 'Tu clave de seguridad', restante, porcentaje = 100, className, ...resto }) {
  ponerEstilos();
  return h(
    'div',
    { ...resto, className: clases('lj-clave', className) },
    h('p', { className: 'lj-clave__et' }, etiqueta),
    h('p', { className: 'lj-clave__num' }, codigo),
    restante
      ? h(
          'p',
          { className: 'lj-clave__tiempo' },
          restante,
          h('span', { className: 'lj-clave__barra' }, h('span', { style: { width: porcentaje + '%' } }))
        )
      : null
  );
}

// ---------------------------------------------------------------------------
// Marca
// ---------------------------------------------------------------------------

/**
 * Arcos de marca. Decorativos: van en position absolute para no cobrar espacio
 * vertical en un flujo donde cada píxel está peleado.
 */
export function Arcos({ className, ...resto }) {
  ponerEstilos();
  return h(
    'svg',
    { viewBox: '0 0 280 130', 'aria-hidden': true, ...resto, className: clases('lj-arcos', className) },
    h(
      'g',
      { fill: 'none', strokeWidth: 13, strokeLinecap: 'round' },
      h('path', { d: 'M 190 -40 A 100 100 0 0 1 290 60', stroke: 'var(--bc-amarillo)' }),
      h('path', { d: 'M 158 -40 A 132 132 0 0 1 290 92', stroke: 'var(--bc-coral)' }),
      h('path', { d: 'M 126 -40 A 164 164 0 0 1 290 124', stroke: 'var(--bc-purpura)' }),
      h('path', { d: 'M  94 -40 A 196 196 0 0 1 290 156', stroke: 'var(--bc-turquesa)' })
    )
  );
}

export function Saludo({ children, className, ...resto }) {
  ponerEstilos();
  return h('h1', { ...resto, className: clases('lj-saludo', className) }, children);
}

export function Antetitulo({ children, className, ...resto }) {
  ponerEstilos();
  return h('p', { ...resto, className: clases('lj-antetitulo', className) }, children);
}

export function Nota({ children, className, ...resto }) {
  return h('p', { ...resto, className: clases('lj-nota', className) }, children);
}

export function Etiqueta({ children, className, ...resto }) {
  return h('p', { ...resto, className: clases('lj-etiqueta', className) }, children);
}
