# SPA Procurement System

Централізована система закупівель для SPA-локацій у Лондоні.

## 🚀 Функціонал

- **Requisitions Management** - Створення та обробка закупочних листів
- **RBAC** - 3 ролі (Admin, Procurement, Requester)
- **Kanban Dashboard** - Візуалізація за статусами
- **Product Catalog** - Управління продуктами та категоріями
- **Locations & Users** - Управління локаціями та користувачами
- **Activity Timeline** - Повна історія змін
- **JWT Authentication** - Проста та безпечна авторизація

## 🛠️ Техстек

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (Neon)
- **Auth:** JWT через jose (Edge-safe)
- **Deploy:** Vercel

## 👥 Тестові користувачі

| Роль | Email | Пароль |
|------|-------|---------|
| Admin | admin@spa.com | admin123 |
| Procurement | procurement@spa.com | procurement123 |
| Requester | john@spa.com | john123 |

## 📁 Структура проекту

```
app/
├── (dashboard)/          # Захищені сторінки з sidebar
│   ├── dashboard/        # Kanban board
│   ├── requisitions/     # Список, деталі, створення
│   ├── catalog/          # Продукти та категорії
│   ├── locations/        # Управління локаціями (ADMIN)
│   └── users/            # Управління користувачами (ADMIN)
├── api/                  # API routes
│   ├── login/            # POST - JWT авторизація
│   ├── logout/           # POST - вихід
│   ├── register/         # POST - реєстрація
│   ├── requisitions/     # CRUD + status/items/receive
│   ├── products/         # CRUD продуктів
│   ├── categories/       # CRUD категорій
│   ├── locations/        # CRUD локацій
│   └── users/            # Список користувачів
├── sign-in/              # Сторінка входу
└── sign-up/              # Сторінка реєстрації

components/
├── sidebar.tsx           # Бокове меню з навігацією
├── header.tsx            # Header з профілем
├── status-badge.tsx      # Badge для статусів
└── ui/                   # shadcn/ui компоненти

lib/
├── auth.ts               # Auth utilities + RBAC
├── jwt.ts                # JWT токени через jose
├── prisma.ts             # Prisma client
└── validations.ts        # Zod schemas
```

## 🔐 RBAC

**REQUESTER:**
- ✅ Створення requisitions для своїх локацій
- ✅ Перегляд своїх requisitions
- ✅ Submit requisitions
- ❌ Редагування після submit

**PROCUREMENT:**
- ✅ Перегляд всіх requisitions
- ✅ Редагування items (approvedQty)
- ✅ Зміна статусів
- ✅ Додавання PO/Invoice
- ✅ Управління каталогом

**ADMIN:**
- ✅ Повний доступ
- ✅ Управління користувачами та ролями
- ✅ Управління локаціями
- ✅ Призначення користувачів до локацій

## 📦 Статуси Requisition

```
DRAFT → SUBMITTED → EDITED → ORDERED → PARTIALLY_RECEIVED → RECEIVED → CLOSED
```

## 🚀 Deployment

**Production URL:** https://spa.crosser.software

**Build автоматично:**
1. Prisma generate
2. Prisma db push (sync schema)
3. Next.js build

## 💻 Локальна розробка

```bash
# Встановити залежності
npm install

# Налаштувати .env.local
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Синхронізувати схему БД
npm run db:push

# Створити тестові дані
npm run db:seed

# Запустити dev server
npm run dev
```

## 📝 Environment Variables (Vercel)

Необхідні:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key для JWT токенів
- `NEXT_PUBLIC_APP_URL` - URL додатка

Опціональні:
- `UPLOADTHING_SECRET` - Для завантаження файлів
- `UPLOADTHING_APP_ID`
- `RESEND_API_KEY` - Для email нотифікацій
- `SLACK_WEBHOOK_URL` - Для Slack нотифікацій

## 📚 API Documentation

Детальна документація API в файлі `API_DOCUMENTATION.md`

## ✅ Acceptance Criteria

- [x] Login + RBAC працює
- [x] Requester може створювати requisitions
- [x] Procurement може редагувати та змінювати статуси
- [x] Activity timeline з історією
- [x] Kanban board на Dashboard
- [x] SAAS-style UI з sidebar
- [x] Deploy на Vercel

---

**Version:** 3.0  
**Auth:** Simple JWT  
**Status:** Production Ready ✅