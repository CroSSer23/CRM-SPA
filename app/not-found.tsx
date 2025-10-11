import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-700">Page Not Found</h2>
        <p className="mt-2 text-gray-500">
          The page you are looking for does not exist.
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button>Go back home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

