# Миграции Payload + SQLite (`push` → файлы)

## Зачем

Режим `push: false` и миграции избегают интерактивных вопросов Drizzle Kit в Docker (типичный кейс: колонка `snapshot` в `_pages_v` при `versions`/draft + SEO-плагине).

## Где живут файлы

- Каталог: [`src/payload/migrations/`](../src/payload/migrations/)
- То же оглавление подключается в [`payload.config.ts`](../payload.config.ts) через `migrationDir`, `prodMigrations` и `sqliteAdapter({ push: false })`.
- Типичная цепочка после первого clone с baseline: сначала `20260502_082625_baseline`, затем `20260502_190000_rename_media_collections` (slug uploads **`image`** / **`video`**, таблицы `image` / `video`). Если база уже существовала до переименования — перед migrate переместите файлы: `data/media` → `data/image`, `data/media-video` → `data/video`.

## Локальная разработка

1. После изменения схемы коллекций/глобалов создать новую миграцию именем:
   ```bash
   DATABASE_URI=file:./data/payload.db PAYLOAD_SECRET=<секрет> \
     npm run payload:migrate:create -- my_change_name
   ```
   Если Drizzle задаёт про «created or renamed», для `snapshot`-столбцов выбирайте **создание новой колонки**, не переименование существующих `version_*` полей.
2. Закоммитить добавленный `.ts` (и при необходимости обновлённый [`index.ts`](../src/payload/migrations/index.ts); `migrate:create` перегенерирует его сам).
3. Применить к своей локальной SQLite:
   ```bash
   npm run payload:migrate
   ```

**Почему не просто `npx payload migrate`:**  
1) Node/tsx без бандла не резолвит относительные импорты в `payload.config.ts` совместимо с ESM; перед применением миграций мы собираем конфиг через esbuild (`npm run payload:config:bundle` внутри `payload:migrate`).  
2) В **Docker dev** (`node:20-alpine`) запуск `npx payload migrate` поднимает tsx-трансформер и падает с `TypeError: Illegal constructor` в `undici` → `CacheStorage` (см. лог `tsx/.../register-...mjs`). Поэтому **`npm run payload:migrate`** вызывает [`scripts/run-payload-migrate.mjs`](../scripts/run-payload-migrate.mjs): `payload.init` + `adapter.migrate({ migrations: prodMigrations })` без tsx. Создание новых миграций (`payload:migrate:create`) по-прежнему через официальный CLI на хосте.

## Отметка `-1` после `push` в dev

После перехода с auto-push может остаться запись «dev» (`batch = -1`) в `payload_migrations` — Payload тогда задаёт блокирующий вопрос в неинтерактивном окружении. Скрипт [`scripts/remove-dev-push-marker.mjs`](../scripts/remove-dev-push-marker.mjs) выполняется из `payload:migrate` и из шага перед `server.js` в [`Dockerfile`](../Dockerfile).

## Docker Compose (dev)

Команда сервиса: `npm ci && npm run payload:migrate && npx next dev …` ([`docker-compose.yml`](../docker-compose.yml)).

## Если в БД после push нет `*_locales` (ошибка `no such table: pages_locales`)

Такое бывает, если схема собиралась в режиме `push`, а включение **localization** в [`payload.config.ts`](../payload.config.ts) случилось позже или миграция создавалась вручную и не покрывала все таблицы.

**Разовый восстановление для dev** (контент в админке теряется, сидеры `onInit` и `npm run seed:*` поднимут глобалы и формы):

```bash
rm -f data/payload.db data/payload.db-shm data/payload.db-wal
# опционально: rm -rf data/image data/video && mkdir -p data/image data/video
rm -f src/payload/migrations/*.ts src/payload/migrations/*.json
echo "export const migrations = [];" > src/payload/migrations/index.ts
DATABASE_URI=file:./data/payload.db PAYLOAD_SECRET=<секрет> npm run payload:migrate:create -- baseline
npm run payload:migrate
```

После этого в SQLite должны появиться, например, `pages_locales`, `_pages_v_locales` (проверка: `sqlite3 data/payload.db ".tables"`). Закоммитьте сгенерированные `*.ts`, `*.json` и обновлённый [`index.ts`](../src/payload/migrations/index.ts).

## Production (standalone)

В проде Payload поднимает миграции из `prodMigrations` при старте (см. `connect` SQLite-адаптера): не нужен `npx payload` в образе. Перед сервером по-прежнему вызывается `remove-dev-push-marker.mjs`.

## Полезное

- При необходимости после бандла конфига:  
  `cross-env NODE_OPTIONS=--no-deprecation PAYLOAD_CONFIG_PATH=./.payload-bundle/payload.config.mjs npx payload migrate:status`
