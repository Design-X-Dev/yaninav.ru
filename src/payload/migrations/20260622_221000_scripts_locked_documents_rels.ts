import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-sqlite';
import { sql } from '@payloadcms/db-sqlite';

/** FK-колонка `scripts_id` в polymorphic rels для document locks. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`scripts_id\` integer;`);
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_scripts_id_idx\` ON \`payload_locked_documents_rels\` (\`scripts_id\`);`,
  );
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_scripts_id_idx\`;`);
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`scripts_id\`;`);
}
