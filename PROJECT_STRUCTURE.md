# Структура проєкту

```
CRM-SPA/
│
├── app/                                    # Next.js App Router
│   ├── (dashboard)/                        # Захищений layout для authenticated users
│   │   ├── layout.tsx                      # Dashboard layout з NavBar
│   │   ├── page.tsx                        # Головна сторінка - Kanban Dashboard
│   │   ├── requisitions/
│   │   │   ├── page.tsx                    # Список requisitions
│   │   │   ├── new/
│   │   │   │   └── page.tsx                # Створення нової requisition
│   │   │   └── [id]/
│   │   │       └── page.tsx                # Деталі requisition
│   │   ├── catalog/
│   │   │   ├── page.tsx                    # Redirect до products
│   │   │   ├── products/
│   │   │   │   └── page.tsx                # Список продуктів
│   │   │   └── categories/
│   │   │       └── page.tsx                # Список категорій
│   │   ├── locations/
│   │   │   └── page.tsx                    # Список локацій (ADMIN)
│   │   └── users/
│   │       └── page.tsx                    # Список користувачів (ADMIN)
│   │
│   ├── api/                                # API Routes
│   │   ├── requisitions/
│   │   │   ├── route.ts                    # GET, POST requisitions
│   │   │   └── [id]/
│   │   │       ├── route.ts                # GET, DELETE requisition
│   │   │       ├── status/
│   │   │       │   └── route.ts            # PATCH status
│   │   │       ├── items/
│   │   │       │   └── route.ts            # PATCH items
│   │   │       └── receive/
│   │   │           └── route.ts            # PATCH receive
│   │   ├── products/
│   │   │   ├── route.ts                    # GET, POST products
│   │   │   └── [id]/
│   │   │       └── route.ts                # GET, PATCH, DELETE product
│   │   ├── categories/
│   │   │   └── route.ts                    # GET, POST categories
│   │   ├── locations/
│   │   │   ├── route.ts                    # GET, POST locations
│   │   │   └── [id]/
│   │   │       └── assign/
│   │   │           └── route.ts            # POST assign product
│   │   ├── users/
│   │   │   ├── route.ts                    # GET users
│   │   │   └── [id]/
│   │   │       ├── role/
│   │   │       │   └── route.ts            # PATCH role
│   │   │       └── locations/
│   │   │           └── route.ts            # POST assign location
│   │   ├── attachments/
│   │   │   └── route.ts                    # POST attachment
│   │   └── uploadthing/
│   │       ├── core.ts                     # UploadThing config
│   │       └── route.ts                    # UploadThing routes
│   │
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx                    # Clerk sign-in page
│   ├── sign-up/
│   │   └── [[...sign-up]]/
│   │       └── page.tsx                    # Clerk sign-up page
│   │
│   ├── layout.tsx                          # Root layout з ClerkProvider
│   └── globals.css                         # Global styles
│
├── components/                             # React Components
│   ├── ui/                                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── use-toast.ts
│   │
│   ├── nav-bar.tsx                         # Navigation bar
│   ├── status-badge.tsx                    # Requisition status badge
│   └── role-gate.tsx                       # RBAC gate component
│
├── lib/                                    # Utilities & Configs
│   ├── prisma.ts                           # Prisma client singleton
│   ├── auth.ts                             # Authentication utilities
│   ├── validations.ts                      # Zod validation schemas
│   ├── types.ts                            # TypeScript types & constants
│   ├── notifications.ts                    # Email & Slack notifications
│   ├── uploadthing.ts                      # UploadThing client
│   └── utils.ts                            # Helper functions (cn, formatDate)
│
├── prisma/                                 # Database
│   ├── schema.prisma                       # Prisma schema
│   └── seed.ts                             # Database seed script
│
├── public/                                 # Static files
│
├── .husky/                                 # Git hooks
│   └── pre-commit                          # Lint-staged hook
│
├── .eslintrc.json                          # ESLint config
├── .prettierrc                             # Prettier config
├── .gitignore                              # Git ignore
├── .npmrc                                  # npm config
├── .nvmrc                                  # Node version
│
├── middleware.ts                           # Clerk authentication middleware
├── next.config.js                          # Next.js config
├── next-env.d.ts                           # Next.js TypeScript definitions
├── postcss.config.js                       # PostCSS config
├── tailwind.config.ts                      # Tailwind config
├── tsconfig.json                           # TypeScript config
├── vercel.json                             # Vercel deployment config
│
├── package.json                            # Dependencies & scripts
├── README.md                               # Main documentation
├── API_DOCUMENTATION.md                    # API reference
├── DEPLOYMENT.md                           # Deployment guide
├── ENV_SETUP.md                            # Environment variables guide
├── CONTRIBUTING.md                         # Contributing guidelines
├── CHANGELOG.md                            # Version history
└── PROJECT_STRUCTURE.md                    # This file
```

## Ключові директорії

### `/app` - Next.js App Router
- **`(dashboard)/`** - Protected routes з shared layout
- **`api/`** - API endpoints (RESTful)
- **`sign-in/`, `sign-up/`** - Clerk authentication pages

### `/components` - React Components
- **`ui/`** - Reusable shadcn/ui components
- Custom components для бізнес-логіки

### `/lib` - Business Logic & Utilities
- **`prisma.ts`** - Database client
- **`auth.ts`** - RBAC & permissions
- **`validations.ts`** - Request validation
- **`types.ts`** - Shared TypeScript types
- **`notifications.ts`** - Email/Slack integration

### `/prisma` - Database
- **`schema.prisma`** - Database schema
- **`seed.ts`** - Test data

## Конвенції іменування

### Файли
- Components: `PascalCase.tsx` (NavBar.tsx)
- Utilities: `kebab-case.ts` (use-toast.ts)
- Pages: `page.tsx`, `layout.tsx` (Next.js convention)

### Компоненти
- Server Components (default): Async functions
- Client Components: "use client" directive

### API Routes
- RESTful naming
- Structured by resource
- Standard HTTP methods

## Data Flow

```
User Action (UI)
    ↓
Client Component (form submission)
    ↓
API Route (/app/api/...)
    ↓
Validation (Zod schemas)
    ↓
RBAC Check (lib/auth.ts)
    ↓
Business Logic
    ↓
Database (Prisma)
    ↓
Notifications (optional)
    ↓
Response to Client
    ↓
UI Update
```

## Важливі файли

### Configuration
- `next.config.js` - Next.js settings
- `tailwind.config.ts` - Tailwind theme
- `tsconfig.json` - TypeScript strict mode
- `middleware.ts` - Auth protection

### Database
- `prisma/schema.prisma` - Single source of truth
- Run `prisma generate` after changes

### Styling
- `app/globals.css` - CSS variables & Tailwind
- `tailwind.config.ts` - Theme customization

### Type Safety
- `lib/types.ts` - Shared types
- `lib/validations.ts` - Runtime validation

## Environment Variables

Required in `.env`:
- Database connection
- Clerk authentication
- Resend email
- Slack webhook
- UploadThing credentials

See `ENV_SETUP.md` for details.

## Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema (no migration)
npm run db:migrate       # Create & apply migration
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# Code Quality
npm run lint             # ESLint
npm run format           # Prettier
```

## Deployment

See `DEPLOYMENT.md` for full guide.

Quick deploy to Vercel:
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy
5. Run migrations

---

Створено: 2025-01-15
Версія: 1.0.0

