import * as migration_20260502_082625_baseline from './20260502_082625_baseline';
import * as migration_20260502_190000_rename_media_collections from './20260502_190000_rename_media_collections';
import * as migration_20260502_203000_homepage_global from './20260502_203000_homepage_global';
import * as migration_20260502_204500_contact_global from './20260502_204500_contact_global';
import * as migration_20260502_205000_home_catalog_global from './20260502_205000_home_catalog_global';
import * as migration_20260502_210500_memories_enabled from './20260502_210500_memories_enabled';
import * as migration_20260521_174700_form_submissions_flat_fields from './20260521_174700_form_submissions_flat_fields';
import * as migration_20260622_210000_scripts_collection from './20260622_210000_scripts_collection';
import * as migration_20260622_220000_scripts_key from './20260622_220000_scripts_key';
import * as migration_20260622_221000_scripts_locked_documents_rels from './20260622_221000_scripts_locked_documents_rels';

export const migrations = [
  {
    up: migration_20260502_082625_baseline.up,
    down: migration_20260502_082625_baseline.down,
    name: '20260502_082625_baseline'
  },
  {
    up: migration_20260502_190000_rename_media_collections.up,
    down: migration_20260502_190000_rename_media_collections.down,
    name: '20260502_190000_rename_media_collections'
  },
  {
    up: migration_20260502_203000_homepage_global.up,
    down: migration_20260502_203000_homepage_global.down,
    name: '20260502_203000_homepage_global'
  },
  {
    up: migration_20260502_204500_contact_global.up,
    down: migration_20260502_204500_contact_global.down,
    name: '20260502_204500_contact_global'
  },
  {
    up: migration_20260502_205000_home_catalog_global.up,
    down: migration_20260502_205000_home_catalog_global.down,
    name: '20260502_205000_home_catalog_global'
  },
  {
    up: migration_20260502_210500_memories_enabled.up,
    down: migration_20260502_210500_memories_enabled.down,
    name: '20260502_210500_memories_enabled'
  },
  {
    up: migration_20260521_174700_form_submissions_flat_fields.up,
    down: migration_20260521_174700_form_submissions_flat_fields.down,
    name: '20260521_174700_form_submissions_flat_fields'
  },
  {
    up: migration_20260622_210000_scripts_collection.up,
    down: migration_20260622_210000_scripts_collection.down,
    name: '20260622_210000_scripts_collection'
  },
  {
    up: migration_20260622_220000_scripts_key.up,
    down: migration_20260622_220000_scripts_key.down,
    name: '20260622_220000_scripts_key'
  },
  {
    up: migration_20260622_221000_scripts_locked_documents_rels.up,
    down: migration_20260622_221000_scripts_locked_documents_rels.down,
    name: '20260622_221000_scripts_locked_documents_rels'
  },
];
