# Інструкції по запуску проекту

## 1. Встановіть залежності

```bash
npm install
```

## 2. Налаштуйте змінні середовища

Створіть файл `.env.local` в корені проекту:

```env
# Database (отримайте з Neon або Supabase)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Для генерації NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## 3. Створіть базу даних

```bash
# Запустіть міграції
npx prisma migrate dev

# Згенеруйте Prisma Client
npx prisma generate

# Заповніть базу тестовими даними
npm run seed
```

## 4. Запустіть додаток

```bash
npm run dev
```

Відкрийте http://localhost:3000

## 5. Тестові користувачі

Після виконання seed скрипту будуть створені:

- **Admin:** admin@spa.com / admin123
- **Procurement:** procurement@spa.com / procurement123  
- **Requester:** john@spa.com / john123

## Деплой на Vercel

1. Push код на GitHub
2. Імпортуйте проект в Vercel
3. Додайте environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (https://your-app.vercel.app)
   - `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy!

## Можливі проблеми

### Помилка з DATABASE_URL

Переконайтесь що:
- URL правильний
- База даних створена
- SSL включено (sslmode=require)

### Помилка міграції

```bash
# Скиньте базу даних і почніть заново
npx prisma migrate reset
```

### Помилка авторизації

Переконайтесь що:
- NEXTAUTH_SECRET встановлено
- Cookies увімкнені в браузері
- Використовуєте правильні credentials
