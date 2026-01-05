import AnimatedBackground from "../components/animated-background";
import { CategoryTabs } from "../components/CategoryTabs";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HeaderButtons from "../components/header-button";
import { PostsGrid } from "../components/posts-grid";
import { getAllCategories, getPostsByCategory } from "../lib/posts";

interface RutesProps {
  searchParams: Promise<
    { category?: string }
  >
}

export default async function Home({ searchParams }: RutesProps) {
  const { category } = await searchParams;
  const activeCategory = category || 'Todos';
  const categories = getAllCategories();
  const filteredPosts = getPostsByCategory(activeCategory)

  return (

    <>
      <Header />
      <CategoryTabs categories={categories} />
      <PostsGrid posts={filteredPosts} />
      <Footer />
    </>

  );
}
