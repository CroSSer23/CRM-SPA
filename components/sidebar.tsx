"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Building2, 
  Users,
  ChevronDown,
  FileText
} from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  userRole: string
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const [catalogOpen, setCatalogOpen] = useState(pathname.startsWith('/catalog'))

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <aside className="w-64 border-r bg-white h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <span>SPA Procurement</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive('/dashboard') 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        <Link
          href="/requisitions"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive('/requisitions') 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
          )}
        >
          <FileText className="h-4 w-4" />
          Requisitions
        </Link>

        {(userRole === 'ADMIN' || userRole === 'PROCUREMENT') && (
          <>
            <div>
              <button
                onClick={() => setCatalogOpen(!catalogOpen)}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive('/catalog')
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4" />
                  Catalog
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", catalogOpen && "rotate-180")} />
              </button>
              
              {catalogOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    href="/catalog/products"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      pathname === '/catalog/products'
                        ? "bg-slate-100 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                    )}
                  >
                    Products
                  </Link>
                  <Link
                    href="/catalog/categories"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      pathname === '/catalog/categories'
                        ? "bg-slate-100 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                    )}
                  >
                    Categories
                  </Link>
                </div>
              )}
            </div>
          </>
        )}

        {userRole === 'ADMIN' && (
          <>
            <Link
              href="/locations"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive('/locations')
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              )}
            >
              <Building2 className="h-4 w-4" />
              Locations
            </Link>

            <Link
              href="/users"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive('/users')
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              )}
            >
              <Users className="h-4 w-4" />
              Users
            </Link>
          </>
        )}
      </nav>
    </aside>
  )
}
