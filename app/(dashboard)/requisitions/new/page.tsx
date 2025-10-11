"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Location {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  unit: string
  category?: { name: string }
}

interface RequisitionItem {
  productId: string
  requestedQty: number
}

export default function NewRequisitionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedLocation, setSelectedLocation] = useState("")
  const [note, setNote] = useState("")
  const [items, setItems] = useState<RequisitionItem[]>([
    { productId: "", requestedQty: 1 }
  ])

  useEffect(() => {
    fetch("/api/locations")
      .then(res => res.json())
      .then(data => setLocations(data.locations || []))

    fetch("/api/products")
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
  }, [])

  const addItem = () => {
    setItems([...items, { productId: "", requestedQty: 1 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof RequisitionItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const validItems = items.filter(item => item.productId && item.requestedQty > 0)
      
      if (validItems.length === 0) {
        alert("Please add at least one item")
        setLoading(false)
        return
      }

      const response = await fetch("/api/requisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: selectedLocation,
          note,
          items: validItems
        })
      })

      if (response.ok) {
        const { requisition } = await response.json()
        router.push(`/requisitions/${requisition.id}`)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create requisition")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Requisition</h1>
        <p className="text-muted-foreground">Create a new purchase requisition</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Requisition Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Location *</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Input
                id="note"
                placeholder="Add any notes or special instructions..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Items *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  Add Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Product</Label>
                    <Select
                      value={item.productId}
                      onValueChange={(value) => updateItem(index, 'productId', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-32 space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.requestedQty}
                      onChange={(e) => updateItem(index, 'requestedQty', parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>

                  {items.length > 1 && (
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(index)}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading || !selectedLocation}>
                {loading ? "Submitting..." : "Submit Requisition"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
