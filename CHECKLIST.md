# Чеклист настройки проекта CoralSync

Используйте этот список, чтобы проверить окружение и первый запуск.

---

## Системные требования

- [ ] **Node.js 20+** — `node --version`
- [ ] **npm** — `npm --version`
- [ ] **Git** — `git --version`
- [ ] **MongoDB** — `mongod --version` (или доступ к Atlas)
- [ ] **Redis** — `redis-cli --version`

---

## Сервисы

- [ ] **Redis** запущен: `redis-cli ping` → `PONG`
- [ ] **MongoDB** запущен: `mongosh` подключается без ошибок

---

## Проект

- [ ] Клонирован репозиторий / создана папка проекта
- [ ] Выполнено `npm install`
- [ ] Next.js 15, React 19, TypeScript настроены (уже в проекте)
- [ ] ShadCN UI настроен (`shared/ui/`, `components.json`)
- [ ] PayloadCMS установлен (конфиг — в `src/payload/`)
- [ ] Better Auth настроен (`server/auth.ts`, `app/api/auth/[...all]/route.ts`)

---

## Переменные окружения

Создайте `.env.local` на основе `.env.example` и заполните:

### Better Auth
- [ ] `BETTER_AUTH_SECRET` — секрет для подписи сессий (длинная случайная строка)
- [ ] `BETTER_AUTH_URL` или `NEXT_PUBLIC_APP_URL` — базовый URL приложения (например `http://localhost:3000`)

### Базы и кеш
- [ ] `MONGODB_URI` — строка подключения к MongoDB
- [ ] `REDIS_URL` — строка подключения к Redis (например `redis://localhost:6379`)

### PayloadCMS
- [ ] `PAYLOAD_SECRET` — секрет Payload (не использовать значение из примера в продакшене)
- [ ] `PAYLOAD_PUBLIC_SERVER_URL` — публичный URL сервера (например `http://localhost:3000`)

### Приложение
- [ ] `NEXT_PUBLIC_APP_URL` — URL фронтенда (например `http://localhost:3000`)

### Опционально
- [ ] **Uploadthing** (если нужны загрузки): `UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID`
- [ ] **OAuth** (Google, GitHub и т.д.): соответствующие `*_CLIENT_ID` и `*_CLIENT_SECRET` в конфиге Better Auth

---

## Проверка работы

- [ ] `npm run dev` запускается без ошибок
- [ ] Открывается [http://localhost:3000](http://localhost:3000)
- [ ] Страница входа/регистрации Better Auth доступна (если маршруты `/sign-in`, `/sign-up` реализованы)
- [ ] API Better Auth отвечает: например `GET/POST` на `http://localhost:3000/api/auth/*`
- [ ] Админка PayloadCMS доступна по `/admin` (после настройки Payload)

---

## После первого запуска

- [ ] Настроены коллекции PayloadCMS под проект (titles, users, lists и т.д.)
- [ ] При необходимости в `server/auth.ts` добавлены database adapter и/или social providers
- [ ] Middleware защищает нужные маршруты (`middleware.ts` — matcher и логика редиректа)
