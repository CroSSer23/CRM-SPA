# Виправлення циклічних redirects

## Проблема

Була помилка `ERR_TOO_MANY_REDIRECTS` через циклічні redirects:
1. Користувач заходить на `/`
2. Clerk redirect на `/sign-in` (бо користувач не залогінений)
3. Next.js redirect з `/sign-in` на `/` (через наші redirects)
4. І так по колу...

## Рішення

### 1. Видалено redirects
- ❌ Видалено `vercel.json` з redirects
- ❌ Видалено `async redirects()` з `next.config.js`

### 2. Оновлено middleware
```ts
// Define public routes
const isPublicRoute = createRouteMatcher([
  '/',  // Home/Landing page - тепер публічна
  '/api/uploadthing(.*)',
  '/api/webhook(.*)',
])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()  // Захищаємо всі інші роути
  }
})
```

### 3. Створено landing page
`app/page.tsx` - публічна landing page з кнопками Sign In/Sign Up які ведуть на Clerk Hosted Pages.

### 4. Перенесено dashboard
`app/(dashboard)/page.tsx` → `app/(dashboard)/dashboard/page.tsx`

## Як це працює тепер

1. **Незалогінений користувач:**
   - `/` → Landing page з кнопками входу
   - `/dashboard` → Clerk redirect на hosted sign-in
   - `/requisitions` → Clerk redirect на hosted sign-in

2. **Залогінений користувач:**
   - `/` → Redirect на `/dashboard`
   - `/dashboard` → Dashboard page
   - Всі інші роути працюють нормально

## Структура роутів

```
/                    → Landing page (public)
/dashboard           → Dashboard (protected)
/requisitions        → Requisitions (protected)
/catalog/products    → Products (protected)
/locations           → Locations (protected, ADMIN)
/users              → Users (protected, ADMIN)
```

## Environment Variables

**ВАЖЛИВО!** На Vercel потрібно видалити:
- ❌ `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- ❌ `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

Інакше Clerk буде намагатись redirect на неіснуючі `/sign-in` та `/sign-up`.

---

**Дата:** 2025-01-15  
**Статус:** Fixed ✅
