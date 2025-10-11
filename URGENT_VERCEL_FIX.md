# 🚨 ТЕРМІНОВО! Виправлення redirect loop на Vercel

## Проблема

Відбувається нескінченний redirect loop через environment variables на Vercel!

## ❗ КРИТИЧНО: Що потрібно зробити НЕГАЙНО на Vercel

### 1. Видаліть ці Environment Variables:

Зайдіть на https://vercel.com → Your Project → Settings → Environment Variables

**ВИДАЛІТЬ ВСІ ЦІ ЗМІННІ:**
- ❌ `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- ❌ `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- ❌ `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- ❌ `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`
- ❌ `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- ❌ `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

### 2. Залишіть ТІЛЬКИ ці змінні:

✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
✅ `CLERK_SECRET_KEY`
✅ `DATABASE_URL`
✅ `NEXT_PUBLIC_APP_URL`
✅ (інші опціональні: RESEND_API_KEY, SLACK_WEBHOOK_URL, etc.)

### 3. Redeploy

Після видалення змінних:
1. Go to **Deployments**
2. Click **...** на останньому deployment
3. Click **Redeploy**
4. НЕ змінюйте environment variables в діалозі
5. Click **Redeploy**

## Чому це відбувається?

Коли встановлені `NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"`, Clerk намагається redirect на цей URL. 
Але оскільки ми використовуємо Clerk Hosted Pages, цей роут не повинен існувати, що створює redirect loop.

## Тимчасове рішення

Я створив redirect pages на `/sign-in` та `/sign-up` які просто перенаправляють на Clerk hosted pages.
Але це тільки тимчасове рішення - **ПОТРІБНО ВИДАЛИТИ ENVIRONMENT VARIABLES!**

## Перевірка після виправлення

1. Очистіть cookies в браузері
2. Зайдіть на https://spa.crosser.software
3. Має відкритись landing page
4. Клік на "Sign In" → redirect на Clerk hosted sign-in
5. Після входу → redirect на dashboard

---

**ВИКОНАЙТЕ ЦІ ДІЇ НЕГАЙНО!**
