import { requireProcurement } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function CatalogPage() {
  await requireProcurement()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Catalog</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              TRYBE Catalog
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                New
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Синхронізація товарів з TRYBE API
            </p>
            <Link href="/catalog/trybe">
              <Button className="bg-[#8B7355] hover:bg-[#6d5a43]">View TRYBE Products</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
