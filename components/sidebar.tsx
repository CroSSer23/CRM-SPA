"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  Building2, 
  Users,
  ChevronDown,
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  userRole: string
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const [catalogOpen, setCatalogOpen] = useState(pathname.startsWith('/catalog'))
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  const NavContent = () => (
    <>
      <div className={cn("border-b transition-all", collapsed ? "p-4" : "p-6")}>
        <Link href="/dashboard" className="flex items-center gap-3">
          {collapsed ? (
            <div className="w-8 h-8 bg-[#8B7355] rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
          ) : (
            <img 
              src="https://coconcompany.com/cdn/shop/files/Logo_cocon_lightBrown.svg?height=96&v=1716202292" 
              alt="COCON COMPANY"
              className="h-10 w-auto"
            />
          )}
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive('/dashboard') 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
          )}
          title={collapsed ? "Dashboard" : ""}
        >
          <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        <Link
          href="/requisitions"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive('/requisitions') 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
          )}
          title={collapsed ? "Requisitions" : ""}
        >
          <FileText className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Requisitions</span>}
        </Link>

        {(userRole === 'ADMIN' || userRole === 'PROCUREMENT') && (
          <>
            {collapsed ? (
              <Link
                href="/catalog/products"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive('/catalog')
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                )}
                title="Catalog"
              >
                <Package className="h-5 w-5 flex-shrink-0" />
              </Link>
            ) : (
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
                    <Package className="h-5 w-5 flex-shrink-0" />
                    <span>Catalog</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", catalogOpen && "rotate-180")} />
                </button>
                
                {catalogOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link
                      href="/catalog/products"
                      onClick={() => setMobileOpen(false)}
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
                      onClick={() => setMobileOpen(false)}
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
            )}
          </>
        )}

        {userRole === 'ADMIN' && (
          <>
            <Link
              href="/locations"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive('/locations')
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              )}
              title={collapsed ? "Locations" : ""}
            >
              <Building2 className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Locations</span>}
            </Link>

            <Link
              href="/users"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive('/users')
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              )}
              title={collapsed ? "Users" : ""}
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Users</span>}
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border shadow-lg"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col border-r bg-white h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}>
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside className={cn(
        "lg:hidden fixed left-0 top-0 z-40 flex flex-col border-r bg-white h-screen w-64 transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <NavContent />
      </aside>
    </>
  )
}
