"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2 } from "lucide-react"

interface Product {
  id: string
  name: string
  sku?: string
  unit: string
  description?: string
  category?: { id: string; name: string }
}

interface Category {
  id: string
  name: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    unit: "PCS",
    categoryId: "",
    description: "",
  })

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const loadProducts = async () => {
    const res = await fetch("/api/products")
    const data = await res.json()
    setProducts(data.products || [])
  }

  const loadCategories = async () => {
    const res = await fetch("/api/categories")
    const data = await res.json()
    setCategories(data.categories || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = editingProduct 
      ? `/api/products/${editingProduct.id}` 
      : `/api/products`
    
    const method = editingProduct ? "PATCH" : "POST"
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
    
    if (res.ok) {
      loadProducts()
      setDialogOpen(false)
      resetForm()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Видалити цей продукт?")) return
    
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
    if (res.ok) {
      loadProducts()
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku || "",
      unit: product.unit,
      categoryId: product.category?.id || "",
      description: product.description || "",
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      sku: "",
      unit: "PCS",
      categoryId: "",
      description: "",
    })
  }

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(p => p.category?.id === selectedCategory)

  const productsByCategory = categories.map(cat => ({
    category: cat,
    products: products.filter(p => p.category?.id === cat.id)
  }))
  
  const uncategorized = products.filter(p => !p.category)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit" : "Add"} Product</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Update" : "Create a new"} product in the catalog
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Unit *</Label>
                  <Select value={formData.unit} onValueChange={(v) => setFormData({...formData, unit: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PCS">PCS</SelectItem>
                      <SelectItem value="ML">ML</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="G">G</SelectItem>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="PACK">PACK</SelectItem>
                      <SelectItem value="BOX">BOX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={formData.categoryId} onValueChange={(v) => setFormData({...formData, categoryId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit">{editingProduct ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {productsByCategory.map(({ category, products: catProducts }) => (
          catProducts.length > 0 && (
            <div key={category.id}>
              <h2 className="text-xl font-semibold mb-3">{category.name}</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {catProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium">{product.name}</h3>
                          {product.description && (
                            <p className="text-xs text-muted-foreground mt-1">{product.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(product)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">{product.unit}</Badge>
                        {product.sku && (
                          <Badge variant="secondary" className="text-xs">{product.sku}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        ))}
        
        {uncategorized.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Uncategorized</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {uncategorized.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium">{product.name}</h3>
                        {product.description && (
                          <p className="text-xs text-muted-foreground mt-1">{product.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(product)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{product.unit}</Badge>
                      {product.sku && (
                        <Badge variant="secondary" className="text-xs">{product.sku}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}