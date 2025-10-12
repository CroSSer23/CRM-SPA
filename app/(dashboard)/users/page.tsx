"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Settings, Trash2, UserPlus, Edit, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface User {
  id: string
  name: string
  email: string
  role: string
  locations: Array<{
    id: string
    location: { id: string; name: string }
  }>
}

interface Location {
  id: string
  name: string
}

type DialogMode = 'create' | 'edit' | 'delete' | 'role' | null

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "REQUESTER"
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUsers()
    loadLocations()
  }, [])

  const loadUsers = async () => {
    const res = await fetch("/api/users")
    const data = await res.json()
    setUsers(data.users || [])
  }

  const loadLocations = async () => {
    const res = await fetch("/api/locations")
    const data = await res.json()
    setLocations(data.locations || [])
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "REQUESTER"
    })
    setError("")
    setLoading(false)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogMode('create')
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role
    })
    setError("")
    setDialogMode('edit')
  }

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setDialogMode('delete')
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelectedUser(null)
    resetForm()
  }

  const handleCreateUser = async () => {
    setError("")
    setLoading(true)
    
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || "Failed to create user")
        setLoading(false)
        return
      }
      
      await loadUsers()
      closeDialog()
    } catch (err) {
      setError("Network error")
      setLoading(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    
    setError("")
    setLoading(true)
    
    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      }
      
      if (formData.password) {
        updateData.password = formData.password
      }
      
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || "Failed to update user")
        setLoading(false)
        return
      }
      
      await loadUsers()
      closeDialog()
    } catch (err) {
      setError("Network error")
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    setLoading(true)
    
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE"
      })
      
      if (res.ok) {
        await loadUsers()
        closeDialog()
      } else {
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
    }
  }

  const handleAssignLocation = async (userId: string, locationId: string) => {
    const res = await fetch(`/api/users/${userId}/locations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId })
    })
    
    if (res.ok) {
      loadUsers()
    }
  }

  const handleRemoveLocation = async (userId: string, locationId: string) => {
    const res = await fetch(`/api/users/${userId}/locations?locationId=${locationId}`, {
      method: "DELETE"
    })
    
    if (res.ok) {
      loadUsers()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground text-sm hidden sm:block">Manage users, roles and location assignments</p>
        </div>
        <Button onClick={openCreateDialog}>
          <UserPlus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-medium truncate">{user.name}</h3>
                    <Badge>{user.role}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 truncate">{user.email}</p>
                  
                  <div className="flex gap-2 flex-wrap items-center">
                    <span className="text-xs text-muted-foreground">Locations:</span>
                    {user.locations.map((loc) => (
                      <Badge 
                        key={loc.id} 
                        variant="outline" 
                        className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveLocation(user.id, loc.location.id)}
                      >
                        {loc.location.name} ×
                      </Badge>
                    ))}
                    <Select onValueChange={(locId) => handleAssignLocation(user.id, locId)}>
                      <SelectTrigger className="w-32 h-6 text-xs">
                        <SelectValue placeholder="+ Add" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations
                          .filter(l => !user.locations.some(ul => ul.location.id === l.id))
                          .map(loc => (
                            <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-1 flex-shrink-0">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => openEditDialog(user)}
                    title="Edit user"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => openDeleteDialog(user)}
                    className="text-destructive hover:text-destructive"
                    title="Delete user"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit User Dialog */}
      <Dialog open={dialogMode === 'create' || dialogMode === 'edit'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Create New User' : 'Edit User'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'create' 
                ? 'Add a new user to the system' 
                : `Update details for ${selectedUser?.name}`}
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="password">
                Password {dialogMode === 'edit' && <span className="text-muted-foreground text-xs">(leave empty to keep current)</span>}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={dialogMode === 'create' ? "Enter password" : "Enter new password"}
              />
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REQUESTER">Requester</SelectItem>
                  <SelectItem value="PROCUREMENT">Procurement</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={dialogMode === 'create' ? handleCreateUser : handleUpdateUser}
              disabled={loading}
            >
              {loading ? 'Saving...' : dialogMode === 'create' ? 'Create User' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogMode === 'delete'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={loading}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}