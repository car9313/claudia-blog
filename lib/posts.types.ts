// lib/posts.types.ts
export interface Post {
    id: string
    slug: string
    title: string
    excerpt: string
    content: string
    category: string
    author: string
    tags: string[]
    readTime: string
    date: string
    published: boolean
    image?: string
}
