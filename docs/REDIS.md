# Redis в CoralSync

**Redis в проекте не используется и не планируется.** Сессии Better Auth и кэш — через MongoDB и встроенный кэш Next.js.

Ранее существовали `server/utils/redis.ts` и сервис `redis` в `docker-compose.yml` — они удалены, чтобы сборка не требовала `ioredis` и отдельного Redis.

Если позже понадобится кэш или rate limiting — можно вернуть Redis как опциональную зависимость и завести утилиту заново.
