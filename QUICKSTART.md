# Quick Start Guide

Швидкий старт для розробників. Детальна інструкція в [README.md](./README.md).

## Передумови

- Node.js 18+ ([nodejs.org](https://nodejs.org))
- npm/pnpm/yarn
- Git
- PostgreSQL database (Neon/Supabase)
- Clerk account
- (Опціонально) UploadThing, Resend, Slack

## 1. Клонування та встановлення

```bash
git clone <your-repo-url>
cd CRM-SPA
npm install
```

## 2. Налаштування `.env`

Створіть файл `.env` в корені:

```env
# Database (отримайте з Neon або Supabase)
DATABASE_URL="postgresql://..."

# Clerk (отримайте з clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (опціонально на початку)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Slack (опціонально на початку)
SLACK_WEBHOOK_URL="https://hooks.slack.com/..."

# UploadThing (опціонально на початку)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"
```

Детальні інструкції: [ENV_SETUP.md](./ENV_SETUP.md)

## 3. База даних

```bash
# Згенерувати Prisma Client
npx prisma generate

# Створити схему БД
npx prisma db push

# Заповнити тестовими даними
npm run db:seed
```

## 4. Запуск

```bash
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000)

## 5. Перший вхід

1. Натисніть "Sign Up"
2. Зареєструйтесь через Clerk
3. За замовчуванням буде роль **REQUESTER**

### Зміна ролі на ADMIN (через Prisma Studio)

```bash
npm run db:studio
```

1. Відкриється Prisma Studio
2. Перейдіть до таблиці `User`
3. Знайдіть вашого користувача
4. Змініть `role` на `ADMIN`
5. Save

Або через SQL:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## Структура даних після seed

**Локації:**
- Mayfair Spa
- Knightsbridge Wellness Center
- Notting Hill Retreat

**Користувачі:**
- admin@procurement.spa (ADMIN)
- procurement@procurement.spa (PROCUREMENT)
- manager1@procurement.spa (REQUESTER для Mayfair)
- manager2@procurement.spa (REQUESTER для Knightsbridge)
- manager3@procurement.spa (REQUESTER для Notting Hill)

**Категорії:**
- Skincare
- Massage Oils
- Towels & Linens
- Cleaning Supplies
- Aromatherapy

**Продукти:** 12 товарів у різних категоріях

**Requisitions:** По 2 тестові заявки для кожної локації

## Основні функції

### Як створити requisition
1. Натисніть "New Requisition"
2. Виберіть локацію
3. Додайте товари
4. Вкажіть кількість
5. "Create & Submit"

### Як обробити requisition (PROCUREMENT)
1. Перейдіть до Dashboard
2. Виберіть requisition зі статусом SUBMITTED
3. Вкладка "Items" → редагуйте `approvedQty`
4. Змініть статус на ORDERED
5. Додайте PO number

### Як підтвердити отримання (REQUESTER)
1. Відкрийте requisition зі статусом ORDERED
2. Введіть `receivedQty` для кожного item
3. Збережіть

## Корисні команди

```bash
# Development
npm run dev              # Dev server
npm run build            # Production build

# Database
npm run db:studio        # Prisma Studio UI
npm run db:migrate       # Create migration
npm run db:seed          # Seed data again

# Code Quality
npm run lint             # Check code
npm run format           # Format code
```

## Troubleshooting

### Database connection error
```bash
# Перевірте DATABASE_URL
echo $DATABASE_URL

# Очистіть і регенеруйте
rm -rf node_modules/.prisma
npx prisma generate
```

### Clerk auth не працює
- Перевірте API keys в `.env`
- Очистіть cookies браузера
- Перезапустіть dev server

### Module not found
```bash
# Видаліть node_modules і перевстановіть
rm -rf node_modules
npm install
```

## Наступні кроки

1. 📖 Прочитайте [README.md](./README.md) для детальної інформації
2. 🔌 Налаштуйте [UploadThing](https://uploadthing.com) для file uploads
3. 📧 Налаштуйте [Resend](https://resend.com) для email
4. 💬 Налаштуйте [Slack webhook](https://api.slack.com/messaging/webhooks)
5. 🚀 Деплой на [Vercel](./DEPLOYMENT.md)

## Документація

- [README.md](./README.md) - Повна документація
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Деплой інструкції
- [ENV_SETUP.md](./ENV_SETUP.md) - Environment variables
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Структура проєкту
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Як контрибутити

## Допомога

- 📧 Email: support@yourdomain.com
- 💬 Slack: [Your Slack]
- 🐛 Issues: [GitHub Issues](your-repo-url/issues)

---

Щасливого кодування! 🎉

