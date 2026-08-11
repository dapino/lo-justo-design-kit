# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Versionado semántico.

## [0.1.0] — 2026-08-10

Primera versión. Extraída del prototipo del modo "Lo justo".

### Agregado

- **84 tokens** en `src/tokens.css`, con su procedencia marcada: 20 extraídos del sitio
  en vivo con `getComputedStyle`, 3 de SVG de marca, 22 propuestos con justificación
  escrita, 39 derivados.
- **13 módulos de componentes CSS**: base, botón, tarjeta, cifra, agente, fallo, campo,
  comprobante, navegación, seguridad, espera, arcos y ajustes móviles.
- **Exportación a Figma** en formato Tokens Studio (`dist/tokens.figma.json`), con dos
  conjuntos declarados como temas: `marca` y `lo-justo`. La procedencia de cada token
  viaja en la descripción.
- **Exportación W3C DTCG** (`dist/tokens.w3c.json`).
- **Tokens en JS, CJS y TypeScript**, con tipos.
- **Verificación de contraste que rompe el build**: 22 pares con su umbral, más 3 pares
  prohibidos que se verifican para que no vuelvan a colarse. Corre en `prepublishOnly`.
- Cero dependencias, de producción y de desarrollo.

### Decisiones que vale la pena registrar

- **`--bc-txt-nota` vale 18px, no 16px.** La especificación de origen decía "ningún texto
  por debajo de 18px" y a la vez pedía etiquetas de navegación a 16px. Gana la restricción.
- **El borde de los controles usa `--bc-gris-texto-2`, no `--bc-gris-borde`.** El segundo da
  1.40:1 contra blanco: con poca visión, las tarjetas tocables eran rectángulos blancos
  sobre blanco. WCAG 1.4.11 pide 3:1 para lo que identifica un control.
- **La pista de la barra de la Clave Dinámica es oscura.** Con `--bc-gris-borde` el relleno
  amarillo daba 1.01:1 y la barra de tiempo era invisible.
- **`--bc-turquesa-oscuro` existe porque `--bc-turquesa` da 1.69:1 contra blanco** y no
  sirve para ningún borde que cargue significado.
- **La escala está en `rem`, no en px.** Con px, subir el texto del sistema al 200% no hace
  absolutamente nada. Las cifras y títulos tienen techo con `min()` para no salirse.
- **Una excepción de contraste documentada**: el borde amarillo de la tarjeta destacada da
  1.38:1. Es refuerzo redundante, no portador de información. Se imprime en cada build en
  vez de esconderse.
