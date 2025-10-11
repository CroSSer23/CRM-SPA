# Виправлення помилки useState в Layout

## Проблема

`app/layout.tsx` використовував `ClerkProvider` та `Toaster` без `"use client"`, що викликало помилку `useState is not a function`.

## Причина

1. **ClerkProvider** - це Client Component який використовує React Context
2. **Toaster** - використовує `useToast` hook який містить `useState`
3. **layout.tsx** - за замовчуванням Server Component
4. **metadata** - може бути тільки в Server Components

## Рішення

Створити окремий Client Component для providers:

### 1. components/providers.tsx (новий файл)
```tsx
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
```

### 2. app/layout.tsx (оновлено)
```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SPA Procurement System",
  description: "Centralized procurement system for SPA locations in London",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

## Чому це працює?

- ✅ `layout.tsx` залишається Server Component (може мати metadata)
- ✅ `Providers` є Client Component (може використовувати hooks)
- ✅ Children передаються через props (Server Components можуть бути children Client Components)
- ✅ Немає конфліктів між Server/Client boundaries

## Результат

Помилка `useState is not a function` має зникнути, оскільки всі Client-side функції тепер правильно ізольовані в Client Components.

---

**Дата:** 2025-01-15  
**Статус:** Fixed ✅
