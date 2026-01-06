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

export function getAllPosts(): Post[] {
    ensurePostsDir()

    const fileNames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith('.md'))

    const posts: Post[] = fileNames.map((fileName) => {
        const slug = fileName.replace(/\.md$/, '')
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContents)

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
            date: data.date || new Date().toISOString().split('T')[0],
            published: data.published !== false,
            image: data.image,
        }
    })

    return posts
        .filter((post) => post.published)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): Post | null {
    try {
        const filePath = path.join(postsDirectory, `${slug}.md`)
        if (!fs.existsSync(filePath)) return null

        const fileContents = fs.readFileSync(filePath, 'utf8')
        const { data, content } = matter(fileContents)

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
            date: data.date || new Date().toISOString().split('T')[0],
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

export function getRelatedPosts(post: Post, limit = 3): Post[] {
    const allPosts = getAllPosts()

    // Filter out the current post
    const otherPosts = allPosts.filter((p) => p.slug !== post.slug)

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