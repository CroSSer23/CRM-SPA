"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, RefreshCw, Package, TrendingUp, DollarSign } from "lucide-react"

interface TrybeProduct {
  id: string
  name: string
  description: string | null
  barcode: number | null
  sku: string | null
  reorder_level: number | null
  currency: string
  brand_id: string | null
  category_id: string | null
  organisation_id: string
  site_id: string
  average_cost: number | null
  stock_value: number | null
  stock_level: number | null
}

interface TrybeResponse {
  data: TrybeProduct[]
  meta: {
    from: number
    to: number
    total: number
    current_page: number
    last_page: number
    per_page: number
    path: string
  }
}

export default function TrybeCatalogPage() {
  const [products, setProducts] = useState<TrybeProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [meta, setMeta] = useState<TrybeResponse["meta"] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async (query = "") => {
    setLoading(true)
    setError(null)
    try {
      const url = query 
        ? `/api/trybe/products?query=${encodeURIComponent(query)}`
        : "/api/trybe/products"
      
      const res = await fetch(url)
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to load products")
      }
      
      const data: TrybeResponse = await res.json()
      setProducts(data.data)
      setMeta(data.meta)
    } catch (err) {
      console.error("Load products error:", err)
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadProducts(searchQuery)
  }

  const handleSync = async () => {
    setSyncing(true)
    await loadProducts(searchQuery)
    setSyncing(false)
  }

  const formatCurrency = (amount: number | null, currency: string) => {
    if (amount === null) return "—"
    const symbol = currency === "gbp" ? "£" : currency.toUpperCase()
    return `${symbol}${(amount / 100).toFixed(2)}`
  }

  const getStockBadge = (level: number | null, reorderLevel: number | null) => {
    if (level === null) return <Badge variant="outline">Unknown</Badge>
    if (reorderLevel && level <= reorderLevel) {
      return <Badge variant="destructive">Low Stock</Badge>
    }
    if (level === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    return <Badge variant="default" className="bg-green-600">In Stock</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">TRYBE Catalog</h1>
          <p className="text-muted-foreground">
            Синхронізація товарів з TRYBE API
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Now"}
        </Button>
      </div>

      {/* Stats Cards */}
      {meta && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meta.total}</div>
              <p className="text-xs text-muted-foreground">
                Showing {meta.from}-{meta.to}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  products.reduce((sum, p) => sum + (p.stock_value || 0), 0),
                  products[0]?.currency || "gbp"
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock Items</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.reduce((sum, p) => sum + (p.stock_level || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total units in stock
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              Search
            </Button>
            {searchQuery && (
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  loadProducts("")
                }}
              >
                Clear
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead className="text-right">Stock Level</TableHead>
                    <TableHead className="text-right">Reorder Level</TableHead>
                    <TableHead className="text-right">Avg Cost</TableHead>
                    <TableHead className="text-right">Stock Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.sku ? (
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {product.sku}
                          </code>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.barcode || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {product.stock_level ?? "—"}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {product.reorder_level ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.average_cost, product.currency)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(product.stock_value, product.currency)}
                      </TableCell>
                      <TableCell>
                        {getStockBadge(product.stock_level, product.reorder_level)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Info */}
      {meta && meta.last_page > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>
                Page {meta.current_page} of {meta.last_page}
              </p>
              <p>
                Showing {meta.from}-{meta.to} of {meta.total} products
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

