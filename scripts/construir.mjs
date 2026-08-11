#!/usr/bin/env node
/**
 * Construye dist/ a partir de src/.
 *
 * Sin dependencias. Node puro, a propósito: un kit de diseño que necesita
 * instalar medio ecosistema para generar un JSON de colores es un kit que
 * nadie va a poder correr en dos años.
 *
 *   node scripts/construir.mjs
 *
 * Salida:
 *   dist/tokens.css              copia literal de la fuente de verdad
 *   dist/tokens.json             plano, { "--bc-amarillo": "#FDDA24", ... }
 *   dist/tokens.w3c.json         formato W3C Design Tokens (DTCG)
 *   dist/tokens.figma.json       formato Tokens Studio, importable en Figma
 *   dist/tokens.js / .mjs / .d.ts
 *   dist/lo-justo.css            tokens + todos los componentes
 *   dist/componentes.css         solo componentes, sin tokens
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..');
const SRC = join(RAIZ, 'src');
const DIST = join(RAIZ, 'dist');

// ---------------------------------------------------------------------------
// 1. Leer y parsear tokens.css
// ---------------------------------------------------------------------------

const cssTokens = readFileSync(join(SRC, 'tokens.css'), 'utf8');

/**
 * Extrae cada custom property con su valor, su comentario de la misma línea
 * y el ámbito donde vive (:root o .lo-justo).
 */
function parsearTokens(css) {
  const tokens = [];
  let ambito = ':root';

  for (const linea of css.split('\n')) {
    const abre = linea.match(/^\s*([:.][\w-]+)\s*\{/);
    if (abre) { ambito = abre[1]; continue; }

    const m = linea.match(/^\s*(--[\w-]+)\s*:\s*([^;]+);\s*(?:\/\*\s*(.*?)\s*\*\/)?/);
    if (!m) continue;

    const [, nombre, valorCrudo, comentario = ''] = m;
    const valor = valorCrudo.trim();

    // La procedencia está codificada en el comentario y vale la pena conservarla:
    // [CSS] salió del sitio en vivo, [PROPUESTO] lo derivamos nosotros.
    const proc = comentario.match(/\[(CSS|SVG|PROPUESTO|CORREGIDO[^\]]*|AJUSTADO[^\]]*)\]/);

    tokens.push({
      nombre,
      valor,
      ambito,
      procedencia: proc ? proc[1].split(' ')[0] : 'DERIVADO',
      descripcion: comentario.replace(/\[[^\]]+\]\s*/, '').trim(),
    });
  }
  return tokens;
}

const tokens = parsearTokens(cssTokens);
if (tokens.length === 0) throw new Error('No se parseó ningún token');

// ---------------------------------------------------------------------------
// 2. Clasificar por tipo, que es lo que Figma necesita saber
// ---------------------------------------------------------------------------

