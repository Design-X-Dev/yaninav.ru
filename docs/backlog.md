# Бэклог улучшений проекта yaninav.com

Сводка находок аудита кода и инфраструктуры репозитория. Документ предназначен для обсуждения с командой: по каждому пункту принимается решение (сделать сейчас / отложить / не делать) и обновляются поля **Статус** и **Решение команды**.

**Дата аудита:** 2026-04-30  
**Стек:** Next.js 15, React 19, Tailwind 4, Payload CMS v3 + SQLite (каталог), динамический рендер публичных страниц каталога через Local API.

---

## Легенда

### Статусы

| Статус | Смысл |
|--------|--------|
| **Open** | Не обсуждено / ждёт решения |
| **Discussion** | Обсуждается |
| **Decided** | Решение принято, работа не начата |
| **In Progress** | В работе |
| **Done** | Сделано или осознанно отклонено (с пояснением в «Решении») |

### Приоритеты

| Приоритет | Смысл |
|-----------|--------|
| **Critical** | Риск для бизнеса, безопасности, продакшена или сильное раздувание репо |
| **Important** | SEO, UX, репутация (шаринг, поисковики) |
| **Architecture** | Техдолг, проявится при росте или миграции (CMS, каталог) |
| **Nice-to-have** | Качество инженерной культуры, не блокирует релизы |

---

## Содержание

