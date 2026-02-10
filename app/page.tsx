
import Hero from "@/components/hero";
import { PostsGrid } from "@/components/posts-grid";
import TitleHeader from "@/components/title-header";
import { getRecentPosts } from "@/lib/posts.server";

export default async function Home() {
  const filteredPosts = getRecentPosts()

  return (
    <div className="container mx-auto">
     <Hero/>
      <TitleHeader title={"Últimos Posts"}  description="Los artículos más recientes del blog"/>    
   <PostsGrid posts={filteredPosts} />
   </div>
  )
}