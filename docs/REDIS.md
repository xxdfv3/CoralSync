# Redis в CoralSync: нужен ли и как подключать

## Честное мнение: нужен ли Redis с самого старта?

**Коротко: не обязателен.** Можно спокойно стартовать без него.

- **Сессии:** Better Auth умеет хранить сессии в MongoDB. Этого достаточно для одного инстанса и обычной нагрузки.
- **Кэш:** Next.js даёт кэш для fetch и Server Components. Для MVP и первых пользователей этого хватает.
- **Когда Redis действительно пригодится:**
  - несколько инстансов приложения (общий store сессий);
  - высокая нагрузка на каталог (частые тяжёлые запросы к Payload/MongoDB);
  - жёсткий rate limiting;
  - когда по метрикам видно, что MongoDB перегружена чтением.

**Итог:** сначала поднимаем MongoDB + Payload + Better Auth с сессиями в MongoDB. Redis добавляем, когда появится реальная необходимость или перед выкладкой на несколько воркеров. Ниже — как его тогда подключить и использовать.

---

## 1. Окружение и запуск Redis

**Локально:**

- Установка: `brew install redis` (macOS) или пакет из репозитория в Linux.
- Запуск: `redis-server` (в фоне или в отдельном терминале).
- Проверка: `redis-cli ping` → в ответ `PONG`.

**Через Docker (уже есть в проекте):**

```bash
docker compose up -d redis
```

В `docker-compose.yml` уже описан сервис `redis` на порту 6379.

**Переменная окружения:**

В `.env.local`:

```env
REDIS_URL=redis://localhost:6379
```

Для Docker по умолчанию то же самое. Для облака (Upstash, Redis Cloud и т.п.) подставь выданный URL (часто с TLS: `rediss://...`).

---

## 2. Установка клиента и конфиг Next.js

Установить клиент:

```bash
npm i ioredis
```

В `next.config.js` уже указано `serverExternalPackages: ['ioredis']` — трогать не нужно.

---

## 3. Подключение в коде

В проекте уже есть утилита `server/utils/redis.ts`:

- читает `REDIS_URL` (по умолчанию `redis://localhost:6379`);
- создаёт один инстанс `Redis` (ioredis);
- вешает обработчики `error` и `connect` для логов.

Использование: импортируй `redis` из `@/server/utils/redis` только в серверном коде (API routes, Server Actions, серверные компоненты при необходимости). Не импортировать в клиентский код.

Если Redis не запущен, приложение не должно падать при старте: либо подключать Redis лениво при первом обращении, либо оборачивать вызовы в try/catch и при ошибке работать без кэша (fallback на MongoDB/повторный запрос).

---

## 4. Примеры использования

**Простой кэш с TTL (например, список тайтлов):**

```ts
import { redis } from '@/server/utils/redis';

const CACHE_KEY = 'titles:list:page:1';
const TTL_SECONDS = 60 * 5; // 5 минут

// Получить из кэша
const cached = await redis.get(CACHE_KEY);
if (cached) return JSON.parse(cached);

// Запросить из БД, сохранить в кэш
const data = await fetchTitlesFromDB();
await redis.setex(CACHE_KEY, TTL_SECONDS, JSON.stringify(data));
return data;
```

**Инвалидация при изменении данных (например, после создания/обновления тайтла в админке):**

```ts
await redis.del('titles:list:page:1');
// или с паттерном: redis.keys('titles:list:*') и затем redis.del(...)
```

**Rate limiting (идея):** ключ по IP или userId, инкремент `INCR`, при первом запросе ставить TTL. Если счётчик выше порога — отдавать 429.

---

## 5. Сессии Better Auth в Redis

Когда решишь вынести сессии в Redis (например, при нескольких инстансах):

- В доке Better Auth найти раздел про session store / Redis adapter.
- В конфиг auth добавить хранилище сессий с указанием Redis-клиента (или URL).
- Сессии тогда будут жить в Redis, а не в MongoDB.

Делать это стоит уже после того, как базовый сценарий (MongoDB + Better Auth) работает.

---

## 6. Проверка

- Redis запущен: `redis-cli ping` → `PONG`.
- Приложение: при первом обращении к `redis` в логах должна быть строка вида «Redis connected» (из `server/utils/redis.ts`).
- Опционально: временный API route или Server Action с `redis.set('test', 'ok')` и `redis.get('test')`, чтобы убедиться, что запись/чтение работают.

---

## Краткий порядок (когда будешь подключать)

1. Запустить Redis (локально или `docker compose up -d redis`).
2. Добавить `REDIS_URL` в `.env.local`.
3. Установить `ioredis` (`npm i ioredis`).
4. Использовать `server/utils/redis.ts` в серверном коде для кэша и при необходимости для сессий Better Auth.

До этого этапа можно спокойно развивать проект только на MongoDB и встроенном кэше Next.js.