- [Критично](#критично)
  - [B-01](#b-01-изображения-оригиналы-в-repo-и-большой-объём-publicimages) — Изображения: оригиналы в repo и большой объём `public/images`
  - [B-02](#b-02-форма-обратной-связи-ничего-не-отправляет) — Форма обратной связи ничего не отправляет
  - [B-03](#b-03-главная-и-ещё-страницы-целиком-use-client) — Главная (и ещё страницы) целиком `'use client'`
- [Важно — SEO / UX](#важно--seo--ux)
  - [B-09](#b-09-нет-единого-ог-image--twitter-card-в-metadata) — Нет единого OG-image / Twitter card в metadata
  - [B-18](#b-18-внешние-уведомления-o-form-submissions-telegramsmtp) — Внешние уведомления о form-submissions (Telegram/SMTP)
- [Архитектура и техдолг](#архитектура--техдолг)
  - [B-10](#b-10-логика-категорий-else-if-по-подстрокам) — Логика категорий: `else if` по подстрокам
  - [B-20](#b-20-управление-блоком-воспоминания-через-payload) — Управление блоком «Воспоминания» через Payload
  - [B-21](#b-21-управление-hero-видео-через-payload) — Управление Hero-видео через Payload
- [Менее критично](#менее-критично)
  - [B-13](#b-13-нет-ci) — Нет CI
  - [B-14](#b-14-нет-тестов) — Нет тестов
  - [B-15](#b-15-readme-устарел-относительно-реальной-структуры) — README устарел относительно реальной структуры
  - [B-16](#b-16-зависимость-react-icons) — Зависимость `react-icons`
  - [B-17](#b-17-логирование-ошибок-видео-и-мониторинг) — Логирование ошибок видео и мониторинг
  - [B-19](#b-19-загрузка-файла-в-форме-обратной-связи) — Загрузка файла в форме обратной связи
- [История решений](#история-решений)

---

## Критично

### B-01. Изображения: оригиналы в repo и большой объём `public/images`

- **Статус:** Done — частично (рабочее дерево очищено, история git не переписана)
- **Приоритет:** Critical
- **Категория:** Performance / DX / Infra

**Что нашли:** В `public/images/products/` лежали пары файлов на товар — полноразмерные `DSC_*.jpg` (~10–15 МБ каждый) и версии `_small.jpg` (~80 КБ). В UI для превью использовались только `_small` (логика была в `src/utils/products.ts`, сейчас URL картинок отдаёт Payload / коллекция `media`).

Каталог перенесён в Payload: файлы превью живут в volume `data/media` (репозиторий не хранит ни JSON, ни `public/images/products/`).

**Почему это важно:** Долгое время CI/CD и деплоя, дорогий трафик, риск упереться в лимиты хостинга. История Git может сохранять блобы даже после удаления файлов — может понадобиться очистка истории (`git filter-repo` / BFG).

**Предлагаемый подход:**
- Вынести оригиналы из репозитория в объектное хранилище (S3‑совместимое) или хранить только локально у заказчика.
- Если оригиналы не нужны на сайте — удалить их из дерева файлов и при необходимости переписать историю.
- Для Retina: рассмотреть промежуточный размер (например `_medium`) вместо или вместе с `_small`, не светя 15 МБ на пользователя.

**Решение команды:**  
Оригиналы (`DSC_*.jpg`) удалены из рабочего дерева; превью исторически были в `public/images/products/` (~8.9 МБ). После внедрения Payload превью загружаются в коллекцию `media` (`data/media` на диске/volume). История git по-прежнему может содержать старые блобы — при необходимости `git filter-repo` / BFG. Оригиналы хранить отдельно (S3 / локально у заказчика).

---

### B-02. Форма обратной связи ничего не отправляет

- **Статус:** Done — частично (хранение в Payload; без внешних уведомлений и без файла — см. **B-18**, **B-19**)
- **Приоритет:** Critical
- **Категория:** Bug / Product

**Что нашли (аудит до 2026-04-30):** Отправка формы только сбрасывала состояние, данные никуда не уходили (см. старый код в [`Contact.tsx`](../src/components/Contact.tsx)).

**Почему это важно:** Пользователь считает, что сообщение отправлено; лиды теряются. Ранее в форме было поле прикрепления файла — **в текущей реализации главной убрано** (плагин Form Builder не поддерживает upload без отдельной доработки; возврат — **B-19**).

**Предлагаемый подход (частично сделано):**
- Встроенный Form Builder в Payload + записи в коллекции **`form-submissions`**; публичный `POST /api/form-submissions`.
- Внешние каналы (SMTP / Resend / Telegram) — **не настроены**, отдельный пункт **B-18**.
- Спам‑защита: honeypot, rate limit, Turnstile — на потом.

**Решение команды:**  
Подключён `@payloadcms/plugin-form-builder` ([`payload.config.ts`](../payload.config.ts)). Схема формы с slug `contact`: [`docs/contact-form-setup.md`](../docs/contact-form-setup.md), идемпотентное заполнение БД — **`npm run seed:contact-form`** (нужны `PAYLOAD_SECRET` и `DATABASE_URI`). Сервер: [`src/lib/forms.server.ts`](../src/lib/forms.server.ts) → [`Contact`](../src/components/Contact.tsx) → клиент [`ContactForm`](../src/components/ContactForm.tsx) (динамический рендер полей + согласие с политиками). Лиды смотреть в **`/admin/collections/form-submissions`**. Внешняя доставка — **B-18**; прикрепление файла к заявке — **B-19**.

---

### B-03. Главная (и ещё страницы) целиком `'use client'`

- **Статус:** Done (частично — см. **Что осталось на потом** ниже)
- **Приоритет:** Critical
- **Категория:** SEO / Performance / Architecture

**Что нашли (состояние на дату аудита, до 2026-04-30):** Корень приложения для главной был помечен как клиентский компонент (`'use client'` в [`src/app/page.tsx`](src/app/page.tsx)).

Аналогично: [`src/app/collection/page.tsx`](src/app/collection/page.tsx), [`src/app/favorites/page.tsx`](src/app/favorites/page.tsx) — вся страница была под `'use client'`.

**Почему это важно:** Меньше серверного HTML при первой отдаче, хуже для SEO‑ботов и LCP по сравнению с тем, когда статичный контент рендерится на сервере. Весь связанный граф может уезжать в клиентский бандл.

**Предлагаемый подход:**
- Оставить страницы **Server Components** по умолчанию.
- Вынести хуки (`useResponsiveCatalogLimit`, `useHashScroll`, фильтры с `useSearchParams`) в маленькие клиентские обёртки и обернуть ими только нужные участки.

**Исправлено (2026-04-30):**
- [`src/app/page.tsx`](src/app/page.tsx) — **Server Component**; `Header` и блок каталога в `<Suspense>` (из‑за `useSearchParams` в шапке и клиентского каталога). Логика `useResponsiveCatalogLimit` + `useHashScroll` перенесена в [`src/components/HomeCatalog.tsx`](src/components/HomeCatalog.tsx) (`'use client'`).
- [`src/app/collection/page.tsx`](src/app/collection/page.tsx) — **Server Component**; `Header` и `Catalog` в `<Suspense>`.
- [`src/app/favorites/page.tsx`](src/app/favorites/page.tsx) — **Server Component**; клиент только в [`FavoritesClient`](src/components/FavoritesClient.tsx) (чтение избранного из `localStorage` через `useFavoriteIds`).

**Что осталось на потом:**
- Полный перенос загрузки списка товаров на внешний fetch / CMS (сейчас данные пробрасываются с сервера из `products.server` через props — см. **История решений**, 2026-04-30: Payload + SQLite, **B-10**, **B-11**).
- Сейчас [`Catalog`](src/components/Catalog.tsx) по‑прежнему целиком клиентский (`usePathname`, `useRouter`, `useSearchParams` для `?category=`) — это осознанный компромисс минимального рефакторинга.

**Решение команды:**  
Минимальные правки по плану B-03: главная, `/collection`, `/favorites` — серверные страницы с клиентскими обёртками там, где нужны хуки; дальнейшая глубина RSC — после CMS.

---

## Важно — SEO / UX

### B-09. Нет единого OG-image / Twitter card в metadata

- **Статус:** Done
- **Приоритет:** Important
- **Категория:** SEO / Marketing

**Что нашли:** В [`src/app/layout.tsx`](src/app/layout.tsx) в блоке `openGraph` есть только `title`, `description`, `type`, `locale` — нет `images`, нет `twitter`.

```24:34:src/app/layout.tsx
export const metadata: Metadata = {
  title: "ЯНИНА В - Ювелирная студия | Эксклюзивные украшения",
  description: "Ювелирная студия ЯНИНА В - помолвочные и обручальные кольца, эксклюзивные украшения ручной работы. Индивидуальный подход к каждому клиенту.",
  keywords: "ювелирная студия, помолвочные кольца, обручальные кольца, эксклюзивные украшения, ювелирные изделия на заказ",
  openGraph: {
    title: "ЯНИНА В - Ювелирная студия",
    description: "Эксклюзивные украшения ручной работы",
    type: "website",
    locale: "ru_RU",
  },
};
```

**Почему это важно:** Ссылки на главную в мессенджерах показывают превью без фирменного изображения; для luxury-бренда это заметный минус.

**Предлагаемый подход:**
- Завести одно качественное изображение (1200×630) для главной OG + заполнить `twitter: { card, title, description, images }`.
- На странице товара `generateMetadata` реализован (см. **История решений**, 2026-05-01: B-06, B-07).

**Решение команды:**  
На странице товара и при `?category=` на каталоге в `generateMetadata` заданы `openGraph.images` и `twitter` (`summary_large_image` при наличии картинки) из `meta.image` плагина SEO с резолвом URL медиа, иначе — основное изображение товара / без превью для списков. [`src/app/(site)/layout.tsx`](../src/app/(site)/layout.tsx): `metadataBase: new URL(NEXT_PUBLIC_SITE_URL)` для корректных абсолютных OG URL.

---

### B-18. Внешние уведомления о form-submissions (Telegram/SMTP)

- **Статус:** Open
- **Приоритет:** Important
- **Категория:** Product / Ops

**Что:** Заявки с главной попадают в коллекцию **`form-submissions`**, но владельцу **не отправляются** ни письма, ни пуш — только просмотр в `/admin`. В плагине Form Builder возможны email-rules в документе формы и/или конфиг **`payload.email` + SMTP**, либо кастомный хук **`afterChange`** по `form-submissions` для вызова Telegram Bot API или Resend.

**Почему важно:** Без канала уведомлений лиды остаются невидимыми до ручной проверки админки.

**Предлагаемый подход:**
- минимально: Telegram-бот (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` в [.env.example](../.env.example)) из хука;
- альтернатива: Resend/Brevo/SMTP через `payload.config` `email` + шаблоны формы.

**Решение команды:**  
Отложено; связано с частичным закрытием **B-02**. Плейсхолдеры env обновлены под будущую интеграцию.

---

## Архитектура — техдолг

### B-10. Логика категорий: `else if` по подстрокам

- **Статус:** Done
- **Приоритет:** Architecture
- **Категория:** Maintainability

**Что нашли (исторически):** Фильтрация по категории опиралась на эвристики по подстрокам и легаси‑английские slug’и.

**Почему это важно:** Любая правка текста категории в данных могла сломать фильтр; сложно тестировать и расширять.

**Предлагаемый подход:**
- При миграции на CMS: поле «категория» как enum / relation + явный `slug` на товаре.
- До миграции: сузить маппинг до явной таблицы `categoryName → navSlug` без «включает подстроку» где возможно.

**Решение команды:**  
Серверная фильтрация в [`src/lib/products.server.ts`](src/lib/products.server.ts): `getProductsByCategory(slug)` использует Payload `where` по `category.slug` (relation, `depth`). Клиентский [`Catalog`](src/components/Catalog.tsx) фильтрует переданный с сервера массив тем же правилом по slug. Категории в админке имеют явные поля `slug` и `order` (порядок в навигации). Для маршрута `/collection` slug из query по-прежнему читается на клиенте (`useSearchParams`).

---

### B-20. Управление блоком «Воспоминания» через Payload

- **Статус:** Done
- **Приоритет:** Important
- **Категория:** Content / CMS

**Что было:** Заголовки и слайды блока «Воспоминания» захардкожены в [`src/components/MemoriesSection.tsx`](src/components/MemoriesSection.tsx), картинки — из `public/images/00*.jpeg`; тяжёлые файлы и `next/image` давали проблемы с оптимизатором.

**Решение команды:**  
Глобал [`memories`](../src/payload/globals/Memories.ts): тексты полей `heading`, `subheading`, `description`, массив `slides` (upload → `media` + подпись), минимум 5 элементов карусели. Редактор: **`/admin/globals/memories`**. Данные на главной: [`getMemoriesContent`](../src/lib/memories.server.ts) в [`(site)/page.tsx`](../src/app/(site)/page.tsx) → props в [`MemoriesSection`](../src/components/MemoriesSection.tsx); URL через `sizes.card` и `/_next/image`. Идемпотентный первичный контент из `public/images/`: **`npm run seed:memories`**; при первом запуске без данных — попытка в `onInit` ([`memoriesBootstrap`](../src/payload/seeds/memoriesBootstrap.ts)) без перезаписи существующих слайдов.

---

### B-21. Управление Hero-видео через Payload

- **Статус:** Done
- **Приоритет:** Architecture
- **Категория:** Content / CMS

**Что было:** Полноэкранное Hero-видео и постер зашиты в [`Hero.tsx`](../src/components/Hero.tsx) (`/videos/jewelry-hero.*`).

**Решение команды:**  
Коллекция **`media-video`** ([`MediaVideo.ts`](../src/payload/collections/MediaVideo.ts), `data/media-video`), глобал **`hero`** ([`globals/Hero.ts`](../src/payload/globals/Hero.ts)): флаг **`enabled`** (скрыть секцию без удаления медиа), `overlayText`, постер в `media`, обязательный `videoMp4`, опционально `videoWebm`. Редактор: **`/admin/globals/hero`**. Главная: [`getHeroContent`](../src/lib/hero.server.ts) → props в [`Hero`](../src/components/Hero.tsx); при `enabled === false` или отсутствии постера/источников секция не рендерится. Первичное наполнение из `public/videos/`: **`npm run seed:hero`**, в `onInit` — [`seedHeroIfMissing`](../src/payload/seeds/heroBootstrap.ts) без перезаписи при уже заданных постере и mp4. Long-cache заголовки для отдачи видеофайлов через API: [`next.config.ts`](../next.config.ts) — `/api/media-video/file/:path*`.

---

## Менее критично

### B-13. Нет CI

- **Статус:** Open
- **Приоритет:** Nice-to-have
- **Категория:** DX

**Что нашли:** Нет workflow’ов в `.github/workflows/` (или аналога) для `npm ci` + `npm run lint` + `npm run build` на PR.

**Почему это важно:** Регрессии ловятся поздно.

**Предлагаемый подход:** Минимальный GitHub Actions job на `push`/`pull_request`.

**Решение команды:**  
_(заполнить после обсуждения)_

---

### B-14. Нет тестов

- **Статус:** Open
- **Приоритет:** Nice-to-have
- **Категория:** DX

**Что нашли:** В репозитории нет unit/e2e тестов.

**Почему это важно:** При рефакторинге каталога и форм легко сломать критичные сценарии.

**Предлагаемый подход:** 1–3 e2e (Playwright): главная, карточка товара, отправка формы после реализации B-02.

**Решение команды:**  
_(заполнить после обсуждения)_

---

### B-15. README устарел относительно реальной структуры

- **Статус:** Open
- **Приоритет:** Nice-to-have
- **Категория:** DX

**Что нашли:** [`README.md`](README.md) описывает упрощённую картину (например, добавление товаров через правку компонента), тогда как каталог сейчас в **Payload** (`/admin`), есть Docker, скрипты в `scripts/`, страницы `/collection`, `/products/[id]` и др.

**Почему это важно:** Ожидания новых участников не совпадают с кодом.

**Предлагаемый подход:** Обновить разделы «Структура», «Данные», «Docker», «Скрипты»; опционально ссылка на этот `docs/backlog.md`.

**Решение команды:**  
_(заполнить после обсуждения)_

---

### B-16. Зависимость `react-icons`

- **Статус:** Open
- **Приоритет:** Nice-to-have
- **Категория:** Performance / Bundle

**Что нашли:** Пакет [`react-icons`](package.json) используется для соцсетей в [`src/utils/social.ts`](src/utils/social.ts); tree-shaking Next обычно спасает от полного набора иконок, но `node_modules` остаются тяжёлыми.

**Почему это важно:** При желании максимально облегчить зависимости — замена на несколько SVG.

**Предлагаемый подход:** Оставить как есть или заменить 4 иконки на локальные SVG — по ощущениям от размера бандла после `next build` анализом.

**Решение команды:**  
_(заполнить после обсуждения)_

---

### B-17. Логирование ошибок видео и мониторинг

- **Статус:** Open
- **Приоритет:** Nice-to-have
- **Категория:** Observability

**Что нашли:** В [`src/components/Hero.tsx`](src/components/Hero.tsx) ошибка воспроизведения видео логируется только в режиме разработки; в production вызов `play()` ошибки иглотируются без отправки на сервер:

```14:19:src/components/Hero.tsx
const tryPlay = () => {
  if (process.env.NODE_ENV === 'development') {
    video.play().catch((err) => console.warn('[Hero] video.play():', err));
  } else {
    video.play().catch(() => {});
  }
};
```

**Почему это важно:** На проде проблемы автовоспроизведения (политики браузера, форматы кодеков, сеть к `/videos`) не попадают ни в метрики, ни в алерты.

**Предлагаемый подход:** При появлении мониторинга (Sentry / LogRocket / собственный endpoint) — редко, но осмысленно логировать неуспех `play()` с контекстом (user agent, readyState), без спама.

**Решение команды:**  
_(заполнить после обсуждения)_

---

### B-19. Загрузка файла в форме обратной связи

- **Статус:** Open
- **Приоритет:** Nice-to-have
- **Категория:** Product / UX

**Что:** В старой вёрстке [`Contact.tsx`](../src/components/Contact.tsx) было поле «Прикрепить файл». При переходе на `@payloadcms/plugin-form-builder` оно **намеренно убрано**: нативного upload-блока в связке «публичный сабмит → form-submissions» без доработки нет (либо включаются `fields.upload` + `uploadCollections` + `submissionUploads`, либо отдельный `POST` в коллекцию `media`, затем в `submissionData` сохранять URL/`id`).

**Решение команды:**  
Вернуть в отдельной итерации: предзагрузка в `media` + ссылка в заявке, лимиты размера и MIME, возможно связка с **B-18** (оповещение с вложением). См. также [docs/contact-form-setup.md](../docs/contact-form-setup.md).

---

## История решений

| Дата | Пункт | Решение |
|------|--------|---------|
| 2026-04-30 | B-03 | Done — частично: [`src/app/(site)/page.tsx`](../src/app/(site)/page.tsx) и [`src/app/(site)/collection/page.tsx`](../src/app/(site)/collection/page.tsx) переведены в Server Components, клиентские хуки главной вынесены в [`src/components/HomeCatalog.tsx`](../src/components/HomeCatalog.tsx). Подробности и «что на потом» — в теле B-03. |
| 2026-04-30 | Payload + SQLite | Done: каталог и медиа в Payload v3 (`@payloadcms/db-sqlite`), файлы БД/медиа в `data/`, публичные страницы каталога с `dynamic = 'force-dynamic'`, импорт из JSON — `npm run migrate:payload` (bundle esbuild + `node`). Postgres — отложен до лимитов SQLite. |
| 2026-04-30 | B-10, B-11 | Done: `products.server` + данные через RSC/props; фильтр по slug без легаси-веток; категория в URL на `/collection` синхронизируется на клиенте. По серверной фильтрации — блок **B-10** ниже. |
| 2026-04-30 | B-01 | Done — частично: оригиналы `DSC_*.jpg` удалены из рабочего дерева; превью ранее жили в `public/images/products/` (~8.9 МБ `_small`), затем каталог перенесён в Payload (`data/media`). История git не переписана — блобы остаются. |
| 2026-04-30 | B-05 | Done — добавлен файл `public/images/placeholder.jpg` (≈ 3.9 КБ); fallback`ы из кода теперь резолвятся. |
| 2026-04-30 | B-12 | Done — добавлен [`.env.example`](../.env.example): `NEXT_PUBLIC_SITE_URL`, SMTP, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (для будущего **B-18**), S3, `PAYLOAD_SECRET`, `DATABASE_URI`. |
| 2026-05-01 | B-06, B-07, B-09 | Done: `@payloadcms/plugin-seo` на товары и категории; `generateMetadata` на товаре и каталоге (`?category=`); [`sitemap.ts`](../src/app/sitemap.ts), [`robots.ts`](../src/app/robots.ts), OG/Twitter через `meta` + `metadataBase` в `(site)/layout`. |
| 2026-05-01 | B-02 (часть 1), B-18, B-19 | Частично **B-02**: `@payloadcms/plugin-form-builder`, сабмиты в **`form-submissions`**, главная через [`forms.server`](../src/lib/forms.server.ts) + [`ContactForm`](../src/components/ContactForm.tsx), док [`contact-form-setup.md`](../docs/contact-form-setup.md), **`npm run seed:contact-form`**. Поле файла убрано → **Open B-19**. Внешние уведомления (Telegram/SMTP) не делали → **Open B-18**. |
| 2026-05-02 | B-04, B-08 | Done: [`next.config.ts`](../next.config.ts) — убран `/:path*` с годовым immutable; long-cache для `/_next/static`, `/images`, `/videos`; включена оптимизация `next/image` (AVIF/WebP, `deviceSizes`/`imageSizes`); `sizes` на слайдах Memories. |
| 2026-05-02 | B-20 | Done: глобал **`memories`** ([`payload.config.ts`](../payload.config.ts), [`globals/Memories.ts`](../src/payload/globals/Memories.ts)), загрузка [`getMemoriesContent`](../src/lib/memories.server.ts) на главной и [`MemoriesSection`](../src/components/MemoriesSection.tsx); первичное наполнение **`npm run seed:memories`**, авто‑сид в `onInit` без перезаписи уже заполненного. |
| 2026-05-02 | B-21 | Done: коллекция **`media-video`**, глобал **`hero`**, [`getHeroContent`](../src/lib/hero.server.ts) + CMS-driven [`Hero`](../src/components/Hero.tsx); **`npm run seed:hero`**, [`seedHeroIfMissing`](../src/payload/seeds/heroBootstrap.ts) в `onInit`; long-cache в [`next.config.ts`](../next.config.ts) для `/api/media-video/file/:path*`. |
| — | — | _(заполняется по мере обсуждения)_ |
