# SPA Procurement System

Централізована система закупівель для SPA-локацій у Лондоні. Система дозволяє керівникам локацій створювати закупочні листи, а відділу закупівель - обробляти заявки, формувати замовлення та відстежувати статуси.

## Технічний стек

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL (Neon/Supabase)
- **ORM**: Prisma
- **Authentication**: Clerk
- **UI**: Tailwind CSS + shadcn/ui
- **Icons**: lucide-react
- **File Upload**: UploadThing
- **Email**: Resend
- **Notifications**: Slack Webhooks
- **Validation**: Zod + react-hook-form

## Основні можливості

### Ролі користувачів (RBAC)

1. **REQUESTER** (Керівник локації)
   - Створення та подання закупочних листів
   - Перегляд своїх заявок
   - Підтвердження отримання товарів

2. **PROCUREMENT** (Відділ закупівель)
   - Перегляд усіх заявок
   - Редагування кількості товарів
   - Зміна статусів заявок
   - Додавання номерів PO/Invoice
   - Завантаження документів

3. **ADMIN** (Адміністратор)
   - Повний доступ до системи
   - Управління користувачами та ролями
   - Управління локаціями
   - Управління каталогом товарів

### Статуси requisitions

- **DRAFT** - Чернетка (не використовується, автоматично SUBMITTED)
- **SUBMITTED** - Подано на розгляд
- **EDITED** - Відредаговано відділом закупівель
- **ORDERED** - Замовлено у постачальника
- **PARTIALLY_RECEIVED** - Частково отримано
- **RECEIVED** - Отримано повністю
- **CLOSED** - Закрито

### Функціональність

- **Dashboard** - Kanban-дошка з requisitions за статусами
- **Requisitions** - Створення, перегляд, редагування заявок
- **Catalog** - Управління продуктами та категоріями
- **Locations** - Управління локаціями та призначення товарів
- **Users** - Управління користувачами та ролями
- **Activity Log** - Повний журнал змін для кожної заявки
- **Notifications** - Email (Resend) та Slack сповіщення
- **File Uploads** - UploadThing для PO/Invoices/Photos

## Встановлення та налаштування

### 1. Клонування репозиторію

