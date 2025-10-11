# Чому використовуємо prisma db push

## Проблема

`prisma migrate deploy` не спрацьовує на Vercel, оскільки:
- Потребує існуючі міграційні файли
- Може конфліктувати зі старими таблицями
- Складніша в налаштуванні

## Рішення: prisma db push

`prisma db push`:
- ✅ Синхронізує схему напряму з базою даних
- ✅ Працює з порожньою базою
- ✅ Працює зі старою базою (оновлює структуру)
- ✅ Не потребує migration файлів
- ✅ Ідеально для serverless (Vercel)

## Build script

```json
"build": "prisma db push --accept-data-loss && next build"
```

`--accept-data-loss` потрібен щоб:
- Автоматично видалити старі колонки (clerkId)
- Додати нові колонки (password)
- Без ручного підтвердження

## Що відбувається на Vercel

1. `npm install` → встановлює залежності
2. `postinstall` → `prisma generate` (генерує Prisma Client)
3. `build` → `prisma db push` (створює/оновлює таблиці) → `next build`
4. ✅ База даних готова!

## Для локальної розробки

Використовуйте:
```bash
npm run db:push
# або
npx prisma db push
```

## Коли використовувати migrate замість push

- Для production з версіонуванням schema
- Коли потрібна історія змін
- Для CI/CD pipelines

Але для простого MVP на Vercel - `db push` ідеально підходить!

---

**Дата:** 2025-01-15  
**Статус:** Працює ✅
