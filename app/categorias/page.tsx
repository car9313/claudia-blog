import { CategoryTabs } from "@/components/category-tabs";
import { PostsGridAnimated } from "@/components/posts-grid-animated";
import TitleHeader from "@/components/title-header";
import { getAllCategories, getPostsByCategory } from "@/lib/posts.server";

interface RoutesProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function Categorias({ searchParams }: RoutesProps) {
  const { category } = await searchParams;

  const activeCategory = category || "Todos";

  const categories = getAllCategories();
  const filteredPosts = await getPostsByCategory(activeCategory);

  return (
    <>
      <TitleHeader
        title="Explorar por Categorías"
        description="Filtra los posts por categoría para encontrar exactamente lo que buscas"
      />
      <CategoryTabs categories={categories} />
      <PostsGridAnimated posts={filteredPosts} enableInfiniteScroll />
    </>
  );
}
