"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {children}
      <Toaster />
    </ClerkProvider>
  )
}
