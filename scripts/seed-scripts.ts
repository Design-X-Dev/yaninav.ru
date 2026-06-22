/**
 * Принудительно пересоздаёт записи коллекции `scripts` из [`scriptsDefinition`](../src/payload/seeds/scriptsDefinition.ts).
 *
 * Запуск: `PAYLOAD_SECRET=… DATABASE_URI=… npm run seed:scripts`
 */

import config from '../payload.config';
import { getPayload } from 'payload';

import { seedScriptsFromDisk } from '../src/payload/seeds/scriptsBootstrap';

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  await seedScriptsFromDisk(payload, { force: true });
  console.info('Collection scripts seeded (force)');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
