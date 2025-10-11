import { requireProcurement } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

async function getProducts() {
  return await prisma.product.findMany({
    include: {
      category: true
    },
    orderBy: {
      name: 'asc'
    }
  })
}

export default async function ProductsPage() {
  await requireProcurement()
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Products</h1>
      
      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {product.category && (
                      <Badge variant="secondary">{product.category.name}</Badge>
                    )}
                    <Badge variant="outline">{product.unit}</Badge>
                    {product.sku && (
                      <Badge variant="outline">{product.sku}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
