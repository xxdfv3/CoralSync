# TODO: пользовательские коллекции и тайтлы

Пошаговый чеклист после добавления Payload-коллекций `user-collections`, `user-titles`, `user-collection-items`.

---

## Миграция поля `collection` → `userList`

В Mongoose pathname **`collection`** зарезервирован (предупреждение при старте). В коллекции **Элементы списков** связь со списком переименована в **`userList`**.

Если в MongoDB уже есть документы с полем `collection`, один раз в mongosh:

```js
db.getCollection('user-collection-items').updateMany(
  { collection: { $exists: true }, userList: { $exists: false } },
  [{ $set: { userList: '$collection' } }, { $unset: 'collection' }]
)
```

После этого перезапустить приложение и при необходимости `npx payload generate:types`.

---

## Сделано (инфраструктура)

- [x] **Коллекция `user-collections`** — списки пользователя (`userId` Better Auth, `name`, `isPublic`).
- [x] **Коллекция `user-titles`** — пользовательские тайтлы с `moderationStatus` и опциональной связью `promotedToCatalog` → `titles`.
- [x] **Коллекция `user-collection-items`** — элемент списка: `collection` → `user-collections`, `status`, опционально `catalogTitle` / `userTitle`, поля-снимок `displayTitle`, `coverUrl`, прогресс.
- [x] **Регистрация в `payload.config.ts`**, группа в админке **«Пользователи сайта»**.
- [x] **Access** — только при `req.user` (вход в Payload); запись с сайта планируется через `getPayload` + `overrideAccess: true`.

---

## Дальнейшие шаги (по порядку)

### 1. Генерация типов и проверка админки

- [ ] Запустить `npm run dev`, открыть `/admin`.
- [ ] Убедиться, что в сайдбаре появилась группа **«Пользователи сайта»** и три коллекции без ошибок.
- [ ] При необходимости сгенерировать типы: `npx payload generate:types` (или скрипт из `package.json`).

### 2. Индексы MongoDB (по желанию)

- [ ] Создать индекс `{ userId: 1 }` на `user-collections`, `user-titles`, `user-collection-items` (в Payload поля уже с `index: true` — проверить в БД после первого сохранения).
- [ ] Индекс `{ collection: 1, userId: 1 }` на `user-collection-items` для быстрых списков по коллекции.

### 3. Server Actions / API для сайта

- [x] **`server/collections/actions.ts`** — `listMyCollections`, `createCollection`, `addCollectionItem`, `listCollectionItems` с `requireUserId()` через `auth.api.getSession({ headers })` и `overrideAccess: true`.
- [x] **Хук `useServerCollections(enabled)`** — загрузка с сервера при авторизации; создание коллекции и элементов через экшены.
- [x] **`CollectionsContent`** — при сессии данные с сервера; при госте — прежний экран входа.

### 4. Миграция с localStorage

- [x] **`importFromLocalStorage(payloadJson)`** — Zod-схема, создание коллекций и элементов, маппинг старых id.
- [x] **Баннер «Импортировать»** на `/collections`, если в localStorage есть данные, а в аккаунте коллекций ещё нет; после импорта localStorage очищается.

### 5. Модерация пользовательских тайтлов

- [x] В коллекции **Пользовательские тайтлы** заданы `listSearchableFields` и `defaultSort` для удобного просмотра; фильтр по «На модерации» — через стандартный UI Payload (select).
- [ ] В админке фильтр по `moderationStatus === pending` (при необходимости — кастомный view).
- [ ] Процесс «одобрить»: создать документ в `titles` (постер обязателен — договориться: временный media или optional в каталоге), проставить `promotedToCatalog` в `user-titles`.
- [ ] Опционально: hook `afterChange` на `user-titles` при переходе в `approved`.

### 6. Документация

- [ ] Обновить `docs/ADMIN.md` — таблица коллекций и блок «Пользователи сайта».
- [ ] Обновить `docs/DB-TODO.md` п.5 — ссылка на эти коллекции как на выбранное хранилище списков.

### 7. Тесты и краевые случаи

- [ ] Удаление коллекции: каскад или запрет при наличии `user-collection-items` (сейчас без hooks — вручную или `beforeDelete`).
- [ ] Один элемент не может иметь одновременно конфликтующие ссылки — при необходимости hook `beforeValidate`.
- [ ] Публичные списки: при `isPublic === true` отдельный публичный read API с фильтром по id коллекции (без выдачи чужих данных).

---

## Context7 / Payload

- Access: только `req.user` для CRUD — соответствует рекомендации «админ или сервер с overrideAccess» из доки Payload 3 (collections access).
- При появлении ролей в `admin-users` — заменить на `user?.roles?.includes('admin')` для delete и т.д.

---

## Быстрая проверка вручную

1. `/admin` → **Коллекции пользователей** → Create → `userId`: тестовая строка, `name`: «Тест».
2. **Пользовательские тайтлы** → Create → тот же `userId`, `moderationStatus`: pending.
3. **Элементы списков** → Create → выбрать коллекцию, статус, при необходимости привязать catalogTitle или userTitle.

Если что-то падает — проверить `MONGODB_URI`, миграции Payload и логи сервера.
