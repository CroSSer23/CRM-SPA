# Міграція з Clerk на NextAuth

## ✅ Що було зроблено:

### 1. Видалено Clerk
- ❌ Видалено `@clerk/nextjs` з package.json
- ❌ Видалено всі Clerk компоненти та файли
- ❌ Видалено `clerkId` з Prisma schema
- ✅ Додано поле `password` в User model

### 2. Встановлено NextAuth
- ✅ Встановлено `next-auth` та `bcryptjs`
- ✅ Створено `/api/auth/[...nextauth]` route
- ✅ Налаштовано Credentials provider

### 3. Створено нові сторінки
- ✅ `/sign-in` - форма входу
- ✅ `/sign-up` - форма реєстрації  
- ✅ `/api/register` - API для реєстрації

### 4. Оновлено middleware
- ✅ Використовує JWT токени NextAuth
- ✅ Захищає всі роути крім публічних

### 5. Оновлено auth utilities
- ✅ `getCurrentUser()` - отримує поточного користувача
- ✅ `requireUser()` - вимагає авторизацію
- ✅ RBAC функції працюють як раніше

## 🚀 Як користуватись:

### 1. Налаштуйте змінні середовища

Створіть `.env.local`:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Запустіть міграції

```bash
npx prisma migrate dev
npx prisma generate
```

### 3. Створіть адміністратора

Опція 1 - через Prisma Studio:
```bash
npx prisma studio
```

Опція 2 - через seed скрипт:
```bash
npm run seed
```

### 4. Запустіть додаток

```bash
npm run dev
```

## 📝 Важливі зміни:

1. **Авторизація тепер через email/password**
   - Немає social login
   - Немає 2FA (можна додати пізніше)

2. **Сесії зберігаються в JWT**
   - Не потребує додаткової БД
   - Працює з serverless

3. **RBAC працює як раніше**
   - Ролі: ADMIN, PROCUREMENT, REQUESTER
   - Всі permissions збережені

## 🔧 Для production:

1. Згенеруйте безпечний NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

2. Налаштуйте NEXTAUTH_URL на ваш домен

3. Додайте HTTPS

4. Розгляньте додавання:
   - Email verification
   - Password reset
   - 2FA
   - Rate limiting

## ⚠️ Відомі обмеження:

- Немає social login (можна додати)
- Немає email verification (можна додати)
- Немає password reset (можна додати)
- Простіша система ніж Clerk, але повністю під вашим контролем

---

**Дата:** 2025-01-15  
**Статус:** Migration Complete ✅
