# Фінальне виправлення деплою - Версія 3

## Проблема

Помилки `useState is not a function` в різних компонентах через неправильне використання Client/Server Components з Clerk v5.

## Рішення згідно з офіційною документацією

### 1. ✅ SignIn та SignUp - Server Components

**Офіційна документація:** https://clerk.com/docs/nextjs/guides/development/custom-sign-in-or-up-page

**Правильно:**
```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return <SignIn />
}
```

**Неправильно (моя помилка):**
```tsx
"use client"  // ← НЕ ПОТРІБНО!

import { SignIn } from "@clerk/nextjs"
```

### 2. ✅ UserButton - Client Component

UserButton потребує "use client", тому винесено в окремий компонент:

```tsx
// components/user-button-wrapper.tsx
"use client"

import { UserButton } from "@clerk/nextjs"

export function UserButtonWrapper() {
  return <UserButton afterSignOutUrl="/sign-in" />
}
```

### 3. ✅ NavBar - Server Component

NavBar залишається Server Component і використовує wrapper:

```tsx
// components/nav-bar.tsx
import { UserButtonWrapper } from "@/components/user-button-wrapper"

export async function NavBar() {
  const user = await getCurrentUser()
  return (
    <nav>
      {/* ... */}
      <UserButtonWrapper />
    </nav>
  )
}
```

### 4. ✅ not-found.tsx

Додано custom not-found page щоб уникнути проблем з default:

```tsx
// app/not-found.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <Link href="/">Go back home</Link>
    </div>
  )
}
```

## Clerk компоненти в v5

### Server Components (БЕЗ "use client")
- ✅ `<SignIn />` - auth page
- ✅ `<SignUp />` - auth page
- ✅ `auth()` - server function
- ✅ `currentUser()` - server function

### Client Components (З "use client")
- ✅ `<UserButton />` - interactive UI
- ✅ `<UserProfile />` - interactive UI
- ✅ `<OrganizationSwitcher />` - interactive UI
- ✅ `useUser()` - hook
- ✅ `useAuth()` - hook
- ✅ `useClerk()` - hook

## Environment Variables

Згідно з документацією, треба додати fallback URLs:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Fallback redirects
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"
```

## Файли змінено

1. ✅ `app/sign-in/[[...sign-in]]/page.tsx` - прибрано "use client"
2. ✅ `app/sign-up/[[...sign-up]]/page.tsx` - прибрано "use client"
3. ✅ `components/user-button-wrapper.tsx` - новий client wrapper
4. ✅ `components/nav-bar.tsx` - використовує wrapper
5. ✅ `app/not-found.tsx` - додано custom 404
6. ✅ `ENV_SETUP.md` - додано fallback URLs

## Деплой

```bash
git add .
git commit -m "fix: correct clerk v5 server/client components usage"
git push origin main
```

## Перевірка в Vercel

Після успішного деплою, додайте в Vercel Environment Variables:

```
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

Та redeploy:
```bash
# В Vercel Dashboard
Deployments → Latest → ... → Redeploy
```

## Ключові висновки

1. **`<SignIn />` та `<SignUp />`** - це Server Components, НЕ потребують "use client"
2. **`<UserButton />`** - це Client Component, потребує "use client" wrapper
3. **Composition pattern** - Server Components можуть використовувати Client Components через props/children
4. **Документація** - завжди перевіряйте офіційну документацію Clerk

## Джерела

- [Clerk Sign-In Page Guide](https://clerk.com/docs/nextjs/guides/development/custom-sign-in-or-up-page)
- [Clerk v5 Migration](https://clerk.com/docs/upgrade-guides/core-2/nextjs)
- [Next.js Server/Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)

---

**Дата:** 2025-01-15  
**Статус:** Фінальна версія ✅  
**Очікуваний результат:** Build successful, no useState errors

