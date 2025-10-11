import { requireProcurement } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function getCategories() {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
}

export default async function CategoriesPage() {
  await requireProcurement()
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Categories</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {category._count.products} product(s)
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
