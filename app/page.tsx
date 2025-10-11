import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const user = await getCurrentUser()

  // If logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  // Landing page for non-authenticated users
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h1 className="mb-4 text-5xl font-bold text-gray-900">
          SPA Procurement System
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          Centralized procurement management for SPA locations in London
        </p>
        <div className="flex gap-4 justify-center">
          <a 
            href={`https://accounts.clerk.dev/sign-in?redirect_url=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL || 'https://spa.crosser.software')}/dashboard`}
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            Sign In
          </a>
          <a 
            href={`https://accounts.clerk.dev/sign-up?redirect_url=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL || 'https://spa.crosser.software')}/dashboard`}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-8 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  )
}
