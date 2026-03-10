# CoralSync

Платформа для учёта аниме, фильмов и сериалов — по аналогии с MyAnimeList и Letterboxd.

## Стек

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, ShadCN UI
- **Архитектура:** Feature-Sliced Design (FSD)
- **Auth:** [Better Auth](https://www.better-auth.com/) (email/password, опционально OAuth)
- **CMS / данные:** PayloadCMS 3, MongoDB
- **Валидация:** Zod, React Hook Form + @hookform/resolvers

## Требования

- Node.js 20+
- npm
- MongoDB (локально или Atlas)

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Копирование переменных окружения
cp .env.example .env.local
# Отредактируйте .env.local (MONGODB_URI, BETTER_AUTH_*, PAYLOAD_SECRET и т.д.)

# Запуск MongoDB (если локально)
# mongod
# или: docker compose up -d mongo

# Разработка
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Скрипты

| Команда        | Описание              |
|----------------|-----------------------|
| `npm run dev`  | Режим разработки      |
| `npm run build`| Сборка для продакшена |
| `npm run start`| Запуск продакшен-сборки|
| `npm run lint` | Проверка ESLint       |

## Структура проекта

Проект организован по **Feature-Sliced Design**:

```
app/                 # Роуты Next.js (App Router)
shared/              # Переиспользуемый код (UI, утилиты, типы)
entities/            # Бизнес-сущности
features/            # Бизнес-фичи
widgets/             # Композитные UI-блоки
pages/               # Композиция страниц (опционально)
server/              # Серверная логика (auth, БД, кеш)
src/payload/         # Конфигурация PayloadCMS
```

Подробнее — в [ARCHITECTURE.md](./ARCHITECTURE.md).

## Переменные окружения

Основные переменные (см. [.env.example](./.env.example) и [CHECKLIST.md](./CHECKLIST.md)):

- **Better Auth:** `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (или `NEXT_PUBLIC_APP_URL`)
- **MongoDB:** `MONGODB_URI`. Если MongoDB запущен через `docker-compose` с `MONGO_INITDB_ROOT_*`, строка должна содержать логин и пароль: `mongodb://admin:PASSWORD@localhost:27017/coralsync?authSource=admin` (пароль из `docker-compose.yml`).
- **PayloadCMS:** `PAYLOAD_SECRET`, `PAYLOAD_PUBLIC_SERVER_URL`
- **Приложение:** `NEXT_PUBLIC_APP_URL`

## Документация

- [ARCHITECTURE.md](./ARCHITECTURE.md) — архитектура, слои FSD, правила импортов
- [CHECKLIST.md](./CHECKLIST.md) — чеклист настройки и проверки окружения

## Лицензия

Private.
