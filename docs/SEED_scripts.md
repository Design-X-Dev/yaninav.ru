# Сидирование скриптов при первом старте (Seed Scripts)

ТЗ: как засеять сторонние скрипты (Top.Mail.Ru, Метрика, GTM и т.п.) в коллекцию
`scripts` при первом запуске приложения — в едином стиле с существующими сидерами
(`pages`, `contact-form`, `memories`).

Связанные документы: [`SCRIPT_MANAGER.md`](./SCRIPT_MANAGER.md) — сама система Script Manager.

---

## 0. Цель

- Хранить эталонные блоки скриптов в коде (под версионным контролем).
- При первом старте автоматически создавать записи в коллекции `scripts`, если их нет.
- Идемпотентность: повторный рестарт **не плодит дубликаты** и **не затирает** правки,
  сделанные администратором в админке.
- Возможность ручного пересоздания через CLI (`force: true`).

---

## 1. Предусловие — стабильный ключ в коллекции `Scripts`

Сидер должен находить «свою» запись по неизменному идентификатору. У коллекции
`scripts` (поля `name`, `location`, `code`, `isActive`) такого ключа нет — матчить по
`name` ненадёжно (переименуют → создастся дубль).

**Что сделать:** добавить в `src/payload/collections/Scripts.ts` поле `key`:

```ts
{
  name: 'key',
  type: 'text',
  unique: true,
  index: true,
  required: true,
  label: 'Системный ключ',
  admin: {
    position: 'sidebar',
    description: 'Стабильный идентификатор для сид-данных, напр. «top-mailru». Не меняйте.',
  },
}
```

> Это изменение схемы → потребуется новая миграция Payload (адаптер с `push: false`).

---

## 2. Файл-данные — `src/payload/seeds/scriptsDefinition.ts`

Содержит массив определений. Код блока хранится в template-literal.

```ts
import type { ScriptLocation } from '../collections/Scripts';

export type ScriptSeed = {
  key: string;
  name: string;
  location: ScriptLocation;
  isActive: boolean;
  code: string;
};

const TOP_MAILRU = `<!-- Top.Mail.Ru counter -->
<script type="text/javascript">
var _tmr = window._tmr || (window._tmr = []);
_tmr.push({id: "3762873", type: "pageView", start: (new Date()).getTime()});
(function (d, w, id) {
  if (d.getElementById(id)) return;
  var ts = d.createElement("script"); ts.type = "text/javascript"; ts.async = true; ts.id = id;
  ts.src = "https://top-fwz1.mail.ru/js/code.js";
  var f = function () {var s = d.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ts, s);};
  if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); }
})(document, window, "tmr-code");
</script>
<noscript><div><img src="https://top-fwz1.mail.ru/counter?id=3762873;js=na" style="position:absolute;left:-9999px;" alt="Top.Mail.Ru" /></div></noscript>
<!-- /Top.Mail.Ru counter -->`;

export const SCRIPTS_SEED: ScriptSeed[] = [
  {
    key: 'top-mailru',
    name: 'Top.Mail.Ru (VK Ads)',
    location: 'body_close', // целый блок (script + noscript) — только body_*
    isActive: false,        // безопасный дефолт: включить вручную после проверки
    code: TOP_MAILRU,
  },
];
```

**Правила содержимого `code`** (см. SCRIPT_MANAGER.md, раздел 3):
- `body_open` / `body_close` — можно вставлять **весь блок** (`<script>` + `<noscript>`).
- `head_open` / `head_close` — только тело скрипта **без** внешнего `<script>`; `<noscript>`
  выносится отдельной записью в `body_open`.

---

## 3. Файл-логика — `src/payload/seeds/scriptsBootstrap.ts`

Идемпотентный сидер по образцу `pagesBootstrap.ts`.

```ts
import type { Payload } from 'payload';
import { SCRIPTS_COLLECTION_SLUG } from '../collections/Scripts';
import { SCRIPTS_SEED } from './scriptsDefinition';

export async function seedScriptsFromDisk(payload: Payload, opts?: { force?: boolean }): Promise<void> {
  const force = opts?.force === true;

  for (const def of SCRIPTS_SEED) {
    try {
      const existing = await payload.find({
        collection: SCRIPTS_COLLECTION_SLUG,
        where: { key: { equals: def.key } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      });

      if (existing.docs[0] && !force) continue; // не перезаписываем правки админа

      if (existing.docs[0] && force) {
        await payload.delete({
          collection: SCRIPTS_COLLECTION_SLUG,
          id: existing.docs[0].id,
          overrideAccess: true,
        });
      }

      await payload.create({
        collection: SCRIPTS_COLLECTION_SLUG,
        data: def as never,
        overrideAccess: true,
      });

      payload.logger.info({ msg: `[payload] Script seeded: ${def.key}` });
    } catch (err) {
      payload.logger.error({ err, msg: `[payload] seed script "${def.key}" failed` });
    }
  }
}

/** onInit — создаёт недостающие записи, не трогает уже настроенные. */
export async function seedScriptsIfMissing(payload: Payload): Promise<void> {
  await seedScriptsFromDisk(payload, { force: false });
}
```