function tipoDe({ nombre, valor }) {
  if (/^--bc-(font)-/.test(nombre)) return 'fontFamilies';
  if (/^--bc-peso-/.test(nombre)) return 'fontWeights';
  if (/^--bc-(txt|cifra)-/.test(nombre)) return 'fontSizes';
  if (/^--bc-alto-linea/.test(nombre)) return 'lineHeights';
  if (/^--bc-esp-/.test(nombre)) return 'spacing';
  if (/^--bc-radio-/.test(nombre)) return 'borderRadius';
  if (/^--bc-tap-/.test(nombre)) return 'sizing';
  if (/^--bc-sombra-/.test(nombre)) return 'boxShadow';
  if (/^--bc-mov-/.test(nombre)) return 'other';
  if (/^--bc-borde/.test(nombre)) return 'border';
  if (/^--bc-foco-ancho/.test(nombre)) return 'borderWidth';
  if (/^#|^rgba?\(|^var\(--bc-(amarillo|negro|carbon|gris|blanco|turquesa|lavanda|melocoton|coral|purpura|exito|alerta|error|info)/.test(valor)) return 'color';
  return 'other';
}

const grupos = {};
for (const t of tokens) {
  const tipo = tipoDe(t);
  // El nombre corto quita el prefijo --bc-, que en Figma sobra
  const corto = t.nombre.replace(/^--bc-/, '');
  (grupos[tipo] ||= []).push({ ...t, corto, tipo });
}

// ---------------------------------------------------------------------------
// 3. Resolver var() para poder exportar valores reales a Figma
// ---------------------------------------------------------------------------

const porNombre = Object.fromEntries(tokens.map((t) => [t.nombre, t.valor]));

function resolver(valor, profundidad = 0) {
  if (profundidad > 10) return valor;
  const m = valor.match(/^var\((--[\w-]+)\)$/);
  if (m && porNombre[m[1]]) return resolver(porNombre[m[1]], profundidad + 1);
  return valor;
}

// ---------------------------------------------------------------------------
// 4. Emitir los formatos
// ---------------------------------------------------------------------------

mkdirSync(DIST, { recursive: true });

// -- 4.1 CSS literal
writeFileSync(join(DIST, 'tokens.css'), cssTokens);

// -- 4.2 JSON plano
const plano = Object.fromEntries(
  tokens.filter((t) => t.ambito === ':root').map((t) => [t.nombre, t.valor])
);
plano['@modo-lo-justo'] = Object.fromEntries(
  tokens.filter((t) => t.ambito === '.lo-justo').map((t) => [t.nombre, t.valor])
);
writeFileSync(join(DIST, 'tokens.json'), JSON.stringify(plano, null, 2) + '\n');

// -- 4.3 W3C Design Tokens Community Group
const W3C_TIPO = {
  color: 'color', fontFamilies: 'fontFamily', fontWeights: 'fontWeight',
  fontSizes: 'dimension', lineHeights: 'number', spacing: 'dimension',
  borderRadius: 'dimension', sizing: 'dimension', boxShadow: 'shadow',
  borderWidth: 'dimension', border: 'border', other: 'other',
};

const w3c = { $description: 'Lo justo — sistema de diseño. Valores extraídos del sitio y la app reales de Bancolombia; los marcados PROPUESTO se derivaron para completar el sistema.' };
for (const [tipo, lista] of Object.entries(grupos)) {
  w3c[tipo] = {};
  for (const t of lista) {
    if (t.ambito !== ':root') continue;
    w3c[tipo][t.corto] = {
      $value: resolver(t.valor),
      $type: W3C_TIPO[tipo] || 'other',
      $description: t.descripcion || undefined,
      $extensions: { 'lo-justo': { procedencia: t.procedencia } },
    };
  }
}
writeFileSync(join(DIST, 'tokens.w3c.json'), JSON.stringify(w3c, null, 2) + '\n');

// -- 4.4 Tokens Studio for Figma
// Dos conjuntos: "marca" es lo que no cambia nunca; "lo-justo" es el modo
// simplificado, que solo reescala. En Figma se cargan como dos temas.
const figma = { marca: {}, 'lo-justo': {} };

for (const [tipo, lista] of Object.entries(grupos)) {
  for (const t of lista) {
    const destino = t.ambito === '.lo-justo' ? 'lo-justo' : 'marca';
    (figma[destino][tipo] ||= {})[t.corto] = {
      value: resolver(t.valor),
      type: tipo === 'border' ? 'other' : tipo,
      description: [t.descripcion, `procedencia: ${t.procedencia}`]
        .filter(Boolean).join(' · '),
    };
  }
}
figma.$themes = [
  { id: 'marca', name: 'Marca Bancolombia', selectedTokenSets: { marca: 'enabled' } },
  { id: 'lo-justo', name: 'Modo Lo justo', selectedTokenSets: { marca: 'source', 'lo-justo': 'enabled' } },
];
figma.$metadata = { tokenSetOrder: ['marca', 'lo-justo'] };
writeFileSync(join(DIST, 'tokens.figma.json'), JSON.stringify(figma, null, 2) + '\n');

// -- 4.5 JavaScript / TypeScript
const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const objJs = Object.fromEntries(
  tokens.filter((t) => t.ambito === ':root').map((t) => [camel(t.corto ?? t.nombre.replace(/^--bc-/, '')), resolver(t.valor)])
);

writeFileSync(join(DIST, 'tokens.mjs'),
  '// Generado por scripts/construir.mjs — no editar a mano.\n' +
  `export const tokens = ${JSON.stringify(objJs, null, 2)};\n` +
  'export default tokens;\n');

writeFileSync(join(DIST, 'tokens.cjs'),
  '// Generado por scripts/construir.mjs — no editar a mano.\n' +
  `const tokens = ${JSON.stringify(objJs, null, 2)};\n` +
  'module.exports = tokens;\nmodule.exports.tokens = tokens;\n');

writeFileSync(join(DIST, 'tokens.d.ts'),
  '// Generado por scripts/construir.mjs — no editar a mano.\n' +
  'export declare const tokens: {\n' +
  Object.keys(objJs).map((k) => `  readonly ${k}: string;`).join('\n') +
  '\n};\nexport default tokens;\n');

// -- 4.6 CSS de componentes, en orden
const ORDEN = ['_base', 'boton', 'tarjeta', 'cifra', 'agente', 'fallo', 'campo',
  'comprobante', 'navegacion', 'seguridad', 'espera', 'arcos', '_movil'];

const archivos = readdirSync(join(SRC, 'componentes')).filter((f) => f.endsWith('.css'));
const ordenados = [
  ...ORDEN.map((n) => `${n}.css`).filter((f) => archivos.includes(f)),
  ...archivos.filter((f) => !ORDEN.includes(f.replace('.css', ''))),
];

const cabecera = (titulo) =>
  `/* ===========================================================================\n` +
  `   ${titulo}\n` +
  `   Generado por scripts/construir.mjs — no editar a mano.\n` +
  `   Editar src/ y volver a correr: npm run construir\n` +
  `   =========================================================================== */\n\n`;

const componentes = ordenados
  .map((f) => readFileSync(join(SRC, 'componentes', f), 'utf8'))
  .join('\n');

writeFileSync(join(DIST, 'componentes.css'), cabecera('lo-justo · componentes') + componentes);
writeFileSync(join(DIST, 'lo-justo.css'),
  cabecera('lo-justo · tokens + componentes') + cssTokens + '\n' + componentes);

// Minificado casero: quita comentarios y espacio sobrante. Sin dependencias.
const min = (css) => css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s*([{}:;,>])\s*/g, '$1')
  .replace(/;\}/g, '}')
  .replace(/\s+/g, ' ')
  .trim();

