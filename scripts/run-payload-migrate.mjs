#!/usr/bin/env node
/**
 * Программный запуск SQLite-миграций без `payload` CLI (без tsx).
 * Обход TypeError Illegal constructor → undici/CacheStorage через tsx в Node 20 (Docker alpine).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.env.DISABLE_PAYLOAD_HMR = process.env.DISABLE_PAYLOAD_HMR || 'true';
process.env.PAYLOAD_MIGRATING = 'true';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const bundlePath = path.resolve(scriptDir, '..', '.payload-bundle', 'payload.config.mjs');

if (!fs.existsSync(bundlePath)) {
  console.error(
    `[payload-migrate] Бандл не найден: ${bundlePath}\n` +
      'Сначала выполните npm run payload:config:bundle (он входит в npm run payload:migrate).',
  );
  process.exit(1);
}

async function main() {
  const { default: payload } = await import('payload');
  let configMod = await import(pathToFileURL(bundlePath).href);
  let config = configMod.default ?? configMod;
  if (config && typeof (/** @type {{ then?: unknown }} */ (config).then) === 'function') {
    config = await config;
  }

  await payload.init({
    config,
    disableOnInit: true,
  });

  const adapter = payload.db;
  if (!adapter) {
    throw new Error('[payload-migrate] payload.db отсутствует после payload.init');
  }

  /** @type {unknown[] | undefined} */
  const migrations = adapter.prodMigrations;

  if (!migrations?.length) {
    console.warn(
      '[payload-migrate] prodMigrations пуст — пробуем миграции с диска (для Node без tsx .ts может не загрузиться).',
    );
  }

  await adapter.migrate(migrations?.length ? { migrations } : undefined);

  await payload.destroy();
  console.info('[payload-migrate] Готово.');
}

main().catch((err) => {
  console.error('[payload-migrate]', err);
  process.exit(1);
});
