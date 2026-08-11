# lo-justo-design-kit

Sistema de diseño para **banca de baja densidad**: menos cosas en pantalla, más grandes,
y con la accesibilidad verificada por máquina en cada build.

Trae tokens, componentes CSS y exportación directa a Figma.

```bash
npm install lo-justo-design-kit
```

---

> ### Aviso
>
> **Esto no es un producto oficial de Bancolombia ni está afiliado a Bancolombia S.A.**
>
> Es un ejercicio de diseño hecho para una prueba técnica. Los valores de color y tipografía
> se extrajeron del sitio web público con `getComputedStyle` y de capturas de la app, y están
> marcados con su procedencia. Las marcas, nombres y logotipos de Bancolombia pertenecen a su
> titular. Publicado con fines de portafolio y aprendizaje.
>
> El código es MIT. Los activos de marca de terceros no lo son.

---

## Por qué existe

La mayoría de los sistemas de diseño optimizan densidad: cuántas cosas caben. Este optimiza
lo contrario, porque nació de un problema concreto: **personas que intentaron usar la app de
su banco, algo falló, nadie les explicó qué pasó, y no volvieron a intentar.**

De ahí salen tres reglas que atraviesan todo el kit y que son inusuales:

1. **Ningún texto por debajo de 18px.** No hay letra chica. Ni en las notas al pie.
2. **Ningún error sin causa, responsable y siguiente paso.** El componente de fallo tiene tres
   espacios rotulados y no deja construir uno sin llenarlos.
3. **El contraste se comprueba en cada build.** Si un par baja de su umbral, `npm run construir`
   sale con error. No es una guía: es una prueba.

Esa tercera no es teatro. Construyendo el prototipo aparecieron tres fallos de contraste que
meses de revisión visual no habían visto. El peor daba **1.01:1** — la barra que marca cuánto
falta para que venza el código de seguridad era literalmente invisible. Los tres se
encontraron calculando, no mirando.

---

## Uso

### CSS, todo junto

```html
<link rel="stylesheet" href="node_modules/lo-justo-design-kit/dist/lo-justo.css">
<body class="lj lo-justo">
```

Dos clases, y son distintas:

- **`.lj`** activa los componentes.
- **`.lo-justo`** activa el modo de baja densidad: texto más grande, áreas táctiles de 56px,
  y el texto secundario sube a carbón. Sin ella, los componentes usan la escala de marca normal.

### Solo tokens

```css
@import "lo-justo-design-kit/tokens.css";
```

### Desde JavaScript

```js
import tokens from 'lo-justo-design-kit';

tokens.amarillo;    // "#FDDA24"
tokens.carbon;      // "#2C2A29"
tokens.tapComodo;   // "56px"
```

Con tipos incluidos. Cada token es `readonly string`.

### En Figma

`dist/tokens.figma.json` está en formato **Tokens Studio**. En Figma:

1. Instala el plugin *Tokens Studio for Figma*.
2. Plugin → **Tools → Load from file/folder** → elige `tokens.figma.json`.
3. Vas a ver dos conjuntos: **marca** (lo que no cambia nunca) y **lo-justo** (el modo, que
   solo reescala). Están declarados como temas: `lo-justo` usa `marca` como *source*.
4. **Apply to document** crea los estilos y las variables.

Cada token llega a Figma con su descripción **y su procedencia**: si el valor se extrajo del
sitio real (`CSS`), de un SVG de marca (`SVG`), o se derivó para completar el sistema
(`PROPUESTO`). Esa distinción sobrevive el viaje a Figma, que es justo donde suele perderse.

También hay `dist/tokens.w3c.json` en formato del **W3C Design Tokens Community Group**, para
Style Dictionary o cualquier herramienta que lo consuma.

---

## Qué trae

### Tokens · 84

| Grupo | Cuántos | Ejemplo |
|---|---|---|
| color | 36 | `--bc-amarillo` `#FDDA24` |
| fontSizes | 13 | `--bc-txt-cuerpo` |
| spacing | 11 | `--bc-esp-4` |
| fontWeights · borderRadius · sizing | 4 c/u | `--bc-tap-comodo` `56px` |
| boxShadow | 3 | `--bc-sombra-2` |
| fontFamilies · lineHeights · border · other | 2 c/u | `--bc-font-cuerpo` |
| borderWidth | 1 | `--bc-foco-ancho` |

Procedencia: **20 extraídos del sitio en vivo**, 3 de SVG de marca, 22 propuestos con su
justificación escrita, 39 derivados.

### Componentes · 13 módulos CSS

