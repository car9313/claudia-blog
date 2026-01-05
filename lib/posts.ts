import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface Post {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    author: string;
    tags: string[];
    readTime: string;
    date: string;
    published: boolean;
    image?: string;
}

// Función para leer archivos markdown
export function getAllPosts(): Post[] {
    // Verificar si la carpeta existe
    if (!fs.existsSync(postsDirectory)) {
        console.warn('📁 La carpeta content/posts no existe. Creándola...');
        fs.mkdirSync(postsDirectory, { recursive: true });
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);

    const posts = fileNames
        .filter(fileName => fileName.endsWith('.md'))
        .map((fileName) => {
            const slug = fileName.replace(/\.md$/, '');
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data, content } = matter(fileContents);

            return {
                id: slug,
                slug,
                title: data.title || 'Sin título',
                excerpt: data.excerpt || '',
                content: content, // Markdown crudo
                category: data.category || 'General',
                author: data.author || 'Anónimo',
                tags: data.tags || [],
                readTime: data.readTime || '5 min',
                date: data.date || new Date().toISOString().split('T')[0],
                published: data.published !== false,
                image: data.image
            };
        });

    return posts
        .filter(post => post.published)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}


// Obtener un post por slug
export function getPostBySlug(slug: string): Post | null {
    try {
        const filePath = path.join(postsDirectory, `${slug}.md`);

        if (!fs.existsSync(filePath)) {
            return null;
        }

        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
            id: slug,
            slug,
            title: data.title || 'Sin título',
            excerpt: data.excerpt || '',
            content: content, // Markdown crudo
            category: data.category || 'General',
            author: data.author || 'Anónimo',
            tags: data.tags || [],
            readTime: data.readTime || '5 min',
            date: data.date || new Date().toISOString().split('T')[0],
            published: data.published !== false,
            image: data.image
        };
    } catch (error) {
        console.error(`Error cargando post ${slug}:`, error);
        return null;
    }
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