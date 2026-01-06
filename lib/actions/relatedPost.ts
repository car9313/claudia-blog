'use server'

import type { Post } from '@/lib/posts.types'
import { getRelatedPosts, searchPosts } from '@/lib/posts.server'

export async function relatedPostsServer(post: Post): Promise<Post[]> {

    if (!post) return []
    return getRelatedPosts(post)
}