| Archivo | Qué trae |
|---|---|
| `_base` | Escala en `rem`, foco visible, tipografía |
| `boton` | Primario, secundario, texto, deshabilitado, cargando, volver |
| `tarjeta` | Tarjeta, destacada, saldo, acción, fila secundaria |
| `cifra` | Formato de dinero, resumen de filas, comparar dos cifras |
| `agente` | Bloque del agente en 3 variantes, bitácora, registro, marbete |
| `fallo` | El fallo en tres partes, aviso, salidas, certeza sobre el dinero |
| `campo` | Entrada con label fijo, ayuda de formato, error, casilla |
| `comprobante` | Comprobante con borde dentado |
| `navegacion` | Barra inferior de 3 destinos, encabezados |
| `seguridad` | Sello de identidad, palabra, alerta de fraude, límites de autonomía |
| `espera` | Esperas con nombre, contador, Clave Dinámica |
| `arcos` | Arcos de marca |
| `_movil` | Ajustes a 360px, sin dependencia de `:hover` |

---

## Las reglas que el kit impone

No son sugerencias del README: están construidas en los componentes.

| Regla | Cómo se aplica |
|---|---|
| Máximo 3 acciones por pantalla | Convención. El kit no la puede forzar |
| Ningún texto bajo 18px | La escala arranca en `1.125rem` y no baja |
| Cifras de dinero mínimo 32px | `--bc-cifra-2` es el piso |
| Área táctil mínima 56px | `min-height`, nunca `height`: crece si crece el texto |
| Un solo botón amarillo por pantalla | Convención. Solo hay una clase `--primario` |
| Nunca blanco sobre `#FDDA24` | El script de contraste lo verifica como par prohibido |
| Todo botón lleva texto | Ningún componente acepta ícono solo |
| Cifras nunca abreviadas | `$ 150.000`, jamás `$150K` |
| Sin scroll horizontal | Las filas usan `flex-wrap` |
| Nada comunicado solo por color | Los marbetes llevan texto, las listas llevan encabezado |

### El texto al 200% sí funciona

La escala está en `rem`, no en px. Con px, subir el texto del sistema no hace nada — el
prototipo cumplía la regla solo por el zoom de página, que es otra cosa.

Las cifras y los títulos crecen **hasta un techo** con `min()`: lo que ya era grande no
necesita doblar, y si dobla se sale de la pantalla. Ninguna baja del mínimo del sistema.

---

## Verificación

```bash
npm run verificar      # solo contraste
npm run construir      # verifica y genera dist/
```

`npm run construir` **falla** si un par de color baja de su umbral. Es lo que hace
`prepublishOnly`, así que no se puede publicar una versión con un contraste roto.

Salida real:

```
Contraste — 22 pares

  ok          14.28:1  (min 4.5)  Texto principal sobre blanco
  ok          10.36:1  (min 4.5)  Carbón sobre amarillo (botón primario)
  ok           5.09:1  (min 3)    Barra de la Clave Dinámica
  excepción    1.38:1  (min 3)    Borde amarillo de tarjeta destacada
             Excepción aceptada. Es refuerzo redundante: la jerarquía la cargan
             la etiqueta y el tamaño de la cifra, no el borde.

Pares prohibidos — se verifican para que no vuelvan a colarse:

    1.38:1  Blanco sobre amarillo
    1.69:1  Turquesa de marca sobre blanco
    3.85:1  Gris de texto sobre blanco
```

**Las excepciones se imprimen, no se esconden.** Un sistema con una excepción escrita es más
honesto que uno donde todo pasa a la primera.

---

## Estructura

```
src/
  tokens.css              fuente de verdad. Todo lo demás se genera de aquí
  componentes/*.css       un archivo por familia
scripts/
  construir.mjs           genera dist/ — sin dependencias
  verificar-contraste.mjs rompe el build si un par no pasa
dist/                     generado, versionado para que instalar no requiera build
ejemplo/index.html        demo con todos los componentes
```

**Cero dependencias.** Ni de producción ni de desarrollo. Un kit de diseño que necesita medio
ecosistema para generar un JSON de colores es un kit que nadie va a poder correr en dos años.

---

## Contribuir

1. Edita `src/tokens.css` o `src/componentes/*.css`. **Nunca `dist/`.**
2. Si agregas un color, agrégale su par al array `PARES` de `verificar-contraste.mjs`.
3. `npm run construir`.
4. Si el contraste falla, el color está mal, no el script.

---

## Licencia

MIT — ver [LICENSE](LICENSE).

Las marcas y activos de identidad de terceros mencionados no están cubiertos por esta licencia.
