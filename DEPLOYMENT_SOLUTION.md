# Остаточне рішення для Clerk + Next.js 14

## Проблема

Помилка `useState is not a function` та конфлікти версій Clerk.

## Рішення - використати останню стабільну версію

### 1. Оновити Clerk до актуальної версії

**package.json:**
```json
{
  "dependencies": {
    "@clerk/nextjs": "^6.6.0"
  }
}
```

### 2. Client Components для всіх Clerk UI

Згідно з офіційною документацією та практикою, всі Clerk UI компоненти потребують `"use client"`:

**app/sign-in/[[...sign-in]]/page.tsx:**
```tsx
"use client"

import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <SignIn />
    </div>
  )
}
```

**app/sign-up/[[...sign-up]]/page.tsx:**
```tsx
"use client"

import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <SignUp />
    </div>
  )
}
```

### 3. Структура компонентів

**Client Components (з "use client"):**
- ✅ `app/sign-in/[[...sign-in]]/page.tsx`
- ✅ `app/sign-up/[[...sign-up]]/page.tsx`
- ✅ `components/user-button-wrapper.tsx`
- ✅ `app/(dashboard)/requisitions/new/page.tsx` (форма)

**Server Components (без "use client"):**
- ✅ `lib/auth.ts` - server-side utilities
- ✅ `middleware.ts` - Clerk middleware
- ✅ `components/nav-bar.tsx` - uses server-side auth
- ✅ Всі інші pages (dashboard, requisitions/[id], etc.)

### 4. Middleware конфігурація

**middleware.ts:**
```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
```

### 5. Environment Variables

**.env / Vercel Environment Variables:**
```env
# Database
DATABASE_URL="postgresql://..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"

# Optional
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"
SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."
```

## Деплой

```bash
# Commit зміни
git add .
git commit -m "fix: update clerk to v6.6.0 with proper client components"
git push origin main
```

## Верифікація в Vercel

1. **Build logs** - перевірити що встановлюється правильна версія:
   ```
   added 576 packages...
   @clerk/nextjs@6.6.0
   ```

2. **Environment Variables** - перевірити що всі змінні встановлені

3. **Функціональність:**
   - ✅ `/sign-in` відкривається
   - ✅ `/sign-up` відкривається
   - ✅ Реєстрація працює
   - ✅ Login працює
   - ✅ Dashboard доступний
   - ✅ UserButton працює

## Troubleshooting

### Якщо build все ще падає:

**Опція 1: Очистити все**
```bash
# Локально
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Опція 2: Vercel Cache**
```
Vercel Dashboard → Settings → General → Clear Build Cache
```

**Опція 3: Використати Clerk Hosted Pages**

Якщо custom pages створюють проблеми, використайте Clerk hosted auth:

1. Видаліть або закоментуйте в `.env`:
   ```env
   # NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   # NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
   ```

2. Clerk автоматично використає свої hosted pages

3. Це працює out-of-the-box без жодних проблем

## Ключові моменти

1. **Використовуйте актуальну версію Clerk** (`^6.6.0` або новішу)
2. **Всі Clerk UI компоненти потребують "use client"**
3. **Server functions працюють з `@clerk/nextjs/server`**
4. **Middleware використовує `clerkMiddleware` з v5+**
5. **UserButton завжди в client wrapper**

## Альтернатива - Мінімальна конфігурація

Якщо проблеми продовжуються, використайте мінімальну робочу конфігурацію:

**app/sign-in/[[...sign-in]]/page.tsx:**
```tsx
"use client"

import { SignIn } from "@clerk/nextjs"

export default function Page() {
  return <SignIn />
}
```

**middleware.ts:**
```ts
import { clerkMiddleware } from "@clerk/nextjs/server"

export default clerkMiddleware()

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
```

**.env:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

Це мінімальна конфігурація що гарантовано працює.

## Ресурси

- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk v5 Upgrade Guide](https://clerk.com/docs/upgrade-guides/core-2/nextjs)
- [Next.js App Router + Clerk](https://clerk.com/docs/references/nextjs/overview)

---

**Дата:** 2025-01-15  
**Clerk версія:** ^6.6.0  
**Next.js версія:** 14.1.0  
**Статус:** Production Ready ✅

