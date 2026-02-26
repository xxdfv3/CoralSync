# Feature-Sliced Design (FSD) в CoralSync

Код приложения по слоям FSD. Импорты только вниз: **shared ← entities ← features ← widgets ← views**. В `app/` импортируем только из `@/views/*`, `@/shared/*` и при необходимости из других слоёв. Слой страниц назван `views`, т.к. Next.js резервирует папку `pages` для Pages Router.

## Структура

| Слой      | Путь           | Назначение |
|-----------|----------------|------------|
| **shared**   | `src/shared/`   | UI (ShadCN), lib, api, config, types — без привязки к фичам |
| **entities** | `src/entities/` | Сущности: User, Title, Episode, Genre — типы и presentational-компоненты |
| **features** | `src/features/` | Действия: auth, add-to-list, rate-title, search |
| **widgets**  | `src/widgets/`  | Крупные блоки: Header, Sidebar, TitleCard, WatchlistPanel |
| **views**    | `src/views/`    | Композиции страниц: HomePage, CatalogPage, TitlePage — используются в `app/**/page.tsx` |

## Алиасы (tsconfig)

- `@/shared/*` → `src/shared/*`
- `@/entities/*` → `src/entities/*`
- `@/features/*` → `src/features/*`
- `@/widgets/*` → `src/widgets/*`
- `@/views/*` → `src/views/*`

## Пример

В `app/page.tsx` — тонкая обёртка:

```tsx
import { HomePage } from '@/views/HomePage'
export default function Home() {
  return <HomePage />
}
```

Страница собирается в `src/views/HomePage.tsx` из widgets и features.
