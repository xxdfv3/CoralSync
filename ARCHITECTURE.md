# Архитектура проекта CoralSync

Проект следует принципам **Feature-Sliced Design (FSD)** для фронтенда и аналогичной слоистой архитектуре для бэкенда.

## Структура директорий

```
coralsync/
├── app/                        # Next.js App Router (слой App в FSD: маршрутизация)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── (auth)/                 # Сегмент: маршруты авторизации (sign-in, sign-up)
│   │   ├── layout.tsx
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (payload)/              # Сегмент: админка и API PayloadCMS
│   │   ├── config.ts           # Конфиг Payload (или реэкспорт из src/modules/admin)
│   │   ├── layout.tsx
│   │   ├── admin/              # UI админ-панели (/admin)
│   │   ├── api/                # REST API Payload (/api/...)
│   │   └── custom.scss
│   └── api/                    # API приложения (например Better Auth)
│       └── auth/[...all]/route.ts
│
├── pages/                      # FSD: Pages layer (композиция страниц)
│   └── .gitkeep
├── widgets/                    # FSD: Widgets layer (композитные UI блоки)
│   └── .gitkeep
├── features/                   # FSD: Features layer (бизнес-фичи)
│   └── .gitkeep
├── entities/                   # FSD: Entities layer (бизнес-сущности)
│   └── .gitkeep
├── shared/                     # FSD: Shared layer (переиспользуемый код)
│   ├── ui/
│   ├── lib/
│   ├── api/
│   ├── config/
│   ├── hooks/
│   └── types/
│
├── server/                     # Серверная логика (вне FSD)
│   ├── auth.ts
│   └── utils/                  # mongodb.ts, redis.ts
│
├── src/                        # Дополнительные модули и конфигурации
│   └── modules/
│       └── admin/              # Модуль админки (Payload): конфиг и коллекции
│           ├── config.ts      # Опционально: конфиг здесь, в app/(payload) — реэкспорт
│           └── collections/   # Коллекции Payload (Media, Genres, Titles, ...)
│
├── middleware.ts
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── components.json
```

## Правила импортов (FSD)

Слои могут импортировать только из слоёв ниже по иерархии:

1. **app/** → может импортировать из всех слоёв
2. **pages/** → может импортировать из widgets, features, entities, shared
3. **widgets/** → может импортировать из features, entities, shared
4. **features/** → может импортировать из entities, shared
5. **entities/** → может импортировать только из shared
6. **shared/** → не может импортировать из других слоёв

## Алиасы TypeScript

Все алиасы настроены через `@/*` → `./*`:

- `@/shared/ui/*` - UI компоненты
- `@/shared/lib/utils` - утилиты
- `@/server/utils/*` - серверные утилиты
- `@/app/*` - роуты Next.js

## Примеры использования

### Импорт UI компонента
```typescript
import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/lib/utils"
```

### Импорт серверных утилит
```typescript
import { connectDB } from "@/server/utils/mongodb"
import { redis } from "@/server/utils/redis"
```

### Создание фичи
```typescript
// features/add-to-list/ui/add-to-list-button.tsx
import { Button } from "@/shared/ui/button"
import { Title } from "@/entities/title"
```

### Создание виджета
```typescript
// widgets/title-card/ui/title-card.tsx
import { TitleCard } from "@/features/title-card"
import { Title } from "@/entities/title"
```

## Бэкенд структура

Серверная логика организована в `server/` (вне FSD-слоёв):

- `server/utils/` — утилиты для работы с БД и кешем
- `server/api/` — API роуты (если нужны)
- `server/config/` — конфигурации сервера

Админка и CMS (Payload) объединены в модуль:

- **`app/(payload)/`** — маршруты: UI админки (`/admin`), REST API Payload, layout и конфиг (или реэкспорт из `src/modules/admin`).
- **`src/modules/admin/`** — конфиг Payload и коллекции; слой App только подключает их через импорты.

## Следующие шаги

1. Создать сущности в `entities/` (Title, User, List, Review)
2. Реализовать фичи в `features/` (add-to-list, rate-title, create-review)
3. Собрать виджеты в `widgets/` (header, sidebar, title-card)
4. Композировать страницы в `pages/` или использовать `app/` роуты напрямую
