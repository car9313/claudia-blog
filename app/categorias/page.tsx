import { CategoryTabs } from "@/components/CategoryTabs";
import { PostsGrid } from "@/components/posts-grid";
import TitleHeader from "@/components/TitleHeader";
import { getAllCategories, getPostsByCategory } from "@/lib/posts.server";

interface RutesProps {
  searchParams: Promise<
    { category?: string }
  >
}

export default async function Categorias({ searchParams }: RutesProps) {
  const { category } = await searchParams;
  const activeCategory = category || 'Todos';
  const categories = getAllCategories();
  const filteredPosts = getPostsByCategory(activeCategory)

  return (
    <>
    <TitleHeader title={"Explorar por Categorías"} description={"Filtra los posts por categoría para encontrar exactamente lo que buscas"}/>
      <CategoryTabs categories={categories} />
      <PostsGrid posts={filteredPosts} />
    
    </>
  );
}
