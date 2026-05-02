/**
 * Принудительно перезаписывает глобал `about` содержимым из [`aboutDefinition`](../src/payload/seeds/aboutDefinition.ts).
 *
 * Запуск: `PAYLOAD_SECRET=… DATABASE_URI=… npm run seed:about`
 */

import config from '../payload.config';
import { getPayload } from 'payload';

import { seedAboutFromDisk } from '../src/payload/seeds/aboutBootstrap';

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  await seedAboutFromDisk(payload, { force: true });
  console.info('Global about seeded (force)');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
