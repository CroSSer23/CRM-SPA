# Інструкція з деплою

## Перед деплоєм

### 1. Підготовка коду
\`\`\`bash
# Перевірка linting
npm run lint

# Форматування коду
npm run format

# Локальна збірка
npm run build
\`\`\`

### 2. Перевірка змінних середовища
Переконайтеся, що всі змінні з \`.env.local.example\` налаштовані.

## Деплой на Vercel

### Крок 1: Push до Git
\`\`\`bash
git add .
git commit -m "Ready for deployment"
git push origin main
\`\`\`

### Крок 2: Створення проєкту в Vercel
1. Відкрийте [vercel.com](https://vercel.com)
2. Натисніть "New Project"
3. Імпортуйте ваш GitHub репозиторій
4. Vercel автоматично визначить Next.js

### Крок 3: Налаштування Environment Variables
Додайте всі змінні середовища:

**Database:**
- \`DATABASE_URL\`

**Clerk:**
- \`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY\`
- \`CLERK_SECRET_KEY\`
- \`NEXT_PUBLIC_CLERK_SIGN_IN_URL\`
- \`NEXT_PUBLIC_CLERK_SIGN_UP_URL\`
- \`NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL\`
- \`NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL\`

**Resend:**
- \`RESEND_API_KEY\`
- \`RESEND_FROM_EMAIL\`

**Slack:**
- \`SLACK_WEBHOOK_URL\`

**UploadThing:**
- \`UPLOADTHING_SECRET\`
- \`UPLOADTHING_APP_ID\`

**App:**
- \`NEXT_PUBLIC_APP_URL\` (буде вашим Vercel URL)

### Крок 4: Deploy
Натисніть "Deploy" і почекайте завершення.

### Крок 5: Після деплою

**1. Оновіть NEXT_PUBLIC_APP_URL:**
\`\`\`
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
\`\`\`

**2. Налаштуйте Clerk:**
- Додайте Vercel URL до "Allowed origins" в Clerk dashboard
- Додайте redirect URLs:
  - \`https://your-app.vercel.app/\`
  - \`https://your-app.vercel.app/sign-in\`
  - \`https://your-app.vercel.app/sign-up\`

**3. Налаштуйте UploadThing:**
- Додайте Vercel URL до allowed origins

**4. Запустіть міграції БД:**
\`\`\`bash
# З локальної машини
npx prisma migrate deploy

# Або через Vercel CLI
vercel env pull
npx prisma migrate deploy
\`\`\`

**5. Seed база даних (опціонально):**
\`\`\`bash
npm run db:seed
\`\`\`

## Перевірка після деплою

1. Відкрийте https://your-app.vercel.app
2. Спробуйте зареєструватися/увійти
3. Створіть тестову requisition
4. Перевірте email/Slack сповіщення
5. Спробуйте завантажити файл

## Continuous Deployment

Vercel автоматично деплоїть:
- **Production**: кожен push до \`main\`
- **Preview**: кожен pull request

## Rollback

Якщо щось пішло не так:
1. Перейдіть в Vercel Dashboard
2. Знайдіть попередній успішний deployment
3. Натисніть "Promote to Production"

## Моніторинг

### Vercel Analytics
Автоматично ввімкнено для моніторингу:
- Page views
- User flow
- Performance metrics

### Error Tracking
Рекомендується додати:
- Sentry для error tracking
- LogRocket для session replay

## Database Backups

**Neon:**
- Автоматичні backups кожні 24 години
- Retention: 7 днів (Free tier)

**Supabase:**
- Автоматичні backups кожні 24 години
- Retention залежить від плану

## Масштабування

При зростанні навантаження:
1. Upgrade Vercel plan для більше Edge Functions
2. Upgrade database plan для більше connections
3. Розгляньте Database Connection Pooling (Prisma Data Proxy)
4. Додайте Redis для caching

## Troubleshooting

**Database connection errors:**
- Перевірте connection limits вашого DB плану
- Розгляньте Prisma Data Proxy для connection pooling

**Build failures:**
- Перевірте всі env variables
- Очистіть build cache: Settings → General → Clear Build Cache

**Runtime errors:**
- Перевірте Vercel logs: Deployment → Functions
- Перевірте server logs для database queries

## Підтримка

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Prisma Docs: [prisma.io/docs](https://prisma.io/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)

