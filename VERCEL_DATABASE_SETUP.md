# Налаштування бази даних на Vercel

## Проблема

База даних на Vercel не має таблиць з оновленою схемою (без clerkId, з password).

## Рішення

### Варіант 1: Застосувати міграції автоматично (рекомендовано)

Оновлено build script в `package.json`:
```json
"build": "prisma generate && prisma migrate deploy && next build"
```

Це автоматично застосує всі міграції перед кожним build.

### Варіант 2: Застосувати міграції вручну

1. Встановіть Vercel CLI:
```bash
npm i -g vercel
```

2. Зʼєднайтесь з Vercel:
```bash
vercel login
vercel link
```

3. Застосуйте міграції:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

### Варіант 3: Скинути базу даних

**УВАГА: Це видалить всі дані!**

1. Зайдіть у ваш Postgres провайдер (Neon/Supabase)
2. Видаліть базу даних
3. Створіть нову
4. Оновіть `DATABASE_URL` на Vercel
5. Redeploy

Vercel автоматично запустить міграції з оновленим build script.

## Що робить нова міграція

- ❌ Видаляє колонку `clerkId`
- ❌ Видаляє index на `clerkId`
- ✅ Додає колонку `password` (nullable)
- ✅ Оновлює індекс на email

## Після застосування міграцій

Запустіть seed:
```bash
npm run seed
```

Це створить тестових користувачів:
- admin@spa.com / admin123
- procurement@spa.com / procurement123
- john@spa.com / john123

---

**Дата:** 2025-01-15  
**Статус:** Готово до застосування
