type CategoryEntity = {
  id: number
  name: string
  slug: string
  _count?: {
    articles: number
  }
}

export function mapCategory(category: CategoryEntity) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    articlesCount: category._count?.articles ?? 0,
  }
}
