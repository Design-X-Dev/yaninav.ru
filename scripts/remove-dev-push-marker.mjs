/**
 * Убирает служебную запись `batch = -1` из `payload_migrations` (режим drizzle push в dev).
 * Иначе `payload migrate` интерактивно спрашивает о «data loss» и в Docker виснет на stdin.
 * Безопасно: при отсутствии таблицы/файла БД просто выходит с 0.
 */
import fs from 'node:fs';

import { createClient } from '@libsql/client';

/** URL БД: как в `sqliteAdapter` без env (локальный dev). */
const url = process.env.DATABASE_URI ?? 'file:./data/payload.db';
if (!url.startsWith('file:')) {
  console.error('[remove-dev-push-marker] Only file: DATABASE_URI is supported, skip.');
  process.exit(0);
}

const filePath = url.replace(/^file:(\/\/)?/, '');
if (!fs.existsSync(filePath)) {
  console.info('[remove-dev-push-marker] Database file not found yet, skip.');
  process.exit(0);
}

const client = createClient({ url });

try {
  await client.execute('DELETE FROM payload_migrations WHERE batch = -1');
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  // Таблица появится после первого успешного старта Payload
  if (msg.includes('no such table')) {
    console.info('[remove-dev-push-marker] payload_migrations not created yet, skip.');
    process.exit(0);
  }
  console.error('[remove-dev-push-marker]', msg);
  process.exit(1);
} finally {
  client.close?.();
}

console.info('[remove-dev-push-marker] Done (removed dev push marker if present).');
