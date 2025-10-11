import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { Building2, Package, ShoppingCart, Users, LayoutDashboard, User } from "lucide-react"

export async function NavBar() {
  const user = await getCurrentUser()

  if (!user) return null

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="h-6 w-6" />
            <span>SPA Procurement</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            <Link
              href="/requisitions"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <Package className="h-4 w-4" />
              Requisitions
            </Link>

            {(user.role === "ADMIN" || user.role === "PROCUREMENT") && (
              <>
                <Link
                  href="/catalog"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <Package className="h-4 w-4" />
                  Catalog
                </Link>
              </>
            )}

            {user.role === "ADMIN" && (
              <>
                <Link
                  href="/locations"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <Building2 className="h-4 w-4" />
                  Locations
                </Link>
                <Link
                  href="/users"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-4 w-4" />
                  Users
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm">
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300"
            title="Sign Out"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </nav>
  )
}

