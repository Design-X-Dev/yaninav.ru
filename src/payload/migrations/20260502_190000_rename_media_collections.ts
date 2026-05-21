import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-sqlite';
import { sql } from '@payloadcms/db-sqlite';

/**
 * Payload slug `media` → `image`, `media-video` → `video`:
 * rename SQLite tables + polymorphic FK columns in `payload_locked_documents_rels`,
 * recreate indexes with names matching the new slugs.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys = OFF;`);

  await db.run(sql`ALTER TABLE \`media\` RENAME TO \`image\`;`);
  await db.run(sql`ALTER TABLE \`media_video\` RENAME TO \`video\`;`);

  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` RENAME COLUMN \`media_id\` TO \`image_id\`;`);
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` RENAME COLUMN \`media_video_id\` TO \`video_id\`;`);

  await db.run(sql`DROP INDEX IF EXISTS \`media_source_basename_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`media_updated_at_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`media_created_at_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`media_filename_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`media_sizes_card_sizes_card_filename_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`media_sizes_hero_sizes_hero_filename_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`media_sizes_og_sizes_og_filename_idx\`;`);
  await db.run(sql`CREATE INDEX \`image_source_basename_idx\` ON \`image\` (\`source_basename\`);`);
  await db.run(sql`CREATE INDEX \`image_updated_at_idx\` ON \`image\` (\`updated_at\`);`);
  await db.run(sql`CREATE INDEX \`image_created_at_idx\` ON \`image\` (\`created_at\`);`);
  await db.run(sql`CREATE UNIQUE INDEX \`image_filename_idx\` ON \`image\` (\`filename\`);`);
  await db.run(sql`CREATE INDEX \`image_sizes_card_sizes_card_filename_idx\` ON \`image\` (\`sizes_card_filename\`);`);
  await db.run(sql`CREATE INDEX \`image_sizes_hero_sizes_hero_filename_idx\` ON \`image\` (\`sizes_hero_filename\`);`);
  await db.run(sql`CREATE INDEX \`image_sizes_og_sizes_og_filename_idx\` ON \`image\` (\`sizes_og_filename\`);`);

  await db.run(sql`DROP INDEX IF EXISTS \`media_video_source_basename_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`media_video_updated_at_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`media_video_created_at_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`media_video_filename_idx\`;`);
  await db.run(sql`CREATE INDEX \`video_source_basename_idx\` ON \`video\` (\`source_basename\`);`);
  await db.run(sql`CREATE INDEX \`video_updated_at_idx\` ON \`video\` (\`updated_at\`);`);
  await db.run(sql`CREATE INDEX \`video_created_at_idx\` ON \`video\` (\`created_at\`);`);
  await db.run(sql`CREATE UNIQUE INDEX \`video_filename_idx\` ON \`video\` (\`filename\`);`);

  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_media_id_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_media_video_id_idx\`;`);
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_image_id_idx\` ON \`payload_locked_documents_rels\` (\`image_id\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_video_id_idx\` ON \`payload_locked_documents_rels\` (\`video_id\`);`,
  );

  await db.run(sql`PRAGMA foreign_keys = ON;`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys = OFF;`);

  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_image_id_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_video_id_idx\`;`);

  await db.run(sql`DROP INDEX IF EXISTS \`image_source_basename_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`image_updated_at_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`image_created_at_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`image_filename_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`image_sizes_card_sizes_card_filename_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`image_sizes_hero_sizes_hero_filename_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`image_sizes_og_sizes_og_filename_idx\`;`);

  await db.run(sql`DROP INDEX IF EXISTS \`video_source_basename_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`video_updated_at_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`video_created_at_idx\`;`);
  await db.run(sql`DROP INDEX IF EXISTS \`video_filename_idx\`;`);

  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` RENAME COLUMN \`image_id\` TO \`media_id\`;`);
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` RENAME COLUMN \`video_id\` TO \`media_video_id\`;`);

  await db.run(sql`ALTER TABLE \`image\` RENAME TO \`media\`;`);
  await db.run(sql`ALTER TABLE \`video\` RENAME TO \`media_video\`;`);

  await db.run(sql`CREATE INDEX \`media_source_basename_idx\` ON \`media\` (\`source_basename\`);`);
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`);
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`);
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`);
  await db.run(sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`);
  await db.run(sql`CREATE INDEX \`media_sizes_hero_sizes_hero_filename_idx\` ON \`media\` (\`sizes_hero_filename\`);`);
  await db.run(sql`CREATE INDEX \`media_sizes_og_sizes_og_filename_idx\` ON \`media\` (\`sizes_og_filename\`);`);

  await db.run(sql`CREATE INDEX \`media_video_source_basename_idx\` ON \`media_video\` (\`source_basename\`);`);
  await db.run(sql`CREATE INDEX \`media_video_updated_at_idx\` ON \`media_video\` (\`updated_at\`);`);
  await db.run(sql`CREATE INDEX \`media_video_created_at_idx\` ON \`media_video\` (\`created_at\`);`);
  await db.run(sql`CREATE UNIQUE INDEX \`media_video_filename_idx\` ON \`media_video\` (\`filename\`);`);

  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`,
  );
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_media_video_id_idx\` ON \`payload_locked_documents_rels\` (\`media_video_id\`);`,
  );

  await db.run(sql`PRAGMA foreign_keys = ON;`);
}
