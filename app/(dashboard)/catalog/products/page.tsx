import { prisma } from "@/lib/prisma"
import { getRBACContext, canManageCatalog } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UNIT_LABELS } from "@/lib/types"
import Link from "next/link"

async function getProducts() {
  return await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  })
}

async function getCategories() {
  return await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  })
}

export default async function ProductsPage() {
  const rbac = await getRBACContext()

  if (!canManageCatalog(rbac)) {
    redirect("/")
  }

  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage product catalog</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/catalog/categories"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Categories
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{product.name}</CardTitle>
                  {product.category && (
                    <Badge variant="outline" className="mt-1">
                      {product.category.name}
                    </Badge>
                  )}
                </div>
                {!product.active && (
                  <Badge variant="destructive" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {product.sku && (
                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
              )}
              <p className="text-sm">
                <span className="font-medium">Unit:</span> {UNIT_LABELS[product.unit]}
              </p>
              {product.description && (
                <p className="text-sm text-muted-foreground">{product.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground">No products found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

