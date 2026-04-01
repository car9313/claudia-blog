import { memo } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'
import { Badge } from './ui/badge'
import { Post } from '@/lib/posts.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'


interface PostCardProps {
    post: Post
}

const PostCardComponent = ({ post }: PostCardProps) => {
    return (
        <Link href={`/blog/${post.slug}`} className="group block h-full">
            <Card className="h-full transition-all duration-300 hover:shadow-2xl
       hover:shadow-primary/10 hover:-translate-y-2 hover:border-primary/50 overflow-hidden bg-linear-to-br from-card via-card to-muted/20">
                {post.image && (
                    <div className="overflow-hidden">
                        <img
                            src={post.image || "/placeholder.svg"}
                            alt={post.title}
                            className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                )}
                <CardHeader className="p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 text-accent" />
                        <time dateTime={post.dateRaw ?? post.date}>{post.date}</time>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors text-balance leading-tight line-clamp-2">
                        {post.title}
                    </CardTitle>
                    <CardDescription className="text-pretty line-clamp-3">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="p-3">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            {post.category}
                        </Badge>
                        {post.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary font-medium group-hover:gap-3 transition-all">
                        <span>Leer más</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

export const PostCard = memo(PostCardComponent, (prevProps, nextProps) => {
    return prevProps.post.slug === nextProps.post.slug
})
