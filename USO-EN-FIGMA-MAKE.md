# lo-justo-design-kit — referencia para Figma Make

Pega este archivo en el paso "Add any custom configurations" de Figma Make, o en el
chat. No es configuración: el paquete no necesita ninguna. Es para que sepa qué
componentes existen y con qué props, y no se los invente.

---

## Configuración: ninguna

- Los estilos se inyectan solos al importar cualquier componente. **No importes CSS.**
- No hay provider, ni contexto, ni tema que envolver.
- No necesita Tailwind, PostCSS ni alias.
- React 18 o 19 como peerDependency. ESM, compatible con Vite.

Todo se importa desde la raíz:

```jsx
import { Pantalla, Boton, Agente, Fallo, formatearPesos } from 'lo-justo-design-kit';
```

## Reglas del sistema — respétalas al generar código

1. Envuelve cada pantalla en `<Pantalla>`.
2. **Un solo `<Boton variante="primario">` por pantalla.** El amarillo señala LA acción.
3. **Máximo 3 acciones por pantalla**, sin contar `<Nav>`.
4. **Todo botón lleva texto.** Ningún ícono solo, nunca.
5. **Los montos van como número**, no como texto: `<Cifra valor={300000} />`. El
   componente los formatea a `$ 300.000`. Nunca los abrevies.
6. **Ningún texto por debajo de 18px.** No inventes tamaños; usa los componentes.
7. **Nunca texto blanco sobre el amarillo `#FDDA24`** — da 1.38:1. Sobre amarillo, carbón.
8. **No uses rojo.** No existe en este sistema.
9. No escribas CSS propio. Si algo no se puede hacer con los componentes, dilo en vez
   de improvisar estilos.

## Cómo habla el agente

En **pasado, primera persona, sobre cosas que ya hizo**. Si una frase se puede
reemplazar por "¿en qué te puedo ayudar?", está mal escrita.

MAL: "Puedo ayudarte a transferir" · BIEN: "Preparé la transferencia. Revísala."

Y nunca envía ni escribe primero: prepara y espera. El envío lo dispara la persona.

## Componentes

### Contenedor
```jsx
<Pantalla>…</Pantalla>                      // modo="lo-justo" (por defecto) | "marca"
```

### Texto
```jsx
<Saludo>Hola de nuevo</Saludo>              // 36px light
<Antetitulo>MIENTRAS NO ESTABAS</Antetitulo>
<Nota>Texto auxiliar</Nota>
<Etiqueta>En el celular</Etiqueta>
```

### Botones
```jsx
<Boton variante="primario">Sí, enviar</Boton>      // primario | secundario | texto
<Boton variante="primario" cargando>Enviando</Boton>
<Volver>Volver</Volver>
```

### Dinero
```jsx
<Cifra valor={300000} />                    // tamano="grande" | "media" | "chica"
formatearPesos(16531.59)                    // "$ 16.531,59"
```

### Tarjetas
```jsx
<Tarjeta variante="saldo" etiqueta="En el celular" monto={300000}
         nota="Esto es lo que mueves desde aquí." />
<Tarjeta variante="destacada" etiqueta="Guardado" monto={2400000} />
<Accion icono={<svg…/>}>Enviar plata</Accion>
```

### El agente — `cuando` es obligatorio
```jsx
<Agente variante="anticipa" cuando="Hoy, 9:06 a.m.">
  <AgenteTexto>Preparé la transferencia.</AgenteTexto>
</Agente>

<Agente variante="exito" cuando="Hoy, 9:07 a.m." movio monto={80000}>
  <AgenteTexto>Guardé el comprobante en tu teléfono.</AgenteTexto>
</Agente>
```
`variante`: `anticipa` (neutro) · `explica` (algo falló) · `exito` (confirma).
Cada mensaje termina en una línea de bitácora con la hora y si movió plata.

