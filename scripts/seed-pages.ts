/**
 * Принудительно пересоздаёт записи коллекции `pages` из [`pagesDefinition`](../src/payload/seeds/pagesDefinition.ts).
 *
 * Запуск: `PAYLOAD_SECRET=… DATABASE_URI=… npm run seed:pages`
 */

import config from '../payload.config';
import { getPayload } from 'payload';

import { seedPagesFromDisk } from '../src/payload/seeds/pagesBootstrap';

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  await seedPagesFromDisk(payload, { force: true });
  console.info('Collection pages seeded (force)');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
