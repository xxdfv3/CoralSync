# Авторизация CoralSync: модалки, единый UI и intercepting routes

Документ фиксирует всё, что сделано вокруг входа/регистрации: от выравнивания тем до модалки поверх сайта и перехвата маршрутов (как на «нормальных» сайтах).

---

## 1. Проблема в начале

- **Разные темы**: страница регистрации имела инлайн-фон `#F2F2F2` и кнопку `#E93C47`, страница входа — только токены темы → визуально разный фон и кнопки.
- **Не «поверх сайта»**: переход на `/sign-in` / `/sign-up` подменял всю страницу, а не показывал форму оверлеем поверх текущего контента.

---

## 2. Единый профессиональный UI (без инлайн-цветов)

### 2.1 Общие константы

| Файл | Назначение |
|------|------------|
| `src/features/auth/ui/auth-constants.ts` | `AUTH_CARD_LINK_CLASS` — стиль ссылок «Войти» / «Зарегистрироваться`; `AUTH_CARD_CLASS` — одна карточка (тень, бордер, лёгкая анимация появления, `motion-reduce`). |

### 2.2 Оболочка на Radix Dialog

| Файл | Назначение |
|------|------------|
| `src/features/auth/ui/auth-shell.tsx` | Модальная оболочка: **фокус-ловушка**, **Escape**, клик по фону закрывает; оверлей с **backdrop-blur** и токенами (`bg-background/85`, `dark:bg-black/75`). Закрытие: `router.back()` при наличии истории, иначе `router.replace(callbackURL)`. |

### 2.3 Расширение `DialogContent`

| Файл | Изменение |
|------|-----------|
| `src/shared/ui/dialog.tsx` | У `DialogContent` добавлен опциональный проп **`overlayClassName`** — auth (и при необходимости другие экраны) задают blur/фон, не трогая остальные диалоги. |

### 2.4 Поле пароля с видимостью

| Файл | Назначение |
|------|------------|
| `src/features/auth/ui/password-input.tsx` | Переключатель «глаз»; `aria-label`, `aria-pressed`, `aria-controls`; кнопка с `tabIndex={-1}` чтобы не ломать таб-порядок. |

### 2.5 Ошибка API в форме

| Файл | Назначение |
|------|------------|
| `src/features/auth/ui/form-root-error.tsx` | Если `setError("root", …)` — показывается `Alert` destructive с иконкой (дополнительно к toast). |

### 2.6 Страницы и fallback загрузки

| Файл | Назначение |
|------|------------|
| `app/(auth)/loading.tsx` | SSR-фолбэк при заходе на auth-роуты (CSS-спиннер без лишнего клиентского бандла). |

### 2.7 Поведение форм

- **`noValidate`** — валидация только через Zod + react-hook-form.
- Перед сабмитом **`clearErrors("root")`** — старая общая ошибка не залипает.
- Ссылки между входом и регистрацией с **`prefetch`**.
- **`callbackURL`** в query по-прежнему поддерживается (middleware редиректы после логина).

---

## 3. Intercepting routes + слот `@modal` (отключено)

> **Статус:** слот `@modal` и intercepting routes **удалены** из проекта: в Next.js 15.4 при их использовании в связке с client root (`ConditionalRootDocument`) воспроизводился runtime error `initialTree` undefined. Вход/регистрация по-прежнему доступны как полные страницы с `AuthShell` (модалка на весь экран). При появлении стабильной поддержки в Next можно снова ввести intercepting по гайдам ниже.

### 3.0 Как было устроено (архив)

Цель: при **клике по ссылке** с любой страницы приложения на `/sign-in` или `/sign-up` форма открывается **поверх текущей страницы** (предыдущий контент остаётся под затемнением). При **прямом открытии URL** или **обновлении страницы** отдаётся полноценная страница auth (как раньше).

### 3.1 Параллельный слот

| Файл | Назначение |
|------|------------|
| `app/@modal/default.tsx` | По умолчанию слот пустой (`null`). |
| `app/layout.tsx` | Принимает проп **`modal`** и передаёт в `ConditionalRootDocument`. |
| `app/ConditionalRootDocument.tsx` | В `body` после `{children}` рендерится **`{modal}`** (кроме `/admin*`, где по-прежнему только children). |

### 3.2 Intercepting routes

| Файл | Назначение |
|------|------------|
| `app/@modal/(.)sign-in/page.tsx` | Перехват **client navigation** на `/sign-in` — рендерится тот же UI входа, но слот `modal` монтируется поверх не сменившегося `children`. |
| `app/@modal/(.)sign-up/page.tsx` | То же для `/sign-up`. |

Сегмент `(.)` — перехват на том же уровне URL-сегмента `sign-in` / `sign-up` (группа `(auth)` в URL не участвует).

### 3.3 Один UI в двух местах

Чтобы не дублировать логику:

| Файл | Назначение |
|------|------------|
| `src/features/auth/ui/sign-in-view.tsx` | Полный клиентский UI входа (`SignInView`) — и для полной страницы, и для intercept. |
| `src/features/auth/ui/sign-up-view.tsx` | Полный UI регистрации (`SignUpView`). |
| `app/(auth)/sign-in/page.tsx` | Тонкая обёртка: `Suspense` + `<SignInView />` (нужен Suspense из‑за `useSearchParams`). |
| `app/(auth)/sign-up/page.tsx` | Аналогично. |

Полная страница по прямому URL по-прежнему `(auth)/sign-in` / `(auth)/sign-up`; intercept только подменяет содержимое слота `modal`, не удаляя предыдущую страницу из дерева.

### 3.4 Что не менялось

- **Middleware** (`middleware.ts`) — по-прежнему редирект на `/sign-in` с `callbackURL` для защищённых роутов.
- **Ссылки** в Header / HomePage / Collections — остаются `href="/sign-in"` и `href="/sign-up"`; Next сам решает, отдать intercept или полную страницу.

---

## 4. Структура файлов (сводка)

```
app/
  layout.tsx                          # children + modal
  ConditionalRootDocument.tsx         # body: children, modal, Toaster
  @modal/
    default.tsx
    (.)sign-in/page.tsx               # intercept
    (.)sign-up/page.tsx               # intercept
  (auth)/
    layout.tsx                        # metadata auth
    loading.tsx
    sign-in/page.tsx                  # Suspense + SignInView
    sign-up/page.tsx                  # Suspense + SignUpView

src/features/auth/
  index.ts                            # реэкспорты
  ui/
    auth-shell.tsx
    auth-constants.ts
    password-input.tsx
    form-root-error.tsx
    sign-in-view.tsx
    sign-up-view.tsx

src/shared/ui/dialog.tsx              # overlayClassName на DialogContent
```

---

## 5. Известные ограничения

- **Сборка** может падать на ESLint в `Header.tsx` (`setState` в `effect`) — к auth не относится; после правки хедера `next build` проходит (компиляция auth уже успешна).
- **Прямой заход** на `/sign-in` без истории — под модалкой нет «предыдущей страницы», только фон документа; это ожидаемо.

---

## 6. Как проверить вручную

1. Открыть главную → «Войти» — форма должна появиться **поверх** главной (URL `/sign-in`, контент под blur).
2. Закрыть крестиком или фоном — должен вернуться предыдущий экран (back).
3. Открыть в новой вкладке `.../sign-in` — полноценная страница без «подложки» с предыдущей страницы.
4. Обновить страницу на `/sign-in` — снова полная страница (не intercept).

---

*Документ можно дополнять по мере изменения auth (OAuth, reset password и т.д.).*
