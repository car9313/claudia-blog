// lib/posts.server.ts
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import type { Post } from "./posts.types";
import { categories } from "@/data/categories";
import { unstable_cache } from "next/cache";

const postsDirectory = path.join(process.cwd(), "content", "posts");

/**
 * Lectura de un post desde el FS
 */
async function parsePostFromFile(fileName: string): Promise<Post> {
  const slug = fileName.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = await fs.readFile(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const dateIso = data.date
    ? new Date(data.date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  const [y, m, d] = dateIso.split("-");
  const formatted = `${d}/${m}/${y}`;

  return {
    id: slug,
    slug,
    title: data.title || "Sin título",
    excerpt: data.excerpt || "",
    content: content || "",
    category: data.category || "General",
    author: data.author || "Anónimo",
    tags: data.tags || [],
    readTime: data.readTime || "5 min",
    date: formatted,
    dateRaw: dateIso,
    published: data.published !== false,
    image: data.image,
  };
}

/**
 * Leer todos los posts desde FS
 */
async function readAllPostsFromFS(): Promise<Post[]> {
  await fs.mkdir(postsDirectory, { recursive: true }).catch(() => {});
  const filenames = await fs.readdir(postsDirectory).catch(() => []);
  const posts: Post[] = [];

  for (const fileName of filenames.filter((f) => f.endsWith(".md"))) {
    try {
      const post = await parsePostFromFile(fileName);
      posts.push(post);
    } catch (err) {
      console.error(`Error loading post ${fileName}:`, err);
    }
  }

  return posts;
}

/**
 * Fuente de verdad cacheada (Next cache)
 */
export const getAllPostsCached = unstable_cache(async (): Promise<Post[]> => {
  const posts = (await readAllPostsFromFS())
    .filter((p) => p.published)
    .sort(
      (a, b) =>
        new Date(b.dateRaw as string).getTime() -
        new Date(a.dateRaw as string).getTime(),
    );
  return posts;
}, ["all-posts"]);

/**
 * Helpers puros sobre array de posts ya cargado
 */
export function findPostInAll(allPosts: Post[], slug: string): Post | null {
  return allPosts.find((p) => p.slug === slug) ?? null;
}

export function getPrevNextFromAll(allPosts: Post[], slug: string) {
  const idx = allPosts.findIndex((p) => p.slug === slug);
  return {
    prevPost: idx + 1 < allPosts.length ? allPosts[idx + 1] : null,
    nextPost: idx > 0 ? allPosts[idx - 1] : null,
  };
}

export function getRelatedPostsFromAll(
  allPosts: Post[],
  currentPost: Post,
  limit = 3,
): Post[] {
  const other = allPosts.filter((p) => p.slug !== currentPost.slug);
  const scored = other.map((p) => {
    const sharedTags = p.tags.filter((t) =>
      currentPost.tags.includes(t),
    ).length;
    return {
      p,
      score: sharedTags + (p.category === currentPost.category ? 1 : 0),
    };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .filter((s) => s.score > 0)
    .slice(0, limit)
    .map((s) => s.p);
}

/**
 * Funciones async públicas
 */
export async function getPrevNextPost(slug: string) {
  const all = await getAllPostsCached();
  return getPrevNextFromAll(all, slug);
}

export async function getRelatedPosts(currentPost: Post, limit = 3) {
  const all = await getAllPostsCached();
  return getRelatedPostsFromAll(all, currentPost, limit);
}

export async function getRecentPosts(limit = 3) {
  const posts = await getAllPostsCached();
  return posts.slice(0, limit);
}

/**
 * Categorías (estáticas)
 */
export function getAllCategories(): string[] {
  return ["Todos", ...new Set(categories.map((c) => c.name))];
}

/**
 * Búsqueda sobre posts ya cargados
 */
export function searchPostsFromAll(allPosts: Post[], search: string): Post[] {
  const q = (search ?? "").toString().trim();
  if (!q) return [];
  const lower = q.toLowerCase();
  return allPosts.filter(
    (p) =>
      p.title.toLowerCase().includes(lower) ||
      p.excerpt.toLowerCase().includes(lower) ||
      p.tags.some((tag) => tag.toLowerCase().includes(lower)),
  );
}

export async function searchPosts(search: string): Promise<Post[]> {
  const all = await getAllPostsCached();
  return searchPostsFromAll(all, search);
}

/**
 * Posts por categoría
 */
export function getPostsByCategoryFromAll(
  allPosts: Post[],
  category: string,
): Post[] {
  if (!category || category === "Todos") return allPosts;
  return allPosts.filter((p) => p.category === category);
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  const allPosts = await getAllPostsCached();
  return getPostsByCategoryFromAll(allPosts, category);
}
