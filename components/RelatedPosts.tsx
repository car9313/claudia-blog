import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { Post } from "../lib/posts"


interface RelatedPostsProps {
    posts: Post[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
    if (posts.length === 0) {
        return null
    }

    return (
        <div className="mt-16 border-t border-border pt-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Posts Relacionados</h2>
            <div className="grid gap-4 md:grid-cols-3">
                {posts.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                        <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                            <CardHeader>
                                <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-start justify-between gap-2">
                                    <span className="text-balance">{post.title}</span>
                                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{post.excerpt}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
