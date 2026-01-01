'use client'
import { motion, AnimatePresence } from "framer-motion"
import { BlogCard } from "./blog-card"

interface Post {
    slug: string
    title: string
    excerpt: string
    date: string
    author: string
    readTime: string
    tags: string[]
    category: string
}

interface PostsGridProps {
    posts: Post[]
}

export function PostsGrid({ posts }: PostsGridProps) {

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Grid responsivo con tamaños fijos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8 auto-rows-fr">
                <AnimatePresence mode={"sync"}>
                    {posts.map((post, index) => (
                        <motion.div
                            key={`${post.slug}`}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                transition: {
                                    duration: 0.4,
                                    delay: index * 0.1,
                                    ease: "easeOut",
                                },
                            }}
                            exit={{
                                opacity: 0,
                                y: -20,
                                scale: 0.9,
                                transition: {
                                    duration: 0.2,
                                },
                            }}
                            layout
                            className="w-full max-w-sm mx-auto"
                        >
                            <BlogCard post={post} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Mensaje cuando no hay posts */}
            {posts.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                    <p className="text-slate-500 dark:text-slate-400 text-lg">No hay artículos en esta categoría</p>
                </motion.div>
            )}
        </div>
    )
}
