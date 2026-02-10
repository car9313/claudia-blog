'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Post } from "../lib/posts.types"
import { PostCard } from './post-card'


interface PostsGridAnimatedProps {
    posts: Post[]
    enableInfiniteScroll?: boolean
}

const POSTS_PER_PAGE = 6

export function PostsGridAnimated({ posts, enableInfiniteScroll = false }: PostsGridAnimatedProps) {
    const [displayedPosts, setDisplayedPosts] = useState<Post[]>([])
    const [hasMore, setHasMore] = useState(true)
    const observerTarget = useRef<HTMLDivElement>(null)

    // Inicializar con los primeros 6 posts
    useEffect(() => {
        setDisplayedPosts(posts.slice(0, POSTS_PER_PAGE))
        setHasMore(posts.length > POSTS_PER_PAGE)
    }, [posts])

    // Configurar Intersection Observer para infinite scroll
    useEffect(() => {
        if (!enableInfiniteScroll || !observerTarget.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setDisplayedPosts((prev) => {
                        const nextIndex = prev.length
                        const newPosts = posts.slice(nextIndex, nextIndex + POSTS_PER_PAGE)
                        const allPosts = [...prev, ...newPosts]
                        
                        // Actualizar si hay más posts
                        if (allPosts.length >= posts.length) {
                            setHasMore(false)
                        }
                        
                        return allPosts
                    })
                }
            },
            { threshold: 0.1 }
        )

        observer.observe(observerTarget.current)

        return () => observer.disconnect()
    }, [hasMore, posts, enableInfiniteScroll])

    return (
        <div className="w-full max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8 auto-rows-fr">
                <AnimatePresence mode={"sync"}>
                    {displayedPosts.map((post, index) => (
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
                            <PostCard key={post.slug} post={post} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {displayedPosts.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                    <p className="text-slate-500 dark:text-slate-400 text-lg">No hay artículos en esta categoría</p>
                </motion.div>
            )}

            {/* Elemento centinela para infinite scroll */}
            {enableInfiniteScroll && hasMore && (
                <div ref={observerTarget} className="flex justify-center py-8">
                    <div className="inline-flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            )}
        </div>
    )
}