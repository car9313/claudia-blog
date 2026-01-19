import { CategoryTabs } from "@/components/CategoryTabs";
import { PostsGrid } from "@/components/posts-grid";
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
    <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
          Explorar por Categorías
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          Filtra los posts por categoría para encontrar exactamente lo que
          buscas
        </p>
      </div>
      <CategoryTabs categories={categories} />
      <PostsGrid posts={filteredPosts} />
    
    </>
  );
}
