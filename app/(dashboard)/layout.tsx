import { NavBar } from "@/components/nav-bar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="container mx-auto p-6">{children}</main>
    </div>
  )
}

