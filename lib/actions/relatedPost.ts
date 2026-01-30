'use server'

import type { Post } from '@/lib/posts.types'
import { getRelatedPosts } from '@/lib/posts.server'

export async function relatedPostsServer(post: Post, allPosts?: Post[]): Promise<Post[]> {

    if (!post) return []
    return getRelatedPosts(post, 3, allPosts)
}
