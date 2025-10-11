# Проста система авторизації

## Що використовується

- **JWT токени** (через jose) - Edge-safe, працює на Vercel
- **HTTP-only cookies** - безпечне зберігання токенів
- **Bcrypt** - хешування паролів
- **Простий middleware** - перевірка токенів

## Як працює

### 1. Реєстрація
```
POST /api/register
Body: { name, email, password }
→ Створює користувача з хешованим паролем
```

### 2. Вхід
```
POST /api/login
Body: { email, password }
→ Перевіряє пароль
→ Створює JWT токен
→ Зберігає в HTTP-only cookie
```

### 3. Перевірка сесії
```
Middleware читає cookie "session"
→ Перевіряє JWT токен
→ Якщо валідний - пропускає
→ Якщо ні - redirect на /sign-in
```

### 4. Вихід
```
POST /api/logout
→ Видаляє cookie
```

## Environment Variables

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Згенеруйте JWT_SECRET:
```bash
openssl rand -base64 32
```

## Тестові користувачі

Після `npm run seed`:

- **Admin:** admin@spa.com / admin123
- **Procurement:** procurement@spa.com / procurement123
- **Requester:** john@spa.com / john123

## Переваги

✅ Дуже просто - 3 файли (jwt.ts, auth.ts, middleware.ts)  
✅ Edge-safe - працює на Vercel Edge Runtime  
✅ Безпечно - HTTP-only cookies  
✅ Швидко - немає залежностей від зовнішніх сервісів  
✅ Повний контроль - весь код у вашому проекті

## Обмеження

❌ Немає social login  
❌ Немає 2FA  
❌ Немає email verification  
❌ Немає password reset

**Але можна додати пізніше якщо потрібно!**

---

**Дата:** 2025-01-15  
**Версія:** 3.0 (Simple JWT Auth)  
**Статус:** Production Ready ✅
