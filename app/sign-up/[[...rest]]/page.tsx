"use client"

import { useEffect } from 'react'

export default function SignUpRedirect() {
  useEffect(() => {
    // Redirect to Clerk hosted sign-up page
    window.location.href = 'https://dominant-earwig-41.accounts.dev/sign-up'
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Redirecting to sign up...</p>
    </div>
  )
}
