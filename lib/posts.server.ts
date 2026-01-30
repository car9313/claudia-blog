import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Post } from './posts.types'

const postsDirectory = path.join(process.cwd(), 'content', 'posts')

function ensurePostsDir() {
    if (!fs.existsSync(postsDirectory)) {
        fs.mkdirSync(postsDirectory, { recursive: true })
    }
}

// Simple in-memory cache for parsed posts. Only enabled in production to
// avoid masking content edits during development.
let postsCache: Post[] | null = null

export function clearPostsCache() {
    postsCache = null
}
export function getPostSlugs() {
  try {
    return fs
      .readdirSync(postsDirectory)
      .filter((file) => file.endsWith(".md"));
  } catch {
    return [];
  }
}

export function getAllPosts(): Post[] {
    ensurePostsDir()

    const isDev = process.env.NODE_ENV !== 'production'
    if (!isDev && postsCache) return postsCache

    const fileNames = getPostSlugs()
    const posts: Post[] = fileNames.map((fileName) => {
        const slug = fileName.replace(/\.md$/, '')
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContents)
        // Normalize date: keep raw ISO for sorting (`dateRaw`) and formatted human-friendly `date` (DD/MM/YYYY)
        const dateIso = data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const [y, m, d] = dateIso.split('-');
        const formatted = `${d}/${m}/${y}`; // DD/MM/YYYY

        return {
            id: slug,
            slug,
            title: data.title || 'Sin título',
            excerpt: data.excerpt || '',
            content: content || '',
            category: data.category || 'General',
            author: data.author || 'Anónimo',
            tags: data.tags || [],
            readTime: data.readTime || '5 min',
            date: formatted,
            dateRaw: dateIso,
            published: data.published !== false,
            image: data.image,
        }
    })

    const result = posts
        .filter((post) => post.published)
        .sort((a, b) => new Date((b.dateRaw as string)).getTime() - new Date((a.dateRaw as string)).getTime())

    if (!isDev) postsCache = result
    return result
}

export function getPostBySlug(slug: string): Post | null {
    try {
        const filePath = path.join(postsDirectory, `${slug}.md`)
        if (!fs.existsSync(filePath)) return null

        const fileContents = fs.readFileSync(filePath, 'utf8')
        const { data, content } = matter(fileContents)
        const dateIso = data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const [y, m, d] = dateIso.split('-');
        const formatted = `${d}/${m}/${y}`;

        return {
            id: slug,
            slug,
            title: data.title || 'Sin título',
            excerpt: data.excerpt || '',
            content: content || '',
            category: data.category || 'General',
            author: data.author || 'Anónimo',
            tags: data.tags || [],
            readTime: data.readTime || '5 min',
            date: formatted,
            dateRaw: dateIso,
            published: data.published !== false,
            image: data.image,
        }
    } catch (err) {
        console.error(`Error loading post ${slug}:`, err)
        return null
    }
}

/**
 * Búsqueda básica server-side (title). Puedes ampliar a excerpt/tags/etc.
 */
export function searchPosts(search: string): Post[] {
    const q = (search ?? '').toString().trim()
    if (!q) return []

    const all = getAllPosts()
    const lower = q.toLowerCase()
    console.log(search)
    return all.filter((p) => p.title.toLowerCase().includes(lower))
}

// Obtener todas las categorías
export function getAllCategories(): string[] {
    const posts = getAllPosts();
    const categories = [...new Set(posts.map(post => post.category))];
    return ['Todos', ...categories];
}


// Obtener posts por categoría
export function getPostsByCategory(category: string): Post[] {
    const posts = getAllPosts();

    if (category === 'Todos') {
        return posts;
    }

    return posts.filter(post => post.category === category);
}

export function getRelatedPosts(post: Post, limit = 3, allPosts?: Post[]): Post[] {
    const source = allPosts ?? getAllPosts()

    // Filter out the current post
    const otherPosts = source.filter((p) => p.slug !== post.slug)

    // Calculate relevance score based on shared tags
    const postsWithScores = otherPosts.map((otherPost) => {
        const sharedTags = otherPost.tags.filter((tag) => post.tags.includes(tag))
        return {
            post: otherPost,
            score: sharedTags.length,
        }
    })

    // Sort by score and return top posts
    return postsWithScores
        .sort((a, b) => b.score - a.score)
        .filter((item) => {
            return item.score > 0
        })
        .slice(0, limit)
        .map((item) => item.post)
}

// Obtener posts recientes (opcional)
export function getRecentPosts(limit: number = 3): Post[] {
    const posts = getAllPosts();
    return posts.slice(0, limit);
}
