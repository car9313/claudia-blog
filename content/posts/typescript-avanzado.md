---
title: "TypeScript Avanzado: Tipos Condicionales"
date: "2024-01-10"
excerpt: "Aprende a usar tipos condicionales en TypeScript para crear tipos más flexibles y seguros en tus aplicaciones."
category: "TypeScript"
tags: ["typescript", "tipos", "programacion"]
author: "Tu Nombre"
image: "/placeholder.svg?height=400&width=800"
---

# TypeScript Avanzado: Tipos Condicionales

Los **tipos condicionales** en TypeScript permiten crear tipos que dependen de otros tipos, similar a cómo funcionan los condicionales en JavaScript.

## Sintaxis básica

La sintaxis de un tipo condicional es:

```typescript
T extends U ? X : Y
```

## Ejemplo práctico

```typescript
type IsString<T> = T extends string ? true : false

type A = IsString<string> // true
type B = IsString<number> // false
```

### Uso con utilidades

Puedes combinar tipos condicionales con tipos de utilidad:

```typescript
type NonNullable<T> = T extends null | undefined ? never : T

type Result = NonNullable<string | null> // string
```

## Casos de uso reales

Los tipos condicionales son útiles para:

- Crear tipos de utilidad personalizados
- Inferir tipos de propiedades
- Construir APIs type-safe

```typescript
type Flatten<T> = T extends Array<infer U> ? U : T

type Str = Flatten<string[]> // string
type Num = Flatten<number> // number
```

¡Los tipos condicionales son una herramienta poderosa en tu arsenal de TypeScript!
