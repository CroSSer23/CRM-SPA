"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"

interface Location {
  id: string
  name: string
  address?: string
  _count: {
    users: number
    requisitions: number
    assignments: number
  }
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  })

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    const res = await fetch("/api/locations")
    const data = await res.json()
    setLocations(data.locations || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = editingLocation 
      ? `/api/locations/${editingLocation.id}` 
      : `/api/locations`
    
    const method = editingLocation ? "PATCH" : "POST"
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
    
    if (res.ok) {
      loadLocations()
      setDialogOpen(false)
      resetForm()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Видалити цю локацію?")) return
    
    const res = await fetch(`/api/locations/${id}`, { method: "DELETE" })
    if (res.ok) {
      loadLocations()
    }
  }

  const handleEdit = (location: Location) => {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      address: location.address || "",
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingLocation(null)
    setFormData({ name: "", address: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground">Manage SPA locations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLocation ? "Edit" : "Add"} Location</DialogTitle>
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
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit">{editingLocation ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{location.name}</CardTitle>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(location)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(location.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {location.address && (
                <p className="text-sm text-muted-foreground mb-3">{location.address}</p>
              )}
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>{location._count.users} users</span>
                <span>{location._count.requisitions} req's</span>
                <span>{location._count.assignments} products</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}