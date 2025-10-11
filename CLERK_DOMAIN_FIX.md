# Clerk Domain Configuration

## Ваш Clerk Hosted Domain

**`dominant-earwig-41.accounts.dev`**

## URLs для автентифікації

- **Sign In:** `https://dominant-earwig-41.accounts.dev/sign-in`
- **Sign Up:** `https://dominant-earwig-41.accounts.dev/sign-up`
- **User Profile:** `https://dominant-earwig-41.accounts.dev/user-profile`

## Як знайти свій Clerk domain

1. Зайдіть в [Clerk Dashboard](https://dashboard.clerk.com)
2. Виберіть ваш Application
3. **Paths** → подивіться на URLs
4. АБО **API Keys** → подивіться на Frontend API URL

## Оновлено в коді

**app/page.tsx:**
```tsx
// Було:
href="https://accounts.clerk.dev/sign-in?redirect_url=..."

// Стало:
href="https://dominant-earwig-41.accounts.dev/sign-in?redirect_url=..."
```

## Redirect після входу

Після успішного входу користувач буде перенаправлений на:
`https://spa.crosser.software/dashboard`

## Додаткові налаштування в Clerk Dashboard

1. **Paths:**
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   
2. **Redirects:**
   - After sign-in: `https://spa.crosser.software/dashboard`
   - After sign-up: `https://spa.crosser.software/dashboard`
   - After sign-out: `https://spa.crosser.software`

---

**Дата:** 2025-01-15  
**Статус:** Fixed ✅
