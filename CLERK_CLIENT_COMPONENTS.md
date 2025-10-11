# Clerk Client vs Server Components

## Правило: Коли використовувати "use client"

### ✅ Client Components (потрібен "use client")

**Clerk UI компоненти:**
```tsx
"use client"  // ← ОБОВ'ЯЗКОВО!

import { SignIn, SignUp, UserButton, UserProfile } from "@clerk/nextjs"
```

**Clerk hooks:**
```tsx
"use client"  // ← ОБОВ'ЯЗКОВО!

import { useUser, useAuth, useClerk } from "@clerk/nextjs"

export default function MyComponent() {
  const { user } = useUser()
  const { signOut } = useClerk()
  // ...
}
```

### ✅ Server Components (без "use client")

**Auth functions:**
```tsx
// Файл: app/my-page/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server"

export default async function MyPage() {
  const { userId } = await auth()
  const user = await currentUser()
  // ...
}
```

**RBAC checks:**
```tsx
// Файл: app/api/route.ts
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })
  // ...
}
```

## Файли в проєкті

### 🔵 Client Components (мають "use client")

```
app/
├── sign-in/[[...sign-in]]/page.tsx     ✅ "use client"
├── sign-up/[[...sign-up]]/page.tsx     ✅ "use client"
└── (dashboard)/
    └── requisitions/new/page.tsx       ✅ "use client" (форма)
```

### 🟢 Server Components (без "use client")

```
app/
├── (dashboard)/
│   ├── page.tsx                        ✅ Server Component
│   ├── requisitions/page.tsx           ✅ Server Component
│   ├── requisitions/[id]/page.tsx      ✅ Server Component
│   ├── catalog/products/page.tsx       ✅ Server Component
│   ├── locations/page.tsx              ✅ Server Component
│   └── users/page.tsx                  ✅ Server Component
└── layout.tsx                          ✅ Server Component

components/
├── nav-bar.tsx                         ✅ Server Component (використовує getCurrentUser)
└── role-gate.tsx                       ✅ Server Component

lib/
└── auth.ts                             ✅ Server-side utilities
```

## Помилки та рішення

### ❌ Помилка: "useState is not a function"
```
TypeError: a.useState is not a function or its return value is not iterable
```

**Причина:** Clerk UI component використовується в Server Component

**Рішення:** Додати `"use client"` на початок файлу:
```tsx
"use client"

import { SignIn } from "@clerk/nextjs"
// ...
```

### ❌ Помилка: "useUser is not defined"
```
Error: useUser is not defined
```

**Причина:** Hooks можна використовувати тільки в Client Components

**Рішення:** 
1. Додати `"use client"`
2. АБО використати Server Component з `auth()`:
```tsx
// Server Component
import { auth } from "@clerk/nextjs/server"

export default async function Page() {
  const { userId } = await auth()
  // ...
}
```

### ❌ Помилка: "auth is not a function"
```
Error: auth is not a function
```

**Причина:** Неправильний import

**Рішення:**
```tsx
// ❌ Неправильно (client-side)
import { auth } from "@clerk/nextjs"

// ✅ Правильно (server-side)
import { auth } from "@clerk/nextjs/server"
```

## Best Practices

### 1. Server Components за замовчуванням
Використовуйте Server Components де тільки можливо:
- Швидше завантаження
- Менше JavaScript на клієнті
- SEO-friendly
- Безпечніше (credentials на сервері)

### 2. Client Components тільки коли потрібно
Використовуйте Client Components для:
- Інтерактивні форми
- React hooks (useState, useEffect)
- Clerk UI components
- Browser APIs (window, localStorage)
- Event handlers (onClick, onChange)

### 3. Композиція
Можна вкладати Server Components в Client Components:
```tsx
// Client Component
"use client"

export default function ClientWrapper({ children }) {
  const [state, setState] = useState()
  return <div>{children}</div>
}

// Server Component (передається як children)
import ClientWrapper from "./client-wrapper"

export default async function ServerPage() {
  const data = await fetchData()
  
  return (
    <ClientWrapper>
      <ServerComponent data={data} />
    </ClientWrapper>
  )
}
```

## Перевірка

### Як зрозуміти що потрібен Client Component?

**Використовується будь-що з цього списку:**
- ✓ React hooks (useState, useEffect, useContext)
- ✓ Event handlers (onClick, onChange, onSubmit)
- ✓ Browser APIs (window, document, localStorage)
- ✓ Clerk UI components (<SignIn />, <UserButton />)
- ✓ Clerk hooks (useUser, useAuth, useClerk)
- ✓ Third-party компоненти які використовують hooks

**Якщо НІ →** залишайте Server Component (швидше та ефективніше)

---

**Оновлено:** 2025-01-15  
**Next.js версія:** 14.1.0  
**Clerk версія:** 5.0.0

