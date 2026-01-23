import TitleHeader from "@/components/TitleHeader";

import Header from "../components/Header";
import { PostsGrid } from "../components/posts-grid";
import { getAllCategories, getPostsByCategory, getRecentPosts } from "../lib/posts.server";

interface RutesProps {
  searchParams: Promise<
    { category?: string }
  >
}

export default async function Home({ searchParams }: RutesProps) {
  const filteredPosts = getRecentPosts(6)

  return (
    <>
      <Header />
     <TitleHeader title={"Últimos Posts"}  description="Los artículos más recientes del blog"/>
      <PostsGrid posts={filteredPosts} />
    </>
  );
}
