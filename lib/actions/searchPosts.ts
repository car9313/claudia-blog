'use server'

import type { Post } from '@/lib/posts.types'
import { searchPosts } from '@/lib/posts.server'

export async function searchPostsServer(query: string): Promise<Post[]> {
    // Puedes añadir logs, metrics o validaciones aquí
    const q = (query ?? '').toString().trim()
    if (!q) return []
    const prueba = searchPosts(q)
    console.log(prueba)
    return prueba
}
