# Налаштування змінних середовища

Створіть файл `.env` в корені проєкту з наступними змінними:

## Database
```
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

**Де отримати:**
- **Neon**: https://neon.tech → New Project → Connection String
- **Supabase**: https://supabase.com → Settings → Database → Connection String (Session mode)

## Application URL
```
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
(Для production замініть на ваш Vercel URL)

## Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

**Де отримати:**
1. Перейдіть на https://clerk.com
2. Створіть обліковий запис
3. Створіть новий Application
4. API Keys → Copy keys

## Resend (Email)
```
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

**Де отримати:**
1. Перейдіть на https://resend.com
2. Створіть обліковий запис
3. API Keys → Create API Key
4. Додайте та верифікуйте домен в Domains

## Slack Webhook
```
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
```

**Де отримати:**
1. Перейдіть на https://api.slack.com/apps
2. Create New App → From scratch
3. Incoming Webhooks → Activate
4. Add New Webhook to Workspace
5. Copy Webhook URL

## UploadThing
```
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"
```

**Де отримати:**
1. Перейдіть на https://uploadthing.com
2. Створіть обліковий запис
3. Create New App
4. Copy Secret and App ID

## Повний приклад .env файлу

```env
# Database
DATABASE_URL="postgresql://user:password@ep-example.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_Y2xlcmsuZXhhbXBsZS5jb20k"
CLERK_SECRET_KEY="sk_test_abcdefghijklmnopqrstuvwxyz123456"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# Email
RESEND_API_KEY="re_abc123def456"
RESEND_FROM_EMAIL="noreply@procurement.spa"

# Slack
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX"

# UploadThing
UPLOADTHING_SECRET="sk_live_abc123def456"
UPLOADTHING_APP_ID="abc123def456"
```

## Перевірка налаштування

Після створення `.env` файлу:

```bash
# 1. Встановіть залежності
npm install

# 2. Згенеруйте Prisma Client
npx prisma generate

# 3. Створіть БД схему
npx prisma db push

# 4. Заповніть тестовими даними
npm run db:seed

# 5. Запустіть проєкт
npm run dev
```

Відкрийте http://localhost:3000 - має працювати!

## Troubleshooting

**Помилка "DATABASE_URL not found":**
- Переконайтеся що файл називається `.env`, а не `.env.txt`
- Файл має бути в корені проєкту
- Перезапустіть сервер після створення `.env`

**Clerk authentication не працює:**
- Перевірте що API ключі правильно скопійовані
- Переконайтеся що localhost:3000 додано до Clerk allowed origins
- Очистіть cookies браузера

**UploadThing помилки:**
- Перевірте API ключі
- Додайте localhost:3000 до allowed origins в UploadThing dashboard

