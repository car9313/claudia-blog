import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Post } from './posts.types'
import { categories } from '@/data/categories'

const postsDirectory = path.join(process.cwd(), 'content', 'posts')

function ensurePostsDir() {
    if (!fs.existsSync(postsDirectory)) {
        fs.mkdirSync(postsDirectory, { recursive: true })
    }
}

// Variable global para almacenar posts cargados (solo en tiempo de ejecución)
let loadedPosts: Post[] | null = null


export function getPostSlugs() {
  try {
    return fs
      .readdirSync(postsDirectory)
      .filter((file) => file.endsWith(".md"));
  } catch {
    return [];
  }
}

// Función auxiliar para parsear un post desde el contenido del archivo
function parsePostFromFile(fileName: string): Post {
    const slug = fileName.replace(/\.md$/, '')
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    // Normalize date: keep raw ISO for sorting (`dateRaw`) and formatted human-friendly `date` (DD/MM/YYYY)
    const dateIso = data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    const [y, m, d] = dateIso.split('-')
    const formatted = `${d}/${m}/${y}` // DD/MM/YYYY

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
}

// Función principal para cargar todos los posts (solo una vez por ejecución)
function loadAllPosts(): Post[] {
    ensurePostsDir()
    
    if (loadedPosts !== null) {
        return loadedPosts
    }
    
    const fileNames = getPostSlugs()
    const posts: Post[] = []
    
    for (const fileName of fileNames) {
        try {
            const post = parsePostFromFile(fileName)
            posts.push(post)
        } catch (error) {
            console.error(`Error loading post ${fileName}:`, error)
        }
    }
    
    const result = posts
        .filter((post) => post.published)
        .sort((a, b) => new Date((b.dateRaw as string)).getTime() - new Date((a.dateRaw as string)).getTime())
    
    loadedPosts = result
    return result
}

// Versión pública que expone los posts ya procesados
export function getAllPosts(): Post[] {
   console.log('Probando')
    return loadAllPosts()
}

/* export async function getPostBySlug(slug: string):Promise< Post | null> {
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
} */


export function getPostBySlug(slug: string): Post | null {
    const posts = getAllPosts()
    const existingPost = posts.find(post => post.slug === slug)
    if (existingPost) {
        return existingPost
    }
    
    // Si no está en los posts cargados, puede que no esté publicado
    // Intentamos cargarlo directamente desde el archivo
    try {
        const filePath = path.join(postsDirectory, `${slug}.md`)
        if (!fs.existsSync(filePath)) return null
        
        const post = parsePostFromFile(`${slug}.md`)
        return post.published ? post : null
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
    
    return all.filter((p) => 
        p.title.toLowerCase().includes(lower) ||
        p.excerpt.toLowerCase().includes(lower) ||
        p.tags.some(tag => tag.toLowerCase().includes(lower))
    )
}

// Obtener todas las categorías
export function getAllCategories(): string[] {
   /*  const posts = getAllPosts();
    const categories = [...new Set(posts.map(post => post.category))];
    return ['Todos', ...categories]; */
    return ['Todos',...new Set(categories.map(category => category.name))];
}

// Obtener posts por categoría
export function getPostsByCategory(category: string): Post[] {
    const posts = getAllPosts();

    if (category === 'Todos') {
        return posts;
    }

    return posts.filter(post => post.category === category);
}

export function getRelatedPosts(currentPost: Post, limit = 3): Post[] {
    // Filter out the current post
    const allPosts = getAllPosts()
    const otherPosts = allPosts.filter((p) => p.slug !== currentPost.slug)

    // Calculate relevance score based on shared tags
    const postsWithScores = otherPosts.map((post) => {
        const sharedTags = post.tags.filter((tag) => currentPost.tags.includes(tag))
        return {
            post,
            score: sharedTags.length + (post.category === currentPost.category ? 1 : 0)
        }
    })

    // Sort by score and return top posts
    return postsWithScores
        .sort((a, b) => b.score - a.score)
        .filter((item) => item.score > 0)
        .slice(0, limit)
        .map((item) => item.post)
}

// Obtener posts recientes
export function getRecentPosts(limit: number = 3): Post[] {
    const posts=getAllPosts()
    return posts.slice(0, limit)
}

// Función unificada para obtener todos los datos de un post con su contexto
export function getPostWithContext(slug: string): {
    post: Post | null
    prevPost: Post | null
    nextPost: Post | null
    relatedPosts: Post[]
} {
    const allPosts = getAllPosts()
    const post = allPosts.find(p => p.slug === slug)
    
    if (!post) {
        return {
            post: null,
            prevPost: null,
            nextPost: null,
            relatedPosts: [],
           }
    }    
    const currentIndex = allPosts.findIndex((p) => p.slug === slug)  
    const prevPost = currentIndex + 1 < allPosts.length ? allPosts[currentIndex + 1] : null
    const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null
    const relatedPosts = getRelatedPosts(post, 3)
    
    return {
        post,
        prevPost,
        nextPost,
        relatedPosts,
       }

}
export function getPrevNextPost(slug:string){
 const allPosts = getAllPosts()
    const currentIndex = allPosts.findIndex((p) => p.slug === slug)  
    const prevPost = currentIndex + 1 < allPosts.length ? allPosts[currentIndex + 1] : null
    const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null
return {
    prevPost,
    nextPost
}
}


