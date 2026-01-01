import Link from "next/link"
import { Calendar, Clock, User } from "lucide-react"
import { Card, CardContent, CardHeader } from "./ui/card"
import { Badge } from "./ui/badge"


interface Post {
    slug: string
    title: string
    excerpt: string
    date: string
    author: string
    readTime: string
    tags: string[]
    category: string // Añadir esta línea
}

interface BlogCardProps {
    post: Post
}

export function BlogCard({ post }: BlogCardProps) {
    return (
        <Card className="w-full h-full min-h-100 max-w-sm hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-purple-500/20 transition-all duration-500 group hover:-translate-y-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex flex-col">
            <CardHeader className="pb-4 shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 2).map((tag, index) => (
                            <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/50 dark:to-purple-900/50 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:scale-105 transition-transform duration-200"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <Badge
                        variant="secondary"
                        className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 flex-shrink-0"
                    >
                        {post.category}
                    </Badge>
                </div>
                <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2 leading-tight">
                        {post.title}
                    </h2>
                </Link>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between">
                <div className="flex-1">
                    <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 leading-relaxed text-sm">{post.excerpt}</p>
                </div>

                <div className="space-y-4 mt-auto">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <User className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>{post.readTime}</span>
                        </div>
                    </div>

                    <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-all duration-300 hover:gap-3 group/link text-sm"
                    >
                        Leer más
                        <span className="group-hover/link:translate-x-1 transition-transform duration-300">→</span>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