\`\`\`bash
git clone <your-repo-url>
cd CRM-SPA
\`\`\`

### 2. Встановлення залежностей

\`\`\`bash
npm install
# або
pnpm install
# або
yarn install

# Встановити git hooks (для розробки)
npx husky install
\`\`\`

### 3. Налаштування змінних середовища

Створіть файл \`.env\` в корені проєкту:

\`\`\`env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/procurement_db?schema=public"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Slack
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."

# UploadThing
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"
\`\`\`

### 4. Налаштування бази даних

\`\`\`bash
# Створити міграції
npx prisma migrate dev

# Згенерувати Prisma Client
npx prisma generate

# Заповнити базу тестовими даними
npm run db:seed
\`\`\`

### 5. Запуск проєкту

\`\`\`bash
npm run dev
\`\`\`

Відкрийте [http://localhost:3000](http://localhost:3000) у браузері.

## Налаштування зовнішніх сервісів

### Clerk (Authentication)

1. Створіть обліковий запис на [clerk.com](https://clerk.com)
2. Створіть новий Application
3. Скопіюйте API ключі до \`.env\`
4. Налаштуйте Email/Password провайдер
5. **Важливо:** Проєкт використовує Clerk Hosted Pages (auth відбувається на clerk.app, без custom pages)

### Database (Neon/Supabase)

**Neon:**
1. Створіть обліковий запис на [neon.tech](https://neon.tech)
2. Створіть новий проєкт
3. Скопіюйте connection string до \`DATABASE_URL\`

**Supabase:**
1. Створіть обліковий запис на [supabase.com](https://supabase.com)
2. Створіть новий проєкт
3. В Settings → Database скопіюйте connection string (Session mode)

### UploadThing

1. Створіть обліковий запис на [uploadthing.com](https://uploadthing.com)
2. Створіть новий App
3. Скопіюйте Secret та App ID до \`.env\`

### Resend (Email)

1. Створіть обліковий запис на [resend.com](https://resend.com)
2. Додайте та верифікуйте домен
3. Створіть API ключ
4. Скопіюйте до \`.env\`

### Slack

1. Створіть Incoming Webhook у вашому Slack workspace
2. Перейдіть до [api.slack.com/apps](https://api.slack.com/apps)
3. Create New App → From scratch
4. Activate Incoming Webhooks
5. Add New Webhook to Workspace
6. Скопіюйте webhook URL до \`.env\`

## Деплой на Vercel

### 1. Push до GitHub

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
\`\`\`

### 2. Імпорт в Vercel

1. Перейдіть на [vercel.com](https://vercel.com)
2. New Project
3. Import вашого GitHub репозиторію
4. Додайте всі Environment Variables з \`.env\`
5. Deploy

### 3. Налаштування після деплою

- Оновіть \`NEXT_PUBLIC_APP_URL\` на production URL
- Оновіть Clerk allowed origins/redirects
- Оновіть UploadThing allowed origins
- Запустіть міграції БД: \`npx prisma migrate deploy\`

## Корисні команди

\`\`\`bash
# Development
npm run dev           # Запуск dev сервера
npm run build         # Збірка для production
npm run start         # Запуск production сервера

# Database
npm run db:generate   # Генерація Prisma Client
npm run db:push       # Push schema до БД (без міграцій)
npm run db:migrate    # Створити та застосувати міграцію
npm run db:seed       # Заповнити БД тестовими даними
npm run db:studio     # Відкрити Prisma Studio

# Code Quality
npm run lint          # ESLint
npm run format        # Prettier
\`\`\`

## Структура проєкту

\`\`\`
├── app/
│   ├── (dashboard)/          # Захищені сторінки
│   │   ├── page.tsx          # Dashboard (Kanban)
│   │   ├── requisitions/     # Requisitions pages
│   │   ├── catalog/          # Catalog pages
│   │   ├── locations/        # Locations management
│   │   └── users/            # Users management
│   ├── api/                  # API routes
│   │   ├── requisitions/     # Requisitions API
│   │   ├── products/         # Products API
│   │   ├── categories/       # Categories API
│   │   ├── locations/        # Locations API
│   │   ├── users/            # Users API
│   │   ├── attachments/      # Attachments API
│   │   └── uploadthing/      # UploadThing config
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── nav-bar.tsx           # Navigation bar
│   ├── status-badge.tsx      # Status badge component
│   └── role-gate.tsx         # RBAC gate component
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── auth.ts               # Auth utilities
│   ├── validations.ts        # Zod schemas
│   ├── types.ts              # TypeScript types
│   ├── notifications.ts      # Email/Slack utilities
│   ├── utils.ts              # Helper functions
│   └── uploadthing.ts        # UploadThing config
├── prisma/
│   ├── schema.prisma         # Prisma schema
│   └── seed.ts               # Seed script
├── middleware.ts             # Clerk middleware
└── package.json
\`\`\`

## Бізнес-правила

1. **Submit requisition** - дозволено тільки якщо є хоча б 1 позиція
2. **Edit items** - зміна \`approvedQty\` вимагає обов'язкового коментаря
3. **Close requisition** - можливо тільки коли sum(receivedQty) == approvedQty
4. **Optimistic locking** - перевірка \`updatedAt\` перед зміною статусу/items
5. **Auto-notifications** - автоматичні сповіщення на ключові події

## API Endpoints

### Requisitions
- \`GET /api/requisitions\` - Список з фільтрами
- \`POST /api/requisitions\` - Створення (auto-submit)
- \`GET /api/requisitions/[id]\` - Деталі
- \`DELETE /api/requisitions/[id]\` - Видалення (тільки DRAFT)
- \`PATCH /api/requisitions/[id]/status\` - Зміна статусу
- \`PATCH /api/requisitions/[id]/items\` - Редагування items
- \`PATCH /api/requisitions/[id]/receive\` - Прийняття товарів

### Products
- \`GET /api/products\` - Список з фільтрами
- \`POST /api/products\` - Створення
- \`GET /api/products/[id]\` - Деталі
- \`PATCH /api/products/[id]\` - Оновлення
- \`DELETE /api/products/[id]\` - Деактивація

### Categories
- \`GET /api/categories\` - Список
- \`POST /api/categories\` - Створення

### Locations
- \`GET /api/locations\` - Список
- \`POST /api/locations\` - Створення
- \`POST /api/locations/[id]/assign\` - Призначення товару

### Users
- \`GET /api/users\` - Список
- \`PATCH /api/users/[id]/role\` - Зміна ролі
- \`POST /api/users/[id]/locations\` - Призначення до локації

### Attachments
- \`POST /api/attachments\` - Створення attachment запису

## Troubleshooting

### Database connection issues
- Перевірте \`DATABASE_URL\` в \`.env\`
- Переконайтеся що БД доступна
- Спробуйте \`npx prisma db push\`

### Clerk authentication issues
- Перевірте API ключі
- Переконайтеся що домен додано в Clerk dashboard
- Очистіть cookies та спробуйте знову

### UploadThing issues
- Перевірте API ключі
- Додайте localhost:3000 до allowed origins
- Перевірте file size limits

## License

MIT

## Підтримка

Для питань та підтримки:
- Email: support@yourdomain.com
- Documentation: [Link to docs]

