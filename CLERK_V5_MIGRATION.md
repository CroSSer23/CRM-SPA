# Clerk v5 Migration Guide

## Зміни в Clerk v5

Clerk v5 має breaking changes в API. Цей проєкт використовує нові API.

## Основні зміни

### 1. Server-side imports тепер з `/server`

**Раніше (v4):**
```ts
import { auth, currentUser } from "@clerk/nextjs"
```

**Зараз (v5):**
```ts
import { auth, currentUser } from "@clerk/nextjs/server"
```

### 2. `auth()` тепер async

**Раніше (v4):**
```ts
const { userId } = auth()
```

**Зараз (v5):**
```ts
const { userId } = await auth()
```

### 3. Middleware змінено

**Раніше (v4):**
```ts
import { authMiddleware } from "@clerk/nextjs"

export default authMiddleware({
  publicRoutes: ["/sign-in", "/sign-up"]
})
```

**Зараз (v5):**
```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()
  }
})
```

## Де використовується в проєкті

### ✅ Файли з Clerk:

1. **`lib/auth.ts`** - основні auth функції
   ```ts
   import { auth as clerkAuth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server"
   ```

2. **`middleware.ts`** - захист роутів
   ```ts
   import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
   ```

3. **`app/api/uploadthing/core.ts`** - auth для файлів
   ```ts
   import { auth } from "@clerk/nextjs/server"
   ```

4. **`app/layout.tsx`** - ClerkProvider (без змін)
   ```ts
   import { ClerkProvider } from "@clerk/nextjs"
   ```

5. **`components/nav-bar.tsx`** - UserButton (без змін)
   ```ts
   import { UserButton } from "@clerk/nextjs"
   ```

6. **`app/sign-in/[[...sign-in]]/page.tsx`** - SignIn (без змін)
   ```ts
   import { SignIn } from "@clerk/nextjs"
   ```

7. **`app/sign-up/[[...sign-up]]/page.tsx`** - SignUp (без змін)
   ```ts
   import { SignUp } from "@clerk/nextjs"
   ```

## Client vs Server Components

**Server Components** (async functions):
- Використовують `@clerk/nextjs/server`
- `auth()` та `currentUser()` тепер async

**Client Components** ("use client"):
- Використовують `@clerk/nextjs`
- Hooks типу `useUser()`, `useAuth()`
- UI компоненти типу `<SignIn />`, `<UserButton />`

## Налаштування Clerk

### 1. Створіть додаток
https://dashboard.clerk.com

### 2. Додайте Environment Variables
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

### 3. Додайте домени
В Clerk Dashboard → Configure:
- Development: `http://localhost:3000`
- Production: `https://your-app.vercel.app`

### 4. Налаштуйте Redirect URLs
- Sign-in: `/sign-in`
- Sign-up: `/sign-up`
- After sign-in: `/`
- After sign-up: `/`

## Troubleshooting

### "auth is not a function"
Перевірте що використовуєте:
```ts
import { auth } from "@clerk/nextjs/server" // ✅ Правильно
import { auth } from "@clerk/nextjs"        // ❌ Неправильно (client-side)
```

### "Cannot use auth() outside async function"
В v5 `auth()` async:
```ts
// ❌ Неправильно
const { userId } = auth()

// ✅ Правильно
const { userId } = await auth()
```

### Middleware не працює
Переконайтесь що:
1. Використовується `clerkMiddleware` з `/server`
2. Правильний matcher в `export const config`
3. Public routes правильно вказані

## Корисні посилання

- [Clerk v5 Release Notes](https://clerk.com/changelog/2024-04-19)
- [Migration Guide](https://clerk.com/docs/upgrade-guides/core-2/nextjs)
- [Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)

---

**Версія Clerk:** 5.0.0+  
**Останнє оновлення:** 2025-01-15

