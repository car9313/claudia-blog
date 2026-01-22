---
title: "Por qué las fechas rompen la hidratación en Next.js (y cómo solucionarlo)"
date: "2026-01-22"
excerpt: "Causa, diagnóstico y soluciones para errores de hidratación relacionados con fechas en Next.js"
category: "Next.js"
tags: [nextjs,ssr,hydration,date]
author: "Tu Nombre"
image: "/placeholder.svg?height=400&width=800"
---

# Por qué las fechas rompen la hidratación en Next.js (y cómo solucionarlo)

En este post explico por qué a veces aparece el error "Objects are not valid as a React child (found: [object Date])" o advertencias de hidratación cuando trabajas con fechas en un proyecto Next.js, por qué ocurre y cómo evitarlo correctamente.

## Resumen rápido

- Causa frecuente: el contenido generado en el servidor y el HTML que produce el cliente no coinciden (mismatch de hidratación). Fechas formateadas en el cliente o `Date`/`Math.random()` usados en el render pueden producir diferencias.
- Síntoma concreto: mensaje en consola parecido a:

  "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties..."

  o un error: "Objects are not valid as a React child (found: [object Date])".

- Solución general: garantizar que los valores que se muestran en el HTML SSR sean deterministas y/o se formateen en el servidor antes de enviarlos al cliente.

## Por qué ocurre exactamente (explicación técnica)

1. YAML/frontmatter puede parsear fechas automáticamente. Si en tu archivo Markdown pones:

```markdown
---
date: 2026-01-08
---
```

  Muchos parsers YAML (usados por `gray-matter`) interpretan `2026-01-08` como una `Date` (objeto). Si ese objeto termina llegando tal cual al JSX y React intenta renderizarlo como hijo, obtendrás el error "Objects are not valid as a React child (found: [object Date])".

2. Hidratación mismatch por formateo en cliente. Si en el servidor renderizas una cadena (por ejemplo `2026-01-08`) pero en el cliente usas `new Date(post.date).toLocaleDateString()` sin garantizar el mismo resultado que SSR, el HTML difiere y React advierte.

3. Uso de valores no deterministas. `Date.now()` o `Math.random()` producen valores distintos en servidor y cliente, lo que produce diferencias inmediatas en el HTML renderizado.

## Ejemplo real (antes / problema)

En `components/blog-card.tsx` había código así:

```tsx
<time dateTime={post.date}>{new Date(post.date).toLocaleDateString("es-ES")}</time>
```

Si `post.date` viene como un objeto `Date` desde `gray-matter` (no una cadena), o si `toLocaleDateString` produce distinto texto entre SSR y cliente, verás errores o advertencias.

Además, si en frontmatter la fecha no está entre comillas, YAML puede devolver un `Date` en `data.date`.

## Reglas prácticas para evitar el problema

1. Normaliza la fecha en el servidor antes de enviar a la UI. Devuelve siempre una cadena ya formateada en `getAllPosts()` / `getPostBySlug()`.
2. Mantén un campo `dateRaw` (ISO) para `dateTime` y un `date` legible para mostrar en la UI. Usa `dateRaw` para ordenamiento.
3. Evita `toLocaleDateString()` en componentes hidratables; si quieres un formato localizado, calcula la cadena en el servidor y pásala.
4. Si el frontmatter puede venir como `Date` (por YAML), conviértelo explícitamente con `new Date(data.date)` y luego a string.
5. Evita `Date.now()` o `Math.random()` en el JSX SSR; si los necesitas visualmente, úsalos dentro de efectos del cliente (`useEffect`) o pásalos como datos ya calculados por el servidor cuando tenga sentido.

## Solución aplicada (ejemplo de código)

### Antes (problemático)

lib/posts.server.ts devolvía `date` sin formatear, o el componente hacía la transformación en el cliente:

```ts
// posts.server.ts (simplificado — problemático)
return {
  ...,
  date: data.date || new Date().toISOString().split('T')[0],
}
```

y en el componente:

```tsx
<time dateTime={post.date}>{new Date(post.date).toLocaleDateString('es-ES')}</time>
```

Esto puede fallar si `data.date` es un objeto `Date` o si `toLocaleDateString` produce distinto texto entre servidor y cliente.

### Después (solución recomendada)

Formatear en `lib/posts.server.ts` y devolver `dateRaw` + `date` legible:

```ts
// posts.server.ts (normalizar fechas en el servidor)
const dateIso = data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
const [y, m, d] = dateIso.split('-');
const formatted = `${d}/${m}/${y}`; // DD/MM/YYYY

return {
  ...,
  date: formatted,    // cadena legible para mostrar
  dateRaw: dateIso,   // ISO para dateTime y sorting
}
```

Y en el componente usar:

```tsx
<time dateTime={post.dateRaw ?? post.date}>{post.date}</time>
```

De este modo:
- Evitas pasar objetos `Date` directamente al JSX.
- El HTML renderizado en SSR ya incluye la cadena final, por lo que la hidratación no cambia cuando el cliente toma el control.

## Cómo detectar el problema en tu app

- Abre la consola del navegador: si ves la advertencia de hidratación o el error sobre objetos Date, revisa qué valor se está mostrando en el HTML (inspecciona el elemento `<time>`).
- Añade un `console.log(typeof post.date, post.date)` en el servidor o imprime el valor al generar posts para ver si `post.date` es `object`.
- Reproduce creando una entrada con `date: 2026-01-08` sin comillas y observa el error.

## Pruebas rápidas (local)

1. Crea un post con frontmatter que tenga `date: 2026-01-08` (sin comillas) y arranca el servidor:

```bash
pnpm dev
# o
npm run dev
```

2. Abre la página y observa la consola; deberías ver la advertencia/error.
3. Aplica la solución en `lib/posts.server.ts` (formateo en servidor) y recarga; el error debería desaparecer.

## Buenas prácticas recomendadas

- Siempre normaliza y valida frontmatter (preferible: poner fechas entre comillas en Markdown).
- Centraliza la transformación de datos (fechas, strings, etc.) en funciones server-side.
- Mantén campos separados para machine-readable (`dateRaw`) y human-readable (`date`).

---

Si quieres, puedo:

- Añadir un script de validación que verifique frontmatter antes de build (pre-commit / CI). 
- Generar un snippet de ESLint/remark para avisar cuando un frontmatter `date` no esté entre comillas.

¿Quieres que agregue alguna de esas opciones? 
