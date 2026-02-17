# Архитектура проекта CoralSync

Проект следует принципам **Feature-Sliced Design (FSD)** для фронтенда и аналогичной слоистой архитектуре для бэкенда.

## Структура директорий

```
coralsync/
├── app/                    # Next.js App Router (роуты и layout)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── pages/                  # FSD: Pages layer (композиция страниц)
│   └── .gitkeep
│
├── widgets/                # FSD: Widgets layer (композитные UI блоки)
│   └── .gitkeep
│
├── features/               # FSD: Features layer (бизнес-фичи)
│   └── .gitkeep
│
├── entities/               # FSD: Entities layer (бизнес-сущности)
│   └── .gitkeep
│
├── shared/                 # FSD: Shared layer (переиспользуемый код)
│   ├── ui/                 # UI компоненты (ShadCN)
│   ├── lib/                # Утилиты (utils.ts)
│   ├── api/                # API клиенты и конфиги
│   ├── config/             # Конфигурации
│   ├── hooks/              # React хуки
│   └── types/              # TypeScript типы
│
├── server/                 # Серверная логика
│   ├── auth.ts             # Better Auth инстанс
│   └── utils/              # Утилиты (mongodb.ts, redis.ts)
│
├── src/                    # Дополнительные конфигурации
│   └── payload/            # PayloadCMS конфигурация
│
├── middleware.ts           # Next.js middleware (Better Auth защита роутов)
├── next.config.js          # Next.js конфигурация
├── tailwind.config.ts      # Tailwind CSS конфигурация
├── tsconfig.json           # TypeScript конфигурация
└── components.json         # ShadCN UI конфигурация
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

Серверная логика организована в `server/`:

- `server/utils/` - утилиты для работы с БД и кешем
- `server/api/` - API роуты (если нужны)
- `server/config/` - конфигурации сервера

## Следующие шаги

1. Создать сущности в `entities/` (Title, User, List, Review)
2. Реализовать фичи в `features/` (add-to-list, rate-title, create-review)
3. Собрать виджеты в `widgets/` (header, sidebar, title-card)
4. Композировать страницы в `pages/` или использовать `app/` роуты напрямую
