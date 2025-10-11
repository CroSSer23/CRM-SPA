# Налаштування NextAuth

## 1. Створіть файл `.env.local` з наступними змінними:

```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional services
RESEND_API_KEY=""
RESEND_FROM_EMAIL="noreply@example.com"
SLACK_WEBHOOK_URL=""
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

## 2. Згенеруйте NEXTAUTH_SECRET

Для production використовуйте:
```bash
openssl rand -base64 32
```

## 3. Налаштування для Vercel

В Vercel Dashboard додайте:
- `DATABASE_URL` - з вашого Postgres провайдера (Neon, Supabase, etc.)
- `NEXTAUTH_URL` - https://your-app.vercel.app
- `NEXTAUTH_SECRET` - згенерований безпечний ключ

## 4. Запустіть міграції

```bash
npx prisma migrate dev
npx prisma generate
```

## 5. Створіть першого користувача

Зареєструйтесь через `/sign-up` або створіть через Prisma Studio:

```bash
npx prisma studio
```

Додайте користувача з:
- email
- name
- password (захешований через bcrypt)
- role: ADMIN

## Тестування

1. Запустіть додаток: `npm run dev`
2. Перейдіть на `/sign-up` і створіть аккаунт
3. Увійдіть через `/sign-in`
4. Перевірте що маєте доступ до `/dashboard`
