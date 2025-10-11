# Як працює доступ з Clerk Hosted Pages

## Важливо! 

**Ми використовуємо Clerk Hosted Pages**, тому `/sign-in` та `/sign-up` більше НЕ існують в нашому додатку!

## Як тепер працює автентифікація:

### 1. Перший вхід на сайт

Коли користувач заходить на `https://spa.crosser.software/`:
1. Clerk middleware перевіряє чи користувач залогінений
2. Якщо НІ → **автоматичний redirect** на Clerk hosted sign-in page
3. URL буде виглядати як: `your-app.clerk.accounts.dev/sign-in`

### 2. Після входу

1. Користувач входить/реєструється на Clerk hosted page
2. Clerk redirect назад на `https://spa.crosser.software/`
3. Користувач потрапляє на Dashboard

### 3. Sign Out

1. Користувач клікає на іконку профілю
2. Переходить на `/user-profile` → Clerk hosted profile page
3. Там є кнопка "Sign out"
4. Після виходу → redirect на Clerk sign-in page

## Чому 404 на /sign-in?

Бо цієї сторінки більше немає! Clerk Hosted Pages означає:
- ❌ Немає `/sign-in` в додатку
- ❌ Немає `/sign-up` в додатку  
- ✅ Автентифікація на `your-app.clerk.accounts.dev`

## Правильні URL для доступу:

### Для користувачів:
```
https://spa.crosser.software/
```
Clerk автоматично redirect незалогінених користувачів

### Для розробників (якщо потрібен прямий доступ):
```
https://your-app.clerk.accounts.dev/sign-in
https://your-app.clerk.accounts.dev/sign-up
```

## Налаштування в Clerk Dashboard

Переконайтесь що в Clerk Dashboard налаштовано:
1. **Application domain:** `spa.crosser.software`
2. **Redirect URLs:** 
   - After sign-in: `https://spa.crosser.software/`
   - After sign-up: `https://spa.crosser.software/`
   - After sign-out: автоматично на Clerk sign-in

## Для старих користувачів

Якщо хтось має збережений лінк на `/sign-in`:
- Вони побачать 404
- Потрібно просто зайти на головну `https://spa.crosser.software/`
- Clerk автоматично redirect на sign-in

---

**Це нормальна поведінка для Clerk Hosted Pages!**
