"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Settings } from "lucide-react"
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState("")

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

  const handleChangeRole = async () => {
    if (!selectedUser) return
    
    const res = await fetch(`/api/users/${selectedUser.id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole })
    })
    
    if (res.ok) {
      loadUsers()
      setDialogOpen(false)
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

  const openRoleDialog = (user: User) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage users, roles and location assignments</p>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{user.name}</h3>
                    <Badge>{user.role}</Badge>
                    <Button size="icon" variant="ghost" onClick={() => openRoleDialog(user)}>
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                  
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Change Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update role for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
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
            <Button onClick={handleChangeRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}