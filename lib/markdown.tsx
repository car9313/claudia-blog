// src/lib/markdown.service.tsx
import React, { ReactNode } from "react";
import type { Node, Parent } from "unist";
import { visit } from "unist-util-visit";
import { unified } from "unified";

import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";

import rehypePrettyCode from "rehype-pretty-code";
import rehypeReact from "rehype-react";
import rehypeSanitize from "rehype-sanitize";

import { jsx, jsxs, Fragment } from "react/jsx-runtime";

import { BlogImage } from "@/components/blog-image";
import { CodeBlock } from "@/components/code-block";

import {
  HastElement,
  HastNode,
  isElement,
  isText,
  isRaw,
} from "@/lib/hast-types";

/* --- Utilidades recursivas --- */
const BLOCKING_TAGS = [
  "img",
  "figure",
  "figcaption",
  "picture",
  "video",
  "iframe",
  "object",
];

function containsBlockingTag(
  node: HastNode | Node | null | undefined,
): boolean {
  if (!node) return false;

  if (isText(node)) return false;

  if (isRaw(node)) {
    const val = String(node.value ?? "");
    return /\<(img|figure|figcaption|picture|video|iframe|object)\b/i.test(val);
  }

  if (isElement(node)) {
    const tag = (node.tagName || "").toLowerCase();
    if (BLOCKING_TAGS.includes(tag)) return true;
    const children = node.children ?? [];
    return children.some((c) => containsBlockingTag(c));
  }

  return false;
}

function isOnlyImages(node: HastNode | Node | null | undefined): boolean {
  if (!node) return false;
  if (isText(node)) return (node.value ?? "").trim() === "";
  if (isRaw(node)) {
    const val = String(node.value ?? "").trim();
    return /^(\s*<\s*(figure|img|picture)\b[\s\S]*>[\s\S]*<\/\s*figure\s*>\s*|\s*<\s*img\b[\s\S]*\/?>\s*)$/i.test(
      val,
    );
  }
  if (isElement(node)) {
    const tag = (node.tagName || "").toLowerCase();
    if (["img", "picture", "figure"].includes(tag)) return true;
    const children = node.children ?? [];
    if (children.length === 0) return false;
    return children.every((c) => isOnlyImages(c));
  }
  return false;
}

/** Recorre recursivamente un conjunto de nodos y marca las img element con data-inline=true */
function markInlineImagesRecursively(nodes: HastNode[]) {
  for (const child of nodes) {
    if (isElement(child)) {
      const tag = (child.tagName || "").toLowerCase();
      if (tag === "img") {
        child.properties = {
          ...(child.properties || {}),
          ["data-inline"]: true,
        };
      } else {
        if (child.children && child.children.length > 0) {
          markInlineImagesRecursively(child.children as HastNode[]);
        }
      }
    } else if (isRaw(child)) {
      // no podemos manipular raw/html fácilmente; lo dejamos
    }
  }
}

/* --- Plugin: convert <p> con imágenes en div + marcar inline images en párrafos mixtos --- */
export function extractImagesFromParagraphs() {
  return (tree: Node) => {
    if (!tree || typeof tree !== "object") return;
    if (!("children" in tree)) return;

    // Tipamos `tree` como Parent para no usar `any`.
    visit(
      tree as Parent,
      "element",
      (node: Node, index: number | null, parent: Parent | null) => {
        if (!parent || index === null || index === undefined) return;
        if (!isElement(node)) return;
        if (node.tagName !== "p") return;

        const children = node.children ?? [];

        // ¿hay nodos bloqueantes (img/figure/raw con img ...)?
        const hasBlocked = children.some((c) => containsBlockingTag(c));
        if (!hasBlocked) return;

        // ¿el párrafo es solo imágenes (bloque) o mixto (texto + imagen)?
        const onlyImgs = children.every((c) => isOnlyImages(c));

        if (onlyImgs) {
          // Reemplaza <p> por <div class="image-container"> conservando hijos
          parent.children[index] = {
            type: "element",
            tagName: "div",
            properties: { className: ["image-container"] },
            children: children,
          } as HastElement;
        } else {
          // Antes de reemplazar, MARCAMOS las imágenes dentro del párrafo como INLINE
          markInlineImagesRecursively(children as HastNode[]);

          parent.children[index] = {
            type: "element",
            tagName: "div",
            properties: {
              ...node.properties,
              className: [
                ...(node.properties?.className || []),
                "paragraph-with-images",
              ],
            },
            children: children,
          } as HastElement;
        }
      },
    );
  };
}

/* --- Types para rehype-react components --- */
type RehypeImgProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  "data-inline"?: boolean | "true" | "false";
  dataInline?: boolean | "true" | "false";
};

type PreProps = React.ComponentPropsWithoutRef<"pre"> & {
  children?: React.ReactNode;
};

/* --- Pipeline principal (Markdown -> ReactNode) --- */
export async function processMarkdownToReact(
  content: string,
): Promise<ReactNode> {
  try {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeSanitize)
      .use(rehypePrettyCode, {})
      .use(extractImagesFromParagraphs)
      .use(rehypeReact, {
        jsx,
        jsxs,
        Fragment,
        components: {
          img: (props: RehypeImgProps) => {
            const rawInline = props["data-inline"] ?? props.dataInline ?? false;
            const inline = rawInline === true || rawInline === "true";
            // passthrough props carefully (asegurando tipos)
            return (
              <BlogImage
                src={String(props.src ?? "")}
                alt={String(props.alt ?? "")}
                width={props.width ? Number(props.width) : undefined}
                height={props.height ? Number(props.height) : undefined}
                inline={inline}
              />
            );
          },
          pre: (props: PreProps) => <CodeBlock {...props} />,
        },
      })
      .process(content);

    return file.result as ReactNode;
  } catch (error) {
    console.error("Error procesando markdown:", error);
    return <div className="prose">Error al procesar el contenido.</div>;
  }
}
