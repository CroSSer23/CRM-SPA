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
        <div className="mb-12 flex justify-center">
          <img 
            src="https://coconcompany.com/cdn/shop/files/Logo_cocon_lightBrown.svg?height=96&v=1716202292" 
            alt="COCON COMPANY"
            className="h-24 w-auto"
          />
        </div>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-in">
            <Button size="lg">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button size="lg" variant="outline">Sign Up</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}