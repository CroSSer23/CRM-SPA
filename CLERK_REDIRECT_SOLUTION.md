# Рішення: Автоматичні redirects замість прямих посилань

## Проблема

Прямі посилання на Clerk hosted pages (`accounts.clerk.dev`) не працюють, бо:
1. URL має бути специфічним для вашого Clerk instance
2. Subdomain генерується автоматично Clerk
3. Ми не знаємо точний URL без доступу до Clerk Dashboard

## Рішення

Замість прямих посилань використовуємо посилання на захищені роути, а Clerk автоматично зробить redirect:

### Landing Page (app/page.tsx)
```tsx
// Замість прямих посилань на Clerk
<Link href="/dashboard">Sign In</Link>
<Link href="/dashboard">Get Started</Link>
```

### Як це працює

1. **Користувач клікає "Sign In" або "Get Started"**
2. **Переходить на `/dashboard`** (захищений роут)
3. **Clerk middleware** перевіряє чи користувач залогінений
4. **Якщо НІ** → автоматичний redirect на Clerk hosted sign-in
5. **Після входу** → повертається на `/dashboard`

### Переваги

✅ **Не потрібно знати точний URL** Clerk hosted pages  
✅ **Працює для будь-якого Clerk instance**  
✅ **Автоматично використовує правильні redirect URLs**  
✅ **Простіше та надійніше**  

## Альтернатива (якщо потрібні окремі кнопки)

Якщо потрібні окремі кнопки для Sign In та Sign Up, можна створити API endpoints:

```tsx
// app/api/auth/sign-in/route.ts
import { auth } from "@clerk/nextjs/server"

export async function GET(request: Request) {
  const { redirectToSignIn } = auth()
  return redirectToSignIn({ returnBackUrl: '/dashboard' })
}

// app/api/auth/sign-up/route.ts  
import { auth } from "@clerk/nextjs/server"

export async function GET(request: Request) {
  const { redirectToSignUp } = auth()
  return redirectToSignUp({ returnBackUrl: '/dashboard' })
}
```

Але простіше просто використовувати один лінк на `/dashboard`.

## Налаштування в Clerk Dashboard

Переконайтесь що в Clerk Dashboard налаштовано:
1. **Production domain:** `spa.crosser.software`
2. **Redirect URLs** після входу/реєстрації на `/dashboard`

---

**Дата:** 2025-01-15  
**Статус:** Implemented ✅
