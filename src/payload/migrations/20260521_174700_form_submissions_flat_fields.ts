import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-sqlite';
import { sql } from '@payloadcms/db-sqlite';

/** Flat contact fields on form-submissions for list view columns. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    ALTER TABLE \`form_submissions\` ADD \`name\` text;
  `);
  await db.run(sql`
    ALTER TABLE \`form_submissions\` ADD \`email\` text;
  `);
  await db.run(sql`
    ALTER TABLE \`form_submissions\` ADD \`phone\` text;
  `);
  await db.run(sql`
    ALTER TABLE \`form_submissions\` ADD \`message\` text;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`
    ALTER TABLE \`form_submissions\` DROP COLUMN \`message\`;
  `);
  await db.run(sql`
    ALTER TABLE \`form_submissions\` DROP COLUMN \`phone\`;
  `);
  await db.run(sql`
    ALTER TABLE \`form_submissions\` DROP COLUMN \`email\`;
  `);
  await db.run(sql`
    ALTER TABLE \`form_submissions\` DROP COLUMN \`name\`;
  `);
}
