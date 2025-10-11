"use client"

import { useEffect } from 'react'

export default function SignInRedirect() {
  useEffect(() => {
    // Redirect to Clerk hosted sign-in page
    window.location.href = 'https://dominant-earwig-41.accounts.dev/sign-in'
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Redirecting to sign in...</p>
    </div>
  )
}