writeFileSync(join(DIST, 'lo-justo.min.css'), min(cssTokens + componentes) + '\n');

// ---------------------------------------------------------------------------
// 5. El demo, autocontenido
//
// Con el CSS enlazado, el demo llegaba sin estilos al abrirlo con doble clic:
// según el navegador y desde dónde se abra, un <link> relativo bajo file://
// no siempre resuelve, y los módulos ES están bloqueados por CORS.
//
// La solución es la misma que se usó en el prototipo: un solo archivo, con
// todo adentro. Abre con doble clic, se manda por correo, y sirve igual desde
// GitHub Pages.
// ---------------------------------------------------------------------------

const plantilla = readFileSync(join(RAIZ, 'ejemplo', 'plantilla.html'), 'utf8');

const paleta = tokens
  .filter((t) => t.ambito === ':root')
  .map((t) => [t.nombre.replace(/^--bc-/, ''), resolver(t.valor)])
  .filter(([, v]) => /^#[0-9A-Fa-f]{6}$/.test(v));

const demo = plantilla
  .replace('<!-- CSS-INCRUSTADO -->',
    '<style>\n' + cssTokens + '\n' + componentes + '\n</style>')
  .replace('/* PALETA-INCRUSTADA */ []', JSON.stringify(paleta))
  .replace('<!DOCTYPE html>',
    '<!DOCTYPE html>\n<!-- ARCHIVO GENERADO por scripts/construir.mjs\n' +
    '     Editar ejemplo/plantilla.html y volver a correr: npm run construir -->');

mkdirSync(join(RAIZ, 'docs'), { recursive: true });
writeFileSync(join(RAIZ, 'docs', 'index.html'), demo);
// .nojekyll para que GitHub Pages no se coma nada
writeFileSync(join(RAIZ, 'docs', '.nojekyll'), '');

if (demo.includes('CSS-INCRUSTADO') || demo.includes('PALETA-INCRUSTADA')) {
  throw new Error('La plantilla del demo no se sustituyó bien');
}
if (/href="\.\.\/dist|src="\.\.\/dist/.test(demo)) {
  throw new Error('El demo quedó con una referencia a dist/');
}

// ---------------------------------------------------------------------------
// 6. Reporte
// ---------------------------------------------------------------------------

const cuenta = Object.fromEntries(
  Object.entries(grupos).map(([k, v]) => [k, v.length])
);

console.log(`Tokens parseados: ${tokens.length}`);
for (const [tipo, n] of Object.entries(cuenta).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${tipo.padEnd(14)} ${n}`);
}
console.log('\nProcedencia:');
const proc = {};
for (const t of tokens) proc[t.procedencia] = (proc[t.procedencia] || 0) + 1;
for (const [k, n] of Object.entries(proc)) console.log(`  ${k.padEnd(14)} ${n}`);

console.log('\ndist/ escrito:');
for (const f of readdirSync(DIST).sort()) console.log('  ' + f);
console.log(`\ndocs/index.html · demo autocontenido · ${(demo.length / 1024).toFixed(1)} KB · ${paleta.length} colores`);
