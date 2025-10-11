import { requireProcurement } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function CatalogPage() {
  await requireProcurement()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Catalog</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage products catalog
            </p>
            <Link href="/catalog/products">
              <Button>View Products</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage product categories
            </p>
            <Link href="/catalog/categories">
              <Button>View Categories</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
