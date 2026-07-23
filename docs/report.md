# Аудит проекта yaninav.com — отчёт о проблемах

**Дата аудита:** 2026-05-21
**Стек:** Next.js 15.3.9 (App Router) + React 19 + Tailwind 4 + Payload CMS v3.84.1 + SQLite (libsql/turso-совместимый адаптер) + Docker.
**Контекст:** проект уже имеет внутренний бэклог [`docs/backlog.md`](backlog.md) — данный отчёт его дополняет, перепроверяет «зелёные» пункты и фиксирует найденное вне покрытия (особенно UI/UX и a11y, которым в бэклоге уделено мало места).

> Отчёт намеренно критический: задача — найти максимум слабых мест, а не похвалить проект. По каждому пункту указан приоритет и конкретный файл/строка. Те же находки, что уже зафиксированы в `backlog.md`, помечены ссылкой `B-XX`.

---

## Содержание

1. [Безопасность](#1-безопасность)
2. [Архитектура и качество кода](#2-архитектура-и-качество-кода)
3. [UI/UX — функциональные дефекты](#3-uiux--функциональные-дефекты)
4. [Доступность (a11y)](#4-доступность-a11y)
5. [Производительность](#5-производительность)
6. [SEO и индексация](#6-seo-и-индексация)
7. [Контент и данные](#7-контент-и-данные)
8. [DevOps / Infra](#8-devops--infra)
9. [Документация и DX](#9-документация-и-dx)
10. [Сводная таблица приоритетов](#10-сводная-таблица-приоритетов)

---

## 1. Безопасность

### 1.1. **Critical** — Открытая регистрация админов через REST API

[`src/payload/collections/Users.ts`](../src/payload/collections/Users.ts):

```19:22:src/payload/collections/Users.ts
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
  },
```

`access.create: () => true` означает, что любой неаутентифицированный клиент может постом на `/api/users` создать **второго (третьего, тысячного) админа** — поле `role` имеет дефолт `admin`, то есть новый пользователь сразу получает полный доступ к `/admin`. Это прямая дыра в production.

Кроме того, `access.update` и `access.delete` не заданы, и Payload по дефолту разрешает их аутентифицированным пользователям — но первая публичная регистрация уже обходит этот защитный слой.

**Связано с B-24** (там это лишь упомянуто).

**Что делать:** закрыть `users.create` для unauthenticated; bootstrap первого админа делать либо через `payload create-first-user`, либо отдельным сидером с `overrideAccess`. Явно прописать `update` и `delete`. Удалить дефолт `role: admin` или ввести промежуточный `role: editor`.

---

### 1.2. **Critical** — Слабый fallback `PAYLOAD_SECRET`

[`payload.config.ts`](../payload.config.ts):

```216:216:payload.config.ts
  secret: process.env.PAYLOAD_SECRET || 'dev-local-payload-secret-change-me',
```

В production `PAYLOAD_SECRET` используется для подписи JWT/cookies. Если переменную забудут — сервер запустится со **известным всему миру** секретом из исходников git. JWT админа можно будет подделать.

Та же проблема в [`docker-compose.yml`](../docker-compose.yml) (строка 11): `${PAYLOAD_SECRET:-change-me-local-dev-secret}` — этот compose даже технически непригоден для prod, но новички часто запускают именно его.

**Что делать:** в `payload.config.ts` падать при `NODE_ENV === 'production' && !process.env.PAYLOAD_SECRET`. В docker compose dev — оставить fallback, но добавить большой комментарий «не для prod». Bookmark: B-24.

---

### 1.3. **Critical** — Публичный `POST /api/form-submissions` без анти-спама

[`payload.config.ts`](../payload.config.ts) формирует publish-friendly настройку:

```196:202:payload.config.ts
        access: {
          create: () => true,
          read: ({ req: { user } }) => Boolean(user),
          update: () => false,
          delete: ({ req: { user } }) => Boolean(user),
        },
```

[`src/components/ContactForm.tsx`](../src/components/ContactForm.tsx) шлёт `POST /api/form-submissions` напрямую с фронта без:

- honeypot-поля,
- rate limiting (по IP / cookie / fingerprint),
- CAPTCHA / Turnstile,
- проверки `Origin` / `Referer`,
- подписанного токена формы.

Любой бот может за минуту нагенерить тысячи заявок → раздувание `data/payload.db`, спам в админке, риск исчерпания диска.

**B-24** упоминает это, но решение не запланировано. Учитывая, что форма — единственный способ собирать лиды, считаю **критичным** до публичного запуска.

**Что делать:** минимально — honeypot + проверка Origin + cooldown по IP в middleware. Дополнительно — Turnstile/hCaptcha.

---

### 1.4. **Critical** — Открытый GraphQL Playground в production

[`src/app/(payload)/api/graphql-playground/route.ts`](../src/app/(payload)/api/graphql-playground/route.ts) — экспортирует `GET = GRAPHQL_PLAYGROUND_GET(config)`. Этот endpoint бережёт интерактивный playground (схема + introspection) на публичном URL.

Через GraphQL и REST (`src/app/(payload)/api/[...slug]/route.ts`) можно:

- выгрузить полный каталог (`products`) и категории через пагинацию,
- увидеть конфигурацию форм (slug, поля),
- поглазеть на media-объекты с URL.

Поскольку у `Products`, `Categories`, `Image`, `Video`, `Pages` стоит `read: () => true`, **API surface ≈ полный сайт без UI**, плюс лишняя информация о структуре БД.

**B-24** перечисляет это; решение не выбрано.

**Что делать:** в production отключать `graphql-playground` (route с условием на `NODE_ENV`), отключить introspection в `formBuilderPlugin` / GraphQL config, ограничить `select` поля для публичного чтения.

---

### 1.5. **High** — Нет ретеншна и экспорта PII из `form-submissions`

В заявках хранятся имя, email, телефон, текст сообщения. В проекте нет:

- срока хранения / автоматической очистки,
- инструмента экспорта/удаления по запросу субъекта (152-ФЗ / GDPR),
- описания, попадает ли БД в backup и где он живёт.

Согласие пользователя на политику собирается ([`ContactForm.tsx:287-309`](../src/components/ContactForm.tsx)), но **сама политика — это просто страница `/privacy`**, и нет логирования факта согласия (timestamp, IP, версия документа).

**Что делать:** добавить поле `consentAcceptedAt` и `consentVersion` в `submissionData`, описать ретеншн в `docs/`, реализовать команду удаления заявок старше N дней.

---

### 1.6. **High** — Содержимое `data/` (БД и медиа) пишется в общий volume без явного backup

[`docker-compose.prod.yml`](../docker-compose.prod.yml) монтирует `./data:/app/data`, но:

- нет sidecar-сервиса для бэкапа `payload.db` (sqlite WAL может «забыть» свежие записи при некорректном завершении),
- `data/image/*` / `data/video/*` — единственная копия медиа,
- нет healthcheck / `restart: on-failure` с лимитом попыток.

При падении хоста существует реальный риск потерять и БД, и медиа одновременно. **B-28** в бэклоге, статус Open.

**Что делать:** litestream / regular `sqlite3 .backup` cron, и/или подключить S3 для медиа.

---

### 1.7. **Medium** — Произвольный SVG в `LegalFooterDivider`/иконках, но `dangerouslySetInnerHTML` не применяется — OK, но...

В [`Pages`](../src/payload/collections/Pages.ts) поле `body` — `richText` (Lexical), и оно рендерится через `@payloadcms/richtext-lexical/react` ([`[slug]/page.tsx`](../src/app/(site)/[slug]/page.tsx)). Lexical экранирует контент, **но** редактор Payload по умолчанию позволяет вставку `<a href>` без проверки `javascript:` / `data:` URL. Если редактор по ошибке (или злонамеренно) вставит `javascript:alert(…)` — запустится при клике.

**Что делать:** в `lexicalEditor` сконфигурировать `LinkFeature` со списком разрешённых протоколов (`http`, `https`, `mailto`, `tel`).

---

### 1.8. **Medium** — `overrideAccess: true` повсеместно в server-loader'ах

Почти все серверные библиотеки ([`pages.server.ts`](../src/lib/pages.server.ts), [`hero.server.ts`](../src/lib/hero.server.ts), [`memories.server.ts`](../src/lib/memories.server.ts), [`contact.server.ts`](../src/lib/contact.server.ts), …) делают запросы к Payload с `overrideAccess: true`. Само по себе это нормально для SSR, но:

1. ~~У `Pages` включены drafts, но в `getPageBySlug` нет фильтра `_status`~~ **Исправлено (2026-07-24):** `getPageBySlug` фильтрует `_status: published`; `Pages.access.read` для анонимов — только published. **B-25** (часть drafts).
2. Любая случайная утечка вызова `getPageBySlug` в ответ публичного API даст обход защиты — mitigируется фильтром `_status` даже при `overrideAccess: true`.

**Что делать:** ~~явно `where: { _status: { equals: 'published' } }`~~ сделано. Обернуть `overrideAccess: true` в утилиту с комментарием «only for SSR» — опционально.

---

### 1.9. **Medium** — Нет CSP / security headers

В [`next.config.ts`](../next.config.ts) задан только `Cache-Control`. Не настроены:

- `Content-Security-Policy` (нет даже базового `default-src 'self'`),
- `Strict-Transport-Security`,
- `X-Frame-Options` / `frame-ancestors`,
- `Referrer-Policy`,
- `Permissions-Policy` (камера/гео/микрофон не нужны → запретить).

CSP особенно важен из-за inline-стилей через `style={{...}}` (см. раздел 2.4) — нужен `style-src 'self' 'unsafe-inline'` или nonce.

---

### 1.10. **Low** — `react-icons` тянет иконки ВКонтакте/Pinterest/Telegram/Instagram в публичный бандл

Не уязвимость, но: пакет `react-icons` лежит в `dependencies` вместе с **полной палитрой** `Lu*` иконок (см. [`About.tsx`](../src/components/About.tsx) — импорт 25+ иконок ради 6 карточек). Tree-shaking в Next работает, но любая ошибка в `swcMinify` или `experimental.optimizePackageImports` вернёт лишние ~200 КБ. **B-16** в бэклоге.


---

## 2. Архитектура и качество кода

### 2.1. **High** — Все публичные страницы `force-dynamic`, нет стратегии кэша

Помечены `export const dynamic = 'force-dynamic'`:

- [`src/app/(site)/page.tsx`](../src/app/(site)/page.tsx)
- [`src/app/(site)/collection/page.tsx`](../src/app/(site)/collection/page.tsx)
- [`src/app/(site)/products/[id]/page.tsx`](../src/app/(site)/products/[id]/page.tsx)
- [`src/app/(site)/favorites/page.tsx`](../src/app/(site)/favorites/page.tsx)
- [`src/app/(site)/[slug]/page.tsx`](../src/app/(site)/[slug]/page.tsx)
- [`src/app/sitemap.ts`](../src/app/sitemap.ts)

При каждом запросе SSR ходит в SQLite через Local API, дёргает плагины SEO, лексикал и т.д. На пустом каталоге это незаметно, но:

- `getAllProducts()` грузит **300 товаров с `depth: 2`** на каждый запрос главной, каталога, `/products/[id]` и `/favorites`.
- На странице товара `getAllProducts()` вызывается ради `relatedProducts.slice(0, 3)` — то есть **полный каталог тянется ради трёх карточек** (см. [`products/[id]/page.tsx:66-76`](../src/app/(site)/products/[id]/page.tsx)).
- Sitemap пересобирается на каждый запрос Googlebot.

**B-30** + **B-27** в бэклоге.

**Что делать:** `revalidate: 60` (минимум) для главной/каталога/sitemap, `unstable_cache` с тегами на product loaders, инвалидация в `afterChange`-хуках Payload. Related products — отдельным запросом `where: { category: { equals }, id: { not_equals } }, limit: 3`.

---

### 2.2. **High** — В `Product.category` лежит **название**, а UI фильтрует по slug

[`src/lib/products.server.ts:71-98`](../src/lib/products.server.ts):

```81:81:src/lib/products.server.ts
    category: cat?.name ?? '',
```

[`src/components/Catalog.tsx:223`](../src/components/Catalog.tsx):

```222:223:src/components/Catalog.tsx
        : products.filter((p) => Boolean(p.category) && getCategorySlug(p.category) === activeCategory);
```

`getCategorySlug` ([`src/utils/products.ts:38`](../src/utils/products.ts)) — это `name.toLowerCase().replace(/\s+/g, '-')`. Если редактор задаст в Payload slug, не равный `slugify(name)` (например, англ. слаг для русского имени, или просто иное имя), **сервер вернёт правильную выборку, а клиент покажет пустоту**, потому что URL содержит реальный slug, а карточки — производный от названия.

При смене языка/локали или малейшем расхождении категория «Кольца с бриллиантом» исчезает из UI без ошибки.

**B-27** в бэклоге, статус Open.

**Что делать:** в `Product` (UI-тип) добавить `categorySlug`, заполнять его из `cat.slug`. В клиентском фильтре сравнивать по `categorySlug`, а не по производному.

---

### 2.3. **High** — Хардкод-лимиты `limit: 300` / `limit: 100`

`getAllProducts`, `getProductsByCategory`: `limit: 300`. `getAllCategories`/`getCategoriesForNav`: `limit: 100`. Без `pagination` параметра.

При росте каталога (а смысл в Payload + миграциях именно в росте) лишние товары **молча выпадут из выдачи и из sitemap**. Никаких предупреждений пользователю / в логи.

**B-27**.

**Что делать:** либо реальная пагинация (page/hasNextPage), либо документировать лимит и логировать `if (totalDocs > limit)`.

---

### 2.4. **High** — Стилизация через inline-`style={{ … }}` повсеместно

Почти все цветовые решения сделаны inline:

- [`Catalog.tsx`](../src/components/Catalog.tsx) — `style={{ backgroundColor, borderColor, color }}` на каждом `Link`/`button`,
- [`Header.tsx`](../src/components/Header.tsx) — три `CSSProperties`-объекта, `style={{ background: linear-gradient(...) }}` с `color-mix`,
- [`Contact.tsx`](../src/components/Contact.tsx), [`Hero.tsx`](../src/components/Hero.tsx), [`MemoriesSection.tsx`](../src/components/MemoriesSection.tsx), [`ProductDetailsClient.tsx`](../src/components/ProductDetailsClient.tsx) и т.д.

Проблемы:

1. **CSP**: при включении строгого CSP придётся `style-src 'unsafe-inline'` или nonce — оба варианта плохие.
2. **Тестируемость**: визуальный регресс ловится только глазами; нет токенов/utility-классов.
3. **Производительность**: новый `style`-объект на каждый рендер (см. `posMap`, `iconWrapStyle`, `inputStyle`) ломает `React.memo` и порождает мелкий GC pressure.
4. **Дублирование цветов**: hex `#59151f`, `#384a32`, `#f4f7f0`, `#9fb1c2` повторяются в TS-файлах, в [`globals.css`](../src/app/globals.css), и в маппинге [`shadowUtils.ts`](../src/utils/shadowUtils.ts). Источника правды нет.
5. В [`ProductDetailsClient.tsx:19`](../src/components/ProductDetailsClient.tsx) **локальный** хардкод `const orderBg = '#384a32';` — обходит даже `THEME`.

**Что делать:** определить токены в `globals.css`/Tailwind и перевести компоненты на классы (`bg-accent-primary`, `text-theme-primary` и т.д. — они уже частично заведены). Inline `style` — только для динамических значений (например, прогресс-бары).

---

### 2.5. **High** — Огромные «единые» компоненты

- [`Header.tsx`](../src/components/Header.tsx) — 474 строки, сразу: основная шапка, мобильное меню, скролл-индикатор активного якоря, sub-nav для главной, sub-nav для каталога с горизонтальным скроллом, breadcrumbs для товара. Шесть concerns в одном `'use client'`-блобе.
- [`MemoriesSection.tsx`](../src/components/MemoriesSection.tsx) — 344 строки, два варианта слайдера (`carousel` / `polaroid`) внутри одного компонента, причём `sliderType` — `useState` с константным начальным значением, вторая ветка (polaroid) — мёртвая.
- [`Catalog.tsx`](../src/components/Catalog.tsx) — 314 строк, плюс продакт-карточка экспортируется отдельно для `FavoritesClient` и `ProductDetailsClient`.

**Что делать:** разделить `Header` на `<HeaderShell>`, `<DesktopNav>`, `<MobileMenu>`, `<HomeAnchorsNav>`, `<CategoriesScrollNav>`, `<ProductBreadcrumbs>`. Удалить мёртвый `polaroid` или сделать его CMS-настройкой. Memories тоже стоит разнести: `useMemoriesAutoplay`, `<MemoriesCarousel>`.

---

### 2.6. **High** — Дублированная синхронизация категории `?category=` в `Catalog`

[`Catalog.tsx:198-217`](../src/components/Catalog.tsx) содержит **два** `useEffect`, оба слушают изменения `searchParams`/`initialCategory` и устанавливают `activeCategory`:

```198:209:src/components/Catalog.tsx
  useEffect(() => {
    syncCategoryFromUrl();
  }, [syncCategoryFromUrl]);

  /** Навигация с сервера при обновлении RSC-пейлоада searchParams */
  useEffect(() => {
    if (pathname !== '/collection' || initialCategory == null) return;
    const id = initialCategory.toLowerCase().trim();
    if (id === 'all' || categories.some((c) => c.id === id)) {
      setActiveCategory(id === 'all' ? 'all' : id);
    }
  }, [pathname, initialCategory, categories]);
```

Логика гонок: при первом монтировании оба сработают; при rerender от смены `searchParams` — первый, при смене `initialCategory` (которое не передаётся!) — второй. По коду `initialCategory` нигде не передаётся в текущих вызовах (в `HomeCatalog` и `CatalogPage`), то есть второй useEffect — **мёртвый код**.

**Что делать:** удалить второй `useEffect`, упростить до одного источника правды (URL `searchParams`).

---

### 2.7. **Medium** — `useState` для `sliderType` без сеттера = константа в кепке

[`MemoriesSection.tsx:118`](../src/components/MemoriesSection.tsx):

```118:118:src/components/MemoriesSection.tsx
  const [sliderType] = useState<'carousel' | 'polaroid'>('carousel');
```

`setSliderType` не используется. Оставлено «на всякий случай» → хвост мёртвого кода (`getPolaroidPosition`, второй блок JSX). Это шум и риск.

---

### 2.8. **Medium** — Глобальный кэш Payload-клиента в module scope

[`src/lib/products.server.ts:100-105`](../src/lib/products.server.ts):

```100:105:src/lib/products.server.ts
let cached: Awaited<ReturnType<typeof getPayload>> | null = null;

async function payload() {
  cached ??= await getPayload({ config });
  return cached;
}
```

Похожий паттерн нужно бы применить во всех `*.server.ts`, но в реальности `getPayload({ config })` вызывается заново в [`pages.server.ts`](../src/lib/pages.server.ts), [`forms.server.ts`](../src/lib/forms.server.ts), [`hero.server.ts`](../src/lib/hero.server.ts), [`memories.server.ts`](../src/lib/memories.server.ts), [`about.server.ts`](../src/lib/about.server.ts), [`homeCatalog.server.ts`](../src/lib/homeCatalog.server.ts), [`homepage-seo.server.ts`](../src/lib/homepage-seo.server.ts).

`getPayload({ config })` сам по себе уже мемоизирован Payload-ом, но порядок инициализации хрупкий: один из этих модулей при cold-start может стартовать раньше, чем `onInit` со всеми сидерами доедет, и попасть на пустой глобал.

**Что делать:** единая утилита `getServerPayload()` в `lib/payload.server.ts`, вынести `cached` в один файл.

---

### 2.9. **Medium** — Type-casts `as never` / `as unknown` в сидерах

В [`pagesBootstrap.ts:87`](../src/payload/seeds/pagesBootstrap.ts), [`contactFormBootstrap.ts:19`](../src/payload/seeds/contactFormBootstrap.ts), [`aboutBootstrap.ts:38-39`](../src/payload/seeds/aboutBootstrap.ts) — приведения типа `as never`/`as unknown as Record<string, unknown>` вокруг `payload.create`/`payload.update`. Это маскирует расхождения схемы с PayloadAPI: после ребилда `payload-types.ts` любая поломка проявится **только в рантайме** при первом сиде в чистой БД.

**B-29** упоминает.

---

### 2.10. **Medium** — `Loader.tsx` лезет в DOM мимо React

[`Loader.tsx:39`](../src/components/Loader.tsx):

```39:48:src/components/Loader.tsx
    const video = document.querySelector('video');
    if (video) {
      if (video.readyState >= 3) {
        t1 = finish();
      } else {
        video.addEventListener('canplaythrough', () => { t1 = finish(); }, { once: true });
      }
    } else {
      t1 = finish();
    }
```

Проблемы:

1. `document.querySelector('video')` ищет любое `<video>` в DOM. На любых страницах кроме главной видео нет — попадаем в ветку `else` → ок. Но в продуктовой карточке нет `<video>`, а лоадер **по-прежнему ждёт 1400 мс** (см. ниже про `loadTime`). Иначе говоря, лоадер замедляет ВСЕ страницы.
2. Лоадер монтируется в [`(site)/layout.tsx`](../src/app/(site)/layout.tsx), значит срабатывает при каждом ремаунте (внутреннее перемещение Next.js по `<Link>` не должно ремаунтить layout, но при переходах `/collection` → `/` всё равно).
3. `setTimeout(finish, ...)` внутри другого `setTimeout` — `t1` присваивается в два места асинхронно; `clearTimeout(t1)` ловит только последнее значение.

**Что делать:** показывать лоадер **только** при `pathname === '/'` (либо перенести его в `(site)/page.tsx`), убрать поиск `video` через DOM (передавать ref из Hero), обнулять `loadTime` после первого визита (sessionStorage).

---

### 2.11. **Medium** — Хардкод `loadTime = 1400` в Loader

[`Loader.tsx:21`](../src/components/Loader.tsx) — минимально 1.4 секунды + ещё 0.3 на fade. Это ощутимо длинная заставка на каждое посещение. UX-сильное решение «брендирующего сплеша» — но **на каждый переход** становится раздражающим.

**Что делать:** убрать минимум совсем, сделать его меньше (200–400 мс), показывать только на `cold start` (sessionStorage флаг).

---

### 2.12. **Medium** — `'use client'` на компонентах, которые могли бы быть серверными

[`About.tsx`](../src/components/About.tsx), [`MemoriesSection.tsx`](../src/components/MemoriesSection.tsx), [`Catalog.tsx`](../src/components/Catalog.tsx), [`Hero.tsx`](../src/components/Hero.tsx), [`Header.tsx`](../src/components/Header.tsx), [`FooterClient.tsx`](../src/components/FooterClient.tsx), [`ContactForm.tsx`](../src/components/ContactForm.tsx), [`AppLoader.tsx`](../src/components/AppLoader.tsx), [`Loader.tsx`](../src/components/Loader.tsx), [`HomeCatalog.tsx`](../src/components/HomeCatalog.tsx), [`FavoritesClient.tsx`](../src/components/FavoritesClient.tsx), [`ProductDetailsClient.tsx`](../src/components/ProductDetailsClient.tsx), [`ContactMessengerFab.tsx`](../src/components/ContactMessengerFab.tsx).

`About.tsx` использует `react-icons` — это **могло бы быть серверным компонентом**, и тогда `react-icons` ушёл бы из клиентского бандла. Сейчас только из-за того, что компонент маркирован `'use client'`, тащит иконки на клиент.

**Что делать:** разделить `<AboutSection>` (серверный, рендерит JSX и ссылки на иконки) и `<AboutCard>` (если нужна интерактивность — её нет). Сделать рендер иконок как inline SVG строкой или server-only `react-icons/lu`.

---

### 2.13. **Medium** — Хрупкий `patch-package` для Payload UI/Next

[`patches/`](../patches/) содержит два патча на `@payloadcms/next@3.84.1` и `@payloadcms/ui@3.84.1`, оба меняют **только порядок** `groupNavItems([...globals, ...collections])` (чтобы глобалы шли выше коллекций в сайдбаре).

Минусы:

1. При любом minor/patch апдейте Payload патч может молча перестать применяться (`postinstall` упадёт).
2. Это блокирует security-апдейты, если они в новой версии меняют `index.js` UI/Next.
3. Поведение можно сделать без патча — в Payload v3 есть `admin.components.beforeNavLinks` / `afterNavLinks` и/или `admin.components.Nav` для кастомного `DefaultNav`.

**B-28** упоминает.

**Что делать:** заменить патч на свой `Nav` компонент. Удалить `patches/` целиком.

---

### 2.14. **Low** — `phoneHrefToWhatsAppLink` срезает любые не-цифры без локализации

[`src/lib/contact.defaults.ts:10-14`](../src/lib/contact.defaults.ts):

```10:14:src/lib/contact.defaults.ts
export function phoneHrefToWhatsAppLink(phoneHref: string): string {
  const digits = phoneHref.replace(/^tel:/i, '').replace(/\D/g, '');
  if (!digits) return `https://wa.me/${CONTACT_CHANNEL_DEFAULTS.phoneHref.replace(/\D/g, '')}`;
  return `https://wa.me/${digits}`;
}
```

Если редактор задаст телефон в формате `tel:+74951234567` (московский номер) — получится `wa.me/74951234567`, что технически валидно (+7), но если он введёт `8 (495) 123-45-67` — получится `wa.me/84951234567` — **WhatsApp такого пользователя не найдёт**. Никакой подсказки нет.

**Что делать:** валидация в админке (поле `phoneHref` — `validate: ...`), либо собирать E.164 отдельным полем.

---

### 2.15. **Low** — Дублирующиеся компоненты: `ProductCard` экспортируется как именованный, но используется в 3 местах

`Catalog.tsx` экспортирует `ProductCard`, который импортируется в `FavoritesClient`, `ProductDetailsClient` (related) и сам Catalog. Это нормально, но:

- `ProductCard` принимает `backgroundColor`, `headingColor`, `textColor` — в каждом месте передаются **одни и те же** значения из `SECTIONS.catalog`/`SECTIONS.hero`. Эти props не нужны (можно вытащить из THEME напрямую).
- Иконки навигации/dot-индикаторы в нём дублируют такие же в `ProductDetailsClient`.

**Что делать:** общий `<ProductImageCarousel>` для обеих карточек, цвета — из утилиты, а не из props.

---

### 2.16. **Low** — `noindex`/`robots` метатеги нигде не выставляются осознанно

`/favorites` индексируется (есть в [`sitemap.ts:17`](../src/app/sitemap.ts) и не закрыт от роботов). Хотя страница персональная (LocalStorage), её попадание в индекс бесполезно.


---

## 3. UI/UX — функциональные дефекты

### 3.1. **Critical** — Раздел «Избранное» нерабочий: товар нельзя добавить в избранное

Главная находка отчёта. В проекте есть:

- утилита [`src/utils/favorites.ts`](../src/utils/favorites.ts) с `toggleFavoriteId`/`isFavoriteId`,
- хук [`src/hooks/useFavoriteIds.ts`](../src/hooks/useFavoriteIds.ts),
- страница `/favorites` ([`favorites/page.tsx`](../src/app/(site)/favorites/page.tsx)),
- иконка-сердечко в шапке ([`Header.tsx:11-20, 40`](../src/components/Header.tsx)),
- пункт меню «Избранное» в `NAV_ITEMS`.

**Но `toggleFavoriteId` не вызывается ни в одном компоненте.** Поиск по `src/`:

```
src/utils/favorites.ts   — определение
(нигде больше)
```

То есть пользователь:

1. Видит иконку «Избранное» в шапке.
2. Кликает — попадает на пустую страницу с CTA «В коллекцию».
3. Идёт в коллекцию, но **на карточке товара нет кнопки «в избранное»**, на странице товара — тоже нет.
4. Возвращается обратно — пусто. Так навсегда.

Это **полностью нерабочая функция**, выпущенная в продакшен. Хуже того, она проиндексирована в sitemap.

**Что делать срочно:** либо реализовать кнопку-сердечко в `<ProductCard>` и на странице товара, либо удалить `/favorites` из навигации, sitemap и репозитория до реализации.

---

### 3.2. **Critical** — Кнопка «Записаться на встречу» отключена

[`Contact.tsx:186-200`](../src/components/Contact.tsx):

```186:200:src/components/Contact.tsx
              <div className="mt-8">
                <button
                  type="button"
                  disabled
                  className="inline-block w-full cursor-not-allowed rounded-full ... opacity-60 ..."
                  ...
                  title="Запись на встречу скоро будет доступна"
                >
                  {content.appointmentButtonText}
                </button>
                <p ...>
                  {nbspAfterSi(content.appointmentNote)}
                </p>
              </div>
```

Большая яркая CTA на главной — **серое пятно, на которое нельзя кликнуть**. Подсказка `title="..."` на тач-устройствах не показывается; единственный пояснитель — мелкий серый текст под ней. На luxury-сайте такой плейсхолдер выглядит как «сайт не доделали».

**Что делать:** до реализации календаря — либо удалить кнопку (показывать только текст), либо превратить в `<a href="tel:…">` / якорь `#contact-form`.

---

### 3.3. **High** — Лоадер на каждый визит / ремаунт

[`src/app/(site)/layout.tsx:64`](../src/app/(site)/layout.tsx) монтирует `<AppLoader />` в **layout**. Это значит:

- Лоадер показывается **на каждой странице** сайта (главная, каталог, продукт, избранное, страницы политик), а не только при первой загрузке.
- Пользователь, перезайдя на `/products/123` через прямой URL, видит 1.7 секунды белого экрана с надписью «ЯНИНА В ЮВЕЛИРНАЯ СТУДИЯ YANINA V» **до** контента, причём контент уже отрендерен и спрятан под оверлей.
- Для SEO-боттов лоадер не виден (они получат HTML с контентом), но **Core Web Vitals (LCP)** страдают: реальный LCP-элемент скрыт оверлеем 1.4 сек. Lighthouse это засчитает.

[`AppLoader.tsx`](../src/components/AppLoader.tsx) держит `isLoading` в локальном `useState` без sessionStorage — если пользователь нажмёт `back`/`forward`, лоадер показывается снова.

**Что делать:** показывать лоадер **только** на главной (и только на холодный старт), уменьшить минимум до 200–400 мс, убрать `pointerEvents: 'auto'` сразу после первого `requestAnimationFrame` если пользователь нажал куда-то.

---

### 3.4. **High** — Хедер фиксированный с большой blur-зоной + дублирующее меню

[`Header.tsx:285-298`](../src/components/Header.tsx) рендерит **отдельный fixed-слой** на высоту `min(26vh, 11.5rem)` с `backdrop-filter: blur(...)`. На мобильном это занимает четверть экрана и заметно тормозит скролл в Safari/Chrome (особенно на iOS под Memory pressure).

Дополнительно:

- Десктоп: верхний ряд капсул (логотип + меню) **+** sub-nav для главной (4 якоря) **+** sub-nav для каталога (категории) — три ряда меню одновременно. Это перегружает первый экран.
- При скролле sub-nav (категории) и breadcrumbs прокручиваются вместе с шапкой и **дублируют** информацию: пользователь на странице товара видит одновременно «Коллекции» (активный пункт) + «Коллекция › Категория › Название товара». Двойная навигация.

**Что делать:** сократить blur до `~5–7rem` или совсем выключить на мобильном (`md:backdrop-blur-...`), упростить sub-nav (одно меню вместо двух).

---

### 3.5. **High** — Мобильное меню не закрывается по клику вне и Escape

[`Header.tsx:215-411`](../src/components/Header.tsx): `setIsMenuOpen` обрабатывается только в `onClick` бургера и `onClick` каждой ссылки (`onClick={() => setIsMenuOpen(false)}`). **Нет:**

- слушателя `mousedown` на `document` (закрытие по клику вне),
- слушателя `keydown` на `Escape`,
- focus-trap при `aria-expanded`,
- блокировки `body` scroll, чтобы фон не уезжал.

Сравните с [`ContactMessengerFab.tsx:94-110`](../src/components/ContactMessengerFab.tsx), где аналогичные хендлеры есть. UX-несогласованность.

**Что делать:** перевести оба меню на общий `useDisclosure` или вынести в `<Popover>` библиотеку (Radix UI / Headless UI).

---

### 3.6. **High** — Карусель «Воспоминания» — автоплей без пауз и без `prefers-reduced-motion`

[`MemoriesSection.tsx:138-160`](../src/components/MemoriesSection.tsx) каждые 5 секунд переключает слайды; нет:

- паузы при наведении (наоборот, пользователь не успевает прочитать рукописную подпись),
- паузы при `:focus-visible` на любом из элементов (нарушение WCAG SC 2.2.2),
- учёта `@media (prefers-reduced-motion: reduce)` (нарушение WCAG SC 2.3.3),
- индикатора прогресса (точек/таблов).

Слайды **0.7s cubic-bezier transition** + `blur-[12px]` на боковых карточках — нагрузка на GPU мобильных устройств заметная, особенно на Android Go / iPhone SE.

**Что делать:** пауза при `:hover`/`:focus-within`, прервать автоплей при `prefers-reduced-motion`, dot-индикатор для ручного выбора, добавить кнопки play/pause.

---

### 3.7. **High** — Hero-видео с агрессивным `preload="auto"`, без кнопки выключения звука/перемотки

[`Hero.tsx:50-65`](../src/components/Hero.tsx):

```50:65:src/components/Hero.tsx
          <video
            ref={videoRef}
            className="w-full h-full object-cover object-center"
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            preload="auto"
          >
            {sources.map((s) => (
              <source key={s.type} src={s.src} type={s.type} />
            ))}
            Ваш браузер не поддерживает видео.
          </video>
```

- `preload="auto"` грузит **всё видео** ([14 МБ mp4](../public/videos/) или [7.4 МБ webm](../public/videos/)) сразу при заходе. Для мобильного в роуминге это болезненно, и нарушает рекомендации Google PageSpeed.
- Видео muted/autoplay/loop без UI для перемотки или громкости. Если пользователь хочет оставить его без звука но просто сидеть и смотреть — ОК. Если хочет послушать музыку (если она есть) — невозможно.
- Нет кнопки «полноэкранный режим».
- Если автоплей заблокирован браузером (low-power mode iOS), пользователь видит постер с надписью «Смотреть видео» и кнопкой play — **но при первом клике видео может не запуститься, потому что в `useEffect` есть `tryPlay` только при `isVideoPlaying === true`, а кнопка переключает `setIsVideoPlaying(true)`**. Гонка возможна, особенно если браузер требует жест пользователя.

**Что делать:** `preload="metadata"`, постер выше качеством, fallback `<img>` для старых браузеров.

---

### 3.8. **High** — Форма обратной связи: HTML5-валидация отключена

[`ContactForm.tsx:151-169`](../src/components/ContactForm.tsx) и далее: для всех инпутов стоит `required={false}` явно, валидация — ручная в `validateBeforeSubmit()`. Это значит:

- браузер не подсветит пустое поле «обязательное»,
- email/тел не валидируются на формат (только наличие непустой строки),
- скринридерам не сообщается `aria-invalid="true"` и `aria-describedby` к сообщению об ошибке,
- ошибка одна — общая внизу формы, без указания, какое поле невалидно.

В сравнении с тем, что просит ContactForm (имя, email, телефон, сообщение, согласие), валидация недостаточная.

**Что делать:** включить нативный `required`, добавить `pattern` для телефона, `aria-invalid` + `aria-describedby` для каждого ошибочного поля, фокусировать первое невалидное поле.

---

### 3.9. **High** — После отправки формы фокус не управляется

[`ContactForm.tsx:257-275`](../src/components/ContactForm.tsx) — после `setSent(true)` показывается `<div role="status">`. Но:

- Программный фокус на этот блок не ставится (`useEffect` + `ref.current.focus()` отсутствуют).
- Скринридеры **могут** прочитать `role="status"` благодаря live-region, но не гарантировано (`role="status"` = `aria-live="polite"`, иногда читается только при изменении).
- Кнопка «Отправить ещё одно сообщение» — это одна из немногих кнопок без визуального фокус-стиля.

**Что делать:** ref + `tabIndex={-1}` + `focus()` после успешной отправки.

---

### 3.10. **Medium** — Размер «touch targets» меньше 44×44

WCAG 2.5.5 (AAA) и 2.5.8 (AA) — минимум 24×24 CSS px, рекомендованно 44×44.

- [`Catalog.tsx:39-50`](../src/components/Catalog.tsx) — `DotIndicator` неактивный 14×14 px (меньше 24×24).
- [`Header.tsx:120-122`](../src/components/Header.tsx) — `scrollBtnClass` 28×28 px (меньше рекомендованных 44×44).
- [`Hero.tsx:69-78`](../src/components/Hero.tsx) — кнопка паузы 32×32 px в правом нижнем углу.
- В `MemoriesSection` точек-индикаторов **вообще нет** (раздел 3.6).

**Что делать:** на мобильных растянуть hit-area через `padding`/`::before`-overlay, не меняя визуальный размер.

---

### 3.11. **Medium** — Footer хранит контакты захардкоженно, дублирует CMS

[`FooterClient.tsx:84-117`](../src/components/FooterClient.tsx):

```92:113:src/components/FooterClient.tsx
                <span className="text-sm">г. Екатеринбург, ул. Белинского, 41</span>
                ...
                <div>Пн-Пт: 10:00 - 20:00</div>
                <div>Сб-Вс: 11:00 - 19:00</div>
                <div>По предварительной записи</div>
```

Те же значения хранятся в Payload-глобале `Contact` ([`Contact.ts`](../src/payload/globals/Contact.ts)) и используются в [`Contact.tsx`](../src/components/Contact.tsx). Если редактор обновит адрес/часы в админке — на главной поменяется, **в футере останется старое**.

**Что делать:** в `Footer.server.ts` загружать `getContactContent()` целиком и пробрасывать `address`/`hours` в `FooterClient`.

---

### 3.12. **Medium** — `ContactMessengerFab` хранит ссылки на TG/VK хардкодом

[`ContactMessengerFab.tsx:5-23`](../src/components/ContactMessengerFab.tsx):

```5:23:src/components/ContactMessengerFab.tsx
const TELEGRAM_LINK = {
  href: 'https://t.me/yanina_v_jewelry',
  ...
};

const VK_LINK = {
  href: 'https://vk.com/yanina_v_js',
  ...
};
```

При смене аккаунта в TG/VK редактор сменит [`SOCIAL_LINKS`](../src/utils/social.ts) (там есть и TG, и VK), но FAB останется со старой ссылкой. Тот же баг по дублированию данных, что в 3.11.

**Что делать:** перенести в глобал `Contact` массив `messengers` (channel + url + label) и читать в обоих местах.

---

### 3.13. **Medium** — `Catalog` сначала фильтрует на сервере, затем повторно на клиенте

На странице `/collection?category=...` сервер возвращает **полный каталог** (`getAllProducts()` без фильтра, см. [`collection/page.tsx:79-82`](../src/app/(site)/collection/page.tsx)), а клиент через `useSearchParams` снова фильтрует. То есть:

- Серверный `where: 'category.slug'` (`getProductsByCategory`) **не используется** на странице каталога.
- При SSR в HTML улетают **все 300 товаров**, потом клиент скрывает большинство.

Это и **B-27** и проблема SEO (HTML каталога категории «Кольца» содержит весь каталог, и Google не может различить, что это «Кольца»-страница).

**Что делать:** `await getProductsByCategory(searchParams.category)` на сервере, передавать только нужное.

---

### 3.14. **Medium** — Полароид: `lineHeight: 0.4` срезает буквы

[`MemoriesSection.tsx:60-72`](../src/components/MemoriesSection.tsx):

```62:72:src/components/MemoriesSection.tsx
        <p
          className="flex items-center justify-center h-full px-2"
          style={{
            color: textColor,
            fontFamily: 'var(--font-disruptor-script), cursive',
            fontSize: '3.645rem',
            lineHeight: '0.4',
            transform: 'rotate(-3deg)',
          }}
        >
          {slide.text}
        </p>
```

`lineHeight: 0.4` при `font-size: 3.6rem` — высота строки **меньше высоты заглавной буквы**. Буквы с descender'ами (русские «у», «р», «д» и латинские `g`, `y`, `p`) обрезаются. На скриншотах смотрите, на live-сайте проверяли вручную? Если шрифт `Disruptor's Script` со встроенными метриками отлично рендерит — повезло. На запасном `cursive` (если шрифт не загрузился) — высока вероятность визуального брака.

---

### 3.15. **Medium** — Карусель Catalog: маркеры карусели через onClick на родителе

[`Catalog.tsx:111-141`](../src/components/Catalog.tsx) — `<div onClick={hasMultiple ? handleNextImage : undefined}>` внутри `<Link>`. Клик по картинке листает следующую, клик «промахом» — переходит на страницу товара.

UX-проблемы:

1. На тач-устройствах нельзя различить «лёгкое касание» (пролистнуть) и «свайп» (хотел кликнуть).
2. Нет «свайпа» как такового — только клик.
3. У пользователя нет визуальной подсказки, что картинка кликабельна.
4. `cursor: hasMultiple ? 'pointer' : 'default'` — но `<Link>` всегда даёт `cursor:pointer`. Стиль не действует.

**Что делать:** разделить области (картинка отдельно, ссылка-обёртка вокруг описания), добавить touch swipe.

---

### 3.16. **Medium** — `Header` дублирует пункты «Индивидуальный заказ» и «Подарочный сертификат» из CMS

[`Header.tsx:35-41`](../src/components/Header.tsx) — в `NAV_ITEMS` захардкожены пункты `/custom-orders`, `/gift-certificate`, **а сами страницы лежат в CMS как `pages` со слагами `custom-orders` и `gift-certificate`** ([`pagesBootstrap.ts`](../src/payload/seeds/pagesBootstrap.ts)).

Если редактор переименует страницу или сделает draft — пункт меню сломается, ведя в `notFound()`. Никакого валидатора согласованности нет.

**Что делать:** либо перенести список пунктов меню в `Settings`-глобал, либо хранить `slug` в CMS-страницах и фильтровать nav из коллекции `pages`.

---

### 3.17. **Low** — `disabled` checkbox без явного `:disabled` стиля

В [`ContactForm.tsx:168`](../src/components/ContactForm.tsx) `disabled={sent}` стоит на каждом инпуте, но визуально (cursor / opacity) только базовые browser-стили. Когда форма отправлена и отображается success-блок, инпуты уже скрыты — атрибут полезен только если у компонента есть момент «между sent и сбросом», что редко.

---

### 3.18. **Low** — `MenuHeartIcon` — единственная иконка «избранного» — выглядит как «лайк», а не как «избранное»

Конвенция e-commerce: «корзина» — иконка cart, «избранное» — звёздочка/флажок/закладка. Сердечко скорее ассоциируется с «лайком» товара. Это субъективно, но в B2C luxury-сегменте важно — пользователь может не понять, что иконка про сохранение.


---

## 4. Доступность (a11y)

### 4.1. **High** — Нет skip-to-content ссылки

Длинный фиксированный header (см. 3.4) занимает `~7.5 rem` (десктоп) и до 4 рядов на мобильном. Скринридер/клавиатура должны прожать `Tab` ~7–10 раз, прежде чем дойти до контента. WCAG SC 2.4.1.

**Что делать:** в [`(site)/layout.tsx`](../src/app/(site)/layout.tsx) добавить `<a href="#main" className="sr-only focus:not-sr-only ...">Перейти к содержимому</a>` и поставить `id="main"` на `<main>`.

---

### 4.2. **High** — Нет focus trap в мобильном меню

[`Header.tsx:381-411`](../src/components/Header.tsx) — открывает меню как dropdown. При открытом меню `Tab` уходит **за пределы** меню (на FAB, на содержимое за оверлеем). Скринридер читает контент, который визуально скрыт.

WCAG SC 2.4.3.

---

### 4.3. **High** — Карусель Memories — ничего по WCAG SC 2.2.2 / 2.3.3

Уже разбирали в 3.6 — нет паузы, нет уважения к `prefers-reduced-motion`. SC 2.2.2 (Pause, Stop, Hide) и SC 2.3.3 (Animation from Interactions) формально нарушены.

---

### 4.4. **Medium** — `aria-pressed` используется на якоря-ссылки в категории

[`Header.tsx:147`](../src/components/Header.tsx) — `<Link aria-current={...}>` в категории — корректно.
[`Catalog.tsx:36-52`](../src/components/Catalog.tsx) — `aria-pressed` на `<button>` для DotIndicator — норма.
[`Hero.tsx:71`](../src/components/Hero.tsx) — у кнопки play/pause **нет** `aria-pressed`/`aria-label` (для рук-ивов, которые отличают play и pause только по иконке).

```70:78:src/components/Hero.tsx
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute bottom-2 right-2 ..."
              title="Остановить видео"
            >
```

`title` — не альтернатива `aria-label` для скринридеров (читается не везде, на тач не видим).

---

### 4.5. **Medium** — `<button disabled>` без описания «почему»

[`Contact.tsx:188`](../src/components/Contact.tsx) — `disabled aria-disabled="true"` без `aria-describedby`. Для скринридера: «Записаться на встречу, недоступно». Без причины.

---

### 4.6. **Medium** — Контрастность тёмного фона About

`SECTIONS.about.bg = #59151f`, `text = #9fb1c2` ([`theme.ts`](../src/utils/theme.ts), [`globals.css`](../src/app/globals.css)). Контрастный коэффициент на «обычный текст» (≥4.5:1) — на грани (нужна проверка):

- `#9fb1c2` на `#59151f` — около 4.6:1, для AA проходит.
- `#9fb1c2` (text) на `#59151f` (bg) для размера 14px — на грани, при низкокачественных мониторах буквы «плывут».

В блоке carousel есть текст `text-sm` (14px) — пограничный AA. На AAA (7:1) — провал.

**Что делать:** прогнать через `axe-core` / Lighthouse, повысить контраст (более светлый текст или более тёмный фон).

---

### 4.7. **Medium** — `<input type="checkbox">` стилизуется через `accent-[#59151f]` — Safari старый игнорирует

[`ContactForm.tsx:212, 295`](../src/components/ContactForm.tsx) — `className="... accent-[#59151f]"`. На iOS Safari < 16.4 свойство `accent-color` не поддерживается полностью, чекбокс будет дефолтным синим/серым. Не критично, но в luxury-проекте бренд-цвет важен.

---

### 4.8. **Medium** — Decorative SVG иконки имеют `aria-hidden`, кнопки — `aria-label` — это OK, но...

[`Catalog.tsx:54-67`](../src/components/Catalog.tsx) — `NavigationArrow` имеет `aria-label`, но **внутри стрелки SVG не имеет `aria-hidden`** — некоторые скринридеры читают `path` как пустое содержимое. Не критично.

---

### 4.9. **Low** — `<table>` в `ProductDetailsClient` без `<caption>`

[`ProductDetailsClient.tsx:144-170`](../src/components/ProductDetailsClient.tsx) — таблица характеристик. `<th scope="row">` есть, но нет `<caption>` или `aria-label` — скринридер не объявит контекст таблицы.

---

### 4.10. **Low** — Lang-атрибут `<html lang="ru">` захардкожен

[`(site)/layout.tsx:60`](../src/app/(site)/layout.tsx) — `lang="ru"`. При активной локализации Payload (`ru`/`en`) английская версия (если будет) тоже будет с `lang="ru"`. Сейчас неактуально (нет `/en`), но это часть техдолга **B-26**.


---

## 5. Производительность

### 5.1. **High** — Тяжёлые ассеты в `public/`

```
public/images/001.jpeg  — 11 МБ
public/images/005.jpeg  — 5.8 МБ
public/images/003.jpeg  — 1.9 МБ
public/videos/jewelry-hero.mp4  — 14 МБ
public/videos/jewelry-hero.webm — 7.4 МБ
```

Суммарно ~40 МБ, всё в Docker-образе (через `COPY --from=builder /app/public ./public`). Превью каталога теперь в Payload (`data/image`), но **исходники для сидера остались**, причём `public/images/001.jpeg` ещё и используется в **рантайме** в [`MemoriesSection.tsx:31`](../src/components/MemoriesSection.tsx) как `backgroundImage: 'url(/images/texture.jpg)'` (это меньший файл).

001.jpeg — 11 МБ JPEG, с разрешением около 6000×4000 — для постера hero такого размера не нужно.

**B-01** частично, но раздел про `public/` забыли.

**Что делать:** удалить все `001.jpeg` … `005.jpeg` из `public/images/` (они теперь в `data/image/`), либо перенести в S3/`data/`. Видео — туда же.

---

### 5.2. **High** — `getAllProducts()` вызывается лишний раз на странице товара

Уже описано в 2.1 / 3.13. На странице `/products/123` **полный каталог** грузится ради 3 related products.

---

### 5.3. **Medium** — Hero-видео `preload="auto"`

Описано в 3.7. На медленном 3G-каналу LCP ≈ 14 МБ / 1 Мбит = **>100 секунд**. Даже если используется webm (7.4 МБ).

**Что делать:** `preload="metadata"`, lazy-load после первого скролла, или `<img>` placeholder с переключением на `<video>` по `IntersectionObserver`.

---

### 5.4. **Medium** — Memories — 5 изображений с `priority={isCenter}`

[`MemoriesSection.tsx:48`](../src/components/MemoriesSection.tsx) — только центральный слайд `priority`, остальные ленивые. ОК. Но **все 5 изображений сразу в DOM** даже когда видны 5 одновременно (`carousel`). На мобильном — 3 изображения видны (центр + 2 по бокам). Боковые имеют `blur-[2px]` / `blur-[12px]` — браузер всё равно загружает full-resolution.

**Что делать:** для боковых использовать `sizes="200px"` или вообще миниатюры.

---

### 5.5. **Medium** — Inline `style` на каждом ререндере

См. 2.4. Особенно [`MemoriesSection.tsx`](../src/components/MemoriesSection.tsx), где на каждый рендер пересоздаётся `posMap`-объект, и [`Header.tsx`](../src/components/Header.tsx), где `veilTintStyle`, `veilBlurMaskStyle`, `shadowStyle` пересчитываются на каждый scroll-tick (Header — клиентский с активным `useEffect` слушателем `scroll`).

**Что делать:** мемоизировать `useMemo` или вынести в `globals.css`.

---

### 5.6. **Medium** — Bundle: `react-icons/lu` + `react-icons/si`

`About` импортирует **25** иконок из `react-icons/lu`. Tree-shaking у Next 15 + SWC обычно справляется, но лучше использовать `lucide-react` напрямую (он легковеснее) или inline SVG.

`Footer`/`ContactMessengerFab`/`social.ts` тащат `react-icons/si` — четыре соцсети, но опять же — это full SDK импорт. **B-16**.

---

### 5.7. **Low** — Loader блокирует first paint на 1.4 сек

См. 3.3. Влияет на FCP / LCP метрики Core Web Vitals.

---

### 5.8. **Low** — `Image` с `onError` в `ProductCard` — потенциальный бесконечный цикл

[`Catalog.tsx:21`](../src/components/Catalog.tsx):

```21:21:src/components/Catalog.tsx
    onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/placeholder.jpg'; }}
```

Если `/images/placeholder.jpg` тоже не загрузится — `onError` сработает снова, попытается поменять src на тот же — браузер поднимет новый запрос. Бесконечный цикл маловероятен (next/image отлавливает), но при «битом» CDN — возможен.

**Что делать:** поставить флаг через `useState`, после первой ошибки не пытаться менять `src` повторно.


---

## 6. SEO и индексация

### 6.1. **High** — `lastModified: now` в sitemap

[`sitemap.ts:13`](../src/app/sitemap.ts) — `now = new Date()`, всем URL ставится текущая дата. Поисковик увидит, что **все страницы обновились прямо сейчас, каждый раз** при дёрге sitemap. Это:

- сжигает crawl budget,
- мешает поисковику приоритизировать реально обновлённые товары,
- противоречит официальной семантике `<lastmod>`.

**B-25**.

**Что делать:** реальный `updatedAt` из Payload-документов (товары, категории, страницы).

---

### 6.2. **High** — CMS-страницы не попадают в sitemap

[`sitemap.ts:14-25`](../src/app/sitemap.ts) — `staticPaths` хардкодит `/custom-orders`, `/delivery`, `/gift-certificate`, `/offer`, `/privacy`, `/warranty`. Если редактор добавит новую страницу через `/admin/collections/pages` (например, «акции»), она **никогда не попадёт в sitemap**, и Google её не найдёт — **B-25**.

---

### 6.3. ~~**High** — Drafts могут утекать на публичный сайт~~ **Исправлено**

[`pages.server.ts`](../src/lib/pages.server.ts) и [`Pages.access.read`](../src/payload/collections/Pages.ts) ограничивают публичный доступ `_status: published` (2026-07-24). **B-25** (часть drafts).

---

### 6.4. **High** — Нет structured data (JSON-LD)

В коде нет ни одного `<script type="application/ld+json">`. Для luxury-каталога это упускаемая возможность:

- `Product` schema на товаре (имя, изображение, описание, бренд, наличие — нет цены, но `priceValidUntil` можно опустить),
- `Organization` или `LocalBusiness` (адрес, телефон, часы работы — всё уже есть в CMS),
- `BreadcrumbList` для product/category pages,
- `WebSite` с `SearchAction`.

**B-31**.

---

### 6.5. **Medium** — `meta keywords` ещё в layout

[`(site)/layout.tsx:40-41`](../src/app/(site)/layout.tsx):

```40:41:src/app/(site)/layout.tsx
  keywords:
    'ювелирная студия, помолвочные кольца, обручальные кольца, эксклюзивные украшения, ювелирные изделия на заказ',
```

Google игнорирует `keywords` с 2009 года, Yandex — давно. Безвредно, но стоит убрать.

---

### 6.6. **Medium** — Главная и `/favorites` могли бы быть `noindex`

`/favorites` — персональная (LocalStorage). Сейчас в `sitemap.ts` и не закрыта от роботов в `robots.ts`. Лучше `metadata.robots = { index: false }`.

---

### 6.7. **Medium** — Канонические URL для категорий используют `?category=` query

[`collection/page.tsx:53-56`](../src/app/(site)/collection/page.tsx):

```53:56:src/app/(site)/collection/page.tsx
  const canonicalCategory = categoryParam
    ? `${base}/collection?category=${encodeURIComponent(categoryParam.toLowerCase())}`
    : `${base}/collection`;
```

Поисковики плохо ранжируют URL с query-параметрами для контентных страниц. SEO best-practice — `/collection/rings/` (path-сегмент). Это техдолг.

---

### 6.8. **Medium** — На страницах товара нет `breadcrumbs` JSON-LD

Хедер показывает breadcrumbs, но они не экспортированы в structured data. Связано с 6.4.

---

### 6.9. **Low** — В `robots.ts` нет блока `Disallow: /api/admin` и `/api/users`

[`robots.ts:13`](../src/app/robots.ts):

```13:13:src/app/robots.ts
      disallow: ['/admin', '/api'],
```

`/api` целиком закрыт — **включая `/api/sitemap.xml`** (его нет, но если появится). Этого может быть достаточно. Но из-за того что REST GET по коллекциям доступен, лучше явно запретить `/api/users`, `/api/forms`, `/api/form-submissions` (на случай, если робот случайно к нему попадёт через ссылку с другого сайта).

---

### 6.10. **Low** — Нет hreflang при включённой локализации

[`payload.config.ts:147-154`](../payload.config.ts) включает `localization` с `ru`+`en`. `<html lang="ru">` хардкоден, `<link rel="alternate" hreflang>` — отсутствует. Сейчас `/en` нет, поэтому формально проблема не активна (B-26), но связано.


---

## 7. Контент и данные

### 7.1. **High** — Внешние уведомления о заявках не отправляются

`form-submissions` копятся только в `/admin`. Email/Telegram-канал не настроен. Если сайт не открыт админом каждый день, **лиды лежат непрочитанными неделю**. **B-18** в Open.

**Что делать:** минимально — `afterChange` хук на `form-submissions` с `fetch` к Telegram Bot API (env `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` уже зарезервированы в [`.env.example`](../.env.example)).

---

### 7.2. **Medium** — Нет приложения файлов в форме

В старой вёрстке было поле «Прикрепить файл», убрали при переходе на Form Builder (**B-19**). Для luxury-сегмента (где клиенты часто шлют скетчи/фото идей) — заметная регрессия.

---

### 7.3. **Medium** — `sourceBasename` не уникален в `Image`/`Video`

[`Image.ts`](../src/payload/collections/Image.ts) / [`Video.ts`](../src/payload/collections/Video.ts) — `index: true`, но не `unique: true`. Сидеры ищут `limit: 1`, поэтому при повторных импортах могут поймать «не тот» файл — **B-29**.

---

### 7.4. **Medium** — Локализация пустая для `en`

[`payload.config.ts:147-154`](../payload.config.ts) включает локали `ru`/`en`, но:

- сайт читает только `ru`,
- сидеры не заполняют `en`,
- редактор увидит пустые поля для всех `en`-локалей (контента и SEO),
- если редактор по ошибке заполнит `en`-локаль `meta.title` — пользователь её **никогда не увидит**.

**B-26**.

---

### 7.5. **Medium** — Категории в навигации показывают «Все изделия» как hardcoded

[`products.server.ts:201, 213`](../src/lib/products.server.ts):

```200:201:src/lib/products.server.ts
  return [{ id: 'all', name: 'Все изделия' }, ...mapped];
```

Если редактор перейдёт на английскую локаль или захочет поменять подпись — **нет места в админке**. Та же история с пустой категорией / пустым каталогом.

---

### 7.6. **Low** — `Footer` копирайт от 2016 — захардкожено

[`FooterClient.tsx:123`](../src/components/FooterClient.tsx) — `© 2016 – 2026 ЯНИНА В.`. Через год придётся править руками; легко забыть.


---

## 8. DevOps / Infra

### 8.1. **High** — В Dockerfile нет явного `payload:migrate` перед стартом

[`Dockerfile:44`](../Dockerfile):

```44:44:Dockerfile
CMD ["sh","-c","node scripts/remove-dev-push-marker.mjs && node server.js"]
```

Production полагается на `prodMigrations` внутри `sqliteAdapter` (выполняется при `payload.init()` внутри Next-сервера). Это работает, но:

- Если Next-сервер по какой-то причине стартует без `payload.init` (например, healthcheck до полной инициализации), миграции не запустятся.
- `prodMigrations` запускаются **в первом процессе, который дёрнет `payload.init`**, и нет лока. При горизонтальном масштабировании (несколько replicas) случится гонка миграций.

**B-28**.

**Что делать:** добавить отдельный шаг entrypoint, который вызывает `payload:migrate` синхронно перед `node server.js`.

---

### 8.2. **High** — SQLite в production: один файл, без сжатия истории, без backup

`data/payload.db` — single-writer база. Активная админка + публичные записи `form-submissions` + sidecar-чтения = риск `SQLITE_BUSY`. Под нагрузкой 10+ rps можно увидеть таймауты.

Backup-стратегии в репозитории нет — ни Litestream, ни cron, ни sidecar.

**B-28**, **B-30**.

**Что делать:** Litestream → S3 как минимум; миграция на Postgres (через `@payloadcms/db-postgres`) — стратегически.

---

### 8.3. **Medium** — Нет CI

Нет `.github/workflows/` или эквивалента. Нет автозапуска `npm run lint`, `npm run build`, миграций, тестов. На коммитах в main всё держится на дисциплине разработчика. **B-13**.

---

### 8.4. **Medium** — Нет тестов

Ни unit, ни integration, ни E2E. Учитывая количество ручных type-cast, динамической логики (`HomeCatalog` selectionMode, фильтр категорий, форма) — регрессии будут регулярно. **B-14**.

---

### 8.5. **Medium** — `.dockerignore` минимален

```
node_modules
.next
.git
.env*
data
```

Не игнорируется `.migrate-bundle/`, `.payload-bundle/` (попадают в Docker context при `docker build`, замедляя билд) и `tsconfig.tsbuildinfo` (575 КБ).

---

### 8.6. **Medium** — Лимиты CPU/Memory в `docker-compose.prod.yml` на пределе

[`docker-compose.prod.yml:18-19`](../docker-compose.prod.yml):

```17:19:docker-compose.prod.yml
        limits:
          cpus: '0.90'
          memory: 1G
```

Next.js + Payload + sharp (для генерации `card`/`hero`/`og` ресайзов) + SQLite = **1 ГБ это в притык**. При первой генерации ресайзов сразу для большого каталога (`getAllProducts({ depth: 2 })` тянет media → sharp работает с буферами) можно поймать OOM.

**Что делать:** 1.5–2 ГБ для prod, swap не использовать (sqlite не любит).

---

### 8.7. **Low** — `restart: unless-stopped`, но healthcheck не задан

[`docker-compose.prod.yml`](../docker-compose.prod.yml) — `restart: unless-stopped` без `healthcheck`. Если процесс висит (deadlock в SQLite), контейнер будет считаться «running», запрос — таймаут.

**Что делать:** `healthcheck: curl --fail http://localhost:3000/sitemap.xml` или специальный `/api/health` endpoint.


---

## 9. Документация и DX

### 9.1. **Medium** — README устарел

[`README.md`](../README.md) описывает цвета (золотой #d4af37 — но в реальном `globals.css` бордовый `#59151f`), советует «обновить массив `products` в компоненте `src/components/Catalog.tsx`» (товары давно в Payload), упоминает Tailwind без Payload и Docker. Это техдолг **B-15**.

---

### 9.2. **Medium** — Нет диаграммы потока данных

В `docs/` есть полезные `backlog.md`, `payload-migrations.md`, `contact-form-setup.md`, но нет:

- описания архитектуры (Next + Payload + SQLite + sharp + ESM-bundle для миграций),
- ER-диаграммы (Pages, Products, Categories, Image, Video, Hero global, Memories global …),
- runbook’а («как восстановить из backup», «как добавить нового админа», «как откатить миграцию»).

---

### 9.3. **Low** — Скрипты `package.json` многословны и хрупки

```13:14:package.json
    "migrate:payload:build": "esbuild scripts/migrate-json-to-payload.ts --bundle --format=esm --platform=node --packages=external --outfile=.migrate-bundle/migrate.mjs",
    "migrate:payload": "npm run migrate:payload:build && cross-env NODE_OPTIONS=--no-deprecation node .migrate-bundle/migrate.mjs",
```

`seed:contact-form`, `seed:memories`, `seed:hero`, `seed:about`, `seed:pages` — каждый бандлится отдельным esbuild-вызовом. Можно завести один `scripts/seed.ts` с `--target=memories` и т.д., чтобы не плодить 10 npm-скриптов и 5 mjs-бандлов.

---

### 9.4. **Low** — Скрипты `python3` в JS-проекте

[`scripts/generate_product_images_small.py`](../scripts/generate_product_images_small.py), `csv_to_products.py`, `export_products.py`, `migrate_product_characteristics.py` — Python в Node-проекте. У них есть `requirements.txt`, но не очевидно, что нужно поднимать venv. `images:small` в `package.json` молча упадёт без Python 3 / Pillow.

---

### 9.5. **Low** — Закомментированные / мёртвые файлы в корне

В корне:

```
.quit
DELETE
tsconfig.tsbuildinfo  (575 КБ, должен быть в .gitignore — ок, но всё равно отслеживался когда-то)
```

`.quit` и `DELETE` — что это? В git-истории остались как `untracked`. Стоит вычистить.


---

## 10. Сводная таблица приоритетов

Приоритеты:
- **P0 / Critical** — блокирует production-запуск либо угроза безопасности/PII/функциональности.
- **P1 / High** — серьёзная проблема UX/перф/SEO/архитектуры.
- **P2 / Medium** — заметный техдолг, ухудшает поддержку.
- **P3 / Low** — желательно, но не срочно.

| Приоритет | Раздел | Кратко | Связь с backlog |
|-----------|--------|--------|-----------------|
| **P0** | 1.1 | `users.create: () => true` — публичная регистрация админа | B-24 |
| **P0** | 1.2 | Слабый fallback `PAYLOAD_SECRET` | B-24 |
| **P0** | 1.3 | Форма без анти-спама, rate-limit, CAPTCHA | B-24 |
| **P0** | 1.4 | GraphQL Playground / introspection в prod | B-24 |
| **P0** | 3.1 | «Избранное» полностью нерабочее | новое |
| **P0** | 3.2 | Кнопка «Записаться на встречу» disabled | новое |
| **P1** | 1.5 | Нет ретеншна / экспорта PII | новое |
| **P1** | 1.6 | Нет backup для SQLite | B-28 |
| **P1** | 2.1 | `force-dynamic` без кэша | B-30 |
| **P1** | 2.2 | category vs slug рассинхрон | B-27 |
| **P1** | 2.3 | Хардкод `limit: 300` | B-27 |
| **P1** | 2.4 | inline-`style` повсеместно | новое |
| **P1** | 2.5 | Гигантские компоненты (`Header`, `Memories`, `Catalog`) | новое |
| **P1** | 3.3 | Лоадер на каждый визит | новое |
| **P1** | 3.4 | Перегруженный фиксированный header | новое |
| **P1** | 3.5 | Мобильное меню без esc/click-outside/focus-trap | новое |
| **P1** | 3.6 | Memories автоплей без пауз и `prefers-reduced-motion` | новое |
| **P1** | 3.7 | Hero `preload="auto"`, нет UI | новое |
| **P1** | 3.8 | Контактная форма: HTML5-валидация выключена | новое |
| **P1** | 3.9 | Нет управления фокусом после отправки | новое |
| **P1** | 4.1 | Нет skip-to-content | новое |
| **P1** | 4.2 | Нет focus trap в меню | новое |
| **P1** | 4.3 | Memories нарушает SC 2.2.2 / 2.3.3 | новое |
| **P1** | 5.1 | Тяжёлые ассеты в `public/` | B-01 |
| **P1** | 6.1 | sitemap `lastModified: now` | B-25 |
| **P1** | 6.2 | CMS-страницы не в sitemap | B-25 |
| **P1** | 6.3 | Drafts могут утечь | B-25 |
| **P1** | 6.4 | Нет JSON-LD | B-31 |
| **P1** | 7.1 | Внешние уведомления о заявках | B-18 |
| **P1** | 8.1 | Dockerfile без явного migrate | B-28 |
| **P1** | 8.2 | SQLite без backup в prod | B-28 |
| **P2** | 1.7–1.10, 2.6–2.16 | Lexical, CSP, type-casts, дублирование, patches | разное |
| **P2** | 3.10–3.16 | Touch-targets, дубль контактов, фильтр на клиенте, lineHeight | новое |
| **P2** | 4.4–4.7 | aria-описания, контраст, accent-color | новое |
| **P2** | 5.3–5.6 | Hero preload, Memories preload, inline-style perf, react-icons | разное |
| **P2** | 6.5–6.8 | meta keywords, noindex, canonicals, breadcrumb-LD | разное |
| **P2** | 7.2–7.5 | Файлы в форме, sourceBasename, en-локаль, hardcoded labels | B-19, B-26, B-29 |
| **P2** | 8.3–8.6 | CI, тесты, .dockerignore, лимиты | B-13, B-14 |
| **P2** | 9.1–9.2 | README, диаграммы | B-15 |
| **P3** | 2.16, 3.17–3.18 | noindex `/favorites`, иконка-сердечко, disabled checkbox | новое |
| **P3** | 4.8–4.10 | aria-hidden у SVG, table caption, hreflang | новое |
| **P3** | 5.7–5.8 | Loader FCP, onError loop | новое |
| **P3** | 6.9–6.10 | robots `Disallow`, hreflang | разное |
| **P3** | 7.6 | Копирайт год | новое |
| **P3** | 8.7 | healthcheck в compose | новое |
| **P3** | 9.3–9.5 | seed-скрипты, python в JS, мусорные файлы | новое |

---

## Резюме

Проект функционально работает, но имеет **6 критических проблем**, которые надо закрыть до публичного запуска:

1. Открытая регистрация админов через `/api/users` (1.1).
2. Слабый fallback `PAYLOAD_SECRET` (1.2).
3. Форма без анти-спам / rate-limit / CAPTCHA (1.3).
4. GraphQL Playground открыт в prod (1.4).
5. Раздел «Избранное» нерабочий, но заявлен в навигации (3.1).
6. Главная CTA «Записаться на встречу» — `disabled` (3.2).

Стратегические направления:

- **Безопасность**: закрыть API surface, добавить CSP/HSTS, организовать backup.
- **UX**: переделать загрузчик, упростить шапку, добавить функцию избранного или удалить пункт меню.
- **Перф/SEO**: убрать `force-dynamic`, добавить кэш с инвалидацией, починить sitemap, добавить JSON-LD.
- **Архитектура**: разнести гигантские клиентские компоненты, перевести стиль на токены, унифицировать загрузку Payload-клиента.
- **Инфра**: явный шаг миграций в Docker, Litestream/S3 для backup, CI с lint/build/тестами.

