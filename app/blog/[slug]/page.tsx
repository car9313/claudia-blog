// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getAllPostsCached,
  getPrevNextPost,
  getRelatedPosts,
} from "@/lib/posts.server";
import { processMarkdownToReact } from "@/lib/markdown";
import { Badge } from "@/components/ui/badge";
import { RelatedPosts } from "@/components/related-posts";
import { Calendar, User, Clock, ArrowLeft, ArrowRight } from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPostsCached();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const all = await getAllPostsCached();
  const post = all.find((p) => p.slug === slug);
  if (!post) return { title: "Post no encontrado" };
  return { title: `${post.title} - DevBlog`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const all = await getAllPostsCached();
  const post = all.find((p) => p.slug === slug);

  if (!post) notFound();

  const { prevPost, nextPost } = await getPrevNextPost(post.slug);
  const relatedPosts = await getRelatedPosts(post);
  const readingTime = Math.ceil(post.content.split(/\s+/).length / 200);
  const content = await processMarkdownToReact(post.content);

  return (
    <div className="container py-12 mx-auto max-w-4xl px-6">
      <article className="mx-auto">
        <header className="mb-16 space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20"
            >
              {post.category}
            </Badge>
            {post.tags.map((tag, index) => {
              const colors = [
                "border-secondary/30 text-secondary",
                "border-accent/30 text-accent",
              ];
              return (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`px-4 py-2 text-sm ${colors[index % colors.length]}`}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance leading-tight bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {post.title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground text-pretty leading-relaxed">
            {post.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-6 border-t border-border">
            {post.author && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span>{post.author}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-secondary/10 rounded-full">
                <Calendar className="h-4 w-4 text-secondary" />
              </div>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-accent/10 rounded-full">
                <Clock className="h-4 w-4 text-accent" />
              </div>
              <span>{readingTime} min de lectura</span>
            </div>
          </div>
        </header>

        {post.image && (
          <div className="mb-16 rounded-2xl overflow-hidden shadow-2xl border-2 border-border">
            <Image
              src={post.image}
              alt={post.title}
              width={1200}
              height={630}
            />
          </div>
        )}

        <div className="prose w-full max-w-none mb-20">{content}</div>

        {/* Previous / Next */}
        <nav className="max-w-4xl mx-auto flex flex-col md:flex-row justify-center md:justify-between items-center gap-2 mt-12 mb-8">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              rel="prev"
              className="inline-flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="truncate max-w-50">{prevPost.title}</span>
            </Link>
          ) : (
            <div />
          )}
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              rel="next"
              className="inline-flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors"
            >
              <span className="truncate max-w-50">{nextPost.title}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div />
          )}
        </nav>

        {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}
      </article>
    </div>
  );
}
