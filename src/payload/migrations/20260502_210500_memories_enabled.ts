import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-sqlite';
import { sql } from '@payloadcms/db-sqlite';

/** Глобал memories: переключатель «Показывать секцию». */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    ALTER TABLE \`memories\` ADD \`enabled\` integer DEFAULT true;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`
    ALTER TABLE \`memories\` DROP COLUMN \`enabled\`;
  `);
}
