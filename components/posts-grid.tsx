import { BlogCard } from "./blog-card"
import { Post } from "../lib/posts.types"


interface PostsGridProps {
    posts: Post[]
}

export function PostsGrid({ posts }: PostsGridProps) {
    return (
        <div className="w-full max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8 auto-rows-fr">
                {posts.map((post) => (
                    <div key={`${post.slug}`} className="w-full max-w-sm mx-auto">
                        <BlogCard post={post} />
                    </div>
                ))}
            </div>

            {posts.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-slate-500 dark:text-slate-400 text-lg">No hay artículos en esta categoría</p>
                </div>
            )}
        </div>
    )
}