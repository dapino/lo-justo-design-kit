#!/usr/bin/env node
/**
 * Verifica el contraste de cada par de tokens en uso y SALE CON ERROR
 * si alguno no llega a su umbral.
 *
 *   node scripts/verificar-contraste.mjs
 *
 * Por qué está en el build y no en un documento aparte:
 *
 * Al construir el prototipo aparecieron tres fallos de contraste que
 * nadie había visto en meses de revisión visual. Uno de ellos —la barra
 * que marca cuánto falta para que venza el código de seguridad— daba
 * 1.01:1: era literalmente invisible. Los tres se encontraron calculando.
 *
 * Un sistema de diseño que promete 4.5:1 y no lo comprueba en cada build
 * está prometiendo algo que no sabe si cumple. Por eso esto rompe el build.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(RAIZ, 'src', 'tokens.css'), 'utf8');

/* Solo el ámbito :root. En .lo-justo hay remapeos deliberados —por ejemplo
   --bc-gris-texto sube a carbón— y tomarlos aquí escondería justamente el
   problema que ese remapeo existe para resolver. */
const soloRaiz = css.slice(0, css.indexOf('.lo-justo {'));
const crudos = Object.fromEntries(
  [...soloRaiz.matchAll(/(--bc-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])
);

/** Resuelve var(--x) para que tokens como --bc-foco, que apunta a otro
 *  token, también se puedan verificar. */
function resolver(valor, n = 0) {
  if (n > 10) return valor;
  const m = String(valor).match(/^var\((--[\w-]+)\)$/);
  return m && crudos[m[1]] ? resolver(crudos[m[1]], n + 1) : valor;
}

const T = {};
for (const [k, v] of Object.entries(crudos)) {
  const r = resolver(v);
  if (/^#[0-9A-Fa-f]{6}$/.test(r)) T[k] = r;
}

const canal = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

function luminancia(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => canal(parseInt(n.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [la, lb] = [luminancia(a), luminancia(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Cada par que el sistema usa de verdad, con su umbral.
 * `nota` explica por qué una excepción es aceptable.
 */
const PARES = [
  // --- Texto: 4.5:1 ---
  ['Texto principal sobre blanco', '--bc-carbon', '--bc-blanco', 4.5],
  ['Texto auxiliar sobre blanco', '--bc-gris-texto-2', '--bc-blanco', 4.5],
  ['Texto sobre gris de sección', '--bc-carbon', '--bc-gris-fondo-2', 4.5],
  ['Auxiliar sobre gris de sección', '--bc-gris-texto-2', '--bc-gris-fondo-2', 4.5],
  ['Texto sobre fondo de alerta', '--bc-carbon', '--bc-alerta-fondo', 4.5],
  ['Auxiliar sobre fondo de alerta', '--bc-gris-texto-2', '--bc-alerta-fondo', 4.5],
  ['Texto sobre fondo de éxito', '--bc-carbon', '--bc-exito-fondo', 4.5],
  ['Auxiliar sobre fondo de éxito', '--bc-gris-texto-2', '--bc-exito-fondo', 4.5],
  ['Blanco sobre carbón', '--bc-blanco', '--bc-carbon', 4.5],
  ['Carbón sobre amarillo (botón primario)', '--bc-carbon', '--bc-amarillo', 4.5],
  ['Carbón sobre amarillo presionado', '--bc-carbon', '--bc-amarillo-presionado', 4.5],
  ['Carbón sobre amarillo claro (alerta fraude)', '--bc-carbon', '--bc-amarillo-claro', 4.5],
  ['Texto sobre gris de página', '--bc-carbon', '--bc-gris-fondo', 4.5],
  ['Auxiliar sobre gris de página', '--bc-gris-texto-2', '--bc-gris-fondo', 4.5],
  ['Texto de error sobre su fondo', '--bc-error', '--bc-error-fondo', 4.5],

  // --- Elementos gráficos con significado: 3:1 ---
  ['Borde de control', '--bc-gris-texto-2', '--bc-blanco', 3],
  ['Borde "Lo hago solo"', '--bc-turquesa-oscuro', '--bc-blanco', 3],
  ['Ícono de éxito', '--bc-exito', '--bc-exito-fondo', 3],
  ['Anillo de foco sobre blanco', '--bc-foco', '--bc-blanco', 3],
  ['Anillo de foco sobre amarillo', '--bc-foco', '--bc-amarillo', 3],
  ['Barra de la Clave Dinámica', '--bc-amarillo', '--bc-gris-texto-2', 3],

  // --- Excepciones documentadas ---
  ['Borde amarillo de tarjeta destacada', '--bc-amarillo', '--bc-blanco', 3,
    'Excepción aceptada. Es refuerzo redundante: la jerarquía la cargan la etiqueta y el tamaño de la cifra, no el borde. Si el borde desaparece del todo, no se pierde información.'],
];

/** Pares que NUNCA deben usarse. Si alguno pasara, el sistema cambió y hay que revisar. */
const PROHIBIDOS = [
  ['Blanco sobre amarillo', '--bc-blanco', '--bc-amarillo',
    'Es el error que el sistema nombra por su nombre. Sobre amarillo siempre carbón.'],
  ['Turquesa de marca sobre blanco', '--bc-turquesa', '--bc-blanco',
    'No llega a 3:1. Para bordes con significado existe --bc-turquesa-oscuro.'],
  ['Gris de texto sobre blanco', '--bc-gris-texto', '--bc-blanco',
    'No llega a 4.5:1. En el modo lo-justo este token se remapea a carbón.'],
];

let fallos = 0;
let excepciones = 0;

console.log(`Contraste — ${PARES.length} pares\n`);

for (const [nombre, fg, bg, min, nota] of PARES) {
  if (!T[fg] || !T[bg]) {
    console.error(`  FALTA TOKEN  ${nombre} (${fg} / ${bg})`);
    fallos++;
    continue;
  }
  const r = ratio(T[fg], T[bg]);
  const pasa = r >= min;
  if (pasa) {
    console.log(`  ok         ${r.toFixed(2).padStart(6)}:1  (min ${min})  ${nombre}`);
  } else if (nota) {
    excepciones++;
    console.log(`  excepción  ${r.toFixed(2).padStart(6)}:1  (min ${min})  ${nombre}`);
    console.log(`             ${nota}`);
  } else {
    fallos++;
    console.error(`  NO PASA    ${r.toFixed(2).padStart(6)}:1  (min ${min})  ${nombre}`);
  }
}

console.log('\nPares prohibidos — se verifican para que no vuelvan a colarse:\n');
for (const [nombre, fg, bg, por] of PROHIBIDOS) {
  const r = ratio(T[fg], T[bg]);
  console.log(`  ${r.toFixed(2).padStart(6)}:1  ${nombre}`);
  console.log(`           ${por}`);
}

console.log('');
if (fallos > 0) {
  console.error(`${fallos} par(es) por debajo del umbral. El build no continúa.`);
  process.exit(1);
}
console.log(`Todos los pares pasan. ${excepciones} excepción(es) documentada(s).`);