---

## 4. Подключение в `onInit` — `payload.config.ts`

Импорт рядом с другими сидерами и вызов в конце `onInit`:

```ts
import { seedScriptsIfMissing } from './src/payload/seeds/scriptsBootstrap';
// ...
onInit: async (payload) => {
  await seedAdminIfMissing(payload);
  // ...остальные существующие сиды без изменений...
  await seedPagesIfMissing(payload);
  await seedScriptsIfMissing(payload); // ← добавить
},
```

---

## 5. (Опционально) CLI для ручного пересоздания

По образцу `scripts/seed-pages.ts` — позволяет пересоздать сиды с `force: true`.

**`scripts/seed-scripts.ts`:**

```ts
import config from '../payload.config';
import { getPayload } from 'payload';
import { seedScriptsFromDisk } from '../src/payload/seeds/scriptsBootstrap';

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  await seedScriptsFromDisk(payload, { force: true });
  console.info('Collection scripts seeded (force)');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
```

**`package.json`** — добавить npm-скрипт (точную форму запуска сверить с уже имеющимися
`seed:*`, напр. через `cross-env` + `tsx`/`esbuild`):

```jsonc
"seed:scripts": "<тот же раннер, что у seed:pages> scripts/seed-scripts.ts"
```

---

## 6. Миграция БД и типы

Адаптер настроен с `push: false` и `prodMigrations` — изменения схемы применяются только
через миграции.

1. Перегенерировать типы: `npm run generate:types` (обновит `src/payload-types.ts`,
   добавит поле `key` в тип `Script`).
2. Создать миграцию под новое поле `key`:
   `npx payload migrate:create add_scripts_key` → проверить файл в `src/payload/migrations/`.
3. Применить локально: `npm run payload:migrate`.

> Если коллекция `scripts` ещё не была смигрирована (см. SCRIPT_MANAGER.md, этап 6) —
> миграцию коллекции и поля `key` можно сделать одной.

---

## 7. Чеклист реализации

- [ ] Добавить поле `key` (unique, required) в `src/payload/collections/Scripts.ts`.
- [ ] Создать `src/payload/seeds/scriptsDefinition.ts` с массивом `SCRIPTS_SEED`.
- [ ] Создать `src/payload/seeds/scriptsBootstrap.ts`
      (`seedScriptsFromDisk` + `seedScriptsIfMissing`).
- [ ] Подключить `seedScriptsIfMissing` в `onInit` (`payload.config.ts`).
- [ ] (Опц.) Создать `scripts/seed-scripts.ts` и npm-скрипт `seed:scripts`.
- [ ] `npm run generate:types` — обновить типы.
- [ ] Создать и применить миграцию для поля `key`.
- [ ] `npm run lint` и `npm run build` — без ошибок.

---

## 8. Проверка (QA)

- [ ] **Чистая БД:** удалить/переименовать `data/payload.db`, запустить `npm run dev` →
      в логах `[payload] Script seeded: top-mailru`; в админке («Скрипты и вставки»)
      появилась запись с `isActive = false`.
- [ ] **Идемпотентность:** перезапустить ещё раз → запись **не дублируется**, нового
      лога `seeded` нет.
- [ ] **Не затирает правки:** изменить `code`/`name` в админке, перезапустить →
      изменения сохранились (сид пропустил существующую запись по `key`).
- [ ] **Активация:** включить `isActive`, открыть сайт → в **View Source** виден блок
      `top-fwz1` / `3762873` в конце `<body>`; счётчик считает визиты.
- [ ] **Force-CLI (если добавляли):** `npm run seed:scripts` → запись пересоздана из кода
      (значения вернулись к `SCRIPTS_SEED`, `isActive = false`).

---

## 9. Замечания

- **`isActive: false` в сиде** — счётчик не уйдёт в прод до ручного включения. Если нужен
  сразу рабочим — поставить `true` в `scriptsDefinition.ts`.
- **Несколько счётчиков** — просто добавляются новыми элементами в `SCRIPTS_SEED` со своими
  `key`. Для блоков в `<head>` помнить про правило: без внешнего `<script>`, `<noscript>`
  отдельной записью в `body_open`.
- **Альтернатива «папка файлов».** Можно хранить каждый блок отдельным `.html` в
  `src/payload/seeds/scripts/` и читать его через `fs.readFileSync` в `scriptsDefinition.ts`
  (прецедент — `memoriesBootstrap.ts`, читающий медиа с диска). Папка попадёт в Docker-образ
  через `COPY . .`. Рекомендуется проще — template-literal в `.ts`.
