import { Calendar, Clock, User } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "../../../components/ui/badge";

import { MarkdownContent } from "../../../components/MarkdownContent";
import { Suspense } from "react";
import { RelatedPosts } from "../../../components/RelatedPosts";
import { getPostBySlug } from "../../../lib/posts.server";
import { relatedPostsServer } from "../../../lib/actions/relatedPost";


interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) {
        notFound();
    }
    const relatedPosts = await relatedPostsServer(post)
    return (
        <Suspense fallback={<p>Cargando</p>}>
            <>
                <div className="flex justify-start items-center mb-8">
                </div>

                <article className="max-w-4xl mx-auto">
                    <header className="mb-8 animate-fade-in-up">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag, index) => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="bg-linear-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:scale-105 transition-transform duration-200"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <p className="text-xl text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                            {post.excerpt}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                <User className="w-4 h-4" />
                                {post.author}
                            </div>
                            <div className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                <Calendar className="w-4 h-4" />
                                {post.date}
                            </div>
                            <div className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                <Clock className="w-4 h-4" />
                                {post.readTime}
                            </div>
                        </div>
                    </header>

                    {post.image && (
                        <div className="mb-16 rounded-2xl overflow-hidden shadow-2xl border-2 border-border">
                            <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-auto" />
                        </div>
                    )}
                    <MarkdownContent content={post.content} />
                    {
                        relatedPosts.length > 0 &&
                        <RelatedPosts posts={relatedPosts} />
                    }
                </article>
            </>
        </Suspense>


    )
}