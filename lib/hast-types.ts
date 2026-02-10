// src/lib/hast-types.ts
import type { Node, Parent, Literal } from "unist";

/**
 * Tipos HAST/UNIST mínimos usados en el proyecto
 * (no dependemos de paquetes externos para los guards)
 */

export interface HastText extends Literal {
  type: "text";
  value: string;
}

export interface HastRaw extends Literal {
  type: "raw" | "html";
  value: string;
}

export interface HastElement extends Parent {
  type: "element";
  tagName: string;
  properties?: Record<string, any>;
  children: HastNode[];
}

export type HastNode = HastElement | HastText | HastRaw | Node;

/** Guards */
export function isElement(node: Node | null | undefined): node is HastElement {
  return Boolean(node && (node as any).type === "element" && typeof (node as any).tagName === "string");
}

export function isText(node: Node | null | undefined): node is HastText {
  return Boolean(node && (node as any).type === "text" && typeof (node as any).value === "string");
}

export function isRaw(node: Node | null | undefined): node is HastRaw {
  return Boolean(node && ((node as any).type === "raw" || (node as any).type === "html") && typeof (node as any).value === "string");
}
