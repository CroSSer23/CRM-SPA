# Contributing to SPA Procurement System

Дякуємо за ваш інтерес до покращення системи! Цей документ надає інструкції щодо внесення змін.

## Початок роботи

1. **Fork** репозиторій
2. **Clone** ваш fork
3. **Створіть гілку** для вашої функції: `git checkout -b feature/amazing-feature`
4. **Налаштуйте середовище** згідно з README.md

## Стандарти коду

### TypeScript
- Використовуйте strict mode
- Завжди вказуйте типи (no `any`)
- Використовуйте interface для об'єктів
- Використовуйте type для unions/intersections

### React/Next.js
- Server Components за замовчуванням
- Client Components тільки коли потрібно (use client)
- Async Server Components для data fetching
- Використовуйте Server Actions для mutations

### Naming Conventions
- Components: PascalCase (UserCard.tsx)
- Functions: camelCase (getUserData)
- Constants: UPPER_SNAKE_CASE (API_URL)
- Files: kebab-case (user-profile.tsx)

### File Structure
```
app/
  (dashboard)/
    feature/
      page.tsx          # Server Component
      _components/      # Private components
        client-form.tsx # Client Component
components/
  ui/                   # shadcn/ui components
  feature-card.tsx      # Shared components
lib/
  utils.ts             # Utilities
  validations.ts       # Zod schemas
```

## Git Workflow

### Commit Messages
Використовуйте Conventional Commits:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: Нова функція
- `fix`: Виправлення помилки
- `docs`: Зміни документації
- `style`: Форматування коду
- `refactor`: Рефакторинг коду
- `test`: Додавання тестів
- `chore`: Інші зміни

**Приклади:**
```
feat(requisitions): add bulk delete functionality
fix(auth): correct permission check for procurement role
docs(readme): update deployment instructions
```

### Pull Request Process

1. **Переконайтеся що код проходить:**
   ```bash
   npm run lint
   npm run format
   npm run build
   ```

2. **Оновіть документацію** якщо потрібно

3. **Опишіть зміни:**
   - Що було змінено?
   - Чому це потрібно?
   - Як це тестувалось?
   - Screenshots (якщо UI зміни)

4. **Зв'яжіть з issue** якщо існує

5. **Дочекайтесь code review**

## Додавання нових функцій

### 1. Database Changes
```bash
# Змініть prisma/schema.prisma
npx prisma migrate dev --name feature_name
npx prisma generate
```

### 2. API Routes
- Додайте в `app/api/`
- Використовуйте Zod для валідації
- Додайте RBAC перевірки
- Документуйте в API_DOCUMENTATION.md

### 3. UI Components
- Використовуйте shadcn/ui компоненти
- Додайте в `components/`
- Server Components за замовчуванням

### 4. Types
- Додайте TypeScript типи в `lib/types.ts`
- Зod схеми в `lib/validations.ts`

## Тестування

```bash
# Unit tests (коли будуть додані)
npm run test

# E2E tests (коли будуть додані)
npm run test:e2e

# Manual testing
npm run dev
```

Перевірте:
- Різні ролі користувачів
- Edge cases
- Error handling
- Mobile responsiveness

## Reporting Issues

### Bug Report
- Опис проблеми
- Кроки для відтворення
- Очікувана поведінка
- Actual behavior
- Screenshots
- Environment (браузер, OS)

### Feature Request
- Опис функції
- Випадки використання
- Чому це корисно?
- Можливі альтернативи

## Code Review Guidelines

### Що перевіряти:
- [ ] Код відповідає стандартам
- [ ] Типи TypeScript правильні
- [ ] RBAC правильно реалізовано
- [ ] No console.logs в production коді
- [ ] Error handling присутній
- [ ] Optimistic locking де потрібно
- [ ] Notificatoins працюють
- [ ] UI/UX якісний
- [ ] Responsiveness OK
- [ ] Performance OK

### Feedback
- Будьте конструктивними
- Пояснюйте "чому"
- Пропонуйте альтернативи
- Appreciate good work

## Security

### Reporting Vulnerabilities
**НЕ** створюйте публічні issues для security проблем.

Надішліть email на: security@yourdomain.com

Включіть:
- Опис вразливості
- Кроки для відтворення
- Можливий вплив
- Пропоновані виправлення

## Questions?

- GitHub Discussions
- Email: support@yourdomain.com
- Slack: [Your Slack]

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Дякуємо за ваш внесок! 🎉