### El fallo — las tres partes son obligatorias
```jsx
<Fallo
  cuando="Hoy, 11:22 a.m."
  quePaso="Se cayó la conexión justo cuando ibas a confirmar."
  deQuienFue={<><strong>Nuestro.</strong> El corte fue del lado del banco.</>}
  queSigue={<>La transferencia <strong>no se hizo</strong>. Nadie recibió nada.</>}
/>
```
Ningún error sin causa, responsable y siguiente paso. Si fue del banco, se dice.

### Certeza sobre el dinero
```jsx
<Certeza salio={false} titulo="Tu plata sigue completa" monto={300000}
         nota="Lo comprobé contra tu cuenta, no contra este teléfono." />
```
Cuando algo se cae a mitad de una transferencia, di **si la plata se movió o no**.
Nunca "estamos verificando".

### Registro
```jsx
<Dia>JUEVES 7 DE AGOSTO</Dia>
<Registro>
  <EntradaRegistro hora="7:12 p.m.">Vi que el código no te llegó.</EntradaRegistro>
  <EntradaRegistro hora="9:07 a.m." movio monto={80000}>
    Enviaste $ 80.000 a María Restrepo. Tú lo confirmaste.
  </EntradaRegistro>
</Registro>
```

### Formularios
```jsx
<Campo id="doc" label="Tu documento" ayuda="Sin puntos ni comas."
       value={valor} onChange={…} error="…" />
<Casilla>Revisé el nombre y los últimos cuatro números.</Casilla>
```
La ayuda va antes de escribir, no después de fallar.

### Resumen y comprobante
```jsx
<Resumen>
  <FilaResumen etiqueta="Para" valor="María Restrepo" secundario="Ahorros ···· 4471" />
  <FilaResumen etiqueta="Monto" monto={80000} />
</Resumen>

<Comprobante numero="Comprobante 4471-2026-0810">
  <Resumen pegado>…</Resumen>
</Comprobante>
```

### Navegación — máximo 3 destinos, todos con etiqueta
```jsx
<Nav activo="inicio" onCambiar={setPantalla} destinos={[
  { id: 'inicio', etiqueta: 'Inicio',      icono: <svg…/> },
  { id: 'hice',   etiqueta: 'Lo que hice', icono: <svg…/> },
  { id: 'seg',    etiqueta: 'Seguridad',   icono: <svg…/> },
]} />

<Encabezado negro><span>Banco</span><Migaja claro>Lo justo</Migaja></Encabezado>
```
El destino activo se marca con un bloque amarillo completo detrás. Es a propósito.

### Seguridad
```jsx
<Sello />                                   // "Nunca te vamos a pedir tus claves."
<Palabra valor="CIRUELA" nota="Todo mensaje nuestro la trae." />
<AlertaFraude><p><strong>Si alguien te está apurando, no es del banco.</strong></p></AlertaFraude>
<Limites tipo="solo"     titulo="Lo hago solo"        items={['Guardar dónde quedaste.']} />
<Limites tipo="pregunto" titulo="Siempre te pregunto" items={['Mover plata, sin importar el monto.']} />
```

### Esperas
```jsx
<Espera que="Que el banco confirme que la cuenta existe."
        nota="Llevo 14 segundos. Normalmente tarda 3." progreso={45} />
<ClaveDinamica codigo="316 145" restante="Vence en 9 minutos" porcentaje={90} />
```
Ninguna espera sin nombre: qué se espera y cuánto lleva. Nada de giros infinitos.

### Marca
```jsx
<Arcos />        // decorativos, van dentro de <Pantalla>, no ocupan espacio
```

## Si rompes una regla, la consola te avisa

```
[lo-justo] Agente sin `cuando`. Cada mensaje del agente es una entrada del registro.
[lo-justo] Fallo sin `deQuienFue`. Si fue del banco, hay que decirlo.
[lo-justo] Boton sin texto. Todo botón lleva texto: ningún ícono solo.
[lo-justo] Nav con más de 3 destinos. El modo simplificado usa 3.
```

No las ignores: son las reglas del sistema, y están ahí porque cada una responde a un
hallazgo de investigación.
